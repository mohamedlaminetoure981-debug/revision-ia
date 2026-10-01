// =====================================================================
// decors.js — DÉCORS DE LA BD (Conakry), dessinés en SVG
// ---------------------------------------------------------------------
// Chaque décor est une fonction (largeur, hauteur, options) → SVG.
// Options communes :
//   time    : 'aube' | 'jour' | 'couchant' | 'nuit' | 'pluie'
//   horizon : hauteur de l'horizon (0 = haut de la case, 1 = bas). Horizon
//             bas = contre-plongée (on regarde vers le haut), haut = plongée.
//   vp      : point de fuite horizontal (0 = gauche, 1 = droite)
//   seed    : nombre pour varier les détails (fenêtres, nuages…)
//   text    : texte (décor 'ecran' : message du téléphone)
//
// Perspective : un objet à la profondeur z (1 = tout près, 40 = très loin)
// est dessiné avec une taille ∝ 1/z, et il se fond dans la brume au loin.
//
// ➕ Ajouter un décor : écris une fonction `monDecor(w, h, o)` qui renvoie
//    du SVG, puis ajoute-la dans DECORS tout en bas du fichier.
// =====================================================================

import { mixHex, INK } from './body.js';

// ---------------------------------------------------------------------
// Ambiances selon l'heure
// ---------------------------------------------------------------------
export const TIMES = {
  aube: { top: '#283766', mid: '#b9789a', low: '#ffc89a', sun: '#fff3cf', haze: '#e9b3a6', ground: '#8a7a74', light: '#ffd9a8', night: false, tint: ['#c87b9b', 0.12] },
  jour: { top: '#2f86d6', mid: '#86c3ef', low: '#e8f4fb', sun: '#fffbe6', haze: '#cfe4f2', ground: '#b9a58c', light: '#fff4dc', night: false, tint: null },
  couchant: { top: '#25195a', mid: '#c4406a', low: '#ffab4a', sun: '#ffe58c', haze: '#f0956a', ground: '#7d5a52', light: '#ffb36b', night: false, tint: ['#ff7a30', 0.16] },
  nuit: { top: '#050817', mid: '#101c45', low: '#283672', sun: '#f4f1dc', haze: '#1f2b5c', ground: '#1d2238', light: '#ffcf7a', night: true, tint: ['#16204e', 0.38] },
  pluie: { top: '#2f3846', mid: '#5b6573', low: '#8d96a2', sun: '#d8dde3', haze: '#7d8794', ground: '#4a5260', light: '#ffe2a8', night: false, tint: ['#4f5d70', 0.25] },
};

/** Fonction de couleur appliquée aux personnages selon l'éclairage de la case. */
export function gradeFor(time, extra) {
  const T = TIMES[time] || TIMES.jour;
  const tint = extra || T.tint;
  if (!tint) return null;
  return (c) => mixHex(c, tint[0], tint[1]);
}

// ---------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------
/** Générateur pseudo-aléatoire reproductible (même seed = même dessin). */
export function rng(seed = 1) {
  let a = seed >>> 0 || 1;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const f = (n) => Math.round(n * 10) / 10;
let gid = 0;
const uid = (p) => `${p}${++gid}`;

/** Perspective : convertit (X, hauteur Y, profondeur z) → point écran. */
function cam(w, h, o) {
  const hz = h * (o.horizon ?? 0.55);
  const vx = w * (o.vp ?? 0.5);
  const k = Math.max(h - hz, h * 0.25) * (o.zoom || 1);
  return {
    hz, vx, k,
    x: (X, z) => vx + (X * k) / z,
    y: (Y, z) => hz + ((1 - Y) * k) / z,
    s: (z) => k / z,
  };
}

/** Ciel : dégradé, soleil ou lune, nuages, étoiles. */
function sky(w, h, T, o, r, hz) {
  const id = uid('sk');
  let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${T.top}"/><stop offset=".55" stop-color="${T.mid}"/><stop offset="1" stop-color="${T.low}"/></linearGradient></defs>
    <rect width="${w}" height="${f(hz + 2)}" fill="url(#${id})"/>`;
  if (T.night) {
    for (let i = 0; i < 70; i++) s += `<circle cx="${f(r() * w)}" cy="${f(r() * hz * 0.85)}" r="${f(r() * 1.6 + 0.3)}" fill="#fff" opacity="${f(0.3 + r() * 0.7)}"/>`;
    const mx = w * (o.sunX ?? 0.78); const my = hz * 0.28;
    const gl = uid('mg');
    s += `<defs><radialGradient id="${gl}"><stop offset="0" stop-color="#fffbe8" stop-opacity=".55"/><stop offset="1" stop-color="#fffbe8" stop-opacity="0"/></radialGradient></defs>
      <circle cx="${f(mx)}" cy="${f(my)}" r="${f(w * 0.09)}" fill="url(#${gl})"/>
      <circle cx="${f(mx)}" cy="${f(my)}" r="${f(w * 0.032)}" fill="${T.sun}"/>
      <circle cx="${f(mx + w * 0.012)}" cy="${f(my - w * 0.006)}" r="${f(w * 0.028)}" fill="${T.mid}" opacity=".9"/>`;
  } else if (o.time !== 'pluie') {
    const sx = w * (o.sunX ?? 0.72);
    const sy = o.time === 'jour' ? hz * 0.2 : hz * 0.82;
    const gl = uid('sg');
    s += `<defs><radialGradient id="${gl}"><stop offset="0" stop-color="${T.sun}" stop-opacity=".9"/><stop offset=".35" stop-color="${T.sun}" stop-opacity=".35"/><stop offset="1" stop-color="${T.sun}" stop-opacity="0"/></radialGradient></defs>
      <circle cx="${f(sx)}" cy="${f(sy)}" r="${f(w * 0.22)}" fill="url(#${gl})"/>
      <circle cx="${f(sx)}" cy="${f(sy)}" r="${f(w * 0.045)}" fill="${T.sun}"/>`;
  }
  // Nuages stylisés : aplat + dessous ombré
  const nc = o.time === 'pluie' ? 9 : o.time === 'nuit' ? 3 : 5;
  for (let i = 0; i < nc; i++) {
    const cx = r() * w; const cy = hz * (0.12 + r() * 0.55); const cw = w * (0.14 + r() * 0.22); const ch = cw * 0.22;
    const top = o.time === 'pluie' ? '#9aa3ad' : o.time === 'nuit' ? '#1d2a5c' : mixHex(T.low, '#ffffff', 0.55);
    const bot = o.time === 'pluie' ? '#6b7480' : mixHex(T.mid, T.top, 0.25);
    s += `<g opacity="${o.time === 'nuit' ? 0.7 : 0.92}"><path d="M${f(cx - cw / 2)},${f(cy)} Q${f(cx - cw * 0.35)},${f(cy - ch * 1.4)} ${f(cx - cw * 0.1)},${f(cy - ch)} Q${f(cx + cw * 0.05)},${f(cy - ch * 2)} ${f(cx + cw * 0.25)},${f(cy - ch * 1.1)} Q${f(cx + cw * 0.45)},${f(cy - ch * 1.3)} ${f(cx + cw / 2)},${f(cy)} Z" fill="${top}"/>
      <path d="M${f(cx - cw / 2)},${f(cy)} Q${f(cx)},${f(cy - ch * 0.5)} ${f(cx + cw / 2)},${f(cy)} Z" fill="${bot}"/></g>`;
  }
  return s;
}

/** Brume : rapproche une couleur de la couleur de l'horizon selon la distance. */
const haze = (c, T, z) => mixHex(c, T.haze, Math.min(0.78, z / 30));

/** Façade d'immeuble vue en fuite, entre les profondeurs z1 et z2, côté X. */
function facade(c, T, X, z1, z2, H, color, r, opts = {}) {
  const near = Math.min(z1, z2);
  const col = haze(color, T, near);
  const sh = mixHex(col, '#000000', 0.18);
  const p = [[c.x(X, z1), c.y(0, z1)], [c.x(X, z2), c.y(0, z2)], [c.x(X, z2), c.y(H, z2)], [c.x(X, z1), c.y(H, z1)]];
  let s = `<path d="M${p.map((q) => `${f(q[0])},${f(q[1])}`).join(' L')} Z" fill="${col}" stroke="${haze(INK, T, near + 6)}" stroke-width="${f(Math.max(0.6, 2.4 / near * 3))}"/>`;
  // Fenêtres (en fuite)
  const rows = Math.max(1, Math.floor(H / 0.55));
  const cols = Math.max(1, Math.floor(Math.abs(z2 - z1) / 0.9));
  const lit = T.night ? '#ffcf6b' : mixHex('#2a3550', T.haze, Math.min(0.6, near / 25));
  for (let i = 0; i < cols; i++) {
    const za = z1 + ((z2 - z1) * (i + 0.25)) / cols; const zb = z1 + ((z2 - z1) * (i + 0.7)) / cols;
    for (let j = 0; j < rows; j++) {
      const ya = (H * (j + 0.3)) / rows; const yb = (H * (j + 0.75)) / rows;
      if (opts.shop && j === 0) continue;
      const on = T.night ? r() < 0.55 : true;
      const q = [[c.x(X, za), c.y(ya, za)], [c.x(X, zb), c.y(ya, zb)], [c.x(X, zb), c.y(yb, zb)], [c.x(X, za), c.y(yb, za)]];
      s += `<path d="M${q.map((v) => `${f(v[0])},${f(v[1])}`).join(' L')} Z" fill="${on ? lit : mixHex(col, '#000', 0.35)}" opacity="${T.night && on ? 0.95 : 0.85}"/>`;
    }
  }
  // Rez-de-chaussée : boutique avec enseigne
  if (opts.shop) {
    const sign = opts.sign || ['#e8442e', '#2f86d6', '#1f9d55', '#f5c518'][Math.floor(r() * 4)];
    const q = [[c.x(X, z1), c.y(0.62, z1)], [c.x(X, z2), c.y(0.62, z2)], [c.x(X, z2), c.y(0.42, z2)], [c.x(X, z1), c.y(0.42, z1)]];
    s += `<path d="M${q.map((v) => `${f(v[0])},${f(v[1])}`).join(' L')} Z" fill="${haze(sign, T, near)}" stroke="${INK}" stroke-width="${f(Math.max(0.5, 3 / near))}"/>`;
    const d = [[c.x(X, z1 + (z2 - z1) * 0.15), c.y(0, z1 + (z2 - z1) * 0.15)], [c.x(X, z1 + (z2 - z1) * 0.85), c.y(0, z1 + (z2 - z1) * 0.85)], [c.x(X, z1 + (z2 - z1) * 0.85), c.y(0.38, z1 + (z2 - z1) * 0.85)], [c.x(X, z1 + (z2 - z1) * 0.15), c.y(0.38, z1 + (z2 - z1) * 0.15)]];
    s += `<path d="M${d.map((v) => `${f(v[0])},${f(v[1])}`).join(' L')} Z" fill="${T.night ? '#ffcf7a' : mixHex(col, '#000', 0.45)}" opacity=".9"/>`;
  }
  // Toit plat + ombre de corniche
  s += `<path d="M${f(p[3][0])},${f(p[3][1])} L${f(p[2][0])},${f(p[2][1])}" stroke="${sh}" stroke-width="${f(Math.max(1, 7 / near))}"/>`;
  return s;
}

/** Palmier (cocotier) à la position (X, z). */
function palm(c, T, X, z, H = 2.6, r) {
  const x0 = c.x(X, z); const y0 = c.y(0, z); const s = c.s(z);
  const lean = (r() - 0.5) * 0.5 * s;
  const tx = x0 + lean; const ty = y0 - H * s;
  const trunk = haze('#6b4a2e', T, z); const leaf = haze(T.night ? '#123020' : '#2f7d32', T, z); const leaf2 = haze(T.night ? '#0b1f14' : '#1d5a22', T, z);
  let out = `<path d="M${f(x0 - s * 0.05)},${f(y0)} Q${f(x0 + lean * 0.2)},${f((y0 + ty) / 2)} ${f(tx - s * 0.03)},${f(ty)} L${f(tx + s * 0.03)},${f(ty)} Q${f(x0 + lean * 0.3 + s * 0.04)},${f((y0 + ty) / 2)} ${f(x0 + s * 0.05)},${f(y0)} Z" fill="${trunk}" stroke="${haze(INK, T, z + 4)}" stroke-width="${f(Math.max(0.5, 2.4 / z * 2))}"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (-160 + i * 42 + r() * 12) * Math.PI / 180;
    const L = s * (0.75 + r() * 0.3);
    const ex = tx + Math.cos(a) * L; const ey = ty + Math.sin(a) * L * 0.55 + L * 0.35;
    const mx = tx + Math.cos(a) * L * 0.5; const my = ty + Math.sin(a) * L * 0.4 - L * 0.12;
    out += `<path d="M${f(tx)},${f(ty)} Q${f(mx)},${f(my - L * 0.12)} ${f(ex)},${f(ey)} Q${f(mx)},${f(my + L * 0.1)} ${f(tx)},${f(ty)} Z" fill="${i % 2 ? leaf : leaf2}" stroke="${haze(INK, T, z + 4)}" stroke-width="${f(Math.max(0.4, 1.6 / z * 2))}"/>`;
  }
  return out;
}

/** Lampadaire (allumé la nuit et à l'aube). */
function lamp(c, T, X, z, side = 1) {
  const x = c.x(X, z); const y = c.y(0, z); const s = c.s(z);
  const top = y - s * 2.1; const hx = x - side * s * 0.35;
  const col = haze('#2b2f3a', T, z);
  let out = `<path d="M${f(x)},${f(y)} L${f(x)},${f(top)} Q${f(x)},${f(top - s * 0.15)} ${f(hx)},${f(top - s * 0.08)}" stroke="${col}" stroke-width="${f(Math.max(1, s * 0.035))}" fill="none"/>
    <rect x="${f(hx - s * 0.09)}" y="${f(top - s * 0.1)}" width="${f(s * 0.18)}" height="${f(s * 0.06)}" fill="${col}"/>`;
  if (T.night || T === TIMES.aube || T === TIMES.pluie) {
    const g = uid('lg');
    out += `<defs><radialGradient id="${g}"><stop offset="0" stop-color="${T.light}" stop-opacity=".75"/><stop offset="1" stop-color="${T.light}" stop-opacity="0"/></radialGradient></defs>
      <circle cx="${f(hx)}" cy="${f(top)}" r="${f(s * 0.5)}" fill="url(#${g})"/>
      <path d="M${f(hx - s * 0.07)},${f(top - s * 0.04)} L${f(hx - s * 0.6)},${f(y)} L${f(hx + s * 0.6)},${f(y)} L${f(hx + s * 0.07)},${f(top - s * 0.04)} Z" fill="${T.light}" opacity=".12"/>`;
  }
  return out;
}

/** Taxi jaune de Conakry, vu de l'arrière ou de l'avant, sur la route. */
function taxi(c, T, X, z, front = false) {
  const x = c.x(X, z); const y = c.y(0, z); const s = c.s(z);
  const W = s * 1.15; const H = s * 0.95;
  const body = haze('#f5c518', T, z); const dark = haze('#b88a00', T, z); const glass = haze(T.night ? '#0c1226' : '#7fb3d6', T, z);
  const lw = f(Math.max(0.6, s * 0.012));
  let out = `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(W * 0.62)}" ry="${f(s * 0.06)}" fill="#000" opacity=".25"/>
    <path d="M${f(x - W / 2)},${f(y - s * 0.12)} L${f(x - W / 2)},${f(y - H * 0.5)} Q${f(x - W / 2)},${f(y - H * 0.56)} ${f(x - W * 0.4)},${f(y - H * 0.58)} L${f(x - W * 0.3)},${f(y - H)} L${f(x + W * 0.3)},${f(y - H)} L${f(x + W * 0.4)},${f(y - H * 0.58)} Q${f(x + W / 2)},${f(y - H * 0.56)} ${f(x + W / 2)},${f(y - H * 0.5)} L${f(x + W / 2)},${f(y - s * 0.12)} Z" fill="${body}" stroke="${INK}" stroke-width="${lw}" stroke-linejoin="round"/>
    <path d="M${f(x - W * 0.27)},${f(y - H * 0.93)} L${f(x + W * 0.27)},${f(y - H * 0.93)} L${f(x + W * 0.36)},${f(y - H * 0.62)} L${f(x - W * 0.36)},${f(y - H * 0.62)} Z" fill="${glass}" stroke="${INK}" stroke-width="${lw}"/>
    <rect x="${f(x - W / 2)}" y="${f(y - H * 0.42)}" width="${f(W)}" height="${f(H * 0.08)}" fill="${haze('#1f9d55', T, z)}"/>
    <rect x="${f(x - W * 0.46)}" y="${f(y - H * 0.34)}" width="${f(W * 0.16)}" height="${f(H * 0.1)}" rx="${f(s * 0.02)}" fill="${front ? '#fff8d0' : '#e8442e'}"/>
    <rect x="${f(x + W * 0.3)}" y="${f(y - H * 0.34)}" width="${f(W * 0.16)}" height="${f(H * 0.1)}" rx="${f(s * 0.02)}" fill="${front ? '#fff8d0' : '#e8442e'}"/>
    <rect x="${f(x - W * 0.48)}" y="${f(y - s * 0.16)}" width="${f(W * 0.16)}" height="${f(s * 0.16)}" fill="${INK}"/><rect x="${f(x + W * 0.32)}" y="${f(y - s * 0.16)}" width="${f(W * 0.16)}" height="${f(s * 0.16)}" fill="${INK}"/>
    <path d="M${f(x - W / 2)},${f(y - H * 0.3)} L${f(x - W / 2)},${f(y - s * 0.14)}" stroke="${dark}" stroke-width="${f(W * 0.06)}"/>`;
  if (T.night && front) {
    const g = uid('hl');
    out += `<defs><radialGradient id="${g}"><stop offset="0" stop-color="#fff8d0" stop-opacity=".8"/><stop offset="1" stop-color="#fff8d0" stop-opacity="0"/></radialGradient></defs>
      <circle cx="${f(x - W * 0.38)}" cy="${f(y - H * 0.29)}" r="${f(s * 0.25)}" fill="url(#${g})"/><circle cx="${f(x + W * 0.38)}" cy="${f(y - H * 0.29)}" r="${f(s * 0.25)}" fill="url(#${g})"/>`;
  }
  return out;
}

/** Moto avec conducteur (silhouette). */
function moto(c, T, X, z, color = '#e8442e') {
  const x = c.x(X, z); const y = c.y(0, z); const s = c.s(z);
  const ink = haze(INK, T, z); const col = haze(color, T, z); const lw = f(Math.max(0.6, s * 0.012));
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s * 0.45)}" ry="${f(s * 0.04)}" fill="#000" opacity=".25"/>
    <circle cx="${f(x - s * 0.32)}" cy="${f(y - s * 0.14)}" r="${f(s * 0.14)}" fill="none" stroke="${ink}" stroke-width="${f(s * 0.05)}"/>
    <circle cx="${f(x + s * 0.32)}" cy="${f(y - s * 0.14)}" r="${f(s * 0.14)}" fill="none" stroke="${ink}" stroke-width="${f(s * 0.05)}"/>
    <path d="M${f(x - s * 0.32)},${f(y - s * 0.16)} L${f(x - s * 0.1)},${f(y - s * 0.38)} L${f(x + s * 0.2)},${f(y - s * 0.36)} L${f(x + s * 0.32)},${f(y - s * 0.16)}" fill="none" stroke="${col}" stroke-width="${f(s * 0.09)}" stroke-linejoin="round"/>
    <path d="M${f(x - s * 0.05)},${f(y - s * 0.42)} L${f(x - s * 0.02)},${f(y - s * 0.95)} L${f(x + s * 0.12)},${f(y - s * 0.95)} L${f(x + s * 0.2)},${f(y - s * 0.6)} L${f(x + s * 0.3)},${f(y - s * 0.62)}" fill="none" stroke="${ink}" stroke-width="${f(s * 0.12)}" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${f(x + s * 0.04)}" cy="${f(y - s * 1.08)}" r="${f(s * 0.1)}" fill="${ink}" stroke="${ink}" stroke-width="${lw}"/>`;
}

/** Silhouette de passant (foule en arrière-plan). */
function walker(c, T, X, z, r) {
  const x = c.x(X, z); const y = c.y(0, z); const s = c.s(z) * (0.85 + r() * 0.2);
  const cols = ['#e8442e', '#2f86d6', '#f5c518', '#8b5cf6', '#1f9d55', '#f2f0fa', '#ff3d9a', '#ff8a3d'];
  const shirt = haze(cols[Math.floor(r() * cols.length)], T, z * 1.4);
  const skin = haze('#4a2c1d', T, z * 1.4); const ink = haze(INK, T, z + 3);
  const step = (r() - 0.5) * s * 0.18;
  return `<g stroke="${ink}" stroke-width="${f(Math.max(0.4, s * 0.012))}" stroke-linejoin="round">
    <path d="M${f(x - s * 0.06 + step)},${f(y)} L${f(x - s * 0.04)},${f(y - s * 0.5)} L${f(x + s * 0.04)},${f(y - s * 0.5)} L${f(x + s * 0.06 - step)},${f(y)}" fill="none" stroke="${haze('#23264a', T, z * 1.4)}" stroke-width="${f(s * 0.07)}"/>
    <path d="M${f(x - s * 0.1)},${f(y - s * 0.48)} L${f(x - s * 0.11)},${f(y - s * 0.86)} Q${f(x)},${f(y - s * 0.92)} ${f(x + s * 0.11)},${f(y - s * 0.86)} L${f(x + s * 0.1)},${f(y - s * 0.48)} Z" fill="${shirt}"/>
    <circle cx="${f(x)}" cy="${f(y - s * 0.98)}" r="${f(s * 0.075)}" fill="${skin}"/></g>`;
}

// ---------------------------------------------------------------------
// LES DÉCORS
// ---------------------------------------------------------------------

/** La corniche au bord de la mer : promenade, muret, mer, îles au loin. */
function corniche(w, h, o) {
  const T = TIMES[o.time] || TIMES.couchant; const r = rng(o.seed || 7); const c = cam(w, h, o);
  let s = sky(w, h, T, { ...o, sunX: o.sunX ?? 0.78 }, r, c.hz);
  // Mer
  const sea = uid('sea');
  s += `<defs><linearGradient id="${sea}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixHex(T.low, T.mid, 0.4)}"/><stop offset="1" stop-color="${mixHex(T.top, '#0b3b5c', 0.4)}"/></linearGradient></defs>
    <rect y="${f(c.hz)}" width="${w}" height="${f(h - c.hz)}" fill="url(#${sea})"/>`;
  // Îles de Loos au loin (collines basses dans la brume)
  s += `<path d="M${f(w * 0.48)},${f(c.hz)} Q${f(w * 0.56)},${f(c.hz - h * 0.035)} ${f(w * 0.64)},${f(c.hz - h * 0.02)} Q${f(w * 0.7)},${f(c.hz - h * 0.045)} ${f(w * 0.8)},${f(c.hz)} Z" fill="${mixHex(T.mid, T.top, 0.35)}" opacity=".8"/>
    <path d="M${f(w * 0.86)},${f(c.hz)} Q${f(w * 0.92)},${f(c.hz - h * 0.025)} ${f(w * 1.02)},${f(c.hz)} Z" fill="${mixHex(T.mid, T.top, 0.35)}" opacity=".7"/>`;
  // Reflet du soleil/lune
  if (o.time !== 'pluie') {
    const sx = w * (o.sunX ?? 0.78);
    for (let i = 0; i < 14; i++) {
      const yy = c.hz + 4 + i * i * (h - c.hz) * 0.004;
      const ww = 8 + i * 5;
      s += `<rect x="${f(sx - ww / 2 + (r() - 0.5) * ww)}" y="${f(yy)}" width="${f(ww)}" height="${f(1.5 + i * 0.25)}" fill="${T.sun}" opacity="${f(0.75 - i * 0.04)}"/>`;
    }
  }
  for (let i = 0; i < 18; i++) {
    const yy = c.hz + (h - c.hz) * Math.pow(r(), 1.6);
    s += `<path d="M${f(r() * w)},${f(yy)} h${f(10 + (yy - c.hz) * 0.25)}" stroke="#fff" stroke-width="1.2" opacity=".25"/>`;
  }
  // Sol à gauche du muret (promenade + route), muret en fuite à droite
  const WALL = 1.1;
  const zN = 0.35; const zF = 80;
  const ground = `M0,${f(h)} L0,${f(c.hz)} L${f(c.x(WALL, zF))},${f(c.y(0, zF))} L${f(c.x(WALL, zN))},${f(c.y(0, zN))} Z`;
  s += `<path d="${ground}" fill="${mixHex(T.ground, '#c8b9a2', 0.35)}"/>`;
  // Route (à gauche) et sa ligne centrale
  s += `<path d="M0,${f(h)} L0,${f(c.hz)} L${f(c.x(-0.2, zF))},${f(c.y(0, zF))} L${f(c.x(-0.2, zN))},${f(c.y(0, zN))} Z" fill="${mixHex(T.ground, '#2e2e36', 0.55)}"/>`;
  for (let z = 1; z < 40; z *= 1.45) s += `<path d="M${f(c.x(-1.6, z))},${f(c.y(0, z))} L${f(c.x(-1.6, z * 1.18))},${f(c.y(0, z * 1.18))}" stroke="${haze('#f2f0e6', T, z)}" stroke-width="${f(Math.max(0.6, c.s(z) * 0.05))}"/>`;
  // Immeubles bas de l'autre côté de la route
  const pastels = ['#e9d8b4', '#f2e6d0', '#c9dceb', '#efc9b8', '#d8e2c4'];
  let z = 3.2;
  while (z < 45) {
    const z2 = z * (1.25 + r() * 0.2);
    s += facade(c, T, -4.2, z2, z, 1.6 + r() * 2.2, pastels[Math.floor(r() * pastels.length)], r, { shop: true });
    z = z2 * 1.02;
  }
  // Palmiers et lampadaires le long de la promenade (du plus loin au plus près)
  const items = [];
  for (let zz = 1.2; zz < 40; zz *= 1.55) items.push({ z: zz, kind: 'palm' });
  for (let zz = 1.6; zz < 40; zz *= 1.55) items.push({ z: zz, kind: 'lamp' });
  items.sort((a, b) => b.z - a.z);
  // Muret (face visible + dessus)
  const top = (zz) => [c.x(WALL, zz), c.y(0.42, zz)];
  const base = (zz) => [c.x(WALL, zz), c.y(0, zz)];
  const wallCol = mixHex('#d9cdb6', T.ground, 0.3);
  s += `<path d="M${f(base(zN)[0])},${f(base(zN)[1])} L${f(base(zF)[0])},${f(base(zF)[1])} L${f(top(zF)[0])},${f(top(zF)[1])} L${f(top(zN)[0])},${f(top(zN)[1])} Z" fill="${mixHex(wallCol, '#000', 0.22)}" stroke="${INK}" stroke-width="2"/>
    <path d="M${f(top(zN)[0])},${f(top(zN)[1])} L${f(top(zF)[0])},${f(top(zF)[1])} L${f(c.x(WALL + 0.25, zF))},${f(c.y(0.42, zF))} L${f(c.x(WALL + 0.25, zN))},${f(c.y(0.42, zN))} Z" fill="${wallCol}" stroke="${INK}" stroke-width="2"/>`;
  for (let zz = 0.6; zz < 50; zz *= 1.22) s += `<path d="M${f(base(zz)[0])},${f(base(zz)[1])} L${f(top(zz)[0])},${f(top(zz)[1])}" stroke="${haze(INK, T, zz + 3)}" stroke-width="${f(Math.max(0.4, c.s(zz) * 0.01))}" opacity=".6"/>`;
  for (const it of items) s += it.kind === 'palm' ? palm(c, T, 0.75, it.z, 2.8, r) : lamp(c, T, 0.9, it.z, 1);
  // Promeneurs au loin
  for (let i = 0; i < 6; i++) s += walker(c, T, -0.1 + r() * 0.8, 6 + r() * 25, r);
  if (o.cars !== false) s += taxi(c, T, -1.0, 9, false) + moto(c, T, -2.4, 6.5, '#2f86d6');
  return s;
}

/** Rue animée : immeubles, boutiques, taxis jaunes, motos, câbles électriques. */
function rue(w, h, o) {
  const T = TIMES[o.time] || TIMES.jour; const r = rng(o.seed || 3); const c = cam(w, h, o);
  let s = sky(w, h, T, o, r, c.hz);
  const zN = 0.35; const zF = 90;
  s += `<rect y="${f(c.hz)}" width="${w}" height="${f(h - c.hz)}" fill="${mixHex(T.ground, '#3a3a42', 0.5)}"/>`;
  // Trottoirs
  for (const X of [-2.0, 2.0]) {
    const X2 = X < 0 ? -3 : 3;
    s += `<path d="M${f(c.x(X2, zN))},${f(c.y(0, zN))} L${f(c.x(X2, zF))},${f(c.y(0, zF))} L${f(c.x(X, zF))},${f(c.y(0, zF))} L${f(c.x(X, zN))},${f(c.y(0, zN))} Z" fill="${mixHex(T.ground, '#c8b9a2', 0.3)}" stroke="${INK}" stroke-width="1.4"/>`;
  }
  // Ligne de terre rouge sur le bord (latérite) — détail très local
  s += `<path d="M${f(c.x(-2.0, zN))},${f(c.y(0, zN))} L${f(c.x(-2.0, zF))},${f(c.y(0, zF))} L${f(c.x(-1.7, zF))},${f(c.y(0, zF))} L${f(c.x(-1.7, zN))},${f(c.y(0, zN))} Z" fill="${haze('#a4502c', T, 4)}" opacity=".55"/>`;
  if (o.time === 'pluie') { // flaques avec reflets
    for (let i = 0; i < 6; i++) { const zz = 1.5 + r() * 12; const X = -1.2 + r() * 2.4; s += `<ellipse cx="${f(c.x(X, zz))}" cy="${f(c.y(0, zz))}" rx="${f(c.s(zz) * 0.5)}" ry="${f(c.s(zz) * 0.06)}" fill="${T.low}" opacity=".45"/>`; }
  }
  // Façades des deux côtés (du plus loin au plus près)
  const colors = ['#e9d8b4', '#f2e6d0', '#c9dceb', '#efc9b8', '#d8e2c4', '#f0d27a', '#b9d6c9'];
  const blocks = [];
  for (const X of [-3, 3]) {
    let z = 1.2;
    while (z < 60) { const z2 = z * (1.3 + r() * 0.3); blocks.push({ X, z1: z2, z2: z, H: 1.8 + r() * 2.6, col: colors[Math.floor(r() * colors.length)] }); z = z2; }
  }
  blocks.sort((a, b) => b.z2 - a.z2);
  for (const b of blocks) s += facade(c, T, b.X, b.z1, b.z2, b.H, b.col, r, { shop: true });
  // Câbles électriques
  for (let i = 0; i < 4; i++) {
    const za = 2 + i * 3; const zb = za + 8;
    s += `<path d="M${f(c.x(-3, za))},${f(c.y(3.2, za))} Q${f((c.x(-3, za) + c.x(3, zb)) / 2)},${f(c.y(2.4, (za + zb) / 2))} ${f(c.x(3, zb))},${f(c.y(3.3, zb))}" stroke="${INK}" stroke-width="1.2" fill="none" opacity=".7"/>`;
  }
  // Circulation
  const traffic = [
    { z: 26, k: 'w' }, { z: 22, k: 'w' }, { z: 14, k: 'taxi', X: 0.6, front: true }, { z: 18, k: 'moto', X: -0.6 }, { z: 9, k: 'taxi', X: -0.7 },
    { z: 7, k: 'moto', X: 0.9, col: '#8b5cf6' }, { z: 11, k: 'w' }, { z: 5, k: 'w' },
  ];
  // Véhicules imposés par la case (ex. un taxi qui fonce vers nous)
  for (const v of o.vehicles || []) traffic.push({ z: v.z, k: v.k || 'taxi', X: v.X ?? 0, front: v.front, col: v.col });
  traffic.sort((a, b) => b.z - a.z);
  for (const t of traffic) {
    if (o.cars === false && t.k !== 'w') continue;
    if (t.k === 'taxi') s += taxi(c, T, t.X, t.z, t.front);
    else if (t.k === 'moto') s += moto(c, T, t.X, t.z, t.col);
    else s += walker(c, T, (r() < 0.5 ? -1 : 1) * (2.2 + r() * 0.6), t.z, r);
  }
  return s;
}

/** Marché coloré : bâches, étals de fruits, tissus wax, foule. */
function marche(w, h, o) {
  const T = TIMES[o.time] || TIMES.jour; const r = rng(o.seed || 11); const c = cam(w, h, o);
  let s = rue(w, h, { ...o, cars: false });
  const tarps = ['#e8442e', '#2f86d6', '#f5c518', '#1f9d55', '#ff8a3d', '#8b5cf6', '#ff3d9a'];
  const stalls = [];
  for (const X of [-1.9, 1.9]) for (let z = 1.1; z < 30; z *= 1.4) stalls.push({ X, z });
  stalls.sort((a, b) => b.z - a.z);
  for (const st of stalls) {
    const side = st.X < 0 ? -1 : 1;
    const sz = c.s(st.z);
    const x = c.x(st.X, st.z); const y = c.y(0, st.z);
    const col = haze(tarps[Math.floor(r() * tarps.length)], T, st.z);
    const lw = f(Math.max(0.5, sz * 0.012));
    // Table
    s += `<rect x="${f(x - sz * 0.45)}" y="${f(y - sz * 0.42)}" width="${f(sz * 0.9)}" height="${f(sz * 0.42)}" fill="${haze('#7a5536', T, st.z)}" stroke="${INK}" stroke-width="${lw}"/>`;
    // Fruits (mangues, oranges, piments)
    const fr = [['#ff9f1c', '#3a8f3a'], ['#ff8a00', '#ffb347'], ['#e8442e', '#b81d13']][Math.floor(r() * 3)];
    for (let i = 0; i < 9; i++) s += `<circle cx="${f(x - sz * 0.38 + (i % 5) * sz * 0.18 + (i > 4 ? sz * 0.09 : 0))}" cy="${f(y - sz * 0.46 - (i > 4 ? sz * 0.07 : 0))}" r="${f(sz * 0.07)}" fill="${haze(fr[i % 2], T, st.z)}" stroke="${INK}" stroke-width="${lw}"/>`;
    // Bâche inclinée
    s += `<path d="M${f(x - sz * 0.6)},${f(y - sz * 1.45)} L${f(x + sz * 0.6)},${f(y - sz * 1.45)} L${f(x + sz * 0.68)},${f(y - sz * 1.15)} Q${f(x)},${f(y - sz * 1.05)} ${f(x - sz * 0.68)},${f(y - sz * 1.15)} Z" fill="${col}" stroke="${INK}" stroke-width="${lw}"/>
      <path d="M${f(x - sz * 0.55)},${f(y - sz * 1.15)} L${f(x - sz * 0.55)},${f(y)} M${f(x + sz * 0.55)},${f(y - sz * 1.15)} L${f(x + sz * 0.55)},${f(y)}" stroke="${haze('#4a3a2a', T, st.z)}" stroke-width="${f(sz * 0.03)}"/>`;
    // Tissu wax suspendu
    if (r() < 0.6) {
      const wx = x + side * sz * 0.2;
      s += `<rect x="${f(wx - sz * 0.15)}" y="${f(y - sz * 1.12)}" width="${f(sz * 0.3)}" height="${f(sz * 0.55)}" fill="${haze(tarps[Math.floor(r() * tarps.length)], T, st.z)}" stroke="${INK}" stroke-width="${lw}"/>
        <path d="M${f(wx - sz * 0.12)},${f(y - sz * 1.0)} h${f(sz * 0.24)} M${f(wx - sz * 0.12)},${f(y - sz * 0.85)} h${f(sz * 0.24)}" stroke="${haze('#ffd23f', T, st.z)}" stroke-width="${f(sz * 0.03)}" stroke-dasharray="${f(sz * 0.04)} ${f(sz * 0.03)}"/>`;
    }
  }
  // Foule
  const crowd = [];
  for (let i = 0; i < 16; i++) crowd.push({ X: -1.3 + r() * 2.6, z: 3 + r() * 30 });
  crowd.sort((a, b) => b.z - a.z);
  for (const p of crowd) s += walker(c, T, p.X, p.z, r);
  return s;
}

/** Intérieur générique en perspective (pièce : mur du fond, sol, plafond, murs latéraux). */
function room(w, h, o, colors) {
  const c = cam(w, h, { ...o, horizon: o.horizon ?? 0.45 });
  // La pièce : mur du fond = rectangle autour du point de fuite
  const D = o.depth || 6; // profondeur de la pièce
  const Wr = o.roomW || 2.6; const Hr = o.roomH || 2.6;
  const bx1 = c.x(-Wr, D); const bx2 = c.x(Wr, D); const by1 = c.y(Hr, D); const by2 = c.y(0, D);
  const zN = 0.3;
  const nx1 = c.x(-Wr, zN); const nx2 = c.x(Wr, zN); const ny1 = c.y(Hr, zN); const ny2 = c.y(0, zN);
  let s = `<rect width="${w}" height="${h}" fill="${colors.wall}"/>
    <path d="M${f(nx1)},${f(ny2)} L${f(bx1)},${f(by2)} L${f(bx2)},${f(by2)} L${f(nx2)},${f(ny2)} Z" fill="${colors.floor}"/>
    <path d="M${f(nx1)},${f(ny1)} L${f(bx1)},${f(by1)} L${f(bx2)},${f(by1)} L${f(nx2)},${f(ny1)} Z" fill="${colors.ceil}"/>
    <path d="M${f(nx1)},${f(ny1)} L${f(bx1)},${f(by1)} L${f(bx1)},${f(by2)} L${f(nx1)},${f(ny2)} Z" fill="${colors.left}"/>
    <path d="M${f(nx2)},${f(ny1)} L${f(bx2)},${f(by1)} L${f(bx2)},${f(by2)} L${f(nx2)},${f(ny2)} Z" fill="${colors.right}"/>
    <rect x="${f(bx1)}" y="${f(by1)}" width="${f(bx2 - bx1)}" height="${f(by2 - by1)}" fill="${colors.back}"/>
    <path d="M${f(nx1)},${f(ny2)} L${f(bx1)},${f(by2)} L${f(bx2)},${f(by2)} L${f(nx2)},${f(ny2)} M${f(nx1)},${f(ny1)} L${f(bx1)},${f(by1)} L${f(bx2)},${f(by1)} L${f(nx2)},${f(ny1)} M${f(bx1)},${f(by1)} L${f(bx1)},${f(by2)} M${f(bx2)},${f(by1)} L${f(bx2)},${f(by2)}" stroke="${INK}" stroke-width="2" fill="none" opacity=".75"/>`;
  return { s, c, D, Wr, Hr, bx1, bx2, by1, by2 };
}

/** Quadrilatère sur un mur latéral (X fixe) entre z1 et z2, hauteurs y1→y2. */
function sideQuad(c, X, z1, z2, y1, y2) {
  const q = [[c.x(X, z1), c.y(y1, z1)], [c.x(X, z2), c.y(y1, z2)], [c.x(X, z2), c.y(y2, z2)], [c.x(X, z1), c.y(y2, z1)]];
  return `M${q.map((v) => `${f(v[0])},${f(v[1])}`).join(' L')} Z`;
}
/** Boîte au sol (bureau, lit…) entre X1..X2, z1..z2, hauteur H. */
function box(c, X1, X2, z1, z2, H, top, front, side) {
  const P = (X, Y, z) => `${f(c.x(X, z))},${f(c.y(Y, z))}`;
  return `<path d="M${P(X1, H, z1)} L${P(X2, H, z1)} L${P(X2, H, z2)} L${P(X1, H, z2)} Z" fill="${top}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M${P(X1, 0, z1)} L${P(X2, 0, z1)} L${P(X2, H, z1)} L${P(X1, H, z1)} Z" fill="${front}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    ${side ? `<path d="M${P(X1 < 0 ? X2 : X1, 0, z1)} L${P(X1 < 0 ? X2 : X1, 0, z2)} L${P(X1 < 0 ? X2 : X1, H, z2)} L${P(X1 < 0 ? X2 : X1, H, z1)} Z" fill="${side}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>` : ''}`;
}

/** Table : plateau fin sur pieds (plus léger qu'une boîte pleine). */
function desk(c, X1, X2, z1, z2, H, top, edge) {
  const P = (X, Y, z) => `${f(c.x(X, z))},${f(c.y(Y, z))}`;
  const lw = f(Math.max(0.8, 3.2 / z1));
  let s = '';
  for (const X of [X1 + 0.08, X2 - 0.08]) s += `<path d="M${P(X, 0, z1 + 0.05)} L${P(X, H - 0.06, z1 + 0.05)}" stroke="#2a2018" stroke-width="${f(Math.max(1, c.s(z1) * 0.025))}"/>`;
  s += `<path d="M${P(X1, H, z1)} L${P(X2, H, z1)} L${P(X2, H, z2)} L${P(X1, H, z2)} Z" fill="${top}" stroke="${INK}" stroke-width="${lw}" stroke-linejoin="round"/>
    <path d="M${P(X1, H - 0.07, z1)} L${P(X2, H - 0.07, z1)} L${P(X2, H, z1)} L${P(X1, H, z1)} Z" fill="${edge}" stroke="${INK}" stroke-width="${lw}"/>`;
  // Chaise (dossier) derrière la table
  s += `<path d="M${P(X1 + 0.3, 0.45, z2 + 0.25)} L${P(X1 + 0.3, 1.05, z2 + 0.25)} L${P(X1 + 0.9, 1.05, z2 + 0.25)} L${P(X1 + 0.9, 0.45, z2 + 0.25)}" fill="none" stroke="#3a3a46" stroke-width="${f(Math.max(1, c.s(z2) * 0.03))}"/>`;
  return s;
}

/** Salle de classe d'université : tableau, rangées de tables, fenêtres lumineuses. */
function classe(w, h, o) {
  const T = TIMES[o.time] || TIMES.jour; const r = rng(o.seed || 5);
  const warm = T.night ? '#2b2f45' : '#efe3c8';
  const R = room(w, h, { ...o, depth: 7, roomW: 3.2, roomH: 2.7 }, {
    wall: warm, floor: T.night ? '#2a2420' : '#b07a4a', ceil: T.night ? '#1e2135' : '#e8e2d2',
    left: T.night ? '#252940' : '#e7d9b8', right: T.night ? '#2a2e48' : '#f1e6cc', back: T.night ? '#30344f' : '#f4ead2',
  });
  const { c } = R;
  let s = R.s;
  // Fenêtres (mur gauche) + rayons de lumière
  for (let i = 0; i < 3; i++) {
    const z1 = 1.2 + i * 1.8; const z2 = z1 + 1.1;
    s += `<path d="${sideQuad(c, -3.2, z1, z2, 1.0, 2.3)}" fill="${T.night ? '#0d1530' : mixHex(T.low, '#ffffff', 0.4)}" stroke="${INK}" stroke-width="2"/>`;
    s += `<path d="${sideQuad(c, -3.2, (z1 + z2) / 2, (z1 + z2) / 2 + 0.02, 1.0, 2.3)}" stroke="${INK}" stroke-width="2"/>`;
    if (!T.night) s += `<path d="M${f(c.x(-3.2, z1))},${f(c.y(2.3, z1))} L${f(c.x(-3.2, z2))},${f(c.y(2.3, z2))} L${f(c.x(0.8, z2 + 1))},${f(c.y(0, z2 + 1))} L${f(c.x(-0.2, z1 + 1))},${f(c.y(0, z1 + 1))} Z" fill="${T.light}" opacity=".18"/>`;
  }
  // Tableau noir avec formules à la craie
  const bx = c.x(-1.8, 7); const bw = c.x(1.8, 7) - bx; const by = c.y(2.1, 7); const bh = c.y(0.9, 7) - by;
  s += `<rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" fill="#1f3a2e" stroke="#6b4a2e" stroke-width="${f(bw * 0.02)}"/>`;
  const chalk = ['u(n+1) = q·u(n)', 'Σ d(s) = 2|A|', "f'(x) = 2x + 3", 'lim 1/n = 0', 'a² + b² = c²'];
  for (let i = 0; i < 3; i++) s += `<text x="${f(bx + bw * 0.06)}" y="${f(by + bh * (0.3 + i * 0.27))}" font-family="Comic Sans MS, Chalkboard, cursive" font-size="${f(bh * 0.17)}" fill="#e8f0e6" opacity=".9">${chalk[(i + (o.seed || 0)) % chalk.length]}</text>`;
  // Néons
  for (let i = 0; i < 3; i++) { const z = 1.5 + i * 2; s += `<rect x="${f(c.x(-0.6, z))}" y="${f(c.y(2.68, z))}" width="${f(c.x(0.6, z) - c.x(-0.6, z))}" height="${f(c.s(z) * 0.05)}" fill="#fffbe6" stroke="${INK}" stroke-width="1"/>`; }
  // Rangées de tables (du fond vers l'avant)
  for (let z = 6; z >= 1.2; z -= 1.1) {
    for (const [X1, X2] of [[-2.8, -0.4], [0.4, 2.8]]) s += desk(c, X1, X2, z, z + 0.45, 0.75, T.night ? '#5a4632' : '#c08a52', T.night ? '#3e3022' : '#8f6236');
  }
  return s;
}

/** Bibliothèque : hautes étagères de livres en fuite, fenêtre lumineuse au fond. */
function bibliotheque(w, h, o) {
  const T = TIMES[o.time] || TIMES.jour; const r = rng(o.seed || 9);
  const R = room(w, h, { ...o, depth: 9, roomW: 2.6, roomH: 3.4 }, {
    wall: '#3a2a20', floor: T.night ? '#2a1f18' : '#6a4a32', ceil: '#2a1f18', left: '#4a3426', right: '#523a2a', back: '#4a3426',
  });
  const { c } = R;
  let s = R.s;
  // Grande fenêtre au fond
  const wx = c.x(-0.9, 9); const ww = c.x(0.9, 9) - wx; const wy = c.y(3.0, 9); const wh = c.y(0.6, 9) - wy;
  s += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" fill="${T.night ? '#0d1530' : mixHex(T.low, '#ffffff', 0.5)}" stroke="${INK}" stroke-width="2"/>
    <path d="M${f(wx + ww / 2)},${f(wy)} V${f(wy + wh)} M${f(wx)},${f(wy + wh / 2)} H${f(wx + ww)}" stroke="${INK}" stroke-width="2"/>`;
  if (!T.night) s += `<path d="M${f(wx)},${f(wy)} L${f(wx + ww)},${f(wy)} L${f(c.x(1.8, 2))},${f(c.y(0, 2))} L${f(c.x(-1.8, 2))},${f(c.y(0, 2))} Z" fill="${T.light}" opacity=".12"/>`;
  // Étagères sur les deux murs
  const spines = ['#8b2f2f', '#2f5d8b', '#c9a227', '#2f7d4a', '#6b3f8b', '#d9d2c0', '#a8552b', '#1d1d24'];
  for (const X of [-2.6, 2.6]) {
    for (let zz = 0.6; zz < 9; zz += 0.5) {
      for (let lv = 0; lv < 6; lv++) {
        const y1 = 0.2 + lv * 0.52; const y2 = y1 + 0.42;
        s += `<path d="${sideQuad(c, X, zz, zz + 0.48, y1, y2)}" fill="${spines[Math.floor(r() * spines.length)]}" stroke="#1a120c" stroke-width="${f(Math.max(0.4, 2 / zz))}"/>`;
      }
    }
    for (let lv = 0; lv <= 6; lv++) {
      const yy = 0.18 + lv * 0.52;
      s += `<path d="M${f(c.x(X, 0.6))},${f(c.y(yy, 0.6))} L${f(c.x(X, 9))},${f(c.y(yy, 9))}" stroke="#2a1a10" stroke-width="3"/>`;
    }
  }
  // Table de lecture avec lampe
  s += box(c, -1.0, 1.0, 2.6, 3.6, 0.8, '#7a5536', '#5a3c24', null);
  const lx = c.x(0.5, 3); const ly = c.y(0.8, 3); const ls = c.s(3);
  const lg = uid('lamp');
  s += `<defs><radialGradient id="${lg}"><stop offset="0" stop-color="#ffd27a" stop-opacity=".6"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${f(lx)}" cy="${f(ly - ls * 0.3)}" r="${f(ls * 0.9)}" fill="url(#${lg})"/>
    <path d="M${f(lx)},${f(ly)} L${f(lx)},${f(ly - ls * 0.35)}" stroke="${INK}" stroke-width="3"/>
    <path d="M${f(lx - ls * 0.15)},${f(ly - ls * 0.3)} L${f(lx + ls * 0.15)},${f(ly - ls * 0.3)} L${f(lx + ls * 0.08)},${f(ly - ls * 0.45)} L${f(lx - ls * 0.08)},${f(ly - ls * 0.45)} Z" fill="#2f7d4a" stroke="${INK}" stroke-width="2"/>`;
  return s;
}

/** Toit-terrasse la nuit : muret, cuve d'eau, antenne, ville illuminée. */
function toit(w, h, o) {
  const T = TIMES[o.time] || TIMES.nuit; const r = rng(o.seed || 13); const c = cam(w, h, { ...o, horizon: o.horizon ?? 0.5 });
  let s = sky(w, h, T, { ...o, sunX: o.sunX ?? 0.2 }, r, c.hz);
  // Mer au loin
  s += `<rect y="${f(c.hz)}" width="${w}" height="${f(h - c.hz)}" fill="${mixHex(T.mid, T.top, 0.5)}"/>`;
  // Ville : plusieurs plans d'immeubles (du plus loin au plus près)
  const layers = [[0.02, 0.06, 0.75], [0.06, 0.14, 0.5], [0.14, 0.26, 0.25]];
  layers.forEach(([hMin, hMax, fade], li) => {
    const base = c.hz + (h - c.hz) * (0.15 + li * 0.25);
    let x = -10;
    while (x < w) {
      const bw = w * (0.04 + r() * 0.07); const bh = h * (hMin + r() * (hMax - hMin));
      const col = mixHex(T.night ? '#0b1022' : '#7d8794', T.haze, fade);
      s += `<rect x="${f(x)}" y="${f(base - bh)}" width="${f(bw + 1)}" height="${f(h - base + bh)}" fill="${col}"/>`;
      // Fenêtres allumées
      const win = T.night ? '#ffcf6b' : mixHex('#2a3550', T.haze, fade);
      for (let yy = base - bh + 4; yy < base - 3; yy += 7 + li * 3) {
        for (let xx = x + 3; xx < x + bw - 3; xx += 6 + li * 3) if (r() < (T.night ? 0.35 : 0.5)) s += `<rect x="${f(xx)}" y="${f(yy)}" width="${f(2 + li)}" height="${f(2 + li * 1.4)}" fill="${win}" opacity="${f(1 - fade * 0.6)}"/>`;
      }
      x += bw;
    }
    // Minaret au loin (silhouette)
    if (li === 1) {
      const mx = w * 0.32;
      s += `<path d="M${f(mx - 6)},${f(base)} L${f(mx - 5)},${f(base - h * 0.22)} L${f(mx)},${f(base - h * 0.27)} L${f(mx + 5)},${f(base - h * 0.22)} L${f(mx + 6)},${f(base)} Z" fill="${mixHex(T.night ? '#0b1022' : '#7d8794', T.haze, 0.45)}"/>
        <rect x="${f(mx - 8)}" y="${f(base - h * 0.17)}" width="16" height="4" fill="${mixHex(T.night ? '#0b1022' : '#7d8794', T.haze, 0.45)}"/>`;
    }
  });
  // Halos de lumière de la ville (bokeh)
  if (T.night) for (let i = 0; i < 26; i++) s += `<circle cx="${f(r() * w)}" cy="${f(c.hz + (h - c.hz) * (0.3 + r() * 0.6))}" r="${f(2 + r() * 7)}" fill="${['#ffcf6b', '#ff8a3d', '#fff3cf', '#8be9ff'][Math.floor(r() * 4)]}" opacity="${f(0.15 + r() * 0.3)}"/>`;
  // Toit : sol + muret au premier plan
  const roofY = h * (o.roofY ?? 0.86);
  s += `<rect y="${f(roofY)}" width="${w}" height="${f(h - roofY)}" fill="${mixHex('#8a8278', T.top, T.night ? 0.6 : 0.2)}"/>
    <rect y="${f(roofY - h * 0.07)}" width="${w}" height="${f(h * 0.07)}" fill="${mixHex('#b4a99a', T.top, T.night ? 0.55 : 0.15)}" stroke="${INK}" stroke-width="3"/>
    <rect y="${f(roofY - h * 0.075)}" width="${w}" height="${f(h * 0.012)}" fill="${mixHex('#d6ccbc', T.top, T.night ? 0.5 : 0.1)}"/>`;
  // Cuve d'eau noire (polytank) + antenne parabolique
  if (o.props !== false) {
    const tx = w * (o.tankX ?? 0.85); const tw = w * 0.13; const th = h * 0.2;
    s += `<rect x="${f(tx - tw / 2)}" y="${f(roofY - th - h * 0.07)}" width="${f(tw)}" height="${f(th)}" rx="${f(tw * 0.12)}" fill="#14141a" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="${f(tx)}" cy="${f(roofY - th - h * 0.07)}" rx="${f(tw / 2)}" ry="${f(tw * 0.12)}" fill="#24242c" stroke="${INK}" stroke-width="3"/>
      <path d="M${f(tx - tw * 0.4)},${f(roofY - th * 0.8 - h * 0.07)} h${f(tw * 0.8)} M${f(tx - tw * 0.4)},${f(roofY - th * 0.45 - h * 0.07)} h${f(tw * 0.8)}" stroke="#2c2c36" stroke-width="2"/>
      <path d="M${f(w * 0.08)},${f(roofY - h * 0.07)} L${f(w * 0.08)},${f(roofY - h * 0.2)}" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="${f(w * 0.08)}" cy="${f(roofY - h * 0.22)}" rx="${f(w * 0.035)}" ry="${f(w * 0.05)}" transform="rotate(-25 ${f(w * 0.08)} ${f(roofY - h * 0.22)})" fill="#c9c9d4" stroke="${INK}" stroke-width="2.4"/>`;
    // Fil à linge avec un pagne qui sèche
    s += `<path d="M${f(w * 0.12)},${f(roofY - h * 0.19)} Q${f(w * 0.45)},${f(roofY - h * 0.15)} ${f(w * 0.78)},${f(roofY - h * 0.2)}" stroke="${INK}" stroke-width="1.4" fill="none"/>
      <path d="M${f(w * 0.5)},${f(roofY - h * 0.165)} l${f(w * 0.06)},0 l${f(w * 0.01)},${f(h * 0.08)} l${f(-w * 0.08)},0 Z" fill="${mixHex('#e8442e', T.top, T.night ? 0.5 : 0)}" stroke="${INK}" stroke-width="1.6"/>`;
  }
  return s;
}

/** Plage : sable, vagues, pirogues colorées, cocotiers. */
function plage(w, h, o) {
  const T = TIMES[o.time] || TIMES.couchant; const r = rng(o.seed || 17); const c = cam(w, h, { ...o, horizon: o.horizon ?? 0.48 });
  let s = sky(w, h, T, o, r, c.hz);
  const sea = uid('sea');
  const shore = c.hz + (h - c.hz) * 0.42;
  s += `<defs><linearGradient id="${sea}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixHex(T.low, T.mid, 0.4)}"/><stop offset="1" stop-color="${mixHex('#1a6b8a', T.top, 0.3)}"/></linearGradient></defs>
    <rect y="${f(c.hz)}" width="${w}" height="${f(shore - c.hz + 6)}" fill="url(#${sea})"/>`;
  // Vagues (lignes d'écume)
  for (let i = 0; i < 5; i++) {
    const yy = c.hz + (shore - c.hz) * (0.3 + i * 0.16);
    let d = `M0,${f(yy)}`;
    for (let x = 0; x <= w; x += w / 8) d += ` Q${f(x + w / 16)},${f(yy - 3 - i)} ${f(x + w / 8)},${f(yy)}`;
    s += `<path d="${d}" stroke="#fff" stroke-width="${f(1 + i * 0.7)}" fill="none" opacity="${f(0.3 + i * 0.12)}"/>`;
  }
  // Sable
  const sand = uid('sand');
  s += `<defs><linearGradient id="${sand}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixHex('#e6cfa0', T.haze, 0.3)}"/><stop offset="1" stop-color="${mixHex('#c9a46c', T.top, T.night ? 0.6 : 0.1)}"/></linearGradient></defs>
    <path d="M0,${f(shore)} Q${f(w * 0.3)},${f(shore - 6)} ${f(w * 0.6)},${f(shore + 4)} T${w},${f(shore)} L${w},${h} L0,${h} Z" fill="url(#${sand})"/>
    <path d="M0,${f(shore)} Q${f(w * 0.3)},${f(shore - 6)} ${f(w * 0.6)},${f(shore + 4)} T${w},${f(shore)}" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>`;
  // Pirogues de pêche (coques peintes)
  const boats = [[0.18, 0.72, 0.9, -6], [0.7, 0.62, 0.6, 8], [0.45, 0.55, 0.4, -3]];
  const paints = [['#1f6fb2', '#f5c518', '#e8442e'], ['#1f9d55', '#ffffff', '#e8442e'], ['#e8442e', '#f5c518', '#1f6fb2']];
  boats.sort((a, b) => a[1] - b[1]).forEach(([bx, by, sc, rot], i) => {
    const x = w * bx; const y = c.hz + (h - c.hz) * by; const L = w * 0.42 * sc; const H = L * 0.13;
    const [p1, p2, p3] = paints[i % 3];
    s += `<g transform="rotate(${rot} ${f(x)} ${f(y)})">
      <ellipse cx="${f(x)}" cy="${f(y + H * 0.55)}" rx="${f(L * 0.5)}" ry="${f(H * 0.25)}" fill="#000" opacity=".2"/>
      <path d="M${f(x - L / 2)},${f(y - H * 0.6)} Q${f(x)},${f(y + H * 0.9)} ${f(x + L / 2)},${f(y - H * 0.8)} L${f(x + L * 0.42)},${f(y - H * 0.2)} Q${f(x)},${f(y - H * 0.1)} ${f(x - L * 0.44)},${f(y - H * 0.1)} Z" fill="${haze(p1, T, 3)}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M${f(x - L * 0.45)},${f(y - H * 0.3)} Q${f(x)},${f(y + H * 0.35)} ${f(x + L * 0.45)},${f(y - H * 0.45)}" stroke="${haze(p2, T, 3)}" stroke-width="${f(H * 0.18)}" fill="none"/>
      <path d="M${f(x - L * 0.42)},${f(y - H * 0.05)} Q${f(x)},${f(y + H * 0.55)} ${f(x + L * 0.42)},${f(y - H * 0.2)}" stroke="${haze(p3, T, 3)}" stroke-width="${f(H * 0.12)}" fill="none"/>
      <path d="M${f(x - L * 0.2)},${f(y - H * 0.15)} l${f(L * 0.02)},${f(-H * 0.8)} M${f(x + L * 0.15)},${f(y - H * 0.18)} l${f(L * 0.02)},${f(-H * 0.6)}" stroke="${INK}" stroke-width="2"/></g>`;
  });
  // Cocotiers sur le côté
  const c2 = cam(w, h, { ...o, horizon: shore / h });
  s += palm(c2, T, -0.9, 1.1, 2.4, r) + palm(c2, T, 1.6, 2.2, 2.6, r);
  return s;
}

/** Dojo improvisé : cour avec tôles ondulées, tapis usés, sac de frappe, ampoule. */
function dojo(w, h, o) {
  const T = TIMES[o.time] || TIMES.couchant; const r = rng(o.seed || 21);
  const R = room(w, h, { ...o, depth: 6, roomW: 3, roomH: 2.6 }, {
    wall: '#6b6f78', floor: '#8a7f70', ceil: T.night ? '#141625' : mixHex(T.mid, T.top, 0.3),
    left: '#7b7f88', right: '#73777f', back: '#82868e',
  });
  const { c } = R;
  let s = R.s;
  // Pas de plafond : ciel ouvert (cour)
  s += `<path d="M${f(c.x(-3, 0.3))},${f(c.y(2.6, 0.3))} L${f(c.x(-3, 6))},${f(c.y(2.6, 6))} L${f(c.x(3, 6))},${f(c.y(2.6, 6))} L${f(c.x(3, 0.3))},${f(c.y(2.6, 0.3))} Z" fill="${mixHex(T.mid, T.top, 0.2)}"/>`;
  // Tôles ondulées (lignes verticales sur les murs)
  for (const X of [-3, 3]) for (let zz = 0.5; zz < 6; zz += 0.18) s += `<path d="M${f(c.x(X, zz))},${f(c.y(0, zz))} L${f(c.x(X, zz))},${f(c.y(2.6, zz))}" stroke="${mixHex('#3a3d44', T.haze, 0.2)}" stroke-width="${f(Math.max(0.5, 3 / zz))}" opacity=".55"/>`;
  for (let i = 0; i < 18; i++) { const xx = c.x(-3, 6) + (c.x(3, 6) - c.x(-3, 6)) * (i / 18); s += `<path d="M${f(xx)},${f(c.y(0, 6))} L${f(xx)},${f(c.y(2.6, 6))}" stroke="#5a5d64" stroke-width="2" opacity=".6"/>`; }
  // Rouille
  for (let i = 0; i < 5; i++) s += `<ellipse cx="${f(c.x(-3, 1 + r() * 4))}" cy="${f(c.y(r() * 2, 2))}" rx="${f(10 + r() * 20)}" ry="${f(6 + r() * 14)}" fill="#a4502c" opacity=".3"/>`;
  // Tapis (carrés bleus/rouges en perspective)
  const mats = ['#2f5d9b', '#b8332a'];
  for (let i = -2; i < 2; i++) for (let j = 0; j < 5; j++) {
    const z1 = 1 + j; const z2 = z1 + 1; const X1 = i * 1.2; const X2 = X1 + 1.2;
    s += `<path d="M${f(c.x(X1, z1))},${f(c.y(0, z1))} L${f(c.x(X2, z1))},${f(c.y(0, z1))} L${f(c.x(X2, z2))},${f(c.y(0, z2))} L${f(c.x(X1, z2))},${f(c.y(0, z2))} Z" fill="${mixHex(mats[(i + j + 4) % 2], T.top, T.night ? 0.4 : 0.1)}" stroke="${INK}" stroke-width="1.2" opacity=".92"/>`;
  }
  // Sac de frappe suspendu
  const px = c.x(2, 3); const pt = c.y(2.6, 3); const ps = c.s(3);
  s += `<path d="M${f(px)},${f(pt)} L${f(px)},${f(pt + ps * 0.4)}" stroke="${INK}" stroke-width="2"/>
    <rect x="${f(px - ps * 0.22)}" y="${f(pt + ps * 0.4)}" width="${f(ps * 0.44)}" height="${f(ps * 1.1)}" rx="${f(ps * 0.15)}" fill="#7a3a22" stroke="${INK}" stroke-width="3"/>
    <path d="M${f(px - ps * 0.22)},${f(pt + ps * 0.7)} h${f(ps * 0.44)} M${f(px - ps * 0.22)},${f(pt + ps * 1.2)} h${f(ps * 0.44)}" stroke="#4a2212" stroke-width="3"/>`;
  // Ampoule
  const bx = c.x(-0.5, 2.5); const by = c.y(2.4, 2.5);
  const lg = uid('bulb');
  s += `<defs><radialGradient id="${lg}"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
    <path d="M${f(bx)},${f(c.y(2.6, 2.5))} L${f(bx)},${f(by)}" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="${f(bx)}" cy="${f(by)}" r="${f(c.s(2.5) * (T.night ? 1.4 : 0.5))}" fill="url(#${lg})"/><circle cx="${f(bx)}" cy="${f(by)}" r="5" fill="#fff3cf" stroke="${INK}" stroke-width="1.5"/>`;
  return s;
}

/** Chambre d'étudiant la nuit : lit, bureau, ordi allumé, fenêtre sur la ville. */
function chambre(w, h, o) {
  const T = TIMES[o.time] || TIMES.nuit; const r = rng(o.seed || 23);
  const night = T.night;
  const R = room(w, h, { ...o, depth: 5, roomW: 2.6, roomH: 2.5 }, {
    wall: night ? '#1d2440' : '#d9c7a6', floor: night ? '#241c1a' : '#8a6a4a', ceil: night ? '#161b30' : '#e6dcc6',
    left: night ? '#20284a' : '#cdb894', right: night ? '#232b4e' : '#d6c29f', back: night ? '#262e52' : '#e2d1b0',
  });
  const { c } = R;
  let s = R.s;
  // Fenêtre (mur du fond) avec la ville
  const wx = c.x(-0.4, 5); const ww = c.x(1.4, 5) - wx; const wy = c.y(2.1, 5); const wh = c.y(1.0, 5) - wy;
  s += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" fill="${night ? '#0b1430' : T.low}" stroke="${INK}" stroke-width="2.4"/>`;
  for (let i = 0; i < 9; i++) { const bh = wh * (0.2 + r() * 0.4); const bx = wx + (ww / 9) * i; s += `<rect x="${f(bx)}" y="${f(wy + wh - bh)}" width="${f(ww / 9 + 0.5)}" height="${f(bh)}" fill="${night ? '#060a1c' : '#9aa3ad'}"/>`; if (night) for (let k = 0; k < 3; k++) if (r() < 0.6) s += `<rect x="${f(bx + 2 + r() * (ww / 9 - 4))}" y="${f(wy + wh - bh + 3 + r() * (bh - 6))}" width="2" height="2" fill="#ffcf6b"/>`; }
  if (night) s += `<circle cx="${f(wx + ww * 0.8)}" cy="${f(wy + wh * 0.22)}" r="${f(wh * 0.1)}" fill="#f4f1dc"/>`;
  s += `<path d="M${f(wx + ww / 2)},${f(wy)} V${f(wy + wh)}" stroke="${INK}" stroke-width="2"/>`;
  // Posters
  s += `<path d="${sideQuad(c, -2.6, 2.2, 3.0, 1.3, 2.1)}" fill="${night ? '#5b2a6e' : '#8b5cf6'}" stroke="${INK}" stroke-width="1.8"/>
    <path d="${sideQuad(c, -2.6, 3.2, 3.8, 1.4, 2.0)}" fill="${night ? '#1d4a5c' : '#22d3ee'}" stroke="${INK}" stroke-width="1.8"/>`;
  // Lit (à gauche) et bureau (à droite)
  s += box(c, -2.6, -1.0, 1.4, 4.4, 0.5, night ? '#3e4a7a' : '#6b8bd6', night ? '#2a3256' : '#4a64a8', night ? '#2a3256' : '#4a64a8');
  s += `<path d="M${f(c.x(-2.5, 3.9))},${f(c.y(0.5, 3.9))} L${f(c.x(-1.1, 3.9))},${f(c.y(0.5, 3.9))} L${f(c.x(-1.2, 4.3))},${f(c.y(0.62, 4.3))} L${f(c.x(-2.5, 4.3))},${f(c.y(0.62, 4.3))} Z" fill="${night ? '#c9cbe0' : '#f4f1e8'}" stroke="${INK}" stroke-width="1.6"/>`;
  s += box(c, 1.0, 2.6, 2.4, 3.6, 0.78, night ? '#4a3a2c' : '#8a6a4a', night ? '#33271d' : '#6a4a32', night ? '#2c2219' : '#5a3c24');
  // Ordinateur portable allumé (lueur bleue)
  const lx = c.x(1.8, 2.9); const ly = c.y(0.78, 2.9); const ls = c.s(2.9);
  const lg = uid('lap');
  s += `<defs><radialGradient id="${lg}"><stop offset="0" stop-color="#8be9ff" stop-opacity="${night ? 0.5 : 0.2}"/><stop offset="1" stop-color="#8be9ff" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${f(lx)}" cy="${f(ly - ls * 0.2)}" r="${f(ls * 1.3)}" fill="url(#${lg})"/>
    <path d="M${f(lx - ls * 0.3)},${f(ly)} L${f(lx + ls * 0.3)},${f(ly)} L${f(lx + ls * 0.26)},${f(ly - ls * 0.38)} L${f(lx - ls * 0.26)},${f(ly - ls * 0.38)} Z" fill="#20222c" stroke="${INK}" stroke-width="2"/>
    <path d="M${f(lx - ls * 0.23)},${f(ly - ls * 0.04)} L${f(lx + ls * 0.23)},${f(ly - ls * 0.04)} L${f(lx + ls * 0.2)},${f(ly - ls * 0.34)} L${f(lx - ls * 0.2)},${f(ly - ls * 0.34)} Z" fill="#8be9ff"/>
    <path d="M${f(lx - ls * 0.17)},${f(ly - ls * 0.28)} h${f(ls * 0.2)} M${f(lx - ls * 0.17)},${f(ly - ls * 0.22)} h${f(ls * 0.28)} M${f(lx - ls * 0.17)},${f(ly - ls * 0.16)} h${f(ls * 0.14)}" stroke="#1d4a5c" stroke-width="2"/>`;
  // Piles de livres et lampe de bureau
  for (let i = 0; i < 4; i++) s += `<rect x="${f(c.x(1.15, 3.2))}" y="${f(c.y(0.78, 3.2) - (i + 1) * c.s(3.2) * 0.05)}" width="${f(c.s(3.2) * 0.3)}" height="${f(c.s(3.2) * 0.05)}" fill="${['#8b2f2f', '#2f5d8b', '#c9a227', '#2f7d4a'][i]}" stroke="${INK}" stroke-width="1.2"/>`;
  return s;
}

// --- Décors abstraits (gros plans, moments forts) ----------------------
/** Lignes de concentration autour d'un point (fond blanc ou coloré). */
function flash(w, h, o) {
  const r = rng(o.seed || 31);
  const bg = o.color || '#ffffff';
  const cx = w * (o.cx ?? 0.5); const cy = h * (o.cy ?? 0.45);
  let s = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  const R = Math.hypot(w, h);
  for (let i = 0; i < 90; i++) {
    const a = r() * Math.PI * 2; const r0 = R * (0.2 + r() * 0.15); const da = 0.006 + r() * 0.012;
    s += `<path d="M${f(cx + Math.cos(a) * r0)},${f(cy + Math.sin(a) * r0)} L${f(cx + Math.cos(a - da) * R)},${f(cy + Math.sin(a - da) * R)} L${f(cx + Math.cos(a + da) * R)},${f(cy + Math.sin(a + da) * R)} Z" fill="${o.lines || INK}"/>`;
  }
  return s;
}
/** Aplat dégradé + trame (ambiance, émotion). */
function aplat(w, h, o) {
  const id = uid('ap'); const tn = uid('tn');
  const a = o.color || '#3a2a6a'; const b = o.color2 || mixHex(a, '#000000', 0.55);
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
    <pattern id="${tn}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="5" cy="5" r="1.6" fill="#000" opacity=".22"/></pattern></defs>
    <rect width="${w}" height="${h}" fill="url(#${id})"/><rect width="${w}" height="${h}" fill="url(#${tn})"/>`;
}
/** Le néant de l'Oubli : violet profond, carrés "effacés", particules. */
function oubli(w, h, o) {
  const r = rng(o.seed || 41);
  let s = aplat(w, h, { color: '#1a0b2e', color2: '#050208' });
  for (let i = 0; i < 40; i++) {
    const sz = 4 + r() * 26;
    s += `<rect x="${f(r() * w)}" y="${f(r() * h)}" width="${f(sz)}" height="${f(sz * (0.3 + r()))}" fill="${['#7c3aed', '#c4b5fd', '#000000', '#22d3ee'][Math.floor(r() * 4)]}" opacity="${f(0.15 + r() * 0.5)}"/>`;
  }
  for (let i = 0; i < 8; i++) { const y = r() * h; s += `<rect x="0" y="${f(y)}" width="${w}" height="${f(1 + r() * 3)}" fill="#c4b5fd" opacity=".18"/>`; }
  return s;
}
/** Écran de téléphone en très gros plan (message). */
function ecran(w, h, o) {
  const msg = o.text || '';
  const from = o.from || 'Inconnu';
  const time = o.clock || '03:12';
  const pw = Math.min(w * 0.82, h * 0.52); const ph = pw * 1.9;
  const px = (w - pw) / 2; const py = h * 0.06;
  const g = uid('scr');
  const lines = [];
  let cur = '';
  for (const word of msg.split(' ')) { if ((cur + ' ' + word).trim().length > 22 && cur) { lines.push(cur); cur = word; } else cur = (cur + ' ' + word).trim(); }
  if (cur) lines.push(cur);
  return `${aplat(w, h, { color: '#0b1022', color2: '#000' })}
    <defs><radialGradient id="${g}" cx="50%" cy="40%"><stop offset="0" stop-color="#8be9ff" stop-opacity=".45"/><stop offset="1" stop-color="#8be9ff" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${f(w / 2)}" cy="${f(py + ph * 0.4)}" r="${f(pw)}" fill="url(#${g})"/>
    <rect x="${f(px)}" y="${f(py)}" width="${f(pw)}" height="${f(ph)}" rx="${f(pw * 0.12)}" fill="#111118" stroke="${INK}" stroke-width="4"/>
    <rect x="${f(px + pw * 0.05)}" y="${f(py + pw * 0.05)}" width="${f(pw * 0.9)}" height="${f(ph - pw * 0.1)}" rx="${f(pw * 0.08)}" fill="#0e1430"/>
    <text x="${f(w / 2)}" y="${f(py + pw * 0.28)}" text-anchor="middle" font-family="Arial" font-size="${f(pw * 0.16)}" font-weight="700" fill="#e8ecff">${time}</text>
    <rect x="${f(px + pw * 0.1)}" y="${f(py + pw * 0.42)}" width="${f(pw * 0.8)}" height="${f(pw * 0.2 + lines.length * pw * 0.085)}" rx="${f(pw * 0.05)}" fill="#1f2a55" stroke="#8b5cf6" stroke-width="2"/>
    <text x="${f(px + pw * 0.15)}" y="${f(py + pw * 0.53)}" font-family="Arial" font-size="${f(pw * 0.065)}" font-weight="700" fill="#c4b5fd">${from}</text>
    ${lines.map((l, i) => `<text x="${f(px + pw * 0.15)}" y="${f(py + pw * 0.63 + i * pw * 0.085)}" font-family="Arial" font-size="${f(pw * 0.06)}" fill="#e8ecff">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`).join('')}`;
}

/** Écran d'ordinateur de Mory : carte de la presqu'île de Conakry et points d'attaque. */
function carte(w, h, o) {
  const r = rng(o.seed || 51);
  const id = uid('cg');
  let s = `${aplat(w, h, { color: '#0b1022', color2: '#000' })}
    <defs><radialGradient id="${id}" cx="50%" cy="50%"><stop offset="0" stop-color="#22d3ee" stop-opacity=".25"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient></defs>
    <rect x="${f(w * 0.06)}" y="${f(h * 0.08)}" width="${f(w * 0.88)}" height="${f(h * 0.8)}" rx="10" fill="#07121f" stroke="#2b3a4a" stroke-width="6"/>
    <rect x="${f(w * 0.06)}" y="${f(h * 0.08)}" width="${f(w * 0.88)}" height="${f(h * 0.8)}" fill="url(#${id})"/>`;
  // Grille
  for (let i = 1; i < 12; i++) s += `<path d="M${f(w * 0.06 + (w * 0.88 * i) / 12)},${f(h * 0.08)} V${f(h * 0.88)}" stroke="#22d3ee" stroke-width="1" opacity=".12"/>`;
  for (let i = 1; i < 8; i++) s += `<path d="M${f(w * 0.06)},${f(h * 0.08 + (h * 0.8 * i) / 8)} H${f(w * 0.94)}" stroke="#22d3ee" stroke-width="1" opacity=".12"/>`;
  // Presqu'île (longue bande vers le sud-ouest) + continent
  const P = (x, y) => `${f(w * x)},${f(h * y)}`;
  s += `<path d="M${P(0.94, 0.2)} L${P(0.62, 0.22)} Q${P(0.5, 0.3)} ${P(0.42, 0.42)} L${P(0.22, 0.7)} Q${P(0.16, 0.78)} ${P(0.2, 0.82)} Q${P(0.27, 0.8)} ${P(0.34, 0.68)} L${P(0.52, 0.48)} Q${P(0.62, 0.4)} ${P(0.94, 0.42)} Z" fill="#0f2a3a" stroke="#22d3ee" stroke-width="2.5"/>
    <path d="M${P(0.3, 0.62)} L${P(0.6, 0.32)} M${P(0.45, 0.6)} L${P(0.8, 0.3)}" stroke="#22d3ee" stroke-width="1.4" opacity=".4"/>
    <text x="${f(w * 0.2)}" y="${f(h * 0.9 - 8)}" font-family="monospace" font-size="${f(h * 0.045)}" fill="#22d3ee">KALOUM</text>
    <text x="${f(w * 0.09)}" y="${f(h * 0.14)}" font-family="monospace" font-size="${f(h * 0.05)}" fill="#8be9ff">${esc(o.text || 'OUBLI · ATTAQUES · 7 JOURS')}</text>`;
  // Points d'attaque (violet) + cible principale (pulsation)
  for (let i = 0; i < (o.spots ?? 7); i++) {
    const t = r(); const x = 0.24 + t * 0.6; const y = 0.72 - t * 0.42 + (r() - 0.5) * 0.08;
    s += `<circle cx="${P(x, y).split(',')[0]}" cy="${P(x, y).split(',')[1]}" r="${f(h * 0.018)}" fill="#c084fc"/><circle cx="${P(x, y).split(',')[0]}" cy="${P(x, y).split(',')[1]}" r="${f(h * 0.04)}" fill="none" stroke="#c084fc" stroke-width="2" opacity=".5"/>`;
  }
  if (o.target) {
    const [x, y] = o.target;
    s += `<circle cx="${f(w * x)}" cy="${f(h * y)}" r="${f(h * 0.03)}" fill="#ff3d5a"/><circle cx="${f(w * x)}" cy="${f(h * y)}" r="${f(h * 0.08)}" fill="none" stroke="#ff3d5a" stroke-width="3"/>
      <circle cx="${f(w * x)}" cy="${f(h * y)}" r="${f(h * 0.13)}" fill="none" stroke="#ff3d5a" stroke-width="2" opacity=".5"/>
      <text x="${f(w * x + h * 0.1)}" y="${f(h * y - h * 0.06)}" font-family="monospace" font-size="${f(h * 0.045)}" font-weight="700" fill="#ff8a9a">${esc(o.label || 'CIBLE')}</text>`;
  }
  // Barre de chargement (humour : connexion lente)
  if (o.loading !== undefined) {
    s += `<rect x="${f(w * 0.56)}" y="${f(h * 0.8)}" width="${f(w * 0.34)}" height="${f(h * 0.035)}" fill="#0b1022" stroke="#22d3ee" stroke-width="1.5"/>
      <rect x="${f(w * 0.56)}" y="${f(h * 0.8)}" width="${f(w * 0.34 * o.loading)}" height="${f(h * 0.035)}" fill="#22d3ee"/>`;
  }
  return s;
}
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------------------------------------------------------------------
// Catalogue des décors (nom utilisé dans les chapitres → fonction)
// ---------------------------------------------------------------------
export const DECORS = { corniche, rue, marche, classe, bibliotheque, toit, plage, dojo, chambre, flash, aplat, oubli, ecran, carte };

/** Dessine un décor (inconnu → aplat). */
export function decorSVG(name, w, h, o = {}) {
  const fn = DECORS[name] || aplat;
  return fn(w, h, o);
}
