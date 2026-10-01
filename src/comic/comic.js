// =====================================================================
// comic.js — MOTEUR DE PAGES DE BD
// ---------------------------------------------------------------------
// Une PAGE (1000 × 1500) = une grille de CASES (rangées × colonnes, bords
// droits ou en biais) + des cases libres (incrustations).
// Une CASE = décor + personnages (pose, expression, cadrage) + effets
//            + bulles + cartouches + onomatopées.
// Tout est décrit dans les fichiers de chapitres (src/data/comic/chapitres/).
//
// Une case peut être REMPLACÉE par une illustration dessinée plus tard :
// mets `image: 'bd/ch01/p1-c1.webp'` (fichier dans public/bd/…). Les bulles
// et cartouches restent dessinées par-dessus (le texte reste modifiable).
// =====================================================================

import { bodySVG, INK } from './body.js';
import { decorSVG, gradeFor, rng } from './decors.js';
import { oubliSVG } from './entities.js';
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
const SPANS = { americain: 470, taille: 360, buste: 255, gros: 175, yeux: 70 };
function figure(c, w, h, time) {
  let grade = gradeFor(time);
  if (c.light === 'contre') grade = gradeFor(time, ['#0d0718', 0.72]);
  else if (c.light && c.light.startsWith?.('#')) grade = gradeFor(time, [c.light, 0.13]); // léger : la peau garde sa couleur
  let r;
  if (c.id === 'oubli') r = oubliSVG(c.pose, { seed: c.seed });
  else if (CHARACTERS[c.id] || EXTRA_LOOKS[c.id]) r = bodySVG(c.id, c.pose || 'debout', { expr: c.expr, grade });
  else return { svg: '', back: '', head: [0, 0] };
  const flip = c.flip ? -1 : 1;
  let sc; let tx = (c.x ?? 0.5) * w; let ty;
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
  return { svg, back, head };
}

// ---------------------------------------------------------------------
// EFFETS de case
// ---------------------------------------------------------------------
function effect(fx, w, h, r) {
  const col = fx.color || INK;
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
    case 'teinte': return `<rect width="${w}" height="${h}" fill="${fx.color || '#000'}" opacity="${fx.opacity ?? 0.3}"/>`;
    case 'glitch': { // l'Oubli efface : rectangles et bandes décalées
      let s = '';
      for (let i = 0; i < (fx.n || 26); i++) {
        const gw = w * (0.05 + r() * 0.3); const gh = h * (0.01 + r() * 0.05);
        s += `<rect x="${f(r() * w)}" y="${f(r() * h)}" width="${f(gw)}" height="${f(gh)}" fill="${['#7c3aed', '#0b0614', '#c4b5fd', '#22d3ee'][Math.floor(r() * 4)]}" opacity="${f(0.35 + r() * 0.5)}"/>`;
      }
      return s;
    }
    default: return '';
  }
}

// ---------------------------------------------------------------------
// BULLES, CARTOUCHES, ONOMATOPÉES (au niveau de la page)
// ---------------------------------------------------------------------
function wrap(text, maxChars) {
  // Espace insécable devant ! ? : ; » (le signe reste collé au mot).
  const words = String(text).replace(/ ([!?:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0').split(/[ \t\n]+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const wd of words) { if ((cur + ' ' + wd).trim().length > maxChars && cur) { lines.push(cur); cur = wd; } else cur = (cur + ' ' + wd).trim(); }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * b = { type, text, x, y, w, who, tail, size }
 *   type : 'parole' | 'pensee' | 'cri' | 'murmure'
 *   x, y : centre de la bulle dans la case (0-1) ; w : largeur max (0-1)
 *   who  : index du perso qui parle (la queue pointe vers sa tête)
 *   tail : [x, y] cible manuelle de la queue (0-1, dans la case), ou false
 */
function bubble(b, box, heads) {
  const type = b.type || 'parole';
  const size = b.size || (type === 'cri' ? 36 : 31);
  const maxW = (b.w ?? 0.5) * box.w;
  const perChar = size * 0.52;
  const lines = wrap(b.text, Math.max(8, Math.floor(maxW / perChar)));
  const tw = Math.max(...lines.map((l) => l.length)) * perChar;
  const lh = size * 1.18;
  const th = lines.length * lh;
  const cx = box.x + (b.x ?? 0.5) * box.w; const cy = box.y + (b.y ?? 0.2) * box.h;
  const big = type === 'cri' ? 1.18 : 1;
  const rx = (tw / 2 + size * 0.95) * big; const ry = (th / 2 + size * 0.75) * big;
  const fill = b.fill || '#fff';
  const ink = b.ink || INK;
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
    const edge = Math.min(L * 0.75, Math.hypot(rx * ux, ry * uy) + Math.min(110, L * 0.35));
    const tip = [cx + ux * edge, cy + uy * edge];
    const nx = -uy; const ny = ux; const bw = Math.min(rx, ry) * 0.32;
    if (type === 'pensee') {
      for (let i = 1; i <= 3; i++) { const t = 0.35 + i * 0.22; s += `<circle cx="${f(cx + (tip[0] - cx) * t)}" cy="${f(cy + (tip[1] - cy) * t)}" r="${f(size * (0.55 - i * 0.12))}" fill="${fill}" stroke="${ink}" stroke-width="3"/>`; }
    } else {
      tailD = `M${f(cx + nx * bw)},${f(cy + ny * bw)} Q${f((cx + tip[0]) / 2 + nx * bw * 0.3)},${f((cy + tip[1]) / 2 + ny * bw * 0.3)} ${f(tip[0])},${f(tip[1])} Q${f((cx + tip[0]) / 2 - nx * bw * 0.1)},${f((cy + tip[1]) / 2 - ny * bw * 0.1)} ${f(cx - nx * bw)},${f(cy - ny * bw)} Z`;
    }
  }
  // Forme de la bulle
  let shape;
  if (type === 'cri') {
    const n = 22; let d = '';
    const R = rng(Math.round(cx + cy));
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2; const k = i % 2 ? 1.0 : 1.25 + R() * 0.18; d += `${i ? 'L' : 'M'}${f(cx + Math.cos(a) * rx * k)},${f(cy + Math.sin(a) * ry * k)} `; }
    shape = `${d}Z`;
  } else if (type === 'pensee') {
    const n = 11; let d = '';
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2; const a2 = ((i + 1) / n) * Math.PI * 2; const am = (a1 + a2) / 2;
      const p1 = [cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry]; const p2 = [cx + Math.cos(a2) * rx, cy + Math.sin(a2) * ry];
      const pm = [cx + Math.cos(am) * rx * 1.28, cy + Math.sin(am) * ry * 1.28];
      d += `${i ? '' : `M${f(p1[0])},${f(p1[1])} `}Q${f(pm[0])},${f(pm[1])} ${f(p2[0])},${f(p2[1])} `;
    }
    shape = `${d}Z`;
  } else {
    shape = `M${f(cx - rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 1 ${f(cx + rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 1 ${f(cx - rx)},${f(cy)} Z`;
  }
  const dash = type === 'murmure' ? ' stroke-dasharray="10 7"' : '';
  // Contour : queue + bulle fusionnées (contour d'abord, remplissage ensuite)
  s += `${tailD ? `<path d="${tailD}" fill="${ink}" stroke="${ink}" stroke-width="7" stroke-linejoin="round"${dash}/>` : ''}
    <path d="${shape}" fill="${ink}" stroke="${ink}" stroke-width="7" stroke-linejoin="round"${dash}/>
    ${tailD ? `<path d="${tailD}" fill="${fill}"/>` : ''}<path d="${shape}" fill="${fill}"/>`;
  if (dash) s += `<path d="${shape}" fill="none" stroke="${fill}" stroke-width="3"/>`;
  const weight = type === 'cri' ? 900 : 700;
  const family = type === 'cri' ? DISPLAY : FONT;
  s += `<text x="${f(cx)}" y="${f(cy - th / 2 + lh * 0.78)}" text-anchor="middle" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${b.color || INK}"${b.italic || type === 'murmure' ? ' font-style="italic"' : ''}>
    ${lines.map((l, i) => `<tspan x="${f(cx)}" dy="${i ? f(lh) : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  return s;
}

/** Cartouche de narration : { text, x, y, w, style: 'jaune'|'noir'|'blanc' } (x, y = coin haut-gauche). */
function caption(cp, box) {
  const size = cp.size || 27;
  const maxW = (cp.w ?? 0.6) * box.w;
  const lines = wrap(cp.text, Math.max(10, Math.floor((maxW - 30) / (size * 0.5))));
  const lh = size * 1.22;
  const w = Math.min(maxW, Math.max(...lines.map((l) => l.length)) * size * 0.5 + 34);
  const h = lines.length * lh + 24;
  let x = box.x + (cp.x ?? 0.03) * box.w; let y = box.y + (cp.y ?? 0.03) * box.h;
  if (cp.right) x = box.x + box.w - w - (cp.x ?? 0.03) * box.w;
  const st = { jaune: ['#fff1a8', INK], noir: ['#0d0a12', '#f4efe6'], blanc: ['#ffffff', INK], rouge: ['#b8221c', '#fff'] }[cp.style || 'jaune'];
  return `<rect x="${f(x + 5)}" y="${f(y + 5)}" width="${f(w)}" height="${f(h)}" fill="#000" opacity=".35"/>
    <rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${st[0]}" stroke="${INK}" stroke-width="3.5"/>
    <text x="${f(x + 16)}" y="${f(y + 12 + lh * 0.78)}" font-family="${FONT}" font-size="${size}" font-weight="700" font-style="italic" fill="${st[1]}">
      ${lines.map((l, i) => `<tspan x="${f(x + 16)}" dy="${i ? f(lh) : 0}">${esc(l)}</tspan>`).join('')}</text>`;
}

/** Onomatopée dessinée : { text, x, y, size, rot, color, skew } */
function sfx(o, box) {
  const x = box.x + (o.x ?? 0.5) * box.w; const y = box.y + (o.y ?? 0.5) * box.h;
  const size = o.size || 90;
  const col = o.color || '#ffd23f';
  const t = `translate(${f(x)},${f(y)}) rotate(${o.rot ?? -10}) skewX(${o.skew ?? -8})`;
  const letters = [...String(o.text)];
  let tx = '';
  // Lettres de tailles légèrement différentes : plus vivant qu'un texte plat
  letters.forEach((ch, i) => { const k = 1 + ((i * 37) % 7) / 30 - 0.08; tx += `<tspan font-size="${f(size * k)}">${esc(ch)}</tspan>`; });
  return `<g transform="${t}">
    <text text-anchor="middle" font-family="${DISPLAY}" font-weight="900" fill="#fff" stroke="#fff" stroke-width="${f(size * 0.32)}" stroke-linejoin="round">${tx}</text>
    <text text-anchor="middle" font-family="${DISPLAY}" font-weight="900" fill="${INK}" stroke="${INK}" stroke-width="${f(size * 0.2)}" stroke-linejoin="round">${tx}</text>
    <text text-anchor="middle" font-family="${DISPLAY}" font-weight="900" fill="${col}">${tx}</text></g>`;
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
function assetUrl(p) {
  return /^(https?:|data:)/.test(p) ? p : import.meta.env.BASE_URL + String(p).replace(/^\//, '');
}

function renderPanel(panel, poly, idx, pageIdx) {
  const box = bboxOf(poly);
  const { w, h } = box;
  const clip = uid('pc');
  const r = rng((pageIdx + 1) * 97 + idx * 13);
  const bg = panel.bg || { id: 'aplat' };
  const time = bg.time || 'jour';
  let inner = '';
  const heads = [];
  const overflow = [];
  if (panel.image) {
    inner = `<image href="${esc(assetUrl(panel.image))}" x="0" y="0" width="${f(w)}" height="${f(h)}" preserveAspectRatio="xMidYMid slice"/>`;
    (panel.chars || []).forEach((c) => {
      const fig = figure(c, w, h, time);
      heads.push(fig.head);
    });
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
  const local = (s) => `<g transform="translate(${f(box.x)},${f(box.y)})">${s}</g>`;
  let out = `<g class="panel" data-i="${idx}">
    <clipPath id="${clip}"><path d="${polyD(poly)}"/></clipPath>
    <g clip-path="url(#${clip})">${local(inner)}</g>
    <path d="${polyD(poly)}" fill="none" stroke="${INK}" stroke-width="${BORDER}" stroke-linejoin="round"/>`;
  // Personnages qui DÉBORDENT du cadre (moments forts)
  if (overflow.length) out += local(overflow.join(''));
  out += '</g>';
  // Textes au-dessus de tout
  let text = '';
  for (const s of panel.sfx || []) text += sfx(s, box);
  for (const c of panel.captions || []) text += caption(c, box);
  for (const b of panel.bubbles || []) text += bubble(b, box, heads);
  return { svg: out, text, box };
}

/**
 * Dessine une page complète.
 * @returns {{ svg: string, panels: Array<{box, poly, sound}> }}
 */
export function renderPage(page, pageIdx = 0) {
  const grid = layoutPage(page);
  const list = page.panels || [];
  const panels = [];
  let body = '';
  let texts = '';
  list.forEach((p, i) => {
    let poly = grid[i];
    if (p.r) { const [x, y, w, h] = p.r; poly = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
    if (!poly) return;
    const r = renderPanel(p, poly, i, pageIdx);
    body += r.svg;
    texts += r.text;
    panels.push({ box: r.box, poly, sound: p.sound, sfxSound: p.sfxSound });
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
