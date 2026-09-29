// =====================================================================
// sfx.js — EFFETS SONORES STYLE ANIME, 100 % GÉNÉRÉS PAR LE CODE
// ---------------------------------------------------------------------
// Aucun fichier audio à télécharger (connexion lente) : chaque son est
// fabriqué à la volée avec la Web Audio API (oscillateurs + bruit filtré).
//
// Règle des navigateurs : le son ne peut démarrer qu'APRÈS une première
// interaction (toucher, clic, touche). Avant, les sons sont ignorés.
//
// 👉 Pour modifier un son : change sa fonction dans SOUNDS (fréquences en Hz,
//    durées en secondes). Pour la "voix" d'un perso : VOICES.
//
// Utilisation : playSfx('good') · playSfx('swipe', 'left') · voice('ren')
// =====================================================================

let ctx = null; // contexte audio (créé à la 1re interaction)
let master = null; // volume général
let enabled = true;
let volume = 0.55;
let noiseBuf = null;

/** Réglages (appelé au démarrage et quand on change les Réglages). */
export function setSfxPrefs({ on, vol }) {
  if (on !== undefined) enabled = !!on;
  if (vol !== undefined) volume = Math.max(0, Math.min(1, vol));
  if (master) master.gain.value = volume * 0.6;
}

/** Crée le contexte audio à la première interaction (règle des navigateurs). */
function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = volume * 0.6;
    // Petit compresseur : évite les sons trop forts quand plusieurs se superposent.
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    // Bruit blanc réutilisable (whoosh, tambours…)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch { ctx = null; }
}
['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));

// ---------------------------------------------------------------------
// Briques de base
// ---------------------------------------------------------------------
/** Note simple : forme d'onde, fréquence (ou [début, fin]), durée, volume, départ. */
function tone({ type = 'sine', f = 440, to, dur = 0.15, vol = 0.5, at = 0, attack = 0.005 }) {
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** Bruit filtré (whoosh, souffle, tambour). */
function noise({ dur = 0.3, vol = 0.4, at = 0, type = 'bandpass', f = 1200, to, q = 1.2 }) {
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const fl = ctx.createBiquadFilter();
  fl.type = type;
  fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t);
  if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(fl).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

// ---------------------------------------------------------------------
// Bibliothèque de sons
// ---------------------------------------------------------------------
const SOUNDS = {
  // Clic des boutons principaux
  click: () => tone({ type: 'triangle', f: 900, to: 1400, dur: 0.05, vol: 0.25 }),
  tap: () => tone({ type: 'triangle', f: 700, to: 950, dur: 0.05, vol: 0.2 }),
  // Whoosh de téléportation
  teleport: () => {
    noise({ dur: 0.35, vol: 0.5, f: 4000, to: 300, q: 2 });
    tone({ type: 'sine', f: 1800, to: 300, dur: 0.3, vol: 0.12 });
  },
  // Scintillement (étoiles, confettis)
  sparkle: () => {
    for (let i = 0; i < 6; i++) tone({ type: 'sine', f: 1800 + Math.random() * 1800, dur: 0.12, vol: 0.12, at: i * 0.05 });
  },
  // Montée d'énergie : niveau 1 (léger), 2 (fort), 3 (ultime)
  energy: (lvl = 1) => {
    const dur = [0, 0.6, 1.0, 1.6][lvl];
    tone({ type: 'sawtooth', f: 110, to: 110 * (2 + lvl), dur, vol: 0.14 + lvl * 0.04 });
    tone({ type: 'square', f: 220, to: 220 * (2 + lvl), dur, vol: 0.05 + lvl * 0.02 });
    noise({ dur, vol: 0.12 + lvl * 0.06, type: 'highpass', f: 800, to: 6000, q: 0.7 });
    if (lvl >= 2) for (let i = 0; i < 4 * lvl; i++) tone({ type: 'sine', f: 2000 + Math.random() * 2500, dur: 0.1, vol: 0.08, at: dur * 0.4 + i * 0.05 });
    if (lvl >= 3) { // explosion finale : boom grave + accord
      tone({ type: 'sine', f: 90, to: 40, dur: 0.9, vol: 0.6, at: dur });
      noise({ dur: 0.8, vol: 0.4, type: 'lowpass', f: 2000, to: 200, at: dur });
      [523, 659, 784, 1046].forEach((f) => tone({ type: 'triangle', f, dur: 0.9, vol: 0.12, at: dur + 0.02 }));
    }
  },
  // Bonne / mauvaise réponse
  good: () => { tone({ type: 'triangle', f: 988, dur: 0.1, vol: 0.3 }); tone({ type: 'triangle', f: 1480, dur: 0.22, vol: 0.3, at: 0.08 }); },
  bad: () => { tone({ type: 'square', f: 220, to: 150, dur: 0.18, vol: 0.18 }); tone({ type: 'square', f: 165, to: 110, dur: 0.25, vol: 0.18, at: 0.12 }); },
  // Swipe de fiche : différent selon la direction
  swipe: (dir = 'right') => {
    const cfg = {
      right: { f: 600, to: 3000, t: 900, tt: 1400 }, // "je sais" : ça monte
      left: { f: 3000, to: 400, t: 500, tt: 300 }, // "à revoir" : ça descend
      up: { f: 1500, to: 6000, t: 1200, tt: 2400 }, // "facile" : envolée aiguë
      down: { f: 800, to: 200, t: 200, tt: 120 }, // "difficile" : lourd
    }[dir] || {};
    noise({ dur: 0.22, vol: 0.35, f: cfg.f, to: cfg.to, q: 1.5 });
    tone({ type: 'triangle', f: cfg.t, to: cfg.tt, dur: 0.14, vol: 0.12 });
  },
  flip: () => noise({ dur: 0.12, vol: 0.25, f: 2500, to: 900, q: 3 }),
  // Niveau gagné : petite fanfare
  level: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone({ type: 'triangle', f, dur: 0.18, vol: 0.28, at: i * 0.09 }));
    [1046, 1318].forEach((f) => tone({ type: 'square', f, dur: 0.45, vol: 0.08, at: 0.36 }));
    SOUNDS.sparkle();
  },
  // Badge débloqué : cloche + scintillement
  badge: () => {
    [1318, 2637, 3951].forEach((f, i) => tone({ type: 'sine', f, dur: 0.9 - i * 0.2, vol: 0.2 / (i + 1) }));
    setTimeout(() => SOUNDS.sparkle(), 120);
  },
  // Apparition d'une bulle de dialogue
  bubble: () => tone({ type: 'sine', f: 520, to: 880, dur: 0.07, vol: 0.18 }),
  // Révélation de la note : roulement de tambour puis coup
  reveal: () => {
    for (let i = 0; i < 10; i++) noise({ dur: 0.05, vol: 0.12 + i * 0.02, type: 'lowpass', f: 900, at: i * 0.045 });
    tone({ type: 'sine', f: 110, to: 55, dur: 0.5, vol: 0.5, at: 0.47 });
    noise({ dur: 0.4, vol: 0.35, type: 'highpass', f: 3000, at: 0.47 });
  },
  // Compatibilité (anciens noms)
  level_up: () => SOUNDS.level(),
};

// ---------------------------------------------------------------------
// "Voix" signature de chaque perso (petites syllabes synthétiques)
// ---------------------------------------------------------------------
// base = hauteur (Hz), wave = timbre, notes = mélodie (multiplicateurs), gap = rythme (s)
const VOICES = {
  kai: { base: 330, wave: 'triangle', notes: [1, 1.25, 1], gap: 0.09 }, // grand frère, chaleureux
  mory: { base: 520, wave: 'square', notes: [1, 1.5, 1.2, 1.8], gap: 0.06 }, // bips de geek
  nia: { base: 392, wave: 'sine', notes: [1, 0.9], gap: 0.14 }, // calme, douce
  sora: { base: 660, wave: 'triangle', notes: [1, 1.33, 1.5], gap: 0.05 }, // rapide, joueuse
  ren: { base: 196, wave: 'sawtooth', notes: [1, 1.5], gap: 0.08 }, // rival, grave
  awa: { base: 294, wave: 'square', notes: [1, 1], gap: 0.1 }, // coach, ferme
  tidiane: { base: 174, wave: 'sine', notes: [1, 0.84], gap: 0.18 }, // zen, lent
  binta: { base: 587, wave: 'sawtooth', notes: [1, 1.25, 1.5, 2], gap: 0.05 }, // hype, montante
};

/** Petite "voix" signature quand un perso parle. */
export function voice(id) {
  if (!enabled || !ctx) return;
  const v = VOICES[id];
  if (!v) return;
  try {
    v.notes.forEach((m, i) => tone({ type: v.wave, f: v.base * m, to: v.base * m * 1.06, dur: v.gap * 1.4, vol: v.wave === 'sine' ? 0.22 : 0.09, at: i * v.gap }));
  } catch { /* son non disponible */ }
}

/** Joue un son de la bibliothèque. */
export function playSfx(name, arg) {
  if (!enabled || !ctx || !SOUNDS[name]) return;
  try { SOUNDS[name](arg); } catch { /* son non disponible */ }
}

/** Liste des sons (Panneau créateur). */
export const SFX_LIST = Object.keys(SOUNDS).filter((n) => n !== 'level_up' && n !== 'tap');
export const VOICE_LIST = Object.keys(VOICES);

// Clic des boutons principaux (une seule écoute pour toute l'appli).
document.addEventListener('click', (e) => {
  if (e.target.closest?.('.btn, .nav a, .choice, .pick')) playSfx('click');
}, true);
