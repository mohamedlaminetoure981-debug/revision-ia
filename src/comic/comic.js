// =====================================================================
// comic.js — MOTEUR DE PAGES DE BD
// ---------------------------------------------------------------------
// Une PAGE (1000 × 1500) = une grille de CASES (rangées × colonnes, bords
// droits ou en biais) + des cases libres (incrustations).
// Une CASE = décor + personnages (pose, expression, cadrage) + effets
//            + bulles + cartouches + onomatopées + textes en surimpression (labels).
// Tout est décrit dans les fichiers de chapitres (src/data/comic/chapitres/).
//
// Une case peut être REMPLACÉE par une illustration : dépose simplement
// public/story/chapitre-1/page-2-case-3.webp (ou .png / .jpg), voir
// story-images.js. L'image est recadrée au centre pour remplir la case ;
// bulles, cartouches, onomatopées, effets et sons restent par-dessus.
// (Ancienne méthode, toujours valable : `image: 'chemin/dans/public.webp'`.)
// =====================================================================

import { bodySVG, INK } from './body.js';
import { storyImage, pickSrc } from './story-images.js';
import { decorSVG, gradeFor, rng, TIMES } from './decors.js';
import { oubliSVG, poingSVG, piedsSVG } from './entities.js';
import { figureSVG, FIGURES } from './figures.js';
import { characterBust } from '../ui/character.js';
import { EXTRA_LOOKS } from '../data/comic/looks.js';
import { CHARACTERS } from '../data/characters.js';

export const PAGE_W = 1000;
export const PAGE_H = 1500;
const MARGIN = 26;
const GUTTER = 16;
const BORDER = 5;
const FONT = "'Plus Jakarta Sans Variable', 'Arial Narrow', Arial, sans-serif";
const DISPLAY = "'Unbounded Variable', 'Arial Black', sans-serif";

const f = (n) => Math.round(n * 10) / 10;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let uidN = 0;
const uid = (p) => `${p}${++uidN}`;

// ---------------------------------------------------------------------
// MISE EN PAGE : rangées / colonnes (bords droits ou en biais)
// ---------------------------------------------------------------------
/**
 * page.rows = [{ h: 0.4, cols: [0.6, 0.4], tilt: 40, ctilt: [30] }, …]
 *   h     : hauteur relative de la rangée
 *   cols  : largeurs relatives des cases de la rangée
 *   tilt  : biais du bord BAS de la rangée (décalage vertical à droite, en px)
 *   ctilt : biais des séparations entre colonnes (décalage horizontal en bas)
 * @returns {Array<Array<[x,y]>>} polygones des cases, dans l'ordre de lecture
 */
export function layoutPage(page) {
  const rows = page.rows || [{ h: 1, cols: [1] }];
  const total = rows.reduce((s, r) => s + r.h, 0);
  const innerH = PAGE_H - MARGIN * 2 - GUTTER * (rows.length - 1);
  const innerW = PAGE_W - MARGIN * 2;
  const polys = [];
  let y = MARGIN;
  let prevTilt = 0;
  rows.forEach((row, ri) => {
    const hh = (innerH * row.h) / total;
    const tilt = ri < rows.length - 1 ? (row.tilt || 0) : 0;
    const yTop = (x) => y + (prevTilt * (x - MARGIN)) / innerW;
    const yBot = (x) => y + hh + (tilt * (x - MARGIN)) / innerW;
    const cols = row.cols || [1];
    const ct = cols.reduce((s, c) => s + c, 0);
    const iw = innerW - GUTTER * (cols.length - 1);
    let x = MARGIN;
    cols.forEach((cw, ci) => {
      const w = (iw * cw) / ct;
      const lt = ci > 0 ? (row.ctilt?.[ci - 1] || 0) : 0;
      const rt = ci < cols.length - 1 ? (row.ctilt?.[ci] || 0) : 0;
      const xl = x; const xr = x + w;
      // Bord gauche/droit (éventuellement en biais) : décalage en bas = lt / rt
      const tl = [xl - lt / 2, 0]; const bl = [xl + lt / 2, 0];
      const tr = [xr - rt / 2, 0]; const br = [xr + rt / 2, 0];
      tl[1] = yTop(tl[0]) + (ri > 0 ? GUTTER / 2 - GUTTER / 2 : 0);
      tr[1] = yTop(tr[0]);
      bl[1] = yBot(bl[0]); br[1] = yBot(br[0]);
      polys.push([tl, tr, br, bl]);
      x = xr + GUTTER;
    });
    y += hh + GUTTER;
    prevTilt = tilt;
  });
  return polys;
}

/** Cadres { x, y, w, h } des cases d'une page (pour choisir/précharger les images). */
export function pageBoxes(page) {
  const grid = layoutPage(page);
  return (page.panels || []).map((p, i) => {
    if (p.r) { const [x, y, w, h] = p.r; return { x, y, w, h }; }
    return grid[i] ? bboxOf(grid[i]) : { x: 0, y: 0, w: 948, h: 600 };
  });
}

const bboxOf = (poly) => {
  const xs = poly.map((p) => p[0]); const ys = poly.map((p) => p[1]);
  const x = Math.min(...xs); const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
};
const polyD = (poly) => `M${poly.map((p) => `${f(p[0])},${f(p[1])}`).join(' L')} Z`;

// ---------------------------------------------------------------------
// PERSONNAGES dans une case
// ---------------------------------------------------------------------
/**
 * Un personnage dans une case.
 * c = { id, pose, expr, shot, x, y, fill, flip, light, blur, aura, break, h, anchor }
 *
 * CADRAGE (le plus simple) : `shot` = type de plan
 *   'pied'      plan en pied (tout le corps)         'americain' tête → mi-cuisses
 *   'taille'    tête → taille                         'buste'     tête → poitrine
 *   'gros'      gros plan (visage + cou)              'yeux'      très gros plan (regard)
 *   x    : position horizontale (0 = bord gauche, 1 = bord droit)
 *   y    : 'pied' → hauteur du sol (défaut 0.95) ; 'yeux' → hauteur des yeux (défaut 0.5) ;
 *          autres plans → hauteur du SOMMET de la tête (défaut 0.06)
 *   fill : part de la hauteur de la case occupée par la partie cadrée (défaut 0.92)
 * Cadrage manuel (avancé) : h (taille debout en hauteurs de case) + anchor 'feet' | 'head'.
 *
 *   light : 'contre' (contre-jour) ou une couleur d'éclairage, ex. '#8b5cf6'
 *   blur  : flou de mouvement (décalage, ex. -80)   aura : couleur d'aura
 *   break : true = le perso DÉBORDE du cadre (grands moments)
 */
const SPANS = { americain: 470, taille: 360, buste: 230, gros: 170, yeux: 70 };
function figure(c, w, h, time) {
  let grade = gradeFor(time);
  if (c.light === 'contre') grade = gradeFor(time, ['#0d0718', 0.72]);
  else if (c.light && c.light.startsWith?.('#')) grade = gradeFor(time, [c.light, 0.13]); // léger : la peau garde sa couleur
  let r;
  const portrait = ['gros', 'buste', 'yeux'].includes(c.shot) && CHARACTERS[c.id];
  if (c.id === 'oubli') r = oubliSVG(c.pose, { seed: c.seed });
  else if (c.id === 'poing') r = poingSVG(c.of);
  else if (c.id === 'pieds') r = piedsSVG(c.of);
  else if (portrait) {
    // Gros plans et plans poitrine : le PORTRAIT original (le plus réussi).
    // Rotation du cou limitée (±0,35) : la tête reste cohérente avec le buste.
    const turn = Math.max(-0.35, Math.min(0.35, c.turn || 0));
    // Pas d'étalonnage de couleur sur les portraits : essayé (contre-jour, éclairage
    // d'ambiance), il ternissait et grisait les visages. Les couleurs d'origine restent.
    const bust = characterBust(c.id, c.expr || 'neutre', { turn });
    r = { svg: `<g transform="scale(1.16) translate(-100,-103)">${bust}</g>`, head: [0, 0], top: -90 };
  } else if (CHARACTERS[c.id] || EXTRA_LOOKS[c.id]) {
    // Corps entier : une POSE DESSINÉE d'un bloc si elle existe ; sinon (action)
    // une silhouette en contre-jour. Toute incohérence est signalée.
    if (FIGURES[c.pose || 'debout']) r = figureSVG(c.id, c.pose || 'debout', { expr: c.expr, grade });
    else {
      r = bodySVG(c.id, c.pose, { expr: c.expr, silhouette: true, rim: c.rim || (TIMES[time] || TIMES.jour).light });
    }
    if (r.issues?.length && typeof window !== 'undefined') (window.__poseIssues ||= []).push(...r.issues);
  } else return { svg: '', back: '', head: [0, 0] };
  const flip = c.flip ? -1 : 1;
  let sc; let tx = (c.x ?? 0.5) * w; let ty;
  if (c.id === 'poing' || c.id === 'pieds') {
    // Gros plans partiels : `size` = taille relative dans la case
    sc = ((c.size ?? 0.5) * h) / (c.id === 'poing' ? 400 : 760);
    ty = (c.y ?? (c.id === 'poing' ? 0.5 : 0.98)) * h;
    const tr0 = `translate(${f(tx)},${f(ty)}) scale(${f(sc * flip * 1000) / 1000},${f(sc * 1000) / 1000})${c.rot ? ` rotate(${c.rot})` : ''}`;
    return { svg: `<g class="fig" transform="${tr0}">${r.svg}</g>`, back: '', head: [tx, ty] };
  }
  const top = r.top; // sommet de la tête (valeur négative)
  const fill = c.fill ?? 0.92;
  if (c.shot === 'pied' || (!c.shot && c.anchor !== 'head' && !c.h)) {
    sc = (fill * h) / -top;
    ty = (c.y ?? 0.95) * h;
  } else if (c.shot === 'yeux') {
    sc = (fill * h) / SPANS.yeux;
    tx -= r.head[0] * sc * flip; ty = (c.y ?? 0.5) * h - r.head[1] * sc;
  } else if (c.shot && SPANS[c.shot]) {
    const span = c.id === 'oubli' ? SPANS[c.shot] * 1.4 : SPANS[c.shot];
    sc = (fill * h) / span;
    tx -= r.head[0] * sc * flip; ty = (c.y ?? 0.06) * h - top * sc;
  } else { // cadrage manuel
    sc = ((c.h ?? 0.8) * h) / 720;
    ty = (c.y ?? 0.95) * h;
    if (c.anchor === 'head') { tx -= r.head[0] * sc * flip; ty -= r.head[1] * sc; }
  }
  const sx = sc * flip;
  const tr = `translate(${f(tx)},${f(ty)}) scale(${f(sx * 1000) / 1000},${f(sc * 1000) / 1000})${c.rot ? ` rotate(${c.rot})` : ''}`;
  let back = '';
  // Ombre au sol (plans en pied)
  if ((c.shot === 'pied' || !c.shot) && !c.noShadow && c.id !== 'oubli') back += `<ellipse cx="${f(tx)}" cy="${f(ty)}" rx="${f(150 * sc)}" ry="${f(22 * sc)}" fill="#000" opacity=".28"/>`;
  if (c.aura) {
    const g = uid('au');
    back += `<defs><radialGradient id="${g}"><stop offset="0" stop-color="${c.aura}" stop-opacity=".8"/><stop offset=".55" stop-color="${c.aura}" stop-opacity=".3"/><stop offset="1" stop-color="${c.aura}" stop-opacity="0"/></radialGradient></defs>
      <g transform="${tr}"><ellipse cx="0" cy="${f(top / 2)}" rx="380" ry="${f(-top * 0.75)}" fill="url(#${g})"/>`;
    for (let i = 0; i < 11; i++) back += `<path d="M${-220 + i * 44},10 Q${-250 + i * 50},${f(top * 0.55)} ${-160 + i * 34},${f(top * (1.05 + (i % 3) * 0.12))}" stroke="${c.aura}" stroke-width="${8 + (i % 3) * 5}" fill="none" opacity=".45" stroke-linecap="round"/>`;
    back += '</g>';
  }
  let svg = '';
  if (c.blur) {
    for (const k of [0.7, 0.4]) svg += `<g transform="translate(${f(c.blur * k)},0)" opacity="${f(0.16 + (1 - k) * 0.14)}"><g transform="${tr}">${r.svg}</g></g>`;
  }
  svg += `<g transform="${tr}">${r.svg}</g>`;
  const head = [tx + r.head[0] * sx, ty + r.head[1] * sc];
  return { svg: `<g class="fig">${svg}</g>`, back, head };
}

// ---------------------------------------------------------------------
// EFFETS de case
// ---------------------------------------------------------------------
// avoid : zones [x0, y0, x1, y1] (px de la case) à ne pas recouvrir (visages… des illustrations)
function effect(fx, w, h, r, avoid = []) {
  const col = fx.color || INK;
  // Effets "ponctuels" (éclat, halo) : supprimés s'ils toucheraient une zone protégée
  // (l'illustration a déjà ses propres éclats et lumières).
  if (avoid.length && (fx.type === 'impact' || fx.type === 'lueur')) {
    const cx = w * (fx.x ?? 0.5); const cy = h * (fx.y ?? 0.5);
    const R = fx.type === 'impact' ? (fx.size ?? 0.25) * Math.min(w, h) * 1.2 : (fx.size ?? 0.5) * Math.max(w, h) * 0.5;
    if (avoid.some(([a, b, c, d]) => cx + R > a && cx - R < c && cy + R > b && cy - R < d)) return '';
  }
  switch (fx.type) {
    case 'vitesse': { // lignes de vitesse parallèles
      const a = ((fx.angle ?? 0) * Math.PI) / 180;
      let s = '';
      for (let i = 0; i < (fx.n || 34); i++) {
        const y = r() * h * 1.4 - h * 0.2; const x = r() * w; const L = w * (0.25 + r() * 0.6);
        s += `<path d="M${f(x)},${f(y)} l${f(Math.cos(a) * L)},${f(Math.sin(a) * L)}" stroke="${col}" stroke-width="${f(1 + r() * 3.5)}" opacity="${f(fx.opacity ?? 0.55)}" stroke-linecap="round"/>`;
      }
      return s;
    }
    case 'concentration': { // lignes vers un point (regard, choc)
      const cx = w * (fx.x ?? 0.5); const cy = h * (fx.y ?? 0.5); const R = Math.hypot(w, h);
      let s = '';
      for (let i = 0; i < (fx.n || 70); i++) {
        const a = r() * Math.PI * 2; const r0 = R * (fx.inner ?? 0.22) * (0.8 + r() * 0.5); const da = 0.004 + r() * 0.01;
        s += `<path d="M${f(cx + Math.cos(a) * r0)},${f(cy + Math.sin(a) * r0)} L${f(cx + Math.cos(a - da) * R)},${f(cy + Math.sin(a - da) * R)} L${f(cx + Math.cos(a + da) * R)},${f(cy + Math.sin(a + da) * R)} Z" fill="${col}" opacity="${f(fx.opacity ?? 0.8)}"/>`;
      }
      return s;
    }
    case 'impact': { // éclat d'impact (étoile irrégulière)
      const cx = w * (fx.x ?? 0.5); const cy = h * (fx.y ?? 0.5); const R = (fx.size ?? 0.25) * Math.min(w, h);
      let d = '';
      const n = 16;
      for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2; const rr = i % 2 ? R * (0.35 + r() * 0.15) : R * (0.8 + r() * 0.5); d += `${i ? 'L' : 'M'}${f(cx + Math.cos(a) * rr)},${f(cy + Math.sin(a) * rr)} `; }
      return `<path d="${d}Z" fill="${fx.color || '#fff7c2'}" stroke="${INK}" stroke-width="4"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 0.28)}" fill="#fff"/>`;
    }
    case 'pluie': {
      let s = '';
      for (let i = 0; i < (fx.n || 120); i++) { const x = r() * w * 1.2; const y = r() * h; s += `<path d="M${f(x)},${f(y)} l-8,${f(26 + r() * 20)}" stroke="#dfe8f2" stroke-width="1.4" opacity="${f(0.35 + r() * 0.4)}"/>`; }
      return s;
    }
    case 'trame': { // trame de points (ombre, émotion)
      const id = uid('tr');
      return `<defs><pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="4.5" cy="4.5" r="${fx.dot || 1.6}" fill="${col}"/></pattern></defs><rect width="${w}" height="${h}" fill="url(#${id})" opacity="${fx.opacity ?? 0.35}"/>`;
    }
    case 'vignette': {
      const id = uid('vg');
      return `<defs><radialGradient id="${id}" cx="50%" cy="50%" r="70%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${fx.opacity ?? 0.65}"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`;
    }
    case 'lueur': { // halo de lumière colorée
      const id = uid('lu');
      const cx = w * (fx.x ?? 0.5); const cy = h * (fx.y ?? 0.5);
      return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${fx.color || '#fff'}" stop-opacity="${fx.opacity ?? 0.7}"/><stop offset="1" stop-color="${fx.color || '#fff'}" stop-opacity="0"/></radialGradient></defs><circle cx="${f(cx)}" cy="${f(cy)}" r="${f((fx.size ?? 0.5) * Math.max(w, h))}" fill="url(#${id})"/>`;
    }
    case 'fissure': { // fissures violettes lumineuses (marque de l'Oubli)
      const cx = w * (fx.x ?? 0.5); const cy = h * (fx.y ?? 0.5); const R = (fx.size ?? 0.15) * Math.min(w, h);
      let s = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 0.9)}" fill="#7c3aed" opacity=".25"/>`;
      for (let i = 0; i < 7; i++) {
        let x = cx; let y = cy; let d = `M${f(x)},${f(y)}`;
        const a0 = r() * Math.PI * 2;
        for (let k = 0; k < 4; k++) { const a = a0 + (r() - 0.5) * 0.9; x += Math.cos(a) * R * 0.3; y += Math.sin(a) * R * 0.3; d += ` L${f(x)},${f(y)}`; }
        s += `<path d="${d}" stroke="#7c3aed" stroke-width="5" fill="none" opacity=".8"/><path d="${d}" stroke="#e9d5ff" stroke-width="1.6" fill="none"/>`;
      }
      return s;
    }
    case 'teinte': return `<rect width="${w}" height="${h}" fill="${fx.color || '#000'}" opacity="${fx.opacity ?? 0.3}"/>`;
    case 'glitch': { // l'Oubli efface : rectangles et bandes décalées
      let s = '';
      for (let i = 0; i < (fx.n || 26); i++) {
        const gw = w * (0.05 + r() * 0.3); const gh = h * (0.01 + r() * 0.05);
        const gx = r() * w; const gy = r() * h;
        const col = ['#7c3aed', '#0b0614', '#c4b5fd', '#22d3ee'][Math.floor(r() * 4)]; const op = 0.35 + r() * 0.5;
        if (avoid.some(([a, b, c, d]) => gx < c && gx + gw > a && gy < d && gy + gh > b)) continue;
        s += `<rect x="${f(gx)}" y="${f(gy)}" width="${f(gw)}" height="${f(gh)}" fill="${col}" opacity="${f(op)}"/>`;
      }
      return s;
    }
    default: return '';
  }
}

// ---------------------------------------------------------------------
// BULLES, CARTOUCHES, ONOMATOPÉES (au niveau de la page)
// ---------------------------------------------------------------------
// Variables remplacées dans les textes : {prenom} → prénom du lecteur.
// Rendu des formules (KaTeX) : branché par le lecteur (ui.js n'est pas chargeable hors navigateur).
let mathRenderer = null;
export function setMathRenderer(fn) { mathRenderer = fn; }
const mathInline = (tex) => (mathRenderer ? mathRenderer(tex) : String(tex).replace(/&/g, '&amp;').replace(/</g, '&lt;'));

let VARS = { prenom: 'toi' };
export function setComicVars(v) { VARS = { ...VARS, ...v }; }
const fillVars = (t) => String(t ?? '').replace(/\{(\w+)\}/g, (m, k) => VARS[k] ?? m);

function wrap(text, maxChars) {
  text = fillVars(text);
  // Espace insécable devant ! ? : ; » (le signe reste collé au mot).
  const words = String(text).replace(/ ([!?:;»])/g, ' $1').replace(/« /g, '« ').split(/[ \t\n]+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const wd of words) {
    // On passe à la ligne si le mot ne tient plus, ou après une fin de phrase
    // quand la ligne est déjà assez remplie (coupure plus naturelle).
    const endOfSentence = /[.!?…]$/.test(cur) && cur.length >= maxChars * 0.55;
    if (cur && ((cur + ' ' + wd).length > maxChars || endOfSentence)) { lines.push(cur); cur = wd; } else cur = (cur + ' ' + wd).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * Taille de texte AUTOMATIQUE (en unités de page) selon la taille de la case.
 * Le lecteur "case par case" zoome sur la case : sur un téléphone de 360 px
 * (zone ≈ 340 × 600 px), une case de largeur w est affichée à l'échelle
 * k = min(340 / w, 600 / h). On vise un texte d'environ 12 à 14 px à l'écran
 * sur ce petit téléphone (plus grand sur les grands écrans, mais toujours
 * dans la même proportion par rapport à l'image).
 */
const TARGET_PX = { parole: 12.5, cri: 14, caption: 11.5 };
const SIZE_MAX = { parole: 29, cri: 32, caption: 25 };
export function autoTextSize(box, kind = 'parole') {
  const k = Math.min(340 / box.w, 600 / box.h);
  return Math.round(Math.min(SIZE_MAX[kind], Math.max(16, TARGET_PX[kind] / k)));
}

// Largeur moyenne d'un caractère (en em) : Unbounded (cris) est bien plus large.
const CHAR_W = { parole: 0.56, cri: 0.68 };
const MAX_COVER = 0.25; // une bulle ne couvre pas plus de 25 % de la case

/**
 * Géométrie d'une bulle (sans la dessiner) : lignes, centre, rayons, part de la case couverte.
 * Taille du texte : b.size, sinon automatique (autoTextSize), réduite au besoin
 * pour ne pas dépasser 25 % de la case. Lignes équilibrées : la bulle garde une
 * forme d'ovale (pas de grande bulle plate pour trois mots).
 */
export function bubbleGeom(b, box) {
  const type = b.type || 'parole';
  const kind = type === 'cri' ? 'cri' : 'parole';
  const text = fillVars(b.text);
  const area = box.area || box.w * box.h;
  let size = b.size || autoTextSize(box, kind);
  const minSize = b.size ? size : size * 0.72;
  let g;
  for (;;) {
    const perChar = size * CHAR_W[kind];
    const maxW = Math.max(perChar * 6, (b.w ?? 0.5) * box.w - size * 1.4);
    const longest = Math.max(...text.split(/\s+/).map((wd) => wd.length), 1);
    const ideal = Math.max(Math.min(text.length, 14), Math.ceil(Math.sqrt(text.length * (kind === 'cri' ? 3.6 : 5.2))));
    // Lignes équilibrées : nombre de lignes visé, puis largeur la plus petite qui le respecte.
    const maxChars = Math.max(longest, Math.floor(maxW / perChar));
    const want = Math.max(1, Math.ceil(text.length / Math.min(ideal, maxChars)));
    let lines = wrap(text, maxChars);
    for (let c = Math.max(longest, Math.ceil(text.length / want)); c <= maxChars; c++) {
      const l = wrap(text, c);
      if (l.length <= want) { lines = l; break; }
    }
    const tw = Math.max(...lines.map((l) => l.length)) * perChar;
    const lh = size * 1.18;
    const th = lines.length * lh;
    const big = type === 'cri' ? 1.08 : 1;
    const rx = ((tw / 2) * 1.3 + size * 0.45) * big;
    const ry = ((th / 2) * 1.3 + size * 0.4) * big;
    const cover = (Math.PI * rx * ry * (type === 'cri' ? 1.3 : type === 'pensee' ? 1.2 : 1)) / area;
    g = { type, size, lines, lh, th, rx, ry, cover, cx: box.x + (b.x ?? 0.5) * box.w, cy: box.y + (b.y ?? 0.2) * box.h };
    if (cover <= MAX_COVER || size * 0.93 < minSize) break;
    size *= 0.93;
  }
  return g;
}

/**
 * b = { type, text, x, y, w, who, tail, size }
 *   type : 'parole' | 'pensee' | 'cri' | 'murmure'
 *   x, y : centre de la bulle dans la case (0-1) ; w : largeur max (0-1)
 *   size : taille du texte (sinon automatique selon la case)
 *   who  : index du perso qui parle (la queue pointe vers sa bouche/tête)
 *   tail : [x, y] cible manuelle de la queue (0-1, dans la case), ou false
 */
function bubble(b, box, heads, faces = []) {
  const { type, size, lines, lh, th, rx, ry, cx, cy } = bubbleGeom(b, box);
  const fill = b.fill || '#fff';
  const ink = b.ink || INK;
  const sw = Math.max(4, size * 0.2);
  let s = '';
  // Queue
  let target = null;
  if (b.tail !== false) {
    if (Array.isArray(b.tail)) target = [box.x + b.tail[0] * box.w, box.y + b.tail[1] * box.h];
    else if (b.who !== undefined && heads[b.who]) target = [box.x + heads[b.who][0], box.y + heads[b.who][1]];
  }
  let tailD = '';
  if (target) {
    const dx = target[0] - cx; const dy = target[1] - cy; const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L; const uy = dy / L;
    const rim = Math.hypot(rx * ux, ry * uy); // distance centre → bord de la bulle (approx.)
    // La pointe s'arrête juste avant la bouche (sans la toucher).
    let edge = Math.max(rim + size * 0.6, Math.min(L - size * 0.5, rim + Math.min(size * 4, (L - rim) * 0.85)));
    if (type === 'pensee') edge = Math.max(edge, rim + size * 2); // ronds de pensée bien séparés
    let tip = [cx + ux * edge, cy + uy * edge];
    // La pointe ne doit jamais entrer dans un visage (zones « visage » des repères) : elle s'arrête à son bord.
    const inFace = (q) => faces.some((z) => q[0] > box.x + z[0] && q[0] < box.x + z[2] && q[1] > box.y + z[1] && q[1] < box.y + z[3]);
    if (inFace(tip)) {
      let t = edge;
      while (t > rim + size * 0.6 && inFace([cx + ux * t, cy + uy * t])) t -= size * 0.25;
      edge = Math.max(t, rim + size * 0.6); tip = [cx + ux * edge, cy + uy * edge];
    }
    const nx = -uy; const ny = ux; const bw = Math.min(rx, ry) * 0.3;
    if (type === 'pensee') {
      for (let i = 1; i <= 3; i++) { const t = (rim + (edge - rim) * (i / 3.2)) / edge; s += `<circle cx="${f(cx + (tip[0] - cx) * t)}" cy="${f(cy + (tip[1] - cy) * t)}" r="${f(size * (0.5 - i * 0.11))}" fill="${fill}" stroke="${ink}" stroke-width="${f(sw * 0.45)}"/>`; }
    } else {
      tailD = `M${f(cx + nx * bw)},${f(cy + ny * bw)} Q${f((cx + tip[0]) / 2 + nx * bw * 0.3)},${f((cy + tip[1]) / 2 + ny * bw * 0.3)} ${f(tip[0])},${f(tip[1])} Q${f((cx + tip[0]) / 2 - nx * bw * 0.1)},${f((cy + tip[1]) / 2 - ny * bw * 0.1)} ${f(cx - nx * bw)},${f(cy - ny * bw)} Z`;
    }
  }
  // Forme de la bulle
  let shape;
  if (type === 'cri') {
    const n = 18; let d = '';
    const R = rng(Math.round(cx + cy));
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2; const k = i % 2 ? 0.98 : 1.14 + R() * 0.1; d += `${i ? 'L' : 'M'}${f(cx + Math.cos(a) * rx * k)},${f(cy + Math.sin(a) * ry * k)} `; }
    shape = `${d}Z`;
  } else if (type === 'pensee') {
    const n = 11; let d = '';
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2; const a2 = ((i + 1) / n) * Math.PI * 2; const am = (a1 + a2) / 2;
      const p1 = [cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry]; const p2 = [cx + Math.cos(a2) * rx, cy + Math.sin(a2) * ry];
      const pm = [cx + Math.cos(am) * rx * 1.18, cy + Math.sin(am) * ry * 1.18];
      d += `${i ? '' : `M${f(p1[0])},${f(p1[1])} `}Q${f(pm[0])},${f(pm[1])} ${f(p2[0])},${f(p2[1])} `;
    }
    shape = `${d}Z`;
  } else {
    shape = `M${f(cx - rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 1 ${f(cx + rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 1 ${f(cx - rx)},${f(cy)} Z`;
  }
  const dash = type === 'murmure' ? ` stroke-dasharray="${f(size * 0.32)} ${f(size * 0.22)}"` : '';
  // Contour : queue + bulle fusionnées (contour d'abord, remplissage ensuite)
  s += `${tailD ? `<path d="${tailD}" fill="${ink}" stroke="${ink}" stroke-width="${f(sw)}" stroke-linejoin="round"${dash}/>` : ''}
    <path d="${shape}" fill="${ink}" stroke="${ink}" stroke-width="${f(sw)}" stroke-linejoin="round"${dash}/>
    ${tailD ? `<path d="${tailD}" fill="${fill}"/>` : ''}<path d="${shape}" fill="${fill}"/>`;
  if (dash) s += `<path d="${shape}" fill="none" stroke="${fill}" stroke-width="${f(sw * 0.45)}"/>`;
  const weight = type === 'cri' ? 900 : 700;
  const family = type === 'cri' ? DISPLAY : FONT;
  s += `<text x="${f(cx)}" y="${f(cy - th / 2 + lh * 0.78)}" text-anchor="middle" font-family="${family}" font-size="${f(size)}" font-weight="${weight}" fill="${b.color || INK}"${b.italic || type === 'murmure' ? ' font-style="italic"' : ''}>
    ${lines.map((l, i) => `<tspan x="${f(cx)}" dy="${i ? f(lh) : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  return s;
}

/** Géométrie d'un cartouche : rectangle compact (x, y = coin haut-gauche, ou haut-droit si right). */
export function captionGeom(cp, box) {
  const size = cp.size || autoTextSize(box, 'caption');
  const perChar = size * 0.56;
  const padX = size * 0.5; const padY = size * 0.36;
  const maxW = (cp.w ?? 0.6) * box.w;
  const lines = wrap(cp.text, Math.max(8, Math.floor((maxW - padX * 2) / perChar)));
  const lh = size * 1.2;
  const w = Math.min(maxW, Math.max(...lines.map((l) => l.length)) * perChar + padX * 2);
  const h = lines.length * lh + padY * 2;
  let x = box.x + (cp.x ?? 0.03) * box.w; const y = box.y + (cp.y ?? 0.03) * box.h;
  if (cp.right) x = box.x + box.w - w - (cp.x ?? 0.03) * box.w;
  return { size, lines, lh, w, h, x, y, padX, padY, cover: (w * h) / (box.area || box.w * box.h) };
}

/** Cartouche de narration : { text, x, y, w, size, right, style: 'jaune'|'noir'|'blanc'|'rouge' }. */
function caption(cp, box) {
  const { size, lines, lh, w, h, x, y, padX, padY } = captionGeom(cp, box);
  const st = { jaune: ['#fff1a8', INK], noir: ['#0d0a12', '#f4efe6'], blanc: ['#ffffff', INK], rouge: ['#b8221c', '#fff'] }[cp.style || 'jaune'];
  const sh = size * 0.15;
  return `<rect x="${f(x + sh)}" y="${f(y + sh)}" width="${f(w)}" height="${f(h)}" fill="#000" opacity=".35"/>
    <rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${st[0]}" stroke="${INK}" stroke-width="${f(Math.max(2.5, size * 0.12))}"/>
    <text x="${f(x + padX)}" y="${f(y + padY + lh * 0.78)}" font-family="${FONT}" font-size="${f(size)}" font-weight="700" font-style="italic" fill="${st[1]}">
      ${lines.map((l, i) => `<tspan x="${f(x + padX)}" dy="${i ? f(lh) : 0}">${esc(l)}</tspan>`).join('')}</text>`;
}

/** Géométrie d'une onomatopée : centre, taille, angle et coins du rectangle (tourné). */
export function sfxGeom(o, box) {
  const x = box.x + (o.x ?? 0.5) * box.w; const y = box.y + (o.y ?? 0.5) * box.h;
  const size = o.size || 90;
  const rot = o.rot ?? -10;
  const hw = (String(o.text).length * size * 0.74) / 2 + size * 0.16; // demi-largeur (police Unbounded + contour)
  const top = size * 0.95; const bot = size * 0.3; // au-dessus / en dessous de la ligne de base
  const a = (rot * Math.PI) / 180; const c = Math.cos(a); const s = Math.sin(a);
  const corners = [[-hw, -top], [hw, -top], [hw, bot], [-hw, bot]].map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
  return { x, y, size, rot, corners, cover: (hw * 2 * (top + bot)) / (box.area || box.w * box.h) };
}

/**
 * Géométrie d'un TEXTE EN SURIMPRESSION (posé sur l'illustration : nom de quartier, date…).
 * l = { text, x, y, size, style: 'nom' | 'date' | 'main', color, rot } ; x, y = centre du texte (fractions de la case).
 * 'main' : écrit à la main sur un croquis de l'appli (encre bleue ou color).
 */
export function labelGeom(l, box) {
  const date = l.style === 'date';
  const size = l.size || Math.round(autoTextSize(box, 'caption') * (date ? 0.72 : 0.9));
  const text = fillVars(l.text);
  const w = text.length * size * 0.62 + size * 0.4; const h = size * 1.3;
  const x = box.x + (l.x ?? 0.5) * box.w; const y = box.y + (l.y ?? 0.5) * box.h;
  return { size, text, x, y, x0: x - w / 2, y0: y - h / 2, w, h, cover: (w * h) / (box.area || box.w * box.h) };
}

/** Texte en surimpression, style écran de tablette : texte clair, contour sombre (lisible sur toute image). */
function label(l, box) {
  const { size, text, x, y } = labelGeom(l, box);
  // Écriture à la main sur un croquis de l'appli : encre bleue (ou de la couleur du trait), halo papier.
  if (l.style === 'main') {
    const ink = /^#[0-9a-f]{6}$/i.test(l.color || '') ? l.color : '#1d3a8a';
    return `<text x="${f(x)}" y="${f(y + size * 0.36)}" text-anchor="middle" font-family="'Comic Sans MS','Segoe Print',cursive" font-size="${f(size)}" font-weight="700" fill="${ink}" stroke="#f4f1e8" stroke-width="${f(size * 0.3)}" stroke-linejoin="round" paint-order="stroke" transform="rotate(${l.rot ?? -2} ${f(x)} ${f(y)})">${esc(text)}</text>`;
  }
  const date = l.style === 'date';
  const fill = /^#[0-9a-f]{6}$/i.test(l.color || '') ? l.color : date ? '#ffd5db' : '#f2f8ff';
  return `<text x="${f(x)}" y="${f(y + size * 0.36)}" text-anchor="middle" font-family="${FONT}" font-size="${f(size)}" font-weight="800"${date ? ' font-style="italic"' : ''} letter-spacing="${f(size * 0.02)}" fill="${fill}" stroke="#05070f" stroke-width="${f(size * 0.24)}" stroke-linejoin="round" paint-order="stroke">${esc(text)}</text>`;
}

/** Mélange deux couleurs hex (k = part de la seconde). */
function mixHex(a, b, k) {
  const pa = parseInt(a.slice(1), 16); const pb = parseInt(b.slice(1), 16);
  const ch = (n, sh) => Math.round(((n >> sh) & 255) * (1 - k) + ((pb >> sh) & 255) * k);
  return `#${[16, 8, 0].map((sh) => ch(pa, sh).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Onomatopée dessinée : { text, x, y, size, rot, color, skew }
 * Style BD net : ombre portée dure, double contour (encre + blanc) à angles vifs,
 * remplissage en dégradé avec un reflet ; à l'écran, elle "claque" en apparaissant
 * (.bd-sfx, voir views.css).
 */
function sfx(o, box) {
  const { x, y, size, rot } = sfxGeom(o, box);
  const col = /^#[0-9a-f]{6}$/i.test(o.color || '') ? o.color : '#ffd23f';
  const t = `translate(${f(x)},${f(y)}) rotate(${rot}) skewX(${o.skew ?? -8})`;
  const letters = [...String(o.text)];
  let tx = '';
  // Lettres de tailles légèrement différentes : plus vivant qu'un texte plat
  letters.forEach((ch, i) => { const k = 1 + ((i * 37) % 7) / 30 - 0.08; tx += `<tspan font-size="${f(size * k)}">${esc(ch)}</tspan>`; });
  const id = uid('sx');
  const txt = (attrs) => `<text text-anchor="middle" font-family="${DISPLAY}" font-weight="900" ${attrs}>${tx}</text>`;
  const sh = size * 0.07;
  // Traits d'impact autour du mot (style manga) : fins, effilés, à l'encre
  const hw = (letters.length * size * 0.74) / 2;
  let accents = '';
  for (let k = 0; k < 6; k++) {
    const side = k < 3 ? -1 : 1; const j = k % 3;
    const ax = side * (hw + size * (0.1 + j * 0.04)); const ay = -size * (0.75 - j * 0.42);
    const a = Math.atan2(ay + size * 0.3, ax); const L = size * (0.42 - j * 0.07);
    const bx = ax + Math.cos(a) * L; const by = ay + Math.sin(a) * L;
    const nx = -Math.sin(a) * size * 0.05; const ny = Math.cos(a) * size * 0.05;
    accents += `<path d="M${f(ax + nx)},${f(ay + ny)} L${f(bx)},${f(by)} L${f(ax - nx)},${f(ay - ny)} Z" fill="${INK}" stroke="#fff" stroke-width="${f(size * 0.04)}" stroke-linejoin="round" paint-order="stroke"/>`;
  }
  return `<g transform="${t}"><g class="bd-sfx">
    <defs><linearGradient id="${id}" x1="0" y1="${f(-size * 0.9)}" x2="0" y2="${f(size * 0.2)}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${mixHex(col, '#ffffff', 0.6)}"/><stop offset=".44" stop-color="${mixHex(col, '#ffffff', 0.35)}"/><stop offset=".46" stop-color="${col}"/><stop offset="1" stop-color="${mixHex(col, '#000000', 0.4)}"/></linearGradient></defs>
    ${accents}
    ${txt(`transform="translate(${f(sh)},${f(sh)})" fill="${INK}" stroke="${INK}" stroke-width="${f(size * 0.3)}" stroke-linejoin="miter" stroke-miterlimit="3"`)}
    ${txt(`fill="#fff" stroke="#fff" stroke-width="${f(size * 0.3)}" stroke-linejoin="miter" stroke-miterlimit="3"`)}
    ${txt(`fill="${INK}" stroke="${INK}" stroke-width="${f(size * 0.17)}" stroke-linejoin="miter" stroke-miterlimit="3"`)}
    ${txt(`fill="url(#${id})"`)}
  </g></g>`;
}

/** Dégradé d'éclairage par-dessus la case (donne de la profondeur, ton plus mature). */
function grading(time, w, h) {
  const id = uid('gr');
  const top = { nuit: ['#3b2a8a', 0.18], couchant: ['#ff8a3d', 0.14], aube: ['#ffb38a', 0.12], pluie: ['#9aa3ad', 0.1], jour: ['#fff4dc', 0.1] }[time] || ['#fff4dc', 0.08];
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0.25" y2="1"><stop offset="0" stop-color="${top[0]}" stop-opacity="${top[1]}"/><stop offset=".55" stop-color="${top[0]}" stop-opacity="0"/><stop offset="1" stop-color="#05030a" stop-opacity="${time === 'nuit' ? 0.4 : 0.22}"/></linearGradient></defs><rect width="${f(w)}" height="${f(h)}" fill="url(#${id})"/>`;
}

// ---------------------------------------------------------------------
// UNE CASE
// ---------------------------------------------------------------------
export function assetUrl(p) {
  return /^(https?:|data:)/.test(p) ? p : import.meta.env.BASE_URL + String(p).replace(/^\//, '');
}

/**
 * Recadrage d'une illustration (iw × ih) pour REMPLIR une case (w × h), en gardant
 * le point focal (fx, fy, entre 0 et 1 dans l'image) le plus près possible du centre.
 * Le résultat ne dépend pas de l'écran : la page a toujours le même repère (1000 × 1500).
 * zoom (facultatif, ≥ 1) : agrandit l'image autour du point focal (ex. carte dont on veut lire les noms) ;
 * à garder modéré (≈ 1,5 max) : au-delà l'image est agrandie, donc moins nette (voir verifier-nettete).
 * @returns {{ x, y, dw, dh, toPanel([u, v]) → [x, y] en fractions de la case }}
 */
export function cropImage(w, h, iw, ih, focus = [0.5, 0.5], zoom = 1) {
  if (!iw || !ih) iw = w, ih = h; // dimensions inconnues : recadrage centré
  const s = Math.max(w / iw, h / ih) * Math.max(1, zoom || 1); // zoom > 1 : on agrandit autour du point focal
  const dw = iw * s; const dh = ih * s;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const x = clamp(w / 2 - focus[0] * dw, w - dw, 0);
  const y = clamp(h / 2 - focus[1] * dh, h - dh, 0);
  return { x, y, dw, dh, toPanel: ([u, v]) => [(x + u * dw) / w, (y + v * dh) / h] };
}

/** Aire d'un polygone (formule du lacet). */
const polyArea = (poly) => Math.abs(poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;

/** Prépare une case : cadre, illustration éventuelle, position des bouches/têtes. */
export function panelInfo(panel, poly, idx, pageIdx, chapterId) {
  const box = { ...bboxOf(poly), area: polyArea(poly) };
  const story = storyImage(chapterId, pageIdx, idx);
  // Taille d'image adaptée à l'écran (600 / 900 / 1200 px), voir story-images.js.
  const src = (story && pickSrc(story, box, panel.illus?.zoom)) || panel.image || null;
  const il = panel.illus || {};
  const crop = src ? cropImage(box.w, box.h, story?.w, story?.h, il.focus, il.zoom) : null;
  return { box, src, crop, illus: il, lqip: story?.lqip || '' };
}

function renderPanel(panel, poly, idx, pageIdx, chapterId) {
  const { box, src: image, crop, illus, lqip } = panelInfo(panel, poly, idx, pageIdx, chapterId);
  const { w, h } = box;
  const clip = uid('pc');
  const r = rng((pageIdx + 1) * 97 + idx * 13);
  const bg = panel.bg || { id: 'aplat' };
  const time = bg.time || 'jour';
  let inner = '';
  const heads = [];
  const overflow = [];
  // zones « visage » (repères de la case) en coordonnées de la case : les queues de bulles s'arrêtent devant
  const faces = image ? (illus.keep || []).filter((k) => /visage|tête/i.test(k[4] || '')).map(([a, b, c, d]) => { const p0 = crop.toPanel([a, b]); const p1 = crop.toPanel([c, d]); return [p0[0] * w, p0[1] * h, p1[0] * w, p1[1] * h]; }) : [];
  if (image) {
    // Illustration recadrée pour remplir la case, en gardant le point focal
    // (panel.illus.focus). Les persos ne sont pas dessinés : les bulles visent
    // les bouches notées dans panel.illus.mouths (sinon la position du perso).
    // 1) APERÇU FLOU (inclus dans l'appli) : affiché immédiatement ;
    // 2) image nette par-dessus, invisible jusqu'à son chargement puis en fondu
    //    (classe story-full, rendue visible par revealImages()).
    const at = `x="${f(crop.x)}" y="${f(crop.y)}" width="${f(crop.dw)}" height="${f(crop.dh)}" preserveAspectRatio="none"`;
    if (lqip) {
      const blur = uid('bl');
      inner = `<filter id="${blur}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${f(Math.max(crop.dw, crop.dh) / 60)}" edgeMode="duplicate"/></filter>
        <image href="${lqip}" ${at} filter="url(#${blur})"/>
        <image class="story-full" data-href="${esc(assetUrl(image))}" ${at}/>`;
    } else {
      inner = `<image href="${esc(assetUrl(image))}" ${at}/>`;
    }
    (panel.chars || []).forEach((c, i) => {
      const m = illus.mouths?.[i];
      if (m) { const [u, v] = crop.toPanel(m); heads.push([u * w, v * h]); return; }
      heads.push(figure(c, w, h, time).head);
    });
    // Effets par-dessus l'image (sauf les lueurs "de fond", prévues derrière les persos),
    // sans recouvrir les zones protégées (visages, action…).
    const avoid = (illus.keep || []).map(([a, b, c, d]) => { const p0 = crop.toPanel([a, b]); const p1 = crop.toPanel([c, d]); return [p0[0] * w, p0[1] * h, p1[0] * w, p1[1] * h]; });
    for (const fx of (panel.fx || []).filter((x) => x.layer !== 'back')) inner += effect(fx, w, h, r, avoid);
  } else {
    inner = decorSVG(bg.id, w, h, { ...bg, seed: bg.seed ?? (idx + 3) * (pageIdx + 2) });
    for (const fx of (panel.fx || []).filter((x) => x.layer === 'back' || ['concentration', 'vitesse'].includes(x.type) && x.layer !== 'front')) inner += effect(fx, w, h, r);
    (panel.chars || []).forEach((c) => {
      const fig = figure(c, w, h, time);
      heads.push(fig.head);
      inner += fig.back;
      if (c.break) overflow.push(fig.svg); else inner += fig.svg;
    });
    // Étalonnage "cinéma" : dégradé de lumière + léger assombrissement en bas
    inner += grading(time, w, h);
    for (const fx of (panel.fx || []).filter((x) => !(x.layer === 'back' || ['concentration', 'vitesse'].includes(x.type) && x.layer !== 'front'))) inner += effect(fx, w, h, r);
  }
  // FORMULES écrites « à la main » par-dessus la case (rendu KaTeX, légèrement lumineuses).
  //   panel.formules = [{ tex, x, y, size, rot, color }]
  //   x, y : centre de la formule (fractions de l'IMAGE si la case est illustrée, sinon de la case) ;
  //   size : taille du texte (fraction de la largeur de l'image / de la case) ; rot : inclinaison (°).
  for (const fm of panel.formules || []) {
    const [cx, cy] = image && crop ? crop.toPanel([fm.x, fm.y]).map((v, i) => v * (i ? h : w)) : [fm.x * w, fm.y * h];
    const fs = (fm.size ?? 0.02) * (image && crop ? crop.dw : w);
    const bw = fs * 14; const bh = fs * 3;
    inner += `<foreignObject x="${f(cx - bw / 2)}" y="${f(cy - bh / 2)}" width="${f(bw)}" height="${f(bh)}" style="overflow:visible;pointer-events:none">
      <div xmlns="http://www.w3.org/1999/xhtml" class="bd-formule" style="font-size:${f(fs)}px;--ink:${fm.color || '#e9d5ff'};transform:rotate(${fm.rot ?? -3}deg) skewX(-6deg)">${mathInline(fm.tex)}</div></foreignObject>`;
  }
  const local = (s) => `<g transform="translate(${f(box.x)},${f(box.y)})">${s}</g>`;
  let out = `<g class="panel" data-i="${idx}">
    <clipPath id="${clip}"><path d="${polyD(poly)}"/></clipPath>
    <g clip-path="url(#${clip})">${local(inner)}</g>
    <path d="${polyD(poly)}" fill="none" stroke="${INK}" stroke-width="${BORDER}" stroke-linejoin="round"/>`;
  // Personnages qui DÉBORDENT du cadre (moments forts)
  if (overflow.length) out += local(overflow.join(''));
  out += '</g>';
  // Textes au-dessus de tout (chacun dans un groupe repérable par l'éditeur de bulles)
  let text = '';
  const tag = (k, i, s) => `<g data-edit="${idx}:${k}:${i}">${s}</g>`;
  (panel.labels || []).forEach((l, i) => { text += tag('labels', i, label(l, box)); });
  (panel.sfx || []).forEach((s, i) => { text += tag('sfx', i, sfx(s, box)); });
  (panel.captions || []).forEach((c, i) => { text += tag('captions', i, caption(c, box)); });
  (panel.bubbles || []).forEach((b, i) => { text += tag('bubbles', i, bubble(b, box, heads, faces)); });
  return { svg: out, text, box, heads, illustrated: !!image, crop };
}

/**
 * Fait apparaître en fondu chaque image nette (.story-full) dès qu'elle est
 * téléchargée et décodée ; en attendant, l'aperçu flou reste visible.
 * Ordre : la case `first` (celle qu'on regarde) SEULE, puis toutes les autres.
 * @returns {Promise} résolue quand toutes les images de la page sont prêtes
 */
export function revealImages(root, first = 0) {
  const els = [...root.querySelectorAll('image.story-full[data-href]')];
  if (!els.length) return Promise.resolve();
  const order = [...els.splice(Math.min(first, els.length - 1), 1), ...els];
  // L'image est posée tout de suite (déjà en cache : elle s'affiche aussitôt) ;
  // le fondu démarre dès que le navigateur l'a chargée.
  const show = (el) => new Promise((done) => {
    const ok = () => { el.classList.add('on'); done(); };
    el.addEventListener('load', ok, { once: true });
    el.addEventListener('error', ok, { once: true });
    el.setAttribute('href', el.dataset.href);
    el.removeAttribute('data-href');
  });
  return show(order[0]).then(() => Promise.all(order.slice(1).map(show)));
}

/**
 * Dessine une page complète.
 * @param chapterId numéro du chapitre (pour trouver les illustrations public/story/…)
 * @returns {{ svg: string, panels: Array<{box, poly, sound}> }}
 */
export function renderPage(page, pageIdx = 0, chapterId = 0) {
  const grid = layoutPage(page);
  const list = page.panels || [];
  const panels = [];
  let body = '';
  let texts = '';
  list.forEach((p, i) => {
    let poly = grid[i];
    if (p.r) { const [x, y, w, h] = p.r; poly = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
    if (!poly) return;
    const r = renderPanel(p, poly, i, pageIdx, chapterId);
    body += r.svg;
    texts += r.text;
    panels.push({ box: r.box, poly, heads: r.heads, crop: r.crop, illustrated: r.illustrated, sound: p.sound, sfxSound: p.sfxSound });
  });
  const bg = page.gutter === 'noir' ? '#0a0810' : '#f7f4ee';
  const pageClip = uid('pg');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PAGE_W} ${PAGE_H}" class="comic-page">
    <clipPath id="${pageClip}"><rect width="${PAGE_W}" height="${PAGE_H}"/></clipPath>
    <rect width="${PAGE_W}" height="${PAGE_H}" fill="${bg}"/>
    <g clip-path="url(#${pageClip})">${body}${texts}</g>
    ${page.number !== false ? `<text x="${PAGE_W / 2}" y="${PAGE_H - 8}" text-anchor="middle" font-family="${FONT}" font-size="16" fill="${page.gutter === 'noir' ? '#776f88' : '#9a948a'}">${pageIdx + 1}</text>` : ''}
  </svg>`;
  return { svg, panels };
}
