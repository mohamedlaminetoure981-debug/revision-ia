// =====================================================================
// CHAPITRE 4 — « Éclair sur la corniche »  (Sora)
// Format : voir ch01.js (en-tête) et le README.
// =====================================================================

export default {
  id: 4,
  title: 'Éclair sur la corniche',
  pages: [
    // ------------------------------------------------------------- PAGE 1
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [{ h: 0.34, cols: [1], tilt: -30 }, { h: 0.3, cols: [0.45, 0.55], ctilt: [30] }, { h: 0.36, cols: [0.52, 0.48] }],
      panels: [
        { // Entraînement à l'aube
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.4, sunX: 0.86 },
          chars: [
            { id: 'mory', pose: 'tete_mains', expr: 'encouragement', shot: 'pied', x: 0.28, y: 0.97, fill: 0.5 },
            { id: 'kai', pose: 'marche', expr: 'joie', shot: 'pied', x: 0.56, y: 0.97, fill: 0.56 },
          ],
          captions: [{ text: 'Corniche, 5 h 40. Entraînement d’équipe (idée de Kaï).', x: 0.03, y: 0.05, w: 0.6, style: 'noir' }],
          bubbles: [{ type: 'parole', text: 'Pourquoi… on court… avant le soleil ?', x: 0.2, y: 0.42, w: 0.36, who: 0, size: 26 }],
        },
        { // Sora les dépasse
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.8, sunX: 0.3 },
          chars: [{ id: 'sora', pose: 'course', expr: 'clin', shot: 'pied', x: 0.55, y: 0.96, fill: 0.72, blur: -140, aura: '#c6ff3d' }],
          fx: [{ type: 'vitesse', angle: 0, n: 30, opacity: 0.5, color: '#c6ff3d', layer: 'front' }],
          sfx: [{ text: 'ZIP !', x: 0.2, y: 0.3, size: 70, rot: -10, color: '#c6ff3d' }],
          bubbles: [{ type: 'parole', text: 'Trop lents !', x: 0.72, y: 0.14, w: 0.4, who: 0 }],
          sound: 'swipe',
        },
        { // Kaï sidéré
          bg: { id: 'flash', color: '#fff7e8', lines: '#c6ff3d' },
          chars: [{ id: 'kai', pose: 'choc', expr: 'surprise', shot: 'buste', x: 0.5, y: 0.22, fill: 0.82 }],
          bubbles: [{ type: 'cri', text: 'C’était quoi, ÇA ?!', x: 0.5, y: 0.13, w: 0.7, tail: false, size: 30 }],
        },
        { // Sora se présente
          bg: { id: 'corniche', time: 'aube', horizon: 0.45, vp: 0.2, sunX: 0.7 },
          chars: [{ id: 'sora', pose: 'decontracte', expr: 'clin', shot: 'americain', x: 0.5, y: 0.2, fill: 0.8, flip: true }],
          bubbles: [{ type: 'parole', text: 'Sora. 10 km avant les cours. Et 200 fiches dans le taxi.', x: 0.5, y: 0.12, w: 0.85, who: 0, size: 27 }],
        },
        { // La méthode de Sora
          bg: { id: 'aplat', color: '#26330f', color2: '#0b1006' },
          chars: [
            { id: 'mory', pose: 'debout', expr: 'surprise', shot: 'gros', x: 0.28, y: 0.4, fill: 0.62 },
            { id: 'sora', pose: 'debout', expr: 'joie', shot: 'gros', x: 0.74, y: 0.42, fill: 0.62, flip: true },
          ],
          bubbles: [
            { type: 'parole', text: '200 fiches ?!', x: 0.26, y: 0.13, w: 0.4, who: 0, size: 27 },
            { type: 'parole', text: 'Un peu chaque jour : le cerveau garde tout.', x: 0.66, y: 0.15, w: 0.5, who: 1, size: 25 },
          ],
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 2
    {
      gutter: 'noir',
      ambient: 'mer',
      rows: [{ h: 0.42, cols: [1], tilt: 40 }, { h: 0.26, cols: [0.5, 0.5], ctilt: [-28] }, { h: 0.32, cols: [1] }],
      panels: [
        { // L'Oubli sort de la mer
          bg: { id: 'corniche', time: 'aube', horizon: 0.62, vp: 0.3, sunX: 0.85 },
          chars: [
            { id: 'oubli', pose: 'cri', shot: 'taille', x: 0.72, y: 0.03, fill: 1.05, seed: 17 },
            { id: 'passant', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.2, y: 0.99, fill: 0.42, flip: true, blur: 50 },
            { id: 'passante', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.36, y: 0.99, fill: 0.4, flip: true, blur: 50 },
          ],
          fx: [{ type: 'glitch', n: 14 }, { type: 'teinte', color: '#1a0b2e', opacity: 0.25 }],
          sfx: [{ text: 'SHHRAAA', x: 0.4, y: 0.2, size: 90, rot: -6, color: '#c4b5fd' }],
          sound: 'boss',
        },
        { // Sora repère la cible
          bg: { id: 'flash', color: '#0b1006', lines: '#c6ff3d' },
          chars: [{ id: 'sora', pose: 'debout', expr: 'concentration', shot: 'yeux', x: 0.5, y: 0.6, fill: 0.6 }],
          bubbles: [{ type: 'parole', text: 'Il vise la fille, là-bas !', x: 0.5, y: 0.16, w: 0.85, tail: false }],
        },
        { // Trop loin
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'kai', pose: 'garde', expr: 'concentration', shot: 'taille', x: 0.4, y: 0.22, fill: 0.85 }],
          bubbles: [{ type: 'cri', text: 'Trop loin ! On n’y arrivera jamais !', x: 0.55, y: 0.14, w: 0.7, who: 0, size: 27 }],
        },
        { // Sora fonce
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.9 },
          chars: [
            { id: 'etudiante', pose: 'chute', expr: 'surprise', shot: 'pied', x: 0.78, y: 0.95, fill: 0.55 },
            { id: 'sora', pose: 'plongeon', expr: 'celebration', shot: 'pied', x: 0.48, y: 0.92, fill: 0.62, blur: -220, aura: '#c6ff3d' },
          ],
          fx: [{ type: 'vitesse', angle: 0, n: 44, opacity: 0.6, color: '#c6ff3d', layer: 'front' }],
          sfx: [{ text: 'ZZZIIIIP', x: 0.3, y: 0.2, size: 96, rot: -4, color: '#c6ff3d' }],
          sound: 'swipe',
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 3
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [{ h: 0.34, cols: [0.5, 0.5], ctilt: [20] }, { h: 0.38, cols: [1], tilt: -30 }, { h: 0.28, cols: [0.6, 0.4] }],
      panels: [
        { // Le rythme de Sora : esquives
          bg: { id: 'flash', color: '#f6ffe0', lines: '#26330f' },
          chars: [
            { id: 'oubli', pose: 'attaque', shot: 'pied', x: 0.8, y: 1.02, fill: 0.88, seed: 23 },
            { id: 'sora', pose: 'esquive', expr: 'clin', shot: 'pied', x: 0.32, y: 0.98, fill: 0.78, blur: 60 },
          ],
          bubbles: [{ type: 'parole', text: 'Gauche ! Droite ! Gauche ! C’est un rythme, comme mes fiches.', x: 0.4, y: 0.14, w: 0.7, who: 1, size: 25 }],
        },
        { // Mory donne le signal
          bg: { id: 'flash', color: '#04141c', lines: '#22d3ee' },
          chars: [{ id: 'mory', pose: 'pointer', expr: 'concentration', shot: 'taille', x: 0.4, y: 0.2, fill: 0.85 }],
          bubbles: [{ type: 'cri', text: 'MAINTENANT ! Ensemble !', x: 0.55, y: 0.13, w: 0.7, who: 0, size: 28 }],
        },
        { // Double impact
          bg: { id: 'flash', color: '#fffdf2', lines: '#7c3aed', cx: 0.5, cy: 0.42 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.5, y: 1.04, fill: 0.92, seed: 4 },
            { id: 'kai', pose: 'coup_de_poing', expr: 'celebration', shot: 'pied', x: 0.18, y: 1.02, fill: 0.86, aura: '#8b5cf6', break: true },
            { id: 'sora', pose: 'coup_de_pied', expr: 'celebration', shot: 'pied', x: 0.84, y: 1.02, fill: 0.86, aura: '#c6ff3d', flip: true, break: true },
          ],
          fx: [{ type: 'impact', x: 0.5, y: 0.4, size: 0.3, color: '#f0ffd0', layer: 'front' }],
          sfx: [{ text: 'BADABOOM !', x: 0.5, y: 0.9, size: 100, rot: -4, color: '#c6ff3d' }],
          sound: 'hit',
        },
        { // L'équipe s'agrandit
          bg: { id: 'corniche', time: 'jour', horizon: 0.55, vp: 0.3, sunX: 0.9 },
          chars: [
            { id: 'mory', pose: 'bras_croises', expr: 'joie', shot: 'americain', x: 0.14, y: 0.24, fill: 0.68 },
            { id: 'nia', pose: 'debout', expr: 'joie', shot: 'americain', x: 0.37, y: 0.22, fill: 0.7 },
            { id: 'kai', pose: 'poing_leve', expr: 'joie', shot: 'americain', x: 0.62, y: 0.2, fill: 0.72 },
            { id: 'sora', pose: 'victoire', expr: 'celebration', shot: 'americain', x: 0.86, y: 0.22, fill: 0.7, flip: true },
          ],
          bubbles: [
            { type: 'parole', text: 'Tu serais la gardienne de la mémoire.', x: 0.3, y: 0.1, w: 0.45, who: 1, size: 24 },
            { type: 'parole', text: 'Ça claque. J’en suis !', x: 0.8, y: 0.1, w: 0.36, who: 3, size: 24 },
          ],
        },
        { // Cliffhanger : l'affiche du tournoi
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.85 },
          chars: [{ id: 'ren', pose: 'bras_croises', expr: 'clin', shot: 'americain', x: 0.7, y: 0.2, fill: 0.85, light: 'contre' }],
          captions: [
            { text: 'TOURNOI DE QUIZ — Champion invaincu : REN', x: 0.04, y: 0.08, w: 0.55, style: 'rouge' },
            { text: 'À suivre…', x: 0.04, y: 0.8, style: 'noir' },
          ],
        },
      ],
    },
  ],
};
