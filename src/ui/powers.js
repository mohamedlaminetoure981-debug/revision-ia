// =====================================================================
// powers.js — Auras et pouvoirs spéciaux des personnages (phase 3)
// ---------------------------------------------------------------------
// Trois niveaux de puissance :
//   'light'    aura légère : petite lueur autour du perso
//              → réussite normale (bonne série de fiches, quiz ≥ 70 %…)
//   'strong'   aura forte : flammes, particules, cheveux qui s'agitent
//              → 100 % à un quiz, examen blanc réussi, nouveau niveau
//   'ultimate' pouvoir ultime plein écran : flash, vibration, onomatopée
//              → TRÈS RARE : série de 7/30/100 jours, 1er examen à 20/20,
//                niveaux paliers 10, 25, 50. Un seul par session maximum.
//
// Règles :
//  - jamais pendant la lecture d'un résumé ni pendant une question :
//    les écrans concernés appellent suspendPowers() / resumePowers() ;
//    un pouvoir demandé pendant ce temps est joué plus tard ;
//  - le réglage "Scène de correction" s'applique aussi : 'short' (par défaut)
//    raccourcit l'ultime (1,7 s au lieu de 2,6 s), 'off' désactive tout ;
//  - bouton "Passer" (ou toucher l'écran) ; animations réduites respectées.
//
// L'effet visuel de chaque ultime dépend de `power.effect` du perso
// (src/data/characters.js) : voir la fonction ULTIMATE_FX ci-dessous.
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play } from './character.js';
import { onomatopoeia, vibrate, sound, confetti } from './fx.js';
import { rise } from './particles.js';
import { t } from '../i18n/index.js';

const RANK = { light: 1, strong: 2, ultimate: 3 };
let suspended = 0;
let queued = null;

/** Un ultime a-t-il déjà été joué pendant cette session ? */
function ultimateUsed() {
  try { return sessionStorage.getItem('ultimateUsed') === '1'; } catch { return window.__ultimateUsed; }
}
function markUltimate() {
  try { sessionStorage.setItem('ultimateUsed', '1'); } catch { window.__ultimateUsed = true; }
}
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Met les pouvoirs en pause (lecture d'un résumé, question en cours…). */
export function suspendPowers() {
  suspended++;
}

/** Reprend : joue le pouvoir le plus fort demandé pendant la pause. */
export function resumePowers() {
  suspended = Math.max(0, suspended - 1);
  if (!suspended && queued) {
    const q = queued;
    queued = null;
    setTimeout(() => power(q.charId, q.level, q.opts), 400);
  }
}

/**
 * Déclenche un pouvoir.
 * @param {string} charId  personnage (sa couleur et son effet)
 * @param {'light'|'strong'|'ultimate'} level
 * @param {object} [opts]  { target: élément .ch à faire briller, text: onomatopée, sub: sous-titre }
 */
export async function power(charId, level, opts = {}) {
  const mode = await db.getSetting('council');
  if (mode === 'off' || !CHARACTERS[charId]) return;
  if (level === 'ultimate' && ultimateUsed()) level = 'strong'; // 1 seul ultime par session
  if (suspended) {
    if (!queued || RANK[level] > RANK[queued.level]) queued = { charId, level, opts: { ...opts, target: null } };
    return;
  }
  if (level === 'ultimate') { markUltimate(); return ultimate(charId, { ...opts, short: mode === 'short' }); }
  const target = opts.target || document.querySelector(`#app .ch[data-ch="${charId}"]`);
  if (level === 'light') return light(target);
  return strong(charId, target);
}

// ---------------------------------------------------------------------
// Aura légère
// ---------------------------------------------------------------------
function light(target) {
  sound('energy', 1);
  if (!target) return;
  target.classList.remove('pw-light');
  void target.offsetWidth;
  target.classList.add('pw-light');
  setTimeout(() => target.classList.remove('pw-light'), 3000);
}

// ---------------------------------------------------------------------
// Aura forte : lueur + flammes qui montent + cheveux qui s'agitent
// ---------------------------------------------------------------------
function strong(charId, target) {
  const color = CHARACTERS[charId].color;
  sound('energy', 2);
  vibrate([20, 30, 40]);
  if (!target) { // pas de perso à l'écran : petite apparition au centre
    const box = document.createElement('div');
    box.className = 'pw-layer';
    box.style.cssText = 'left:50%;top:40%;transform:translate(-50%,-50%)';
    box.innerHTML = characterHTML(charId, { expression: 'celebration', size: 150, aura: 2 });
    document.body.appendChild(box);
    target = box.querySelector('.ch');
    setTimeout(() => box.remove(), 2200);
  }
  target.classList.remove('pw-strong');
  void target.offsetWidth;
  target.classList.add('pw-strong');
  setTimeout(() => target.classList.remove('pw-strong'), 1900);
  if (reduced()) return;
  const r = target.getBoundingClientRect();
  const layer = document.createElement('div');
  layer.className = 'pw-layer';
  layer.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;--c:${color}`;
  layer.innerHTML = Array.from({ length: 7 }, (_, i) =>
    `<span class="pw-flame" style="left:${8 + i * 13}%;animation-delay:${(i % 3) * 0.18 + i * 0.05}s"></span>`).join('');
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 1900);
  // Étincelles qui montent autour du perso
  rise(r, { colors: [color, '#ffffff', color] });
}

// ---------------------------------------------------------------------
// Pouvoir ultime (plein écran)
// ---------------------------------------------------------------------
const ULTIMATE_FX = {
  // KAÏ : flamme montante qui entoure tout l'écran
  flame: () => `<div class="fx-flame-edge"></div>${Array.from({ length: 10 }, (_, i) =>
    `<span class="fx-rise" style="left:${i * 10 + 2}%;animation-delay:${(i % 5) * 0.2}s"></span>`).join('')}`,
  // MORY : grille holographique + laser qui balaie
  scan: () => '<div class="fx-grid"></div><div class="fx-laser"></div>',
  // NIA : pages lumineuses qui tourbillonnent
  pages: () => `<div class="fx-orbit">${Array.from({ length: 8 }, (_, i) => `<i style="--a:${i * 45}deg;--r:${120 + (i % 2) * 30}px"></i>`).join('')}</div>`,
  // SORA : tempête de cartes en vortex
  cards: () => `<div class="fx-orbit cards fast">${Array.from({ length: 10 }, (_, i) => `<i style="--a:${i * 36}deg;--r:${150 + (i % 3) * 25}px"></i>`).join('')}</div>`,
  // REN : éclairs crépitants
  lightning: () => Array.from({ length: 5 }, (_, i) => `
    <svg class="fx-bolt" viewBox="0 0 60 300" preserveAspectRatio="none" style="left:${8 + i * 19}%;top:${(i % 2) * 40}%;animation-delay:${i * 0.11}s">
      <polyline points="30,0 12,110 38,120 16,220 44,230 26,300"/></svg>`).join(''),
  // AWA : stylo d'énergie qui trace un ✓ géant
  check: () => '<svg class="fx-check" viewBox="0 0 200 200"><path d="M30 105 L82 155 L172 45"/></svg>',
  // TIDIANE : bouclier zen, onde calme
  shield: () => `<div class="fx-shield"></div>${[0, 0.6, 1.2].map((d) => `<div class="fx-wave" style="animation-delay:${d}s"></div>`).join('')}`,
  // BINTA : explosion de hype (anneaux ; étincelles et étoiles par ui/particles.js)
  hype: () => [0, 0.35, 0.7].map((d) => `<div class="fx-hype" style="animation-delay:${d}s"></div>`).join(''),
};

function ultimate(charId, { text, sub, short = false } = {}) {
  const ch = CHARACTERS[charId];
  const fx = ULTIMATE_FX[ch.power?.effect] || ULTIMATE_FX.hype;
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'ultimate';
    el.style.setProperty('--c', ch.color);
    el.innerHTML = `
      <div class="ult-fx">${reduced() ? '' : fx()}</div>
      ${characterHTML(charId, { expression: 'celebration', size: 240, aura: 3 })}
      <div class="ult-name">${ch.power?.name || t('Pouvoir ultime')}</div>
      ${sub ? `<div class="ult-sub">${sub}</div>` : ''}
      <div class="ult-flash"></div>
      <button class="ult-skip">${t("Passer ⏭")}</button>`;
    document.body.appendChild(el);
    if (!reduced()) {
      if (ch.power?.effect === 'lightning') el.querySelector('.ult-fx').classList.add('shake'); // secousse limitée au pouvoir (pas à la page)
      setTimeout(() => onomatopoeia(text || t('POUVOIR ULTIME!'), { color: ch.color, big: true }), 250);
      confetti(ch.power?.effect === 'hype' ? 160 : 90, { color: ch.color, y: innerHeight * 0.45 });
    }
    vibrate([40, 30, 60, 30, 90]);
    sound('energy', 3);
    play(el.querySelector('.ch'), 'signature', { duration: 2000 });
    let done = false;
    const close = () => {
      if (done) return;
      done = true;
      el.remove();
      resolve();
    };
    el.onclick = close; // toucher l'écran ou "Passer"
    // Réglage "court" : le pouvoir ultime reste, mais plus bref.
    setTimeout(close, reduced() ? 1200 : short ? 1700 : 2600);
  });
}
