// =====================================================================
// character.js — Dessin et animation des personnages (SVG en calques)
// ---------------------------------------------------------------------
// Chaque personnage est dessiné en SVG à partir de sa description
// (`look` dans src/data/characters.js). Le dessin est découpé en calques
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

/** Étoile à 5 branches (yeux étoilés). */
function star5(cx, cy, r, fill) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
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
  ren: { neutre: { mouth: 'smirk', brows: 'smug' }, joie: { mouth: 'smirk', eyes: 'normal', brows: 'smug' } },
  tidiane: { neutre: { eyes: 'chill', mouth: 'soft' }, encouragement: { eyes: 'chill' } },
  awa: { neutre: { brows: 'furrow' } },
  nia: { neutre: { mouth: 'soft' } },
};

// ---------------------------------------------------------------------
// YEUX
// ---------------------------------------------------------------------
const EYE_L = 80;
const EYE_R = 120;
const EYE_Y = 106;

/** Dessine un œil anime. `side` = -1 (gauche) ou 1 (droite). */
function eye(cx, type, side, L, id) {
  const dark = '#1B0F0A';
  // Cil supérieur épais avec une petite pointe vers l'extérieur du visage.
  const upperLash = (cy, lift = 0) => {
    const outer = cx + 13 * side;
    const inner = cx - 12 * side;
    return `<path d="M${inner},${cy - 7 + lift} Q${cx},${cy - 18 + lift} ${outer},${cy - 9 + lift} L${outer + 4 * side},${cy - 12 + lift}" fill="none" stroke="${dark}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  const closedArc = (cy, up = true) =>
    `<path d="M${cx - 11},${cy + 2} Q${cx},${up ? cy - 10 : cy + 8} ${cx + 11},${cy + 2}" fill="none" stroke="${dark}" stroke-width="4" stroke-linecap="round"/>`;

  if (type === 'happy') return closedArc(EYE_Y);
  if (type === 'chill') {
    // Paupières mi-closes, regard détendu.
    return `<g><clipPath id="${id}"><rect x="${cx - 14}" y="${EYE_Y - 4}" width="28" height="20"/></clipPath>
      <g clip-path="url(#${id})">${eyeBall(cx, EYE_Y + 1, 12, 13, 9, 11, L)}</g>
      <path d="M${cx - 13},${EYE_Y - 3} L${cx + 13},${EYE_Y - 4}" stroke="${dark}" stroke-width="3.6" stroke-linecap="round"/></g>`;
  }
  if (type === 'focus') {
    // Regard déterminé : paupière supérieure inclinée vers le centre.
    const tilt = side < 0 ? 3 : -3;
    return `<g><clipPath id="${id}"><path d="M${cx - 14},${EYE_Y - 4 - tilt} L${cx + 14},${EYE_Y - 4 + tilt} L${cx + 14},${EYE_Y + 18} L${cx - 14},${EYE_Y + 18}Z"/></clipPath>
      <g clip-path="url(#${id})">${eyeBall(cx, EYE_Y + 1, 12, 13, 8.5, 11, L)}</g>
      <path d="M${cx - 13},${EYE_Y - 5 - tilt} L${cx + 13},${EYE_Y - 5 + tilt}" stroke="${dark}" stroke-width="4" stroke-linecap="round"/></g>`;
  }
  if (type === 'wink' && side > 0) return closedArc(EYE_Y, true);
  if (type === 'stars') {
    return `<g><ellipse cx="${cx}" cy="${EYE_Y}" rx="12" ry="14" fill="#fff"/>
      ${star5(cx, EYE_Y + 1, 11, L.color)}${star5(cx, EYE_Y + 1, 5, '#fff')}
      ${upperLash(EYE_Y)}</g>`;
  }
  let irisDx = 0; let irisDy = 0; let irx = 9.5; let iry = 12; let ry = 14; let hl = 1;
  if (type === 'up') { irisDx = 2.5; irisDy = -3.5; }
  if (type === 'wide') { irx = 6.5; iry = 8.5; ry = 15.5; }
  if (type === 'soft') { irisDy = 1.5; hl = 1.3; }
  return `<g>${eyeBall(cx, EYE_Y, 12, ry, irx, iry, L, irisDx, irisDy, hl)}${upperLash(EYE_Y, type === 'wide' ? -2 : 0)}</g>`;
}

/** Globe de l'œil : blanc + iris dégradé + pupille + reflets brillants. */
function eyeBall(cx, cy, rx, ry, irx, iry, L, dx = 0, dy = 0, hl = 1) {
  const ic = L.eyeColor;
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/>
    <ellipse cx="${cx + dx}" cy="${cy + 1 + dy}" rx="${irx}" ry="${iry}" fill="${ic}"/>
    <ellipse cx="${cx + dx}" cy="${cy + 1 + dy + iry * 0.45}" rx="${irx * 0.75}" ry="${iry * 0.4}" fill="${L.color}" opacity=".55"/>
    <ellipse cx="${cx + dx}" cy="${cy + dy}" rx="${irx * 0.45}" ry="${iry * 0.5}" fill="#120806"/>
    <circle cx="${cx + dx + 3.2}" cy="${cy + dy - 4.5}" r="${3.4 * hl}" fill="#fff"/>
    <circle cx="${cx + dx - 3.5}" cy="${cy + dy + 5}" r="${1.6 * hl}" fill="#fff" opacity=".9"/>`;
}

// ---------------------------------------------------------------------
// SOURCILS
// ---------------------------------------------------------------------
function brows(type, color) {
  // Coordonnées [x1, y1, xMilieu, yMilieu, x2, y2] pour le sourcil gauche (x2 = côté nez).
  const shapes = {
    neutral: [[68, 89, 79, 84, 91, 87], [109, 87, 121, 84, 132, 89]],
    raised: [[68, 84, 79, 78, 91, 82], [109, 82, 121, 78, 132, 84]],
    high: [[68, 82, 79, 74, 91, 79], [109, 79, 121, 74, 132, 82]],
    furrow: [[68, 84, 80, 85, 92, 90], [108, 90, 120, 85, 132, 84]],
    worried: [[68, 90, 80, 86, 91, 82], [109, 82, 120, 86, 132, 90]],
    think: [[68, 86, 79, 81, 91, 85], [109, 90, 121, 88, 132, 90]],
    smug: [[68, 89, 79, 85, 91, 88], [109, 84, 121, 77, 132, 82]],
  };
  return (shapes[type] || shapes.neutral).map(([a, b, c, d, e, f]) =>
    `<path d="M${a},${b} Q${c},${d} ${e},${f}" fill="none" stroke="${color}" stroke-width="4.6" stroke-linecap="round"/>`).join('');
}

// ---------------------------------------------------------------------
// BOUCHE
// ---------------------------------------------------------------------
function mouth(type) {
  const line = '#2A120D';
  const inside = '#5A1F1F';
  const tongue = '#FF7A8A';
  switch (type) {
    case 'grin':
      return `<path d="M88,129 Q100,146 112,129 Z" fill="${inside}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M90,130 L110,130 L108,133 L92,133Z" fill="#fff"/>
        <ellipse cx="100" cy="139" rx="6" ry="3" fill="${tongue}"/>`;
    case 'shout':
      return `<path d="M85,126 Q100,156 115,126 Z" fill="${inside}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M87,127 L113,127 L111,131 L89,131Z" fill="#fff"/>
        <ellipse cx="100" cy="144" rx="8" ry="4.5" fill="${tongue}"/>`;
    case 'o':
      return `<ellipse cx="100" cy="134" rx="5.5" ry="7" fill="${inside}" stroke="${line}" stroke-width="2"/>`;
    case 'flat':
      return `<path d="M92,134 Q100,132 108,133" fill="none" stroke="${line}" stroke-width="3" stroke-linecap="round"/>`;
    case 'smirk':
      return `<path d="M91,133 Q102,137 111,127" fill="none" stroke="${line}" stroke-width="3" stroke-linecap="round"/>`;
    case 'soft':
      return `<path d="M92,131 Q100,138 108,131" fill="none" stroke="${line}" stroke-width="3" stroke-linecap="round"/>`;
    case 'think':
      return `<path d="M94,135 Q99,132 106,134" fill="none" stroke="${line}" stroke-width="3" stroke-linecap="round"/>`;
    default: // smile
      return `<path d="M89,130 Q100,140 111,130" fill="none" stroke="${line}" stroke-width="3" stroke-linecap="round"/>`;
  }
}

// ---------------------------------------------------------------------
// CHEVEUX (renvoie { back, front })
// ---------------------------------------------------------------------
function hair(L) {
  const h = L.hairColor;
  const hi = shade(h, 0.28); // reflets
  const c = L.color;
  switch (L.hair) {
    case 'hightop': { // twists courts en hauteur + dégradé sur les côtés
      let twists = '';
      for (let x = 66; x <= 134; x += 7) {
        twists += `<path d="M${x},62 C${x - 3},50 ${x + 3},36 ${x},${22 + Math.abs(100 - x) / 5}" fill="none" stroke="${hi}" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>`;
      }
      return {
        back: '',
        front: `<path d="M54,98 C50,78 52,62 58,52 L60,26 C66,12 84,8 100,8 C116,8 134,12 140,26 L142,52 C148,62 150,78 146,98 C142,86 140,76 134,68 C118,60 82,60 66,68 C60,76 58,86 54,98Z" fill="${h}"/>
          <path d="M54,98 C51,82 53,68 58,58 L66,68 C60,76 58,86 54,98Z M146,98 C149,82 147,68 142,58 L134,68 C140,76 142,86 146,98Z" fill="${L.skin}" opacity=".35"/>
          ${twists}`,
      };
    }
    case 'afro': { // afro volumineux et arrondi
      let bumps = '';
      for (let i = 0; i < 16; i++) {
        const a = Math.PI + (i / 15) * Math.PI * 1.25 - Math.PI * 0.125;
        bumps += `<circle cx="${(100 + 66 * Math.cos(a)).toFixed(1)}" cy="${(80 + 58 * Math.sin(a)).toFixed(1)}" r="19" fill="${h}"/>`;
      }
      let curls = '';
      for (let i = 0; i < 14; i++) {
        const x = 50 + ((i * 37) % 100);
        const y = 30 + ((i * 23) % 50);
        curls += `<path d="M${x},${y} q3,-4 6,0" fill="none" stroke="${hi}" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>`;
      }
      return {
        back: `<ellipse cx="100" cy="78" rx="72" ry="64" fill="${h}"/>${bumps}${curls}`,
        front: `<path d="M52,96 C48,60 70,36 100,36 C130,36 152,60 148,96 C144,80 134,68 120,64 C112,70 88,70 80,64 C66,68 56,80 52,96Z" fill="${h}"/>
          <path d="M70,60 q4,-5 8,0 M92,52 q4,-5 8,0 M114,56 q4,-5 8,0" fill="none" stroke="${hi}" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>`,
      };
    }
    case 'braids': { // longues tresses (box braids) avec perles
      const braid = (x0, y0, x1, y1, bend) => {
        let s = '';
        const n = 11;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const x = x0 + (x1 - x0) * t + Math.sin(t * Math.PI) * bend;
          const y = y0 + (y1 - y0) * t;
          s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5.2" ry="7" fill="${h}" stroke="${hi}" stroke-width="1" />`;
        }
        return s + `<circle cx="${x1}" cy="${y1 + 8}" r="3.6" fill="${c}"/>`;
      };
      return {
        back: [braid(58, 80, 44, 206, -6), braid(66, 76, 56, 214, -4), braid(142, 80, 156, 206, 6), braid(134, 76, 144, 214, 4)].join(''),
        front: `<path d="M50,104 C44,58 70,30 100,30 C130,30 156,58 150,104 C146,84 138,70 122,62 L100,50 L78,62 C62,70 54,84 50,104Z" fill="${h}"/>
          <path d="M100,50 C90,52 78,58 70,68 M100,50 C110,52 122,58 130,68 M100,50 C88,46 70,50 60,62 M100,50 C112,46 130,50 140,62" fill="none" stroke="${hi}" stroke-width="1.6" opacity=".55"/>
          ${braid(52, 96, 50, 176, -3)}${braid(148, 96, 150, 176, 3)}`,
      };
    }
    case 'puffs': { // deux puffs afro (macarons) sur le dessus
      const puff = (cx, cy) => {
        let s = `<circle cx="${cx}" cy="${cy}" r="26" fill="${h}"/>`;
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          s += `<circle cx="${(cx + 24 * Math.cos(a)).toFixed(1)}" cy="${(cy + 24 * Math.sin(a)).toFixed(1)}" r="8" fill="${h}"/>`;
        }
        return s + `<path d="M${cx - 8},${cy - 6} q4,-5 8,0 M${cx + 2},${cy + 6} q4,-5 8,0" fill="none" stroke="${hi}" stroke-width="1.8" opacity=".6"/>`;
      };
      return {
        back: puff(52, 36) + puff(148, 36),
        front: `<path d="M52,98 C48,60 70,38 100,38 C130,38 152,60 148,98 C144,80 136,70 122,64 C108,60 92,60 78,64 C64,70 56,80 52,98Z" fill="${h}"/>
          <path d="M60,54 L${52 + 10},${36 + 20} M140,54 L138,56" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
          <path d="M84,64 q-4,5 2,7 M112,64 q4,5 -2,7" fill="none" stroke="${h}" stroke-width="2" stroke-linecap="round"/>`,
      };
    }
    case 'locks': { // locks qui tombent (dreadlocks)
      const lock = (x0, y0, x1, y1, w = 9) => `<path d="M${x0},${y0} Q${(x0 + x1) / 2 + (x1 > 100 ? 6 : -6)},${(y0 + y1) / 2} ${x1},${y1}" fill="none" stroke="${h}" stroke-width="${w}" stroke-linecap="round"/>
        <path d="M${x0},${y0} Q${(x0 + x1) / 2 + (x1 > 100 ? 6 : -6)},${(y0 + y1) / 2} ${x1},${y1}" fill="none" stroke="${hi}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="1.5 7" opacity=".55"/>`;
      return {
        back: [lock(60, 70, 50, 160), lock(68, 60, 60, 168), lock(140, 70, 150, 160), lock(132, 60, 140, 168), lock(78, 50, 74, 150), lock(122, 50, 126, 150)].join(''),
        front: `<path d="M52,94 C48,56 72,34 100,34 C128,34 152,56 148,94 C142,78 132,68 118,64 C104,60 90,62 80,66 C66,72 56,82 52,94Z" fill="${h}"/>
          ${lock(96, 40, 70, 84, 10)}${lock(106, 40, 84, 78, 10)}${lock(116, 44, 134, 86, 10)}${lock(124, 46, 148, 96, 9)}${lock(80, 44, 56, 96, 9)}`,
      };
    }
    case 'bun': { // chignon haut de twists + cheveux plaqués
      let lines = '';
      for (let x = 66; x <= 134; x += 10) lines += `<path d="M${x},${70 - Math.abs(100 - x) / 4} Q${(x + 100) / 2},${40} 100,22" fill="none" stroke="${hi}" stroke-width="1.6" opacity=".55"/>`;
      return {
        back: `<circle cx="100" cy="20" r="22" fill="${h}"/>
          <path d="M84,12 q8,-8 16,0 M92,26 q8,-8 16,0 M104,14 q6,-6 12,0" fill="none" stroke="${hi}" stroke-width="2" opacity=".6"/>`,
        front: `<path d="M52,94 C48,58 72,36 100,36 C128,36 152,58 148,94 C144,80 136,72 124,68 C110,64 90,64 76,68 C64,72 56,80 52,94Z" fill="${h}"/>${lines}`,
      };
    }
    case 'waves': { // coupe courte avec waves et contours nets
      let waves = '';
      for (let r = 14; r <= 46; r += 8) waves += `<path d="M${100 - r},${62 - r / 3} Q100,${40 - r / 2} ${100 + r},${62 - r / 3}" fill="none" stroke="${hi}" stroke-width="1.8" opacity=".5"/>`;
      return {
        back: '',
        front: `<path d="M53,90 C50,58 72,38 100,38 C128,38 150,58 147,90 L142,76 C140,70 136,66 130,64 L70,64 C64,66 60,70 58,76Z" fill="${h}"/>${waves}`,
      };
    }
    case 'ponytail': { // queue de cheval haute de twists
      let tw = '';
      for (let i = 0; i < 5; i++) tw += `<path d="M112,${28 + i * 3} C150,${20 + i * 6} 168,${60 + i * 8} ${150 + i * 4},${120 + i * 10}" fill="none" stroke="${h}" stroke-width="8" stroke-linecap="round"/>
        <path d="M112,${28 + i * 3} C150,${20 + i * 6} 168,${60 + i * 8} ${150 + i * 4},${120 + i * 10}" fill="none" stroke="${hi}" stroke-width="8" stroke-dasharray="2 6" opacity=".45"/>`;
      return {
        back: tw,
        front: `<path d="M52,94 C48,58 72,36 100,36 C128,36 152,58 148,94 C144,80 136,72 124,68 C110,64 90,64 76,68 C64,72 56,80 52,94Z" fill="${h}"/>
          <circle cx="114" cy="30" r="7" fill="${c}"/>`,
      };
    }
    default:
      return { back: '', front: '' };
  }
}

// ---------------------------------------------------------------------
// TENUE (buste)
// ---------------------------------------------------------------------
function outfit(L) {
  const m = L.outfitColor;
  const a = L.outfitColor2;
  const dk = shade(m, -0.3);
  const torso = `<path d="M34,232 C34,192 60,168 100,166 C140,168 166,192 166,232Z" fill="${m}"/>`;
  switch (L.outfit) {
    case 'hoodie':
      return `${torso}
        <path d="M66,172 C72,156 128,156 134,172 C124,184 76,184 66,172Z" fill="${dk}"/>
        <path d="M92,178 L89,204 M108,178 L111,204" stroke="${a}" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="89" cy="206" r="3" fill="${a}"/><circle cx="111" cy="206" r="3" fill="${a}"/>
        <path d="M70,222 L130,222" stroke="${dk}" stroke-width="3" stroke-linecap="round"/>
        ${sparkle(128, 200, 7, a, '')}`;
    case 'jacket':
      return `${torso}
        <path d="M84,168 L100,214 L116,168Z" fill="${shade(a, -0.55)}"/>
        <path d="M84,168 L70,186 L92,196Z M116,168 L130,186 L108,196Z" fill="${dk}"/>
        <path d="M52,200 L70,188 M148,200 L130,188" stroke="${a}" stroke-width="2.4" stroke-linecap="round"/>
        <rect x="136" y="206" width="14" height="6" rx="2" fill="${a}" opacity=".85"/>`;
    case 'cardigan':
      return `${torso}
        <path d="M82,168 C90,180 110,180 118,168 L114,232 L86,232Z" fill="${a}"/>
        <path d="M82,168 L86,232 M118,168 L114,232" stroke="${dk}" stroke-width="3"/>
        <circle cx="80" cy="200" r="2.6" fill="${a}"/><circle cx="80" cy="216" r="2.6" fill="${a}"/>`;
    case 'bomber':
      return `${torso}
        <path d="M76,170 C84,178 116,178 124,170 L124,176 C116,184 84,184 76,176Z" fill="${a}"/>
        <path d="M100,180 L100,232" stroke="${dk}" stroke-width="2.4"/>
        <path d="M40,214 L160,214" stroke="${a}" stroke-width="3" opacity=".7"/>`;
    case 'track':
      return `${torso}
        <path d="M84,166 L84,178 L116,178 L116,166" fill="${dk}"/>
        <path d="M100,178 L100,232" stroke="${a}" stroke-width="2.2"/>
        <path d="M44,200 C54,182 68,172 80,170 M156,200 C146,182 132,172 120,170" fill="none" stroke="${a}" stroke-width="4" stroke-linecap="round"/>`;
    default:
      return torso;
  }
}

// ---------------------------------------------------------------------
// ACCESSOIRES : { body, head, glasses }
// ---------------------------------------------------------------------
function accessories(L) {
  const a = L.outfitColor2;
  const acc = new Set(L.accessories || []);
  let body = '';
  let head = '';
  let glasses = '';
  if (acc.has('headphones')) {
    body += `<path d="M72,176 C74,160 126,160 128,176" fill="none" stroke="#222" stroke-width="5" stroke-linecap="round"/>
      <rect x="62" y="168" width="18" height="22" rx="8" fill="#1d1d24"/><rect x="120" y="168" width="18" height="22" rx="8" fill="#1d1d24"/>
      <rect x="66" y="172" width="10" height="14" rx="5" fill="${L.color}"/><rect x="124" y="172" width="10" height="14" rx="5" fill="${L.color}"/>`;
  }
  if (acc.has('chain')) body += `<path d="M84,176 Q100,198 116,176" fill="none" stroke="#E6E6F0" stroke-width="2.6" stroke-dasharray="3 2"/>`;
  if (acc.has('visor')) {
    glasses = `<g class="ch-glasses">
      <rect x="63" y="94" width="34" height="25" rx="9" fill="${L.color}" fill-opacity=".22" stroke="#101820" stroke-width="3.2"/>
      <rect x="103" y="94" width="34" height="25" rx="9" fill="${L.color}" fill-opacity=".22" stroke="#101820" stroke-width="3.2"/>
      <path d="M97,103 L103,103" stroke="#101820" stroke-width="3.2"/>
      <path d="M63,100 L53,97 M137,100 L147,97" stroke="#101820" stroke-width="3"/>
      <path d="M68,98 L78,98" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <circle cx="133" cy="97" r="2.2" fill="${L.color}" class="fx-blink"/></g>`;
  }
  if (acc.has('headband')) head += `<path d="M54,78 C66,60 134,60 146,78 L144,86 C132,70 68,70 56,86Z" fill="${a}"/>`;
  if (acc.has('earrings')) head += `<circle cx="51" cy="118" r="3" fill="#FFD23F"/><circle cx="149" cy="118" r="3" fill="#FFD23F"/>`;
  if (acc.has('hoops')) head += `<circle cx="50" cy="124" r="7" fill="none" stroke="#FFD23F" stroke-width="2.4"/><circle cx="150" cy="124" r="7" fill="none" stroke="#FFD23F" stroke-width="2.4"/>`;
  if (acc.has('earbuds')) head += `<circle cx="52" cy="108" r="4" fill="#F4F4F8"/><circle cx="148" cy="108" r="4" fill="#F4F4F8"/>`;
  if (acc.has('clips')) head += sparkle(66, 58, 7, a, '') + sparkle(136, 58, 7, a, '');
  if (acc.has('beard')) {
    head += `<path d="M58,114 C62,140 82,154 100,155 C118,154 138,140 142,114 C138,130 122,146 100,147 C78,146 62,130 58,114Z" fill="${L.hairColor}" opacity=".85"/>
      <path d="M90,125 Q100,121 110,125" fill="none" stroke="${L.hairColor}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
  }
  return { body, head, glasses };
}

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
// STYLE MANGA SHŌNEN (portraits en buste)
// ---------------------------------------------------------------------
// Proportions d'ados / jeunes adultes, mâchoire anguleuse, yeux en amande
// aux coins pointus, nez en un trait, encrage épais à l'extérieur et fin
// à l'intérieur, ombres "cel-shading" franches (lumière venant de la
// droite : les ombres sont à gauche). Mêmes calques que le style chibi.
// Un perso utilise ce style si `look.style === 'manga'`.
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
  return {
    skin: L.skin, skinSh: shade(L.skin, -0.32), skinHi: shade(L.skin, 0.16),
    hair: L.hairColor, hairSh: shade(L.hairColor, -0.55), hairHi: shade(mix(L.hairColor, L.color, 0.45), 0.12),
    main: L.outfitColor, mainSh: shade(L.outfitColor, -0.35), mainHi: shade(L.outfitColor, 0.18),
    acc: L.outfitColor2,
  };
}

// Position des yeux (centre) et forme du visage en buste.
const MY = 103; // hauteur des yeux
const MX = { l: 87, r: 113 };
const FACE = 'M71,84 C71,68 83,56 100,56 C117,56 129,68 129,84 L130,102 C130,112 127,120 122,127 L109,144 Q100,151 91,144 L78,127 C73,120 70,112 70,102 Z';
const FACE_SHADOW = 'M70,102 C70,112 73,120 78,127 L91,144 Q95,147 99,148 L94,138 L83,124 C79,117 77,108 77,99 L76,86 Q72,90 70,102 Z';

/** Œil en amande (coin extérieur pointu). side = -1 (gauche) ou 1 (droite). */
function mEye(cx, type, side, L, P, id) {
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
  return `${withClip(almond(), iris(dx, dy, 5.4, shine) + extra)}${lid()}${lower}${crease}`;
}

/** Sourcils épais, effilés vers l'extérieur. */
function mBrows(type, P) {
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
    return `<path d="M${ix},${iy + 3.4} L${ix},${iy - 0.6} Q${mx},${Math.min(iy, oy) - 3} ${ox},${oy} Q${mx},${Math.min(iy, oy) + 0.8} ${ix},${iy + 3.4} Z" fill="${P.hair}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`;
  }).join('');
}

/** Bouches manga (très expressives). */
function mMouth(type, P) {
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

/** Cheveux style manga : { back, front }. */
function mHair(L, P) {
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
    default:
      return { back: '', front: '' };
  }
}

/** Buste et tenue style manga (cel-shading + plis). */
function mOutfit(L, P) {
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
    default:
      return `${base}${outline}`;
  }
}

/** Accessoires style manga : { body, head, glasses }. */
function mAccessories(L, P) {
  const acc = new Set(L.accessories || []);
  let body = '';
  const head = '';
  let glasses = '';
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

// Positions des effets pour le style manga (tête plus petite qu'en chibi).
const MANGA_FX = { sweat: [134, 78], vein: [124, 70] };

/** SVG complet d'un perso en style manga. */
function characterSVGManga(id, expression, opts) {
  const ch = CHARACTERS[id];
  const L = { ...ch.look, color: ch.color };
  const P = palette(L);
  const e = { ...(EXPR[expression] || EXPR.neutre), ...(PERSONAL[id]?.[expression] || {}) };
  const n = ++uid;
  const hr = mHair(L, P);
  const acc = mAccessories(L, P);
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
  const earL = 'M72,96 C65,93 62,101 64,108 C65,114 68,117 72,116 Z';
  const earR = 'M128,96 C135,93 138,101 136,108 C135,114 132,117 128,116 Z';
  return `<svg viewBox="0 0 200 232" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="ch-svg ch-manga">
    <g class="ch-aura">${aura(opts.aura || 0, L, n)}</g>
    <g class="ch-fx-back">${fx.back}</g>
    <g class="ch-hair-back">${hr.back}</g>
    <g class="ch-body">
      <path d="M89,128 L111,128 L113,172 L87,172 Z" fill="${P.skin}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
      <path d="M88,134 L112,134 L112,152 Q100,160 88,150 Z" fill="${P.skinSh}"/>
      ${mOutfit(L, P)}
      ${acc.body}
    </g>
    <g class="ch-head">
      <path d="${earL}" fill="${P.skinSh}" stroke="${INK}" stroke-width="2"/><path d="M70,100 Q66,104 69,111" fill="none" stroke="${INK}" stroke-width="${INN}"/>
      <path d="${earR}" fill="${P.skin}" stroke="${INK}" stroke-width="2"/><path d="M130,100 Q134,104 131,111" fill="none" stroke="${INK}" stroke-width="${INN}"/>
      <path d="${FACE}" fill="${P.skin}"/>
      <path d="${FACE_SHADOW}" fill="${P.skinSh}"/>
      <path d="M72,84 Q100,74 128,84 L128,91 Q100,82 72,91 Z" fill="${P.skinSh}"/>
      <path d="M112,112 Q118,110 123,113" fill="none" stroke="${P.skinHi}" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      <path d="${FACE}" fill="none" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
      ${blush}
      <path d="M101,108 L104,118 L99.5,119.5" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M99.5,119.5 L101,109 L98.2,117.4 Z" fill="${P.skinSh}"/>
      <g class="ch-eyes"><g class="ch-eye">${mEye(MX.l, e.eyes, -1, L, P, `m${n}a`)}</g><g class="ch-eye">${mEye(MX.r, e.eyes, 1, L, P, `m${n}b`)}</g></g>
      <g class="ch-brows">${mBrows(e.brows, P)}</g>
      <g class="ch-mouth">${mMouth(e.mouth, P)}</g>
      <g class="ch-hair-front">${hr.front}</g>
      ${acc.head}
      ${acc.glasses}
    </g>
    <g class="ch-fx">${fxFront}</g>
  </svg>`;
}

// ---------------------------------------------------------------------
// ASSEMBLAGE
// ---------------------------------------------------------------------

/**
 * Construit le SVG complet d'un personnage.
 * @param {string} id         identifiant du perso (kai, mory…)
 * @param {string} expression neutre | joie | reflexion | celebration | encouragement | surprise | concentration | clin
 * @param {object} [opts]     { aura: 0..3 }
 */
export function characterSVG(id, expression = 'neutre', opts = {}) {
  const ch = CHARACTERS[id];
  if (ch.look.style === 'manga') return characterSVGManga(id, expression, opts);
  const L = { ...ch.look, color: ch.color };
  const e = { ...(EXPR[expression] || EXPR.neutre), ...(PERSONAL[id]?.[expression] || {}) };
  const n = ++uid;
  const skinDk = shade(L.skin, -0.22);
  const hr = hair(L);
  const acc = accessories(L);
  const fx = effects(e.fx, L);
  const blush = e.blush || expression === 'neutre'
    ? `<ellipse cx="70" cy="124" rx="8" ry="4" fill="#FF5E8E" opacity="${e.blush ? 0.45 : 0.22}"/><ellipse cx="130" cy="124" rx="8" ry="4" fill="#FF5E8E" opacity="${e.blush ? 0.45 : 0.22}"/>
      ${e.blush ? '<path d="M66,121 l3,-4 M71,122 l3,-4 M126,122 l3,-4 M131,121 l3,-4" stroke="#fff" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>' : ''}`
    : '';

  return `<svg viewBox="0 0 200 232" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="ch-svg">
    <g class="ch-aura">${aura(opts.aura || 0, L, n)}</g>
    <g class="ch-fx-back">${fx.back}</g>
    <g class="ch-hair-back">${hr.back}</g>
    <g class="ch-body">
      <rect x="90" y="138" width="20" height="34" rx="8" fill="${skinDk}"/>
      ${outfit(L)}
      ${acc.body}
    </g>
    <g class="ch-head">
      <ellipse cx="51" cy="106" rx="7" ry="10" fill="${skinDk}"/>
      <ellipse cx="149" cy="106" rx="7" ry="10" fill="${skinDk}"/>
      <path d="M52,96 C52,58 76,42 100,42 C124,42 148,58 148,96 C148,124 132,146 100,150 C68,146 52,124 52,96Z" fill="${L.skin}"/>
      <path d="M58,120 C66,140 84,148 100,150 C80,146 64,136 58,120Z" fill="${skinDk}" opacity=".5"/>
      <g class="ch-hair-front">${hr.front}</g>
      ${blush}
      <path d="M97,119 Q100,122 103,119" fill="none" stroke="${skinDk}" stroke-width="2.2" stroke-linecap="round"/>
      <g class="ch-eyes"><g class="ch-eye">${eye(EYE_L, e.eyes, -1, L, `e${n}a`)}</g><g class="ch-eye">${eye(EYE_R, e.eyes, 1, L, `e${n}b`)}</g></g>
      <g class="ch-brows">${brows(e.brows, L.hairColor)}</g>
      <g class="ch-mouth">${mouth(e.mouth)}</g>
      ${acc.head}
      ${acc.glasses}
    </g>
    <g class="ch-fx">${fx.front}</g>
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
