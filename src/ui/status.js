// =====================================================================
// status.js — IMAGE "STATUT WHATSAPP" 1080 × 1920 (Binta)
// ---------------------------------------------------------------------
// Perso en pose de pouvoir, gros score (ou récap), série 🔥, niveau,
// style néon/manga, nom de l'appli discret en bas.
// Proposée après : examen blanc réussi, boss vaincu, niveau gagné,
// récap de la semaine (Binta, écran Stats).
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { characterSVG } from './character.js';
import { svgToPng } from './manga.js';
import { latexToText } from '../core/mathfix.js';
import { shareImage, fileName } from './share.js';
import { getProfileSync, currentStreak, levelFromXp } from '../core/game.js';
import { modal, line, esc } from './ui.js';
import { characterHTML } from './character.js';
import { sound } from './fx.js';
import { t } from '../i18n/index.js';

const W = 1080;
const H = 1920;
const x = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * SVG du statut.
 * @param {object} o { charId, kicker, big, sub, lines: [texte…] }
 */
export function statusSVG(o) {
  const p = getProfileSync();
  const ch = CHARACTERS[o.charId] || CHARACTERS[p?.companion] || CHARACTERS.kai;
  const id = o.charId && CHARACTERS[o.charId] ? o.charId : p?.companion || 'kai';
  const c = ch.color;
  const streak = p ? currentStreak(p) : 0;
  const level = p ? levelFromXp(p.xp) : 1;
  // Rayons de fond (lignes de vitesse)
  let rays = '';
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    rays += `<path d="M540,900 L${(540 + 1500 * Math.cos(a - 0.04)).toFixed(0)},${(900 + 1500 * Math.sin(a - 0.04)).toFixed(0)} L${(540 + 1500 * Math.cos(a + 0.04)).toFixed(0)},${(900 + 1500 * Math.sin(a + 0.04)).toFixed(0)} Z" fill="${c}" opacity="${i % 2 ? 0.1 : 0.2}"/>`;
  }
  const charSvg = characterSVG(id, 'celebration', { aura: 3 }).replace('<svg ', '<svg x="190" y="420" width="700" height="812" ');
  const big = x(latexToText(o.big));
  const bigSize = big.length > 6 ? 150 : 210;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <radialGradient id="sbg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset=".45" stop-color="#1a1030"/><stop offset="1" stop-color="#07040e"/></radialGradient>
      <pattern id="sdots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="2.4" fill="#fff" opacity=".07"/></pattern>
      <linearGradient id="sfire" x1="0" x2="1"><stop offset="0" stop-color="#FF3D9A"/><stop offset="1" stop-color="#FFB020"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sbg)"/>
    ${rays}
    <rect width="${W}" height="${H}" fill="url(#sdots)"/>
    <text x="540" y="250" text-anchor="middle" font-family="'Unbounded Variable','Arial Black',sans-serif" font-size="54" font-weight="900" fill="#fff" letter-spacing="6">${x(latexToText(o.kicker || '')).toUpperCase()}</text>
    <text x="540" y="${250 + bigSize}" text-anchor="middle" font-family="'Unbounded Variable','Arial Black',sans-serif" font-size="${bigSize}" font-weight="900" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke">${big}</text>
    ${charSvg}
    <rect x="70" y="1290" width="940" height="${o.sub ? 120 : 0}" rx="20" fill="#fff" stroke="#000" stroke-width="8" transform="rotate(-2 540 1350)"/>
    ${o.sub ? `<text x="540" y="1372" text-anchor="middle" font-family="'Unbounded Variable','Arial Black',sans-serif" font-size="${o.sub.length > 26 ? 40 : 54}" font-weight="900" fill="#111" transform="rotate(-2 540 1350)">${x(latexToText(o.sub))}</text>` : ''}
    ${(o.lines || []).slice(0, 2).map((l, k) => `<text x="540" y="${1490 + k * 62}" text-anchor="middle" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="#fff">${x(latexToText(l))}</text>`).join('')}
    <g transform="translate(140 1630)">
      <rect width="380" height="120" rx="60" fill="url(#sfire)" stroke="#000" stroke-width="6"/>
      <text x="190" y="80" text-anchor="middle" font-family="'Unbounded Variable','Arial Black',sans-serif" font-size="54" font-weight="900" fill="#fff">🔥 ${streak} j</text>
    </g>
    <g transform="translate(560 1630)">
      <rect width="380" height="120" rx="60" fill="${c}" stroke="#000" stroke-width="6"/>
      <text x="190" y="80" text-anchor="middle" font-family="'Unbounded Variable','Arial Black',sans-serif" font-size="54" font-weight="900" fill="#111">${t("NIV.")} ${level}</text>
    </g>
    <text x="540" y="1860" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#fff" opacity=".55" letter-spacing="3">${t("RÉVISION IA ✦ La Jeunesse de 2026")}</text>
  </svg>`;
}

/** Image 1080×1920 du statut (JPEG : ~5× plus léger qu'un PNG, idéal pour WhatsApp). */
export function statusPng(o) {
  return svgToPng(statusSVG(o), W, 'image/jpeg', 0.9);
}

/**
 * Fenêtre de Binta : aperçu du statut + bouton Partager.
 * @param {object} o  voir statusSVG
 */
export function offerStatus(o) {
  const m = modal(`
    <div class="center" style="--c:${CHARACTERS.binta.color}">
      <div class="row nowrap" style="gap:8px;text-align:left">${characterHTML('binta', { expression: 'celebration', size: 64 })}
        <div class="bubble" style="flex:1"><span class="who">Binta</span>${esc(line('binta', 'statut_offre'))}</div></div>
      <div class="status-preview">${statusSVG(o)}</div>
      <button class="btn pink block" id="st-share">${t("📸 Partager en statut")}</button>
      <button class="btn ghost block" data-close style="margin-top:8px">${t("Plus tard")}</button>
    </div>`);
  sound('sparkle');
  m.el.querySelector('#st-share').onclick = async (ev) => {
    const b = ev.currentTarget;
    b.disabled = true;
    b.textContent = t('⏳ Image en préparation…');
    try {
      const png = await statusPng(o);
      const r = await shareImage(png, fileName('statut', latexToText(o.sub || o.kicker), 'jpg'), `${latexToText(o.kicker)} ${latexToText(o.big)} ${t("🔥 — Révision IA")}`);
      if (r !== 'cancelled') { m.close(); import('./ui.js').then(({ toast }) => toast(line('binta', 'statut_partage'), 'ok')); }
    } catch (e) {
      console.error(e);
    }
    b.disabled = false;
    b.textContent = t('📸 Partager en statut');
  };
  return m;
}
