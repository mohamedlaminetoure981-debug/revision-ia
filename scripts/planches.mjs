// =====================================================================
// planches.mjs — DÉCOUPE AUTOMATIQUE DES PLANCHES D'EXPRESSIONS
// ---------------------------------------------------------------------
// Pour chaque personnage : public/characters/<id>/planche-a.jpg et planche-b.jpg
// (ou .png / .webp), fond VERT uni (#00FF00), grille 2 × 2 :
//   planche A : neutre (haut gauche), joie (haut droite),
//               réflexion (bas gauche), célébration (bas droite)
//   planche B : encouragement, surprise, concentration, clin
// Étapes (appelées par vite.config.js, en local comme au build) :
//   1. repérer la grille, en ignorant les marges et les traits de séparation ;
//   2. retirer le fond vert (bords adoucis, sans liseré vert : "despill") ;
//   3. cadrer les 8 portraits À L'IDENTIQUE : même largeur d'épaules, même
//      centre, même bas de buste → même taille de visage et même position
//      des yeux d'une expression à l'autre ;
//   4. exporter en WebP transparent : 300 px (appli) et 720 px (images partagées).
// =====================================================================

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export const CHAR_DIR = 'public/characters';
export const SHEETS = {
  a: ['neutre', 'joie', 'reflexion', 'celebration'],
  b: ['encouragement', 'surprise', 'concentration', 'clin'],
};
// Format des portraits de l'appli : 200 × 232 (voir ui/character.js).
export const SIZES = { small: [300, 348], large: [720, 835] };
const OUT_W = 720; const OUT_H = 835;

/** Fichiers de planches trouvés : { kai: { a: 'public/characters/kai/planche-a.jpg', b: … } } */
export function findSheets() {
  const out = {};
  if (!existsSync(CHAR_DIR)) return out;
  for (const id of readdirSync(CHAR_DIR)) {
    const dir = join(CHAR_DIR, id);
    if (!statSync(dir).isDirectory()) continue;
    for (const name of readdirSync(dir)) {
      const m = name.match(/^planche-([ab])\.(jpe?g|png|webp)$/i);
      if (m) (out[id.toLowerCase()] ||= {})[m[1].toLowerCase()] = join(dir, name);
    }
  }
  return out;
}

// ---------------------------------------------------------------------
// Fond vert
// ---------------------------------------------------------------------
// "Verdeur" d'un pixel : de combien le vert dépasse le rouge et le bleu.
const greenness = (r, g, b) => g - Math.max(r, b);
const isGreen = (r, g, b) => g > 80 && greenness(r, g, b) > 45;

/** Opacité d'un pixel (0 = fond vert, 1 = personnage), avec un bord adouci. */
function alphaOf(r, g, b) {
  const d = greenness(r, g, b);
  if (g < 60) return 1;
  const a = 1 - (d - 22) / (85 - 22);
  return a >= 1 ? 1 : a <= 0 ? 0 : a;
}

// ---------------------------------------------------------------------
// 1. Grille 2 × 2
// ---------------------------------------------------------------------
function analyseGrid(px, W, H) {
  const green = new Uint8Array(W * H);
  const rowFg = new Float64Array(H); const colFg = new Float64Array(W);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      if (isGreen(px[i], px[i + 1], px[i + 2])) green[y * W + x] = 1;
      else { rowFg[y]++; colFg[x]++; }
    }
  }
  // Traits de séparation / bordures : lignes ou colonnes presque entièrement "non vertes".
  const lineRow = Array.from(rowFg, (v) => v / W > 0.96);
  const lineCol = Array.from(colFg, (v) => v / H > 0.96);
  const isBg = (x, y) => green[y * W + x] || lineRow[y] || lineCol[x];
  // Densité du personnage par colonne / ligne (sans les traits).
  const colD = new Float64Array(W); const rowD = new Float64Array(H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!isBg(x, y)) { colD[x]++; rowD[y]++; }
  // Séparation = la colonne (ligne) la plus vide dans la zone centrale.
  const split = (d, n) => {
    let best = Math.round(n / 2); let bv = Infinity;
    for (let k = Math.round(n * 0.3); k < Math.round(n * 0.7); k++) {
      const v = d[k] + Math.abs(k - n / 2) * 0.02; // à égalité, la plus centrale
      if (v < bv) { bv = v; best = k; }
    }
    return best;
  };
  return { isBg, xs: split(colD, W), ys: split(rowD, H) };
}

/** Cadre du personnage dans une cellule (ignore les petites taches isolées). */
function subjectBox(isBg, x0, y0, x1, y1) {
  const W = x1 - x0; const H = y1 - y0;
  const col = new Float64Array(W); const row = new Float64Array(H);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!isBg(x, y)) { col[x - x0]++; row[y - y0]++; }
  const minC = H * 0.004; const minR = W * 0.004;
  let l = 0; while (l < W && col[l] < minC) l++;
  let r = W - 1; while (r > l && col[r] < minC) r--;
  let t = 0; while (t < H && row[t] < minR) t++;
  let b = H - 1; while (b > t && row[b] < minR) b--;
  if (r <= l || b <= t) return null;
  return { x: x0 + l, y: y0 + t, w: r - l + 1, h: b - t + 1 };
}

// ---------------------------------------------------------------------
// 2. Détourage d'une cellule → RGBA
// ---------------------------------------------------------------------
function cutOut(px, W, isBg, box) {
  const out = Buffer.alloc(box.w * box.h * 4);
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      const sx = box.x + x; const sy = box.y + y;
      const i = (sy * W + sx) * 3; const o = (y * box.w + x) * 4;
      let r = px[i]; let g = px[i + 1]; const b = px[i + 2];
      let a = isBg(sx, sy) && !isGreen(r, g, b) ? 0 : alphaOf(r, g, b); // traits de séparation → transparents
      // Despill : le vert ne doit jamais dépasser max(rouge, bleu) → plus de liseré vert.
      const lim = Math.max(r, b);
      if (g > lim) g = lim + (g - lim) * 0.15;
      // Bord légèrement resserré (le halo semi-transparent disparaît).
      a = Math.max(0, Math.min(1, (a - 0.12) / 0.88));
      out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = Math.round(a * 255);
    }
  }
  return out;
}

// ---------------------------------------------------------------------
// 3. Repères pour un cadrage identique (épaules = bas du buste)
// ---------------------------------------------------------------------
function measure(rgba, w, h) {
  // Bande des épaules : entre 82 % et 94 % de la hauteur du personnage.
  let width = 0; let center = 0; let n = 0;
  for (let y = Math.floor(h * 0.82); y < Math.floor(h * 0.94); y++) {
    // Plus long segment continu de la ligne = le buste (une étincelle ou une main
    // à côté ne fausse pas la mesure).
    let best = [0, -1]; let start = -1;
    for (let x = 0; x <= w; x++) {
      const on = x < w && rgba[(y * w + x) * 4 + 3] > 128;
      if (on && start < 0) start = x;
      if (!on && start >= 0) { if (x - 1 - start > best[1] - best[0]) best = [start, x - 1]; start = -1; }
    }
    if (best[1] >= best[0]) { width += best[1] - best[0]; center += (best[0] + best[1]) / 2; n++; }
  }
  return n ? { shoulders: width / n, center: center / n } : { shoulders: w, center: w / 2 };
}

/**
 * Découpe toutes les planches.
 * @returns {Promise<{ files: Record<string, Buffer>, images: object, report: object }>}
 *   files  : { 'characters/kai/neutre.webp': Buffer, 'characters/kai/neutre-720.webp': Buffer, … }
 *   images : { kai: { neutre: { src, srcset }, … } } (chemins relatifs au site, avec ?v=)
 */
export async function processSheets(sharp) {
  const files = {}; const images = {}; const report = {};
  for (const [id, sheets] of Object.entries(findSheets())) {
    const cells = [];
    for (const [key, file] of Object.entries(sheets)) {
      const { data: px, info } = await sharp(file).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const W = info.width; const H = info.height;
      const { isBg, xs, ys } = analyseGrid(px, W, H);
      const quads = [[0, 0, xs, ys], [xs, 0, W, ys], [0, ys, xs, H], [xs, ys, W, H]];
      SHEETS[key].forEach((expr, q) => {
        const box = subjectBox(isBg, ...quads[q]);
        if (!box) { (report[id] ||= {})[expr] = 'vide'; return; }
        const rgba = cutOut(px, W, isBg, box);
        cells.push({ expr, rgba, w: box.w, h: box.h, ...measure(rgba, box.w, box.h), hash: createHash('md5').update(readFileSync(file)).digest('hex').slice(0, 8) });
      });
    }
    if (!cells.length) continue;
    // Échelle commune : même largeur d'épaules pour toutes les expressions.
    const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
    const ref = med(cells.map((c) => c.shoulders));
    for (const c of cells) c.k = Math.min(1.18, Math.max(0.85, ref / c.shoulders));
    // Taille finale : le plus grand personnage tient en hauteur (3 % de marge en haut),
    // et les épaules occupent au plus 82 % de la largeur.
    const G = Math.min(...cells.map((c) => (OUT_H * 0.97) / (c.h * c.k)), (OUT_W * 0.82) / ref);
    images[id] = {};
    for (const c of cells) {
      const s = G * c.k;
      const rw = Math.max(1, Math.round(c.w * s)); const rh = Math.max(1, Math.round(c.h * s));
      const resized = await sharp(c.rgba, { raw: { width: c.w, height: c.h, channels: 4 } }).resize(rw, rh, { kernel: 'lanczos3' }).raw().toBuffer();
      // Bas du buste en bas de l'image ; centre des épaules au milieu.
      let left = Math.round(OUT_W / 2 - c.center * s); const top = OUT_H - rh;
      // Partie qui dépasse du cadre (ex. bras levés) : coupée proprement.
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
      (report[id] ||= {})[c.expr] = `${Math.round(files[`${base}.webp`].length / 1024)} Ko`;
    }
  }
  return { files, images, report };
}
