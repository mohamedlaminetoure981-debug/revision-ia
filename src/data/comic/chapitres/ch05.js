// =====================================================================
// CHAPITRE 5 — « Le rival »  (Ren)
// Format : voir ch01.js (en-tête) et le README.
// =====================================================================

export default {
  id: 5,
  title: 'Le rival',
  pages: [
    // ------------------------------------------------------------- PAGE 1
    {
      gutter: 'noir',
      ambient: 'marche',
      rows: [{ h: 0.42, cols: [1], tilt: 34 }, { h: 0.27, cols: [0.5, 0.5], ctilt: [-24] }, { h: 0.31, cols: [0.42, 0.58], ctilt: [30] }],
      panels: [
        { // La finale : Ren sur scène
          bg: { id: 'arene', text: 'FINALE', score: 'REN · 10/10 · 40 s', cheer: true },
          chars: [{ id: 'ren', pose: 'poing_leve', expr: 'clin', shot: 'pied', x: 0.5, y: 0.82, fill: 0.5, aura: '#ff5a3d' }],
          captions: [{ text: 'Amphi B. Tournoi de quiz. La finale.', x: 0.03, y: 0.05, w: 0.5, style: 'noir' }],
          sfx: [{ text: 'OUAAAIS !', x: 0.78, y: 0.88, size: 70, rot: -6, color: '#ffd23f' }],
          sound: 'victory',
        },
        { // Ren, blasé
          bg: { id: 'aplat', color: '#3a1410', color2: '#0b0405' },
          chars: [{ id: 'ren', pose: 'debout', expr: 'neutre', shot: 'gros', x: 0.5, y: 0.22, fill: 0.85 }],
          bubbles: [{ type: 'parole', text: 'Encore une victoire. Suivant.', x: 0.5, y: 0.13, w: 0.8, who: 0 }],
        },
        { // Kaï l'aborde
          bg: { id: 'arene', text: '', crowd: false },
          chars: [{ id: 'kai', pose: 'main_tendue', expr: 'encouragement', shot: 'taille', x: 0.4, y: 0.22, fill: 0.85 }],
          bubbles: [{ type: 'parole', text: 'On cherche des gens forts. Rejoins notre équipe.', x: 0.55, y: 0.13, w: 0.85, who: 0, size: 27 }],
        },
        { // Le refus
          bg: { id: 'arene', text: '', crowd: false, horizon: 0.7 },
          chars: [{ id: 'ren', pose: 'bras_croises', expr: 'neutre', shot: 'americain', x: 0.55, y: 0.24, fill: 0.85, flip: true }],
          bubbles: [{ type: 'parole', text: 'Je suis fort PARCE QUE je travaille seul.', x: 0.5, y: 0.12, w: 0.85, who: 0, size: 27 }],
        },
        { // Le défi
          bg: { id: 'flash', color: '#1a1030', lines: '#8b5cf6' },
          chars: [{ id: 'kai', pose: 'pointer', expr: 'concentration', shot: 'taille', x: 0.35, y: 0.2, fill: 0.85 }],
          bubbles: [{ type: 'cri', text: 'Alors bats-moi en duel. Si je gagne, tu nous écoutes !', x: 0.6, y: 0.15, w: 0.6, who: 0, size: 26 }],
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 2
    {
      gutter: 'noir',
      ambient: 'marche',
      rows: [{ h: 0.3, cols: [0.5, 0.5], ctilt: [24] }, { h: 0.4, cols: [1], tilt: -40 }, { h: 0.3, cols: [1] }],
      panels: [
        { // Le duel : Kaï sue
          bg: { id: 'arene', text: 'DUEL', score: 'KAÏ 7 · REN 10', crowd: false },
          chars: [{ id: 'kai', pose: 'penseur', expr: 'encouragement', shot: 'buste', x: 0.5, y: 0.4, fill: 0.7 }],
          sound: 'bad',
        },
        { // Ren gagne
          bg: { id: 'aplat', color: '#3a1410', color2: '#0b0405' },
          chars: [{ id: 'ren', pose: 'debout', expr: 'joie', shot: 'gros', x: 0.5, y: 0.22, fill: 0.85 }],
          bubbles: [{ type: 'parole', text: '10 à 7. Rentre chez toi, « le guide ».', x: 0.5, y: 0.12, w: 0.85, who: 0 }],
        },
        { // L'Oubli attaque l'arène
          bg: { id: 'arene', text: 'ERREUR', score: '???', horizon: 0.55 },
          chars: [
            { id: 'oubli', pose: 'cri', shot: 'taille', x: 0.68, y: 0.02, fill: 1.0, seed: 29 },
            { id: 'ren', pose: 'garde', expr: 'concentration', shot: 'pied', x: 0.26, y: 0.84, fill: 0.55, aura: '#ff5a3d' },
          ],
          fx: [{ type: 'glitch', n: 16 }],
          sfx: [{ text: 'VRRRMM', x: 0.3, y: 0.16, size: 84, rot: -6, color: '#c4b5fd' }],
          captions: [{ text: 'Le public s’enfuit. Ren, lui, ne bouge pas.', x: 0.03, y: 0.84, w: 0.5, style: 'noir' }],
          sound: 'boss',
        },
        { // Ren se bat seul
          bg: { id: 'flash', color: '#fff2ee', lines: '#ff5a3d', cx: 0.7, cy: 0.4 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.84, y: 1.04, fill: 0.95, seed: 31 },
            { id: 'ren', pose: 'coup_de_pied', expr: 'concentration', shot: 'pied', x: 0.38, y: 1.0, fill: 0.92, aura: '#ff5a3d', blur: 60 },
          ],
          fx: [{ type: 'impact', x: 0.72, y: 0.4, size: 0.26, color: '#ffd9d0', layer: 'front' }],
          bubbles: [{ type: 'cri', text: 'J’ai PAS besoin d’aide !', x: 0.26, y: 0.86, w: 0.42, who: 1, size: 28 }],
          sound: 'hit',
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 3
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.36, cols: [1], tilt: 30 }, { h: 0.3, cols: [0.5, 0.5], ctilt: [-26] }, { h: 0.34, cols: [1] }],
      panels: [
        { // La griffe touche Ren
          bg: { id: 'flash', color: '#140a22', lines: '#7c3aed', cx: 0.4, cy: 0.5 },
          chars: [
            { id: 'oubli', pose: 'attaque', shot: 'pied', x: 0.75, y: 1.03, fill: 0.98, seed: 33 },
            { id: 'ren', pose: 'esquive', expr: 'surprise', shot: 'pied', x: 0.3, y: 1.0, fill: 0.88 },
          ],
          fx: [{ type: 'fissure', x: 0.42, y: 0.45, size: 0.25, layer: 'front' }],
          sfx: [{ text: 'SKRATCH', x: 0.55, y: 0.2, size: 80, rot: 8, color: '#c084fc' }],
          sound: 'boss',
        },
        { // Nia, calme
          bg: { id: 'arene', text: '', crowd: false, horizon: 0.75 },
          chars: [{ id: 'nia', pose: 'debout', expr: 'reflexion', shot: 'taille', x: 0.5, y: 0.22, fill: 0.85 }],
          bubbles: [{ type: 'parole', text: 'Même les meilleurs combattants ont un entraîneur, tu sais.', x: 0.5, y: 0.12, w: 0.9, who: 0, size: 25 }],
        },
        { // Ren s'en va
          bg: { id: 'arene', text: '', crowd: false, horizon: 0.75 },
          chars: [{ id: 'ren', pose: 'dos', expr: 'neutre', shot: 'americain', x: 0.5, y: 0.2, fill: 0.85 }],
          bubbles: [{ type: 'parole', text: 'Tch. Revenez quand vous saurez gagner.', x: 0.5, y: 0.1, w: 0.9, tail: false, size: 26 }],
        },
        { // Cliffhanger : la marque sur son bras
          bg: { id: 'toit', time: 'nuit', horizon: 0.55, props: false, roofY: 1.1 },
          chars: [{ id: 'ren', pose: 'tete_mains', expr: 'concentration', shot: 'taille', x: 0.62, y: 0.2, fill: 0.85 }],
          fx: [{ type: 'fissure', x: 0.42, y: 0.42, size: 0.22, layer: 'front' }, { type: 'vignette', opacity: 0.6 }],
          captions: [{ text: 'Cette nuit-là. Seul.', x: 0.03, y: 0.05, style: 'noir' }, { text: 'À suivre…', x: 0.03, y: 0.8, style: 'noir' }],
          bubbles: [{ type: 'pensee', text: 'C’est rien. Ça va partir. Personne ne doit savoir.', x: 0.3, y: 0.3, w: 0.42, who: 0, size: 25 }],
        },
      ],
    },
  ],
};
