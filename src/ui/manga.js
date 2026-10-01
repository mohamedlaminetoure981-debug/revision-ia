// =====================================================================
// manga.js — MOTEUR DE PLANCHES MANGA (yonkoma : 4 cases verticales)
// ---------------------------------------------------------------------
// Utilisé par le "cours en manga" ET le mode Histoire.
// Une planche = { title, panels: [ { character, expression, line,
//                 narration?, sfx? } ×4 ] }
// Tout est dessiné dans UN SEUL SVG (bordures épaisses, trame de points,
// lignes de vitesse, bulles, onomatopées, personnages SVG existants) :
//  - affiché tel quel à l'écran ;
//  - converti en image PNG pour le partage (stripToPng).
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { characterSVG } from './character.js';

const W = 600; // largeur de la planche
const PH = 300; // hauteur d'une case
const GAP = 16; // espace entre les cases
const TOP = 74; // bandeau titre
const FOOT = 34; // bas de page
const INK = '#111';

/** Échappe le texte pour le SVG. */
function x(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Coupe un texte en lignes d'environ `max` caractères. */
function wrap(text, max) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 6);
}

/** Lignes de vitesse (concentration) autour d'un point. */
function speedLines(cx, cy, color) {
  let s = '';
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r1 = 120 + (i % 3) * 18;
    s += `<line x1="${(cx + r1 * Math.cos(a)).toFixed(1)}" y1="${(cy + r1 * Math.sin(a)).toFixed(1)}" x2="${(cx + 420 * Math.cos(a)).toFixed(1)}" y2="${(cy + 420 * Math.sin(a)).toFixed(1)}" stroke="${color}" stroke-width="${i % 2 ? 2 : 4}" opacity=".35"/>`;
  }
  return s;
}

/** Une case de la planche. */
function panel(p, i, uid) {
  const y = TOP + i * (PH + GAP);
  const ch = CHARACTERS[p.character] || CHARACTERS.kai;
  const left = i % 2 === 0; // les persos alternent gauche / droite
  const charW = 200;
  const charH = 232;
  const cx = left ? 30 : W - 30 - charW;
  const cy = y + PH - charH + 6;
  const dramatic = ['celebration', 'surprise', 'concentration'].includes(p.expression) || p.sfx;
  // Personnage SVG (le SVG existant, placé dans la case)
  const charSvg = characterSVG(p.character in CHARACTERS ? p.character : 'kai', p.expression || 'neutre')
    .replace('<svg ', `<svg x="${cx}" y="${cy}" width="${charW}" height="${charH}" `);
  // Bulle de dialogue
  const lines = wrap(p.line, 24);
  const lh = 24;
  const bw = 300;
  const bh = lines.length * lh + 26;
  const bx = left ? W - 30 - bw : 30;
  const by = y + 24 + (p.narration ? 36 : 0);
  const tailX = left ? bx + 30 : bx + bw - 30;
  const headX = cx + charW / 2 + (left ? 20 : -20);
  const bubble = `
    <path d="M${tailX - 14},${by + bh - 6} L${headX},${cy + 60} L${tailX + 14},${by + bh - 6} Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="26" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <path d="M${tailX - 11},${by + bh - 1.5} L${tailX + 11},${by + bh - 1.5}" stroke="#fff" stroke-width="5"/>
    <text x="${bx + bw / 2}" y="${by + 22 + lh * 0.55}" font-family="'Plus Jakarta Sans Variable', Arial, sans-serif" font-size="19" font-weight="700" fill="${INK}" text-anchor="middle">
      ${lines.map((l, k) => `<tspan x="${bx + bw / 2}" dy="${k ? lh : 0}">${x(l)}</tspan>`).join('')}
    </text>
    <text x="${bx + 16}" y="${by - 6}" font-family="'Unbounded Variable', 'Arial Black', sans-serif" font-size="13" font-weight="800" fill="${ch.color}" stroke="${INK}" stroke-width=".6">${x(ch.name)}</text>`;
  const narration = p.narration ? `
    <rect x="${left ? W - 30 - 240 : 30}" y="${y + 10}" width="240" height="30" fill="#FFF3B0" stroke="${INK}" stroke-width="2.5"/>
    <text x="${left ? W - 30 - 230 : 40}" y="${y + 30}" font-family="Arial, sans-serif" font-size="14" font-style="italic" font-weight="700" fill="${INK}">${x(String(p.narration).slice(0, 34))}</text>` : '';
  const sfx = p.sfx ? `
    <text x="${left ? cx + charW - 10 : cx - 10}" y="${y + PH - 30}" transform="rotate(-12 ${left ? cx + charW - 10 : cx - 10} ${y + PH - 30})"
      font-family="'Unbounded Variable', 'Arial Black', sans-serif" font-size="40" font-weight="900" fill="${ch.color}" stroke="${INK}" stroke-width="3" paint-order="stroke">${x(String(p.sfx).slice(0, 12))}</text>` : '';
  return `
    <g>
      <clipPath id="pc${uid}-${i}"><rect x="20" y="${y}" width="${W - 40}" height="${PH}"/></clipPath>
      <rect x="20" y="${y}" width="${W - 40}" height="${PH}" fill="${dramatic ? '#fff' : `url(#tone${uid})`}"/>
      <g clip-path="url(#pc${uid}-${i})">
        ${dramatic ? speedLines(cx + charW / 2, cy + 90, ch.color) : `<rect x="20" y="${y}" width="${W - 40}" height="${PH}" fill="${ch.color}" opacity=".08"/>`}
        ${charSvg}
        ${bubble}${narration}${sfx}
      </g>
      <rect x="20" y="${y}" width="${W - 40}" height="${PH}" fill="none" stroke="${INK}" stroke-width="6"/>
    </g>`;
}

let counter = 0;

/**
 * SVG complet d'une planche.
 * @param {object} strip  { title, panels }
 * @param {object} [o]    { subtitle } (ex. nom du cours ou du chapitre)
 */
export function stripSVG(strip, o = {}) {
  const uid = ++counter;
  const panels = (strip.panels || []).slice(0, 4);
  const H = TOP + panels.length * (PH + GAP) - GAP + FOOT;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="manga-strip" role="img" aria-label="${x(strip.title)}">
    <defs>
      <pattern id="tone${uid}" width="9" height="9" patternUnits="userSpaceOnUse">
        <rect width="9" height="9" fill="#fff"/><circle cx="4.5" cy="4.5" r="1.4" fill="#d9d9e3"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="#fbfaf7"/>
    <rect x="20" y="14" width="${W - 40}" height="46" fill="${INK}"/>
    <text x="36" y="45" font-family="'Unbounded Variable', 'Arial Black', sans-serif" font-size="20" font-weight="800" fill="#fff">${x(String(strip.title || '').slice(0, 34))}</text>
    ${o.subtitle ? `<text x="${W - 36}" y="45" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#C6FF3D">${x(String(o.subtitle).slice(0, 30))}</text>` : ''}
    ${panels.map((p, i) => panel(p, i, uid)).join('')}
    <text x="${W - 24}" y="${H - 12}" text-anchor="end" font-family="'Unbounded Variable', 'Arial Black', sans-serif" font-size="12" font-weight="800" fill="#8B5CF6">Révision IA ✦</text>
  </svg>`;
}

/** Convertit un SVG (texte) en image PNG (Blob), largeur `width` px. */
export async function svgToPng(svg, width = 1080) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = 'sync';
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const ratio = img.height / img.width;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = Math.round(width * ratio);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise((res) => canvas.toBlob(res, 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Image PNG d'une planche (pour le partage). */
export function stripToPng(strip, o) {
  return svgToPng(stripSVG(strip, o), 1080);
}
