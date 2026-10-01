// =====================================================================
// card.js — DESSIN D'UNE CARTE À COLLECTIONNER (SVG)
// ---------------------------------------------------------------------
// Le même SVG sert à l'écran ET pour l'image partagée.
// Les effets animés (brillance, holo, aura) sont ajoutés par-dessus
// en CSS selon la rareté : .rar-commune / .rar-rare / .rar-epique / .rar-legendaire
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { characterSVG } from './character.js';
import { subjectHex, plain } from '../core/collection.js';
import { svgToPng } from './manga.js';

const x = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, max, lines) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const out = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) out.push(cur);
  if (out.length > lines) { out.length = lines; out[lines - 1] = out[lines - 1].replace(/.{0,2}$/, '…'); }
  return out;
}

let uid = 0;

/**
 * SVG d'une carte (300 × 420).
 * @param {object} it { card, course, rarity, char, num }
 */
export function cardSVG(it) {
  const n = ++uid;
  const r = it.rarity;
  const subj = it.course?.subject || 'Autre';
  const sc = subjectHex(subj);
  const ch = CHARACTERS[it.char];
  const frame = r ? r.color : '#3a3550';
  const title = wrap(plain(it.card.question, 90), 24, 3);
  const idea = wrap(plain(it.card.answer, 130), 34, 4);
  const stars = r ? '★'.repeat(r.stars) + '☆'.repeat(4 - r.stars) : '☆☆☆☆';
  const charSvg = characterSVG(it.char, r && r.stars >= 3 ? 'celebration' : 'joie', { aura: r ? Math.min(3, r.stars - 1) : 0 })
    .replace('<svg ', '<svg x="70" y="58" width="160" height="186" ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="300" height="420" class="card-svg">
    <defs>
      <linearGradient id="cb${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sc}" stop-opacity=".9"/><stop offset=".55" stop-color="#140f24"/><stop offset="1" stop-color="#07040e"/></linearGradient>
      <linearGradient id="cf${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${frame}"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="${frame}"/></linearGradient>
      <pattern id="cd${n}" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.1" fill="#fff" opacity=".12"/></pattern>
      <clipPath id="cc${n}"><rect x="16" y="50" width="268" height="200" rx="10"/></clipPath>
    </defs>
    <rect x="2" y="2" width="296" height="416" rx="20" fill="url(#cf${n})"/>
    <rect x="9" y="9" width="282" height="402" rx="15" fill="#0b0814"/>
    <rect x="12" y="12" width="276" height="34" rx="10" fill="${sc}"/>
    <text x="22" y="35" font-family="'Unbounded Variable','Arial Black',sans-serif" font-size="13" font-weight="900" fill="#111">${x(subj.toUpperCase().slice(0, 22))}</text>
    <text x="278" y="35" text-anchor="end" font-family="Arial,sans-serif" font-size="12" font-weight="800" fill="#111">#${it.num ?? ''}</text>
    <g clip-path="url(#cc${n})">
      <rect x="16" y="50" width="268" height="200" fill="url(#cb${n})"/>
      <rect x="16" y="50" width="268" height="200" fill="url(#cd${n})"/>
      ${charSvg}
    </g>
    <rect x="16" y="50" width="268" height="200" rx="10" fill="none" stroke="${frame}" stroke-width="3"/>
    <rect x="22" y="228" width="${Math.min(140, ch.name.length * 11 + 20)}" height="22" rx="11" fill="${ch.color}" stroke="#000" stroke-width="2"/>
    <text x="32" y="244" font-family="'Unbounded Variable','Arial Black',sans-serif" font-size="11" font-weight="900" fill="#111">${x(ch.name)}</text>
    ${title.map((l, k) => `<text x="150" y="${278 + k * 19}" text-anchor="middle" font-family="'Unbounded Variable','Arial Black',sans-serif" font-size="15" font-weight="800" fill="#fff">${x(l)}</text>`).join('')}
    <rect x="20" y="${278 + title.length * 19 - 8}" width="260" height="${idea.length * 16 + 14}" rx="8" fill="#ffffff" fill-opacity=".08" stroke="${frame}" stroke-opacity=".5"/>
    ${idea.map((l, k) => `<text x="150" y="${278 + title.length * 19 + 10 + k * 16}" text-anchor="middle" font-family="Arial,sans-serif" font-size="12.5" font-weight="600" fill="#e8e4f5">${x(l)}</text>`).join('')}
    <text x="22" y="404" font-family="Arial,sans-serif" font-size="16" fill="${frame}" letter-spacing="2">${stars}</text>
    <text x="278" y="404" text-anchor="end" font-family="'Unbounded Variable','Arial Black',sans-serif" font-size="11" font-weight="900" fill="${frame}">${x(r ? r.name.toUpperCase() : '???')}</text>
  </svg>`;
}

/** Carte HTML avec les effets de rareté (brillance, holo, aura). */
export function cardHTML(it, cls = '') {
  if (!it.rarity) {
    return `<div class="tcg locked ${cls}"><div class="tcg-back"><span>?</span></div></div>`;
  }
  return `<div class="tcg rar-${it.rarity.id} ${cls}" style="--rc:${it.rarity.color}">${cardSVG(it)}<i class="tcg-shine"></i><i class="tcg-holo"></i></div>`;
}

/** Image PNG d'une carte (600 × 840). */
export function cardPng(it) {
  return svgToPng(cardSVG(it), 600);
}
