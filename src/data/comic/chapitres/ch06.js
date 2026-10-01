// =====================================================================
// CHAPITRE 6 — « Le dojo de Kaloum »  (Awa)
// Format : voir ch01.js (en-tête) et le README.
// =====================================================================

export default {
  id: 6,
  title: 'Le dojo de Kaloum',
  pages: [
    // ------------------------------------------------------------- PAGE 1
    {
      gutter: 'blanc',
      ambient: 'dojo',
      rows: [{ h: 0.38, cols: [1], tilt: -30 }, { h: 0.3, cols: [0.5, 0.5], ctilt: [26] }, { h: 0.32, cols: [0.56, 0.44] }],
      panels: [
        { // Le dojo improvisé
          bg: { id: 'dojo', time: 'couchant', horizon: 0.42, vp: 0.45 },
          chars: [
            { id: 'etudiant', pose: 'garde', shot: 'pied', x: 0.22, y: 0.97, fill: 0.5 },
            { id: 'etudiante', pose: 'garde', shot: 'pied', x: 0.42, y: 0.97, fill: 0.48 },
            { id: 'awa', pose: 'sifflet', expr: 'concentration', shot: 'pied', x: 0.74, y: 0.98, fill: 0.68, flip: true },
          ],
          captions: [{ text: 'Une cour de Kaloum transformée en dojo. Fin d’après-midi.', x: 0.03, y: 0.05, w: 0.55, style: 'noir' }],
          sfx: [{ text: 'PRRRT !', x: 0.86, y: 0.2, size: 70, rot: 10, color: '#ffc53d' }],
          bubbles: [{ type: 'cri', text: 'Exercice 4 ! On pose les étapes !', x: 0.42, y: 0.35, w: 0.36, who: 2, size: 26 }],
          sound: 'bubble',
        },
        { // Mory perplexe
          bg: { id: 'aplat', color: '#3a2a0a', color2: '#140e04' },
          chars: [{ id: 'mory', pose: 'debout', expr: 'surprise', shot: 'gros', x: 0.5, y: 0.24, fill: 0.82 }],
          bubbles: [{ type: 'parole', text: 'Elle a un sifflet. Pourquoi elle a un sifflet ?', x: 0.5, y: 0.13, w: 0.85, who: 0, size: 26 }],
        },
        { // Awa accueille
          bg: { id: 'dojo', time: 'couchant', horizon: 0.5, vp: 0.2 },
          chars: [{ id: 'awa', pose: 'decontracte', expr: 'joie', shot: 'americain', x: 0.5, y: 0.22, fill: 0.82 }],
          bubbles: [{ type: 'parole', text: 'Parce qu’ici, on s’entraîne pour de vrai. Bienvenue au dojo !', x: 0.5, y: 0.12, w: 0.9, who: 0, size: 25 }],
        },
        { // Kaï propose
          bg: { id: 'dojo', time: 'couchant', horizon: 0.55, vp: 0.8 },
          chars: [{ id: 'kai', pose: 'main_tendue', expr: 'encouragement', shot: 'taille', x: 0.38, y: 0.22, fill: 0.85 }],
          bubbles: [{ type: 'parole', text: 'On monte une équipe contre l’Oubli. Il nous faut une coach.', x: 0.55, y: 0.13, w: 0.85, who: 0, size: 25 }],
        },
        { // Ren, adossé à l'entrée
          bg: { id: 'dojo', time: 'couchant', horizon: 0.6, vp: 0.9 },
          chars: [{ id: 'ren', pose: 'mains_poches', expr: 'clin', shot: 'americain', x: 0.5, y: 0.22, fill: 0.85, light: 'contre' }],
          bubbles: [{ type: 'parole', text: 'Une coach ? J’ai jamais eu besoin de méthode.', x: 0.5, y: 0.12, w: 0.9, who: 0, size: 25 }],
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 2
    {
      gutter: 'blanc',
      ambient: 'dojo',
      rows: [{ h: 0.28, cols: [0.5, 0.5], ctilt: [-20] }, { h: 0.42, cols: [1], tilt: -44 }, { h: 0.3, cols: [0.46, 0.54], ctilt: [30] }],
      panels: [
        { // Awa le recadre
          bg: { id: 'flash', color: '#fff8e0', lines: '#ffc53d' },
          chars: [{ id: 'awa', pose: 'debout', expr: 'concentration', shot: 'gros', x: 0.5, y: 0.26, fill: 0.8 }],
          bubbles: [{ type: 'parole', text: 'Ren. Rapide… et toujours sans justifier tes réponses.', x: 0.5, y: 0.13, w: 0.9, who: 0, size: 25 }],
        },
        { // Ren s'énerve
          bg: { id: 'flash', color: '#2a0905', lines: '#ff5a3d' },
          chars: [{ id: 'ren', pose: 'debout', expr: 'concentration', shot: 'gros', x: 0.5, y: 0.26, fill: 0.8 }],
          bubbles: [{ type: 'cri', text: 'Je trouve la bonne réponse, c’est tout ce qui compte !', x: 0.5, y: 0.15, w: 0.75, who: 0, size: 24 }],
          sfx: [{ text: 'GRR', x: 0.85, y: 0.8, size: 60, rot: 10, color: '#ff5a3d' }],
        },
        { // Le combat d'entraînement
          bg: { id: 'dojo', time: 'couchant', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'awa', pose: 'esquive', expr: 'concentration', shot: 'pied', x: 0.72, y: 0.98, fill: 0.86, flip: true },
            { id: 'ren', pose: 'coup_de_poing', expr: 'concentration', shot: 'pied', x: 0.3, y: 0.99, fill: 0.88, blur: -80, aura: '#ff5a3d' },
          ],
          fx: [{ type: 'vitesse', angle: 0, n: 30, opacity: 0.45, layer: 'front' }],
          captions: [{ text: 'Combat d’entraînement. Trois touches.', x: 0.03, y: 0.05, style: 'noir', w: 0.5, right: true }],
          sfx: [{ text: 'SWISH', x: 0.5, y: 0.88, size: 70, rot: -10, color: '#ffffff' }],
          sound: 'swipe',
        },
        { // Contre d'Awa
          bg: { id: 'flash', color: '#fffbe8', lines: '#3a2a0a', cx: 0.65 },
          chars: [
            { id: 'ren', pose: 'chute', expr: 'surprise', shot: 'pied', x: 0.74, y: 0.95, fill: 0.62 },
            { id: 'awa', pose: 'coup_de_pied', expr: 'celebration', shot: 'pied', x: 0.3, y: 1.0, fill: 0.88, aura: '#ffc53d' },
          ],
          fx: [{ type: 'impact', x: 0.66, y: 0.35, size: 0.26, layer: 'front' }],
          sfx: [{ text: 'TAC !', x: 0.7, y: 0.18, size: 90, rot: 12, color: '#ffc53d' }],
          sound: 'hit',
        },
        { // Awa tend la main
          bg: { id: 'dojo', time: 'couchant', horizon: 0.35, vp: 0.3 },
          chars: [
            { id: 'ren', pose: 'au_sol', expr: 'surprise', shot: 'pied', x: 0.32, y: 0.98, fill: 0.3 },
            { id: 'awa', pose: 'tendre_bas', expr: 'encouragement', shot: 'pied', x: 0.72, y: 0.98, fill: 0.85, flip: true },
          ],
          bubbles: [{ type: 'parole', text: 'À l’exam, une réponse sans méthode vaut zéro.', x: 0.5, y: 0.14, w: 0.85, who: 1, size: 25 }],
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 3
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.32, cols: [0.58, 0.42], ctilt: [24] }, { h: 0.3, cols: [1] }, { h: 0.38, cols: [1] }],
      panels: [
        { // Ren repousse la main et part
          bg: { id: 'dojo', time: 'nuit', horizon: 0.5, vp: 0.85 },
          chars: [{ id: 'ren', pose: 'marche', expr: 'concentration', shot: 'pied', x: 0.55, y: 0.98, fill: 0.78, flip: true }],
          fx: [{ type: 'fissure', x: 0.5, y: 0.52, size: 0.12, layer: 'front' }],
          bubbles: [{ type: 'parole', text: '… Tch.', x: 0.3, y: 0.16, w: 0.3, who: 0 }],
        },
        { // Awa a vu la marque
          bg: { id: 'aplat', color: '#1a1030', color2: '#05030a' },
          chars: [{ id: 'awa', pose: 'debout', expr: 'reflexion', shot: 'gros', x: 0.5, y: 0.28, fill: 0.78 }],
          bubbles: [{ type: 'pensee', text: 'Cette marque sur son bras…', x: 0.5, y: 0.13, w: 0.85, tail: false, size: 25 }],
        },
        { // Awa rejoint l'équipe (humour)
          bg: { id: 'dojo', time: 'nuit', horizon: 0.52, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'decontracte', expr: 'joie', shot: 'americain', x: 0.16, y: 0.2, fill: 0.78 },
            { id: 'awa', pose: 'sifflet', expr: 'clin', shot: 'americain', x: 0.5, y: 0.18, fill: 0.8 },
            { id: 'mory', pose: 'tete_mains', expr: 'surprise', shot: 'americain', x: 0.84, y: 0.2, fill: 0.78, flip: true },
          ],
          bubbles: [
            { type: 'parole', text: 'Alors, coach ?', x: 0.18, y: 0.1, w: 0.3, who: 0, size: 24 },
            { type: 'parole', text: 'Demain, 6 h. Retard = 20 pompes.', x: 0.52, y: 0.1, w: 0.36, who: 1, size: 24 },
            { type: 'cri', text: '6 h ?!', x: 0.86, y: 0.12, w: 0.2, who: 2, size: 26 },
          ],
        },
        { // Cliffhanger : la ville s'éteint
          bg: { id: 'toit', time: 'nuit', horizon: 0.42, props: false, roofY: 1.2 },
          fx: [{ type: 'teinte', color: '#000000', opacity: 0.82 }, { type: 'glitch', n: 14 }],
          captions: [{ text: '21 h 07. Toute la ville de Conakry plonge dans le noir.', x: 0.03, y: 0.06, w: 0.62, style: 'noir' }, { text: 'À suivre…', x: 0.03, y: 0.8, style: 'noir', right: true }],
          sfx: [{ text: 'CLAC.', x: 0.62, y: 0.55, size: 100, rot: -6, color: '#ffffff' }],
          sound: 'boss',
        },
      ],
    },
  ],
};
