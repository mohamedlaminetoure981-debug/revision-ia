// =====================================================================
// CHAPITRE 2 — « Le signal »  (Mory)
// Format : voir ch01.js (en-tête) et le README.
// =====================================================================

export default {
  id: 2,
  title: 'Le signal',
  pages: [
    // ------------------------------------------------------------- PAGE 1
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [{ h: 0.36, cols: [1], tilt: 30 }, { h: 0.3, cols: [0.52, 0.48], ctilt: [-30] }, { h: 0.34, cols: [0.42, 0.58] }],
      panels: [
        { // L'amphi, premier cours
          bg: { id: 'classe', time: 'jour', horizon: 0.42, vp: 0.5 },
          chars: [
            { id: 'etudiante', pose: 'assis_bureau', shot: 'pied', x: 0.18, y: 0.98, fill: 0.5 },
            { id: 'kai', pose: 'assis_bureau', expr: 'neutre', shot: 'pied', x: 0.5, y: 1.02, fill: 0.62 },
            { id: 'etudiant', pose: 'assis_bureau', shot: 'pied', x: 0.84, y: 0.98, fill: 0.5, flip: true },
          ],
          captions: [{ text: 'Université de Conakry. Premier cours.', x: 0.03, y: 0.05, style: 'noir', w: 0.5 }],
          bubbles: [{ type: 'parole', text: 'Les graphes, c’est la base de toute l’algorithmique. Notez bien.', x: 0.74, y: 0.2, w: 0.4, tail: [0.6, 0.3] }],
        },
        { // Kaï, la tête ailleurs
          bg: { id: 'aplat', color: '#e7d9b8', color2: '#b9a07a' },
          chars: [{ id: 'kai', pose: 'debout', expr: 'encouragement', shot: 'gros', x: 0.5, y: 0.1, fill: 0.95 }],
          bubbles: [{ type: 'pensee', text: 'Personne ne parle d’hier ? L’ombre, les panneaux vides… rien ?', x: 0.5, y: 0.16, w: 0.8, tail: false }],
        },
        { // Mory s'assoit à côté
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.15 },
          chars: [{ id: 'mory', pose: 'bras_croises', expr: 'clin', shot: 'taille', x: 0.55, y: 0.18, fill: 0.85, flip: true }],
          fx: [{ type: 'lueur', x: 0.5, y: 0.36, color: '#22d3ee', size: 0.2, opacity: 0.55 }],
          bubbles: [{ type: 'parole', text: 'Toi. Le gars de Madina. T’as frappé l’Oubli à mains nues.', x: 0.5, y: 0.12, w: 0.85, who: 0 }],
        },
        { // Kaï surpris
          bg: { id: 'flash', color: '#fffbe6', lines: '#8b5cf6' },
          chars: [{ id: 'kai', pose: 'choc', expr: 'surprise', shot: 'buste', x: 0.5, y: 0.2, fill: 0.85 }],
          bubbles: [{ type: 'cri', text: 'Tu l’as VU ?!', x: 0.5, y: 0.14, w: 0.6, tail: false, size: 32 }],
          sfx: [{ text: '!?', x: 0.86, y: 0.5, size: 70, rot: 12, color: '#8b5cf6' }],
        },
        { // L'écran de Mory : la carte des attaques
          bg: { id: 'carte', text: 'OUBLI · ATTAQUES · 7 JOURS', spots: 9, loading: 0.4 },
          bubbles: [{ type: 'parole', text: 'Je le traque depuis un mois. Il frappe là où personne ne révise.', x: 0.5, y: 0.82, w: 0.8, tail: false }],
          sound: 'bubble',
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 2
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.3, cols: [0.6, 0.4] }, { h: 0.4, cols: [1], tilt: -40 }, { h: 0.3, cols: [0.5, 0.5], ctilt: [30] }],
      panels: [
        { // Le toit de Mory, son antenne bricolée
          bg: { id: 'toit', time: 'nuit', horizon: 0.5, tankX: 0.9 },
          chars: [
            { id: 'mory', pose: 'pointer', expr: 'joie', shot: 'pied', x: 0.32, y: 0.97, fill: 0.62 },
            { id: 'kai', pose: 'mains_poches', expr: 'neutre', shot: 'pied', x: 0.68, y: 0.97, fill: 0.64, flip: true },
          ],
          captions: [{ text: 'Le soir. Toit de Mory, Kaloum.', x: 0.03, y: 0.88, style: 'noir', w: 0.6 }],
          bubbles: [
            { type: 'parole', text: 'Mon antenne capte ses pics d’énergie. Deux barres de réseau, mais ça marche.', x: 0.66, y: 0.15, w: 0.62, who: 0, size: 27 },
          ],
        },
        { // Humour : la connexion
          bg: { id: 'carte', loading: 0.08, spots: 3, text: 'CHARGEMENT… (40 s)' },
          chars: [{ id: 'mory', pose: 'debout', expr: 'clin', shot: 'gros', x: 0.5, y: 0.34, fill: 0.7 }],
          bubbles: [{ type: 'parole', text: '40 secondes de chargement. C’est mon entraînement mental.', x: 0.5, y: 0.14, w: 0.85, who: 0 }],
        },
        { // L'Oubli surgit au-dessus de la ville
          bg: { id: 'toit', time: 'nuit', horizon: 0.62, props: false, roofY: 0.96 },
          chars: [
            { id: 'oubli', pose: 'cri', shot: 'taille', x: 0.55, y: 0.02, fill: 1.05, seed: 5 },
            { id: 'kai', pose: 'garde', expr: 'concentration', shot: 'pied', x: 0.18, y: 0.98, fill: 0.42, light: 'contre' },
            { id: 'mory', pose: 'choc', expr: 'surprise', shot: 'pied', x: 0.32, y: 0.98, fill: 0.4, light: 'contre' },
          ],
          fx: [{ type: 'glitch', n: 10 }, { type: 'vignette', opacity: 0.5 }],
          sfx: [{ text: 'VRRRMM', x: 0.78, y: 0.86, size: 86, rot: -6, color: '#c4b5fd' }],
          sound: 'boss',
        },
        { // Mory analyse : son visor s'allume
          bg: { id: 'flash', color: '#04141c', lines: '#22d3ee' },
          chars: [{ id: 'mory', pose: 'debout', expr: 'concentration', shot: 'yeux', x: 0.5, y: 0.6, fill: 0.6 }],
          fx: [{ type: 'lueur', x: 0.5, y: 0.6, color: '#22d3ee', size: 0.5, opacity: 0.45 }],
          bubbles: [{ type: 'parole', text: 'Analyse… Point faible : l’épaule gauche. Certitude : 87 %.', x: 0.5, y: 0.17, w: 0.9, tail: false }],
          sound: 'sparkle',
        },
        { // Kaï s'élance
          bg: { id: 'flash', color: '#1a1030', lines: '#8b5cf6', cx: 0.6, cy: 0.3 },
          chars: [{ id: 'kai', pose: 'saut', expr: 'celebration', shot: 'pied', x: 0.5, y: 0.95, fill: 0.78, aura: '#8b5cf6' }],
          bubbles: [{ type: 'cri', text: 'Je te fais confiance, le geek !', x: 0.5, y: 0.13, w: 0.75, who: 0, size: 30 }],
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 3
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.42, cols: [1], tilt: 40 }, { h: 0.28, cols: [0.5, 0.5] }, { h: 0.3, cols: [1] }],
      panels: [
        { // Le coup, guidé par Mory
          bg: { id: 'flash', color: '#f3f8ff', lines: '#22d3ee', cx: 0.7, cy: 0.35 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.8, y: 1.02, fill: 0.95, seed: 6 },
            { id: 'kai', pose: 'coup_de_poing', expr: 'celebration', shot: 'pied', x: 0.36, y: 1.03, fill: 0.95, aura: '#8b5cf6', break: true },
          ],
          fx: [{ type: 'impact', x: 0.7, y: 0.3, size: 0.28, color: '#cffafe', layer: 'front' }],
          sfx: [{ text: 'KRAK !', x: 0.66, y: 0.84, size: 120, rot: -8, color: '#22d3ee' }],
          sound: 'hit',
        },
        { // L'Oubli se défait
          bg: { id: 'toit', time: 'nuit', horizon: 0.55, props: false, roofY: 1.05 },
          chars: [{ id: 'oubli', pose: 'recul', shot: 'pied', x: 0.5, y: 1.0, fill: 0.7, seed: 12 }],
          fx: [{ type: 'glitch', n: 24 }],
          sfx: [{ text: 'fshhh…', x: 0.7, y: 0.2, size: 50, rot: 6, color: '#c4b5fd' }],
        },
        { // Mory, modeste
          bg: { id: 'toit', time: 'nuit', horizon: 0.6, props: false, roofY: 1.1 },
          chars: [{ id: 'mory', pose: 'bras_croises', expr: 'clin', shot: 'taille', x: 0.5, y: 0.22, fill: 0.85 }],
          bubbles: [{ type: 'parole', text: 'Je suis pas un combattant. Je suis le gars qui sait OÙ frapper.', x: 0.5, y: 0.13, w: 0.9, who: 0 }],
        },
        { // Cliffhanger : la prochaine cible
          bg: { id: 'carte', text: 'NOUVEAU PIC D’ÉNERGIE', spots: 4, target: [0.48, 0.4], label: 'BIBLIOTHÈQUE · 10 H' },
          chars: [
            { id: 'kai', pose: 'debout', expr: 'concentration', shot: 'buste', x: 0.12, y: 0.25, fill: 0.95, light: 'contre' },
            { id: 'mory', pose: 'debout', expr: 'concentration', shot: 'buste', x: 0.88, y: 0.22, fill: 0.95, light: 'contre', flip: true },
          ],
          bubbles: [{ type: 'parole', text: 'Il prépare un gros coup. Demain… là où on garde les livres.', x: 0.5, y: 0.78, w: 0.6, tail: false }],
          captions: [{ text: 'À suivre…', x: 0.03, y: 0.06, style: 'noir', right: true }],
          sound: 'boss',
        },
      ],
    },
  ],
};
