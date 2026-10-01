// =====================================================================
// CHAPITRE 3 — « La voix de la bibliothèque »  (Nia)
// Format : voir ch01.js (en-tête) et le README.
// =====================================================================

export default {
  id: 3,
  title: 'La voix de la bibliothèque',
  pages: [
    // ------------------------------------------------------------- PAGE 1
    {
      gutter: 'blanc',
      ambient: 'pluie',
      rows: [{ h: 0.38, cols: [1] }, { h: 0.3, cols: [0.5, 0.5], ctilt: [24] }, { h: 0.32, cols: [0.6, 0.4] }],
      panels: [
        { // Nia explique, des étudiants l'écoutent
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.42, vp: 0.55 },
          chars: [
            { id: 'etudiant', pose: 'assis', shot: 'pied', x: 0.22, y: 0.98, fill: 0.42 },
            { id: 'etudiante', pose: 'assis', shot: 'pied', x: 0.38, y: 0.98, fill: 0.42 },
            { id: 'nia', pose: 'lire', expr: 'joie', shot: 'pied', x: 0.66, y: 0.97, fill: 0.7, flip: true },
          ],
          captions: [{ text: 'Bibliothèque. 9 h 58. Il pleut.', x: 0.03, y: 0.8, style: 'noir', w: 0.45 }],
          bubbles: [{ type: 'parole', text: 'Une dérivée, c’est la vitesse de la pirogue à un instant précis. Pas sur tout le trajet : MAINTENANT.', x: 0.66, y: 0.2, w: 0.5, who: 2, size: 27 }],
        },
        { // Une étudiante comprend
          bg: { id: 'aplat', color: '#f9e3f5', color2: '#d9a6e8' },
          chars: [{ id: 'etudiante', pose: 'debout', expr: 'joie', shot: 'gros', x: 0.5, y: 0.2, fill: 0.85 }],
          bubbles: [{ type: 'parole', text: 'Ohhh… là, j’ai compris !', x: 0.5, y: 0.13, w: 0.8, who: 0 }],
          sfx: [{ text: '✦', x: 0.85, y: 0.4, size: 60, rot: 0, color: '#e879f9' }],
        },
        { // Mory chuchote
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.2 },
          chars: [
            { id: 'mory', pose: 'debout', expr: 'reflexion', shot: 'buste', x: 0.3, y: 0.3, fill: 0.75 },
            { id: 'kai', pose: 'debout', expr: 'neutre', shot: 'buste', x: 0.74, y: 0.34, fill: 0.72, flip: true },
          ],
          bubbles: [{ type: 'murmure', text: 'C’est elle. Mon antenne s’affole quand elle parle.', x: 0.36, y: 0.13, w: 0.6, who: 0, size: 26 }],
        },
        { // Kaï, sourire
          bg: { id: 'aplat', color: '#3b1f4a', color2: '#1a0e24' },
          chars: [{ id: 'kai', pose: 'debout', expr: 'clin', shot: 'gros', x: 0.5, y: 0.26, fill: 0.78 }],
          bubbles: [{ type: 'parole', text: 'Normal : c’est la seule qui explique bien.', x: 0.5, y: 0.13, w: 0.75, who: 0, size: 27 }],
        },
        { // 10 h 00 : les lumières vacillent
          bg: { id: 'oubli', seed: 8 },
          fx: [{ type: 'glitch', n: 30 }],
          captions: [{ text: '10 h 00.', x: 0.05, y: 0.06, style: 'rouge' }],
          sfx: [{ text: 'CRRRK', x: 0.5, y: 0.6, size: 80, rot: -8, color: '#c4b5fd' }],
          sound: 'boss',
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 2
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [{ h: 0.45, cols: [1], tilt: -40 }, { h: 0.27, cols: [0.42, 0.58], ctilt: [30] }, { h: 0.28, cols: [1] }],
      panels: [
        { // L'Oubli traverse la bibliothèque, les pages se vident
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.48, vp: 0.5 },
          chars: [
            { id: 'oubli', pose: 'cri', shot: 'taille', x: 0.55, y: 0.05, fill: 1.0, seed: 13 },
            { id: 'etudiant', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.18, y: 0.99, fill: 0.5, flip: true, blur: 60 },
            { id: 'etudiante', pose: 'choc', expr: 'surprise', shot: 'pied', x: 0.84, y: 0.99, fill: 0.48 },
          ],
          fx: [{ type: 'glitch', n: 26 }, { type: 'vignette', opacity: 0.5 }],
          sfx: [{ text: 'FWOOOSH', x: 0.5, y: 0.9, size: 96, rot: -5, color: '#c4b5fd' }],
          captions: [{ text: 'Les pages des livres deviennent blanches, une à une.', x: 0.03, y: 0.04, w: 0.5, style: 'noir' }],
          sound: 'boss',
        },
        { // Nia ne fuit pas
          bg: { id: 'aplat', color: '#2a0f3a', color2: '#05030a' },
          chars: [{ id: 'nia', pose: 'debout', expr: 'concentration', shot: 'gros', x: 0.5, y: 0.22, fill: 0.85 }],
          bubbles: [{ type: 'parole', text: 'Personne ne bouge. Respirez.', x: 0.5, y: 0.12, w: 0.8, who: 0 }],
        },
        { // Kaï n'arrive pas à le toucher
          bg: { id: 'flash', color: '#140a22', lines: '#7c3aed', cx: 0.7 },
          chars: [
            { id: 'oubli', pose: 'flotte', shot: 'pied', x: 0.8, y: 1.0, fill: 0.9, seed: 3 },
            { id: 'kai', pose: 'esquive', expr: 'surprise', shot: 'pied', x: 0.3, y: 0.98, fill: 0.8, blur: 50 },
          ],
          bubbles: [{ type: 'cri', text: 'Il est trop rapide !', x: 0.3, y: 0.14, w: 0.45, who: 1, size: 28 }],
        },
        { // Le pouvoir de Nia : les métaphores prennent forme
          bg: { id: 'flash', color: '#fff0fb', lines: '#e879f9', cx: 0.3, cy: 0.5 },
          chars: [{ id: 'nia', pose: 'main_tendue', expr: 'celebration', shot: 'americain', x: 0.3, y: 0.08, fill: 0.95, aura: '#e879f9' }],
          bubbles: [{ type: 'cri', text: 'L’Oubli, c’est une marée : il n’emporte que ce qui n’est pas ancré. ANCREZ-VOUS !', x: 0.7, y: 0.45, w: 0.48, who: 0, size: 27 }],
          sfx: [{ text: '♪', x: 0.12, y: 0.25, size: 70, rot: -10, color: '#e879f9' }],
          sound: 'sparkle',
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 3
    {
      gutter: 'blanc',
      ambient: 'pluie',
      rows: [{ h: 0.4, cols: [1], tilt: 36 }, { h: 0.3, cols: [0.55, 0.45], ctilt: [-26] }, { h: 0.3, cols: [1] }],
      panels: [
        { // Le coup final, guidé par Mory
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.6 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.82, y: 1.02, fill: 0.92, seed: 21 },
            { id: 'mory', pose: 'pointer', expr: 'concentration', shot: 'pied', x: 0.1, y: 1.0, fill: 0.5 },
            { id: 'kai', pose: 'coup_de_poing', expr: 'celebration', shot: 'pied', x: 0.44, y: 1.02, fill: 0.85, aura: '#8b5cf6' },
          ],
          fx: [{ type: 'lueur', x: 0.5, y: 0.5, color: '#e879f9', size: 0.6, opacity: 0.4, layer: 'back' }, { type: 'impact', x: 0.74, y: 0.36, size: 0.24, color: '#fbcfe8', layer: 'front' }],
          sfx: [{ text: 'BAM !', x: 0.72, y: 0.14, size: 100, rot: 10, color: '#f472b6' }],
          sound: 'hit',
        },
        { // Nia, plus tard, un aveu
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.8 },
          chars: [{ id: 'nia', pose: 'debout', expr: 'encouragement', shot: 'taille', x: 0.5, y: 0.22, fill: 0.85 }],
          captions: [{ text: 'Plus tard.', x: 0.04, y: 0.84, style: 'jaune' }],
          bubbles: [{ type: 'parole', text: 'Avant, on disait que je compliquais tout.', x: 0.5, y: 0.13, w: 0.8, who: 0, size: 27 }],
        },
        { // Kaï lui propose de rejoindre l'équipe
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.2 },
          chars: [
            { id: 'kai', pose: 'main_tendue', expr: 'joie', shot: 'taille', x: 0.34, y: 0.22, fill: 0.85 },
          ],
          bubbles: [{ type: 'parole', text: 'Toi, tu rends les choses simples. Rejoins-nous.', x: 0.5, y: 0.13, w: 0.85, who: 0, size: 27 }],
        },
        { // Réponse de Nia + cliffhanger : un éclair sur la corniche
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.3, sunX: 0.85 },
          chars: [{ id: 'sora', pose: 'course', expr: 'concentration', shot: 'pied', x: 0.55, y: 0.95, fill: 0.55, blur: -160, aura: '#c6ff3d' }],
          fx: [{ type: 'vitesse', angle: 0, n: 30, opacity: 0.5, color: '#c6ff3d', layer: 'front' }],
          captions: [
            { text: '« D’accord. Mais c’est moi qui écris les résumés. » — Nia', x: 0.03, y: 0.06, w: 0.55, style: 'blanc' },
            { text: 'Le lendemain, 5 h 40. La corniche.', x: 0.03, y: 0.3, w: 0.45, style: 'noir' },
            { text: 'À suivre…', x: 0.03, y: 0.8, style: 'noir', right: true },
          ],
          sfx: [{ text: 'ZIIIP', x: 0.86, y: 0.3, size: 80, rot: -4, color: '#c6ff3d' }],
          sound: 'swipe',
        },
      ],
    },
  ],
};
