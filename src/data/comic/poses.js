// =====================================================================
// poses.js — BIBLIOTHÈQUE DE POSES (corps entiers de la BD)
// ---------------------------------------------------------------------
// Chaque pose a UNE SEULE orientation `o`, appliquée à TOUT le corps :
//   'face'       de face            'tq'  trois-quarts (regard vers la droite ;
//   'dos'        de dos                   flip: true dans la case = vers la gauche)
//   'silhouette' action de profil → dessinée en ombre chinoise (contre-jour)
// Une vérification automatique (src/comic/body.js → checkPose) refuse toute
// incohérence (ex. tête de face sur un corps de dos) : la pose est alors
// dessinée en silhouette et signalée dans la console.
//
// Angles en DEGRÉS, absolus : 0 = vers le bas, 90 = vers la droite,
// -90 = vers la gauche, 180 = vers le haut.
//   t : inclinaison du buste     h : inclinaison de la tête (petite !)
//   k : rotation du corps (0 face → 0,75 trois-quarts marqué)
//   s / p : inclinaison épaules / bassin (contrapposto : sens opposés)
//   bend : courbe d'action du buste      ht : rotation du cou (±0,25)
//   al / ar : bras gauche / droit de l'écran [haut du bras, avant-bras]
//   ll / lr : jambe gauche / droite de l'écran [cuisse, tibia]
//   hl / hr : main 'open' | 'fist' | 'point' | 'none'
//   fronts : bras dessinés DEVANT le buste (bras croisés, main au menton…)
//   back   : membres dessinés derrière     feet : 'front' | 'side'
//   air : hauteur (saut)   rot : rotation du corps entier   seat : assis
//   prop : objet tenu ('phone', 'book', 'notebook')
//
// ➕ Ajouter une pose : copie une pose de la même orientation, modifie-la,
//    puis vérifie-la dans le Panneau créateur → "Galerie des poses".
// =====================================================================

export const POSES = {
  // --- DE FACE (poids sur une jambe, épaules et bassin en sens opposés) ---
  debout: { o: 'face', t: 1, h: -2, k: 0.08, s: 3, p: -5, bend: 4, al: [-8, -2], ar: [9, 16], ll: [6, 2], lr: [-3, -8], hl: 'open', hr: 'open', feet: 'front' },
  decontracte: { o: 'face', t: -2, h: 4, k: 0.15, s: -3, p: 5, bend: -4, al: [-7, -1], ar: [34, -48], ll: [8, 2], lr: [-6, -5], hl: 'open', hr: 'fist', feet: 'front' },
  mains_poches: { o: 'face', t: 2, h: -3, k: 0.1, s: 2, p: -4, bend: 3, al: [-12, 14], ar: [12, -14], ll: [5, 0], lr: [-6, -4], hl: 'none', hr: 'none', feet: 'front' },
  bras_croises: { o: 'face', t: -2, h: 4, k: 0.1, s: -2, p: 3, al: [-14, 78], ar: [14, -78], ll: [5, 1], lr: [-6, -2], hl: 'fist', hr: 'none', feet: 'front', fronts: ['al', 'ar'], front: 'ar' },
  poing_leve: { o: 'face', t: -4, h: -8, k: 0.1, s: -4, p: 4, bend: -6, al: [-14, -6], ar: [168, 178], ll: [8, 2], lr: [-8, -2], hl: 'fist', hr: 'fist', feet: 'front' },
  victoire: { o: 'face', t: 0, h: -10, k: 0, al: [-148, -168], ar: [148, 168], ll: [10, 3], lr: [-10, -3], hl: 'fist', hr: 'fist', feet: 'front' },
  choc: { o: 'face', t: -8, h: -6, k: 0.12, bend: -8, al: [-42, -150], ar: [42, 150], ll: [-10, -4], lr: [6, 2], hl: 'open', hr: 'open', feet: 'front' },
  tete_mains: { o: 'face', t: 6, h: 12, k: 0.1, bend: 6, al: [-149, 116], ar: [149, -116], ll: [4, 1], lr: [-4, -1], hl: 'open', hr: 'open', feet: 'front' },
  penseur: { o: 'face', t: 0, h: -6, k: 0.15, s: 2, p: -4, al: [-10, 70], ar: [-62, 150], ll: [4, 0], lr: [-5, -3], hl: 'fist', hr: 'fist', feet: 'front', fronts: ['al', 'ar'] },
  telephone: { o: 'face', t: 3, h: 10, k: 0.15, s: 2, p: -4, al: [-8, -3], ar: [-40, 160], ll: [5, 1], lr: [-5, -3], hl: 'open', hr: 'open', feet: 'front', prop: 'phone', fronts: ['ar'] },
  lire: { o: 'face', t: 4, h: 12, k: 0.15, al: [-5, 120], ar: [12, 140], ll: [4, 1], lr: [-5, -3], hl: 'open', hr: 'open', feet: 'front', prop: 'book', fronts: ['al', 'ar'], front: 'ar' },
  sifflet: { o: 'face', t: -2, h: -4, k: 0.15, al: [-6, -2], ar: [-70, 152], ll: [6, 2], lr: [-6, -2], hl: 'open', hr: 'fist', feet: 'front', fronts: ['ar'] },

  // --- TROIS-QUARTS (regard vers la droite) ---
  marche: { o: 'tq', t: 4, h: 0, k: 0.55, bend: 4, al: [-20, -10], ar: [22, 40], ll: [-16, -26], lr: [20, 6], hl: 'open', hr: 'open', feet: 'side' },
  pointer: { o: 'tq', t: 4, h: 2, k: 0.5, al: [-10, -4], ar: [92, 94], ll: [-6, -2], lr: [10, 3], hl: 'open', hr: 'point', feet: 'side' },
  main_tendue: { o: 'tq', t: 6, h: 3, k: 0.5, bend: 4, al: [-8, -4], ar: [82, 84], ll: [-6, -2], lr: [10, 4], hl: 'open', hr: 'open', feet: 'side' },
  parle: { o: 'tq', t: 2, h: 0, k: 0.45, s: 2, p: -3, al: [-10, -3], ar: [30, 120], ll: [-4, -1], lr: [8, 2], hl: 'open', hr: 'open', feet: 'side', fronts: ['ar'] },
  garde: { o: 'tq', t: 8, h: 4, k: 0.6, bend: 6, al: [35, 140], ar: [25, 160], ll: [-22, -6], lr: [28, 6], hl: 'fist', hr: 'fist', feet: 'side', fronts: ['al'] },
  coup_de_poing: { o: 'tq', t: 20, h: -2, k: 0.7, bend: 10, al: [-30, 110], ar: [87, 89], ll: [-38, -18], lr: [46, 4], hl: 'fist', hr: 'fist', feet: 'side' },
  assis_bureau: { o: 'tq', t: 14, h: 8, k: 0.55, al: [30, 95], ar: [40, 100], ll: [86, 5], lr: [82, 0], hl: 'open', hr: 'open', feet: 'side', seat: true },
  tendre_bas: { o: 'tq', t: 30, h: 14, k: 0.6, bend: 10, al: [-10, 10], ar: [70, 40], ll: [-10, -4], lr: [18, 4], hl: 'open', hr: 'open', feet: 'side' },

  // --- DE DOS ---
  dos: { o: 'dos', t: 0, h: 0, k: 0, s: 2, p: -3, al: [-6, -2], ar: [7, 4], ll: [4, 1], lr: [-3, -2], hl: 'open', hr: 'open', feet: 'front' },
  dos_marche: { o: 'dos', t: 2, h: 0, k: 0.1, al: [-14, -6], ar: [14, 10], ll: [-6, -10], lr: [8, 2], hl: 'open', hr: 'open', feet: 'front' },

  // --- ACTION (silhouettes en contre-jour) ---
  course: { o: 'silhouette', t: 20, h: -10, k: 0.75, al: [-50, -5], ar: [55, 150], ll: [-38, -128], lr: [70, 10], hl: 'fist', hr: 'fist', feet: 'side', back: ['al', 'll'], air: 18 },
  saut: { o: 'silhouette', t: 8, h: -12, k: 0.5, al: [-150, -170], ar: [150, 172], ll: [35, -40], lr: [70, -5], hl: 'fist', hr: 'fist', feet: 'side', air: 140 },
  plongeon: { o: 'silhouette', t: 70, h: -20, k: 0.8, al: [100, 100], ar: [110, 105], ll: [-60, -70], lr: [-40, -30], hl: 'open', hr: 'open', feet: 'side', back: ['al'], air: 110 },
  esquive: { o: 'silhouette', t: -32, h: -10, k: 0.5, al: [-70, -40], ar: [55, 110], ll: [-8, -2], lr: [34, 12], hl: 'open', hr: 'fist', feet: 'side', back: ['al'] },
  coup_de_pied: { o: 'silhouette', t: -18, h: 6, k: 0.8, al: [-60, -100], ar: [40, 150], ll: [-6, 4], lr: [96, 92], hl: 'fist', hr: 'fist', feet: 'side', back: ['al', 'll'] },
  chute: { o: 'silhouette', t: 0, h: 20, k: 0.4, al: [-120, -150], ar: [130, 100], ll: [30, 60], lr: [-20, 20], hl: 'open', hr: 'open', feet: 'side', rot: -72, air: 40 },
  au_sol: { o: 'silhouette', t: 0, h: 15, k: 0.3, al: [-160, -120], ar: [60, 20], ll: [8, -10], lr: [-25, 30], hl: 'open', hr: 'open', feet: 'side', rot: -86, air: -150 },
  genou: { o: 'silhouette', t: 10, h: 12, k: 0.5, al: [-10, 20], ar: [30, 60], ll: [-20, -95], lr: [80, 5], hl: 'open', hr: 'fist', feet: 'side', back: ['al', 'll'] },
};

export const POSE_NAMES = Object.keys(POSES);
