// =====================================================================
// character.js — Dessin et animation des personnages (SVG en calques)
// ---------------------------------------------------------------------
// Chaque personnage est dessiné en SVG, style manga shōnen (portrait en
// buste), à partir de sa description (`look` dans src/data/characters.js).
// Le dessin est découpé en calques
// (groupes <g>) que le CSS anime séparément :
//
//   .ch-aura       aura derrière le perso (évolue avec la série de jours)
//   .ch-fx-back    effets derrière (lignes de vitesse)
//   .ch-hair-back  cheveux arrière (afro, tresses, locks…)
//   .ch-body       cou + buste + tenue + accessoires du buste
//   .ch-head       tête : visage, cheveux avant, yeux, sourcils, bouche
//     .ch-eyes     yeux (clignement)
//     .ch-brows    sourcils
//     .ch-mouth    bouche
//     .ch-glasses  lunettes (Mory)
//   .ch-fx         effets devant (étincelles, goutte de sueur, « ! »…)
//
// Si une IMAGE est définie pour une expression (champ `images` du
// personnage), elle remplace le dessin SVG. Rien d'autre à modifier.
// =====================================================================

import { CHARACTERS } from '../data/characters.js';

let uid = 0; // identifiants uniques (plusieurs persos sur la même page)

// ---------------------------------------------------------------------
// Outils de couleur
// ---------------------------------------------------------------------

/** Éclaircit (amount > 0) ou assombrit (amount < 0) une couleur hexadécimale. */
export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount));
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Étoile à 4 branches (étincelle anime). */
function sparkle(x, y, r, fill, cls = 'fx-twinkle') {
  const k = r * 0.28;
  return `<path class="${cls}" d="M${x},${y - r} Q${x + k},${y - k} ${x + r},${y} Q${x + k},${y + k} ${x},${y + r} Q${x - k},${y + k} ${x - r},${y} Q${x - k},${y - k} ${x},${y - r}Z" fill="${fill}"/>`;
}


// ---------------------------------------------------------------------
// Réglages de chaque expression : yeux, sourcils, bouche, effets
// ---------------------------------------------------------------------
const EXPR = {
  neutre: { eyes: 'normal', brows: 'neutral', mouth: 'smile', fx: [] },
  joie: { eyes: 'happy', brows: 'raised', mouth: 'grin', fx: ['sparkles'], blush: true },
  reflexion: { eyes: 'up', brows: 'think', mouth: 'think', fx: ['dots'] },
  celebration: { eyes: 'stars', brows: 'raised', mouth: 'shout', fx: ['sparkles', 'speed', 'big'], blush: true },
  encouragement: { eyes: 'soft', brows: 'worried', mouth: 'soft', fx: ['sweat'], blush: true },
  surprise: { eyes: 'wide', brows: 'high', mouth: 'o', fx: ['bang'] },
  concentration: { eyes: 'focus', brows: 'furrow', mouth: 'flat', fx: ['speed', 'fire'] },
  clin: { eyes: 'wink', brows: 'smug', mouth: 'grin', fx: ['wink'], blush: true },
};

// Petites touches de personnalité : certaines expressions changent selon le perso.
const PERSONAL = {
  ren: { neutre: { mouth: 'smirk', brows: 'smug' }, joie: { mouth: 'smirk', eyes: 'normal', brows: 'smug' }, concentration: { eyes: 'blank', fx: ['speed', 'vein'] } },
  tidiane: { neutre: { eyes: 'chill', mouth: 'soft' }, encouragement: { eyes: 'chill' } },
  awa: { neutre: { brows: 'furrow' } },
  nia: { neutre: { mouth: 'soft' } },
};

// ---------------------------------------------------------------------
// EFFETS (sparkles, goutte, lignes de vitesse…)
// ---------------------------------------------------------------------
function effects(list, L) {
  const c = L.color;
  let back = '';
  let front = '';
  for (const fx of list) {
    if (fx === 'sparkles') front += sparkle(30, 60, 9, c) + sparkle(172, 48, 7, '#fff') + sparkle(168, 150, 8, c);
    if (fx === 'big') front += sparkle(22, 130, 11, '#fff') + sparkle(180, 100, 10, c);
    if (fx === 'speed') {
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        back += `<line x1="${(100 + 88 * Math.cos(a)).toFixed(1)}" y1="${(110 + 96 * Math.sin(a)).toFixed(1)}" x2="${(100 + 112 * Math.cos(a)).toFixed(1)}" y2="${(110 + 122 * Math.sin(a)).toFixed(1)}" stroke="${c}" stroke-width="2.4" stroke-linecap="round" opacity=".6" class="fx-speed"/>`;
      }
    }
    if (fx === 'sweat') front += `<path class="fx-drop" d="M152,70 C146,80 146,88 152,88 C158,88 158,80 152,70Z" fill="#8FD8FF" stroke="#4AA8E0" stroke-width="1.4"/>`;
    if (fx === 'dots') front += `<g class="fx-dots"><circle cx="150" cy="44" r="4" fill="${c}"/><circle cx="163" cy="34" r="5" fill="${c}"/><circle cx="178" cy="22" r="6.5" fill="${c}"/></g>`;
    if (fx === 'bang') {
      front += `<g class="fx-pop"><path d="M160,40 L166,68" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle cx="167.5" cy="77" r="3" fill="${c}"/>
        <path d="M40,58 L30,50 M44,48 L40,36 M34,70 L22,68" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g>`;
    }
    if (fx === 'fire') front += `<path class="fx-flame" d="M168,160 C160,146 172,138 168,126 C180,134 184,150 176,160 C174,154 170,154 168,160Z" fill="${c}" opacity=".85"/>`;
    if (fx === 'wink') front += sparkle(140, 92, 7, '#fff') + sparkle(150, 80, 4, c);
  }
  return { back, front };
}

// ---------------------------------------------------------------------
// AURA (évolue avec la série de jours : 0, 1 = 3 j, 2 = 7 j, 3 = 30 j)
// ---------------------------------------------------------------------
function aura(level, L, id) {
  if (!level) return '';
  const c = L.color;
  let s = `<defs><radialGradient id="au${id}"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset=".7" stop-color="${c}" stop-opacity=".15"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs>
    <circle class="fx-pulse" cx="100" cy="120" r="98" fill="url(#au${id})"/>`;
  if (level >= 2) s += `<circle class="fx-spin" cx="100" cy="120" r="92" fill="none" stroke="${c}" stroke-width="2.5" stroke-dasharray="6 12" opacity=".8"/>`;
  if (level >= 3) {
    s += `<circle class="fx-spin-rev" cx="100" cy="120" r="84" fill="none" stroke="#FFD23F" stroke-width="2" stroke-dasharray="2 10" opacity=".9"/>`;
    for (let i = 0; i < 6; i++) s += `<circle class="fx-rise" style="animation-delay:${i * 0.5}s" cx="${30 + i * 28}" cy="200" r="3" fill="${i % 2 ? '#FFD23F' : c}"/>`;
  }
  return s;
}

// =====================================================================
// DESSIN STYLE MANGA SHŌNEN (portraits en buste)
// ---------------------------------------------------------------------
// Proportions d'ados / jeunes adultes, mâchoire anguleuse, yeux en amande
// aux coins pointus, nez en un trait, encrage épais à l'extérieur et fin
// à l'intérieur, ombres "cel-shading" franches (lumière venant de la
// droite : les ombres sont à gauche). `look.face: 'soft'` = traits plus doux.
// =====================================================================
const INK = '#120b09'; // couleur de l'encre
const OUT = 2.8; // trait extérieur (épais)
const INN = 1.2; // trait intérieur (fin)

/** Mélange deux couleurs hexadécimales (t = 0 → a, t = 1 → b). */
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
}

/** Palette cel-shading d'un perso : 2-3 tons par couleur. */
function palette(L) {
  // Clarté de la peau (0 = noir, 1 = blanc) : sur une peau très foncée, on
  // adoucit l'ombre et on renforce la lumière pour garder les traits lisibles.
  const n = parseInt(L.skin.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  const dark = lum < 0.2;
  return {
    skin: L.skin, skinSh: shade(L.skin, dark ? -0.2 : -0.32), skinHi: shade(L.skin, dark ? 0.32 : 0.16),
    hair: L.hairColor, hairSh: shade(L.hairColor, -0.55), hairHi: shade(mix(L.hairColor, L.color, 0.45), 0.12),
    main: L.outfitColor, mainSh: shade(L.outfitColor, -0.35), mainHi: shade(L.outfitColor, 0.18),
    acc: L.outfitColor2,
  };
}

// Position des yeux (centre) et forme du visage en buste.
const MY = 103; // hauteur des yeux
const MX = { l: 87, r: 113 };
const FACE = 'M71,84 C71,68 83,56 100,56 C117,56 129,68 129,84 L130,102 C130,112 127,120 122,127 L109,144 Q100,151 91,144 L78,127 C73,120 70,112 70,102 Z';
const FACE_SOFT = 'M71,84 C71,68 83,56 100,56 C117,56 129,68 129,84 L130,101 C130,113 126,122 120,129 L108,142 Q100,148 92,142 L80,129 C74,122 70,113 70,101 Z';
const FACE_SHADOW = 'M70,102 C70,112 73,120 78,127 L91,144 Q95,147 99,148 L94,138 L83,124 C79,117 77,108 77,99 L76,86 Q72,90 70,102 Z';

/** Œil en amande (coin extérieur pointu). side = -1 (gauche) ou 1 (droite). */
function eye(cx, type, side, L, P, id) {
  const cy = MY;
  const outer = cx + 11.5 * side;
  const inner = cx - 8.5 * side;
  const lid = (y = 0, w = 3) => `<path d="M${inner},${cy + 1 + y} Q${cx},${cy - 9 + y} ${outer},${cy - 3.4 + y} L${outer + 4 * side},${cy - 5.2 + y}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${cx + 3 * side},${cy - 5.6 + y} Q${cx + 8 * side},${cy - 5.2 + y} ${outer + 4 * side},${cy - 5.2 + y}" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`;
  const lower = `<path d="M${cx + 3 * side},${cy + 4.2} Q${cx + 7 * side},${cy + 3.6} ${outer},${cy - 1.4}" fill="none" stroke="${INK}" stroke-width="${INN}" stroke-linecap="round"/>`;
  const crease = `<path d="M${cx - 3 * side},${cy - 8.6} Q${cx + 3 * side},${cy - 10} ${outer - 1 * side},${cy - 6.6}" fill="none" stroke="${INK}" stroke-width="1" opacity=".4"/>`;
  const almond = (top = -8, bot = 6.5) => `M${inner},${cy + 1} Q${cx},${cy + top} ${outer},${cy - 3} Q${cx + side},${cy + bot} ${inner},${cy + 1} Z`;
  const iris = (dx = 0, dy = 0, r = 5.4, shine = 1) => `
    <circle cx="${cx + dx}" cy="${cy + dy}" r="${r}" fill="${L.eyeColor}"/>
    <path d="M${cx + dx - r * 0.8},${cy + dy + r * 0.3} A${r * 0.85},${r * 0.85} 0 0 0 ${cx + dx + r * 0.8},${cy + dy + r * 0.3}" fill="none" stroke="${L.color}" stroke-width="${r * 0.35}" opacity=".6"/>
    <circle cx="${cx + dx}" cy="${cy + dy}" r="${r * 0.45}" fill="#0a0605"/>
    ${shine ? `<circle cx="${cx + dx + 1.5}" cy="${cy + dy - 1.8}" r="${1.5 * shine}" fill="#fff"/><circle cx="${cx + dx - 1.6}" cy="${cy + dy + 1.8}" r="${0.75 * shine}" fill="#fff" opacity=".9"/>` : ''}`;
  const withClip = (shape, content) => `<clipPath id="${id}"><path d="${shape}"/></clipPath>
    <path d="${shape}" fill="#fff"/><g clip-path="url(#${id})">${content}</g>`;

  // Cils marqués pour les visages doux
  const lashes = L.face === 'soft'
    ? `<path d="M${outer + 3 * side},${cy - 4.8} l${2.6 * side},-2.4 M${outer + 1 * side},${cy - 6} l${1.6 * side},-2.8" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`
    : '';
  if (type === 'happy' || (type === 'wink' && side > 0)) { // yeux fermés souriants (^ ^)
    return `<path d="M${inner},${cy + 1} Q${cx},${cy - 6} ${outer + 3 * side},${cy - 1}" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M${cx - 2 * side},${cy + 3.5} Q${cx + 3 * side},${cy + 4.5} ${cx + 7 * side},${cy + 2.6}" fill="none" stroke="${INK}" stroke-width="1" opacity=".6"/>`;
  }
  if (type === 'blank') { // yeux blancs de colère (manga)
    const s = `M${inner},${cy + 2} L${outer},${cy - 4} Q${cx + side},${cy + 6} ${inner},${cy + 2} Z`;
    return `<path d="${s}" fill="#fff"/>
      <path d="M${inner},${cy + 2} L${outer + 4 * side},${cy - 5}" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>${lower}`;
  }
  if (type === 'wide') { // choc : pupilles minuscules
    const s = almond(-9, 7.5);
    return `${withClip(s, iris(0, 0.5, 2.2, 0))}${lid(-1.5)}${lower}${crease}`;
  }
  if (type === 'focus' || type === 'chill') { // regard déterminé / paupières mi-closes
    const s = type === 'focus'
      ? `M${inner},${cy + 1.5} L${outer},${cy - 1.5} Q${cx + side},${cy + 5.5} ${inner},${cy + 1.5} Z`
      : `M${inner},${cy + 1} L${outer},${cy - 1} Q${cx + side},${cy + 5} ${inner},${cy + 1} Z`;
    const lidLine = type === 'focus'
      ? `<path d="M${inner - side},${cy + 2} L${outer + 4 * side},${cy - 3.5}" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`
      : `<path d="M${inner},${cy + 1} L${outer + 3 * side},${cy - 1.8}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    return `${withClip(s, iris(0, 1.8, 4.4, 0.8))}${lidLine}${lower}`;
  }
  let dx = 0; let dy = 0; let shine = 1; let extra = '';
  if (type === 'up') { dx = 1.2; dy = -2; }
  if (type === 'soft') { dy = 0.8; shine = 1.25; }
  if (type === 'shiny' || type === 'stars') { shine = 1.5; extra = sparkle(cx + dx - 1.5, cy - 1, 2.6, '#fff', ''); }
  return `${withClip(almond(), iris(dx, dy, 5.4, shine) + extra)}${lid()}${lower}${crease}${lashes}`;
}

/** Sourcils épais, effilés vers l'extérieur. */
function brows(type, P, soft = false) {
  // [yIntérieur, yExtérieur] pour chaque sourcil (gauche, droite)
  const T = {
    neutral: [[92, 90], [92, 90]], raised: [[88, 86], [88, 86]], high: [[85, 84], [85, 84]],
    furrow: [[96.5, 88], [96.5, 88]], worried: [[88, 93], [88, 93]], think: [[92, 90], [87, 84.5]],
    smug: [[93, 91], [88, 83.5]],
  }[type] || [[92, 90], [92, 90]];
  return [[-1, T[0]], [1, T[1]]].map(([side, [iy, oy]]) => {
    const ix = 100 + 6 * side;
    const ox = 100 + 26 * side;
    const mx = (ix + ox) / 2;
    const t = soft ? 2.2 : 3.4; // épaisseur (plus fin pour les visages doux)
    return `<path d="M${ix},${iy + t} L${ix},${iy - 0.6} Q${mx},${Math.min(iy, oy) - 3} ${ox},${oy} Q${mx},${Math.min(iy, oy) + 0.8} ${ix},${iy + t} Z" fill="${P.hair}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`;
  }).join('');
}

/** Bouches manga (très expressives). */
function mouth(type, P) {
  const dark = '#2a0c0c';
  const lip = `<path d="M97,135.5 L103,135.5" stroke="${P.skinSh}" stroke-width="1.3" stroke-linecap="round"/>`;
  switch (type) {
    case 'grin':
      return `<path d="M92,129 Q100,140 108,129 Z" fill="${dark}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M93.4,129.6 L106.6,129.6 L105.4,132.4 L94.6,132.4 Z" fill="#fff"/>
        <ellipse cx="100" cy="135.6" rx="3.6" ry="1.6" fill="#d9566a"/>`;
    case 'shout':
      return `<path d="M89,125 L111,125 L106.5,141 Q100,145 93.5,141 Z" fill="${dark}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M90.2,125.8 L109.8,125.8 L109,128.8 L91,128.8 Z" fill="#fff"/>
        <ellipse cx="100" cy="139" rx="5" ry="2.4" fill="#d9566a"/>`;
    case 'o':
      return `<ellipse cx="100" cy="133" rx="3.2" ry="4.2" fill="${dark}" stroke="${INK}" stroke-width="1.4"/>`;
    case 'flat':
      return `<path d="M94.5,132 L105.5,131.2" stroke="${INK}" stroke-width="1.9" stroke-linecap="round"/>${lip}`;
    case 'smirk':
      return `<path d="M94,132.6 Q101,133.6 107,128.4" fill="none" stroke="${INK}" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M106.6,128.4 l1.8,-1.2" stroke="${INK}" stroke-width="1.1" stroke-linecap="round"/>${lip}`;
    case 'soft':
      return `<path d="M95,131 Q100,133.4 105,131" fill="none" stroke="${INK}" stroke-width="1.7" stroke-linecap="round"/>${lip}`;
    case 'think':
      return `<path d="M96,133 L103.5,132" stroke="${INK}" stroke-width="1.7" stroke-linecap="round"/>${lip}`;
    default: // smile
      return `<path d="M94,130.6 Q100,134.8 106,130" fill="none" stroke="${INK}" stroke-width="1.9" stroke-linecap="round"/>${lip}`;
  }
}

/**
 * Tresse / box braid manga : corde encrée avec motif en chevrons,
 * ombre à gauche, reflet à droite, perle au bout (couleur du perso).
 */
function mBraid(x0, y0, qx, qy, x1, y1, w, P, L, bead = true) {
  const d = `M${x0},${y0} Q${qx},${qy} ${x1},${y1}`;
  let marks = '';
  const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / 7));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * qx + t * t * x1;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * qy + t * t * y1;
    const dx = 2 * (1 - t) * (qx - x0) + 2 * t * (x1 - qx);
    const dy = 2 * (1 - t) * (qy - y0) + 2 * t * (y1 - qy);
    const len = Math.hypot(dx, dy) || 1;
    const tx = dx / len; const ty = dy / len;
    const nx = -ty; const ny = tx;
    const h = w / 2 - 0.6;
    marks += `<path d="M${(x - nx * h).toFixed(1)},${(y - ny * h).toFixed(1)} L${(x + tx * 3).toFixed(1)},${(y + ty * 3).toFixed(1)} L${(x + nx * h).toFixed(1)},${(y + ny * h).toFixed(1)}" fill="none" stroke="${P.hairSh}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M${(x + nx * h * 0.2 + tx * 2.4).toFixed(1)},${(y + ny * h * 0.2 + ty * 2.4).toFixed(1)} L${(x + nx * h * 0.8 + tx * 0.5).toFixed(1)},${(y + ny * h * 0.8 + ty * 0.5).toFixed(1)}" stroke="${P.hairHi}" stroke-width="1.2" stroke-linecap="round"/>`;
  }
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 3}" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="${P.hair}" stroke-width="${w}" stroke-linecap="round"/>${marks}
    ${bead ? `<circle cx="${x1}" cy="${y1 + w / 2 + 2}" r="${w / 2 + 0.6}" fill="${L.color}" stroke="${INK}" stroke-width="1.4"/>` : ''}`;
}

/** Contour festonné d'une masse ronde de cheveux bouclés (puff, chignon…). */
function lobes(cx, cy, r, n = 11, bump = 6) {
  let d = '';
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * Math.PI * 2;
    const x = (cx + r * Math.cos(a)).toFixed(1);
    const y = (cy + r * Math.sin(a)).toFixed(1);
    if (k === 0) { d = `M${x},${y}`; continue; }
    const m = a - Math.PI / n;
    d += ` Q${(cx + (r + bump) * Math.cos(m)).toFixed(1)},${(cy + (r + bump) * Math.sin(m)).toFixed(1)} ${x},${y}`;
  }
  return `${d} Z`;
}

/** Une lock (dreadlock) manga : corde épaisse encrée, segments et reflet. */
function mLoc(x0, y0, qx, qy, x1, y1, w, P) {
  const d = `M${x0},${y0} Q${qx},${qy} ${x1},${y1}`;
  let ticks = '';
  const n = Math.max(3, Math.round(Math.hypot(x1 - x0, y1 - y0) / 8));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * qx + t * t * x1;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * qy + t * t * y1;
    const dx = 2 * (1 - t) * (qx - x0) + 2 * t * (x1 - qx);
    const dy = 2 * (1 - t) * (qy - y0) + 2 * t * (y1 - qy);
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len; const ny = dx / len;
    const h = w / 2 - 0.8;
    ticks += `<path d="M${(x - nx * h).toFixed(1)},${(y - ny * h).toFixed(1)} Q${(x + dx / len * 1.5).toFixed(1)},${(y + dy / len * 1.5).toFixed(1)} ${(x + nx * h).toFixed(1)},${(y + ny * h).toFixed(1)}" fill="none" stroke="${P.hairSh}" stroke-width="1.2"/>`;
  }
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 3}" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="${P.hair}" stroke-width="${w}" stroke-linecap="round"/>${ticks}
    <path d="M${x0 + 1.8},${y0 + 2} Q${qx + 1.8},${qy} ${x1 + 1.4},${y1 - 3}" fill="none" stroke="${P.hairHi}" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`;
}

/** Cheveux style manga : { back, front }. */
function hair(L, P) {
  const o = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"`;
  switch (L.hair) {
    case 'hightop': { // Kaï : high-top de twists, côtés dégradés, contour net
      let top = '';
      for (let i = 0; i < 7; i++) {
        const x0 = 72 + i * 8;
        top += ` Q${x0 + 4},${27 + (i % 2) * 2.5} ${x0 + 8},${36}`;
      }
      const block = `M73,80 L71,60 L72,37${top} L129,60 L127,80 Q114,72 100,72 Q86,72 73,80 Z`;
      let twists = '';
      for (let i = 0; i < 7; i++) {
        const x = 72 + i * 8;
        // séparation entre twists
        if (i > 0) twists += `<path d="M${x},37 L${x},73" stroke="${INK}" stroke-width="1.1" opacity=".8"/>`;
        // torsade : petits reflets en zigzag (plus clairs du côté éclairé, à droite)
        if (i >= 2) {
          let z = `M${x + 2.5},39`;
          for (let y = 39; y < 70; y += 5) z += ` L${x + 5.5},${y + 2.5} L${x + 2.5},${y + 5}`;
          twists += `<path d="${z}" fill="none" stroke="${P.hairHi}" stroke-width="1.5" stroke-linejoin="round" opacity="${0.5 + i * 0.07}"/>`;
        }
      }
      return {
        back: '',
        front: `
          <path d="M70,98 L69,78 Q70,70 74,66 L76,84 Q72,88 70,98 Z" fill="${P.hair}" opacity=".55"/>
          <path d="M130,98 L131,78 Q130,70 126,66 L124,84 Q128,88 130,98 Z" fill="${P.hair}" opacity=".45"/>
          <path d="${block}" fill="${P.hair}"/>
          <path d="M73,80 L71,60 L72,37 Q76,27 80,36 L81,74 Q77,76 73,80 Z" fill="${P.hairSh}"/>
          ${twists}
          <path d="${block}" fill="none" ${o}/>`,
      };
    }
    case 'afro': { // Mory : afro volumineux, grosses masses découpées
      const cx = 100; const cy = 72; const R = 50;
      const pt = (a, r) => [cx + r * Math.cos(a), cy + r * Math.sin(a)].map((v) => v.toFixed(1));
      let d = '';
      const N = 13;
      const a0 = Math.PI * 0.86; const a1 = Math.PI * 2.14; // du bas-gauche au bas-droite en passant par le haut
      for (let k = 0; k <= N; k++) {
        const a = a0 + ((a1 - a0) * k) / N;
        const [x, y] = pt(a, R);
        if (k === 0) { d = `M${x},${y}`; continue; }
        const [qx, qy] = pt(a - (a1 - a0) / N / 2, R + 10);
        d += ` Q${qx},${qy} ${x},${y}`;
      }
      d += ' L126,122 L74,122 Z';
      let shine = '';
      for (const [x, y, r] of [[118, 30, 7], [132, 44, 6], [106, 26, 6], [140, 62, 5]]) {
        shine += `<path d="M${x - r},${y} Q${x},${y - r * 1.1} ${x + r},${y} Q${x},${y - r * 0.4} ${x - r},${y} Z" fill="${P.hairHi}"/>`;
      }
      const fringe = 'M69,98 L68,76 Q72,56 88,52 Q100,49 112,52 Q128,56 132,76 L131,98 L127,88 Q126,80 121,79 q-3,-5 -7,-2 q-3,-5 -7,-1 q-3,-5 -7,-1 q-3,-5 -7,0 q-3,-5 -7,-1 q-3,-5 -7,2 Q74,80 73,88 Z';
      return {
        back: `<path d="${d}" fill="${P.hair}"/>
          <path d="M54,112 Q44,86 56,58 Q58,40 72,30 Q62,60 70,88 Q72,102 78,114 Z" fill="${P.hairSh}"/>
          ${shine}
          <path d="${d}" fill="none" ${o}/>`,
        front: `<path d="${fringe}" fill="${P.hair}"/>
          <path d="M69,98 L68,76 Q70,64 78,58 Q76,72 78,82 L73,88 Z" fill="${P.hairSh}"/>
          <path d="M104,58 q5,-3 9,1 M116,62 q5,-3 9,2" fill="none" stroke="${P.hairHi}" stroke-width="1.8" stroke-linecap="round"/>
          <path d="${fringe}" fill="none" ${o}/>`,
      };
    }
    case 'braids': { // Nia : longues box braids, raie au milieu
      const cap = 'M68,100 L68,74 Q72,54 94,50 L100,54 L106,50 Q128,54 132,74 L132,100 Q128,84 120,76 Q110,68 100,60 Q90,68 80,76 Q72,84 68,100 Z';
      return {
        back: [
          mBraid(72, 80, 58, 140, 52, 206, 8, P, L), mBraid(78, 74, 66, 140, 64, 214, 8, P, L),
          mBraid(86, 68, 78, 140, 76, 208, 7, P, L, false),
          mBraid(128, 80, 142, 140, 148, 206, 8, P, L), mBraid(122, 74, 134, 140, 136, 214, 8, P, L),
          mBraid(114, 68, 122, 140, 124, 208, 7, P, L, false),
        ].join(''),
        front: `<path d="${cap}" fill="${P.hair}"/>
          <path d="M68,100 L68,74 Q72,56 90,51 Q78,64 78,80 Q72,86 68,100 Z" fill="${P.hairSh}"/>
          <path d="M100,60 Q88,66 79,79 M100,60 Q112,66 121,79 M97,53 Q82,56 73,70 M103,53 Q118,56 127,70" fill="none" stroke="${P.hairSh}" stroke-width="1.6"/>
          <path d="M108,56 Q118,60 124,68 M106,62 Q114,66 118,72" fill="none" stroke="${P.hairHi}" stroke-width="1.6" stroke-linecap="round"/>
          <path d="${cap}" fill="none" ${o}/>
          ${mBraid(69, 94, 62, 140, 60, 186, 8, P, L)}${mBraid(131, 94, 138, 140, 140, 186, 8, P, L)}`,
      };
    }
    case 'puffs': { // Sora : deux gros puffs + frange en pointes
      const puff = (cx, cy) => {
        const d = lobes(cx, cy, 21, 10, 6);
        return `<path d="${d}" fill="${P.hair}"/>
          <path d="M${cx - 22},${cy + 4} Q${cx - 18},${cy + 20} ${cx + 2},${cy + 24} Q${cx - 12},${cy + 12} ${cx - 14},${cy - 6} Z" fill="${P.hairSh}"/>
          <path d="M${cx + 2},${cy - 16} Q${cx + 12},${cy - 16} ${cx + 16},${cy - 6} Q${cx + 10},${cy - 12} ${cx + 2},${cy - 16} Z" fill="${P.hairHi}"/>
          <path d="M${cx - 6},${cy - 4} q4,-4 8,0 M${cx + 6},${cy + 8} q4,-4 8,0" fill="none" stroke="${P.hairHi}" stroke-width="1.4" stroke-linecap="round"/>
          <path d="${d}" fill="none" ${o}/>`;
      };
      const cap = 'M68,98 L68,74 Q72,56 100,53 Q128,56 132,74 L132,98 L128,84 L124,90 L120,76 L112,85 L107,71 L100,83 L94,70 L87,82 L82,73 L76,88 L72,81 Z';
      return {
        back: `${puff(64, 40)}${puff(136, 40)}
          <path d="M72,54 L80,62 M128,54 L120,62" stroke="${INK}" stroke-width="7.4" stroke-linecap="round"/>
          <path d="M72,54 L80,62 M128,54 L120,62" stroke="${L.color}" stroke-width="4.6" stroke-linecap="round"/>`,
        front: `<path d="${cap}" fill="${P.hair}"/>
          <path d="M68,98 L68,74 Q72,58 88,54 Q80,64 82,73 L76,88 L72,81 Z" fill="${P.hairSh}"/>
          <path d="M104,57 Q116,58 124,66" fill="none" stroke="${P.hairHi}" stroke-width="2" stroke-linecap="round"/>
          <path d="M70,96 q-4,3 -1,7 q3,2 4,-1 M130,96 q4,3 1,7 q-3,2 -4,-1" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>
          <path d="${cap}" fill="none" ${o}/>`,
      };
    }
    case 'locks': { // Ren : locks épaisses, mèches en travers du front
      const cap = 'M68,92 L68,72 Q72,50 100,47 Q128,50 132,72 L132,92 Q126,76 112,71 L88,71 Q74,76 68,92 Z';
      return {
        back: [
          mLoc(74, 70, 62, 118, 60, 166, 9, P), mLoc(82, 62, 76, 120, 72, 172, 9, P),
          mLoc(118, 62, 126, 120, 128, 172, 9, P), mLoc(126, 70, 140, 118, 142, 166, 9, P),
        ].join(''),
        front: `<path d="${cap}" fill="${P.hair}"/>
          <path d="M68,92 L68,72 Q72,52 90,48 Q80,62 80,74 Q72,80 68,92 Z" fill="${P.hairSh}"/>
          <path d="${cap}" fill="none" ${o}/>
          ${mLoc(124, 58, 136, 80, 135, 114, 8.5, P)}${mLoc(130, 66, 140, 92, 139, 124, 8, P)}
          ${mLoc(96, 51, 78, 62, 70, 96, 9, P)}${mLoc(106, 51, 88, 60, 79, 88, 9, P)}${mLoc(116, 53, 102, 60, 94, 82, 8.5, P)}`,
      };
    }
    case 'bun': { // Awa : chignon haut de twists noué d'un foulard, cheveux plaqués
      const bun = lobes(100, 30, 17, 9, 5);
      const cap = 'M68,96 L68,74 Q72,54 100,50 Q128,54 132,74 L132,96 Q128,82 118,76 Q100,70 82,76 Q72,82 68,96 Z';
      return {
        back: `<path d="${bun}" fill="${P.hair}"/>
          <path d="M84,32 Q86,46 100,48 Q88,40 90,24 Z" fill="${P.hairSh}"/>
          <path d="M92,24 Q100,18 108,24 M96,34 Q104,28 112,34 M88,34 Q94,40 100,38" fill="none" stroke="${P.hairHi}" stroke-width="1.5" stroke-linecap="round"/>
          <path d="${bun}" fill="none" ${o}/>
          <path d="M86,46 Q100,52 114,46 L113,52 Q100,58 87,52 Z" fill="${P.acc}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M112,50 L124,44 L121,54 Z M112,51 L122,60 L114,58 Z" fill="${P.acc}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`,
        front: `<path d="${cap}" fill="${P.hair}"/>
          <path d="M68,96 L68,74 Q72,56 90,51 Q78,64 80,76 Q72,82 68,96 Z" fill="${P.hairSh}"/>
          <path d="M80,76 Q86,60 100,51 M92,72 Q95,60 100,51 M108,72 Q105,60 100,51 M120,76 Q114,60 100,51" fill="none" stroke="${P.hairSh}" stroke-width="1.4"/>
          <path d="M112,58 Q118,62 124,72" fill="none" stroke="${P.hairHi}" stroke-width="1.8" stroke-linecap="round"/>
          <path d="${cap}" fill="none" ${o}/>`,
      };
    }
    case 'waves': { // Tidiane : coupe courte à waves, contour net
      const cap = 'M69,94 L68,74 Q72,55 100,53 Q128,55 132,74 L131,94 L127,82 L124,78 Q100,73 76,78 L73,82 Z';
      const clip = `wv${++uid}`;
      let waves = '';
      for (let r = 10; r <= 42; r += 8) {
        waves += `<path d="M${100 - r},${56 + r * 0.45} Q${100 - r / 2},${50 + r * 0.1} 100,${52 + r * 0.25} Q${100 + r / 2},${50 + r * 0.1} ${100 + r},${56 + r * 0.45}" fill="none" stroke="${P.hairHi}" stroke-width="1.5" opacity=".75"/>`;
      }
      return {
        back: '',
        front: `<path d="${cap}" fill="${P.hair}"/>
          <path d="M69,94 L68,74 Q72,57 88,54 Q80,64 80,77 L76,78 L73,82 Z" fill="${P.hairSh}"/>
          <clipPath id="${clip}"><path d="${cap}"/></clipPath><g clip-path="url(#${clip})">${waves}</g>
          <path d="${cap}" fill="none" ${o}/>`,
      };
    }
    case 'ponytail': { // Binta : queue-de-cheval haute, mèches en pointes
      const tail = 'M108,46 Q138,26 158,44 L152,48 Q170,64 166,96 L158,84 L160,114 L150,94 L146,122 L140,98 L134,116 Q134,86 124,66 Q118,56 110,54 Z';
      const cap = 'M68,100 L68,72 Q74,52 100,50 Q126,52 132,72 L132,100 L126,82 L124,96 L118,78 Q104,70 90,74 L84,90 L80,78 L74,94 Z';
      return {
        back: `<path d="${tail}" fill="${P.hair}"/>
          <path d="M124,66 Q134,86 134,116 L140,98 Q142,80 136,66 Q130,58 124,56 Z" fill="${P.hairSh}"/>
          <path d="M126,38 Q146,34 156,48 M140,52 Q156,62 160,86" fill="none" stroke="${P.hairHi}" stroke-width="2" stroke-linecap="round"/>
          <path d="${tail}" fill="none" ${o}/>`,
        front: `<path d="${cap}" fill="${P.hair}"/>
          <path d="M68,100 L68,72 Q72,56 88,52 Q78,64 80,78 L74,94 Z" fill="${P.hairSh}"/>
          <path d="M104,55 Q116,57 124,66" fill="none" stroke="${P.hairHi}" stroke-width="2" stroke-linecap="round"/>
          <path d="${cap}" fill="none" ${o}/>
          <circle cx="112" cy="50" r="5.5" fill="${L.color}" stroke="${INK}" stroke-width="1.8"/>`,
      };
    }
    default:
      return { back: '', front: '' };
  }
}

/** Buste et tenue style manga (cel-shading + plis). */
function outfit(L, P) {
  const torso = 'M14,232 L20,200 C26,184 56,174 84,168 L116,168 C144,174 174,184 180,200 L186,232 Z';
  const shadowL = `<path d="M14,232 L20,200 C26,186 48,177 66,172 L60,196 L54,232 Z" fill="${P.mainSh}"/>`;
  const folds = `<path d="M60,200 L66,232 M142,196 Q148,214 146,232 M122,206 Q126,220 124,232" fill="none" stroke="${INK}" stroke-width="${INN}" opacity=".55"/>`;
  const base = `<path d="${torso}" fill="${P.main}"/>${shadowL}${folds}`;
  const outline = `<path d="${torso}" fill="none" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>`;
  switch (L.outfit) {
    case 'hoodie':
      return `${base}
        <path d="M72,176 C68,160 132,160 128,176 C122,187 78,187 72,176 Z" fill="${shade(P.main, -0.15)}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M72,176 C70,168 80,163 88,162 C80,168 78,176 80,184 C76,182 73,179 72,176 Z" fill="${P.mainSh}"/>
        <path d="M86,170 Q100,180 114,170 Q100,175 86,170 Z" fill="${shade(P.main, -0.6)}"/>
        <path d="M92,183 L90,207 M108,183 L110,207" stroke="${P.acc}" stroke-width="2.4" stroke-linecap="round"/>
        <rect x="88.4" y="205" width="3.4" height="6" rx="1" fill="${INK}"/><rect x="108.4" y="205" width="3.4" height="6" rx="1" fill="${INK}"/>
        ${sparkle(136, 212, 7, P.acc, '')}
        ${outline}`;
    case 'jacket': // Mory : veste tech à col montant, liserés lumineux
      return `${base}
        <path d="M100,184 L95,232 L105,232 Z" fill="${shade(P.acc, -0.65)}"/>
        <path d="M86,168 L100,196 L114,168 Z" fill="${shade(P.acc, -0.65)}"/>
        <path d="M86,168 L79,149 L90,153 L100,184 Z" fill="${P.main}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M86,168 L79,149 L84,151 L94,176 Z" fill="${P.mainSh}"/>
        <path d="M114,168 L121,149 L110,153 L100,184 Z" fill="${P.main}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M100,184 L95,232 M100,184 L105,232" stroke="${INK}" stroke-width="1.6"/>
        <path d="M34,194 Q58,180 82,172 M166,194 Q142,180 118,172" fill="none" stroke="${P.acc}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M121,149 L110,153" stroke="${P.acc}" stroke-width="1.6"/>
        <rect x="128" y="204" width="20" height="14" rx="2" fill="${P.mainSh}" stroke="${INK}" stroke-width="1.2"/>
        <rect x="131" y="202" width="6" height="4" rx="1" fill="${P.acc}"/>
        ${outline}`;
    case 'cardigan': // Nia : cardigan ouvert sur un t-shirt
      return `${base}
        <path d="M84,168 Q100,190 116,168 L120,232 L80,232 Z" fill="${P.acc}"/>
        <path d="M84,168 Q90,180 96,185 L90,232 L80,232 Z" fill="${shade(P.acc, -0.3)}"/>
        <path d="M84,168 Q100,190 116,168" fill="none" stroke="${INK}" stroke-width="1.6"/>
        <path d="M84,168 L88,200 L80,232 M116,168 L112,200 L120,232" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M86,172 L90,200 M114,172 L110,200" stroke="${P.mainHi}" stroke-width="1.4" opacity=".7"/>
        <circle cx="85" cy="208" r="2.4" fill="${P.acc}" stroke="${INK}" stroke-width="1.1"/><circle cx="83" cy="222" r="2.4" fill="${P.acc}" stroke="${INK}" stroke-width="1.1"/>
        ${outline}`;
    case 'bomber': // Ren : bomber à col côtelé
      return `${base}
        <path d="M80,170 Q100,184 120,170 L121,178 Q100,193 79,178 Z" fill="${P.acc}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M81,174 Q100,188 119,174 M80.5,176.5 Q100,191 119.5,176.5" fill="none" stroke="${shade(P.acc, -0.45)}" stroke-width="1.2"/>
        <path d="M100,187 L100,232" stroke="${INK}" stroke-width="2"/>
        <path d="M100,187 L100,232" stroke="#c9c9d4" stroke-width="1" stroke-dasharray="2 2"/>
        <path d="M46,184 Q60,196 58,232 M154,184 Q140,196 142,232" fill="none" stroke="${INK}" stroke-width="${INN}" opacity=".7"/>
        <path d="M20,214 L58,214 M142,214 L180,214" stroke="${P.acc}" stroke-width="3" opacity=".8"/>
        ${outline}`;
    case 'track': // Awa : veste de survêtement, col montant zippé
      return `${base}
        <path d="M34,194 Q58,178 84,170 M166,194 Q142,178 116,170" fill="none" stroke="${INK}" stroke-width="6.4" stroke-linecap="round"/>
        <path d="M34,194 Q58,178 84,170 M166,194 Q142,178 116,170" fill="none" stroke="${P.acc}" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M83,156 L117,156 L119,180 L81,180 Z" fill="${P.main}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M83,156 L100,156 L100,180 L81,180 Z" fill="${P.mainSh}"/>
        <path d="M100,156 L100,232" stroke="${INK}" stroke-width="2"/>
        <rect x="97.6" y="176" width="4.8" height="9" rx="1.4" fill="#d9d9e3" stroke="${INK}" stroke-width="1"/>
        ${outline}`;
    default:
      return `${base}${outline}`;
  }
}

/** Accessoires style manga : { body, head, glasses }. */
function accessories(L, P) {
  const acc = new Set(L.accessories || []);
  let body = '';
  let head = '';
  let glasses = '';
  if (acc.has('beard')) { // barbe courte le long de la mâchoire + moustache
    head += `<path d="M71,108 C71,114 74,121 78,127 L91,144 Q100,151 109,144 L122,127 C126,121 129,114 129,108 L126,111 C125,117 122,122 118,127 L107,139 Q100,144 93,139 L82,127 C78,122 75,117 74,111 Z" fill="${P.hair}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M92,126 Q100,121.5 108,126 Q100,124.6 92,126 Z" fill="${P.hair}" stroke="${INK}" stroke-width="1"/>
      <path d="M110,138 L118,128" stroke="${P.hairHi}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>`;
  }
  if (acc.has('earbuds')) { // écouteurs sans fil
    head += `<path d="M64,104 q-3,1 -3,5 l1,6" fill="none" stroke="${INK}" stroke-width="4.6" stroke-linecap="round"/>
      <path d="M64,104 q-3,1 -3,5 l1,6" fill="none" stroke="#f4f4f8" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M136,104 q3,1 3,5 l-1,6" fill="none" stroke="${INK}" stroke-width="4.6" stroke-linecap="round"/>
      <path d="M136,104 q3,1 3,5 l-1,6" fill="none" stroke="#f4f4f8" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  if (acc.has('hoops')) { // Binta : grandes créoles dorées
    head += `<circle cx="65" cy="124" r="7" fill="none" stroke="${INK}" stroke-width="3.6"/><circle cx="65" cy="124" r="7" fill="none" stroke="#FFD23F" stroke-width="2"/>
      <circle cx="135" cy="124" r="7" fill="none" stroke="${INK}" stroke-width="3.6"/><circle cx="135" cy="124" r="7" fill="none" stroke="#FFD23F" stroke-width="2"/>`;
  }
  if (acc.has('clips')) {
    head += `${sparkle(74, 64, 6.5, L.color, '')}${sparkle(126, 64, 6.5, L.color, '')}
      <path d="M74,57.5 L75.8,64 L74,70.5 L72.2,64 Z" fill="none" stroke="${INK}" stroke-width=".8"/>`;
  }
  if (acc.has('earrings')) {
    head += `<circle cx="66" cy="118" r="3.4" fill="none" stroke="#FFD23F" stroke-width="2"/><circle cx="134" cy="118" r="3.4" fill="none" stroke="#FFD23F" stroke-width="2"/>
      <circle cx="66" cy="121.4" r="1.4" fill="#FFD23F"/><circle cx="134" cy="121.4" r="1.4" fill="#FFD23F"/>`;
  }
  if (acc.has('visor')) { // Mory : lunettes tech rectangulaires
    const lens = (side) => {
      const x1 = side < 0 ? 73 : 103; const x2 = side < 0 ? 97 : 127;
      return `<path d="M${x1},95 L${x2},95 L${x2 - 1},109 Q${(x1 + x2) / 2},112 ${x1 + 1},109 Z" fill="${L.color}" fill-opacity=".2" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M${x1},95 L${x2},95" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M${x1 + 4},107 L${x1 + 11},97" stroke="#fff" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>`;
    };
    glasses = `<g class="ch-glasses">${lens(-1)}${lens(1)}
      <path d="M97,99 Q100,97 103,99" fill="none" stroke="${INK}" stroke-width="2"/>
      <path d="M73,98 L66,99 M127,98 L134,99" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="124" cy="97.6" r="1.3" fill="${L.color}" class="fx-blink"/></g>`;
  }
  if (acc.has('whistle')) { // Awa : sifflet de coach
    body += `<path d="M88,178 L108,203 M112,178 L111,203" fill="none" stroke="${L.color}" stroke-width="1.6"/>
      <rect x="103" y="201" width="15" height="9" rx="4" fill="#d9d9e3" stroke="${INK}" stroke-width="1.6"/>
      <rect x="116" y="203" width="6" height="4" rx="1" fill="#b9b9c6" stroke="${INK}" stroke-width="1.2"/>
      <circle cx="108" cy="205.5" r="1.6" fill="${INK}"/>`;
  }
  if (acc.has('chain')) { // Ren : chaîne argentée
    body += `<path d="M84,184 Q100,212 116,184" fill="none" stroke="${INK}" stroke-width="3.6"/>
      <path d="M84,184 Q100,212 116,184" fill="none" stroke="#dcdce6" stroke-width="2" stroke-dasharray="3 1.6"/>`;
  }
  if (acc.has('headphones')) {
    body += `<path d="M78,170 C80,187 120,187 122,170" fill="none" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M78,170 C80,187 120,187 122,170" fill="none" stroke="#2b2a33" stroke-width="3.6" stroke-linecap="round"/>
      <rect x="66" y="163" width="15" height="21" rx="6" fill="#1d1c24" stroke="${INK}" stroke-width="2"/>
      <rect x="119" y="163" width="15" height="21" rx="6" fill="#1d1c24" stroke="${INK}" stroke-width="2"/>
      <rect x="70" y="167" width="7" height="13" rx="3" fill="${L.color}"/><rect x="123" y="167" width="7" height="13" rx="3" fill="${L.color}"/>
      <path d="M72,168 L72,176" stroke="#fff" stroke-width="1.2" opacity=".6"/>`;
  }
  return { body, head, glasses };
}

// Positions de la goutte de sueur et de la veine de colère (près de la tempe droite).
const MANGA_FX = { sweat: [134, 78], vein: [124, 70] };

/**
 * Construit le SVG complet d'un personnage (style manga shōnen, en buste).
 * @param {string} id         identifiant du perso (kai, mory…)
 * @param {string} expression neutre | joie | reflexion | celebration | encouragement | surprise | concentration | clin
 * @param {object} [opts]     { aura: 0..3 }
 */
export function characterSVG(id, expression = 'neutre', opts = {}) {
  const ch = CHARACTERS[id];
  const L = { ...ch.look, color: ch.color };
  const P = palette(L);
  const e = { ...(EXPR[expression] || EXPR.neutre), ...(PERSONAL[id]?.[expression] || {}) };
  const n = ++uid;
  const hr = hair(L, P);
  const acc = accessories(L, P);
  const fxList = [...(e.fx || [])];
  const fx = effects(fxList.filter((f) => f !== 'sweat' && f !== 'vein'), L);
  let fxFront = fx.front;
  if (fxList.includes('sweat')) { // goutte de sueur manga
    const [x, y] = MANGA_FX.sweat;
    fxFront += `<path class="fx-drop" d="M${x},${y} C${x - 6},${y + 10} ${x - 6},${y + 17} ${x},${y + 17} C${x + 6},${y + 17} ${x + 6},${y + 10} ${x},${y}Z" fill="#9fdcff" stroke="${INK}" stroke-width="1.4"/>
      <path d="M${x - 2},${y + 9} Q${x - 2.5},${y + 13} ${x},${y + 14.5}" fill="none" stroke="#fff" stroke-width="1.4"/>`;
  }
  if (fxList.includes('vein')) { // veine de colère
    const [x, y] = MANGA_FX.vein;
    fxFront += `<g class="fx-pop" stroke="#e8244a" stroke-width="2.4" fill="none" stroke-linecap="round">
      <path d="M${x - 5},${y - 1} Q${x - 1},${y - 1} ${x - 1},${y - 5}"/><path d="M${x + 5},${y - 1} Q${x + 1},${y - 1} ${x + 1},${y - 5}"/>
      <path d="M${x - 5},${y + 1} Q${x - 1},${y + 1} ${x - 1},${y + 5}"/><path d="M${x + 5},${y + 1} Q${x + 1},${y + 1} ${x + 1},${y + 5}"/></g>`;
  }
  // Rougeurs hachurées (manga)
  const blush = e.blush
    ? `<g stroke="#ff6b8a" stroke-width="1.3" stroke-linecap="round" opacity=".85">
        <path d="M78,117 l3,-4 M82,118 l3,-4 M86,119 l3,-4"/><path d="M112,119 l3,-4 M116,118 l3,-4 M120,117 l3,-4"/></g>`
    : '';
  const face = L.face === 'soft' ? FACE_SOFT : FACE;
  const earL = 'M72,96 C65,93 62,101 64,108 C65,114 68,117 72,116 Z';
  const earR = 'M128,96 C135,93 138,101 136,108 C135,114 132,117 128,116 Z';
  return `<svg viewBox="0 0 200 232" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="ch-svg ch-manga">
    <g class="ch-aura">${aura(opts.aura || 0, L, n)}</g>
    <g class="ch-fx-back">${fx.back}</g>
    <g class="ch-hair-back">${hr.back}</g>
    <g class="ch-body">
      <path d="M89,128 L111,128 L113,172 L87,172 Z" fill="${P.skin}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
      <path d="M88,134 L112,134 L112,152 Q100,160 88,150 Z" fill="${P.skinSh}"/>
      ${outfit(L, P)}
      ${acc.body}
    </g>
    <g class="ch-head">
      <path d="${earL}" fill="${P.skinSh}" stroke="${INK}" stroke-width="2"/><path d="M70,100 Q66,104 69,111" fill="none" stroke="${INK}" stroke-width="${INN}"/>
      <path d="${earR}" fill="${P.skin}" stroke="${INK}" stroke-width="2"/><path d="M130,100 Q134,104 131,111" fill="none" stroke="${INK}" stroke-width="${INN}"/>
      <path d="${face}" fill="${P.skin}"/>
      <path d="${FACE_SHADOW}" fill="${P.skinSh}"/>
      <path d="M72,84 Q100,74 128,84 L128,91 Q100,82 72,91 Z" fill="${P.skinSh}"/>
      <path d="M112,112 Q118,110 123,113" fill="none" stroke="${P.skinHi}" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <path d="M127.4,98 L127.8,104 C127.6,112 124.6,120 119.6,126 L108,140" fill="none" stroke="${P.skinHi}" stroke-width="2" stroke-linecap="round" opacity=".75"/>
      <path d="${face}" fill="none" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
      ${blush}
      <path d="M101,108 L104,118 L99.5,119.5" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M99.5,119.5 L101,109 L98.2,117.4 Z" fill="${P.skinSh}"/>
      <g class="ch-eyes"><g class="ch-eye">${eye(MX.l, e.eyes, -1, L, P, `m${n}a`)}</g><g class="ch-eye">${eye(MX.r, e.eyes, 1, L, P, `m${n}b`)}</g></g>
      <g class="ch-brows">${brows(e.brows, P, L.face === 'soft')}</g>
      <g class="ch-mouth">${mouth(e.mouth, P)}</g>
      <g class="ch-hair-front">${hr.front}</g>
      ${acc.head}
      ${acc.glasses}
    </g>
    <g class="ch-fx">${fxFront}</g>
  </svg>`;
}

/** Chemin complet d'une image (tient compte du chemin de base GitHub Pages). */
function assetUrl(path) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}

/**
 * HTML d'un personnage prêt à insérer dans la page.
 * @param {string} id
 * @param {object} [o] { expression, size (px), aura (0-3), enter (animation d'apparition), cls }
 */
export function characterHTML(id, o = {}) {
  const ch = CHARACTERS[id];
  if (!ch) return '';
  const expression = o.expression || 'neutre';
  const img = ch.images?.[expression] || ch.images?.neutre;
  const inner = img
    ? `<img src="${assetUrl(img)}" alt="${ch.name}" class="ch-img">`
    : characterSVG(id, expression, { aura: o.aura });
  // Délai de clignement aléatoire : chaque perso cligne à son rythme.
  const blink = (Math.random() * 3).toFixed(2);
  return `<div class="ch ch-${id} ${o.enter === false ? '' : 'ch-enter'} ${o.cls || ''}" data-ch="${id}" data-expr="${expression}" data-aura="${o.aura || 0}"
    style="--c:${ch.color};--size:${o.size || 140}px;--blink-delay:${blink}s" role="img" aria-label="${ch.name}">${inner}</div>`;
}

/** Change l'expression d'un personnage déjà affiché. */
export function setExpression(el, expression) {
  if (!el) return;
  const id = el.dataset.ch;
  const ch = CHARACTERS[id];
  const img = ch.images?.[expression] || ch.images?.neutre;
  el.dataset.expr = expression;
  el.innerHTML = img
    ? `<img src="${assetUrl(img)}" alt="${ch.name}" class="ch-img">`
    : characterSVG(id, expression, { aura: Number(el.dataset.aura) || 0 });
}

/**
 * Joue une animation sur le personnage.
 *  - 'signature' : animation propre au perso (Mory remonte ses lunettes…)
 *  - 'bounce' | 'shake' | 'jump' | 'pop' : réactions génériques
 * Une expression temporaire peut être affichée pendant l'animation.
 */
export function play(el, anim = 'signature', { expression, duration = 1400 } = {}) {
  if (!el) return;
  const id = el.dataset.ch;
  const name = anim === 'signature' ? `sig-${CHARACTERS[id].signature}` : `anim-${anim}`;
  const before = el.dataset.expr;
  const temp = expression || (anim === 'signature' ? SIGNATURE_EXPR[CHARACTERS[id].signature] : null);
  if (temp) setExpression(el, temp);
  el.classList.remove('ch-enter');
  el.classList.remove(name);
  void el.offsetWidth; // relance l'animation CSS
  el.classList.add(name);
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.remove(name);
    if (temp && el.dataset.expr === temp && before) setExpression(el, before);
  }, duration);
}

// Expression affichée pendant l'animation signature de chaque perso.
const SIGNATURE_EXPR = {
  salut: 'joie',
  lunettes: 'concentration',
  reflexion: 'reflexion',
  clin: 'clin',
  'bras-croises': 'joie',
  poing: 'concentration',
  haussement: 'encouragement',
  hype: 'celebration',
};
