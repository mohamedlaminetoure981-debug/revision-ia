// =====================================================================
// particles.js — MOTEUR DE PARTICULES LUMINEUSES (canvas)
// ---------------------------------------------------------------------
// Étincelles, éclats de lumière, traînées néon, petites étoiles, ondes de
// choc : tout est dessiné dans UN SEUL canvas plein écran, partagé par
// toutes les célébrations, créé à la demande et retiré dès qu'il est vide.
//
// Pensé pour un Android d'entrée de gamme :
//  - aucun "shadowBlur" (très lent) : la lueur vient de petites images
//    pré-calculées (dégradés radiaux) dessinées en mode additif ;
//  - résolution plafonnée (×1,5), nombre de particules plafonné ;
//  - si les images tombent sous ~40 i/s, les nouvelles salves sont
//    automatiquement allégées ;
//  - animations réduites (prefers-reduced-motion) : rien n'est dessiné.
// =====================================================================

const MAX = 320; // particules vivantes au maximum
const parts = [];
let canvas = null;
let ctx = null;
let W = 0;
let H = 0;
let raf = 0;
let last = 0;
let slowFrames = 0;
let quality = 1; // 1 = normal ; baisse si le téléphone peine

export const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.motion === 'off';

// ---------------------------------------------------------------------
// Petites images pré-calculées (une par couleur) : lueur, étoile, traînée
// ---------------------------------------------------------------------
const sprites = new Map();
function rgb(hex) {
  const n = parseInt(String(hex).replace('#', '').replace(/^(.)(.)(.)$/, '$1$1$2$2$3$3'), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function sprite(color, kind) {
  const key = `${color}|${kind}`;
  let s = sprites.get(key);
  if (s) return s;
  const [r, g, b] = rgb(color);
  s = document.createElement('canvas');
  const c = s.getContext('2d');
  if (kind === 'glow') {
    // Point de lumière : cœur presque blanc, halo coloré
    s.width = s.height = 64;
    const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.18, `rgba(${r},${g},${b},.95)`);
    gr.addColorStop(0.45, `rgba(${r},${g},${b},.35)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    c.fillStyle = gr;
    c.fillRect(0, 0, 64, 64);
  } else if (kind === 'star') {
    // Étoile à 4 branches fines (éclat de lumière)
    s.width = s.height = 64;
    c.translate(32, 32);
    const gr = c.createRadialGradient(0, 0, 0, 0, 0, 30);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.3, `rgba(${r},${g},${b},.9)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    c.fillStyle = gr;
    for (let k = 0; k < 2; k++) {
      c.beginPath();
      c.moveTo(-31, 0); c.quadraticCurveTo(0, -3.2, 31, 0); c.quadraticCurveTo(0, 3.2, -31, 0);
      c.fill();
      c.rotate(Math.PI / 2);
    }
    const core = c.createRadialGradient(0, 0, 0, 0, 0, 9);
    core.addColorStop(0, 'rgba(255,255,255,1)');
    core.addColorStop(1, `rgba(${r},${g},${b},0)`);
    c.fillStyle = core;
    c.fillRect(-9, -9, 18, 18);
  } else {
    // Traînée néon : trait horizontal, tête lumineuse à droite, queue qui s'efface
    s.width = 128; s.height = 16;
    const gr = c.createLinearGradient(0, 0, 128, 0);
    gr.addColorStop(0, `rgba(${r},${g},${b},0)`);
    gr.addColorStop(0.75, `rgba(${r},${g},${b},.75)`);
    gr.addColorStop(1, 'rgba(255,255,255,1)');
    c.fillStyle = gr;
    c.beginPath();
    c.moveTo(0, 8); c.lineTo(118, 4.5); c.arc(120, 8, 3.5, -Math.PI / 2, Math.PI / 2); c.lineTo(0, 8);
    c.fill();
    const halo = c.createLinearGradient(0, 0, 128, 0);
    halo.addColorStop(0, `rgba(${r},${g},${b},0)`);
    halo.addColorStop(1, `rgba(${r},${g},${b},.35)`);
    c.fillStyle = halo;
    c.fillRect(40, 1, 88, 14);
  }
  sprites.set(key, s);
  return s;
}

// ---------------------------------------------------------------------
// Boucle d'animation
// ---------------------------------------------------------------------
function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  resize();
  addEventListener('resize', resize);
}
function resize() {
  if (!canvas) return;
  const dpr = Math.min(1.5, window.devicePixelRatio || 1) * (quality < 1 ? 0.75 : 1);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function stop() {
  cancelAnimationFrame(raf);
  raf = 0;
  removeEventListener('resize', resize);
  canvas?.remove();
  canvas = null;
}

function frame(now) {
  const dtMs = Math.min(50, now - (last || now));
  last = now;
  // Téléphone qui peine (< ~40 i/s plusieurs fois de suite) → salves suivantes allégées.
  if (dtMs > 25) { if (++slowFrames > 12 && quality > 0.5) { quality = 0.5; resize(); } } else slowFrames = Math.max(0, slowFrames - 1);
  const dt = dtMs / 16.67; // 1 = une image à 60 i/s
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dpr = canvas.width / W;
  ctx.globalCompositeOperation = 'lighter'; // les lumières s'additionnent : effet néon
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (p.delay > 0) { p.delay -= dtMs; continue; }
    p.age += dtMs;
    const k = p.age / p.life;
    if (k >= 1) { parts.splice(i, 1); continue; }
    p.vx *= p.drag ** dt; p.vy = p.vy * p.drag ** dt + p.g * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.rot += p.vr * dt;
    // Apparition rapide puis fondu doux ; les étoiles scintillent
    let a = k < 0.08 ? k / 0.08 : 1 - ((k - 0.08) / 0.92) ** 1.6;
    if (p.kind === 'star') a *= 0.65 + 0.35 * Math.sin(p.age * 0.025 + p.seed);
    if (a <= 0.01) continue;
    ctx.globalAlpha = a;
    if (p.kind === 'ring') {
      // Onde de choc : anneau qui s'agrandit et s'amincit
      const r = p.r0 + (p.r1 - p.r0) * (1 - (1 - k) ** 3);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = Math.max(0.5, p.size * (1 - k));
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
      continue;
    }
    if (p.kind === 'streak') {
      // Traînée orientée dans le sens du mouvement, plus longue quand ça va vite
      const sp = Math.hypot(p.vx, p.vy);
      const len = Math.max(p.size * 2, Math.min(90, sp * 5.5)) * (1 - k * 0.5);
      const ang = Math.atan2(p.vy, p.vx);
      const c = Math.cos(ang) * dpr; const s = Math.sin(ang) * dpr;
      ctx.setTransform(c, s, -s, c, p.x * dpr, p.y * dpr);
      ctx.drawImage(p.img, -len, -p.size / 2, len + p.size * 0.6, p.size);
      continue;
    }
    const size = p.size * (p.kind === 'star' ? 0.7 + 0.5 * Math.sin(Math.min(1, k * 3) * Math.PI / 2) : 1 - k * 0.4);
    const c = Math.cos(p.rot) * dpr; const s = Math.sin(p.rot) * dpr;
    ctx.setTransform(c, s, -s, c, p.x * dpr, p.y * dpr);
    ctx.drawImage(p.img, -size / 2, -size / 2, size, size);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  if (parts.length) raf = requestAnimationFrame(frame);
  else stop();
}

function add(p) {
  if (parts.length >= MAX) return;
  p.age = 0; p.rot ??= 0; p.vr ??= 0; p.g ??= 0; p.drag ??= 1; p.delay ??= 0; p.seed = Math.random() * 6;
  if (p.kind !== 'ring') p.img = sprite(p.color, p.kind === 'streak' ? 'streak' : p.kind === 'star' ? 'star' : 'glow');
  parts.push(p);
}
function start() {
  if (!parts.length) return;
  ensureCanvas();
  if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
}

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------------------------------------------------------------------
// Effets prêts à l'emploi
// ---------------------------------------------------------------------
/**
 * Explosion lumineuse : onde de choc + étincelles en traînées néon + étoiles
 * qui retombent doucement + petits points de lumière.
 * @param {object} o { x, y, colors, power (0.5 → 2), count }
 */
export function burst({ x = innerWidth / 2, y = innerHeight * 0.4, colors = ['#fff'], power = 1, count = 90 } = {}) {
  if (reducedMotion()) return;
  const n = Math.round(count * quality);
  const scale = Math.min(innerWidth, 520) / 390; // même rendu sur petit et grand écran
  // Ondes de choc
  add({ kind: 'ring', x, y, r0: 8, r1: 150 * power * scale, size: 7, life: 520, color: colors[0] });
  if (power >= 1) add({ kind: 'ring', x, y, r0: 4, r1: 230 * power * scale, size: 3, life: 760, delay: 70, color: '#ffffff' });
  // Flash central
  add({ kind: 'glow', x, y, size: 260 * power * scale, life: 300, color: colors[0] });
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2);
    const r = Math.random();
    const color = pick(colors);
    if (r < 0.5) {
      // Étincelles rapides (traînées néon)
      const sp = rnd(7, 17) * power * scale;
      add({ kind: 'streak', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, g: 0.16, drag: 0.94, size: rnd(5, 9), life: rnd(650, 1100), color });
    } else if (r < 0.78) {
      // Étoiles qui tournent et retombent lentement
      const sp = rnd(3, 10) * power * scale;
      add({ kind: 'star', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, g: 0.07, drag: 0.95, vr: rnd(-0.12, 0.12), rot: rnd(0, 3), size: rnd(14, 30), life: rnd(1300, 2100), color });
    } else {
      // Poussière de lumière
      const sp = rnd(1, 7) * power * scale;
      add({ kind: 'glow', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 0.03, drag: 0.96, size: rnd(6, 16), life: rnd(900, 1700), color, delay: rnd(0, 140) });
    }
  }
  start();
}

/** Pluie d'étoiles et d'éclats depuis le haut de l'écran (grands moments). */
export function rain({ colors = ['#fff'], count = 40, duration = 1400 } = {}) {
  if (reducedMotion()) return;
  const n = Math.round(count * quality);
  for (let i = 0; i < n; i++) {
    const star = Math.random() < 0.55;
    add({
      kind: star ? 'star' : 'streak', x: rnd(0, innerWidth), y: rnd(-40, -10),
      vx: rnd(-0.6, 0.6), vy: rnd(3, 7), g: 0.05, drag: 0.99, vr: rnd(-0.08, 0.08),
      size: star ? rnd(12, 24) : rnd(4, 7), life: rnd(1400, 2200), delay: rnd(0, duration), color: pick(colors),
    });
  }
  start();
}

/**
 * Éclat en particules à partir d'un rectangle (sortie d'un texte d'effet) :
 * les points partent de toute la surface, vers l'extérieur.
 */
export function shatter(rect, { colors = ['#fff'], count = 60 } = {}) {
  if (reducedMotion() || !rect) return;
  const n = Math.round(count * quality);
  const cx = rect.left + rect.width / 2; const cy = rect.top + rect.height / 2;
  for (let i = 0; i < n; i++) {
    const x = rnd(rect.left, rect.right); const y = rnd(rect.top + rect.height * 0.15, rect.bottom - rect.height * 0.15);
    const a = Math.atan2(y - cy, x - cx) + rnd(-0.4, 0.4);
    const sp = rnd(2, 8);
    const glow = Math.random() < 0.6;
    add({ kind: glow ? 'glow' : 'streak', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, g: 0.05, drag: 0.95, size: glow ? rnd(6, 14) : rnd(4, 7), life: rnd(500, 900), color: pick(colors) });
  }
  start();
}

/** Petite gerbe (bonne réponse, +XP…) : quelques étincelles autour d'un point. */
export function sparkle(x, y, { colors = ['#fff'], count = 14 } = {}) {
  if (reducedMotion()) return;
  for (let i = 0; i < Math.round(count * quality); i++) {
    const a = rnd(0, Math.PI * 2); const sp = rnd(2, 6);
    add({ kind: i % 3 ? 'glow' : 'star', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, g: 0.08, drag: 0.94, size: i % 3 ? rnd(5, 10) : rnd(12, 18), life: rnd(450, 800), color: pick(colors) });
  }
  start();
}

/** Étincelles qui montent autour d'un rectangle (aura d'un personnage). */
export function rise(rect, { colors = ['#fff'], count = 26 } = {}) {
  if (reducedMotion() || !rect) return;
  for (let i = 0; i < Math.round(count * quality); i++) {
    const star = i % 4 === 0;
    add({
      kind: star ? 'star' : 'glow', x: rnd(rect.left + rect.width * 0.1, rect.right - rect.width * 0.1), y: rnd(rect.top + rect.height * 0.5, rect.bottom),
      vx: rnd(-0.4, 0.4), vy: rnd(-3.2, -1.4), g: -0.02, drag: 0.985, vr: rnd(-0.06, 0.06),
      size: star ? rnd(12, 20) : rnd(5, 11), life: rnd(800, 1500), delay: rnd(0, 900), color: pick(colors),
    });
  }
  start();
}
