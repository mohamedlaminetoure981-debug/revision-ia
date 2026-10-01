// =====================================================================
// poses.js — BIBLIOTHÈQUE DE POSES (corps articulés de la BD)
// ---------------------------------------------------------------------
// Les angles sont en DEGRÉS et ABSOLUS (par rapport à l'écran) :
//    0 = le membre pend vers le bas
//   90 = il pointe vers la DROITE       -90 = vers la GAUCHE
//  180 = il pointe vers le HAUT
// Les poses "d'action" regardent vers la droite. Pour regarder à gauche,
// mets `flip: true` sur le personnage dans la case (miroir).
//
//   t   : inclinaison du buste (+ = penché vers la droite)
//   h   : inclinaison de la tête (ajoutée au buste)
//   k   : rotation du corps (0 = de face, 1 = de profil)
//   al / ar : bras GAUCHE / DROIT de l'écran [haut du bras, avant-bras]
//   ll / lr : jambe GAUCHE / DROITE de l'écran [cuisse, tibia]
//   hl / hr : main : 'open' (ouverte), 'fist' (poing), 'point' (index), 'none' (cachée)
//   feet : 'front' (pieds vus de face) ou 'side' (de profil, vers la droite)
//   back : membres dessinés DERRIÈRE le buste, ex. ['al', 'll']
//   air  : hauteur au-dessus du sol (saut)       rot : rotation du corps entier
//   view : 'back' = vu de dos         seat : true = assis (le bassin est posé)
//   prop : objet dans la main droite : 'phone', 'book', 'notebook'
//
// ➕ Ajouter une pose : copie une ligne, change le nom et les angles,
//    puis regarde le résultat dans le Panneau créateur → "Galerie des poses".
// =====================================================================

export const POSES = {
  // --- Debout / attitudes ---
  debout: { t: 1, h: -3, k: 0.1, s: 3, p: -4, al: [-9, -3], ar: [8, 14], ll: [6, 1], lr: [-2, -5], hl: 'open', hr: 'open', feet: 'front' },
  decontracte: { t: -3, h: 5, k: 0.25, al: [-6, -2], ar: [26, -48], ll: [6, 2], lr: [-7, -3], hl: 'open', hr: 'fist', feet: 'front' },
  mains_poches: { t: 2, h: -3, k: 0.2, al: [-12, 12], ar: [12, -12], ll: [4, 0], lr: [-5, -2], hl: 'none', hr: 'none', feet: 'front' },
  bras_croises: { t: -2, h: 4, k: 0.1, al: [-14, 78], ar: [14, -78], ll: [5, 1], lr: [-5, -1], hl: 'fist', hr: 'none', feet: 'front', front: 'ar' },
  penseur: { t: 0, h: -6, k: 0.2, al: [-10, 70], ar: [18, 172], ll: [3, 0], lr: [-3, 0], hl: 'fist', hr: 'fist', feet: 'front' },
  pointer: { t: 4, h: 2, k: 0.45, al: [-10, -4], ar: [92, 94], ll: [-6, -2], lr: [10, 3], hl: 'open', hr: 'point', feet: 'side' },
  poing_leve: { t: -4, h: -8, k: 0.15, al: [-14, -6], ar: [168, 178], ll: [8, 2], lr: [-8, -2], hl: 'fist', hr: 'fist', feet: 'front' },
  victoire: { t: 0, h: -10, k: 0, al: [-148, -168], ar: [148, 168], ll: [10, 3], lr: [-10, -3], hl: 'fist', hr: 'fist', feet: 'front' },
  main_tendue: { t: 6, h: 3, k: 0.5, al: [-8, -4], ar: [82, 84], ll: [-6, -2], lr: [10, 4], hl: 'open', hr: 'open', feet: 'side' },
  choc: { t: -10, h: -6, k: 0.3, al: [-42, -150], ar: [42, 150], ll: [-12, -4], lr: [8, 2], hl: 'open', hr: 'open', feet: 'front' },
  telephone: { t: 3, h: 10, k: 0.3, al: [-8, -3], ar: [22, 160], ll: [4, 1], lr: [-4, -1], hl: 'open', hr: 'open', feet: 'front', prop: 'phone' },
  // --- Mouvement ---
  marche: { t: 4, h: 0, k: 0.65, al: [-18, -8], ar: [22, 48], ll: [-16, -24], lr: [20, 6], hl: 'open', hr: 'open', feet: 'side', back: ['al', 'll'] },
  course: { t: 20, h: -10, k: 0.75, al: [-50, -5], ar: [55, 150], ll: [-38, -128], lr: [70, 10], hl: 'fist', hr: 'fist', feet: 'side', back: ['al', 'll'], air: 18 },
  saut: { t: 8, h: -12, k: 0.5, al: [-150, -170], ar: [150, 172], ll: [35, -40], lr: [70, -5], hl: 'fist', hr: 'fist', feet: 'side', air: 140 },
  plongeon: { t: 70, h: -60, k: 0.8, al: [100, 100], ar: [110, 105], ll: [-60, -70], lr: [-40, -30], hl: 'open', hr: 'open', feet: 'side', back: ['al'], air: 110 },
  // --- Combat ---
  garde: { t: 8, h: 4, k: 0.65, al: [35, 140], ar: [25, 160], ll: [-22, -6], lr: [28, 6], hl: 'fist', hr: 'fist', feet: 'side', back: ['al', 'll'] },
  coup_de_poing: { t: 22, h: -2, k: 0.8, al: [-30, 110], ar: [87, 89], ll: [-38, -18], lr: [46, 4], hl: 'fist', hr: 'fist', feet: 'side', back: ['al', 'll'] },
  esquive: { t: -32, h: -10, k: 0.5, al: [-70, -40], ar: [55, 110], ll: [-8, -2], lr: [34, 12], hl: 'open', hr: 'fist', feet: 'side', back: ['al'] },
  chute: { t: 0, h: 20, k: 0.4, al: [-120, -150], ar: [130, 100], ll: [30, 60], lr: [-20, 20], hl: 'open', hr: 'open', feet: 'side', rot: -72, air: 40 },
  au_sol: { t: 0, h: 15, k: 0.3, al: [-160, -120], ar: [60, 20], ll: [8, -10], lr: [-25, 30], hl: 'open', hr: 'open', feet: 'side', rot: -86, air: -150 },
  // --- Assis / accroupi ---
  assis: { t: -2, h: 2, k: 0.55, al: [12, 70], ar: [18, 75], ll: [84, 2], lr: [80, -2], hl: 'open', hr: 'open', feet: 'side', seat: true, back: ['al', 'll'] },
  assis_bureau: { t: 14, h: 8, k: 0.55, al: [30, 95], ar: [40, 100], ll: [86, 5], lr: [82, 0], hl: 'open', hr: 'open', feet: 'side', seat: true, back: ['al', 'll'] },
  accroupi: { t: 22, h: -6, k: 0.6, al: [20, 60], ar: [30, 70], ll: [120, -6], lr: [135, 8], hl: 'open', hr: 'fist', feet: 'side', back: ['al', 'll'] },
  // --- Relations ---
  accolade: { t: 6, h: 6, k: 0.2, al: [-8, -3], ar: [110, 92], ll: [4, 1], lr: [-4, -1], hl: 'open', hr: 'open', feet: 'front' },
  // --- Vus de dos ---
  dos: { t: 0, h: 0, k: 0, al: [-6, -2], ar: [6, 2], ll: [3, 1], lr: [-3, -1], hl: 'open', hr: 'open', feet: 'front', view: 'back' },
  epaule: { t: 0, h: 18, k: 0.2, al: [-6, -2], ar: [10, 4], ll: [3, 1], lr: [-3, -1], hl: 'open', hr: 'open', feet: 'front', view: 'back', turnHead: true },
};

export const POSE_NAMES = Object.keys(POSES);
