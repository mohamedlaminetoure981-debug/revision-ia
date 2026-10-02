// =====================================================================
// planches.mjs — DÉCOUPE AUTOMATIQUE DES PLANCHES D'EXPRESSIONS
// ---------------------------------------------------------------------
// Pour chaque personnage, dans public/characters/<id>/ :
//   - une ou plusieurs planches (images) : grille de portraits sur fond uni
//     (vert en général ; la couleur est DÉTECTÉE automatiquement) ;
//   - facultatif : planches.json, qui dit pour chaque planche la taille de la
//     grille et quelle case utiliser pour chaque expression. Exemple :
//       {
//         "planche-a": { "grille": [2, 4], "cases": { "neutre": 1, "joie": 3, "reflexion": 5, "celebration": 8 } },
//         "planche-b": { "grille": [2, 4], "cases": { "encouragement": 1, "surprise": 2, "clin": 4, "concentration": 5 } }
//       }
//     "grille" = [rangées, colonnes] ; cases numérotées de gauche à droite,
//     rangée du haut puis rangée suivante (1 = en haut à gauche).
//     Option : "fond": "#2fd52a" pour imposer la couleur du fond.
//   Sans planches.json : planche-a et planche-b en 2 × 2, dans l'ordre
//     A = neutre, joie, réflexion, célébration ; B = encouragement, surprise, concentration, clin.
// Étapes (appelées par vite.config.js, en local comme au build) :
//   1. trouver la grille (marges et traits de séparation ignorés) ;
//   2. détecter la couleur du fond et la retirer (bords adoucis, sans liseré) ;
//   3. cadrer toutes les expressions À L'IDENTIQUE (même largeur d'épaules, même
//      centre, même bas de buste → même taille de visage, yeux à la même place) ;
//      un buste coupé par le bord de sa case est fondu en douceur sur les côtés ;
//   4. exporter en WebP transparent : 300 px (appli) et 720 px (images partagées).
// =====================================================================

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export const CHAR_DIR = 'public/characters';
export const EXPRESSIONS = ['neutre', 'joie', 'reflexion', 'celebration', 'encouragement', 'surprise', 'concentration', 'clin'];
const DEFAULT_CONFIG = {
  'planche-a': { grille: [2, 2], cases: { neutre: 1, joie: 2, reflexion: 3, celebration: 4 } },
  'planche-b': { grille: [2, 2], cases: { encouragement: 1, surprise: 2, concentration: 3, clin: 4 } },
};
// Format des portraits de l'appli : 200 × 232 (voir ui/character.js).
export const SIZES = { small: [300, 348], large: [720, 835] };
const OUT_W = 720; const OUT_H = 835;

/** Lit la configuration d'un perso : { stem: { file, grille, cases, fond } } (planches présentes seulement). */
function readConfig(dir) {
  const images = {};
  for (const name of readdirSync(dir)) {
    const m = name.match(/^(.+)\.(jpe?g|png|webp)$/i);
    if (m) images[m[1].toLowerCase()] = join(dir, name);
  }
  let config = DEFAULT_CONFIG; let error = null;
  const cfgFile = join(dir, 'planches.json');
  if (existsSync(cfgFile)) {
    try { config = JSON.parse(readFileSync(cfgFile, 'utf8')); } catch (e) { error = `planches.json illisible (${e.message}) : configuration par défaut utilisée`; }
  }
  const out = {};
  for (const [stem, c] of Object.entries(config)) {
    const file = images[stem.toLowerCase().replace(/\.(jpe?g|png|webp)$/i, '')];
    if (file) out[stem] = { file, grille: c.grille || [2, 2], cases: c.cases || {}, zones: c.zones || {}, fond: c.fond };
  }
  return { sheets: out, error, cfgFile: existsSync(cfgFile) ? cfgFile : null };
}

/** Planches trouvées : { kai: { sheets: {…}, error, cfgFile } } (persos sans planche ignorés). */
export function findSheets() {
  const out = {};
  if (!existsSync(CHAR_DIR)) return out;
  for (const id of readdirSync(CHAR_DIR)) {
    const dir = join(CHAR_DIR, id);
    if (!statSync(dir).isDirectory()) continue;
    const r = readConfig(dir);
    if (Object.keys(r.sheets).length) out[id.toLowerCase()] = r;
  }
  return out;
}

/** Fichiers à surveiller (planches + planches.json) : pour savoir quand tout refaire. */
export function sheetFiles() {
  return Object.values(findSheets()).flatMap((r) => [...Object.values(r.sheets).map((s) => s.file), ...(r.cfgFile ? [r.cfgFile] : [])]);
}

// ---------------------------------------------------------------------
// Couleur du fond (détectée)
// ---------------------------------------------------------------------
/**
 * Couleur la plus fréquente parmi les pixels VIFS du haut des cellules (au-dessus des
 * têtes, c'est toujours du fond). Les traits blancs/noirs sont ignorés.
 */
function detectKey(px, W, H, rows, forced) {
  if (forced) {
    const n = parseInt(String(forced).replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const hist = new Map();
  for (let r = 0; r < rows; r++) {
    const y0 = Math.round((r * H) / rows + H / rows * 0.01); const y1 = Math.round(y0 + H / rows * 0.05);
    for (let y = y0; y < y1; y++) for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 3; const R = px[i]; const G = px[i + 1]; const B = px[i + 2];
      if (Math.max(R, G, B) - Math.min(R, G, B) < 60) continue; // gris, blanc, noir
      const k = ((R >> 4) << 8) | ((G >> 4) << 4) | (B >> 4); // couleur arrondie
      hist.set(k, (hist.get(k) || 0) + 1);
    }
  }
  if (!hist.size) return [0, 255, 0];
  const best = [...hist.entries()].sort((a, b) => b[1] - a[1])[0][0];
  // Moyenne précise des pixels de cette couleur arrondie
  let s = [0, 0, 0]; let n = 0;
  for (let r = 0; r < rows; r++) {
    const y0 = Math.round((r * H) / rows + H / rows * 0.01); const y1 = Math.round(y0 + H / rows * 0.05);
    for (let y = y0; y < y1; y++) for (let x = 0; x < W; x += 2) {
      const i = (y * W + x) * 3;
      if ((((px[i] >> 4) << 8) | ((px[i + 1] >> 4) << 4) | (px[i + 2] >> 4)) === best) { s[0] += px[i]; s[1] += px[i + 1]; s[2] += px[i + 2]; n++; }
    }
  }
  return s.map((v) => Math.round(v / n));
}

/**
 * Outils de détourage pour une couleur de fond K : le canal dominant de K (vert pour
 * un fond vert) et de combien il dépasse les deux autres ("dominance").
 */
function keyer(K) {
  const dom = K.indexOf(Math.max(...K));
  const others = [0, 1, 2].filter((c) => c !== dom);
  const DK = Math.max(30, K[dom] - Math.max(K[others[0]], K[others[1]]));
  const dominance = (p, i) => p[i + dom] - Math.max(p[i + others[0]], p[i + others[1]]);
  return {
    dom, others,
    // Pixel de fond (pour trouver la grille et le personnage)
    isKey: (p, i) => p[i + dom] > K[dom] * 0.45 && dominance(p, i) > DK * 0.45,
    // Opacité : 1 = personnage, 0 = fond ; bord adouci entre les deux
    alpha: (p, i) => {
      if (p[i + dom] < K[dom] * 0.3) return 1;
      const a = 1 - (dominance(p, i) - DK * 0.15) / (DK * 0.55 - DK * 0.15);
      return a >= 1 ? 1 : a <= 0 ? 0 : a;
    },
  };
}

// ---------------------------------------------------------------------
// 1. Grille (rangées × colonnes quelconques)
// ---------------------------------------------------------------------
function analyseGrid(px, W, H, rows, cols, kk) {
  const bg = new Uint8Array(W * H);
  const rowN = new Float64Array(H); const colN = new Float64Array(W);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    if (kk.isKey(px, i)) { bg[y * W + x] = 1; continue; }
    // Pixel "neutre" (blanc, gris, noir) : candidat pour un trait de séparation.
    if (Math.max(px[i], px[i + 1], px[i + 2]) - Math.min(px[i], px[i + 1], px[i + 2]) < 45) { rowN[y]++; colN[x]++; }
  }
  // Traits de séparation / bordures : lignes ou colonnes faites presque entièrement de
  // pixels neutres (un portrait, lui, a de la peau et des vêtements colorés).
  const lineRow = Array.from(rowN, (v) => v / W > 0.9);
  const lineCol = Array.from(colN, (v) => v / H > 0.9);
  const isBg = (x, y) => bg[y * W + x] || lineRow[y] || lineCol[x];
  const colD = new Float64Array(W); const rowD = new Float64Array(H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!isBg(x, y)) { colD[x]++; rowD[y]++; }
  // Séparations : près de chaque position attendue (k/n), un trait s'il y en a un,
  // sinon la colonne (ligne) la plus vide.
  const splits = (n, len, line, d) => {
    const out = [0];
    for (let k = 1; k < n; k++) {
      const c = (k * len) / n; const r = len / n * 0.12;
      let best = Math.round(c); let bv = Infinity;
      for (let x = Math.round(c - r); x <= Math.round(c + r); x++) {
        const v = (line[x] ? -1e9 : d[x]) + Math.abs(x - c) * 0.01;
        if (v < bv) { bv = v; best = x; }
      }
      out.push(best);
    }
    out.push(len);
    return out;
  };
  return { isBg, xs: splits(cols, W, lineCol, colD), ys: splits(rows, H, lineRow, rowD) };
}

/** Cadre du personnage dans une cellule (ignore les petites taches isolées). */
function subjectBox(isBg, x0, y0, x1, y1) {
  const W = x1 - x0; const H = y1 - y0;
  const col = new Float64Array(W); const row = new Float64Array(H);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!isBg(x, y)) { col[x - x0]++; row[y - y0]++; }
  const minC = H * 0.004; const minR = W * 0.004;
  // Un vrai bord du personnage tient sur plusieurs lignes/colonnes d'affilée :
  // un reste de bordure de 1 à 3 pixels est ignoré.
  const K = Math.max(4, Math.round(Math.min(W, H) * 0.012));
  const solid = (arr, i, step, min) => { for (let k = 0; k < K; k++) { const j = i + k * step; if (j < 0 || j >= arr.length || arr[j] < min) return false; } return true; };
  let l = 0; while (l < W && !solid(col, l, 1, minC)) l++;
  let r = W - 1; while (r > l && !solid(col, r, -1, minC)) r--;
  let t = 0; while (t < H && !solid(row, t, 1, minR)) t++;
  let b = H - 1; while (b > t && !solid(row, b, -1, minR)) b--;
  if (r <= l || b <= t) return null;
  // Le personnage touche-t-il les bords gauche/droit de sa case (buste coupé) ?
  const edge = Math.max(2, W * 0.015);
  return { x: x0 + l, y: y0 + t, w: r - l + 1, h: b - t + 1, cutL: l <= edge, cutR: W - 1 - r <= edge, cutT: t <= Math.max(2, H * 0.015) };
}

// ---------------------------------------------------------------------
// 2. Détourage d'une cellule → RGBA
// ---------------------------------------------------------------------
function cutOut(px, W, isBg, box, kk) {
  const out = Buffer.alloc(box.w * box.h * 4);
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      const sx = box.x + x; const sy = box.y + y;
      const i = (sy * W + sx) * 3; const o = (y * box.w + x) * 4;
      const c = [px[i], px[i + 1], px[i + 2]];
      let a = isBg(sx, sy) && !kk.isKey(px, i) ? 0 : kk.alpha(px, i); // traits de séparation → transparents
      // Despill : le canal du fond ne dépasse jamais les deux autres → pas de liseré coloré.
      const lim = Math.max(c[kk.others[0]], c[kk.others[1]]);
      if (c[kk.dom] > lim) c[kk.dom] = lim + (c[kk.dom] - lim) * 0.15;
      a = Math.max(0, Math.min(1, (a - 0.12) / 0.88)); // halo semi-transparent resserré
      out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = Math.round(a * 255);
    }
  }
  return out;
}

// ---------------------------------------------------------------------
// 3. Repères pour un cadrage identique : la TÊTE (haut des cheveux + largeur)
// ---------------------------------------------------------------------
// Les bustes sont souvent coupés par les bords de leur case : les épaules ne
// disent rien. La tête, elle, est toujours entière : on aligne le haut des
// cheveux et on égalise la largeur de la tête → même taille de visage et yeux
// à la même hauteur d'une expression à l'autre.
/** Plus long segment opaque d'une ligne (une main ou une étincelle à côté ne compte pas). */
function longestRun(rgba, w, y) {
  let best = [0, -1]; let start = -1;
  for (let x = 0; x <= w; x++) {
    const on = x < w && rgba[(y * w + x) * 4 + 3] > 128;
    if (on && start < 0) start = x;
    if (!on && start >= 0) { if (x - 1 - start > best[1] - best[0]) best = [start, x - 1]; start = -1; }
  }
  return best;
}
function measure(rgba, w, h) {
  // Haut de la tête : première ligne où le personnage a une vraie largeur.
  let top = 0;
  while (top < h * 0.5) { const [a, b] = longestRun(rgba, w, top); if (b - a > w * 0.12) break; top++; }
  // Largeur et centre de la tête : bande de 8 % à 22 % de la hauteur, sous le haut des cheveux.
  const span = h - top;
  let width = 0; let center = 0; let n = 0;
  for (let y = Math.floor(top + span * 0.08); y < Math.floor(top + span * 0.22); y++) {
    const [a, b] = longestRun(rgba, w, y);
    if (b >= a) { width += b - a; center += (a + b) / 2; n++; }
  }
  // Largeur MAXIMALE de la tête (moitié haute du personnage) : reste juste même si le
  // haut des cheveux est coupé par le bord de la case.
  let maxW = 0;
  for (let y = top; y < top + span * 0.45; y++) { const [a, b] = longestRun(rgba, w, y); maxW = Math.max(maxW, b - a); }
  return n ? { top, head: width / n, center: center / n, maxW: maxW || width / n } : { top, head: w * 0.5, center: w / 2, maxW: maxW || w * 0.5 };
}

/**
 * Ne garde que le PORTRAIT de la zone : le plus grand morceau d'un seul tenant.
 * Les morceaux d'un portrait voisin qui entrent par un bord (main, mèche…) sont
 * effacés ; les petits détails à l'intérieur (étincelles, goutte…) sont gardés.
 * Puis recadre au plus juste. @returns {{ rgba, w, h, cutL, cutR } | null}
 */
function keepMain(rgba, box) {
  const { w, h } = box;
  const lab = new Int32Array(w * h).fill(-1);
  const sizes = []; const touch = [];
  const stack = [];
  for (let s = 0; s < w * h; s++) {
    if (lab[s] >= 0 || rgba[s * 4 + 3] <= 128) continue;
    const id = sizes.length; let n = 0; let edge = false;
    lab[s] = id; stack.push(s);
    while (stack.length) {
      const p = stack.pop(); n++;
      const x = p % w; const y = (p - x) / w;
      if (x === 0 || x === w - 1 || y === 0) edge = true;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx; const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx;
        if (lab[q] < 0 && rgba[q * 4 + 3] > 128) { lab[q] = id; stack.push(q); }
      }
    }
    sizes.push(n); touch.push(edge);
  }
  if (!sizes.length) return null;
  const main = sizes.indexOf(Math.max(...sizes));
  const drop = sizes.map((n, i) => i !== main && touch[i] && n < sizes[main] * 0.35);
  // Effacer les morceaux étrangers (et leur bord semi-transparent).
  for (let p = 0; p < w * h; p++) if (lab[p] >= 0 && drop[lab[p]]) rgba[p * 4 + 3] = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = y * w + x;
    if (lab[p] >= 0 || !rgba[p * 4 + 3]) continue;
    let near = false;
    for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx; const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && lab[ny * w + nx] >= 0 && drop[lab[ny * w + nx]]) { near = true; break; }
    }
    if (near) rgba[p * 4 + 3] = 0;
  }
  // Recadrage au plus juste
  let l = w; let r = -1; let t = h; let b = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rgba[(y * w + x) * 4 + 3] > 16) { if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y; }
  if (r < l) return null;
  const nw = r - l + 1; const nh = b - t + 1;
  const out = Buffer.alloc(nw * nh * 4);
  for (let y = 0; y < nh; y++) rgba.copy(out, y * nw * 4, ((y + t) * w + l) * 4, ((y + t) * w + l + nw) * 4);
  return { rgba: out, w: nw, h: nh, cutL: box.cutL && l === 0, cutR: box.cutR && r === w - 1, cutT: box.cutT && t === 0 };
}

/** Fondu doux en haut (cheveux coupés par le bord de leur case). */
function fadeTop(rgba, w, h) {
  const f = Math.max(4, Math.round(h * 0.07));
  for (let k = 0; k < f; k++) {
    const m = (k + 0.5) / f; const ease = m * m * (3 - 2 * m);
    for (let x = 0; x < w; x++) rgba[(k * w + x) * 4 + 3] *= ease;
  }
}

/** Fondu doux en bas (buste qui s'arrête avant le bas de l'image). */
function fadeBottom(rgba, w, h) {
  const f = Math.max(4, Math.round(h * 0.08));
  for (let k = 0; k < f; k++) {
    const m = (k + 0.5) / f; const ease = m * m * (3 - 2 * m);
    for (let x = 0; x < w; x++) rgba[((h - 1 - k) * w + x) * 4 + 3] *= ease;
  }
}

// ---------------------------------------------------------------------
// Recalage d'un portrait sur la référence (même visage, même place)
// ---------------------------------------------------------------------
/** Image en niveaux de gris, le fond transparent devenant un gris moyen. */
function gray(c) {
  const g = Buffer.alloc(c.w * c.h);
  for (let p = 0; p < c.w * c.h; p++) {
    const a = c.rgba[p * 4 + 3] / 255;
    const l = 0.3 * c.rgba[p * 4] + 0.59 * c.rgba[p * 4 + 1] + 0.11 * c.rgba[p * 4 + 2];
    g[p] = Math.round(a * l + (1 - a) * 128);
  }
  return g;
}
async function shrink(sharp, buf, w, h, f) {
  const W2 = Math.max(4, Math.round(w * f)); const H2 = Math.max(4, Math.round(h * f));
  // extractChannel(0) : sharp renverrait sinon 3 canaux (RVB) au lieu d'un seul.
  return { d: await sharp(buf, { raw: { width: w, height: h, channels: 1 } }).resize(W2, H2).extractChannel(0).raw().toBuffer(), w: W2, h: H2 };
}
/**
 * Meilleure position du motif P dans l'image I, par CORRÉLATION NORMALISÉE : on compare
 * les formes (contrastes du visage), pas la luminosité ; un aplat uniforme (masse de
 * cheveux noirs, fond) ne "ressemble" à rien. Renvoie e = 1 − corrélation (0 = parfait).
 */
function bestMatch(I, P, win) {
  const n = P.w * P.h;
  let pm = 0; for (let k = 0; k < n; k++) pm += P.d[k]; pm /= n;
  const pc = new Float32Array(n); let pv = 0;
  for (let k = 0; k < n; k++) { pc[k] = P.d[k] - pm; pv += pc[k] * pc[k]; }
  let best = { e: Infinity, x: 0, y: 0 };
  if (pv < 1) return best;
  const x0 = Math.max(0, win?.x0 ?? 0); const x1 = Math.min(I.w - P.w, win?.x1 ?? I.w - P.w);
  const y0 = Math.max(0, win?.y0 ?? 0); const y1 = Math.min(I.h - P.h, win?.y1 ?? I.h - P.h);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    let s = 0; let s2 = 0; let sp = 0;
    for (let j = 0; j < P.h; j++) {
      const io = (y + j) * I.w + x; const po = j * P.w;
      for (let i = 0; i < P.w; i++) { const v = I.d[io + i]; s += v; s2 += v * v; sp += v * pc[po + i]; }
    }
    const iv = s2 - (s * s) / n;
    if (iv < 1) continue;
    const e = 1 - sp / Math.sqrt(iv * pv);
    if (e < best.e) best = { e, x, y };
  }
  return best;
}
/**
 * Trouve σ (agrandissement) et (tx, ty) tels qu'un point p du portrait C se retrouve
 * en σ·p + (tx, ty) dans la référence R. Le motif comparé est le VISAGE de R (yeux,
 * lunettes, oreilles, bouche) : d'abord grossièrement, puis plus finement.
 */
async function register(sharp, R, C) {
  const gR = gray(R); const gC = gray(C);
  // Zone du VISAGE dans R (sourcils → menton, au centre) : les cheveux, simple texture,
  // ne servent pas à se repérer.
  const hw = R.head;
  const fx0 = Math.max(0, R.center - hw * 0.35); const fx1 = Math.min(R.w, R.center + hw * 0.35);
  const fy0 = Math.max(0, R.top + hw * 0.45); const fy1 = Math.min(R.h, R.top + hw * 0.95);
  // Agrandissement attendu, d'après la largeur maximale de la tête (±25 % autour).
  const s0 = R.maxW / C.maxW;
  let est = null;
  for (const [target, scales] of [[36, null], [72, 'fin']]) {
    const f = target / (fx1 - fx0);
    const Rs = await shrink(sharp, gR, R.w, R.h, f);
    const px0 = Math.round(fx0 * f); const py0 = Math.round(fy0 * f);
    const P = { w: Math.round((fx1 - fx0) * f), h: Math.round((fy1 - fy0) * f), d: null };
    P.d = Buffer.alloc(P.w * P.h);
    for (let j = 0; j < P.h; j++) Rs.d.copy(P.d, j * P.w, (py0 + j) * Rs.w + px0, (py0 + j) * Rs.w + px0 + P.w);
    const list = [];
    if (!scales) for (let s = s0 / 1.25; s <= s0 * 1.25; s *= 1.02) list.push(s);
    else for (let s = est.sigma * 0.95; s <= est.sigma * 1.05; s *= 1.008) list.push(s);
    let best = { e: Infinity };
    for (const sigma of list) {
      const Cs = await shrink(sharp, gC, C.w, C.h, f * sigma);
      if (Cs.w < P.w || Cs.h < P.h) continue;
      // Fenêtre de recherche : partout au 1er passage, autour de l'estimation ensuite.
      let win = null;
      if (est) { const ex = Math.round((px0 / f - est.tx) * f); const ey = Math.round((py0 / f - est.ty) * f); win = { x0: ex - 6, x1: ex + 6, y0: ey - 6, y1: ey + 6 }; }
      const m = bestMatch(Cs, P, win);
      if (m.e < best.e) best = { e: m.e, sigma, x: m.x, y: m.y };
    }
    if (!Number.isFinite(best.e)) return est || { sigma: 1, tx: 0, ty: 0 };
    // C (réduit) en (x, y) ↔ R (réduit) en (px0, py0)  →  R = σ·C + t (pleine résolution)
    est = { sigma: best.sigma, tx: (px0 - best.x) / f, ty: (py0 - best.y) / f };
  }
  return est;
}

/** Fondu doux sur un côté coupé (le buste ne s'arrête pas sur une ligne droite). */
function fadeSides(rgba, w, h, left, right) {
  const f = Math.max(4, Math.round(w * 0.1));
  for (let y = 0; y < h; y++) for (let k = 0; k < f; k++) {
    const m = (k + 0.5) / f; const ease = m * m * (3 - 2 * m);
    if (left) rgba[(y * w + k) * 4 + 3] *= ease;
    if (right) rgba[(y * w + (w - 1 - k)) * 4 + 3] *= ease;
  }
}

/**
 * Découpe toutes les planches.
 * @returns {Promise<{ files: Record<string, Buffer>, images: object, report: object }>}
 *   files  : { 'characters/kai/neutre.webp': Buffer, 'characters/kai/neutre-720.webp': Buffer, … }
 *   images : { kai: { neutre: { src, srcset, large }, … } } (chemins relatifs au site, avec ?v=)
 *   report : { kai: { neutre: '9 Ko', …, _fond: '#2fd52a', _erreur: '…' } }
 */
export async function processSheets(sharp) {
  const files = {}; const images = {}; const report = {};
  for (const [id, { sheets, error }] of Object.entries(findSheets())) {
    const rep = (report[id] = {});
    if (error) rep._erreur = error;
    const cells = [];
    for (const [stem, s] of Object.entries(sheets)) {
      const [rows, cols] = s.grille;
      const { data: px, info } = await sharp(s.file).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const W = info.width; const H = info.height;
      const K = detectKey(px, W, H, rows, s.fond);
      const kk = keyer(K);
      rep[`_fond ${stem}`] = `#${K.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
      const { isBg, xs, ys } = analyseGrid(px, W, H, rows, cols, kk);
      const hash = createHash('md5').update(readFileSync(s.file)).update(JSON.stringify(s)).digest('hex').slice(0, 8);
      // Zones à découper : cases de la grille ("cases") et/ou zones libres ("zones",
      // en % de l'image : [x, y, largeur, hauteur]). Une zone l'emporte sur une case.
      const targets = {};
      for (const [expr, num] of Object.entries(s.cases)) {
        const idx = Number(num) - 1; const r = Math.floor(idx / cols); const c = idx % cols;
        if (!(idx >= 0 && r < rows)) { rep[expr] = `case ${num} hors de la grille ${rows} × ${cols}`; continue; }
        targets[expr] = { label: `case ${num}`, x0: xs[c], y0: ys[r], x1: xs[c + 1], y1: ys[r + 1] };
      }
      for (const [expr, z] of Object.entries(s.zones || {})) {
        if (!Array.isArray(z) || z.length !== 4) { rep[expr] = 'zone invalide : [x, y, largeur, hauteur] en %'; continue; }
        const [zx, zy, zw, zh] = z.map(Number);
        targets[expr] = { label: `zone ${z.join(' ')}`, x0: Math.round((W * zx) / 100), y0: Math.round((H * zy) / 100), x1: Math.round((W * Math.min(100, zx + zw)) / 100), y1: Math.round((H * Math.min(100, zy + zh)) / 100) };
      }
      for (const [expr, t] of Object.entries(targets)) {
        if (!EXPRESSIONS.includes(expr)) { rep[expr] = `expression inconnue (${EXPRESSIONS.join(', ')})`; continue; }
        // Bords légèrement rentrés : restes de bordure (JPEG) exclus.
        const inX = Math.max(3, Math.round((t.x1 - t.x0) * 0.012)); const inY = Math.max(3, Math.round((t.y1 - t.y0) * 0.012));
        const box = subjectBox(isBg, t.x0 + inX, t.y0 + inY, t.x1 - inX, t.y1 - inY);
        if (!box) { rep[expr] = `${t.label} vide`; continue; }
        const cell = keepMain(cutOut(px, W, isBg, box, kk), box);
        if (!cell) { rep[expr] = `${t.label} vide`; continue; }
        cells.push({ expr, ...cell, ...measure(cell.rgba, cell.w, cell.h), hash });
      }
    }
    if (!cells.length) continue;
    // RÉFÉRENCE : l'expression "neutre" (tête entière, de face). Chaque autre portrait
    // est RECALÉ sur elle (agrandissement + décalage qui font coïncider le visage) :
    // les yeux tombent au même endroit, même si les cheveux sont coupés par le bord
    // de la case ou si une main passe devant le visage.
    const R = cells.find((c) => c.expr === 'neutre') || cells[0];
    // Deux méthodes, la plus sûre selon le cas :
    //  - tête entière dans sa case → haut des cheveux et largeur de tête alignés
    //    (insensible à une bouche grande ouverte ou à une main devant le visage) ;
    //  - cheveux coupés en haut par la case → recalage sur le visage de la référence.
    for (const c of cells) {
      if (c === R) Object.assign(c, { sigma: 1, tx: 0, ty: 0 });
      else if (c.cutT || R.cutT) Object.assign(c, await register(sharp, R, c));
      else { const sigma = R.head / c.head; Object.assign(c, { sigma, tx: R.center - sigma * c.center, ty: R.top - sigma * c.top }); }
    }
    // Repère : celui de la référence. Haut des cheveux à 3 % du haut, tête centrée ;
    // assez grand pour que chaque buste descende jusqu'en bas de l'image, mais la tête
    // ne dépasse pas 80 % de la largeur.
    const TOP = OUT_H * 0.03;
    const need = Math.max(...cells.map((c) => (OUT_H - TOP) / Math.max(1, c.ty + c.sigma * c.h - R.top)));
    const G = Math.min(need, (OUT_W * 0.8) / R.head);
    images[id] = {};
    for (const c of cells) {
      if (c.cutL || c.cutR) fadeSides(c.rgba, c.w, c.h, c.cutL, c.cutR);
      if (c.cutT) fadeTop(c.rgba, c.w, c.h); // cheveux coupés par le bord de la case : fondu
      const s = G * c.sigma;
      let left = Math.round(OUT_W / 2 + G * (c.tx - R.center)); const top = Math.round(TOP + G * (c.ty - R.top));
      // Buste trop court pour atteindre le bas : fondu doux au lieu d'une coupe nette.
      if (top + s * c.h < OUT_H - 2) fadeBottom(c.rgba, c.w, c.h);
      const rw = Math.max(1, Math.round(c.w * s)); const rh = Math.max(1, Math.round(c.h * s));
      const resized = await sharp(c.rgba, { raw: { width: c.w, height: c.h, channels: 4 } }).resize(rw, rh, { kernel: 'lanczos3' }).raw().toBuffer();
      const cx0 = Math.max(0, -left); const cy0 = Math.max(0, -top);
      const cw = Math.min(rw - cx0, OUT_W - Math.max(0, left)); const ch = Math.min(rh - cy0, OUT_H - Math.max(0, top));
      let part = sharp(resized, { raw: { width: rw, height: rh, channels: 4 } });
      if (cx0 || cy0 || cw < rw || ch < rh) part = part.extract({ left: cx0, top: cy0, width: cw, height: ch });
      const layer = await part.png().toBuffer();
      left = Math.max(0, left);
      const canvas = await sharp({ create: { width: OUT_W, height: OUT_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: layer, left, top: Math.max(0, top) }]).png().toBuffer();
      const v = `?v=${c.hash}`;
      const base = `characters/${id}/${c.expr}`;
      files[`${base}.webp`] = await sharp(canvas).resize(...SIZES.small).webp({ quality: 82, alphaQuality: 90, effort: 5 }).toBuffer();
      files[`${base}-720.webp`] = await sharp(canvas).webp({ quality: 80, alphaQuality: 90, effort: 5 }).toBuffer();
      images[id][c.expr] = { src: `${base}.webp${v}`, srcset: `${base}.webp${v} 300w, ${base}-720.webp${v} 720w`, large: `${base}-720.webp${v}` };
      rep[c.expr] = `${Math.round(files[`${base}.webp`].length / 1024)} Ko`;
    }
  }
  return { files, images, report };
}
