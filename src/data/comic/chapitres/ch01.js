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
//     bubbles  : [{ type: 'parole'|'pensee'|'cri'|'murmure', text, x, y, w, who, tail, size }]
//     captions : [{ text, x, y, w, style: 'jaune'|'noir'|'blanc'|'rouge', right, size }]
//     sfx      : [{ text, x, y, size, rot, color }]   (onomatopées dessinées)
//                x, y, w : fractions de la case (0 → 1) ; size : facultatif (automatique)
//     sound    : effet sonore joué quand la case s'affiche (src/ui/sfx.js)
//     illus    : repères de l'ILLUSTRATION (public/story/chapitre-1/page-P-case-C.jpg),
//                en fractions de l'IMAGE (0 → 1, origine en haut à gauche) :
//                  focus  : [x, y] point focal gardé au centre si l'image est recadrée
//                  keep   : [[x0, y0, x1, y1, 'nom'], …] zones à ne JAMAIS couvrir
//                           (visages, perso principal, action, objet clé)
//                  free   : [[x0, y0, x1, y1, 'nom'], …] zones libres pour les textes
//                  mouths : [[x, y], …] bouche (ou tête) de chaque perso de `chars`,
//                           dans le même ordre : la pointe des bulles (`who`) y vise.
//                Contrôle : npm run verifier-bulles
// Les positions peuvent aussi venir de public/story/chapitre-1/bulles-chapitre-1.json
// (éditeur de bulles du Panneau créateur) : ce fichier a la priorité.
// =====================================================================

export default {
  id: 1,
  title: '3 h 12',
  pages: [
    // ------------------------------------------------------------- PAGE 1
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [{ h: 0.4, cols: [1], tilt: -36 }, { h: 0.25, cols: [0.4, 0.6], ctilt: [26] }, { h: 0.35, cols: [1] }],
      panels: [
        {
          action: 'Plan large d’ambiance : la corniche au coucher du soleil. Kaï, petite silhouette à contre-jour, marche seul sur la promenade.',
          bg: { id: 'corniche', time: 'couchant', horizon: 0.6, vp: 0.46, sunX: 0.8, fg: 'feuilles', fgSide: -1 },
          chars: [{ id: 'kai', pose: 'marche', expr: 'neutre', shot: 'pied', x: 0.6, y: 0.95, fill: 0.3, light: 'contre' }],
          illus: {
            focus: [0.52, 0.5],
            keep: [[0.44, 0.22, 0.6, 0.94, 'Kaï'], [0.72, 0.33, 0.91, 0.53, 'soleil couchant']],
            free: [[0.55, 0, 1, 0.3, 'ciel'], [0, 0.72, 0.4, 1, 'trottoir']],
          },
          captions: [
            { text: 'Conakry. Septembre 2026.', x: 0.02, y: 0.03, style: 'noir', w: 0.42 },
            { text: 'La veille de la rentrée. Le soleil se couche sur la corniche… et sur mes vacances.', x: 0.02, y: 0.7, w: 0.42 },
          ],
        },
        {
          action: 'Gros plan : Kaï, pensif, le visage tourné vers la mer, éclairé par le soleil couchant.',
          bg: { id: 'aplat', time: 'couchant', color: '#d0507a', color2: '#2a1b5c' },
          chars: [{ id: 'kai', expr: 'reflexion', shot: 'gros', x: 0.5, y: 0.08, fill: 1, turn: 0.3 }],
          fx: [{ type: 'lueur', x: 0.95, y: 0.25, color: '#ffb36b', size: 0.7, opacity: 0.55, layer: 'back' }],
          illus: {
            focus: [0.45, 0.42],
            keep: [[0.36, 0.24, 0.7, 0.66, 'visage de Kaï']],
            free: [[0.7, 0, 1, 0.5, 'ciel'], [0.62, 0.75, 1, 1, 'mer']],
          },
        },
        {
          action: 'Plan poitrine : Kaï devant la mer et les pirogues, mains dans les poches. Il pense à la rentrée.',
          bg: { id: 'corniche', time: 'couchant', horizon: 0.42, vp: 0.12, sunX: 0.55 },
          chars: [{ id: 'kai', expr: 'neutre', shot: 'buste', x: 0.72, y: 0.12, fill: 0.95, turn: -0.25 }],
          illus: {
            focus: [0.68, 0.4],
            keep: [[0.61, 0.11, 0.8, 0.4, 'visage de Kaï'], [0.52, 0.34, 0.85, 0.9, 'Kaï (buste)']],
            free: [[0, 0, 0.55, 0.48, 'ciel'], [0, 0.48, 0.5, 0.65, 'mer']],
            mouths: [[0.64, 0.24]],
          },
          bubbles: [{ type: 'pensee', text: 'Licence 2 d’info. Encore une année à faire semblant d’être prêt.', x: 0.27, y: 0.27, w: 0.5, who: 0 }],
        },
        {
          action: 'Un taxi jaune fonce vers le lecteur, phares allumés ; Kaï (silhouette) saute de côté, flou de mouvement. Humour.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.42, vp: 0.6, vehicles: [{ k: 'taxi', X: 0.35, z: 0.8, front: true }], crowd: 3 },
          chars: [{ id: 'kai', pose: 'esquive', shot: 'pied', x: 0.15, y: 0.99, fill: 0.8, flip: true, blur: 70 }],
          fx: [{ type: 'vitesse', angle: 6, n: 24, opacity: 0.35, color: '#fff', layer: 'front' }],
          illus: {
            focus: [0.5, 0.5],
            keep: [
              [0.26, 0.17, 0.37, 0.43, 'visage de Kaï'], [0.33, 0.16, 0.42, 0.28, 'main levée'],
              [0.21, 0.3, 0.45, 0.66, 'corps de Kaï'], [0.26, 0.6, 0.45, 0.92, 'jambes de Kaï'],
              [0.62, 0.32, 0.73, 0.39, 'enseigne TAXI'], [0.53, 0.39, 0.98, 0.93, 'taxi'],
            ],
            free: [[0.42, 0, 0.75, 0.3, 'ciel et fils'], [0, 0, 0.2, 0.5, 'manguier'], [0.75, 0, 1, 0.3, 'immeubles']],
            mouths: [[0.31, 0.36]],
          },
          sfx: [{ text: 'TUUUT !', x: 0.12, y: 0.13, size: 40, rot: -8, color: '#ffd23f' }],
          bubbles: [
            { type: 'cri', text: 'Hé, petit ! On dort debout ?!', x: 0.82, y: 0.16, w: 0.3, size: 25, tail: [0.66, 0.42] },
            { type: 'parole', text: 'Pardon, tonton !', x: 0.09, y: 0.52, w: 0.2, who: 0 },
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
          illus: {
            focus: [0.7, 0.5],
            keep: [[0.72, 0.1, 0.91, 0.56, 'visage de Kaï'], [0.62, 0.4, 0.93, 0.92, 'Kaï'], [0.76, 0.6, 1, 0.96, 'ordinateur']],
            free: [[0, 0, 0.58, 0.5, 'mur et fenêtre'], [0, 0.5, 0.5, 0.85, 'lit']],
            mouths: [[0.78, 0.3]],
          },
          captions: [{ text: '3 h 12.', x: 0.02, y: 0.04, style: 'noir' }],
          bubbles: [{ type: 'pensee', text: 'Je dors pas. Je dors jamais avant une rentrée.', x: 0.36, y: 0.33, w: 0.44, who: 0 }],
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
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.17, 0.27, 0.83, 0.96, 'visage de Kaï']],
            free: [[0, 0, 0.17, 0.5, 'traits de vitesse (gauche)'], [0.83, 0, 1, 0.5, 'traits de vitesse (droite)'], [0.17, 0, 0.83, 0.25, 'cheveux']],
          },
          bubbles: [{ type: 'murmure', text: '…Comment il connaît mon nom ?', x: 0.5, y: 0.12, w: 0.8, tail: false }],
        },
        {
          action: 'Plan large sur la ville la nuit : une immense ombre (l’Oubli) se dresse au-dessus de Kaloum ; les lumières s’éteignent.',
          bg: { id: 'toit', time: 'nuit', horizon: 0.42, props: false, roofY: 1.2 },
          chars: [{ id: 'oubli', pose: 'cri', shot: 'pied', x: 0.7, y: 0.98, fill: 0.78, seed: 4 }],
          fx: [{ type: 'glitch', n: 10 }, { type: 'vignette', opacity: 0.55 }],
          illus: {
            focus: [0.6, 0.45],
            keep: [[0.66, 0.08, 0.82, 0.25, 'visage de l’Oubli'], [0.55, 0.08, 0.88, 0.68, 'l’Oubli'], [0.38, 0.36, 0.6, 0.64, 'tentacules (gauche)'], [0.85, 0.28, 0.99, 0.56, 'tentacules (droite)'], [0.05, 0.52, 0.8, 0.86, 'Kaloum (les lumières)']],
            free: [[0, 0, 0.55, 0.45, 'ciel étoilé'], [0, 0.86, 1, 1, 'mer']],
          },
          captions: [{ text: 'Au même moment, au-dessus de Kaloum, les lumières s’éteignent une à une.', x: 0.03, y: 0.04, w: 0.5, style: 'noir' }],
          sound: 'boss',
        },
        {
          action: 'Kaï, de dos, face à la fenêtre ; une lueur violette entre dans la chambre.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'kai', pose: 'dos', shot: 'americain', x: 0.5, y: 0.2, fill: 0.9 }],
          fx: [{ type: 'lueur', x: 0.6, y: 0.3, color: '#7c3aed', size: 0.8, opacity: 0.45, layer: 'back' }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.36, 0.3, 0.65, 0.96, 'Kaï de dos'], [0.2, 0.25, 0.8, 0.57, 'fenêtre et lueur']],
            free: [[0, 0, 1, 0.24, 'plafond'], [0, 0.57, 0.36, 0.85, 'fauteuil']],
          },
          bubbles: [{ type: 'murmure', text: 'C’est quoi… ce truc ?', x: 0.5, y: 0.11, w: 0.85, tail: false }],
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
          illus: {
            focus: [0.3, 0.45],
            keep: [[0.12, 0.14, 0.34, 0.5, 'visage de la vendeuse'], [0.05, 0.42, 0.42, 0.86, 'vendeuse']],
            free: [[0.55, 0, 1, 0.36, 'ciel et fils'], [0.5, 0.36, 1, 0.8, 'foule au loin']],
            mouths: [[0.235, 0.43]],
          },
          captions: [{ text: 'Le lendemain. Marché de Madina.', x: 0.06, y: 0.03, style: 'noir', w: 0.36, right: true }],
          bubbles: [{ type: 'parole', text: 'Mes prix… je me souviens plus d’aucun prix !', x: 0.7, y: 0.47, w: 0.4, who: 0 }],
        },
        {
          action: 'Plan poitrine : Kaï, sidéré, voit les enseignes de la rue se vider de leurs lettres (effet glitch).',
          bg: { id: 'rue', time: 'jour', horizon: 0.45, vp: 0.3, cars: false },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'buste', x: 0.55, y: 0.28, fill: 0.8, turn: 0.2 }],
          fx: [{ type: 'glitch', n: 8 }],
          illus: {
            focus: [0.56, 0.5],
            keep: [
              [0.59, 0.22, 0.78, 0.63, 'visage de Kaï'], [0.46, 0.5, 0.96, 1, 'Kaï'],
              [0.28, 0.27, 0.41, 0.4, 'enseigne qui se vide (centre)'], [0.82, 0.04, 0.98, 0.42, 'enseigne qui se vide (droite)'],
            ],
            free: [[0.2, 0, 0.58, 0.26, 'ciel'], [0, 0.78, 0.45, 1, 'route']],
            mouths: [[0.68, 0.53]],
          },
          bubbles: [{ type: 'parole', text: 'Les panneaux… ils se vident ?!', x: 0.4, y: 0.13, w: 0.42, who: 0 }],
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
          illus: {
            focus: [0.5, 0.45],
            keep: [
              [0.3, 0.27, 0.4, 0.42, 'visage de Kaï'], [0.04, 0.24, 0.47, 0.62, 'Kaï qui plonge'],
              [0.47, 0.36, 0.56, 0.52, 'visage de l’étudiant'], [0.45, 0.36, 0.68, 0.96, 'étudiant et cahier'],
              [0.67, 0.14, 0.8, 0.32, 'visage de l’Oubli'], [0.64, 0.1, 1, 0.92, 'l’Oubli'],
            ],
            free: [[0.1, 0, 0.66, 0.24, 'ciel et fils'], [0, 0.64, 0.45, 1, 'nuage de poussière']],
            mouths: [[0.72, 0.24], [0.515, 0.47], [0.36, 0.37]],
          },
          sfx: [{ text: 'WHOOOM', x: 0.22, y: 0.84, size: 60, rot: -6, color: '#c4b5fd' }],
          bubbles: [
            { type: 'cri', text: 'BOUGE !!', x: 0.12, y: 0.1, w: 0.25, size: 26, who: 2 },
            { type: 'cri', text: 'MON CAHIER ! Tout est effacé !', x: 0.475, y: 0.13, w: 0.3, size: 26, who: 1 },
          ],
          sound: 'hit',
        },
        {
          action: 'Impact : éclair blanc, Kaï (silhouette) projeté en l’air par le choc.',
          bg: { id: 'flash', color: '#fff7e0', lines: '#120b09', cx: 0.55, cy: 0.5 },
          chars: [{ id: 'kai', pose: 'chute', shot: 'pied', x: 0.42, y: 0.92, fill: 0.6, rim: '#ffffff' }],
          fx: [{ type: 'impact', x: 0.66, y: 0.46, size: 0.36, layer: 'front' }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.3, 0.26, 0.77, 0.63, 'Kaï projeté']],
            free: [[0, 0, 0.4, 0.25, 'explosion (haut gauche)'], [0.6, 0, 1, 0.25, 'explosion (haut droite)'], [0, 0.7, 1, 1, 'gravats']],
          },
          sfx: [{ text: 'BAM !', x: 0.5, y: 0.17, size: 60, rot: 8, color: '#ff5a3d' }],
          sound: 'hit',
        },
        {
          action: 'Contre-plongée : l’Oubli domine Kaï ; gros plan de Kaï éclairé en violet, terrifié.',
          bg: { id: 'oubli' },
          chars: [
            { id: 'oubli', pose: 'flotte', shot: 'taille', x: 0.64, y: 0.02, fill: 1, seed: 2 },
            { id: 'kai', expr: 'surprise', shot: 'gros', x: 0.22, y: 0.42, fill: 0.62, light: '#7c3aed', turn: 0.25 },
          ],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.07, 0.35, 0.42, 1, 'visage de Kaï'], [0.42, 0.04, 0.68, 0.38, 'tête de l’Oubli']],
            free: [[0, 0, 0.4, 0.33, 'fond violet'], [0.55, 0.45, 1, 1, 'robe de l’Oubli']],
          },
          bubbles: [{ type: 'murmure', text: '…Savoir… non révisé… À MOI…', x: 0.75, y: 0.75, w: 0.42, tail: false, fill: '#0b0614', ink: '#7c3aed', color: '#e9d5ff' }],
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
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.2, 0.42, 0.8, 1, 'visage et regard de Kaï']],
            free: [[0, 0, 0.2, 1, 'traits de vitesse (gauche)'], [0.8, 0, 1, 1, 'traits de vitesse (droite)'], [0.2, 0, 0.8, 0.38, 'cheveux']],
            mouths: [[0.5, 0.44]],
          },
          // Texte long : découpé en deux bulles de pensée (lecture : gauche puis droite).
          bubbles: [
            { type: 'pensee', text: 'Hier soir… les suites.', x: 0.17, y: 0.2, w: 0.3, who: 0 },
            //   = espace insécable : la formule reste sur une seule ligne.
            { type: 'pensee', text: 'u(n+1) = q × u(n). JE M’EN SOUVIENS !', x: 0.715, y: 0.22, w: 0.5, who: 0 },
          ],
        },
        {
          action: 'LE COUP : le poing de Kaï, entouré d’aura violette, jaillit au premier plan vers le lecteur ; l’Oubli recule au fond.',
          bg: { id: 'flash', color: '#fff3f8', lines: '#7c3aed', cx: 0.62, cy: 0.42 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.74, y: 1.02, fill: 0.9, seed: 7 },
            { id: 'poing', of: 'kai', x: 0.4, y: 0.5, size: 0.62, break: true },
          ],
          fx: [{ type: 'lueur', x: 0.4, y: 0.5, color: '#8b5cf6', size: 0.55, opacity: 0.7, layer: 'back' }, { type: 'impact', x: 0.62, y: 0.38, size: 0.24, color: '#e9d5ff', layer: 'front' }],
          illus: {
            focus: [0.45, 0.5],
            keep: [
              [0.13, 0.1, 0.31, 0.43, 'visage de Kaï'], [0.22, 0.3, 0.6, 0.8, 'poing'], [0.22, 0.78, 0.37, 0.95, 'avant-bras'],
              [0.76, 0.1, 0.89, 0.27, 'visage de l’Oubli'], [0.66, 0.1, 0.95, 0.76, 'l’Oubli'],
            ],
            free: [[0.6, 0.78, 1, 1, 'route'], [0.3, 0, 0.65, 0.16, 'palmier et traits']],
          },
          sfx: [{ text: 'KRAAAK !', x: 0.78, y: 0.9, size: 66, rot: -9, color: '#c084fc' }],
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
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.19, 0.26, 0.37, 0.52, 'tête de Kaï'], [0.04, 0.42, 0.49, 1, 'Kaï de dos'], [0.52, 0.33, 0.76, 0.84, 'l’Oubli qui fuit']],
            free: [[0.33, 0, 0.82, 0.3, 'ciel'], [0.5, 0.85, 1, 1, 'rue']],
            mouths: [null, [0.3, 0.4]],
          },
          bubbles: [{ type: 'parole', text: 'Il… recule ? Il fuit ?!', x: 0.57, y: 0.14, w: 0.44, who: 1 }],
          sound: 'sparkle',
        },
        {
          action: 'Cliffhanger : sur un toit, une silhouette (Mory) observait la scène, les bras croisés ; ses lunettes brillent.',
          bg: { id: 'toit', time: 'jour', horizon: 0.62, props: false, roofY: 0.98 },
          chars: [{ id: 'mory', pose: 'bras_croises', expr: 'clin', shot: 'americain', x: 0.64, y: 0.14, fill: 0.86, light: 'contre' }],
          fx: [{ type: 'lueur', x: 0.64, y: 0.22, color: '#22d3ee', size: 0.12, opacity: 0.9 }],
          illus: {
            focus: [0.6, 0.4],
            keep: [[0.5, 0.03, 0.87, 0.4, 'tête de Mory'], [0.43, 0.36, 0.86, 1, 'Mory']],
            free: [[0, 0, 0.46, 0.45, 'ciel'], [0, 0.75, 0.42, 1, 'toits']],
            mouths: [[0.62, 0.37]],
          },
          bubbles: [{ type: 'murmure', text: 'Un deuxième… enfin.', x: 0.23, y: 0.2, w: 0.42, who: 0 }],
          captions: [{ text: 'À suivre…', x: 0.11, y: 0.88, style: 'noir' }],
        },
      ],
    },
  ],
};
