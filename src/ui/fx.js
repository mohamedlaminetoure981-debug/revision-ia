// =====================================================================
// fx.js — Sensations : célébrations lumineuses, textes d'effet, vibrations, sons
// ---------------------------------------------------------------------
// Tout est léger (pas de bibliothèque) pour rester fluide sur un
// téléphone d'entrée de gamme : les particules sont dessinées par
// ui/particles.js (canvas), les textes d'effet en CSS (styles/main.css).
// Les sons (style anime, générés par le code dans ui/sfx.js) sont ACTIVÉS
// par défaut, volume modéré : bouton 🔊/🔇 en haut de l'écran et curseur
// de volume dans Réglages.
// =====================================================================

import * as db from '../core/db.js';
import { playSfx, setSfxPrefs } from './sfx.js';
import { burst, rain, shatter, sparkle, reducedMotion } from './particles.js';
import { getProfileSync } from '../core/game.js';
import { CHARACTERS } from '../data/characters.js';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const prefs = { sounds: true, vibration: true, motion: true };

/** Charge les préférences (appelé au démarrage et après un changement). */
export async function loadFxPrefs() {
  prefs.sounds = await db.getSetting('sounds');
  prefs.vibration = await db.getSetting('vibration');
  prefs.motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setSfxPrefs({ on: prefs.sounds, vol: await db.getSetting('volume') });
}

/** Vibration légère (si le téléphone le permet et si c'est activé). */
export function vibrate(pattern = 15) {
  if (prefs.vibration && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch { /* ignoré */ }
  }
}

// ---------------------------------------------------------------------
// Sons : délégués au moteur ui/sfx.js (générés par le code)
// ---------------------------------------------------------------------
/** Joue un son : 'tap', 'good', 'bad', 'flip', 'level', 'swipe', 'sparkle', 'badge'… */
export function sound(name, arg) {
  playSfx(name, arg);
}

/** Joue un fichier audio (voix des persos, quand elles existeront). */
export function playVoice(url) {
  if (!prefs.sounds || !url) return;
  try { new Audio(import.meta.env.BASE_URL + url).play(); } catch { /* ignoré */ }
}

// ---------------------------------------------------------------------
// Couleurs d'une célébration : celles de l'appli + celle du personnage
// ---------------------------------------------------------------------
const APP_COLORS = ['#C6FF3D', '#FF3D9A', '#22D3EE', '#8B5CF6', '#FFD23F'];
/** Couleur principale : celle demandée, sinon celle du compagnon choisi. */
function mainColor(color) {
  if (color) return color;
  const id = getProfileSync()?.companion;
  return CHARACTERS[id]?.color || '#8B5CF6';
}
/** Couleur d'accent qui contraste avec la principale (rose ou cyan). */
function accentOf(c) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  return r > b && r > 150 && g < 160 ? '#22D3EE' : '#FF3D9A';
}
function palette(color) {
  const c1 = mainColor(color);
  const c2 = accentOf(c1);
  return { c1, c2, particles: [c1, c1, c2, '#ffffff', ...APP_COLORS.filter((x) => x !== c1).slice(0, 2)] };
}

// ---------------------------------------------------------------------
// Célébration lumineuse (remplace les anciens confettis de papier)
// ---------------------------------------------------------------------
let lastBurst = 0;

/**
 * Explosion de lumière : onde de choc, étincelles en traînées néon, étoiles qui
 * retombent ; pluie d'éclats en plus pour les grands moments (count ≥ 140).
 * @param {number} [count]  intensité (ancien nombre de confettis : 60 → 200)
 * @param {object} [o]      { color: couleur du perso concerné, x, y }
 */
export function confetti(count = 110, o = {}) {
  playSfx('sparkle');
  if (!prefs.motion || reducedMotion()) return;
  const { particles } = palette(o.color);
  lastBurst = performance.now();
  burst({ x: o.x ?? innerWidth / 2, y: o.y ?? innerHeight * 0.38, colors: particles, power: count >= 150 ? 1.25 : count < 80 ? 0.8 : 1, count: Math.round(Math.min(150, count * 0.8)) });
  if (count >= 140) rain({ colors: particles, count: Math.round(count / 4) });
}

/** Petite secousse de l'écran (grands moments seulement). */
export function shakeScreen() {
  if (!prefs.motion || reducedMotion()) return;
  const app = document.getElementById('app');
  if (!app) return;
  app.classList.remove('fx-shake');
  void app.offsetWidth;
  app.classList.add('fx-shake');
  setTimeout(() => app.classList.remove('fx-shake'), 420);
}

/**
 * Grand texte d'effet au centre de l'écran ("LET'S GO!", "NIVEAU 5!"…) :
 * typo épaisse en dégradé néon, lueur, zoom avec rebond et flou de mouvement,
 * flash, légère aberration chromatique, puis sortie en éclat de particules.
 * @param {string} text
 * @param {object} [o]  { color: couleur du perso, big: grand moment (secousse), duration }
 */
export function onomatopoeia(text, o = {}) {
  const { c1, c2, particles } = palette(o.color);
  const big = o.big ?? /^(NIVEAU|NIV\.|LÉGENDAIRE|ULTIME|K\.O|VICTOIRE|FIN DE SAISON|AURA|👑|POUVOIR|PARFAIT)/i.test(text);
  const calm = !prefs.motion || reducedMotion();
  const el = document.createElement('div');
  el.className = `fx-title${big ? ' big' : ''}${calm ? ' calm' : ''}`;
  el.setAttribute('aria-hidden', 'true');
  el.style.setProperty('--c1', c1);
  el.style.setProperty('--c2', c2);
  // Texte long : police plus petite pour tenir sur l'écran (voir .fx-word)
  el.style.setProperty('--len', String(Math.max(4, [...String(text)].length)));
  // Les emojis (🔥, 👑…) sont posés à côté du texte : un dégradé ou une lueur les abîmerait.
  const emo = /\p{Extended_Pictographic}/u;
  const parts = String(text).split(/(\p{Extended_Pictographic}️?)/u).filter((p) => p.trim());
  el.innerHTML = `<div class="fx-rays"></div><div class="fx-flash"></div>
    <div class="fx-word">${parts.map((p) => {
      if (emo.test(p)) return `<span class="fx-emo">${p}</span>`;
      const t = esc(p.trim());
      return `<span class="fx-stack"><span class="g">${t}</span><span class="ca a">${t}</span><span class="ca b">${t}</span><span class="f">${t}</span></span>`;
    }).join('')}</div>`;
  document.body.appendChild(el);
  if (!calm) {
    // Petite gerbe si aucune explosion n'accompagne le texte
    if (performance.now() - lastBurst > 200) setTimeout(() => burst({ y: innerHeight * 0.38, colors: particles, power: 0.6, count: big ? 50 : 26 }), 90);
    if (big) setTimeout(shakeScreen, 110);
  }
  const dur = o.duration || (big ? 1650 : 1250);
  setTimeout(() => {
    const word = el.querySelector('.fx-word');
    if (!calm) shatter(word.getBoundingClientRect(), { colors: particles, count: big ? 70 : 40 });
    el.classList.add('out');
    setTimeout(() => el.remove(), 360);
  }, dur);
}

/** "+15 XP" lumineux qui s'envole depuis un élément (ou le centre de l'écran). */
export function xpFloat(amount, fromEl) {
  if (!amount) return;
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = `+${amount} XP`;
  const r = fromEl?.getBoundingClientRect?.();
  const x = r ? r.left + r.width / 2 : innerWidth / 2;
  const y = r ? r.top : innerHeight / 2;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  if (prefs.motion) sparkle(x, y, { colors: ['#C6FF3D', '#ffffff', '#22D3EE'], count: 10 });
  setTimeout(() => el.remove(), 1300);
}

const HYPE = ['YOSH!', "LET'S GO!", 'SUGOI!', 'GG!', 'BOOM!', 'NICE!', 'EZ!'];

/** Onomatopée au hasard. */
export function hypeWord() {
  return HYPE[Math.floor(Math.random() * HYPE.length)];
}

/**
 * Réagit au résultat de game.addXp() : "+XP", et grosse fête si
 * niveau supérieur, série qui monte ou objectifs du jour atteints.
 */
export function celebrate(result, fromEl) {
  if (!result?.gained) return;
  xpFloat(result.gained, fromEl);
  if (result.levelUp) {
    setTimeout(() => {
      confetti(150);
      onomatopoeia(`NIVEAU ${result.level}!`);
      sound('level');
      vibrate([30, 40, 30, 40, 60]);
    }, 300);
  } else if (result.auraUp) {
    setTimeout(() => { confetti(); onomatopoeia('AURA UP!'); vibrate([20, 30, 40]); }, 300);
  } else if (result.streakUp && result.streak > 1) {
    setTimeout(() => onomatopoeia(`🔥 ${result.streak} JOURS!`), 300);
  }
  // Pouvoirs (phase 3) : ultimes RARES (séries 7/30/100 j, niveaux 10/25/50), aura forte au niveau gagné.
  import('./powers.js').then(async ({ power }) => {
    if (result.streakUp && [7, 30, 100].includes(result.streak)) {
      const { getProfileSync } = await import('../core/game.js');
      power(getProfileSync()?.companion || 'kai', 'ultimate', { sub: `${result.streak} jours de suite !`, text: `🔥 ${result.streak} JOURS!` });
    } else if (result.levelUp && [10, 25, 50].includes(result.level)) {
      power('binta', 'ultimate', { sub: `Niveau ${result.level} atteint !`, text: `NIVEAU ${result.level}!` });
    }
  });
  // Binta fête les niveaux gagnés et les nouveaux badges.
  if (result.levelUp || result.newBadges?.length) {
    setTimeout(() => bintaParty(result), result.levelUp ? 1500 : 700);
  }
}

/** Fenêtre de fête de Binta : niveau gagné et/ou badges débloqués. */
async function bintaParty(result) {
  const [{ modal, line, esc }, { characterHTML, play }] = await Promise.all([import('./ui.js'), import('./character.js')]);
  const items = [
    ...(result.levelUp ? [{ icon: '⬆️', name: `Niveau ${result.level}`, desc: 'Nouveau niveau atteint !' }] : []),
    ...(result.newBadges || []),
  ];
  const m = modal(`
    <div class="center" style="--c:#FF3D9A">
      ${characterHTML('binta', { expression: 'celebration', size: 150 })}
      <div class="bubble top" style="margin:8px 0 14px;text-align:left"><span class="who">Binta</span>${esc(line('binta', 'reussite'))}</div>
      ${items.map((b) => `
        <div class="tile neon badge-won" style="--c:#FF3D9A;margin-bottom:8px">
          <div class="row nowrap"><span style="font-size:2.2rem">${b.icon}</span>
            <div class="grow" style="text-align:left"><strong>${esc(b.name)}</strong><div class="small muted">${esc(b.desc)}</div></div></div>
        </div>`).join('')}
      ${result.levelUp ? '<button class="btn block" id="lv-status" style="margin-bottom:8px">📸 Statut WhatsApp</button>' : ''}
      <button class="btn pink block" data-close>Trop bien ! ✨</button>
    </div>`);
  m.el.querySelector('#lv-status')?.addEventListener('click', async () => {
    m.close();
    const { offerStatus } = await import('./status.js');
    offerStatus({ kicker: 'Nouveau niveau', big: `NIV. ${result.level}`, sub: 'Level up !', lines: [] });
  });
  confetti(120, { color: '#FF3D9A' });
  sound(result.newBadges?.length ? 'badge' : 'level');
  vibrate([20, 30, 20, 30, 50]);
  setTimeout(() => play(m.el.querySelector('.ch'), 'signature'), 300);
  // Nouveau niveau : aura forte de Binta (flammes, particules, cheveux qui s'agitent).
  if (result.levelUp && ![10, 25, 50].includes(result.level)) {
    const { power } = await import('./powers.js');
    setTimeout(() => power('binta', 'strong', { target: m.el.querySelector('.ch') }), 1500);
  }
}
