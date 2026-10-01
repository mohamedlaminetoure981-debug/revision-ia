// =====================================================================
// CHAPITRE 1 — « 3 h 12 »  (Kaï)
// ---------------------------------------------------------------------
// Format d'un chapitre : voir le README (section "Mode Histoire en BD").
// Rappel rapide :
//   pages[].rows   : grille de cases [{ h, cols, tilt, ctilt }] (hauteurs, colonnes, biais)
//   pages[].gutter : 'blanc' ou 'noir' (couleur entre les cases)
//   pages[].ambient: ambiance sonore ('mer', 'ville', 'nuit', 'pluie', 'dojo', 'marche')
//   panels[] (dans l'ordre de lecture) :
//     bg       : { id: décor, time, horizon, vp, … }   (src/comic/decors.js)
//     chars    : [{ id, pose, expr, shot, x, y, fill, flip, light, blur, aura, break }]
//                shot = 'pied' | 'americain' | 'taille' | 'buste' | 'gros' | 'yeux'
//     fx       : [{ type: 'vitesse'|'concentration'|'impact'|'pluie'|'trame'|'vignette'|'lueur'|'teinte'|'glitch', … }]
//     bubbles  : [{ type: 'parole'|'pensee'|'cri'|'murmure', text, x, y, w, who }]
//     captions : [{ text, x, y, w, style: 'jaune'|'noir'|'blanc'|'rouge', right }]
//     sfx      : [{ text, x, y, size, rot, color }]   (onomatopées dessinées)
//     sound    : effet sonore joué quand la case s'affiche (src/ui/sfx.js)
//     image    : illustration qui REMPLACE le dessin de la case (optionnel)
// =====================================================================

export default {
  id: 1,
  title: '3 h 12',
  pages: [
    // ------------------------------------------------------------- PAGE 1
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [{ h: 0.46, cols: [1], tilt: -36 }, { h: 0.26, cols: [0.4, 0.6], ctilt: [26] }, { h: 0.28, cols: [1] }],
      panels: [
        { // Plan large d'ambiance : la corniche au coucher du soleil
          bg: { id: 'corniche', time: 'couchant', horizon: 0.6, vp: 0.46, sunX: 0.8 },
          chars: [{ id: 'kai', pose: 'marche', expr: 'neutre', shot: 'pied', x: 0.6, y: 0.95, fill: 0.36 }],
          captions: [
            { text: 'Conakry. Septembre 2026.', x: 0.03, y: 0.04, style: 'noir', w: 0.5 },
            { text: 'La veille de la rentrée. Le soleil se couche sur la corniche… et sur mes vacances.', x: 0.03, y: 0.05, w: 0.42, right: true },
          ],
        },
        { // Gros plan : Kaï pensif
          bg: { id: 'aplat', time: 'couchant', color: '#d0507a', color2: '#2a1b5c' },
          chars: [{ id: 'kai', pose: 'debout', expr: 'reflexion', shot: 'gros', x: 0.55, y: 0.06, fill: 1 }],
          fx: [{ type: 'lueur', x: 0.95, y: 0.25, color: '#ffb36b', size: 0.7, opacity: 0.55, layer: 'back' }],
        },
        { // Il regarde la mer
          bg: { id: 'corniche', time: 'couchant', horizon: 0.42, vp: 0.15, sunX: 0.5 },
          chars: [{ id: 'kai', pose: 'mains_poches', expr: 'neutre', shot: 'taille', x: 0.74, y: 0.1, fill: 0.95 }],
          bubbles: [{ type: 'pensee', text: 'Licence 2 d’info. Encore une année à faire semblant d’être prêt.', x: 0.33, y: 0.3, w: 0.44, who: 0 }],
        },
        { // Le taxi qui fonce
          bg: { id: 'rue', time: 'couchant', horizon: 0.42, vp: 0.6, vehicles: [{ k: 'taxi', X: 0.35, z: 0.75, front: true }] },
          chars: [{ id: 'kai', pose: 'esquive', expr: 'surprise', shot: 'pied', x: 0.15, y: 0.99, fill: 0.84, flip: true, blur: 70 }],
          fx: [{ type: 'vitesse', angle: 6, n: 24, opacity: 0.35, color: '#fff', layer: 'front' }],
          sfx: [{ text: 'TUUUT !', x: 0.74, y: 0.2, size: 84, rot: -8, color: '#ffd23f' }],
          bubbles: [
            { type: 'cri', text: 'Hé, petit ! On dort debout ?!', x: 0.76, y: 0.55, w: 0.3, tail: [0.62, 0.62] },
            { type: 'parole', text: 'Pardon, tonton !', x: 0.37, y: 0.16, w: 0.26, who: 0 },
          ],
          sound: 'boss',
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 2
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.33, cols: [1] }, { h: 0.3, cols: [0.5, 0.5] }, { h: 0.37, cols: [0.6, 0.4], ctilt: [-40] }],
      panels: [
        { // La chambre, 3 h 12
          bg: { id: 'chambre', time: 'nuit', horizon: 0.44, vp: 0.45 },
          chars: [{ id: 'kai', pose: 'assis_bureau', expr: 'concentration', shot: 'pied', x: 0.68, y: 0.9, fill: 0.62 }],
          captions: [{ text: '3 h 12.', x: 0.03, y: 0.05, style: 'noir' }],
          bubbles: [{ type: 'pensee', text: 'Je dors pas. Je dors jamais avant une rentrée.', x: 0.33, y: 0.26, w: 0.4, who: 0 }],
        },
        { // Le téléphone vibre : message du Créateur
          bg: { id: 'ecran', text: 'Kaï. Tu es le guide. Réunis-les avant que l’Oubli n’efface tout.', from: 'LE CRÉATEUR', clock: '03:12' },
          sfx: [{ text: 'BZZZT', x: 0.78, y: 0.88, size: 54, rot: -14, color: '#8be9ff' }],
          sound: 'bubble',
        },
        { // Très gros plan : le regard
          bg: { id: 'flash', color: '#0d1530', lines: '#8be9ff', cy: 0.5 },
          chars: [{ id: 'kai', pose: 'debout', expr: 'surprise', shot: 'yeux', x: 0.5, y: 0.56, fill: 0.62 }],
          bubbles: [{ type: 'murmure', text: '…Comment il connaît mon nom ?', x: 0.5, y: 0.13, w: 0.8, tail: false }],
        },
        { // La ville : les lumières s'éteignent
          bg: { id: 'toit', time: 'nuit', horizon: 0.42, props: false, roofY: 1.2 },
          chars: [{ id: 'oubli', pose: 'cri', shot: 'pied', x: 0.7, y: 0.98, fill: 0.78, seed: 4 }],
          fx: [{ type: 'glitch', n: 10 }, { type: 'vignette', opacity: 0.55 }],
          captions: [{ text: 'Au même moment, au-dessus de Kaloum, les lumières s’éteignent une à une.', x: 0.03, y: 0.04, w: 0.55, style: 'noir' }],
          sound: 'boss',
        },
        { // Kaï à la fenêtre, de dos
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'kai', pose: 'epaule', expr: 'surprise', shot: 'taille', x: 0.52, y: 0.16, fill: 0.9 }],
          fx: [{ type: 'lueur', x: 0.6, y: 0.3, color: '#7c3aed', size: 0.8, opacity: 0.45, layer: 'back' }],
          bubbles: [{ type: 'murmure', text: 'C’est quoi… ce truc ?', x: 0.5, y: 0.08, w: 0.85, tail: false }],
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 3
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [{ h: 0.26, cols: [0.56, 0.44], ctilt: [34] }, { h: 0.42, cols: [1], tilt: 56 }, { h: 0.32, cols: [0.42, 0.58], ctilt: [-52] }],
      panels: [
        { // Le marché : la vendeuse a tout oublié
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.62 },
          chars: [{ id: 'vendeuse', pose: 'choc', expr: 'surprise', shot: 'americain', x: 0.26, y: 0.2, fill: 0.85 }],
          captions: [{ text: 'Le lendemain. Marché de Madina.', x: 0.03, y: 0.04, style: 'noir', w: 0.6 }],
          bubbles: [{ type: 'parole', text: 'Mes prix… je me souviens plus d’aucun prix !', x: 0.68, y: 0.42, w: 0.5, who: 0 }],
        },
        { // Les enseignes s'effacent
          bg: { id: 'rue', time: 'jour', horizon: 0.45, vp: 0.3, cars: false },
          chars: [{ id: 'kai', pose: 'choc', expr: 'surprise', shot: 'taille', x: 0.55, y: 0.28, fill: 0.8 }],
          fx: [{ type: 'glitch', n: 8 }],
          bubbles: [{ type: 'parole', text: 'Les panneaux… ils se vident ?!', x: 0.48, y: 0.15, w: 0.75, who: 0 }],
        },
        { // L'Oubli surgit, Kaï plonge
          bg: { id: 'rue', time: 'jour', horizon: 0.6, vp: 0.72, cars: false },
          chars: [
            { id: 'oubli', pose: 'attaque', shot: 'pied', x: 0.76, y: 1.0, fill: 0.86, seed: 9 },
            { id: 'etudiant', pose: 'choc', expr: 'surprise', shot: 'pied', x: 0.52, y: 0.97, fill: 0.62 },
            { id: 'kai', pose: 'plongeon', expr: 'concentration', shot: 'pied', x: 0.2, y: 0.95, fill: 0.62, blur: -100 },
          ],
          fx: [{ type: 'vitesse', angle: 4, n: 36, opacity: 0.45 }, { type: 'glitch', n: 8 }],
          sfx: [{ text: 'WHOOOM', x: 0.7, y: 0.92, size: 92, rot: -6, color: '#c4b5fd' }],
          bubbles: [
            { type: 'cri', text: 'BOUGE !!', x: 0.16, y: 0.16, w: 0.25, who: 2 },
            { type: 'cri', text: 'MON CAHIER ! Tout est effacé !', x: 0.52, y: 0.17, w: 0.34, who: 1 },
          ],
          sound: 'hit',
        },
        { // Impact
          bg: { id: 'flash', color: '#fff7e0', lines: '#120b09', cx: 0.55, cy: 0.5 },
          chars: [{ id: 'kai', pose: 'chute', expr: 'concentration', shot: 'pied', x: 0.42, y: 0.92, fill: 0.62 }],
          fx: [{ type: 'impact', x: 0.66, y: 0.46, size: 0.36, layer: 'front' }],
          sfx: [{ text: 'BAM !', x: 0.66, y: 0.22, size: 110, rot: 12, color: '#ff5a3d' }],
          sound: 'hit',
        },
        { // Contre-plongée : l'Oubli au-dessus de Kaï
          bg: { id: 'oubli' },
          chars: [
            { id: 'oubli', pose: 'flotte', shot: 'taille', x: 0.64, y: 0.02, fill: 1, seed: 2 },
            { id: 'kai', pose: 'debout', expr: 'surprise', shot: 'gros', x: 0.22, y: 0.42, fill: 0.62, light: '#7c3aed' },
          ],
          bubbles: [{ type: 'murmure', text: '…Savoir… non révisé… À MOI…', x: 0.62, y: 0.84, w: 0.55, tail: false, fill: '#0b0614', ink: '#7c3aed', color: '#e9d5ff' }],
        },
      ],
    },
    // ------------------------------------------------------------- PAGE 4
    {
      gutter: 'noir',
      ambient: 'ville',
      rows: [{ h: 0.22, cols: [0.5, 0.5] }, { h: 0.52, cols: [1], tilt: -46 }, { h: 0.26, cols: [0.55, 0.45], ctilt: [36] }],
      panels: [
        { // Le téléphone s'allume
          bg: { id: 'ecran', text: 'Révise une notion. Une seule. Maintenant.', from: 'RÉVISION IA', clock: '08:47' },
          sound: 'sparkle',
        },
        { // Il se souvient
          bg: { id: 'flash', color: '#2a1f55', lines: '#8b5cf6' },
          chars: [{ id: 'kai', pose: 'debout', expr: 'concentration', shot: 'yeux', x: 0.5, y: 0.62, fill: 0.55 }],
          bubbles: [{ type: 'pensee', text: 'Hier soir… les suites. u(n+1) = q × u(n). JE M’EN SOUVIENS !', x: 0.5, y: 0.22, w: 0.88, tail: false }],
        },
        { // LE COUP — Kaï déborde du cadre
          bg: { id: 'flash', color: '#fff3f8', lines: '#7c3aed', cx: 0.72, cy: 0.42 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.84, y: 1.02, fill: 0.95, seed: 7 },
            { id: 'kai', pose: 'coup_de_poing', expr: 'celebration', shot: 'pied', x: 0.33, y: 1.04, fill: 0.98, aura: '#8b5cf6', break: true },
          ],
          fx: [{ type: 'impact', x: 0.72, y: 0.38, size: 0.3, color: '#e9d5ff', layer: 'front' }],
          sfx: [{ text: 'KRAAAK !', x: 0.66, y: 0.84, size: 120, rot: -9, color: '#c084fc' }],
          sound: 'hit',
        },
        { // L'Oubli se dissout
          bg: { id: 'rue', time: 'jour', horizon: 0.5, vp: 0.5, cars: false },
          chars: [{ id: 'oubli', pose: 'recul', shot: 'pied', x: 0.6, y: 0.98, fill: 0.62, seed: 11 }],
          fx: [{ type: 'glitch', n: 18 }],
          bubbles: [{ type: 'parole', text: 'Il… recule ? Il fuit ?!', x: 0.4, y: 0.16, w: 0.7, tail: [0.08, 0.95] }],
          sound: 'sparkle',
        },
        { // Cliffhanger : quelqu'un observait
          bg: { id: 'toit', time: 'jour', horizon: 0.62, props: false, roofY: 0.98 },
          chars: [{ id: 'mory', pose: 'bras_croises', expr: 'clin', shot: 'americain', x: 0.64, y: 0.14, fill: 0.86, light: 'contre' }],
          fx: [{ type: 'lueur', x: 0.64, y: 0.28, color: '#22d3ee', size: 0.16, opacity: 0.9 }],
          bubbles: [{ type: 'murmure', text: 'Un deuxième… enfin.', x: 0.33, y: 0.15, w: 0.55, who: 0 }],
          captions: [{ text: 'À suivre…', x: 0.04, y: 0.8, style: 'noir', right: true }],
        },
      ],
    },
  ],
};
