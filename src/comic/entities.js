// =====================================================================
// entities.js — FIGURES SPÉCIALES de la BD (pas des persos de l'équipe)
// ---------------------------------------------------------------------
//   oubli    : l'Oubli, l'ombre qui efface le savoir (fumée, pixels, yeux)
//   etudiant, etudiante, vendeuse, chauffeur, passant : figurants
//             (même corps articulé que l'équipe, tête simple)
// Chaque fonction renvoie { svg, head, top } comme bodySVG (pieds en 0,0).
// =====================================================================

import { INK, mixHex } from './body.js';

const f = (n) => Math.round(n * 10) / 10;

/**
 * L'Oubli : grande silhouette encapuchonnée faite d'ombre et de "pixels"
 * effacés. Épaules acérées, cape déchiquetée, longs bras griffus, deux
 * fentes lumineuses à la place des yeux, fissures violettes.
 * poses : 'flotte' | 'attaque' | 'recul' | 'cri'
 */
export function oubliSVG(pose = 'flotte', o = {}) {
  let a = (o.seed || 3) * 7919;
  const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
  const H = 900;
  const lean = pose === 'attaque' ? 22 : pose === 'recul' ? -18 : 0;
  const hx = lean * 2.2; // décalage de la capuche
  const glow = o.color || '#f0e6ff';
  const rim = '#8b5cf6';
  // --- Cape : bas déchiqueté en pointes irrégulières
  let hem = '';
  const n = 11;
  for (let i = 0; i <= n; i++) {
    const x = 170 - (340 * i) / n;
    const y = i % 2 ? -30 - r() * 70 : 10 + r() * 30;
    hem += ` L${f(x)},${f(y)}`;
  }
  const cloak = `M${f(hx - 70)},-${H - 150} Q${f(hx - 150)},-${H - 220} -190,-640 L-165,-420 Q-190,-240 -170,-20${hem.replace(/^ L/, ' L')}
    L170,-20 Q190,-240 165,-420 L190,-640 Q${f(hx + 150)},-${H - 220} ${f(hx + 70)},-${H - 150} Z`;
  // --- Capuche (pointe vers l'avant) et vide du visage
  const hood = `M${f(hx - 92)},-${H - 120} Q${f(hx - 100)},-${H + 10} ${f(hx + 10)},-${H + 40} Q${f(hx + 104)},-${H} ${f(hx + 92)},-${H - 120} Q${f(hx + 60)},-${H - 170} ${f(hx)},-${H - 175} Q${f(hx - 60)},-${H - 170} ${f(hx - 92)},-${H - 120} Z`;
  const voidFace = `M${f(hx - 58)},-${H - 128} Q${f(hx - 60)},-${H - 40} ${f(hx + 4)},-${H - 22} Q${f(hx + 62)},-${H - 40} ${f(hx + 58)},-${H - 128} Q${f(hx)},-${H - 150} ${f(hx - 58)},-${H - 128} Z`;
  // --- Bras longs et griffes
  const arm = (side) => {
    const sx = side * 150; const sy = -650;
    let ex; let ey;
    if (pose === 'attaque') { ex = side > 0 ? 470 : 160; ey = side > 0 ? -600 : -380; }
    else if (pose === 'cri') { ex = side * 330; ey = -880; }
    else if (pose === 'recul') { ex = side * 260; ey = -720; }
    else { ex = side * 230; ey = -330; }
    const mx = (sx + ex) / 2 + side * 60; const my = Math.min(sy, ey) - 40;
    let claws = '';
    const dir = Math.atan2(ey - my, ex - mx);
    for (let k = -2; k <= 1; k++) {
      const aa = dir + k * 0.32;
      const L = 90 + (k === 0 ? 20 : 0);
      const bx = ex + Math.cos(aa) * L * 0.55; const by = ey + Math.sin(aa) * L * 0.55;
      const tx = ex + Math.cos(aa + side * 0.35) * L; const ty = ey + Math.sin(aa + side * 0.35) * L;
      claws += `<path d="M${f(ex)},${f(ey)} Q${f(bx)},${f(by)} ${f(tx)},${f(ty)}" stroke="#05030a" stroke-width="13" stroke-linecap="round" fill="none"/>
        <path d="M${f(ex)},${f(ey)} Q${f(bx)},${f(by)} ${f(tx)},${f(ty)}" stroke="${rim}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".8"/>`;
    }
    return `<path d="M${sx},${sy} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" stroke="#05030a" stroke-width="44" stroke-linecap="round" fill="none"/>
      <path d="M${sx},${sy} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" stroke="${rim}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7" transform="translate(${side * 8},-8)"/>
      ${claws}`;
  };
  // --- Fumée qui monte et fragments effacés
  let smoke = '';
  for (let i = 0; i < 7; i++) {
    const x = -160 + r() * 320; const y = -H * (0.3 + r() * 0.6);
    smoke += `<path d="M${f(x)},${f(y)} q${f(-30 + r() * 60)},-80 ${f(-10 + r() * 20)},-170 q${f(-20 + r() * 40)},-60 0,-120" stroke="#1a0b2e" stroke-width="${f(18 + r() * 20)}" fill="none" stroke-linecap="round" opacity=".55"/>`;
  }
  let bits = '';
  for (let i = 0; i < 22; i++) {
    const s = 6 + r() * 20;
    bits += `<rect x="${f(-260 + r() * 520)}" y="${f(-H - 80 + r() * (H + 60))}" width="${f(s)}" height="${f(s * (0.4 + r()))}" fill="${['#8b5cf6', '#c4b5fd', '#05030a', '#22d3ee'][Math.floor(r() * 4)]}" opacity="${f(0.35 + r() * 0.55)}"/>`;
  }
  // --- Fissures lumineuses sur la cape
  let cracks = '';
  for (let i = 0; i < 4; i++) {
    let x = -110 + i * 70 + r() * 30; let y = -560 + r() * 80;
    let d = `M${f(x)},${f(y)}`;
    for (let k = 0; k < 5; k++) { x += -18 + r() * 36; y += 50 + r() * 50; d += ` L${f(x)},${f(y)}`; }
    cracks += `<path d="${d}" stroke="${rim}" stroke-width="3" fill="none" opacity=".75"/><path d="${d}" stroke="#e9d5ff" stroke-width="1" fill="none" opacity=".8"/>`;
  }
  // --- Yeux : deux fentes inclinées (colère)
  const ey = -H + 80;
  const eye = (side) => `<path d="M${f(hx + side * 44)},${ey - 10} L${f(hx + side * 10)},${ey + 6} L${f(hx + side * 42)},${ey + 4} Z" fill="${glow}"/>`;
  const maw = pose === 'cri'
    ? `<path d="M${f(hx - 16)},${ey + 34} L${f(hx - 6)},${ey + 96} L${f(hx)},${ey + 60} L${f(hx + 6)},${ey + 98} L${f(hx + 16)},${ey + 34} Z" fill="${glow}" opacity=".85"/>`
    : '';
  const svg = `<g>
    <ellipse cx="0" cy="-${H / 2}" rx="300" ry="${H / 2 + 80}" fill="#6d28d9" opacity=".16"/>
    ${smoke}
    ${arm(-1)}
    <path d="${cloak}" fill="#0b0614"/>
    <path d="M-150,-600 Q-175,-300 -140,-40 L-90,-40 Q-120,-320 -90,-610 Z" fill="#1d0f33" opacity=".85"/>
    ${cracks}
    <path d="${cloak}" fill="none" stroke="${rim}" stroke-width="5" opacity=".6" stroke-linejoin="round"/>
    <path d="${hood}" fill="#0b0614" stroke="${rim}" stroke-width="5" stroke-linejoin="round"/>
    <path d="${voidFace}" fill="#020104"/>
    <circle cx="${f(hx)}" cy="${ey}" r="70" fill="${glow}" opacity=".08"/>
    ${eye(-1)}${eye(1)}${maw}
    ${arm(1)}
    ${bits}</g>`;
  return { svg, head: [hx, ey], top: -H - 40 };
}

// Tenues des figurants (couleurs simples)
const EXTRAS = {
  etudiant: { skin: '#5a3825', hair: '#140d0a', top: '#f2f0fa', top2: '#2f86d6', pants: '#23264a', build: 'm' },
  etudiante: { skin: '#7a4a2e', hair: '#1a110c', top: '#f5c518', top2: '#1f9d55', pants: '#2f2f3a', build: 'f' },
  vendeuse: { skin: '#6b3e26', hair: '#1a110c', top: '#e8442e', top2: '#f5c518', pants: '#e8442e', build: 'f', headwrap: '#f5c518' },
  chauffeur: { skin: '#4a2c1d', hair: '#120c09', top: '#2f7d4a', top2: '#f2f0fa', pants: '#3a3a42', build: 'm', cap: '#f5c518' },
  passant: { skin: '#5a3825', hair: '#120c09', top: '#8b5cf6', top2: '#2a1f55', pants: '#16161c', build: 'm' },
};

/**
 * Figurant : silhouette simple et lisible (pas de traits détaillés),
 * pour peupler les rues, le marché, la classe.
 */
export function extraSVG(kind, pose = 'debout', o = {}) {
  const L = EXTRAS[kind] || EXTRAS.passant;
  const g = o.grade || ((c) => c);
  const fem = L.build === 'f';
  const sw = fem ? 54 : 66;
  const walk = pose === 'marche';
  const sh = mixHex(g(L.top), '#000000', 0.3);
  const legs = walk
    ? `<path d="M-20,-370 L-60,-10 M20,-370 L44,-10" stroke="${INK}" stroke-width="58" stroke-linecap="round"/><path d="M-20,-370 L-60,-10 M20,-370 L44,-10" stroke="${g(L.pants)}" stroke-width="50" stroke-linecap="round"/>`
    : `<path d="M-22,-370 L-26,-10 M22,-370 L26,-10" stroke="${INK}" stroke-width="58" stroke-linecap="round"/><path d="M-22,-370 L-26,-10 M22,-370 L26,-10" stroke="${g(L.pants)}" stroke-width="50" stroke-linecap="round"/>`;
  const arms = walk
    ? `<path d="M${-sw},-580 L${-sw - 30},-330 M${sw},-580 L${sw + 40},-340" stroke="${INK}" stroke-width="44" stroke-linecap="round"/><path d="M${-sw},-580 L${-sw - 30},-330 M${sw},-580 L${sw + 40},-340" stroke="${g(L.top)}" stroke-width="36" stroke-linecap="round"/>`
    : `<path d="M${-sw},-580 L${-sw - 8},-320 M${sw},-580 L${sw + 8},-320" stroke="${INK}" stroke-width="44" stroke-linecap="round"/><path d="M${-sw},-580 L${-sw - 8},-320 M${sw},-580 L${sw + 8},-320" stroke="${g(L.top)}" stroke-width="36" stroke-linecap="round"/>`;
  const svg = `<g>
    ${legs}
    <path d="M-${sw + 14},-590 Q0,-620 ${sw + 14},-590 L${fem ? 46 : 52},-350 L-${fem ? 46 : 52},-350 Z" fill="${g(L.top)}" stroke="${INK}" stroke-width="5"/>
    <path d="M-${sw + 14},-590 L-${fem ? 46 : 52},-350 L-20,-350 L-30,-600 Z" fill="${sh}"/>
    ${arms}
    <path d="M-14,-640 L14,-640 L16,-590 L-16,-590 Z" fill="${g(L.skin)}" stroke="${INK}" stroke-width="5"/>
    <ellipse cx="0" cy="-700" rx="52" ry="64" fill="${g(L.skin)}" stroke="${INK}" stroke-width="5"/>
    <path d="M-52,-712 Q-50,-770 0,-772 Q50,-770 52,-712 Q30,-738 0,-736 Q-30,-738 -52,-712 Z" fill="${g(L.hair)}" stroke="${INK}" stroke-width="4"/>
    ${L.headwrap ? `<path d="M-60,-716 Q-70,-800 0,-810 Q70,-800 60,-716 Q0,-750 -60,-716 Z" fill="${g(L.headwrap)}" stroke="${INK}" stroke-width="5"/>` : ''}
    ${L.cap ? `<path d="M-54,-730 Q0,-790 54,-730 Z M40,-736 L96,-728 L52,-722 Z" fill="${g(L.cap)}" stroke="${INK}" stroke-width="5"/>` : ''}
    <path d="M-26,-700 h14 M12,-700 h14" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    </g>`;
  return { svg, head: [0, -700], top: -790 };
}

export const EXTRA_KINDS = Object.keys(EXTRAS);
