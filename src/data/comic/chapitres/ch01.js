// =====================================================================
// CHAPITRE 1 — « 3 h 12 »  (Kaï)
// ---------------------------------------------------------------------
// Format d'un chapitre : voir le README (section "Mode Histoire en BD").
// Rappel rapide :
//   pages[].rows   : grille de cases [{ h, cols, tilt, ctilt }] (hauteurs, colonnes, biais)
//   pages[].gutter : 'blanc' ou 'noir' (couleur entre les cases)
//   pages[].ambient: ambiance sonore ('mer', 'ville', 'nuit', 'pluie', 'dojo', 'marche')
//   panels[] (dans l'ordre de lecture) :
//     action   : description de la case en une phrase (storyboard pour l'artiste)
//     bg       : { id: décor, time, horizon, vp, fg (premier plan), … }   (src/comic/decors.js, ville.js)
//     chars    : [{ id, pose, expr, shot, x, y, fill, flip, turn, light, blur, aura, break }]
//                shot = 'pied' | 'americain' | 'taille' | 'buste' | 'gros' | 'yeux'
//                id 'poing' / 'pieds' (+ of: perso) = gros plans partiels
//     fx       : [{ type: 'vitesse'|'concentration'|'impact'|'pluie'|'trame'|'vignette'|'lueur'|'teinte'|'glitch'|'fissure', … }]
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
        {
          action: 'Plan large d’ambiance : la corniche au coucher du soleil. Kaï, petite silhouette à contre-jour, marche seul sur la promenade.',
          bg: { id: 'corniche', time: 'couchant', horizon: 0.6, vp: 0.46, sunX: 0.8, fg: 'feuilles', fgSide: -1 },
          chars: [{ id: 'kai', pose: 'marche', expr: 'neutre', shot: 'pied', x: 0.6, y: 0.95, fill: 0.3, light: 'contre' }],
          captions: [
            { text: 'Conakry. Septembre 2026.', x: 0.03, y: 0.06, style: 'noir', w: 0.5, right: true },
            { text: 'La veille de la rentrée. Le soleil se couche sur la corniche… et sur mes vacances.', x: 0.03, y: 0.7, w: 0.4 },
          ],
        },
        {
          action: 'Gros plan : Kaï, pensif, le visage tourné vers la mer, éclairé par le soleil couchant.',
          bg: { id: 'aplat', time: 'couchant', color: '#d0507a', color2: '#2a1b5c' },
          chars: [{ id: 'kai', expr: 'reflexion', shot: 'gros', x: 0.5, y: 0.08, fill: 1, turn: 0.3 }],
          fx: [{ type: 'lueur', x: 0.95, y: 0.25, color: '#ffb36b', size: 0.7, opacity: 0.55, layer: 'back' }],
        },
        {
          action: 'Plan poitrine : Kaï devant la mer et les pirogues, mains dans les poches. Il pense à la rentrée.',
          bg: { id: 'corniche', time: 'couchant', horizon: 0.42, vp: 0.12, sunX: 0.55 },
          chars: [{ id: 'kai', expr: 'neutre', shot: 'buste', x: 0.72, y: 0.12, fill: 0.95, turn: -0.25 }],
          bubbles: [{ type: 'pensee', text: 'Licence 2 d’info. Encore une année à faire semblant d’être prêt.', x: 0.32, y: 0.3, w: 0.44, who: 0 }],
        },
        {
          action: 'Un taxi jaune fonce vers le lecteur, phares allumés ; Kaï (silhouette) saute de côté, flou de mouvement. Humour.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.42, vp: 0.6, vehicles: [{ k: 'taxi', X: 0.35, z: 0.8, front: true }], crowd: 3 },
          chars: [{ id: 'kai', pose: 'esquive', shot: 'pied', x: 0.15, y: 0.99, fill: 0.8, flip: true, blur: 70 }],
          fx: [{ type: 'vitesse', angle: 6, n: 24, opacity: 0.35, color: '#fff', layer: 'front' }],
          sfx: [{ text: 'TUUUT !', x: 0.74, y: 0.2, size: 84, rot: -8, color: '#ffd23f' }],
          bubbles: [
            { type: 'cri', text: 'Hé, petit ! On dort debout ?!', x: 0.76, y: 0.48, w: 0.3, tail: [0.62, 0.66] },
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
        {
          action: 'Chambre d’étudiant, 3 h 12. Seule la lumière bleue de l’ordinateur éclaire Kaï, au bureau, qui n’arrive pas à dormir.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.44, vp: 0.38 },
          chars: [{ id: 'kai', expr: 'concentration', shot: 'buste', x: 0.74, y: 0.2, fill: 0.85, turn: -0.3 }],
          fx: [{ type: 'lueur', x: 0.62, y: 0.55, color: '#8be9ff', size: 0.5, opacity: 0.35 }],
          captions: [{ text: '3 h 12.', x: 0.03, y: 0.05, style: 'noir' }],
          bubbles: [{ type: 'pensee', text: 'Je dors pas. Je dors jamais avant une rentrée.', x: 0.3, y: 0.3, w: 0.4, who: 0 }],
        },
        {
          action: 'Très gros plan sur l’écran du téléphone qui vibre : un message du « Créateur ».',
          bg: { id: 'ecran', text: 'Kaï. Tu es le guide. Réunis-les avant que l’Oubli n’efface tout.', from: 'LE CRÉATEUR', clock: '03:12' },
          sfx: [{ text: 'BZZZT', x: 0.78, y: 0.88, size: 54, rot: -14, color: '#8be9ff' }],
          sound: 'bubble',
        },
        {
          action: 'Très gros plan sur les yeux de Kaï, écarquillés. Lignes de concentration bleues.',
          bg: { id: 'flash', color: '#0d1530', lines: '#8be9ff', cy: 0.5 },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'yeux', x: 0.5, y: 0.56, fill: 0.62 }],
          bubbles: [{ type: 'murmure', text: '…Comment il connaît mon nom ?', x: 0.5, y: 0.13, w: 0.8, tail: false }],
        },
        {
          action: 'Plan large sur la ville la nuit : une immense ombre (l’Oubli) se dresse au-dessus de Kaloum ; les lumières s’éteignent.',
          bg: { id: 'toit', time: 'nuit', horizon: 0.42, props: false, roofY: 1.2 },
          chars: [{ id: 'oubli', pose: 'cri', shot: 'pied', x: 0.7, y: 0.98, fill: 0.78, seed: 4 }],
          fx: [{ type: 'glitch', n: 10 }, { type: 'vignette', opacity: 0.55 }],
          captions: [{ text: 'Au même moment, au-dessus de Kaloum, les lumières s’éteignent une à une.', x: 0.03, y: 0.04, w: 0.55, style: 'noir' }],
          sound: 'boss',
        },
        {
          action: 'Kaï, de dos, face à la fenêtre ; une lueur violette entre dans la chambre.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'kai', pose: 'dos', shot: 'americain', x: 0.5, y: 0.2, fill: 0.9 }],
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
        {
          action: 'Marché de Madina, le matin : une vendeuse, désemparée, a oublié tous ses prix.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.62 },
          chars: [{ id: 'vendeuse', pose: 'debout', expr: 'surprise', shot: 'americain', x: 0.26, y: 0.22, fill: 0.85 }],
          captions: [{ text: 'Le lendemain. Marché de Madina.', x: 0.03, y: 0.82, style: 'noir', w: 0.6 }],
          bubbles: [{ type: 'parole', text: 'Mes prix… je me souviens plus d’aucun prix !', x: 0.68, y: 0.3, w: 0.5, who: 0 }],
        },
        {
          action: 'Plan poitrine : Kaï, sidéré, voit les enseignes de la rue se vider de leurs lettres (effet glitch).',
          bg: { id: 'rue', time: 'jour', horizon: 0.45, vp: 0.3, cars: false },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'buste', x: 0.55, y: 0.28, fill: 0.8, turn: 0.2 }],
          fx: [{ type: 'glitch', n: 8 }],
          bubbles: [{ type: 'parole', text: 'Les panneaux… ils se vident ?!', x: 0.42, y: 0.15, w: 0.7, who: 0 }],
        },
        {
          action: 'Grande case d’action : l’Oubli surgit et attaque un étudiant ; Kaï plonge pour le pousser (silhouette, flou de vitesse).',
          bg: { id: 'rue', time: 'jour', horizon: 0.6, vp: 0.72, cars: false, crowd: 2 },
          chars: [
            { id: 'oubli', pose: 'attaque', shot: 'pied', x: 0.76, y: 1.0, fill: 0.86, seed: 9 },
            { id: 'etudiant', pose: 'debout', expr: 'surprise', shot: 'pied', x: 0.52, y: 0.97, fill: 0.58 },
            { id: 'kai', pose: 'plongeon', shot: 'pied', x: 0.13, y: 0.9, fill: 0.42, blur: -160 },
          ],
          fx: [{ type: 'vitesse', angle: 4, n: 36, opacity: 0.45 }, { type: 'glitch', n: 8 }],
          sfx: [{ text: 'WHOOOM', x: 0.72, y: 0.86, size: 78, rot: -6, color: '#c4b5fd' }],
          bubbles: [
            { type: 'cri', text: 'BOUGE !!', x: 0.16, y: 0.16, w: 0.25, who: 2 },
            { type: 'cri', text: 'MON CAHIER ! Tout est effacé !', x: 0.52, y: 0.17, w: 0.34, who: 1 },
          ],
          sound: 'hit',
        },
        {
          action: 'Impact : éclair blanc, Kaï (silhouette) projeté en l’air par le choc.',
          bg: { id: 'flash', color: '#fff7e0', lines: '#120b09', cx: 0.55, cy: 0.5 },
          chars: [{ id: 'kai', pose: 'chute', shot: 'pied', x: 0.42, y: 0.92, fill: 0.6, rim: '#ffffff' }],
          fx: [{ type: 'impact', x: 0.66, y: 0.46, size: 0.36, layer: 'front' }],
          sfx: [{ text: 'BAM !', x: 0.66, y: 0.22, size: 110, rot: 12, color: '#ff5a3d' }],
          sound: 'hit',
        },
        {
          action: 'Contre-plongée : l’Oubli domine Kaï ; gros plan de Kaï éclairé en violet, terrifié.',
          bg: { id: 'oubli' },
          chars: [
            { id: 'oubli', pose: 'flotte', shot: 'taille', x: 0.64, y: 0.02, fill: 1, seed: 2 },
            { id: 'kai', expr: 'surprise', shot: 'gros', x: 0.22, y: 0.42, fill: 0.62, light: '#7c3aed', turn: 0.25 },
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
        {
          action: 'L’écran du téléphone s’allume par terre : « Révise une notion. Maintenant. »',
          bg: { id: 'ecran', text: 'Révise une notion. Une seule. Maintenant.', from: 'RÉVISION IA', clock: '08:47' },
          sound: 'sparkle',
        },
        {
          action: 'Très gros plan sur le regard de Kaï qui se durcit : il se souvient de sa leçon de la veille.',
          bg: { id: 'flash', color: '#2a1f55', lines: '#8b5cf6' },
          chars: [{ id: 'kai', expr: 'concentration', shot: 'yeux', x: 0.5, y: 0.62, fill: 0.55 }],
          bubbles: [{ type: 'pensee', text: 'Hier soir… les suites. u(n+1) = q × u(n). JE M’EN SOUVIENS !', x: 0.5, y: 0.22, w: 0.88, tail: false }],
        },
        {
          action: 'LE COUP : le poing de Kaï, entouré d’aura violette, jaillit au premier plan vers le lecteur ; l’Oubli recule au fond.',
          bg: { id: 'flash', color: '#fff3f8', lines: '#7c3aed', cx: 0.62, cy: 0.42 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.74, y: 1.02, fill: 0.9, seed: 7 },
            { id: 'poing', of: 'kai', x: 0.4, y: 0.5, size: 0.62, break: true },
          ],
          fx: [{ type: 'lueur', x: 0.4, y: 0.5, color: '#8b5cf6', size: 0.55, opacity: 0.7, layer: 'back' }, { type: 'impact', x: 0.62, y: 0.38, size: 0.24, color: '#e9d5ff', layer: 'front' }],
          sfx: [{ text: 'KRAAAK !', x: 0.66, y: 0.86, size: 120, rot: -9, color: '#c084fc' }],
          sound: 'hit',
        },
        {
          action: 'L’Oubli se désagrège en pixels et s’enfuit ; Kaï, de dos, essoufflé, le regarde partir.',
          bg: { id: 'rue', time: 'jour', horizon: 0.5, vp: 0.5, cars: false, crowd: 0 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.62, y: 0.86, fill: 0.5, seed: 11 },
            { id: 'kai', pose: 'dos', shot: 'americain', x: 0.24, y: 0.3, fill: 0.95 },
          ],
          fx: [{ type: 'glitch', n: 18 }],
          bubbles: [{ type: 'parole', text: 'Il… recule ? Il fuit ?!', x: 0.62, y: 0.16, w: 0.6, tail: [0.3, 0.4] }],
          sound: 'sparkle',
        },
        {
          action: 'Cliffhanger : sur un toit, une silhouette (Mory) observait la scène, les bras croisés ; ses lunettes brillent.',
          bg: { id: 'toit', time: 'jour', horizon: 0.62, props: false, roofY: 0.98 },
          chars: [{ id: 'mory', pose: 'bras_croises', expr: 'clin', shot: 'americain', x: 0.64, y: 0.14, fill: 0.86, light: 'contre' }],
          fx: [{ type: 'lueur', x: 0.64, y: 0.22, color: '#22d3ee', size: 0.12, opacity: 0.9 }],
          bubbles: [{ type: 'murmure', text: 'Un deuxième… enfin.', x: 0.33, y: 0.15, w: 0.55, who: 0 }],
          captions: [{ text: 'À suivre…', x: 0.04, y: 0.8, style: 'noir', right: true }],
        },
      ],
    },
  ],
};
