// =====================================================================
// entities.js — FIGURES SPÉCIALES de la BD (pas des persos de l'équipe)
// ---------------------------------------------------------------------
//   oubli    : l'Oubli, l'ombre qui efface le savoir (fumée, pixels, yeux)
//   etudiant, etudiante, vendeuse, chauffeur, passant : figurants
//             (même corps articulé que l'équipe, tête simple)
// Chaque fonction renvoie { svg, head, top } comme bodySVG (pieds en 0,0).
// =====================================================================

import { INK, mixHex } from './body.js';
import { CHARACTERS as TEAM_CH } from '../data/characters.js';
import { BODY_LOOKS as BL } from '../data/comic/looks.js';

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

// ---------------------------------------------------------------------
// GROS PLANS PARTIELS (mise en scène manga : suggérer l'action)
// ---------------------------------------------------------------------

const shadeHex = (hex, a) => mixHex(hex, a < 0 ? '#000000' : '#ffffff', Math.abs(a));
function lookOf(id) {
  const ch = TEAM_CH[id] || TEAM_CH.kai;
  const B = BL[id] || BL.kai;
  return { skin: ch.look.skin, main: ch.look.outfitColor, acc: ch.look.outfitColor2, pants: B.pants, shoes: B.shoes, sole: B.sole, color: ch.color, skirt: B.skirt };
}

/**
 * POING en premier plan, lancé vers le lecteur (vu de face, en raccourci).
 * Phalanges repliées (2 rangées de 4 doigts), pouce en travers, poignet et
 * manche qui fuient vers l'arrière. Repère : poing centré en (0,0).
 * @param {string} of  personnage à qui appartient le poing
 */
export function poingSVG(of = 'kai') {
  const L = lookOf(of);
  const o = `stroke="${INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
  const sk = L.skin; const skSh = shadeHex(L.skin, -0.32); const skHi = shadeHex(L.skin, 0.22);
  const sleeve = L.main; const sleeveSh = shadeHex(L.main, -0.42);
  // Manche + poignet (en perspective, vers le bas à gauche)
  let s = `<path d="M-620,640 L-330,330 C-300,300 -250,290 -210,300 L-120,360 C-90,390 -90,440 -120,470 L-420,780 Z" fill="${sleeve}" ${o}/>
    <path d="M-620,640 L-330,330 C-320,320 -300,312 -280,308 L-520,700 Z" fill="${sleeveSh}"/>
    <path d="M-330,330 C-300,300 -250,290 -210,300 L-120,360 C-90,390 -90,440 -120,470 C-170,420 -260,380 -330,330 Z" fill="${L.acc}" ${o}/>
    <path d="M-220,300 C-160,250 -120,230 -60,230 L-20,330 C-60,380 -110,400 -150,400 Z" fill="${sk}" ${o}/>`;
  // Dos de la main (masse principale)
  s += `<path d="M-200,-60 C-200,-150 -120,-190 0,-190 C120,-190 210,-150 210,-50 L200,150 C190,230 120,270 20,270 C-90,270 -190,230 -200,140 Z" fill="${sk}" ${o}/>`;
  // 4 doigts repliés : 1re rangée (phalanges du haut)
  const fingers = [-150, -50, 50, 150];
  fingers.forEach((x, i) => {
    const h = i === 0 || i === 3 ? 108 : 118;
    s += `<path d="M${x - 48},-150 C${x - 50},-200 ${x + 50},-200 ${x + 48},-150 L${x + 46},${-150 + h} C${x + 30},${-150 + h + 22} ${x - 30},${-150 + h + 22} ${x - 46},${-150 + h} Z" fill="${sk}" ${o}/>
      <path d="M${x - 30},-170 C${x - 10},-184 ${x + 10},-184 ${x + 30},-170" stroke="${skHi}" stroke-width="10" fill="none" opacity=".75"/>
      <path d="M${x - 40},${-150 + h - 12} C${x - 20},${-150 + h + 4} ${x + 20},${-150 + h + 4} ${x + 40},${-150 + h - 12}" stroke="${skSh}" stroke-width="12" fill="none" opacity=".7"/>`;
  });
  // 2e rangée (phalanges repliées dans la paume)
  fingers.forEach((x) => {
    s += `<path d="M${x - 44},-10 C${x - 44},-30 ${x + 44},-30 ${x + 44},-10 L${x + 42},60 C${x + 28},80 ${x - 28},80 ${x - 42},60 Z" fill="${sk}" ${o}/>
      <path d="M${x - 34},50 C${x - 16},64 ${x + 16},64 ${x + 34},50" stroke="${skSh}" stroke-width="10" fill="none" opacity=".7"/>`;
  });
  // Pouce replié en travers, devant
  s += `<path d="M-215,40 C-230,110 -160,160 -60,150 C30,140 80,120 96,96 C110,70 90,52 60,58 C10,68 -60,74 -110,60 C-150,48 -190,20 -215,40 Z" fill="${sk}" ${o}/>
    <path d="M-200,70 C-170,120 -100,138 -40,132" stroke="${skSh}" stroke-width="14" fill="none" opacity=".6"/>
    <path d="M30,74 C50,70 70,72 84,84" stroke="${INK}" stroke-width="5" fill="none"/>
    <path d="M150,-140 C190,-100 200,-20 196,60" stroke="${skHi}" stroke-width="12" fill="none" opacity=".55"/>`;
  return { svg: `<g>${s}</g>`, head: [0, -200], top: -200 };
}

/**
 * PIEDS qui courent (gros plan sur les baskets, poussière, mouvement).
 * Repère : le sol est en y = 0.
 */
export function piedsSVG(of = 'kai') {
  const L = lookOf(of);
  const o = `stroke="${INK}" stroke-width="5" stroke-linejoin="round"`;
  const leg = L.skirt ? L.skin : L.pants;
  const legSh = shadeHex(leg, -0.4);
  const shoe = (x, y, rot, lifted) => `<g transform="translate(${x},${y}) rotate(${rot})">
    <path d="M-120,-60 Q-60,-110 10,-80 L170,-20 Q220,0 210,50 L-120,50 Z" fill="${L.shoes}" ${o}/>
    <path d="M-120,38 L210,38" stroke="${L.sole}" stroke-width="22"/>
    <path d="M-30,-70 L10,-30 M10,-84 L50,-40 M50,-70 L84,-30" stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    <path d="M-110,-40 Q-60,-70 0,-60" stroke="#fff" stroke-width="8" fill="none" opacity=".5"/>
    ${lifted ? '' : '<ellipse cx="40" cy="60" rx="180" ry="18" fill="#000" opacity=".25"/>'}</g>`;
  const svg = `<g>
    <path d="M-330,-700 C-320,-500 -300,-300 -260,-120 L-90,-120 C-120,-300 -150,-500 -160,-700 Z" fill="${leg}" ${o}/>
    <path d="M-330,-700 C-320,-500 -300,-300 -260,-120 L-210,-120 C-240,-300 -260,-500 -270,-700 Z" fill="${legSh}"/>
    ${shoe(-180, -60, 0, false)}
    <path d="M120,-760 C150,-600 200,-470 250,-360 L400,-430 C340,-540 300,-650 290,-760 Z" fill="${leg}" ${o}/>
    ${shoe(330, -390, -28, true)}
    <path d="M60,-300 l-200,0 M80,-250 l-260,0 M40,-200 l-160,0" stroke="${INK}" stroke-width="6" stroke-linecap="round" opacity=".55"/>
    <g fill="#c9b79a" opacity=".8"><circle cx="-420" cy="-20" r="40"/><circle cx="-500" cy="-60" r="28"/><circle cx="-560" cy="-10" r="22"/><circle cx="-360" cy="-50" r="24"/></g>
  </g>`;
  return { svg, head: [0, -700], top: -760 };
}
