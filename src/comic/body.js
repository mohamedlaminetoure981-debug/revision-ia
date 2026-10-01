// =====================================================================
// body.js — PERSONNAGES EN PIED (pantins SVG articulés à calques)
// ---------------------------------------------------------------------
// Squelette 2D : bassin → buste → cou → tête, épaules → bras → avant-bras
// → mains, hanches → cuisses → tibias → pieds. Une POSE (data/comic/poses.js)
// donne l'angle de chaque segment ; on calcule la position des articulations
// puis on dessine chaque membre comme une forme galbée (muscle) avec :
//   - un encrage épais qui se fond aux articulations (pas de "coutures"),
//   - une ombre franche (lumière venant d'en haut à droite) + un reflet.
// La TÊTE est exactement celle du portrait (ui/character.js → characterParts).
//
// Unités : 1 tête ≈ 100 ; personnage debout ≈ 7 têtes (≈ 700) ;
// origine (0,0) au SOL, sous le bassin. y vers le bas.
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { characterParts, shade } from '../ui/character.js';
import { BODY_LOOKS, EXTRA_LOOKS } from '../data/comic/looks.js';
import { POSES } from '../data/comic/poses.js';

export const INK = '#120b09';
const LW = 3.4; // épaisseur de l'encrage des corps
const TORSO = 196; // bassin → base du cou
const NECK = 26;
const ARM = [140, 128]; // haut du bras, avant-bras
const LEG = [186, 178]; // cuisse, tibia
const ANKLE = 18; // cheville → sol
const HEAD_ANCHOR = [100, 140]; // point du portrait posé en haut du cou
const HEAD_SCALE = 1.16; // tête un peu plus grande que le portrait : ≈ 6,8 têtes de haut

// --- Petits outils de géométrie --------------------------------------
const rad = (d) => (d * Math.PI) / 180;
const dirOf = (a) => [Math.sin(rad(a)), Math.cos(rad(a))]; // 0° = vers le bas
const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
const f = (n) => Math.round(n * 10) / 10;
const pt = (p) => `${f(p[0])},${f(p[1])}`;
/** Tourne un point autour de l'origine (degrés, sens horaire à l'écran). */
const rot = (p, a) => { const c = Math.cos(rad(a)); const s = Math.sin(rad(a)); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };

/** Mélange deux couleurs hex. */
export function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const c = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
}

/**
 * Forme galbée d'un segment de membre, de A (rayon ra) à B (rayon rb).
 * bulge > 1 : muscle plus marqué au milieu.
 */
function segPath(A, B, ra, rb, bulge = 1.06) {
  const dx = B[0] - A[0];
  const dy = B[1] - A[1];
  const len = Math.hypot(dx, dy) || 1;
  const d = [dx / len, dy / len];
  const n = [-d[1], d[0]];
  const p1 = add(A, n, ra); const p2 = add(B, n, rb);
  const p3 = add(B, n, -rb); const p4 = add(A, n, -ra);
  const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const rm = ((ra + rb) / 2) * bulge;
  const c1 = add(add(mid, n, rm * 2), [(p1[0] + p2[0]) / 2 - mid[0], (p1[1] + p2[1]) / 2 - mid[1]], -1);
  const c2 = add(add(mid, n, -rm * 2), [(p3[0] + p4[0]) / 2 - mid[0], (p3[1] + p4[1]) / 2 - mid[1]], -1);
  return `M${pt(p1)} Q${pt(c1)} ${pt(p2)} A${f(rb)},${f(rb)} 0 0 0 ${pt(p3)} Q${pt(c2)} ${pt(p4)} A${f(ra)},${f(ra)} 0 0 0 ${pt(p1)} Z`;
}

/** Ombre (côté opposé à la lumière) et reflet d'un segment. */
function segShade(A, B, ra, rb, shadow, light) {
  const dx = B[0] - A[0];
  const dy = B[1] - A[1];
  const len = Math.hypot(dx, dy) || 1;
  let n = [-dy / len, dx / len];
  // Lumière en haut à droite → ombre vers la gauche et le bas.
  if (n[0] * -0.7 + n[1] * 0.7 < 0) n = [-n[0], -n[1]];
  const A1 = add(A, n, ra * 0.5); const B1 = add(B, n, rb * 0.5);
  let s = `<path d="${segPath(A1, B1, ra * 0.5, rb * 0.5, 1.04)}" fill="${shadow}"/>`;
  if (light) s += `<path d="M${pt(add(A, n, -ra * 0.55))} L${pt(add(B, n, -rb * 0.55))}" stroke="${light}" stroke-width="${f(Math.max(2, ra * 0.22))}" stroke-linecap="round" opacity=".55"/>`;
  return s;
}

/** Un membre complet : encrage commun + couleurs + ombres (pas de couture aux articulations). */
function limb(parts) {
  let ink = '';
  let fill = '';
  let shading = '';
  for (const p of parts) {
    const d = p.d || segPath(p.A, p.B, p.ra, p.rb, p.bulge);
    ink += `<path d="${d}" fill="${INK}" stroke="${INK}" stroke-width="${LW * 2}" stroke-linejoin="round"/>`;
    fill += `<path d="${d}" fill="${p.fill}"/>`;
    if (p.A && p.shadow) shading += segShade(p.A, p.B, p.ra, p.rb, p.shadow, p.light);
    if (p.extra) shading += p.extra;
  }
  return ink + fill + shading;
}

/** Couleurs d'un perso (portrait + tenue corps entier). */
function colors(id, grade) {
  const X = EXTRA_LOOKS[id];
  const ch = X ? { color: X.top2, look: { skin: X.skin, hairColor: X.hair, outfit: X.outfit, outfitColor: X.top, outfitColor2: X.top2, accessories: [] } } : CHARACTERS[id];
  const L = ch.look;
  const B = X || BODY_LOOKS[id] || BODY_LOOKS.kai;
  const g = grade || ((c) => c);
  const sk = L.skin;
  return {
    skin: g(sk), skinSh: g(shade(sk, -0.3)), skinHi: g(shade(sk, 0.25)),
    main: g(L.outfitColor), mainSh: g(shade(L.outfitColor, -0.38)), mainHi: g(shade(L.outfitColor, 0.3)),
    acc: g(L.outfitColor2), accSh: g(shade(L.outfitColor2, -0.35)),
    pants: g(B.pants), pantsSh: g(shade(B.pants, -0.4)), pantsHi: g(shade(B.pants, 0.25)),
    shoes: g(B.shoes), shoesSh: g(shade(B.shoes, -0.3)), sole: g(B.sole),
    skirt: B.skirt && g(B.skirt), skirt2: B.skirt2 && g(B.skirt2), skirtSh: B.skirt && g(shade(B.skirt, -0.35)),
    stripe: B.stripe && g(B.stripe), hair: g(L.hairColor), hairRaw: L.hairColor,
    color: g(ch.color), build: B.build, outfit: L.outfit, accs: new Set(L.accessories || []),
  };
}

// ---------------------------------------------------------------------
// Mains et pieds
// ---------------------------------------------------------------------
function hand(W, a, type, C, prop) {
  if (type === 'none') return '';
  const g = (body) => `<g transform="translate(${pt(W)}) rotate(${f(-a)}) scale(1.3)">${body}</g>`;
  const o = `stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"`;
  let s;
  if (type === 'fist') {
    s = `<rect x="-14" y="-2" width="28" height="27" rx="10" fill="${C.skin}" ${o}/>
      <path d="M-14,9 Q-2,13 6,8" fill="none" stroke="${INK}" stroke-width="1.6"/>
      <path d="M-6,4 L-6,10 M2,4 L2,11 M9,4 L9,10" stroke="${C.skinSh}" stroke-width="2" stroke-linecap="round"/>
      <path d="M-14,4 Q-14,22 -2,24" fill="none" stroke="${C.skinSh}" stroke-width="3" opacity=".7"/>`;
  } else if (type === 'point') {
    s = `<rect x="-12" y="-2" width="24" height="23" rx="9" fill="${C.skin}" ${o}/>
      <path d="M3,16 L4,46 Q4,51 8,50 Q11,49 11,44 L11,16 Z" fill="${C.skin}" ${o}/>
      <path d="M-12,10 Q-4,14 3,10" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
  } else { // main ouverte
    s = `<path d="M-12,0 L-14,22 Q-14,34 -6,38 L8,38 Q14,34 14,24 L12,0 Z" fill="${C.skin}" ${o}/>
      <path d="M-12,8 Q-24,16 -20,24 Q-16,26 -12,20" fill="${C.skin}" ${o}/>
      <path d="M-5,26 L-5,37 M2,27 L2,38 M8,26 L8,36" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-12,4 L-13,24" stroke="${C.skinSh}" stroke-width="4" opacity=".6"/>`;
  }
  if (prop === 'phone') s += `<rect x="-11" y="-30" width="24" height="44" rx="5" fill="#15151c" ${o}/><rect x="-8" y="-27" width="18" height="36" rx="3" fill="#8be9ff" opacity=".9"/><rect x="-6" y="-24" width="12" height="3" fill="#fff" opacity=".9"/>`;
  if (prop === 'book') s += `<rect x="-26" y="10" width="52" height="38" rx="3" fill="${C.color}" ${o}/><path d="M0,10 L0,48" stroke="${INK}" stroke-width="2"/>`;
  if (prop === 'notebook') s += `<rect x="-22" y="8" width="40" height="52" rx="2" fill="#f4f1e8" ${o}/><path d="M-16,20 L12,20 M-16,28 L12,28 M-16,36 L8,36" stroke="#8aa" stroke-width="1.5"/>`;
  return g(s);
}

function foot(A, side, C, mode, flipX) {
  const o = `stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"`;
  if (mode === 'front') {
    const dx = side * 4;
    return `<path d="M${f(A[0] - 17 + dx)},${f(A[1] - 4)} Q${f(A[0] + dx)},${f(A[1] - 14)} ${f(A[0] + 17 + dx)},${f(A[1] - 4)} L${f(A[0] + 20 + dx)},${f(A[1] + 14)} Q${f(A[0] + dx)},${f(A[1] + 22)} ${f(A[0] - 20 + dx)},${f(A[1] + 14)} Z" fill="${C.shoes}" ${o}/>
      <path d="M${f(A[0] - 20 + dx)},${f(A[1] + 12)} Q${f(A[0] + dx)},${f(A[1] + 20)} ${f(A[0] + 20 + dx)},${f(A[1] + 12)}" stroke="${C.sole}" stroke-width="4" fill="none"/>`;
  }
  // Basket de profil (pointe vers la droite)
  const x = A[0];
  const y = A[1];
  return `<path d="M${f(x - 16)},${f(y - 8)} Q${f(x - 4)},${f(y - 16)} ${f(x + 10)},${f(y - 8)} L${f(x + 40)},${f(y + 4)} Q${f(x + 50)},${f(y + 8)} ${f(x + 48)},${f(y + 16)} L${f(x - 16)},${f(y + 16)} Z" fill="${C.shoes}" ${o}/>
    <path d="M${f(x - 16)},${f(y + 12)} L${f(x + 48)},${f(y + 12)}" stroke="${C.sole}" stroke-width="5"/>
    <path d="M${f(x + 2)},${f(y - 6)} L${f(x + 14)},${f(y + 2)} M${f(x + 10)},${f(y - 9)} L${f(x + 22)},${f(y - 1)}" stroke="${C.shoesSh}" stroke-width="2"/>`;
}

// ---------------------------------------------------------------------
// Buste (dessiné dans son repère : bassin en 0,0, cou en 0,-TORSO)
// ---------------------------------------------------------------------
function torsoShape(C, sw, back) {
  const f2 = C.build === 'f';
  const W = sw + 15; // épaule extérieure
  const ww = f2 ? 42 : 52; // taille
  const hw = f2 ? 54 : 54; // bas de la veste
  const top = -TORSO;
  const path = `M${-W},${top + 22} Q${-W + 2},${top + 6} ${-sw + 2},${top + 2} L${sw - 2},${top + 2} Q${W - 2},${top + 6} ${W},${top + 22}
    L${W - 6},${top + 70} Q${ww + 6},${-80} ${ww},${-40} L${hw},${16} Q0,${24} ${-hw},${16} L${-ww},${-40} Q${-ww - 6},${-80} ${-W + 6},${top + 70} Z`;
  const shadowP = `M${-W},${top + 22} Q${-W + 2},${top + 6} ${-sw + 2},${top + 2} L${-sw + 26},${top + 4} Q${-ww + 18},${-90} ${-hw + 22},${16} L${-hw},${16} L${-ww},${-40} Q${-ww - 6},${-80} ${-W + 6},${top + 70} Z`;
  let det = '';
  const o = `stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"`;
  if (!back) {
    if (C.outfit === 'hoodie') {
      det += `<path d="M-38,${top + 6} Q0,${top + 40} 38,${top + 6} Q30,${top + 26} 0,${top + 34} Q-30,${top + 26} -38,${top + 6} Z" fill="${C.mainSh}" stroke="${INK}" stroke-width="2.2"/>
        <path d="M-9,${top + 28} L-12,${top + 72} M9,${top + 28} L12,${top + 72}" stroke="${C.acc}" stroke-width="3" stroke-linecap="round"/>
        <path d="M-34,-58 L34,-58 L40,-6 L-40,-6 Z" fill="${C.mainSh}" opacity=".55" stroke="${INK}" stroke-width="2"/>
        <path d="M-26,-58 L-30,-20 M26,-58 L30,-20" ${o} opacity=".5"/>`;
    } else if (C.outfit === 'jacket') {
      det += `<path d="M-22,${top} L-26,${top - 18} L0,${top + 6} L26,${top - 18} L22,${top}" fill="${C.main}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M0,${top + 6} L0,14" stroke="${INK}" stroke-width="2.4"/><path d="M3,${top + 6} L3,14" stroke="${C.acc}" stroke-width="1.6" opacity=".9"/>
        <path d="M${-sw},${top + 18} Q-20,${top + 60} -14,10 M${sw},${top + 18} Q20,${top + 60} 14,10" stroke="${C.acc}" stroke-width="2.4" fill="none"/>
        <rect x="16" y="${top + 50}" width="22" height="16" rx="2" fill="${C.mainSh}" stroke="${INK}" stroke-width="1.6"/>`;
    } else if (C.outfit === 'cardigan') {
      det += `<path d="M-20,${top + 2} Q0,${top + 30} 20,${top + 2} L26,14 Q0,20 -26,14 Z" fill="${C.acc}" stroke="${INK}" stroke-width="2"/>
        <path d="M-20,${top + 2} L-24,14 M20,${top + 2} L24,14" stroke="${C.mainHi}" stroke-width="2" opacity=".7"/>
        <path d="M-20,${top + 2} Q0,${top + 30} 20,${top + 2}" ${o}/>
        <circle cx="-30" cy="${top + 80}" r="3" fill="${C.acc}" stroke="${INK}" stroke-width="1.2"/><circle cx="-32" cy="${top + 120}" r="3" fill="${C.acc}" stroke="${INK}" stroke-width="1.2"/>`;
    } else if (C.outfit === 'bomber') {
      det += `<path d="M-30,${top + 2} Q0,${top + 26} 30,${top + 2} L28,${top + 12} Q0,${top + 36} -28,${top + 12} Z" fill="${C.acc}" stroke="${INK}" stroke-width="2"/>
        <path d="M0,${top + 26} L0,4" stroke="${INK}" stroke-width="2.4"/>
        <path d="M${-hw},2 Q0,12 ${hw},2 L${hw},16 Q0,26 ${-hw},16 Z" fill="${C.acc}" stroke="${INK}" stroke-width="2"/>
        <path d="M${-hw + 6},8 Q0,18 ${hw - 6},8" stroke="${C.accSh}" stroke-width="1.5" fill="none"/>
        <path d="M-26,${top + 40} Q-30,${top + 90} -24,-10 M26,${top + 40} Q30,${top + 90} 24,-10" ${o} opacity=".45"/>`;
    } else if (C.outfit === 'track') {
      det += `<path d="M-18,${top - 14} L18,${top - 14} L20,${top + 14} L-20,${top + 14} Z" fill="${C.main}" stroke="${INK}" stroke-width="2.2"/>
        <path d="M0,${top - 14} L0,14" stroke="${INK}" stroke-width="2.4"/>
        <path d="M${-sw - 4},${top + 10} Q-30,${top + 14} -20,${top + 4} M${sw + 4},${top + 10} Q30,${top + 14} 20,${top + 4}" stroke="${C.acc}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <rect x="-4" y="${top + 12}" width="8" height="12" rx="2" fill="#d9d9e3" stroke="${INK}" stroke-width="1.2"/>`;
    }
    // Accessoires portés au cou
    if (C.accs.has('headphones')) det += `<path d="M-30,${top - 4} Q0,${top + 26} 30,${top - 4}" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-30,${top - 4} Q0,${top + 26} 30,${top - 4}" stroke="#2b2a33" stroke-width="5" fill="none" stroke-linecap="round"/>
      <rect x="-44" y="${top - 12}" width="18" height="26" rx="7" fill="#1d1c24" stroke="${INK}" stroke-width="2.2"/><rect x="26" y="${top - 12}" width="18" height="26" rx="7" fill="#1d1c24" stroke="${INK}" stroke-width="2.2"/>
      <rect x="-40" y="${top - 8}" width="9" height="17" rx="3" fill="${C.color}"/><rect x="31" y="${top - 8}" width="9" height="17" rx="3" fill="${C.color}"/>`;
    if (C.accs.has('chain')) det += `<path d="M-20,${top + 8} Q0,${top + 50} 20,${top + 8}" stroke="${INK}" stroke-width="4.4" fill="none"/><path d="M-20,${top + 8} Q0,${top + 50} 20,${top + 8}" stroke="#dcdce6" stroke-width="2.4" stroke-dasharray="4 2" fill="none"/>`;
    if (C.accs.has('whistle')) det += `<path d="M-14,${top + 8} L4,${top + 52} M14,${top + 8} L6,${top + 52}" stroke="${C.color}" stroke-width="2" fill="none"/><rect x="-2" y="${top + 50}" width="20" height="12" rx="5" fill="#d9d9e3" stroke="${INK}" stroke-width="2"/>`;
  } else if (C.outfit === 'hoodie') {
    det += `<path d="M-40,${top + 4} Q-44,${top + 70} 0,${top + 84} Q44,${top + 70} 40,${top + 4} Z" fill="${C.mainSh}" stroke="${INK}" stroke-width="2.2"/>`;
  } else if (C.outfit === 'bomber') {
    det += `<path d="M${-hw},2 Q0,12 ${hw},2 L${hw},16 Q0,26 ${-hw},16 Z" fill="${C.acc}" stroke="${INK}" stroke-width="2"/>`;
  }
  return `<path d="${path}" fill="${C.main}"/><path d="${shadowP}" fill="${C.mainSh}"/>
    <path d="M${W - 10},${top + 30} Q${ww + 4},${-90} ${ww - 6},${-30}" stroke="${C.mainHi}" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
    ${det}<path d="${path}" fill="none" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
}

let skirtId = 0;
/** Jupe longue façon pagne (motif wax simple). */
function skirt(Hl, Hr, Kl, Kr, Sl, Sr, C) {
  // Ourlet à mi-mollet, mais le tissu ne s'écarte pas plus que ~90 de chaque côté.
  const clampX = (x, side) => (side < 0 ? Math.max(x, Hl[0] - 90) : Math.min(x, Hr[0] + 90));
  const hemL = [clampX(Kl[0] + (Sl[0] - Kl[0]) * 0.55 - 16, -1), Kl[1] + (Sl[1] - Kl[1]) * 0.55];
  const hemR = [clampX(Kr[0] + (Sr[0] - Kr[0]) * 0.55 + 16, 1), Kr[1] + (Sr[1] - Kr[1]) * 0.55];
  const top = Math.min(Hl[1], Hr[1]) - 26;
  const d = `M${f(Hl[0] - 18)},${f(top)} L${f(Hr[0] + 18)},${f(top)} Q${f(Hr[0] + 30)},${f((top + hemR[1]) / 2)} ${pt(hemR)} Q${f((hemL[0] + hemR[0]) / 2)},${f(Math.max(hemL[1], hemR[1]) + 14)} ${pt(hemL)} Q${f(Hl[0] - 30)},${f((top + hemL[1]) / 2)} ${f(Hl[0] - 18)},${f(top)} Z`;
  const cid = `sk${++skirtId}`;
  let motif = '';
  for (let i = 0; i < 4; i++) {
    const y = top + 30 + i * ((Math.max(hemL[1], hemR[1]) - top - 30) / 4);
    motif += `<path d="M${f(hemL[0] + 6)},${f(y)} L${f(hemR[0] - 6)},${f(y)}" stroke="${C.skirt2}" stroke-width="3" stroke-dasharray="10 8" opacity=".9"/>`;
  }
  return `<path d="${d}" fill="${C.skirt}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>
    <clipPath id="${cid}"><path d="${d}"/></clipPath><g clip-path="url(#${cid})">${motif}</g>
    <path d="M${f(Hl[0] - 10)},${f(top + 10)} Q${f(hemL[0] + 10)},${f(hemL[1] - 60)} ${f(hemL[0] + 20)},${f(hemL[1])}" stroke="${C.skirtSh}" stroke-width="10" fill="none" opacity=".6"/>`;
}

// ---------------------------------------------------------------------
// Le personnage complet
// ---------------------------------------------------------------------
/**
 * SVG (contenu de <g>) d'un personnage en pied, pieds au sol en (0,0).
 * @param {string} id     kai, mory, nia, sora, ren, awa, tidiane, binta
 * @param {string|object} poseName  nom de pose (data/comic/poses.js) ou objet pose
 * @param {object} [o]    { expr, grade (fonction couleur), aura }
 * @returns {{ svg, head: [x,y], top }}  head = centre de la tête (pour les bulles)
 */
export function bodySVG(id, poseName = 'debout', o = {}) {
  const pose = typeof poseName === 'string' ? (POSES[poseName] || POSES.debout) : poseName;
  const C = colors(id, o.grade);
  const fem = C.build === 'f';
  const k = pose.k || 0;
  const wf = 1 - 0.42 * k;
  const SW = (fem ? 58 : 72) * wf;
  const HW = (fem ? 30 : 26) * wf;
  const t = pose.t || 0;
  const back = pose.view === 'back';

  // --- Articulations (repère : bassin en 0,0) ---
  const P = [0, 0];
  const up = rot([0, -1], t);
  const N = add(P, up, TORSO);
  // Contrapposto : épaules et bassin s'inclinent en sens opposé (pose plus vivante).
  const shoulder = (s) => add(N, rot([s * SW, 26], t + (pose.s || 0)));
  const hip = (s) => rot([s * HW, 8], t * 0.35 + (pose.p || 0));
  const Sl = shoulder(-1); const Sr = shoulder(1);
  const Hl = hip(-1); const Hr = hip(1);
  const chain = (start, angles, lens) => {
    const pts = [start];
    angles.forEach((a, i) => pts.push(add(pts[i], dirOf(a), lens[i])));
    return pts;
  };
  const [, El, Wl] = chain(Sl, pose.al || [0, 0], ARM);
  const [, Er, Wr] = chain(Sr, pose.ar || [0, 0], ARM);
  const [, Kl, Al] = chain(Hl, pose.ll || [0, 0], LEG);
  const [, Kr, Ar] = chain(Hr, pose.lr || [0, 0], LEG);
  const neckTop = add(N, rot([0, -1], t + (pose.h || 0) * 0.5), NECK);

  // --- Rayons des membres (silhouette homme / femme) ---
  const r = fem
    ? { ua: [19, 14], fa: [15, 10], th: [31, 18], sh: [19, 11] }
    : { ua: [24, 17], fa: [19, 12], th: [33, 21], sh: [22, 13] };

  const armParts = (S, E, W, a) => C.outfit === 'tee' ? [
    // T-shirt : manche courte, bras nus
    { A: S, B: E, ra: r.ua[0] - 2, rb: r.ua[1], fill: C.skin, shadow: C.skinSh, light: C.skinHi, bulge: 1.1,
      extra: `<path d="${segPath(S, add(S, [E[0] - S[0], E[1] - S[1]], 0.55), r.ua[0] + 2, r.ua[1] + 4, 1)}" fill="${C.main}" stroke="${INK}" stroke-width="2.2"/>` },
    { A: E, B: W, ra: r.fa[0], rb: r.fa[1], fill: C.skin, shadow: C.skinSh, light: C.skinHi },
  ] : [
    { A: S, B: E, ra: r.ua[0], rb: r.ua[1] + 2, fill: C.main, shadow: C.mainSh, light: C.mainHi, bulge: 1.1 },
    { A: E, B: W, ra: r.fa[0] + 2, rb: r.fa[1] + 2, fill: C.main, shadow: C.mainSh, light: C.mainHi,
      extra: `<path d="${segPath(add(E, [W[0] - E[0], W[1] - E[1]], 0.82), W, r.fa[1] + 3, r.fa[1] + 3, 1)}" fill="${C.outfit === 'cardigan' || C.outfit === 'hoodie' ? C.mainSh : C.acc}" stroke="${INK}" stroke-width="2"/>`
        + (C.outfit === 'track' || C.outfit === 'jacket' ? `<path d="M${pt(S)} L${pt(E)} L${pt(add(E, [W[0] - E[0], W[1] - E[1]], 0.8))}" stroke="${C.acc}" stroke-width="3.4" fill="none" stroke-linejoin="round" opacity=".95"/>` : '') },
  ];
  const legParts = (H, K, A) => [
    { A: H, B: K, ra: r.th[0], rb: r.th[1] + 1, fill: C.pants, shadow: C.pantsSh, light: C.pantsHi, bulge: 1.08,
      extra: C.stripe ? `<path d="M${pt(H)} L${pt(K)}" stroke="${C.stripe}" stroke-width="4"/>` : '' },
    { A: K, B: A, ra: r.sh[0] + 2, rb: r.sh[1] + 4, fill: C.pants, shadow: C.pantsSh, light: C.pantsHi, bulge: 1.02,
      extra: (C.stripe ? `<path d="M${pt(K)} L${pt(A)}" stroke="${C.stripe}" stroke-width="4"/>` : '')
        + `<path d="M${pt(add(K, [A[0] - K[0], A[1] - K[1]], -0.08))} q6,10 0,18" stroke="${INK}" stroke-width="1.6" fill="none" opacity=".6"/>` },
  ];

  const footMode = pose.feet || 'front';
  const drawArm = (side) => {
    const S = side < 0 ? Sl : Sr; const E = side < 0 ? El : Er; const W = side < 0 ? Wl : Wr;
    const ang = (side < 0 ? pose.al : pose.ar)?.[1] ?? 0;
    const ht = side < 0 ? pose.hl : pose.hr;
    return `<g class="arm">${limb(armParts(S, E, W, ang))}${hand(W, ang, ht || 'open', C, side > 0 ? pose.prop : null)}</g>`;
  };
  const drawLeg = (side) => {
    const H = side < 0 ? Hl : Hr; const K = side < 0 ? Kl : Kr; const A = side < 0 ? Al : Ar;
    if (C.skirt) { // jupe : tibias nus sous l'ourlet
      return `<g class="leg">${limb([{ A: K, B: A, ra: r.sh[0], rb: r.sh[1], fill: C.skin, shadow: C.skinSh, light: C.skinHi }])}${foot(A, side, C, footMode)}</g>`;
    }
    return `<g class="leg">${limb(legParts(H, K, A))}${foot(A, side, C, footMode)}</g>`;
  };
  const behind = new Set(pose.back || []);

  // --- Tête (portrait de l'équipe, ou tête simple pour les figurants) ---
  const parts = EXTRA_LOOKS[id] ? extraHead(EXTRA_LOOKS[id], o.expr) : characterParts(id, o.expr || 'neutre');
  const g = o.grade || ((c) => c);
  const recolor = (s) => (o.grade ? s.replace(/#[0-9a-fA-F]{6}\b/g, (c) => (c.toLowerCase() === INK ? c : g(c))) : s);
  const headAngle = t + (pose.h || 0);
  const headT = `translate(${pt(neckTop)}) rotate(${f(headAngle)}) scale(${HEAD_SCALE}) translate(${-HEAD_ANCHOR[0]},${-HEAD_ANCHOR[1]})`;
  let head;
  if (back && !pose.turnHead) {
    // Vu de dos : arrière de la tête (cheveux) + nuque
    head = `<g transform="${headT}">${recolor(parts.back)}<path d="M70,90 C70,58 86,46 100,46 C114,46 130,58 130,90 L128,120 Q100,140 72,120 Z" fill="${C.hair}" stroke="${INK}" stroke-width="2.8"/><path d="M78,70 Q100,58 122,70" stroke="${shade(C.hairRaw || '#222222', 0.25)}" stroke-width="3" fill="none" opacity=".6"/></g>`;
  } else {
    head = `<g transform="${headT}">${recolor(parts.back)}${recolor(parts.head)}${recolor(parts.fx)}</g>`;
  }
  const neck = limb([{ A: N, B: neckTop, ra: fem ? 14 : 17, rb: fem ? 13 : 16, fill: C.skin, shadow: C.skinSh }]);

  // --- Assemblage (ordre des calques) ---
  const torso = `<g transform="rotate(${f(t)}) scale(${f(wf)},1)">${torsoShape(C, SW / wf, back)}</g>`;
  const pelvis = C.skirt
    ? skirt(Hl, Hr, Kl, Kr, Al, Ar, C)
    : `<path d="M${f(Hl[0] - 22)},${f(Hl[1] - 30)} L${f(Hr[0] + 22)},${f(Hr[1] - 30)} L${f(Hr[0] + 20)},${f(Hr[1] + 10)} Q0,46 ${f(Hl[0] - 20)},${f(Hl[1] + 10)} Z" fill="${C.pants}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
  const legsBack = ['ll', 'lr'].filter((x) => behind.has(x));
  const legsFront = ['ll', 'lr'].filter((x) => !behind.has(x));
  const armsBack = ['al', 'ar'].filter((x) => behind.has(x));
  const armsFront = ['al', 'ar'].filter((x) => !behind.has(x));
  const side = (x) => (x.endsWith('l') ? -1 : 1);
  // Bras croisés : on dessine en dernier le bras indiqué par `front`.
  armsFront.sort((a) => (pose.front === a ? 1 : -1));

  let body = '';
  if (back) {
    // De dos : les bras et la tête passent derrière… sauf la tête, au-dessus du buste.
    body = [...['ll', 'lr'].map((x) => drawLeg(side(x))), pelvis, ...['al', 'ar'].map((x) => drawArm(side(x))), neck, torso, head].join('');
  } else {
    body = [
      ...armsBack.map((x) => drawArm(side(x))),
      ...legsBack.map((x) => drawLeg(side(x))),
      C.skirt ? '' : pelvis,
      ...legsFront.map((x) => drawLeg(side(x))),
      C.skirt ? pelvis : '',
      neck, torso, head,
      ...armsFront.map((x) => drawArm(side(x))),
    ].join('');
  }

  // --- Mise au sol : le pied le plus bas touche y = 0 (ou bassin posé si assis) ---
  const lowest = Math.max(Al[1], Ar[1]) + ANKLE;
  let dy = pose.seat ? -Math.max(Hl[1], Hr[1]) - 30 : -lowest;
  dy -= pose.air || 0;
  const rotAll = pose.rot || 0;
  const scale = BODY_LOOKS[id]?.height || 1;
  const svg = `<g transform="scale(${scale}) translate(0,${f(dy)}) rotate(${rotAll})">${body}</g>`;
  // Centre de la tête (pour pointer les bulles)
  // Repères pour le cadrage et les bulles : yeux et sommet de la tête.
  const eyes = rot(add(neckTop, rot([0, -1], headAngle), 43), rotAll);
  const crown = rot(add(neckTop, rot([0, -1], headAngle), 136), rotAll);
  const P2 = (q) => [q[0] * scale, (q[1] + dy) * scale];
  return { svg, head: P2(eyes), top: P2(crown)[1], crown: P2(crown) };
}

/** Hauteur de référence d'un perso debout (pour le cadrage). */
export const FIGURE_HEIGHT = 720;


// ---------------------------------------------------------------------
// Tête simple des figurants (même repère que les portraits 200 × 232)
// ---------------------------------------------------------------------
function extraHead(X, expr = 'neutre') {
  const sk = X.skin; const skSh = shade(sk, -0.3); const hair = X.hair;
  const face = 'M72,86 C72,66 84,56 100,56 C116,56 128,66 128,86 L129,104 C129,116 124,126 117,133 L106,144 Q100,148 94,144 L83,133 C76,126 71,116 71,104 Z';
  const o = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"`;
  let back = ''; let top = '';
  if (X.hairStyle === 'tresses') back = `<path d="M70,80 Q60,140 72,176 L86,176 Q78,130 84,84 Z M130,80 Q140,140 128,176 L114,176 Q122,130 116,84 Z" fill="${hair}" ${o}/>`;
  if (X.hairStyle === 'chignon') back = `<circle cx="100" cy="44" r="18" fill="${hair}" ${o}/>`;
  if (X.hairStyle === 'foulard') top = `<path d="M66,92 Q60,36 100,32 Q140,36 134,92 Q118,70 100,70 Q82,70 66,92 Z" fill="${X.wrap}" ${o}/><path d="M118,40 Q146,30 150,52 Q136,48 124,56 Z" fill="${X.wrap}" ${o}/><path d="M74,66 Q100,52 126,66" stroke="${shade(X.wrap, -0.35)}" stroke-width="3" fill="none"/>`;
  else if (X.hairStyle === 'casquette') top = `<path d="M70,80 Q70,46 100,44 Q130,46 130,80 Z" fill="${X.cap}" ${o}/><path d="M118,74 L156,80 L122,84 Z" fill="${shade(X.cap, -0.2)}" ${o}/>`;
  else top = `<path d="M71,84 Q70,54 100,52 Q130,54 129,84 Q118,70 100,70 Q82,70 71,84 Z" fill="${hair}" ${o}/>`;
  const happy = expr === 'joie' || expr === 'celebration';
  const shock = expr === 'surprise';
  const eyes = shock
    ? `<circle cx="88" cy="103" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="112" cy="103" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="88" cy="103" r="2" fill="${INK}"/><circle cx="112" cy="103" r="2" fill="${INK}"/>`
    : `<path d="M80,103 Q88,${happy ? 97 : 99} 95,103 M105,103 Q112,${happy ? 97 : 99} 120,103" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  const mouth = shock ? `<ellipse cx="100" cy="128" rx="5" ry="7" fill="#3a1010" stroke="${INK}" stroke-width="2"/>`
    : happy ? `<path d="M90,124 Q100,134 110,124" stroke="${INK}" stroke-width="2.6" fill="#fff"/>` : `<path d="M92,127 Q100,129 108,127" stroke="${INK}" stroke-width="2.4" fill="none"/>`;
  const head = `<g><path d="M72,96 C65,93 62,101 64,108 C65,114 68,117 72,116 Z M128,96 C135,93 138,101 136,108 C135,114 132,117 128,116 Z" fill="${skSh}" ${o}/>
    <path d="${face}" fill="${sk}" ${o}/><path d="M71,104 C71,116 76,126 83,133 L94,144 Q97,146 99,147 L92,134 C84,124 79,112 79,98 Z" fill="${skSh}"/>
    ${eyes}<path d="M80,93 L94,95 M106,95 L120,93" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M101,108 L103,117 L99,118" fill="none" stroke="${INK}" stroke-width="1.6"/>${mouth}${top}</g>`;
  return { back, head, fx: '' };
}
