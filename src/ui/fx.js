// =====================================================================
// fx.js — Sensations : confettis, onomatopées anime, vibrations, sons
// ---------------------------------------------------------------------
// Tout est léger (pas de bibliothèque) pour rester fluide sur un
// téléphone d'entrée de gamme. Les sons sont DÉSACTIVÉS par défaut
// (Profil → Réglages). Les vibrations peuvent aussi être coupées.
// =====================================================================

import * as db from '../core/db.js';

const prefs = { sounds: false, vibration: true, motion: true };

/** Charge les préférences (appelé au démarrage et après un changement). */
export async function loadFxPrefs() {
  prefs.sounds = await db.getSetting('sounds');
  prefs.vibration = await db.getSetting('vibration');
  prefs.motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Vibration légère (si le téléphone le permet et si c'est activé). */
export function vibrate(pattern = 15) {
  if (prefs.vibration && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch { /* ignoré */ }
  }
}

// ---------------------------------------------------------------------
// Sons (générés par le navigateur, aucun fichier à télécharger)
// ---------------------------------------------------------------------
let audioCtx = null;
const SOUNDS = {
  tap: [[660, 0.05]],
  good: [[660, 0.08], [990, 0.12]],
  bad: [[300, 0.12], [220, 0.16]],
  flip: [[520, 0.05]],
  level: [[523, 0.1], [659, 0.1], [784, 0.1], [1046, 0.25]],
  swipe: [[440, 0.04], [700, 0.05]],
};

/** Joue un petit son ('tap', 'good', 'bad', 'flip', 'level', 'swipe'). */
export function sound(name) {
  if (!prefs.sounds || !SOUNDS[name]) return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    let t = audioCtx.currentTime;
    for (const [freq, dur] of SOUNDS[name]) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur * 0.9;
    }
  } catch { /* son non disponible */ }
}

/** Joue un fichier audio (voix des persos, quand elles existeront). */
export function playVoice(url) {
  if (!prefs.sounds || !url) return;
  try { new Audio(import.meta.env.BASE_URL + url).play(); } catch { /* ignoré */ }
}

// ---------------------------------------------------------------------
// Confettis
// ---------------------------------------------------------------------
const CONFETTI_COLORS = ['#8B5CF6', '#C6FF3D', '#FF3D9A', '#22D3EE', '#FFD23F'];

/** Lance des confettis pendant ~2,2 s. */
export function confetti(count = 110) {
  if (!prefs.motion) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const parts = Array.from({ length: count }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 80,
    y: innerHeight * 0.38,
    vx: (Math.random() - 0.5) * 13,
    vy: -Math.random() * 13 - 4,
    r: Math.random() * 6 + 4,
    a: Math.random() * Math.PI,
    va: (Math.random() - 0.5) * 0.3,
    c: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    star: Math.random() < 0.25,
  }));
  const start = performance.now();
  (function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.globalAlpha = Math.max(0, 1 - t / 2200);
      ctx.fillStyle = p.c;
      if (p.star) { // petite étincelle à 4 branches
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const rr = i % 2 ? p.r * 0.35 : p.r;
          ctx.lineTo(Math.cos((i * Math.PI) / 4) * rr, Math.sin((i * Math.PI) / 4) * rr);
        }
        ctx.fill();
      } else {
        ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      }
      ctx.restore();
    }
    if (t < 2200) requestAnimationFrame(frame);
    else canvas.remove();
  })(start);
}

/** Grosse onomatopée anime au centre de l'écran ("YOSH!", "LET'S GO!"…). */
export function onomatopoeia(text) {
  const burst = document.createElement('div');
  burst.className = 'burst';
  const el = document.createElement('div');
  el.className = 'onomatopoeia';
  el.textContent = text;
  document.body.append(burst, el);
  setTimeout(() => { el.remove(); burst.remove(); }, 1400);
}

/** "+15 XP" qui s'envole depuis un élément (ou le centre de l'écran). */
export function xpFloat(amount, fromEl) {
  if (!amount) return;
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = `+${amount} XP`;
  const r = fromEl?.getBoundingClientRect?.();
  el.style.left = `${r ? r.left + r.width / 2 - 30 : innerWidth / 2 - 30}px`;
  el.style.top = `${r ? r.top : innerHeight / 2}px`;
  document.body.appendChild(el);
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
      <button class="btn pink block" data-close>Trop bien ! ✨</button>
    </div>`);
  confetti(120);
  sound('level');
  vibrate([20, 30, 20, 30, 50]);
  setTimeout(() => play(m.el.querySelector('.ch'), 'signature'), 300);
  // Nouveau niveau : aura forte de Binta (flammes, particules, cheveux qui s'agitent).
  if (result.levelUp && ![10, 25, 50].includes(result.level)) {
    const { power } = await import('./powers.js');
    setTimeout(() => power('binta', 'strong', { target: m.el.querySelector('.ch') }), 1500);
  }
}
