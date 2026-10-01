// =====================================================================
// ville.js — DÉCORS DÉTAILLÉS DE CONAKRY (rue, corniche, toits, chambre)
// ---------------------------------------------------------------------
// Moins de décors, mais beaucoup plus travaillés :
//   - perspective à UN point de fuite par case (cam() dans decors.js) ;
//   - immeubles en VOLUME (façade + mur de bout), ombres portées ;
//   - textures : murs usés et tachés, coulures, climatiseurs, persiennes,
//     balcons, linge, enseignes peintes, rideaux de fer, cuves d'eau,
//     fers à béton qui dépassent des toits (immeubles en chantier) ;
//   - rue vivante : poteaux et fils électriques, manguiers, motos et
//     taxis jaunes garés, nids-de-poule, flaques, terre rouge, déchets ;
//   - profondeur : brume au loin, rayons du soleil, premier plan sombre.
// =====================================================================

import { mixHex, INK } from './body.js';
import { TIMES, rng, cam, sky, haze, uid, taxi, moto, walker, palm, lamp } from './decors.js';

const f = (n) => Math.round(n * 10) / 10;
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const quad = (c, X, za, zb, ya, yb) => `M${f(c.x(X, za))},${f(c.y(ya, za))} L${f(c.x(X, zb))},${f(c.y(ya, zb))} L${f(c.x(X, zb))},${f(c.y(yb, zb))} L${f(c.x(X, za))},${f(c.y(yb, za))} Z`;
/** Quadrilatère sur un plan vertical PERPENDICULAIRE à la rue (mur de bout) à la profondeur z. */
const endQuad = (c, Xa, Xb, z, ya, yb) => `M${f(c.x(Xa, z))},${f(c.y(ya, z))} L${f(c.x(Xb, z))},${f(c.y(ya, z))} L${f(c.x(Xb, z))},${f(c.y(yb, z))} L${f(c.x(Xa, z))},${f(c.y(yb, z))} Z`;
const lw = (c, z, k = 1) => f(Math.max(0.35, (c.s(z) * 0.006) * k));

const SIGNS = ['ALIMENTATION', 'PHARMACIE', 'TRANSFERT', 'COUTURE', 'RECHARGE', 'QUINCAILLERIE', 'BOUTIQUE', 'COIFFURE', 'CYBER', 'MÉCANIQUE'];
const WALLS = ['#e7d3a8', '#f0e3c8', '#c9dbe6', '#e9c4b0', '#d6e0c0', '#efd27e', '#b7d4c4', '#e8b8a0', '#d9cfc0'];

/** Texte peint sur un mur vu en fuite (approximation affine). */
function wallText(c, X, za, zb, Y, text, color, size) {
  const x1 = c.x(X, za); const y1 = c.y(Y, za); const x2 = c.x(X, zb); const y2 = c.y(Y, zb);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 14) return '';
  const ux = (x2 - x1) / len; const uy = (y2 - y1) / len;
  const fs = Math.min(size, (len * 0.86) / (text.length * 0.62));
  if (fs < 4) return '';
  const flipText = ux < 0; // côté gauche de la rue : le texte se lit dans l'autre sens
  const ax = flipText ? x2 : x1; const ay = flipText ? y2 : y1;
  const vx = flipText ? -ux : ux; const vy = flipText ? -uy : uy;
  return `<text transform="matrix(${f(vx * 100) / 100},${f(vy * 100) / 100},0,1,${f(ax)},${f(ay)})" x="${f(len * 0.07)}" y="${f(fs * 0.35)}" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="${f(fs)}" fill="${color}">${esc(text)}</text>`;
}

// ---------------------------------------------------------------------
// IMMEUBLE en volume (façade sur la rue + mur de bout), très détaillé
// ---------------------------------------------------------------------
function building(c, T, b, r) {
  const { X, zn, zf, H } = b;
  const side = Math.sign(X);
  const near = zn;
  const col = haze(b.color, T, near);
  const colDark = mixHex(col, '#000000', 0.28);
  const fade = Math.min(0.8, near / 30);
  const ink = haze(INK, T, near + 4);
  let s = '';
  // Mur de bout (face caméra) : donne le VOLUME
  s += `<path d="${endQuad(c, X, X + side * 2.2, zn, 0, H)}" fill="${colDark}" stroke="${ink}" stroke-width="${lw(c, zn, 0.6)}"/>`;
  // Fenêtres sur le mur de bout
  if (near < 12) {
    for (let fl = 1; fl * 0.95 + 0.6 < H; fl++) {
      const ya = fl * 0.95 + 0.25; const yb = ya + 0.45;
      s += `<path d="${endQuad(c, X + side * 0.6, X + side * 1.2, zn, ya, yb)}" fill="${T.night && r() < 0.5 ? '#ffcf6b' : mixHex('#1c2232', T.haze, fade)}"/>`;
    }
  }
  // Façade (côté rue)
  s += `<path d="${quad(c, X, zf, zn, 0, H)}" fill="${col}" stroke="${ink}" stroke-width="${lw(c, near, 0.6)}"/>`;
  // Saleté au pied du mur + coulures + taches
  s += `<path d="${quad(c, X, zf, zn, 0, 0.35)}" fill="#5a3a22" opacity="${f(0.22 * (1 - fade))}"/>`;
  for (let i = 0; i < 5; i++) {
    const z0 = zn + (zf - zn) * r(); const z1 = z0 + 0.25 + r() * 0.6; const y0 = 0.4 + r() * (H - 0.8); const y1 = y0 + 0.3 + r() * 0.6;
    s += `<path d="${quad(c, X, z0, Math.min(z1, zf), y0, y1)}" fill="#3a2a1c" opacity="${f((0.06 + r() * 0.1) * (1 - fade))}"/>`;
  }
  // Rez-de-chaussée : boutique (rideau de fer ou ouverte) + enseigne + auvent
  const bays = Math.max(1, Math.round((zf - zn) / 1.1));
  const bayZ = (i) => zn + ((zf - zn) * i) / bays;
  for (let i = 0; i < bays; i++) {
    const za = bayZ(i) + 0.1; const zb = bayZ(i + 1) - 0.1;
    const nz = Math.min(za, zb);
    const open = b.open ?? r() < 0.55;
    if (open) {
      s += `<path d="${quad(c, X, za, zb, 0, 0.82)}" fill="${T.night ? '#3a2a14' : mixHex('#20180f', T.haze, fade * 0.6)}"/>`;
      if (T.night) s += `<path d="${quad(c, X, za, zb, 0, 0.82)}" fill="#ffcf6b" opacity=".35"/>`;
      // marchandises (rangées colorées)
      if (nz < 14) for (let k = 0; k < 3; k++) s += `<path d="${quad(c, X, za + 0.08, zb - 0.08, 0.15 + k * 0.2, 0.28 + k * 0.2)}" fill="${['#e8442e', '#f5c518', '#2f86d6', '#1f9d55', '#f2f0fa'][Math.floor(r() * 5)]}" opacity="${f(0.85 - fade)}"/>`;
    } else { // rideau de fer
      s += `<path d="${quad(c, X, za, zb, 0, 0.82)}" fill="${haze('#8a8f98', T, nz)}" stroke="${ink}" stroke-width="${lw(c, nz, 0.4)}"/>`;
      if (nz < 16) for (let k = 1; k < 7; k++) s += `<path d="M${f(c.x(X, za))},${f(c.y(k * 0.115, za))} L${f(c.x(X, zb))},${f(c.y(k * 0.115, zb))}" stroke="${haze('#5c616a', T, nz)}" stroke-width="${lw(c, nz, 0.5)}"/>`;
    }
  }
  // Enseigne peinte sur toute la longueur
  if (b.sign !== false) {
    const sc = haze(b.signColor || ['#e8442e', '#2f86d6', '#1f9d55', '#f5c518', '#8b5cf6'][Math.floor(r() * 5)], T, near);
    s += `<path d="${quad(c, X, zf - 0.1, zn + 0.1, 0.88, 1.12)}" fill="${sc}" stroke="${ink}" stroke-width="${lw(c, near, 0.5)}"/>`;
    if (near < 18) s += wallText(c, X, zn + 0.25, zf - 0.25, 0.94, b.signText || SIGNS[Math.floor(r() * SIGNS.length)], '#ffffff', c.s((zn + zf) / 2) * 0.2);
  }
  // Auvent en tôle au-dessus de la boutique
  if (b.awning !== false && near < 20) {
    const aw = haze(['#b8332a', '#2f5d9b', '#8a8f98', '#1f7d4a'][Math.floor(r() * 4)], T, near);
    const P = (Xx, Y, z) => `${f(c.x(Xx, z))},${f(c.y(Y, z))}`;
    s += `<path d="M${P(X, 1.16, zf)} L${P(X, 1.16, zn)} L${P(X - side * 0.7, 0.96, zn)} L${P(X - side * 0.7, 0.96, zf)} Z" fill="${aw}" stroke="${ink}" stroke-width="${lw(c, near, 0.5)}"/>`;
    for (let k = 1; k < 8; k++) { const z = zn + ((zf - zn) * k) / 8; s += `<path d="M${P(X, 1.16, z)} L${P(X - side * 0.7, 0.96, z)}" stroke="${mixHex(aw, '#000', 0.3)}" stroke-width="${lw(c, z, 0.4)}"/>`; }
  }
  // Étages : fenêtres (persiennes, climatiseurs), balcons, linge
  const floors = Math.floor((H - 1.3) / 0.95);
  const hasBalcony = b.balcony ?? r() < 0.5;
  for (let fl = 0; fl < floors; fl++) {
    const ya = 1.45 + fl * 0.95; const yb = ya + 0.55;
    for (let i = 0; i < bays; i++) {
      const za = bayZ(i) + 0.28; const zb = bayZ(i + 1) - 0.28;
      if (zb - za < 0.15) continue;
      const nz = Math.min(za, zb);
      const lit = T.night && r() < 0.5;
      s += `<path d="${quad(c, X, za, zb, ya, yb)}" fill="${lit ? '#ffcf6b' : mixHex('#1c2232', T.haze, fade)}" stroke="${ink}" stroke-width="${lw(c, nz, 0.45)}"/>`;
      if (!lit && r() < 0.5 && nz < 14) for (let k = 1; k < 5; k++) s += `<path d="M${f(c.x(X, za))},${f(c.y(ya + k * 0.11, za))} L${f(c.x(X, zb))},${f(c.y(ya + k * 0.11, zb))}" stroke="${mixHex(col, '#ffffff', 0.15)}" stroke-width="${lw(c, nz, 0.5)}"/>`;
      // coulure sous la fenêtre
      if (r() < 0.4) s += `<path d="${quad(c, X, za + (zb - za) * 0.4, za + (zb - za) * 0.6, ya - 0.5, ya)}" fill="#3a2a1c" opacity="${f(0.12 * (1 - fade))}"/>`;
      // climatiseur
      if (r() < 0.3 && nz < 16) {
        const ca = za + (zb - za) * 0.15; const cb = za + (zb - za) * 0.75;
        s += `<path d="${quad(c, X - side * 0.02, ca, cb, ya - 0.32, ya - 0.06)}" fill="${haze('#e6e8ec', T, nz)}" stroke="${ink}" stroke-width="${lw(c, nz, 0.5)}"/>`;
        if (nz < 8) for (let k = 1; k < 4; k++) s += `<path d="M${f(c.x(X, ca + (cb - ca) * k / 4))},${f(c.y(ya - 0.3, ca))} L${f(c.x(X, ca + (cb - ca) * k / 4))},${f(c.y(ya - 0.08, ca))}" stroke="${haze('#9aa0a8', T, nz)}" stroke-width="${lw(c, nz, 0.4)}"/>`;
      }
    }
    // Balcon : dalle + garde-corps + linge qui sèche
    if (hasBalcony && near < 22) {
      const P = (Xx, Y, z) => `${f(c.x(Xx, z))},${f(c.y(Y, z))}`;
      const bx = X - side * 0.45;
      s += `<path d="M${P(X, ya - 0.08, zf)} L${P(X, ya - 0.08, zn)} L${P(bx, ya - 0.08, zn)} L${P(bx, ya - 0.08, zf)} Z" fill="${mixHex(col, '#000', 0.12)}" stroke="${ink}" stroke-width="${lw(c, near, 0.5)}"/>
        <path d="M${P(bx, ya - 0.08, zn)} L${P(bx, ya - 0.08, zf)} L${P(bx, ya + 0.32, zf)} L${P(bx, ya + 0.32, zn)} Z" fill="none" stroke="${ink}" stroke-width="${lw(c, near, 0.7)}"/>`;
      for (let k = 0; k <= 10; k++) { const z = zn + ((zf - zn) * k) / 10; s += `<path d="M${P(bx, ya - 0.08, z)} L${P(bx, ya + 0.32, z)}" stroke="${ink}" stroke-width="${lw(c, z, 0.35)}" opacity=".7"/>`; }
      if (r() < 0.5) {
        for (let k = 0; k < 3; k++) {
          const z = zn + 0.4 + k * 0.5 + r() * 0.2;
          if (z > zf) break;
          s += `<path d="${quad(c, bx, z, z + 0.3, ya + 0.0, ya + 0.3)}" fill="${haze(['#e8442e', '#f5c518', '#2f86d6', '#ff8a3d', '#f2f0fa'][Math.floor(r() * 5)], T, z)}"/>`;
        }
      }
    }
  }
  // Toit : acrotère, cuve d'eau noire, fers à béton (immeuble jamais fini)
  const P = (Xx, Y, z) => `${f(c.x(Xx, z))},${f(c.y(Y, z))}`;
  s += `<path d="M${P(X, H, zf)} L${P(X, H, zn)}" stroke="${mixHex(col, '#000', 0.35)}" stroke-width="${f(Math.max(1, c.s(zn) * 0.03))}"/>`;
  if (r() < 0.6) {
    const tz = zn + 0.4; const tx = X + side * 0.7; const tw = 0.42; const th = 0.62;
    s += `<path d="M${P(tx - tw, H, tz)} L${P(tx - tw, H + th, tz)} Q${P(tx, H + th + 0.08, tz)} ${P(tx + tw, H + th, tz)} L${P(tx + tw, H, tz)} Z" fill="${haze('#15151b', T, tz)}"/>`;
  }
  if (r() < 0.5) for (let k = 0; k < 4; k++) { const z = zn + 0.3 + k * 0.25; s += `<path d="M${P(X + side * 0.2, H, z)} L${P(X + side * 0.22, H + 0.5, z)}" stroke="${haze('#5a4030', T, z)}" stroke-width="${lw(c, z, 0.6)}"/>`; }
  return s;
}

/** Poteau électrique + transformateur. Renvoie le point d'attache des fils. */
function pole(c, T, X, z) {
  const x = c.x(X, z); const y = c.y(0, z); const s0 = c.s(z); const top = c.y(3.6, z);
  const col = haze('#6b6458', T, z);
  const svg = `<path d="M${f(x - s0 * 0.04)},${f(y)} L${f(x - s0 * 0.025)},${f(top)} L${f(x + s0 * 0.025)},${f(top)} L${f(x + s0 * 0.04)},${f(y)} Z" fill="${col}" stroke="${haze(INK, T, z + 4)}" stroke-width="${lw(c, z, 0.4)}"/>
    <path d="M${f(x - s0 * 0.35)},${f(c.y(3.4, z))} L${f(x + s0 * 0.35)},${f(c.y(3.4, z))}" stroke="${col}" stroke-width="${f(Math.max(1, s0 * 0.03))}"/>
    <rect x="${f(x - s0 * 0.09)}" y="${f(c.y(3.0, z))}" width="${f(s0 * 0.18)}" height="${f(s0 * 0.22)}" rx="${f(s0 * 0.03)}" fill="${haze('#4a4f58', T, z)}"/>`;
  return { svg, a: [x - s0 * 0.3, c.y(3.4, z)], b: [x + s0 * 0.3, c.y(3.4, z)], m: [x, c.y(3.35, z)] };
}
/** Fils électriques qui pendent (chaînettes) entre deux points. */
function wires(p, q, n, col, sag) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const dy = sag * (0.7 + i * 0.25);
    s += `<path d="M${f(p[0])},${f(p[1] + i * 3)} Q${f((p[0] + q[0]) / 2)},${f((p[1] + q[1]) / 2 + dy)} ${f(q[0])},${f(q[1] + i * 3)}" stroke="${col}" stroke-width="1.2" fill="none" opacity=".8"/>`;
  }
  return s;
}

/** Manguier : tronc + grande ramure en grappes, lumière à droite. */
function mango(c, T, X, z, r) {
  const x = c.x(X, z); const y = c.y(0, z); const s0 = c.s(z);
  const trunk = haze('#4a3424', T, z);
  const dark = haze(T.night ? '#0d2414' : '#24592a', T, z); const mid = haze(T.night ? '#143a1e' : '#2f7d32', T, z); const light = haze(T.night ? '#1d4a28' : '#58a33c', T, z);
  let s = `<path d="M${f(x - s0 * 0.09)},${f(y)} Q${f(x - s0 * 0.05)},${f(y - s0 * 0.8)} ${f(x - s0 * 0.2)},${f(y - s0 * 1.4)} L${f(x - s0 * 0.1)},${f(y - s0 * 1.45)} Q${f(x + s0 * 0.02)},${f(y - s0 * 1.0)} ${f(x + s0 * 0.12)},${f(y - s0 * 1.5)} L${f(x + s0 * 0.2)},${f(y - s0 * 1.42)} Q${f(x + s0 * 0.06)},${f(y - s0 * 0.8)} ${f(x + s0 * 0.09)},${f(y)} Z" fill="${trunk}"/>`;
  const cx = x; const cy = y - s0 * 1.9; const R = s0 * 0.95;
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; s += `<circle cx="${f(cx + Math.cos(a) * R * 0.62)}" cy="${f(cy + Math.sin(a) * R * 0.42)}" r="${f(R * (0.42 + r() * 0.14))}" fill="${dark}"/>`; }
  s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 0.62)}" fill="${dark}"/>`;
  for (let i = 0; i < 7; i++) s += `<circle cx="${f(cx + (r() - 0.2) * R * 0.9)}" cy="${f(cy - R * 0.2 + (r() - 0.5) * R * 0.6)}" r="${f(R * (0.22 + r() * 0.12))}" fill="${mid}"/>`;
  for (let i = 0; i < 5; i++) s += `<circle cx="${f(cx + R * (0.2 + r() * 0.45))}" cy="${f(cy - R * (0.15 + r() * 0.35))}" r="${f(R * (0.1 + r() * 0.08))}" fill="${light}"/>`;
  return s;
}

/** Moto garée (vue de côté, en perspective simplifiée). */
function parkedMoto(c, T, X, z, color) {
  const x = c.x(X, z); const y = c.y(0, z); const s0 = c.s(z);
  const ink = haze(INK, T, z); const col = haze(color, T, z);
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s0 * 0.4)}" ry="${f(s0 * 0.04)}" fill="#000" opacity=".25"/>
    <circle cx="${f(x - s0 * 0.26)}" cy="${f(y - s0 * 0.13)}" r="${f(s0 * 0.12)}" fill="none" stroke="${ink}" stroke-width="${f(s0 * 0.045)}"/>
    <circle cx="${f(x + s0 * 0.26)}" cy="${f(y - s0 * 0.13)}" r="${f(s0 * 0.12)}" fill="none" stroke="${ink}" stroke-width="${f(s0 * 0.045)}"/>
    <path d="M${f(x - s0 * 0.26)},${f(y - s0 * 0.14)} L${f(x - s0 * 0.05)},${f(y - s0 * 0.34)} L${f(x + s0 * 0.18)},${f(y - s0 * 0.32)} L${f(x + s0 * 0.26)},${f(y - s0 * 0.14)}" fill="none" stroke="${col}" stroke-width="${f(s0 * 0.08)}" stroke-linejoin="round"/>
    <path d="M${f(x - s0 * 0.12)},${f(y - s0 * 0.4)} L${f(x + s0 * 0.08)},${f(y - s0 * 0.4)}" stroke="${ink}" stroke-width="${f(s0 * 0.06)}" stroke-linecap="round"/>
    <path d="M${f(x + s0 * 0.18)},${f(y - s0 * 0.34)} L${f(x + s0 * 0.24)},${f(y - s0 * 0.52)} L${f(x + s0 * 0.32)},${f(y - s0 * 0.52)}" fill="none" stroke="${ink}" stroke-width="${f(s0 * 0.03)}"/>`;
}

/** Sol de la rue : bitume rapiécé, fissures, nids-de-poule, flaques, terre rouge, déchets. */
function streetGround(c, T, o, r, zN, zF) {
  let s = `<rect y="${f(c.hz)}" width="${f(c.vx * 2 + 4000)}" x="-2000" height="4000" fill="${mixHex(T.ground, '#3a3a42', 0.55)}"/>`;
  // Rapiéçages du bitume
  for (let i = 0; i < 10; i++) {
    const z = 1 + r() * 18; const X = -1.6 + r() * 3.2; const w = 0.3 + r() * 0.8; const d = 0.4 + r() * 1.5;
    s += `<path d="M${f(c.x(X, z))},${f(c.y(0, z))} L${f(c.x(X + w, z))},${f(c.y(0, z))} L${f(c.x(X + w, z + d))},${f(c.y(0, z + d))} L${f(c.x(X, z + d))},${f(c.y(0, z + d))} Z" fill="${mixHex(T.ground, '#2a2a30', 0.6)}" opacity="${f(0.5 + r() * 0.3)}"/>`;
  }
  // Fissures
  for (let i = 0; i < 6; i++) {
    let z = 0.8 + r() * 8; let X = -1.5 + r() * 3; let d = `M${f(c.x(X, z))},${f(c.y(0, z))}`;
    for (let k = 0; k < 5; k++) { X += (r() - 0.5) * 0.4; z += 0.2 + r() * 0.3; d += ` L${f(c.x(X, z))},${f(c.y(0, z))}`; }
    s += `<path d="${d}" stroke="#15151a" stroke-width="1.2" fill="none" opacity=".6"/>`;
  }
  // Ligne médiane effacée
  for (let z = 1.2; z < 40; z *= 1.4) s += `<path d="M${f(c.x(0, z))},${f(c.y(0, z))} L${f(c.x(0, z * 1.15))},${f(c.y(0, z * 1.15))}" stroke="${haze('#e8e4d4', T, z)}" stroke-width="${f(Math.max(0.6, c.s(z) * 0.035))}" opacity=".55"/>`;
  // Nids-de-poule et flaques (reflets du ciel)
  for (let i = 0; i < (o.time === 'pluie' ? 9 : 4); i++) {
    const z = 0.9 + r() * 10; const X = -1.6 + r() * 3.2; const rx = c.s(z) * (0.2 + r() * 0.35);
    const wet = o.time === 'pluie' || r() < 0.4;
    s += `<ellipse cx="${f(c.x(X, z))}" cy="${f(c.y(0, z))}" rx="${f(rx)}" ry="${f(rx * 0.16)}" fill="${wet ? mixHex(T.low, T.mid, 0.4) : '#1a1a20'}" opacity="${wet ? 0.7 : 0.55}"/>`;
    if (wet) s += `<ellipse cx="${f(c.x(X, z) - rx * 0.2)}" cy="${f(c.y(0, z) - rx * 0.03)}" rx="${f(rx * 0.5)}" ry="${f(rx * 0.04)}" fill="#ffffff" opacity=".35"/>`;
  }
  // Trottoirs + bordures + terre rouge
  for (const side of [-1, 1]) {
    const Xi = side * 2.0; const Xo = side * 3.4;
    s += `<path d="M${f(c.x(Xo, zN))},${f(c.y(0, zN))} L${f(c.x(Xo, zF))},${f(c.y(0, zF))} L${f(c.x(Xi, zF))},${f(c.y(0, zF))} L${f(c.x(Xi, zN))},${f(c.y(0, zN))} Z" fill="${mixHex(T.ground, '#b9a58c', 0.45)}"/>`;
    s += `<path d="M${f(c.x(Xi, zN))},${f(c.y(0, zN))} L${f(c.x(Xi, zF))},${f(c.y(0, zF))}" stroke="${haze('#d9d2c0', T, 3)}" stroke-width="${f(Math.max(1, c.s(1) * 0.03))}"/>`;
    s += `<path d="M${f(c.x(Xi - side * 0.05, zN))},${f(c.y(0, zN))} L${f(c.x(Xi - side * 0.05, zF))},${f(c.y(0, zF))} L${f(c.x(Xi - side * 0.4, zF))},${f(c.y(0, zF))} L${f(c.x(Xi - side * 0.4, zN))},${f(c.y(0, zN))} Z" fill="#a4502c" opacity=".35"/>`;
    // Déchets légers (sachets, papiers) près du trottoir
    for (let i = 0; i < 10; i++) {
      const z = 0.8 + r() * 12; const X = Xi - side * (0.05 + r() * 0.35);
      s += `<ellipse cx="${f(c.x(X, z))}" cy="${f(c.y(0, z))}" rx="${f(c.s(z) * 0.03)}" ry="${f(c.s(z) * 0.012)}" fill="${['#f2f0fa', '#2f86d6', '#1a1a20', '#e8442e'][Math.floor(r() * 4)]}" opacity=".7"/>`;
    }
  }
  return s;
}

/** Brume au loin + rayons de soleil + vignettage de premier plan. */
function atmosphere(w, h, c, T, o, r) {
  const id = uid('fog');
  let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.haze}" stop-opacity="0"/><stop offset=".5" stop-color="${T.haze}" stop-opacity="${T.night ? 0.25 : 0.45}"/><stop offset="1" stop-color="${T.haze}" stop-opacity="0"/></linearGradient></defs>
    <rect x="0" y="${f(c.hz - h * 0.18)}" width="${w}" height="${f(h * 0.3)}" fill="url(#${id})"/>`;
  if (!T.night && o.time !== 'pluie' && o.rays !== false) {
    const sx = w * (o.sunX ?? 0.72); const sy = o.time === 'jour' ? c.hz * 0.2 : c.hz * 0.85;
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * (0.3 + r() * 0.5); const L = Math.hypot(w, h) * 1.2; const da = 0.02 + r() * 0.04;
      s += `<path d="M${f(sx)},${f(sy)} L${f(sx + Math.cos(a - da) * L)},${f(sy + Math.sin(a - da) * L)} L${f(sx + Math.cos(a + da) * L)},${f(sy + Math.sin(a + da) * L)} Z" fill="${T.sun}" opacity=".07"/>`;
    }
  }
  return s;
}

/** Élément sombre de premier plan (feuillage, poteau) : profondeur de champ. */
function foreground(w, h, kind, T, side = 1) {
  const col = T.night ? '#05040a' : '#0d1a10';
  if (kind === 'feuilles') {
    let s = '';
    const x0 = side > 0 ? w : 0;
    for (let i = 0; i < 7; i++) {
      const a = (side > 0 ? Math.PI : 0) + (i - 3) * 0.22;
      const L = w * (0.22 + (i % 3) * 0.06);
      const ex = x0 + Math.cos(a) * L; const ey = h * 0.05 + Math.sin(a) * L * 0.6 + i * h * 0.02;
      s += `<path d="M${f(x0)},${f(-10)} Q${f((x0 + ex) / 2)},${f(ey - L * 0.2)} ${f(ex)},${f(ey)} Q${f((x0 + ex) / 2 + 20)},${f(ey + 10)} ${f(x0)},${f(30)} Z" fill="${col}" opacity=".92"/>`;
    }
    return s;
  }
  if (kind === 'poteau') {
    const x = side > 0 ? w * 0.94 : w * 0.06;
    return `<rect x="${f(x - w * 0.03)}" y="0" width="${f(w * 0.06)}" height="${h}" fill="${col}"/>`;
  }
  return '';
}

// =====================================================================
// LA RUE DE KALOUM
// =====================================================================
export function rue(w, h, o) {
  const T = TIMES[o.time] || TIMES.jour; const r = rng(o.seed || 3); const c = cam(w, h, o);
  let s = sky(w, h, T, o, r, c.hz);
  const zN = 0.3; const zF = 90;
  s += streetGround(c, T, o, r, zN, zF);
  // Ombre portée des immeubles du côté opposé au soleil
  const sunRight = (o.sunX ?? 0.72) > 0.5;
  if (!T.night && o.time !== 'pluie') {
    const sd = sunRight ? 1 : -1;
    s += `<path d="M${f(c.x(sd * 2.0, zN))},${f(c.y(0, zN))} L${f(c.x(sd * 2.0, zF))},${f(c.y(0, zF))} L${f(c.x(sd * 0.3, zF))},${f(c.y(0, zF))} L${f(c.x(sd * 0.6, zN))},${f(c.y(0, zN))} Z" fill="#1a1020" opacity=".22"/>`;
  }
  // Immeubles des deux côtés (du plus loin au plus près)
  const blocks = [];
  for (const side of [-1, 1]) {
    let z = 0.9;
    while (z < 60) {
      const z2 = z * (1.35 + r() * 0.35);
      blocks.push({ X: side * (3.4 + (r() < 0.35 ? 0.5 : 0)), zn: z, zf: z2, H: 2.3 + r() * 2.8, color: WALLS[Math.floor(r() * WALLS.length)] });
      z = z2 * 1.01;
    }
  }
  blocks.sort((a, b) => b.zn - a.zn);
  // Éléments de rue (poteaux, arbres, véhicules, passants), triés par profondeur avec les immeubles
  const items = [];
  for (let z = 1.6; z < 50; z *= 1.55) items.push({ z, k: 'pole', X: 2.25 });
  for (let z = 2.4; z < 40; z *= 2.1) items.push({ z, k: 'mango', X: -2.4 });
  items.push({ z: 1.8 + r() * 2, k: 'pmoto', X: -2.15, col: '#e8442e' }, { z: 4 + r() * 3, k: 'pmoto', X: 2.15, col: '#2f86d6' }, { z: 7 + r() * 4, k: 'ptaxi', X: -1.65 });
  if (o.cars !== false) items.push({ z: 14, k: 'taxi', X: 0.7, front: true }, { z: 9, k: 'moto', X: -0.7, col: '#8b5cf6' }, { z: 22, k: 'taxi', X: -0.6 });
  for (const v of o.vehicles || []) items.push({ z: v.z, k: v.k || 'taxi', X: v.X ?? 0, front: v.front, col: v.col });
  for (let i = 0; i < (o.crowd ?? 7); i++) items.push({ z: 3 + r() * 26, k: 'walker', X: (r() < 0.5 ? -1 : 1) * (2.3 + r() * 0.8) });
  const all = [...blocks.map((b) => ({ ...b, k: 'block', z: b.zn })), ...items].sort((a, b) => b.z - a.z);
  const poles = [];
  for (const it of all) {
    if (it.k === 'block') s += building(c, T, it, r);
    else if (it.k === 'pole') { const p = pole(c, T, it.X, it.z); poles.push(p); s += p.svg; }
    else if (it.k === 'mango') s += mango(c, T, it.X, it.z, r);
    else if (it.k === 'pmoto') s += parkedMoto(c, T, it.X, it.z, it.col);
    else if (it.k === 'ptaxi' || it.k === 'taxi') s += taxi(c, T, it.X, it.z, it.front);
    else if (it.k === 'moto') s += moto(c, T, it.X, it.z, it.col);
    else if (it.k === 'walker') s += walker(c, T, it.X, it.z, r);
  }
  // Fils électriques entre les poteaux (et quelques-uns en travers de la rue)
  poles.sort((a, b) => a.m[1] - b.m[1]);
  for (let i = 0; i < poles.length - 1; i++) s += wires(poles[i].a, poles[i + 1].a, 3, haze(INK, T, 6), 6 + i * 3);
  if (poles.length) s += wires(poles[poles.length - 1].b, [c.x(-3.4, 2), c.y(3.6, 2)], 2, INK, 22);
  s += atmosphere(w, h, c, T, o, r);
  if (o.fg) s += foreground(w, h, o.fg, T, o.fgSide ?? 1);
  return s;
}

// =====================================================================
// LE MARCHÉ (Madina) : la rue + étals, bâches, tissus wax, foule
// =====================================================================
export function marche(w, h, o) {
  const T = TIMES[o.time] || TIMES.jour; const r = rng(o.seed || 11); const c = cam(w, h, o);
  let s = rue(w, h, { ...o, cars: false, crowd: 0, fg: null });
  const tarps = ['#e8442e', '#2f86d6', '#f5c518', '#1f9d55', '#ff8a3d', '#8b5cf6', '#ff3d9a'];
  const stalls = [];
  for (const side of [-1, 1]) for (let z = 1.0; z < 30; z *= 1.35) stalls.push({ X: side * 1.85, z });
  for (let i = 0; i < 18; i++) stalls.push({ k: 'walker', X: -1.3 + r() * 2.6, z: 2.5 + r() * 28 });
  stalls.sort((a, b) => b.z - a.z);
  for (const st of stalls) {
    if (st.k === 'walker') { s += walker(c, T, st.X, st.z, r); continue; }
    const side = Math.sign(st.X); const sz = c.s(st.z); const x = c.x(st.X, st.z); const y = c.y(0, st.z);
    const col = haze(tarps[Math.floor(r() * tarps.length)], T, st.z); const l2 = f(Math.max(0.5, sz * 0.012)); const ink = haze(INK, T, st.z + 3);
    // Table et marchandises (mangues, oranges, piments, oignons)
    s += `<rect x="${f(x - sz * 0.45)}" y="${f(y - sz * 0.42)}" width="${f(sz * 0.9)}" height="${f(sz * 0.42)}" fill="${haze('#7a5536', T, st.z)}" stroke="${ink}" stroke-width="${l2}"/>`;
    const fr = [['#ff9f1c', '#3a8f3a'], ['#ff8a00', '#ffb347'], ['#e8442e', '#b81d13'], ['#c98a5a', '#e8c39a']][Math.floor(r() * 4)];
    for (let i = 0; i < 11; i++) s += `<circle cx="${f(x - sz * 0.4 + (i % 6) * sz * 0.16 + (i > 5 ? sz * 0.08 : 0))}" cy="${f(y - sz * 0.46 - (i > 5 ? sz * 0.07 : 0))}" r="${f(sz * 0.065)}" fill="${haze(fr[i % 2], T, st.z)}" stroke="${ink}" stroke-width="${l2}"/>`;
    // Bâche tendue sur des perches
    s += `<path d="M${f(x - sz * 0.62)},${f(y - sz * 1.42)} Q${f(x)},${f(y - sz * 1.32)} ${f(x + sz * 0.62)},${f(y - sz * 1.42)} L${f(x + sz * 0.7)},${f(y - sz * 1.14)} Q${f(x)},${f(y - sz * 1.04)} ${f(x - sz * 0.7)},${f(y - sz * 1.14)} Z" fill="${col}" stroke="${ink}" stroke-width="${l2}"/>
      <path d="M${f(x - sz * 0.56)},${f(y - sz * 1.14)} L${f(x - sz * 0.56)},${f(y)} M${f(x + sz * 0.56)},${f(y - sz * 1.14)} L${f(x + sz * 0.56)},${f(y)}" stroke="${haze('#4a3a2a', T, st.z)}" stroke-width="${f(sz * 0.025)}"/>`;
    if (r() < 0.6) {
      const wx = x + side * sz * 0.2;
      s += `<rect x="${f(wx - sz * 0.16)}" y="${f(y - sz * 1.1)}" width="${f(sz * 0.32)}" height="${f(sz * 0.58)}" fill="${haze(tarps[Math.floor(r() * tarps.length)], T, st.z)}" stroke="${ink}" stroke-width="${l2}"/>
        <path d="M${f(wx - sz * 0.13)},${f(y - sz * 0.98)} h${f(sz * 0.26)} M${f(wx - sz * 0.13)},${f(y - sz * 0.82)} h${f(sz * 0.26)} M${f(wx - sz * 0.13)},${f(y - sz * 0.66)} h${f(sz * 0.26)}" stroke="${haze('#ffd23f', T, st.z)}" stroke-width="${f(sz * 0.028)}" stroke-dasharray="${f(sz * 0.04)} ${f(sz * 0.03)}"/>`;
    }
  }
  s += atmosphere(w, h, c, T, o, r);
  if (o.fg) s += foreground(w, h, o.fg, T, o.fgSide ?? 1);
  return s;
}

// =====================================================================
// LA CORNICHE : mer, rochers, pirogues, promenade, cocotiers et manguiers
// =====================================================================
export function corniche(w, h, o) {
  const T = TIMES[o.time] || TIMES.couchant; const r = rng(o.seed || 7); const c = cam(w, h, o);
  let s = sky(w, h, T, { ...o, sunX: o.sunX ?? 0.78 }, r, c.hz);
  // Mer (dégradé + reflets)
  const sea = uid('sea');
  s += `<defs><linearGradient id="${sea}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mixHex(T.low, T.mid, 0.45)}"/><stop offset=".4" stop-color="${mixHex(T.mid, '#0b3b5c', 0.45)}"/><stop offset="1" stop-color="${mixHex(T.top, '#082a40', 0.5)}"/></linearGradient></defs>
    <rect y="${f(c.hz)}" width="${w}" height="${f(h - c.hz)}" fill="url(#${sea})"/>`;
  // Îles de Loos dans la brume
  s += `<path d="M${f(w * 0.46)},${f(c.hz)} Q${f(w * 0.53)},${f(c.hz - h * 0.04)} ${f(w * 0.6)},${f(c.hz - h * 0.025)} Q${f(w * 0.68)},${f(c.hz - h * 0.05)} ${f(w * 0.79)},${f(c.hz)} Z" fill="${mixHex(T.mid, T.haze, 0.5)}" opacity=".9"/>
    <path d="M${f(w * 0.84)},${f(c.hz)} Q${f(w * 0.9)},${f(c.hz - h * 0.03)} ${f(w * 1.02)},${f(c.hz)} Z" fill="${mixHex(T.mid, T.haze, 0.55)}" opacity=".8"/>`;
  // Reflet du soleil / de la lune
  if (o.time !== 'pluie') {
    const sx = w * (o.sunX ?? 0.78);
    for (let i = 0; i < 18; i++) {
      const yy = c.hz + 3 + i * i * (h - c.hz) * 0.003; const ww = 6 + i * 5;
      s += `<rect x="${f(sx - ww / 2 + (r() - 0.5) * ww)}" y="${f(yy)}" width="${f(ww)}" height="${f(1.4 + i * 0.25)}" fill="${T.sun}" opacity="${f(0.8 - i * 0.04)}"/>`;
    }
  }
  for (let i = 0; i < 26; i++) {
    const yy = c.hz + (h - c.hz) * Math.pow(r(), 1.6);
    s += `<path d="M${f(r() * w)},${f(yy)} h${f(8 + (yy - c.hz) * 0.3)}" stroke="#ffffff" stroke-width="1.1" opacity=".22"/>`;
  }
  // Pirogues de pêche sur l'eau (coques peintes, pêcheurs)
  const WALL = 1.1;
  const boats = [[22, 26, '#f5c518', '#e8442e'], [15, 15, '#1f9d55', '#f5c518'], [10, 9, '#e8442e', '#f2f0fa'], [6.5, 5, '#1f6fb2', '#f5c518']];
  for (const [X, z, p1, p2] of boats) {
    const x = c.x(X, z); const y = c.y(-0.05, z); const s0 = c.s(z) * 1.7; // pirogue ≈ 1,7 × la taille de référence
    if (x > w + 80) continue;
    s += `<path d="M${f(x - s0 * 0.9)},${f(y - s0 * 0.12)} Q${f(x)},${f(y + s0 * 0.12)} ${f(x + s0 * 0.9)},${f(y - s0 * 0.16)} L${f(x + s0 * 0.75)},${f(y - s0 * 0.02)} Q${f(x)},${f(y + s0 * 0.04)} ${f(x - s0 * 0.78)},${f(y - s0 * 0.01)} Z" fill="${haze(p1, T, z)}" stroke="${haze(INK, T, z)}" stroke-width="${lw(c, z, 0.6)}"/>
      <path d="M${f(x - s0 * 0.8)},${f(y - s0 * 0.07)} Q${f(x)},${f(y + s0 * 0.07)} ${f(x + s0 * 0.8)},${f(y - s0 * 0.1)}" stroke="${haze(p2, T, z)}" stroke-width="${f(Math.max(0.6, s0 * 0.03))}" fill="none"/>
      <path d="M${f(x - s0 * 0.2)},${f(y - s0 * 0.05)} l0,${f(-s0 * 0.32)} M${f(x + s0 * 0.25)},${f(y - s0 * 0.06)} l0,${f(-s0 * 0.26)}" stroke="${haze('#1a1a20', T, z)}" stroke-width="${f(Math.max(0.8, s0 * 0.05))}" stroke-linecap="round"/>
      <circle cx="${f(x - s0 * 0.2)}" cy="${f(y - s0 * 0.4)}" r="${f(Math.max(0.6, s0 * 0.05))}" fill="${haze('#1a1a20', T, z)}"/>`;
  }
  // Mouettes
  for (let i = 0; i < 5; i++) { const x = w * (0.4 + r() * 0.5); const y = c.hz * (0.3 + r() * 0.5); const s0 = 4 + r() * 6; s += `<path d="M${f(x - s0)},${f(y)} q${f(s0 / 2)},${f(-s0 / 2)} ${f(s0)},0 q${f(s0 / 2)},${f(-s0 / 2)} ${f(s0)},0" stroke="${T.night ? '#c9cbe0' : '#2a2a30'}" stroke-width="1.4" fill="none"/>`; }
  // Sol : route + promenade dallée jusqu'au muret
  const zN = 0.35; const zF = 80;
  s += `<path d="M0,${f(h)} L0,${f(c.hz)} L${f(c.x(WALL, zF))},${f(c.y(0, zF))} L${f(c.x(WALL, zN))},${f(c.y(0, zN))} Z" fill="${mixHex(T.ground, '#c8b9a2', 0.4)}"/>`;
  s += `<path d="M0,${f(h)} L0,${f(c.hz)} L${f(c.x(-0.2, zF))},${f(c.y(0, zF))} L${f(c.x(-0.2, zN))},${f(c.y(0, zN))} Z" fill="${mixHex(T.ground, '#2e2e36', 0.55)}"/>`;
  for (let z = 0.6; z < 40; z *= 1.18) s += `<path d="M${f(c.x(-0.2, z))},${f(c.y(0, z))} L${f(c.x(WALL, z))},${f(c.y(0, z))}" stroke="${mixHex(T.ground, '#8a7a64', 0.4)}" stroke-width="${lw(c, z, 0.4)}" opacity=".6"/>`;
  for (const X of [0.25, 0.65]) s += `<path d="M${f(c.x(X, zN))},${f(c.y(0, zN))} L${f(c.x(X, zF))},${f(c.y(0, zF))}" stroke="${mixHex(T.ground, '#8a7a64', 0.4)}" stroke-width="1" opacity=".5"/>`;
  for (let z = 1.2; z < 40; z *= 1.45) s += `<path d="M${f(c.x(-1.6, z))},${f(c.y(0, z))} L${f(c.x(-1.6, z * 1.18))},${f(c.y(0, z * 1.18))}" stroke="${haze('#f2f0e6', T, z)}" stroke-width="${f(Math.max(0.6, c.s(z) * 0.05))}" opacity=".7"/>`;
  // Immeubles bas de l'autre côté de la route
  const blocks = [];
  let z = 2.8;
  while (z < 45) { const z2 = z * (1.3 + r() * 0.25); blocks.push({ X: -4.2, zn: z, zf: z2, H: 1.6 + r() * 2.2, color: WALLS[Math.floor(r() * WALLS.length)], k: 'block' }); z = z2 * 1.02; }
  // Muret (avec taches) et rochers côté mer
  const top = (zz) => [c.x(WALL, zz), c.y(0.42, zz)]; const base = (zz) => [c.x(WALL, zz), c.y(0, zz)];
  const wallCol = mixHex('#d9cdb6', T.ground, 0.3);
  // Rochers en contrebas (côté mer), du loin vers le près
  for (let i = 0; i < 26; i++) {
    const zz = 40 / (1 + i * 0.6); const x = c.x(WALL + 0.25 + r() * 0.4, zz); const y = c.y(-0.15, zz); const rs = c.s(zz) * (0.12 + r() * 0.12);
    s += `<path d="M${f(x - rs)},${f(y)} Q${f(x - rs * 0.8)},${f(y - rs * 0.9)} ${f(x)},${f(y - rs)} Q${f(x + rs)},${f(y - rs * 0.7)} ${f(x + rs * 1.1)},${f(y)} Z" fill="${haze('#4a443e', T, zz)}" stroke="${haze(INK, T, zz + 3)}" stroke-width="${lw(c, zz, 0.4)}"/>`;
  }
  s += `<path d="M${f(base(zN)[0])},${f(base(zN)[1])} L${f(base(zF)[0])},${f(base(zF)[1])} L${f(top(zF)[0])},${f(top(zF)[1])} L${f(top(zN)[0])},${f(top(zN)[1])} Z" fill="${mixHex(wallCol, '#000', 0.22)}" stroke="${INK}" stroke-width="2"/>
    <path d="M${f(top(zN)[0])},${f(top(zN)[1])} L${f(top(zF)[0])},${f(top(zF)[1])} L${f(c.x(WALL + 0.25, zF))},${f(c.y(0.42, zF))} L${f(c.x(WALL + 0.25, zN))},${f(c.y(0.42, zN))} Z" fill="${wallCol}" stroke="${INK}" stroke-width="2"/>`;
  for (let i = 0; i < 10; i++) { const za = 0.5 + r() * 12; s += `<path d="${quad(c, WALL, za, za + 0.3 + r() * 0.6, 0.05, 0.3 + r() * 0.1)}" fill="#3a2a1c" opacity=".14"/>`; }
  for (let zz = 0.6; zz < 50; zz *= 1.22) s += `<path d="M${f(base(zz)[0])},${f(base(zz)[1])} L${f(top(zz)[0])},${f(top(zz)[1])}" stroke="${haze(INK, T, zz + 3)}" stroke-width="${lw(c, zz, 0.3)}" opacity=".5"/>`;
  // Arbres, lampadaires, bancs, promeneurs : triés par profondeur
  const items = [...blocks];
  for (let zz = 1.2; zz < 40; zz *= 1.6) items.push({ z: zz, k: 'palm', X: 0.78 });
  for (let zz = 1.7; zz < 40; zz *= 1.6) items.push({ z: zz, k: 'lamp', X: 0.92 });
  items.push({ z: 3.2, k: 'mango', X: -1.0 }, { z: 9, k: 'mango', X: -1.0 });
  for (let i = 0; i < 7; i++) items.push({ z: 5 + r() * 24, k: 'walker', X: -0.05 + r() * 0.75 });
  if (o.cars !== false) items.push({ z: 9, k: 'taxi', X: -1.0 }, { z: 6.5, k: 'moto', X: -2.4, col: '#2f86d6' });
  for (const v of o.vehicles || []) items.push({ z: v.z, k: v.k || 'taxi', X: v.X ?? -1, front: v.front, col: v.col });
  items.sort((a, b) => (b.z ?? b.zn) - (a.z ?? a.zn));
  for (const it of items) {
    if (it.k === 'block') s += building(c, T, it, r);
    else if (it.k === 'palm') s += palm(c, T, it.X, it.z, 2.8, r);
    else if (it.k === 'lamp') s += lamp(c, T, it.X, it.z, 1);
    else if (it.k === 'mango') s += mango(c, T, it.X, it.z, r);
    else if (it.k === 'walker') s += walker(c, T, it.X, it.z, r);
    else if (it.k === 'taxi') s += taxi(c, T, it.X, it.z, it.front);
    else if (it.k === 'moto') s += moto(c, T, it.X, it.z, it.col);
  }
  s += atmosphere(w, h, c, T, o, r);
  if (o.fg) s += foreground(w, h, o.fg, T, o.fgSide ?? 1);
  return s;
}

// =====================================================================
// TOIT-TERRASSE : la ville en couches, cuve d'eau, fers à béton, linge
// =====================================================================
export function toit(w, h, o) {
  const T = TIMES[o.time] || TIMES.nuit; const r = rng(o.seed || 13); const c = cam(w, h, { ...o, horizon: o.horizon ?? 0.5 });
  let s = sky(w, h, T, { ...o, sunX: o.sunX ?? 0.2 }, r, c.hz);
  s += `<rect y="${f(c.hz)}" width="${w}" height="${f(h - c.hz)}" fill="${mixHex(T.mid, T.top, 0.5)}"/>`;
  // Lumières des bateaux au large
  if (T.night) for (let i = 0; i < 5; i++) s += `<circle cx="${f(r() * w)}" cy="${f(c.hz + 3 + r() * 6)}" r="1.5" fill="#ffcf6b"/>`;
  // Ville en 4 couches de profondeur
  const layers = [[0.02, 0.06, 0.8, 0.12], [0.05, 0.12, 0.6, 0.3], [0.1, 0.2, 0.38, 0.52], [0.16, 0.3, 0.15, 0.74]];
  layers.forEach(([hMin, hMax, fade, base0], li) => {
    const base = c.hz + (h - c.hz) * base0;
    const col = mixHex(T.night ? '#0b1022' : '#7d8794', T.haze, fade);
    const colEnd = mixHex(col, '#000000', 0.25);
    let x = -10;
    while (x < w) {
      const bw = w * (0.04 + r() * 0.08); const bh = h * (hMin + r() * (hMax - hMin));
      s += `<rect x="${f(x)}" y="${f(base - bh)}" width="${f(bw + 1)}" height="${f(h - base + bh)}" fill="${col}"/>`;
      // volume : petit mur de côté
      s += `<rect x="${f(x + bw - bw * 0.18)}" y="${f(base - bh)}" width="${f(bw * 0.18)}" height="${f(h - base + bh)}" fill="${colEnd}"/>`;
      // fenêtres
      const win = T.night ? '#ffcf6b' : mixHex('#2a3550', T.haze, fade);
      for (let yy = base - bh + 4; yy < base - 3; yy += 6 + li * 3) for (let xx = x + 3; xx < x + bw * 0.8 - 2; xx += 5 + li * 3) if (r() < (T.night ? 0.33 : 0.45)) s += `<rect x="${f(xx)}" y="${f(yy)}" width="${f(1.6 + li * 0.8)}" height="${f(2 + li * 1.2)}" fill="${win}" opacity="${f(1 - fade * 0.55)}"/>`;
      // toits : cuves, antennes, fers à béton
      if (li >= 2 && r() < 0.5) s += `<rect x="${f(x + bw * 0.2)}" y="${f(base - bh - h * 0.02 * li)}" width="${f(w * 0.01 * li)}" height="${f(h * 0.02 * li)}" fill="${mixHex(col, '#000', 0.4)}"/>`;
      if (li >= 2 && r() < 0.4) for (let k = 0; k < 4; k++) s += `<path d="M${f(x + bw * (0.5 + k * 0.08))},${f(base - bh)} l0,${f(-h * 0.015 * li)}" stroke="${mixHex(col, '#000', 0.3)}" stroke-width="1"/>`;
      x += bw;
    }
    if (li === 1) { // minaret
      const mx = w * 0.3;
      s += `<path d="M${f(mx - 6)},${f(base)} L${f(mx - 5)},${f(base - h * 0.24)} L${f(mx)},${f(base - h * 0.29)} L${f(mx + 5)},${f(base - h * 0.24)} L${f(mx + 6)},${f(base)} Z" fill="${col}"/><rect x="${f(mx - 9)}" y="${f(base - h * 0.18)}" width="18" height="4" fill="${col}"/>`;
    }
  });
  if (T.night) for (let i = 0; i < 30; i++) s += `<circle cx="${f(r() * w)}" cy="${f(c.hz + (h - c.hz) * (0.3 + r() * 0.65))}" r="${f(2 + r() * 8)}" fill="${['#ffcf6b', '#ff8a3d', '#fff3cf', '#8be9ff'][Math.floor(r() * 4)]}" opacity="${f(0.12 + r() * 0.25)}"/>`;
  s += atmosphere(w, h, c, T, { ...o, rays: false }, r);
  // Le toit au premier plan
  const roofY = h * (o.roofY ?? 0.86);
  const roofCol = mixHex('#8a8278', T.top, T.night ? 0.6 : 0.2);
  const parCol = mixHex('#b4a99a', T.top, T.night ? 0.55 : 0.15);
  s += `<rect y="${f(roofY)}" width="${w}" height="${f(h - roofY + 5)}" fill="${roofCol}"/>
    <rect y="${f(roofY - h * 0.07)}" width="${w}" height="${f(h * 0.07)}" fill="${parCol}" stroke="${INK}" stroke-width="3"/>
    <rect y="${f(roofY - h * 0.075)}" width="${w}" height="${f(h * 0.012)}" fill="${mixHex(parCol, '#ffffff', 0.15)}"/>`;
  // Taches, fissures et mousse sur l'acrotère
  for (let i = 0; i < 8; i++) s += `<ellipse cx="${f(r() * w)}" cy="${f(roofY - h * 0.02 - r() * h * 0.04)}" rx="${f(10 + r() * 30)}" ry="${f(4 + r() * 8)}" fill="#2a2018" opacity=".18"/>`;
  for (let i = 0; i < 3; i++) { const x0 = r() * w; s += `<path d="M${f(x0)},${f(roofY - h * 0.07)} l${f(4 + r() * 6)},${f(h * 0.02)} l${f(-3)},${f(h * 0.02)} l${f(5)},${f(h * 0.02)}" stroke="#1a1410" stroke-width="1.4" fill="none"/>`; }
  if (o.props !== false) {
    const tx = w * (o.tankX ?? 0.85); const tw = w * 0.13; const th = h * 0.2;
    s += `<rect x="${f(tx - tw / 2)}" y="${f(roofY - th - h * 0.07)}" width="${f(tw)}" height="${f(th)}" rx="${f(tw * 0.12)}" fill="#14141a" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="${f(tx)}" cy="${f(roofY - th - h * 0.07)}" rx="${f(tw / 2)}" ry="${f(tw * 0.12)}" fill="#24242c" stroke="${INK}" stroke-width="3"/>
      <path d="M${f(tx - tw * 0.4)},${f(roofY - th * 0.8 - h * 0.07)} h${f(tw * 0.8)} M${f(tx - tw * 0.4)},${f(roofY - th * 0.45 - h * 0.07)} h${f(tw * 0.8)}" stroke="#2c2c36" stroke-width="2"/>
      <path d="M${f(tx + tw * 0.3)},${f(roofY - th * 0.9 - h * 0.07)} q${f(tw * 0.1)},${f(th * 0.4)} 0,${f(th * 0.8)}" stroke="#ffffff" stroke-width="2" opacity=".12" fill="none"/>`;
    // Fers à béton qui dépassent (immeuble en chantier)
    for (let k = 0; k < 6; k++) s += `<path d="M${f(w * 0.03 + k * 9)},${f(roofY - h * 0.07)} l${f(r() * 4 - 2)},${f(-h * (0.05 + r() * 0.06))}" stroke="#5a3a2a" stroke-width="2.4"/>`;
    // Antenne parabolique
    s += `<path d="M${f(w * 0.16)},${f(roofY - h * 0.07)} L${f(w * 0.16)},${f(roofY - h * 0.2)}" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="${f(w * 0.16)}" cy="${f(roofY - h * 0.22)}" rx="${f(w * 0.035)}" ry="${f(w * 0.05)}" transform="rotate(-25 ${f(w * 0.16)} ${f(roofY - h * 0.22)})" fill="#c9c9d4" stroke="${INK}" stroke-width="2.4"/>`;
    // Fil à linge avec des pagnes qui sèchent
    s += `<path d="M${f(w * 0.2)},${f(roofY - h * 0.19)} Q${f(w * 0.45)},${f(roofY - h * 0.15)} ${f(w * 0.74)},${f(roofY - h * 0.2)}" stroke="${INK}" stroke-width="1.4" fill="none"/>`;
    const cloth = ['#e8442e', '#f5c518', '#2f86d6', '#1f9d55'];
    for (let k = 0; k < 3; k++) { const cx0 = w * (0.3 + k * 0.13); s += `<path d="M${f(cx0)},${f(roofY - h * 0.17)} l${f(w * 0.07)},${f(h * 0.004)} l${f(w * 0.005)},${f(h * 0.09)} l${f(-w * 0.08)},0 Z" fill="${mixHex(cloth[k], T.top, T.night ? 0.5 : 0)}" stroke="${INK}" stroke-width="1.6"/>`; }
    // Plante dans un seau
    s += `<rect x="${f(w * 0.6)}" y="${f(roofY - h * 0.11)}" width="${f(w * 0.04)}" height="${f(h * 0.04)}" fill="#2f5d9b" stroke="${INK}" stroke-width="2"/>`;
    for (let k = 0; k < 6; k++) s += `<path d="M${f(w * 0.62)},${f(roofY - h * 0.11)} q${f((k - 3) * 6)},${f(-h * 0.04)} ${f((k - 3) * 10)},${f(-h * 0.07)}" stroke="${T.night ? '#123020' : '#2f7d32'}" stroke-width="3" fill="none"/>`;
  }
  if (o.fg) s += foreground(w, h, o.fg, T, o.fgSide ?? 1);
  return s;
}
