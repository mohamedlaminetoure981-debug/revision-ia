// =====================================================================
// figures.js — CORPS ENTIERS DESSINÉS D'UN SEUL BLOC
// ---------------------------------------------------------------------
// Au lieu d'assembler des morceaux (bras, avant-bras, cuisses…), chaque
// pose est un DESSIN : un contour continu pour le haut (veste + bras), un
// pour le bas (pantalon), des plis, des mains et des chaussures. Les
// couleurs viennent du personnage ; la tête est son portrait (de face,
// de trois-quarts ou vue de dos, selon l'orientation de la pose).
//
// Repère : pieds au sol en (0,0), personnage ≈ 720 de haut.
// Base du cou en (0,-566). La lumière vient de la droite (ombre à gauche).
//
// ➕ Ajouter une pose : copie un modèle de FIGURES, modifie les tracés
//    (top = haut, bottom = bas, skirt = jupe longue), vérifie-la dans le
//    Panneau créateur → "Galerie des poses".
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { characterParts, shade } from '../ui/character.js';
import { BODY_LOOKS, EXTRA_LOOKS } from '../data/comic/looks.js';
import { extraHead } from './body.js';

const INK = '#120b09';
const LW = 3.4;
const HEAD_SCALE = 1.16;
const HEAD_ANCHOR = [100, 140];
const f = (n) => Math.round(n * 10) / 10;
let uid = 0;

// Ombre commune (côté gauche du corps), découpée par la forme du vêtement.
const SHADOW_SIDE = 'M-200,-640 L-62,-640 C-74,-560 -54,-470 -64,-380 C-56,-300 -40,-190 -36,10 L-200,10 Z';

// ---------------------------------------------------------------------
// LES MODÈLES DE POSES
// ---------------------------------------------------------------------
// o : orientation ('face' | 'tq' | 'dos') — une seule pour tout le corps.
// neck : [x, y] base du cou      headTilt : inclinaison de la tête (°)
// top / bottom / skirt / front : tracés      folds : plis (traits fins)
// cuffs : poignets    hands : [x, y, angle, type]    feet : [x, y, 'front'|'side']
// pocket : position de la poche/fermeture (détails de la tenue) [x, y, échelle]
export const FIGURES = {
  // Debout de face, poids sur la jambe gauche (contrapposto)
  debout: {
    o: 'face', neck: [0, -566], headTilt: -2,
    top: `M-24,-566 C-46,-562 -70,-554 -80,-538 C-92,-522 -96,-500 -94,-480 C-96,-440 -98,-410 -100,-380
      C-102,-350 -104,-322 -102,-298 L-76,-296 C-76,-326 -74,-360 -72,-392 C-70,-420 -66,-446 -62,-462
      C-60,-430 -58,-400 -56,-370 C-56,-352 -60,-338 -62,-326 C-30,-320 30,-328 60,-334 C58,-346 56,-360 56,-372
      C58,-400 60,-430 62,-462 C66,-440 70,-416 72,-390 C74,-358 76,-326 78,-300 L102,-302 C102,-330 100,-360 98,-388
      C96,-420 96,-450 94,-480 C96,-502 90,-524 80,-538 C70,-554 46,-562 24,-566 Z`,
    bottom: `M-58,-332 C-60,-300 -58,-260 -54,-220 C-52,-170 -50,-110 -46,-26 L-14,-26 C-14,-100 -12,-170 -10,-230 L0,-262
      C10,-236 18,-200 22,-170 C24,-120 26,-70 30,-24 L62,-22 C58,-80 54,-130 54,-176 C56,-230 60,-290 60,-336 Z`,
    skirt: `M-62,-334 C-66,-260 -72,-180 -78,-112 C-40,-100 40,-98 80,-108 C74,-180 66,-260 62,-336 Z`,
    folds: `M-86,-392 q8,6 14,2 M86,-394 q-8,6 -14,2 M-40,-326 q10,-10 24,-4 M30,-332 q-12,-8 -22,0
      M-46,-170 q10,6 22,2 M30,-168 q10,8 20,2 M-30,-26 l6,-8 l6,8 M44,-22 l6,-8 l6,8 M-8,-300 q6,20 0,34`,
    cuffs: ['M-102,-312 L-76,-310 L-76,-296 L-102,-298 Z', 'M78,-314 L102,-316 L102,-302 L78,-300 Z'],
    armLines: ['M-88,-532 C-92,-460 -94,-380 -90,-312', 'M88,-532 C92,-460 94,-380 90,-314'],
    legLines: ['M-56,-330 L-44,-28', 'M58,-334 L56,-24'],
    hands: [[-89, -296, 0, 'open'], [90, -300, 0, 'open']],
    feet: [[-30, -24, 'front', -1], [46, -22, 'front', 1]],
    pocket: [0, -350, 1],
  },
  // Bras croisés (attitude)
  bras_croises: {
    o: 'face', neck: [0, -566], headTilt: 4,
    top: `M-24,-566 C-46,-562 -70,-554 -80,-538 C-94,-522 -100,-498 -100,-474 C-104,-450 -106,-430 -104,-414
      C-96,-404 -84,-404 -74,-410 C-66,-404 -62,-392 -60,-376 C-58,-356 -60,-340 -62,-326 C-30,-320 30,-328 60,-334
      C58,-346 58,-360 60,-376 C62,-394 68,-404 76,-410 C86,-404 98,-404 104,-414 C106,-432 104,-452 100,-476
      C98,-500 92,-524 80,-538 C70,-554 46,-562 24,-566 Z`,
    front: `M-106,-452 C-80,-470 -20,-468 40,-464 C70,-462 96,-458 108,-448 C112,-432 108,-414 98,-406
      C60,-404 0,-406 -60,-404 C-86,-404 -104,-410 -108,-424 Z`,
    frontFolds: `M-30,-460 q20,22 4,52 M30,-462 q-18,20 -4,54 M-90,-440 q14,4 24,-4 M84,-438 q-12,6 -24,-2`,
    bottom: `M-58,-332 C-60,-300 -58,-260 -54,-220 C-52,-170 -50,-110 -46,-26 L-14,-26 C-14,-100 -12,-170 -10,-230 L0,-262
      C10,-236 16,-200 20,-170 C22,-120 24,-70 26,-24 L58,-22 C56,-80 54,-130 54,-176 C56,-230 60,-290 60,-336 Z`,
    skirt: `M-62,-334 C-66,-260 -72,-180 -78,-112 C-40,-100 40,-98 80,-108 C74,-180 66,-260 62,-336 Z`,
    folds: `M-40,-326 q10,-10 24,-4 M30,-332 q-12,-8 -22,0 M-46,-170 q10,6 22,2 M28,-168 q10,8 20,2
      M-30,-26 l6,-8 l6,8 M40,-22 l6,-8 l6,8 M-8,-300 q6,20 0,34`,
    hands: [[86, -446, -90, 'fist']],
    feet: [[-30, -24, 'front', -1], [42, -22, 'front', 1]],
    pocket: [0, -350, 1], noPocket: true,
  },
  // Mains dans les poches (décontracté, de face)
  mains_poches: {
    o: 'face', neck: [0, -566], headTilt: -3,
    top: `M-24,-566 C-46,-562 -70,-554 -80,-538 C-92,-522 -98,-500 -98,-478 C-104,-452 -112,-428 -114,-404
      C-110,-380 -96,-358 -78,-342 L-60,-358 C-74,-372 -86,-390 -88,-406 C-80,-430 -70,-448 -62,-462
      C-60,-430 -58,-400 -56,-370 C-56,-352 -60,-338 -62,-326 C-30,-320 30,-328 60,-334 C58,-346 56,-360 56,-372
      C58,-400 60,-430 62,-462 C70,-448 80,-430 88,-406 C86,-390 74,-372 60,-358 L78,-342 C96,-358 110,-380 114,-404
      C112,-428 104,-452 98,-478 C98,-500 92,-524 80,-538 C70,-554 46,-562 24,-566 Z`,
    bottom: `M-58,-332 C-60,-300 -58,-260 -54,-220 C-52,-170 -50,-110 -46,-26 L-14,-26 C-14,-100 -12,-170 -10,-230 L0,-262
      C10,-236 18,-200 22,-170 C24,-120 26,-70 30,-24 L62,-22 C58,-80 54,-130 54,-176 C56,-230 60,-290 60,-336 Z`,
    skirt: `M-62,-334 C-66,-260 -72,-180 -78,-112 C-40,-100 40,-98 80,-108 C74,-180 66,-260 62,-336 Z`,
    folds: `M-100,-410 q10,4 16,-4 M100,-410 q-10,4 -16,-4 M-40,-326 q10,-10 24,-4 M30,-332 q-12,-8 -22,0
      M-46,-170 q10,6 22,2 M30,-168 q10,8 20,2 M-30,-26 l6,-8 l6,8 M44,-22 l6,-8 l6,8 M-76,-344 l12,-12 M76,-344 l-12,-12`,
    hands: [],
    feet: [[-30, -24, 'front', -1], [46, -22, 'front', 1]],
    pocket: [0, -350, 1],
  },
  // Poing levé (détermination, de face)
  poing_leve: {
    o: 'face', neck: [0, -566], headTilt: -6,
    top: `M-24,-566 C-46,-562 -70,-554 -80,-538 C-92,-522 -96,-500 -94,-480 C-96,-440 -98,-410 -100,-380
      C-102,-350 -104,-322 -102,-298 L-76,-296 C-76,-326 -74,-360 -72,-392 C-70,-420 -66,-446 -62,-462
      C-60,-430 -58,-400 -56,-370 C-56,-352 -60,-338 -62,-326 C-30,-320 30,-328 60,-334 C58,-346 56,-360 56,-372
      C58,-400 60,-430 62,-462 C68,-500 74,-540 70,-580 C68,-620 64,-660 60,-690 L86,-696
      C92,-662 98,-622 100,-582 C102,-552 96,-536 82,-530 C70,-552 46,-562 24,-566 Z`,
    bottom: `M-58,-332 C-60,-300 -58,-260 -54,-220 C-52,-170 -50,-110 -46,-26 L-14,-26 C-14,-100 -12,-170 -10,-230 L0,-262
      C10,-236 18,-200 22,-170 C24,-120 26,-70 30,-24 L62,-22 C58,-80 54,-130 54,-176 C56,-230 60,-290 60,-336 Z`,
    skirt: `M-62,-334 C-66,-260 -72,-180 -78,-112 C-40,-100 40,-98 80,-108 C74,-180 66,-260 62,-336 Z`,
    folds: `M-86,-392 q8,6 14,2 M66,-600 q10,4 20,0 M-40,-326 q10,-10 24,-4 M-46,-170 q10,6 22,2 M30,-168 q10,8 20,2
      M-30,-26 l6,-8 l6,8 M44,-22 l6,-8 l6,8`,
    cuffs: ['M-102,-312 L-76,-310 L-76,-296 L-102,-298 Z', 'M62,-680 L86,-686 L88,-700 L60,-694 Z'],
    armLines: ['M-88,-532 C-92,-460 -94,-380 -90,-312', 'M86,-540 C88,-600 80,-650 74,-690'],
    hands: [[-89, -296, 0, 'open'], [73, -696, 180, 'fist']],
    feet: [[-30, -24, 'front', -1], [46, -22, 'front', 1]],
    pocket: [0, -350, 1],
  },
  // Marche, trois-quarts (regard vers la droite)
  marche: {
    o: 'tq', neck: [10, -566], headTilt: 0,
    backTop: `M40,-540 C60,-520 70,-482 74,-444 C78,-404 86,-364 92,-330 L116,-336 C110,-372 102,-412 96,-450 C92,-490 82,-530 60,-552 Z`,
    backCuffs: ['M92,-342 L114,-348 L118,-334 L94,-328 Z'],
    backHands: [[106, -326, 14, 'open']],
    top: `M-14,-566 C-34,-560 -50,-548 -58,-532 C-72,-512 -80,-482 -86,-452 C-94,-412 -104,-372 -116,-332
      L-92,-320 C-82,-358 -72,-398 -62,-432 C-56,-452 -50,-468 -46,-478 C-48,-440 -50,-402 -48,-372
      C-48,-352 -52,-338 -54,-326 C-10,-320 30,-322 58,-330 C58,-360 62,-410 62,-442 C64,-482 66,-520 58,-544
      C48,-560 30,-566 20,-568 Z`,
    cuffs: ['M-118,-344 L-92,-332 L-88,-318 L-114,-330 Z'],
    armLines: ['M-56,-530 C-74,-460 -90,-400 -104,-340'],
    backBottom: `M10,-330 C4,-280 -4,-230 -16,-178 C-26,-130 -40,-80 -54,-42 L-28,-32 C-12,-80 4,-130 16,-176 C26,-230 34,-280 40,-330 Z`,
    bottom: `M-54,-330 C-50,-280 -30,-232 -4,-192 C18,-160 36,-112 52,-38 L84,-32 C70,-110 52,-170 34,-206 C22,-236 38,-290 58,-330 Z`,
    skirt: `M-58,-332 C-66,-260 -74,-180 -70,-110 C-20,-96 40,-96 86,-112 C76,-180 66,-260 60,-332 Z`,
    folds: `M-74,-424 q8,8 16,4 M-4,-196 q12,6 20,0 M-18,-176 q-8,10 -2,18 M-20,-326 q10,-8 20,-2 M30,-330 q-10,-8 -18,0`,
    hands: [[-104, -320, -22, 'open']],
    feet: [[68, -28, 'side', 1, 0], [-42, -36, 'side', 1, 28]],
    pocket: [14, -350, 0.72],
  },
  // Pointer du doigt, trois-quarts (le bras lointain montre vers la droite)
  pointer: {
    o: 'tq', neck: [10, -566], headTilt: 2,
    backTop: `M40,-546 C80,-546 140,-540 190,-532 L192,-506 C140,-510 86,-512 52,-514 Z`,
    backCuffs: ['M172,-534 L192,-532 L194,-506 L174,-508 Z'],
    backHands: [[200, -520, 90, 'point']],
    top: `M-14,-566 C-34,-560 -50,-548 -58,-532 C-70,-512 -74,-484 -76,-456 C-80,-414 -82,-370 -84,-326
      L-58,-322 C-58,-360 -56,-400 -52,-440 C-50,-456 -48,-468 -46,-478 C-48,-440 -50,-402 -48,-372
      C-48,-352 -52,-338 -54,-326 C-10,-320 30,-322 58,-330 C58,-360 62,-410 62,-442 C64,-482 66,-520 58,-544
      C48,-560 30,-566 20,-568 Z`,
    cuffs: ['M-86,-338 L-58,-334 L-58,-320 L-84,-322 Z'],
    armLines: ['M-60,-530 C-70,-460 -74,-400 -72,-340'],
    backBottom: `M12,-330 C10,-280 6,-230 0,-178 C-4,-130 -8,-80 -12,-36 L16,-30 C20,-80 26,-130 30,-176 C36,-230 40,-280 42,-330 Z`,
    bottom: `M-54,-330 C-56,-280 -52,-232 -46,-188 C-40,-140 -36,-90 -34,-36 L-4,-32 C-6,-90 -10,-140 -12,-190 C-8,-240 30,-290 58,-330 Z`,
    skirt: `M-58,-332 C-66,-260 -72,-180 -70,-110 C-20,-98 30,-98 62,-110 C58,-180 56,-260 58,-332 Z`,
    folds: `M-46,-190 q10,6 22,0 M0,-180 q10,6 20,0 M-20,-326 q10,-8 20,-2 M60,-530 q6,10 0,18 M120,-536 q4,10 0,22`,
    hands: [[-71, -318, 0, 'open']],
    feet: [[-18, -26, 'side', 1, 0], [30, -28, 'side', 1, 0]],
    pocket: [14, -350, 0.72],
  },
  // Main tendue (offrir son aide), trois-quarts
  main_tendue: {
    o: 'tq', neck: [10, -566], headTilt: 3,
    backTop: `M40,-546 C70,-530 110,-500 160,-470 L150,-446 C104,-472 70,-492 50,-508 Z`,
    backCuffs: ['M144,-480 L162,-470 L152,-446 L136,-456 Z'],
    backHands: [[162, -456, 60, 'open']],
    top: `M-14,-566 C-34,-560 -50,-548 -58,-532 C-70,-512 -74,-484 -76,-456 C-80,-414 -82,-370 -84,-326
      L-58,-322 C-58,-360 -56,-400 -52,-440 C-50,-456 -48,-468 -46,-478 C-48,-440 -50,-402 -48,-372
      C-48,-352 -52,-338 -54,-326 C-10,-320 30,-322 58,-330 C58,-360 62,-410 62,-442 C64,-482 66,-520 58,-544
      C48,-560 30,-566 20,-568 Z`,
    cuffs: ['M-86,-338 L-58,-334 L-58,-320 L-84,-322 Z'],
    armLines: ['M-60,-530 C-70,-460 -74,-400 -72,-340'],
    backBottom: `M12,-330 C10,-280 6,-230 0,-178 C-4,-130 -8,-80 -12,-36 L16,-30 C20,-80 26,-130 30,-176 C36,-230 40,-280 42,-330 Z`,
    bottom: `M-54,-330 C-56,-280 -52,-232 -46,-188 C-40,-140 -36,-90 -34,-36 L-4,-32 C-6,-90 -10,-140 -12,-190 C-8,-240 30,-290 58,-330 Z`,
    skirt: `M-58,-332 C-66,-260 -72,-180 -70,-110 C-20,-98 30,-98 62,-110 C58,-180 56,-260 58,-332 Z`,
    folds: `M-46,-190 q10,6 22,0 M0,-180 q10,6 20,0 M-20,-326 q10,-8 20,-2 M90,-500 q4,10 -4,18`,
    hands: [[-71, -318, 0, 'open']],
    feet: [[-18, -26, 'side', 1, 0], [30, -28, 'side', 1, 0]],
    pocket: [14, -350, 0.72],
  },
  // De dos
  dos: {
    o: 'dos', neck: [0, -566], headTilt: 0,
    top: `M-24,-566 C-46,-562 -70,-554 -80,-538 C-92,-522 -96,-500 -94,-480 C-96,-440 -98,-410 -100,-380
      C-102,-350 -104,-322 -102,-298 L-76,-296 C-76,-326 -74,-360 -72,-392 C-70,-420 -66,-446 -62,-462
      C-60,-430 -58,-400 -56,-370 C-56,-352 -60,-338 -62,-326 C-30,-322 30,-322 60,-328 C58,-346 56,-360 56,-372
      C58,-400 60,-430 62,-462 C66,-440 70,-416 72,-390 C74,-358 76,-326 78,-300 L102,-302 C102,-330 100,-360 98,-388
      C96,-420 96,-450 94,-480 C96,-502 90,-524 80,-538 C70,-554 46,-562 24,-566 Z`,
    bottom: `M-58,-330 C-60,-300 -58,-260 -54,-220 C-52,-170 -50,-110 -46,-26 L-14,-26 C-14,-100 -12,-170 -8,-230 L0,-250
      C8,-230 14,-170 14,-100 L16,-26 L48,-26 C50,-110 52,-170 54,-220 C58,-260 60,-300 60,-330 Z`,
    skirt: `M-62,-332 C-66,-260 -72,-180 -78,-112 C-40,-100 40,-100 78,-112 C72,-180 66,-260 62,-332 Z`,
    folds: `M0,-560 Q4,-450 0,-330 M-86,-392 q8,6 14,2 M86,-394 q-8,6 -14,2 M-30,-26 l6,-8 l6,8 M30,-26 l6,-8 l6,8`,
    cuffs: ['M-102,-312 L-76,-310 L-76,-296 L-102,-298 Z', 'M78,-314 L102,-316 L102,-302 L78,-300 Z'],
    armLines: ['M-88,-532 C-92,-460 -94,-380 -90,-312', 'M88,-532 C92,-460 94,-380 90,-314'],
    legLines: ['M-56,-330 L-44,-28', 'M58,-330 L46,-28'],
    hands: [[-89, -296, 0, 'open'], [90, -300, 0, 'open']],
    feet: [[-30, -24, 'front', -1], [32, -24, 'front', 1]],
    pocket: [0, -350, 1], back: true,
  },
};

// ---------------------------------------------------------------------
// Couleurs (mêmes règles que les portraits)
// ---------------------------------------------------------------------
function palette(id, grade) {
  const X = EXTRA_LOOKS[id];
  const ch = X ? { color: X.top2, look: { skin: X.skin, hairColor: X.hair, outfit: X.outfit, outfitColor: X.top, outfitColor2: X.top2, accessories: [] } } : CHARACTERS[id];
  const L = ch.look;
  const B = X || BODY_LOOKS[id] || BODY_LOOKS.kai;
  const g = grade || ((c) => c);
  return {
    skin: g(L.skin), skinSh: g(shade(L.skin, -0.3)),
    main: g(L.outfitColor), mainSh: g(shade(L.outfitColor, -0.38)), mainHi: g(shade(L.outfitColor, 0.3)),
    acc: g(L.outfitColor2),
    pants: g(B.pants), pantsSh: g(shade(B.pants, -0.4)), pantsHi: g(shade(B.pants, 0.25)),
    shoes: g(B.shoes), sole: g(B.sole), skirt: B.skirt && g(B.skirt), skirt2: B.skirt2 && g(B.skirt2), skirtSh: B.skirt && g(shade(B.skirt, -0.35)),
    stripe: B.stripe && g(B.stripe), hair: g(L.hairColor), hairRaw: L.hairColor, color: g(ch.color),
    build: B.build, outfit: L.outfit, accs: new Set(L.accessories || []),
  };
}

function handSVG(x, y, a, type, C) {
  if (type === 'none') return '';
  const o = `stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"`;
  let s;
  if (type === 'fist') {
    s = `<path d="M-14,-2 Q-16,22 -4,26 L8,26 Q16,22 14,-2 Z" fill="${C.skin}" ${o}/><path d="M-12,10 Q0,14 12,10" stroke="${INK}" stroke-width="1.6" fill="none"/>`;
  } else { // main ouverte détendue (doigts légèrement repliés)
    s = `<path d="M-12,-2 C-14,10 -14,22 -10,30 C-6,36 2,38 8,34 C12,28 13,14 12,-2 Z" fill="${C.skin}" ${o}/>
      <path d="M-4,22 l1,10 M3,22 l1,10" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-12,4 C-12,14 -12,22 -9,28" stroke="${C.skinSh}" stroke-width="4" fill="none" opacity=".7"/>`;
  }
  return `<g transform="translate(${x},${y}) rotate(${-a}) scale(1.25)">${s}</g>`;
}

function footSVG(x, y, mode, side, C, angle = 0) {
  const o = `stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"`;
  if (mode === 'side') { // basket de profil (pointe vers la droite), inclinable (talon levé)
    return `<g transform="translate(${x},${y}) rotate(${angle})"><path d="M-22,-8 Q-8,-18 6,-10 L36,2 Q46,6 44,16 L-22,16 Z" fill="${C.shoes}" ${o}/>
      <path d="M-22,12 L44,12" stroke="${C.sole}" stroke-width="5"/><path d="M0,-8 L10,2 M8,-11 L18,-1" stroke="${INK}" stroke-width="1.6" opacity=".6"/></g>`;
  }
  const dx = side * 4;
  return `<path d="M${x - 19 + dx},${y + 2} Q${x + dx},${y - 12} ${x + 19 + dx},${y + 2} L${x + 22 + dx},${y + 18} Q${x + dx},${y + 26} ${x - 22 + dx},${y + 18} Z" fill="${C.shoes}" ${o}/>
    <path d="M${x - 22 + dx},${y + 16} Q${x + dx},${y + 24} ${x + 22 + dx},${y + 16}" stroke="${C.sole}" stroke-width="4" fill="none"/>`;
}

/** Détails de la tenue sur le buste (fermeture, poche, col…) selon l'orientation. */
function outfitDetails(C, F) {
  const [cx, cy, k] = F.pocket;
  const o = `stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"`;
  let d = '';
  if (F.back) {
    if (C.outfit === 'hoodie') d += `<path d="M-40,-560 Q-46,-500 0,-480 Q46,-500 40,-560 Z" fill="${C.mainSh}" stroke="${INK}" stroke-width="2.2"/>`;
    if (C.outfit === 'bomber') d += `<path d="M-62,-342 Q0,-332 60,-344 L60,-330 Q0,-318 -62,-328 Z" fill="${C.acc}" stroke="${INK}" stroke-width="2"/>`;
    return d;
  }
  const t = `translate(${cx},0) scale(${k},1)`;
  if (C.outfit === 'hoodie') {
    d += `<path d="M-36,-562 Q0,-528 36,-562 Q30,-540 0,-534 Q-30,-540 -36,-562 Z" fill="${C.mainSh}" stroke="${INK}" stroke-width="2.2"/>
      <path d="M-9,-540 L-11,-498 M9,-540 L11,-498" stroke="${C.acc}" stroke-width="3" stroke-linecap="round"/>`;
    if (!F.noPocket) d += `<path d="M-36,${cy - 30} Q0,${cy - 36} 36,${cy - 30} L42,${cy + 14} L-42,${cy + 14} Z" fill="${C.mainSh}" opacity=".6" stroke="${INK}" stroke-width="2"/>`;
  } else if (C.outfit === 'jacket') {
    d += `<path d="M-22,-566 L-26,-584 L0,-560 L26,-584 L22,-566" fill="${C.main}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M0,-560 L1,-334" stroke="${INK}" stroke-width="2.4"/><path d="M4,-560 L5,-334" stroke="${C.acc}" stroke-width="1.6"/>
      <path d="M-60,-536 Q-26,-490 -16,-340 M60,-536 Q26,-490 16,-340" stroke="${C.acc}" stroke-width="2.4" fill="none"/>`;
  } else if (C.outfit === 'cardigan') {
    d += `<path d="M-20,-564 Q0,-536 20,-564 L28,-330 Q0,-324 -28,-330 Z" fill="${C.acc}" stroke="${INK}" stroke-width="2"/>
      <circle cx="-34" cy="-480" r="3" fill="${C.acc}" stroke="${INK}" stroke-width="1.2"/><circle cx="-35" cy="-430" r="3" fill="${C.acc}" stroke="${INK}" stroke-width="1.2"/>`;
  } else if (C.outfit === 'bomber') {
    d += `<path d="M-30,-564 Q0,-540 30,-564 L28,-552 Q0,-528 -28,-552 Z" fill="${C.acc}" stroke="${INK}" stroke-width="2"/>
      <path d="M0,-540 L0,-334" stroke="${INK}" stroke-width="2.4"/>
      <path d="M-62,-342 Q0,-332 60,-344 L60,-330 Q0,-318 -62,-328 Z" fill="${C.acc}" stroke="${INK}" stroke-width="2"/>`;
  } else if (C.outfit === 'track') {
    d += `<path d="M-18,-580 L18,-580 L20,-552 L-20,-552 Z" fill="${C.main}" stroke="${INK}" stroke-width="2.2"/>
      <path d="M0,-580 L0,-334" stroke="${INK}" stroke-width="2.4"/>`;
  } else if (C.outfit === 'tee') {
    d += `<path d="M-22,-564 Q0,-544 22,-564" ${o}/>`;
  }
  if (C.accs.has('headphones')) d += `<path d="M-30,-570 Q0,-540 30,-570" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M-30,-570 Q0,-540 30,-570" stroke="#2b2a33" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="-44" y="-578" width="18" height="26" rx="7" fill="#1d1c24" stroke="${INK}" stroke-width="2.2"/><rect x="26" y="-578" width="18" height="26" rx="7" fill="#1d1c24" stroke="${INK}" stroke-width="2.2"/>
    <rect x="-40" y="-574" width="9" height="17" rx="3" fill="${C.color}"/><rect x="31" y="-574" width="9" height="17" rx="3" fill="${C.color}"/>`;
  if (C.accs.has('chain')) d += `<path d="M-20,-558 Q0,-516 20,-558" stroke="${INK}" stroke-width="4.4" fill="none"/><path d="M-20,-558 Q0,-516 20,-558" stroke="#dcdce6" stroke-width="2.4" stroke-dasharray="4 2" fill="none"/>`;
  if (C.accs.has('whistle')) d += `<path d="M-14,-558 L4,-514 M14,-558 L6,-514" stroke="${C.color}" stroke-width="2" fill="none"/><rect x="-2" y="-516" width="20" height="12" rx="5" fill="#d9d9e3" stroke="${INK}" stroke-width="2"/>`;
  return `<g transform="${t}">${d}</g>`;
}

/**
 * Dessine une figure (pose d'un seul bloc).
 * @returns {{ svg, head, top, issues }}
 */
export function figureSVG(id, name, o = {}) {
  const F = FIGURES[name];
  const C = palette(id, o.grade);
  const n = ++uid;
  const fill = (d, color) => `<path d="${d}" fill="${color}"/>`;
  const ink = (d) => `<path d="${d}" fill="${INK}" stroke="${INK}" stroke-width="${LW * 2}" stroke-linejoin="round"/>`;
  const clipShadow = (d, color) => `<clipPath id="fs${n}${color.slice(1)}"><path d="${d}"/></clipPath><g clip-path="url(#fs${n}${color.slice(1)})"><path d="${SHADOW_SIDE}" fill="${color}"/></g>`;

  // --- Bas : pantalon, ou jupe longue + jambes nues ---
  let bottom;
  if (C.skirt && F.skirt) {
    bottom = ink(F.bottom) + fill(F.bottom, C.skin) + clipShadow(F.bottom, C.skinSh)
      + ink(F.skirt) + fill(F.skirt, C.skirt) + clipShadow(F.skirt, C.skirtSh)
      + `<clipPath id="sk${n}"><path d="${F.skirt}"/></clipPath><g clip-path="url(#sk${n})">${[0, 1, 2, 3].map((i) => `<path d="M-90,${-300 + i * 50} L90,${-300 + i * 50}" stroke="${C.skirt2}" stroke-width="3" stroke-dasharray="10 8"/>`).join('')}</g>`
      + `<path d="M-30,-320 Q-40,-220 -50,-112 M30,-320 Q40,-220 52,-112" stroke="${INK}" stroke-width="1.6" fill="none" opacity=".45"/>`;
  } else {
    bottom = ink(F.bottom) + fill(F.bottom, C.pants) + clipShadow(F.bottom, C.pantsSh)
      + (C.stripe && F.legLines ? F.legLines.map((l) => `<path d="${l}" stroke="${C.stripe}" stroke-width="4" fill="none"/>`).join('') : '');
  }
  // --- Haut : veste + bras d'un seul contour ---
  const top = ink(F.top) + fill(F.top, C.outfit === 'tee' ? C.main : C.main) + clipShadow(F.top, C.mainSh)
    + (F.cuffs || []).map((c) => `<path d="${c}" fill="${C.outfit === 'hoodie' || C.outfit === 'cardigan' ? C.mainSh : C.acc}" stroke="${INK}" stroke-width="2"/>`).join('')
    + ((C.outfit === 'track' || C.outfit === 'jacket') && F.armLines ? F.armLines.map((l) => `<path d="${l}" stroke="${C.acc}" stroke-width="3.4" fill="none"/>`).join('') : '')
    + outfitDetails(C, F);
  const backTop = F.backTop ? ink(F.backTop) + fill(F.backTop, C.main) + clipShadow(F.backTop, C.mainSh)
    + (F.backCuffs || []).map((c) => `<path d="${c}" fill="${C.outfit === 'hoodie' || C.outfit === 'cardigan' ? C.mainSh : C.acc}" stroke="${INK}" stroke-width="2"/>`).join('')
    + (F.backHands || []).map(([x, y, a, t]) => handSVG(x, y, a, t, C)).join('') : '';
  const backBottom = F.backBottom ? ink(F.backBottom) + fill(F.backBottom, C.skirt ? C.skin : C.pantsSh) : '';
  const front = F.front ? ink(F.front) + fill(F.front, C.main) + clipShadow(F.front, C.mainSh) + `<path d="${F.frontFolds || ''}" stroke="${INK}" stroke-width="1.8" fill="none" opacity=".55"/>` : '';
  const folds = `<path d="${F.folds || ''}" stroke="${INK}" stroke-width="1.8" fill="none" opacity=".5" stroke-linecap="round"/>`;
  const hands = (F.hands || []).map(([x, y, a, t]) => handSVG(x, y, a, t, C)).join('');
  const feet = (F.feet || []).map(([x, y, m, s, a]) => footSVG(x, y, m, s, C, a)).join('');
  // Cou
  const [nx, ny] = F.neck;
  const neck = `<path d="M${nx - 17},${ny + 10} L${nx - 15},${ny - 30} L${nx + 15},${ny - 30} L${nx + 17},${ny + 10} Z" fill="${C.skin}" stroke="${INK}" stroke-width="${LW}"/><path d="M${nx - 15},${ny - 8} Q${nx},${ny + 4} ${nx + 15},${ny - 8} L${nx + 16},${ny + 8} L${nx - 16},${ny + 8} Z" fill="${C.skinSh}"/>`;
  // Tête
  const g = o.grade || ((c) => c);
  const recolor = (s) => (o.grade ? s.replace(/#[0-9a-fA-F]{6}\b/g, (c) => (c.toLowerCase() === INK ? c : g(c))) : s);
  const parts = EXTRA_LOOKS[id] ? extraHead(EXTRA_LOOKS[id], o.expr) : characterParts(id, o.expr || 'neutre', { turn: F.o === 'tq' ? 0.55 : 0 });
  const headT = `translate(${nx},${ny - 26}) rotate(${F.headTilt || 0}) scale(${HEAD_SCALE}) translate(${-HEAD_ANCHOR[0]},${-HEAD_ANCHOR[1]})`;
  const head = F.o === 'dos'
    ? `<g transform="${headT}">${recolor(parts.back)}<path d="M70,90 C70,58 86,46 100,46 C114,46 130,58 130,90 L128,120 Q100,140 72,120 Z" fill="${C.hair}" stroke="${INK}" stroke-width="2.8"/><path d="M78,70 Q100,58 122,70" stroke="${g(shade(C.hairRaw, 0.25))}" stroke-width="3" fill="none" opacity=".6"/>${recolor(parts.hairFront || '')}</g>`
    : `<g transform="${headT}">${recolor(parts.back)}${recolor(parts.head)}${recolor(parts.fx)}</g>`;
  // Silhouette féminine : un peu plus fine (le visage, lui, ne change pas)
  const bodyT = C.build === 'f' ? 'scale(0.9,1)' : '';
  const body = `<g transform="${bodyT}">${backTop}${backBottom}${feet}${bottom}${neck}${top}${folds}${hands}${front}</g>`;
  const scale = BODY_LOOKS[id]?.height || 1;
  const svg = `<g transform="scale(${scale})">${F.o === 'dos' ? body + head : body + head + (F.front ? `<g transform="${bodyT}">${front}${hands}</g>` : '')}</g>`;
  const eyeY = ny - 26 - 43 * HEAD_SCALE;
  return { svg, head: [nx * scale, eyeY * scale], top: (ny - 26 - 136) * scale, issues: [] };
}

export const FIGURE_NAMES = Object.keys(FIGURES);
