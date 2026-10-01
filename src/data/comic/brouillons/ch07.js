// =====================================================================
// CHAPITRE 7 — « Panne générale »  (Tidiane)
// Format : voir ch01.js (en-tête) et le README.
// =====================================================================

export default {
  id: 7,
  title: 'Panne générale',
  pages: [
    // ------------------------------------------------------------- PAGE 1
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [{ h: 0.4, cols: [1], tilt: -34 }, { h: 0.28, cols: [0.5, 0.5], ctilt: [-24] }, { h: 0.32, cols: [0.42, 0.58], ctilt: [30] }],
      panels: [
        { // La ville dans le noir, des Oublis partout
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5, cars: false },
          chars: [
            { id: 'oubli', pose: 'flotte', shot: 'pied', x: 0.25, y: 0.62, fill: 0.3, seed: 41 },
            { id: 'oubli', pose: 'flotte', shot: 'pied', x: 0.62, y: 0.6, fill: 0.26, seed: 42 },
            { id: 'oubli', pose: 'attaque', shot: 'pied', x: 0.85, y: 0.7, fill: 0.4, seed: 43 },
            { id: 'kai', pose: 'course', expr: 'concentration', shot: 'pied', x: 0.32, y: 0.99, fill: 0.55, blur: -60 },
          ],
          fx: [{ type: 'teinte', color: '#000000', opacity: 0.35 }, { type: 'pluie', n: 130 }],
          captions: [{ text: 'Conakry dans le noir. Pluie battante.', x: 0.03, y: 0.05, w: 0.5, style: 'noir' }],
          bubbles: [{ type: 'cri', text: 'Il y en a PARTOUT !', x: 0.6, y: 0.86, w: 0.4, who: 3, size: 28 }],
          sound: 'boss',
        },
        { // Sora
          bg: { id: 'flash', color: '#0b1006', lines: '#c6ff3d' },
          chars: [{ id: 'sora', pose: 'debout', expr: 'surprise', shot: 'gros', x: 0.5, y: 0.26, fill: 0.8 }],
          fx: [{ type: 'pluie', n: 40 }],
          bubbles: [{ type: 'parole', text: 'Ils se multiplient !', x: 0.5, y: 0.13, w: 0.8, who: 0 }],
        },
        { // Mory
          bg: { id: 'carte', text: 'ERREUR · DONNÉES PERDUES', spots: 14, loading: 0.02 },
          chars: [{ id: 'mory', pose: 'tete_mains', expr: 'surprise', shot: 'buste', x: 0.5, y: 0.34, fill: 0.7 }],
          fx: [{ type: 'glitch', n: 18 }],
          bubbles: [{ type: 'parole', text: 'Mes données s’effacent !', x: 0.5, y: 0.13, w: 0.8, who: 0 }],
        },
        { // Awa, épuisée
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.3, cars: false },
          chars: [{ id: 'awa', pose: 'garde', expr: 'encouragement', shot: 'taille', x: 0.5, y: 0.22, fill: 0.85 }],
          fx: [{ type: 'teinte', color: '#000000', opacity: 0.3 }, { type: 'pluie', n: 60 }],
          bubbles: [{ type: 'cri', text: 'On frappe, ils reviennent ! Ça sert à rien !', x: 0.5, y: 0.13, w: 0.85, who: 0, size: 25 }],
        },
        { // Une silhouette calme sous un lampadaire
          bg: { id: 'rue', time: 'pluie', horizon: 0.55, vp: 0.7, cars: false },
          chars: [{ id: 'tidiane', pose: 'telephone', expr: 'neutre', shot: 'pied', x: 0.55, y: 0.97, fill: 0.78, light: 'contre' }],
          fx: [{ type: 'teinte', color: '#05030a', opacity: 0.45 }, { type: 'lueur', x: 0.56, y: 0.12, color: '#ffe2a8', size: 0.35, opacity: 0.6 }, { type: 'pluie', n: 80 }],
          bubbles: [{ type: 'murmure', text: 'Ne courez pas. Regardez d’abord l’erreur.', x: 0.36, y: 0.16, w: 0.6, who: 0, size: 26 }],
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 2
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [{ h: 0.32, cols: [1] }, { h: 0.34, cols: [0.5, 0.5], ctilt: [20] }, { h: 0.34, cols: [1] }],
      panels: [
        { // Tidiane se présente
          bg: { id: 'rue', time: 'pluie', horizon: 0.6, vp: 0.2, cars: false },
          chars: [{ id: 'tidiane', pose: 'telephone', expr: 'neutre', shot: 'taille', x: 0.62, y: 0.2, fill: 0.85 }],
          fx: [{ type: 'teinte', color: '#05030a', opacity: 0.35 }, { type: 'lueur', x: 0.62, y: 0.38, color: '#8be9ff', size: 0.22, opacity: 0.6 }, { type: 'pluie', n: 60 }],
          bubbles: [{ type: 'parole', text: 'Tidiane. Je lis les messages d’erreur. Ceux que tout le monde ferme sans lire.', x: 0.3, y: 0.3, w: 0.5, who: 0, size: 25 }],
        },
        { // Le message d'erreur
          bg: { id: 'ecran', text: 'ERREUR : 12 notions ignorées. Voir les détails ?', from: 'SYSTÈME', clock: '21:19' },
          sound: 'bubble',
        },
        { // L'explication de Tidiane
          bg: { id: 'aplat', color: '#1b2a44', color2: '#05080f' },
          chars: [{ id: 'tidiane', pose: 'debout', expr: 'neutre', shot: 'gros', x: 0.5, y: 0.28, fill: 0.78 }],
          bubbles: [{ type: 'parole', text: 'L’Oubli se nourrit des erreurs qu’on ignore. Il déteste celles qu’on comprend.', x: 0.5, y: 0.13, w: 0.92, who: 0, size: 24 }],
        },
        { // Tidiane explique une erreur : les petits Oublis se dissolvent
          bg: { id: 'rue', time: 'pluie', horizon: 0.5, vp: 0.5, cars: false },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.12, y: 0.75, fill: 0.36, seed: 44 },
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.9, y: 0.72, fill: 0.34, seed: 45 },
            { id: 'etudiante', pose: 'choc', expr: 'surprise', shot: 'pied', x: 0.36, y: 0.98, fill: 0.6 },
            { id: 'tidiane', pose: 'pointer', expr: 'neutre', shot: 'pied', x: 0.66, y: 0.98, fill: 0.7, flip: true, aura: '#60a5fa' },
          ],
          fx: [{ type: 'teinte', color: '#05030a', opacity: 0.25 }, { type: 'glitch', n: 16 }, { type: 'pluie', n: 60 }],
          sfx: [{ text: 'SHHH…', x: 0.15, y: 0.3, size: 60, rot: -6, color: '#93c5fd' }],
          bubbles: [{ type: 'parole', text: 'Ton erreur : dérivée et primitive confondues. Voilà pourquoi.', x: 0.56, y: 0.14, w: 0.6, who: 3, size: 24 }],
          sound: 'sparkle',
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 3
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [{ h: 0.36, cols: [1], tilt: 30 }, { h: 0.26, cols: [0.55, 0.45], ctilt: [-24] }, { h: 0.38, cols: [0.6, 0.4] }],
      panels: [
        { // Le cœur de l'Oubli : l'équipe se rassemble
          bg: { id: 'rue', time: 'nuit', horizon: 0.62, vp: 0.5, cars: false },
          chars: [
            { id: 'oubli', pose: 'cri', shot: 'taille', x: 0.5, y: 0.0, fill: 1.0, seed: 47 },
            { id: 'awa', pose: 'garde', expr: 'concentration', shot: 'pied', x: 0.08, y: 1.0, fill: 0.46, light: 'contre' },
            { id: 'sora', pose: 'garde', expr: 'concentration', shot: 'pied', x: 0.22, y: 1.0, fill: 0.44, light: 'contre' },
            { id: 'kai', pose: 'garde', expr: 'concentration', shot: 'pied', x: 0.4, y: 1.0, fill: 0.5, light: 'contre' },
            { id: 'nia', pose: 'debout', expr: 'concentration', shot: 'pied', x: 0.6, y: 1.0, fill: 0.46, light: 'contre' },
            { id: 'mory', pose: 'pointer', expr: 'concentration', shot: 'pied', x: 0.76, y: 1.0, fill: 0.46, light: 'contre' },
            { id: 'tidiane', pose: 'debout', expr: 'neutre', shot: 'pied', x: 0.92, y: 1.0, fill: 0.5, light: 'contre' },
          ],
          fx: [{ type: 'pluie', n: 90 }, { type: 'vignette', opacity: 0.5 }],
          sfx: [{ text: 'VRROOOM', x: 0.8, y: 0.2, size: 80, rot: 6, color: '#c4b5fd' }],
          sound: 'boss',
        },
        { // Tidiane guide Kaï
          bg: { id: 'aplat', color: '#1b2a44', color2: '#05080f' },
          chars: [{ id: 'tidiane', pose: 'debout', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.3, fill: 0.75 }],
          bubbles: [{ type: 'parole', text: 'Kaï. Vise l’erreur au centre. Là où il a mal compris.', x: 0.5, y: 0.13, w: 0.92, who: 0, size: 24 }],
        },
        { // Kaï
          bg: { id: 'flash', color: '#1a1030', lines: '#8b5cf6' },
          chars: [{ id: 'kai', pose: 'poing_leve', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.3, fill: 0.75, aura: '#8b5cf6' }],
          bubbles: [{ type: 'cri', text: 'Compris !', x: 0.5, y: 0.14, w: 0.5, who: 0, size: 30 }],
        },
        { // Le coup : la lumière revient
          bg: { id: 'flash', color: '#fffbe6', lines: '#8b5cf6', cx: 0.6, cy: 0.4 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.8, y: 1.04, fill: 0.92, seed: 48 },
            { id: 'kai', pose: 'coup_de_poing', expr: 'celebration', shot: 'pied', x: 0.34, y: 1.02, fill: 0.92, aura: '#8b5cf6', break: true },
          ],
          fx: [{ type: 'impact', x: 0.68, y: 0.38, size: 0.28, color: '#fff3c4', layer: 'front' }],
          sfx: [{ text: 'CLIC… CLIC… CLIC.', x: 0.5, y: 0.9, size: 54, rot: -4, color: '#ffd23f' }],
          captions: [{ text: 'Les lumières de la ville se rallument, une à une.', x: 0.03, y: 0.04, w: 0.6, style: 'jaune' }],
          sound: 'hit',
        },
        { // Cliffhanger : Tidiane
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5, cars: false },
          chars: [{ id: 'tidiane', pose: 'epaule', expr: 'neutre', shot: 'taille', x: 0.5, y: 0.24, fill: 0.85 }],
          fx: [{ type: 'pluie', n: 50 }],
          bubbles: [{ type: 'murmure', text: 'Je le connais. Je l’ai déjà vu… il y a longtemps.', x: 0.5, y: 0.12, w: 0.92, tail: false, size: 23 }],
          captions: [{ text: 'À suivre…', x: 0.04, y: 0.84, style: 'noir', right: true }],
        },
      ],
    },
  ],
};
