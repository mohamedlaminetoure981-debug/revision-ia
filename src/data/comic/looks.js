// =====================================================================
// looks.js — TENUES "CORPS ENTIER" des personnages (bande dessinée)
// ---------------------------------------------------------------------
// Le visage, la coiffure, la peau et la veste viennent du portrait
// (src/data/characters.js → look). Ici on ajoute seulement ce qu'un
// portrait en buste ne montre pas : silhouette, pantalon/jupe, chaussures.
//
//   build  : 'm' (épaules larges) ou 'f' (épaules plus fines, hanches)
//   pants  : couleur du pantalon        skirt : jupe longue (motif wax)
//   shoes  : couleur des baskets        sole  : couleur de la semelle
//   stripe : bande sur le pantalon (survêtement)
// =====================================================================

export const BODY_LOOKS = {
  kai: { build: 'm', pants: '#23264A', shoes: '#F2F0FA', sole: '#8B5CF6', height: 1.02 },
  mory: { build: 'm', pants: '#2A2E38', shoes: '#15161C', sole: '#22D3EE', height: 0.98 },
  nia: { build: 'f', skirt: '#E879F9', skirt2: '#FFD23F', pants: '#3B1F4A', shoes: '#C9A27A', sole: '#6B4226', height: 0.95 },
  sora: { build: 'f', pants: '#1B1F12', shoes: '#C6FF3D', sole: '#F2F0FA', stripe: '#C6FF3D', height: 0.93 },
  ren: { build: 'm', pants: '#16161C', shoes: '#E8442E', sole: '#F2F0FA', height: 1.05 },
  awa: { build: 'f', pants: '#3A2A0A', shoes: '#F2F0FA', sole: '#FFC53D', stripe: '#FFC53D', height: 0.97 },
  tidiane: { build: 'm', pants: '#4A4F5C', shoes: '#9AA3B5', sole: '#F2F0FA', height: 1.04 },
  binta: { build: 'f', pants: '#9FB4E0', shoes: '#F2F0FA', sole: '#FF3D9A', height: 0.94 },
};


// =====================================================================
// FIGURANTS (passants, étudiants, vendeuse…) : même corps articulé que
// l'équipe, avec une tête simple. Utilisation dans une case :
//   { id: 'vendeuse', pose: 'debout', shot: 'pied', … }
//   hairStyle : 'court' | 'foulard' | 'casquette' | 'tresses' | 'chignon'
//   outfit    : 'tee' (t-shirt, avant-bras nus) ou une tenue de l'équipe
// =====================================================================
export const EXTRA_LOOKS = {
  etudiant: { build: 'm', skin: '#5a3825', hair: '#140d0a', hairStyle: 'court', outfit: 'tee', top: '#f2f0fa', top2: '#2f86d6', pants: '#23264a', shoes: '#2f2f3a', sole: '#f2f0fa' },
  etudiante: { build: 'f', skin: '#7a4a2e', hair: '#1a110c', hairStyle: 'tresses', outfit: 'tee', top: '#f5c518', top2: '#1f9d55', pants: '#2f2f3a', shoes: '#f2f0fa', sole: '#1f9d55' },
  vendeuse: { build: 'f', skin: '#6b3e26', hair: '#1a110c', hairStyle: 'foulard', wrap: '#f5c518', outfit: 'tee', top: '#e8442e', top2: '#f5c518', skirt: '#1f6fb2', skirt2: '#f5c518', pants: '#1f6fb2', shoes: '#8a5a3a', sole: '#3a2a1a' },
  chauffeur: { build: 'm', skin: '#4a2c1d', hair: '#120c09', hairStyle: 'casquette', cap: '#f5c518', outfit: 'tee', top: '#2f7d4a', top2: '#f2f0fa', pants: '#3a3a42', shoes: '#15161c', sole: '#3a3a42' },
  passant: { build: 'm', skin: '#5a3825', hair: '#120c09', hairStyle: 'court', outfit: 'tee', top: '#8b5cf6', top2: '#2a1f55', pants: '#16161c', shoes: '#f2f0fa', sole: '#8b5cf6' },
  prof: { build: 'm', skin: '#4a2c1d', hair: '#8a8580', hairStyle: 'court', outfit: 'tee', top: '#f2f0fa', top2: '#d9d4c8', pants: '#3a3a42', shoes: '#2a1d14', sole: '#3a3a42' },
  conducteur: { build: 'm', skin: '#5a3825', hair: '#120c09', hairStyle: 'casquette', cap: '#1f2a44', outfit: 'tee', top: '#ff7a1a', top2: '#ffd23f', pants: '#2a2e38', shoes: '#15161c', sole: '#3a3a42' },
  bibliothecaire: { build: 'f', skin: '#5e3a24', hair: '#1a110c', hairStyle: 'foulard', wrap: '#1f2a5c', outfit: 'tee', top: '#f2f0fa', top2: '#1f2a5c', skirt: '#1f2a5c', skirt2: '#2f3a6c', pants: '#1f2a5c', shoes: '#2a1d14', sole: '#3a2a1a' },
  etudiante_hijab: { build: 'f', skin: '#7a4a2e', hair: '#1a110c', hairStyle: 'foulard', wrap: '#1f9d55', outfit: 'tee', top: '#f2f0fa', top2: '#1f9d55', pants: '#2f2f3a', shoes: '#f2f0fa', sole: '#1f9d55' },
  etudiant_jaune: { build: 'm', skin: '#4a2c1d', hair: '#120c09', hairStyle: 'court', outfit: 'tee', top: '#f5c518', top2: '#e0a800', pants: '#23264a', shoes: '#2f2f3a', sole: '#f2f0fa' },
  passante: { build: 'f', skin: '#8d5a3b', hair: '#1f140e', hairStyle: 'chignon', outfit: 'tee', top: '#ff8a3d', top2: '#ffffff', pants: '#23264a', shoes: '#f2f0fa', sole: '#ff8a3d' },
};
