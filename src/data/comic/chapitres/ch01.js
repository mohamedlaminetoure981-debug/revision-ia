// =====================================================================
// CHAPITRE 1 — « 3 h 12 »  (Kaï) — VERSION 2 : 12 pages, 60 cases
// ---------------------------------------------------------------------
// Script de référence (et bible de continuité : lieux, heures, lumières,
// état physique de Kaï, règles de l'Oubli) : docs/scenario-ch01-v2.md
//
// Format d'un chapitre : voir le README (section "Mode Histoire en BD").
// Rappel rapide :
//   pages[].rows   : grille de cases [{ h, cols, tilt, ctilt }] (hauteurs, colonnes, biais)
//   pages[].gutter : 'blanc' ou 'noir' (couleur entre les cases)
//   pages[].ambient: ambiance sonore ('mer', 'ville', 'nuit', 'pluie', 'dojo', 'marche')
//   panels[] (dans l'ordre de lecture) :
//     action   : description de la case (storyboard pour l'illustrateur), avec la
//                continuité : lieu, heure, lumière, état physique de Kaï
//     bg       : { id: décor, time, horizon, vp, fg (premier plan), … }   (src/comic/decors.js, ville.js)
//                'ecran' = écran de téléphone dessiné par l'appli ([ÉCRAN APPLI], jamais illustré)
//                'cahier' = gros plan sur le cahier (lines, keep, fade)
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
//                  free   : [[x0, y0, x1, y1, 'nom'], …] zones laissées libres pour les textes
//                  mouths : [[x, y], …] bouche (ou tête) de chaque perso de `chars`,
//                           dans le même ordre : la pointe des bulles (`who`) y vise.
//                Les illustrations doivent respecter ces zones (textes dans les zones « free »).
//                Contrôle : npm run verifier-bulles
// Les positions peuvent aussi venir de public/story/chapitre-1/bulles-chapitre-1.json
// (éditeur de bulles du Panneau créateur) : ce fichier a la priorité.
// =====================================================================

// Couleurs récurrentes
const VIOLET = '#7c3aed';
const ECRAN = '#8be9ff';

export default {
  id: 1,
  title: '3 h 12',
  pages: [
    // ============================================================ PAGE 1 — La corniche
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [{ h: 0.34, cols: [1], tilt: -30 }, { h: 0.3, cols: [0.56, 0.44], ctilt: [24] }, { h: 0.36, cols: [0.42, 0.58], ctilt: [-22] }],
      panels: [
        {
          action: 'Plan large. La corniche de Conakry au coucher du soleil (lumière dorée), les pirogues sur la mer, quelques passants sur la promenade. Kaï, petit dans le cadre, marche seul, sac à dos sur l’épaule. Kaï intact.',
          bg: { id: 'corniche', time: 'couchant', horizon: 0.58, vp: 0.46, sunX: 0.8, fg: 'feuilles', fgSide: -1 },
          chars: [{ id: 'kai', pose: 'marche', expr: 'neutre', shot: 'pied', x: 0.62, y: 0.95, fill: 0.32, light: 'contre' }],
          illus: {
            focus: [0.55, 0.55],
            keep: [[0.54, 0.4, 0.7, 0.95, 'Kaï'], [0.74, 0.3, 0.92, 0.5, 'soleil couchant']],
            free: [[0, 0, 0.5, 0.3, 'ciel'], [0, 0.75, 0.45, 1, 'trottoir']],
            mouths: [[0.62, 0.48]],
          },
          captions: [{ text: 'Conakry. Septembre 2026. La veille de la rentrée.', x: 0.02, y: 0.04, w: 0.44, style: 'noir' }],
        },
        {
          action: 'Plan poitrine. Kaï s’arrête, accoudé à la rambarde de la corniche, le regard vers la mer. Visage fermé. Coucher du soleil, lumière dorée un peu plus basse. Sac à dos sur l’épaule. Kaï intact.',
          bg: { id: 'corniche', time: 'couchant', horizon: 0.45, vp: 0.15, sunX: 0.3 },
          chars: [{ id: 'kai', expr: 'neutre', shot: 'buste', x: 0.7, y: 0.14, fill: 0.92, turn: -0.3 }],
          illus: {
            focus: [0.66, 0.42],
            keep: [[0.55, 0.12, 0.85, 0.5, 'visage de Kaï'], [0.45, 0.4, 0.95, 1, 'Kaï (buste) et rambarde']],
            free: [[0, 0, 0.5, 0.55, 'ciel et mer']],
            mouths: [[0.66, 0.36]],
          },
          bubbles: [{ type: 'pensee', text: 'Licence 2. Encore une année à faire semblant d’être prêt.', x: 0.26, y: 0.3, w: 0.48, who: 0 }],
        },
        {
          action: '[ÉCRAN APPLI] Gros plan sur le téléphone de Kaï, dans sa main : notification « Révision IA — 5 minutes de révision ? ». Coucher du soleil.',
          bg: { id: 'ecran', text: '5 minutes de révision ?', from: 'RÉVISION IA', clock: '18:52' },
          sfx: [{ text: 'bzz', x: 0.82, y: 0.86, size: 30, rot: -12, color: ECRAN }],
          sound: 'bubble',
        },
        {
          action: 'Gros plan sur le pouce de Kaï qui balaie la notification vers le côté (geste net, un peu agacé). Lumière dorée du couchant sur la main. Kaï intact.',
          bg: { id: 'aplat', color: '#d0507a', color2: '#2a1b5c' },
          chars: [{ id: 'kai', expr: 'neutre', shot: 'gros', x: 0.62, y: 0.12, fill: 1, turn: -0.25 }],
          fx: [{ type: 'vitesse', angle: 180, n: 14, opacity: 0.4, color: '#fff' }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.3, 0.3, 0.85, 0.85, 'pouce et téléphone']],
            free: [[0, 0, 0.5, 0.28, 'fond']],
          },
          bubbles: [{ type: 'parole', text: 'Demain.', x: 0.22, y: 0.18, w: 0.3, who: 0 }],
        },
        {
          action: 'Kaï repart et traverse la route de la corniche, les yeux toujours sur son téléphone. Au fond, deux phares jaunes approchent. Fin du coucher du soleil, la lumière baisse. Sac à dos. Kaï intact.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.42, vp: 0.6, vehicles: [{ k: 'taxi', X: 0.6, z: 9, front: true }], crowd: 0 },
          chars: [{ id: 'kai', pose: 'telephone', expr: 'neutre', shot: 'pied', x: 0.3, y: 0.96, fill: 0.62 }],
          fx: [{ type: 'lueur', x: 0.62, y: 0.48, color: '#ffd23f', size: 0.18, opacity: 0.8 }],
          illus: {
            focus: [0.45, 0.55],
            keep: [[0.18, 0.3, 0.42, 0.97, 'Kaï sur la route'], [0.52, 0.4, 0.72, 0.56, 'phares du taxi']],
            free: [[0.45, 0, 1, 0.3, 'ciel']],
            mouths: [[0.3, 0.42]],
          },
        },
      ],
    },
    // ============================================================ PAGE 2 — Le taxi et le panneau
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [{ h: 0.36, cols: [1], tilt: 40 }, { h: 0.3, cols: [0.5, 0.5], ctilt: [-30] }, { h: 0.34, cols: [0.48, 0.52], ctilt: [26] }],
      panels: [
        {
          action: 'Le taxi jaune fonce vers le lecteur, phares allumés ; Kaï, sur la route, tourne la tête, surpris. Corniche, fin du coucher du soleil, lumière orange qui baisse. Kaï intact, sac à dos.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.42, vp: 0.55, vehicles: [{ k: 'taxi', X: 0.55, z: 1.2, front: true }], crowd: 0 },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'buste', x: 0.17, y: 0.16, fill: 0.8, turn: 0.3 }],
          fx: [{ type: 'concentration', x: 0.6, y: 0.55, n: 40, opacity: 0.35, inner: 0.35 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.05, 0.14, 0.3, 0.55, 'visage de Kaï'], [0.38, 0.3, 0.95, 0.95, 'taxi et phares']],
            free: [[0.35, 0, 1, 0.26, 'ciel']],
            mouths: [[0.17, 0.42]],
          },
          sfx: [{ text: 'TUUUT !', x: 0.66, y: 0.14, size: 44, rot: -8, color: '#ffd23f' }],
          sound: 'boss',
        },
        {
          action: 'Action. Kaï saute de côté, le taxi le frôle, flou de vitesse ; son téléphone manque de lui échapper. Corniche, lumière orange du soir. Kaï intact.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.45, vp: 0.3, vehicles: [{ k: 'taxi', X: 0.62, z: 2.2 }], crowd: 0 },
          chars: [{ id: 'kai', pose: 'esquive', shot: 'pied', x: 0.25, y: 0.98, fill: 0.85, flip: true, blur: 60 }],
          fx: [{ type: 'vitesse', angle: 0, n: 26, opacity: 0.4, color: '#fff', layer: 'front' }],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.1, 0.15, 0.45, 0.95, 'Kaï qui saute'], [0.5, 0.35, 1, 0.9, 'taxi']],
            free: [[0.45, 0, 1, 0.3, 'ciel']],
          },
          sfx: [{ text: 'VRAOOOM', x: 0.7, y: 0.16, size: 40, rot: -6, color: '#ff8a3d' }],
          sound: 'swipe',
        },
        {
          action: 'Kaï à genoux sur le trottoir de la corniche. Le chauffeur du taxi jaune passe la tête par la fenêtre en s’éloignant. Lumière orange qui baisse. Kaï intact, sac à dos.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.5, vp: 0.7, vehicles: [{ k: 'taxi', X: 0.72, z: 5 }], crowd: 0 },
          chars: [
            { id: 'chauffeur', pose: 'pointer', expr: 'surprise', shot: 'americain', x: 0.82, y: 0.2, fill: 0.62, flip: true },
            { id: 'kai', pose: 'genou', shot: 'pied', x: 0.26, y: 0.98, fill: 0.62 },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.7, 0.18, 0.95, 0.5, 'chauffeur à la fenêtre'], [0.1, 0.45, 0.42, 0.98, 'Kaï à genoux']],
            free: [[0.25, 0, 0.7, 0.35, 'ciel'], [0, 0, 0.25, 0.4, 'mer']],
            mouths: [[0.82, 0.34], [0.26, 0.56]],
          },
          bubbles: [
            { type: 'cri', text: 'Hé, petit ! On dort debout ?!', x: 0.45, y: 0.21, w: 0.46, size: 19, who: 0 },
            { type: 'parole', text: 'Pardon, tonton !', x: 0.2, y: 0.47, w: 0.34, who: 1 },
          ],
        },
        {
          action: 'Kaï se relève sur le trottoir. Derrière lui, un grand panneau publicitaire de la corniche clignote en violet, les lettres se brouillent comme un bug. Kaï ne le voit pas encore. Crépuscule, dernières lueurs orange. Kaï intact, sac à dos.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.55, vp: 0.5, crowd: 0, cars: false },
          chars: [{ id: 'kai', pose: 'debout', expr: 'neutre', shot: 'americain', x: 0.62, y: 0.3, fill: 0.72 }],
          fx: [{ type: 'lueur', x: 0.25, y: 0.25, color: VIOLET, size: 0.35, opacity: 0.55, layer: 'back' }, { type: 'glitch', n: 8 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.5, 0.28, 0.75, 0.62, 'visage de Kaï'], [0.45, 0.28, 0.82, 1, 'Kaï'], [0.05, 0.08, 0.42, 0.42, 'panneau qui bugge']],
            free: [[0.05, 0.6, 0.42, 1, 'trottoir']],
            mouths: [[0.62, 0.46]],
          },
          sfx: [{ text: 'bzzt', x: 0.2, y: 0.82, size: 26, rot: -10, color: '#c4b5fd' }],
        },
        {
          action: 'Kaï se retourne vers le panneau : il est normal. Il se frotte les yeux, fatigué. Crépuscule, presque nuit. Kaï intact, sac à dos.',
          bg: { id: 'aplat', color: '#5a3a7a', color2: '#1b1238' },
          chars: [{ id: 'kai', expr: 'reflexion', shot: 'gros', x: 0.6, y: 0.24, fill: 0.85, turn: -0.2 }],
          illus: {
            focus: [0.55, 0.55],
            keep: [[0.3, 0.24, 0.9, 0.95, 'visage de Kaï et main']],
            free: [[0, 0, 1, 0.22, 'haut de la case']],
            mouths: [[0.6, 0.72]],
          },
          bubbles: [{ type: 'pensee', text: '… Faut vraiment que je dorme.', x: 0.42, y: 0.11, w: 0.78, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 3 — La chambre, la révision
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.28, cols: [0.44, 0.56], ctilt: [20] }, { h: 0.36, cols: [1] }, { h: 0.36, cols: [0.5, 0.5], ctilt: [-24] }],
      panels: [
        {
          action: 'Transition. L’escalier de l’immeuble de Kaï, nuit tombée, lampe faible. Kaï monte, de dos, fatigué, sac sur l’épaule. Kaï intact.',
          bg: { id: 'aplat', color: '#2b2f4a', color2: '#0b0d18' },
          chars: [{ id: 'kai', pose: 'dos_marche', shot: 'americain', x: 0.55, y: 0.22, fill: 0.8 }],
          fx: [{ type: 'lueur', x: 0.3, y: 0.1, color: '#ffcf7a', size: 0.4, opacity: 0.45, layer: 'back' }, { type: 'vignette', opacity: 0.6 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.35, 0.2, 0.78, 1, 'Kaï de dos dans l’escalier']],
            free: [[0, 0, 0.35, 0.3, 'mur'], [0, 0.6, 0.35, 1, 'marches']],
          },
          captions: [{ text: 'Plus tard.', x: 0.04, y: 0.05, style: 'noir' }],
        },
        {
          action: 'Kaï allongé sur son lit dans le noir de sa chambre d’étudiant, les yeux grands ouverts ; le ventilateur tourne au plafond. 2 h 47. Seule une faible lueur bleue de la fenêtre. Même t-shirt, sans sac, sans veste.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.44, vp: 0.6 },
          chars: [{ id: 'kai', expr: 'reflexion', shot: 'gros', x: 0.62, y: 0.2, fill: 0.85, turn: 0.15 }],
          fx: [{ type: 'trame', color: '#000', opacity: 0.25 }],
          illus: {
            focus: [0.6, 0.5],
            keep: [[0.4, 0.25, 0.85, 0.85, 'visage de Kaï (yeux ouverts)'], [0.45, 0, 0.75, 0.15, 'ventilateur']],
            free: [[0, 0, 0.38, 0.6, 'mur sombre']],
            mouths: [[0.62, 0.66]],
          },
          captions: [{ text: '2 h 47.', x: 0.03, y: 0.05, style: 'noir' }],
          bubbles: [{ type: 'pensee', text: 'Je dors jamais avant une rentrée.', x: 0.2, y: 0.6, w: 0.34, who: 0 }],
        },
        {
          action: 'Kaï assis à son bureau, ordi allumé, cahier ouvert. Sur l’écran : un cours intitulé « Somme d’une suite géométrique ». Chambre, nuit, lumière bleue de l’écran sur son visage. T-shirt, sans sac.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.3 },
          chars: [{ id: 'kai', expr: 'concentration', shot: 'buste', x: 0.68, y: 0.22, fill: 0.85, turn: -0.3 }],
          fx: [{ type: 'lueur', x: 0.3, y: 0.6, color: ECRAN, size: 0.45, opacity: 0.4 }],
          illus: {
            focus: [0.6, 0.5],
            keep: [[0.55, 0.2, 0.85, 0.6, 'visage de Kaï'], [0.05, 0.4, 0.45, 0.9, 'écran : « Somme d’une suite géométrique »']],
            free: [[0, 0, 0.5, 0.36, 'mur']],
            mouths: [[0.66, 0.46]],
          },
          bubbles: [{ type: 'pensee', text: 'Bon. Une notion. Une seule.', x: 0.26, y: 0.17, w: 0.46, who: 0 }],
        },
        {
          action: 'Gros plan sur le cahier : la main de Kaï écrit S = u₀ / (1 − q), et en dessous l’exemple 8 + 4 + 2 + 1 + … = 16. Lumière bleue de l’écran.',
          bg: { id: 'cahier', lines: ['S = u₀ / (1 − q)', '8 + 4 + 2 + 1 + … = 16'], top: 3 },
          fx: [{ type: 'lueur', x: 0.9, y: 0.1, color: ECRAN, size: 0.6, opacity: 0.25 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.15, 0.4, 0.95, 0.85, 'formule et exemple (et la main)']],
            free: [[0.15, 0, 1, 0.32, 'haut de la page']],
          },
          bubbles: [{ type: 'pensee', text: 'Une infinité de termes… mais une somme finie.', x: 0.55, y: 0.15, w: 0.78, tail: false }],
        },
        {
          action: 'Kaï s’étire, satisfait, petit sourire. Sur le bureau, le téléphone s’allume et vibre. Le réveil à côté affiche 03:12. Chambre, nuit, lumière bleue. T-shirt, sans sac.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'kai', expr: 'joie', shot: 'buste', x: 0.36, y: 0.24, fill: 0.8, turn: 0.2 }],
          fx: [{ type: 'lueur', x: 0.82, y: 0.82, color: ECRAN, size: 0.25, opacity: 0.8 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.18, 0.22, 0.55, 0.62, 'visage de Kaï'], [0.68, 0.72, 0.98, 0.98, 'téléphone et réveil 03:12']],
            free: [[0.55, 0, 1, 0.5, 'mur et fenêtre']],
            mouths: [[0.36, 0.5]],
          },
          bubbles: [{ type: 'parole', text: 'Ça y est… j’ai compris.', x: 0.75, y: 0.17, w: 0.42, who: 0 }],
          sfx: [{ text: 'BZZZT', x: 0.72, y: 0.6, size: 36, rot: -12, color: ECRAN }],
          sound: 'bubble',
        },
      ],
    },
    // ============================================================ PAGE 4 — 3 h 12
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.3, cols: [0.46, 0.54], ctilt: [-24] }, { h: 0.36, cols: [0.5, 0.5] }, { h: 0.34, cols: [0.56, 0.44], ctilt: [22] }],
      panels: [
        {
          action: '[ÉCRAN APPLI] Écran du téléphone, heure 03:12 : message du Créateur.',
          bg: { id: 'ecran', text: 'Kaï. Tu es le guide. Réunis-les avant que l’Oubli n’efface tout.', from: 'LE CRÉATEUR', clock: '03:12' },
          sound: 'bubble',
        },
        {
          action: 'Très gros plan sur les yeux de Kaï, écarquillés, reflet bleu de l’écran. Chambre, nuit.',
          bg: { id: 'flash', color: '#0d1530', lines: ECRAN, cy: 0.5 },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'yeux', x: 0.5, y: 0.6, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.12, 0.32, 0.88, 0.95, 'yeux de Kaï']],
            free: [[0, 0, 1, 0.28, 'haut de la case']],
          },
          bubbles: [{ type: 'murmure', text: '… Comment il connaît mon nom ?', x: 0.5, y: 0.13, w: 0.86, tail: false }],
        },
        {
          action: 'Kaï à la fenêtre de sa chambre, de dos. Au loin, sur Kaloum, les lumières de la ville s’éteignent quartier par quartier. Nuit. T-shirt, sans sac.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'dos', shot: 'americain', x: 0.5, y: 0.34, fill: 0.85 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.32, 0.34, 0.68, 1, 'Kaï de dos'], [0.15, 0.28, 0.85, 0.6, 'fenêtre : Kaloum qui s’éteint']],
            free: [[0, 0, 1, 0.26, 'plafond']],
          },
          captions: [{ text: 'Au même moment, sur Kaloum, les lumières s’éteignent. Une à une.', x: 0.03, y: 0.04, w: 0.9, style: 'noir' }],
        },
        {
          action: 'Même fenêtre, même cadrage. L’obscurité est arrivée jusqu’aux immeubles voisins. L’Oubli, immense (capuche, yeux blancs, contour violet), se dresse au-dessus de la ville. Kaï recule d’un pas. Nuit, lueur violette. T-shirt, sans sac.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'oubli', pose: 'cri', shot: 'pied', x: 0.5, y: 0.66, fill: 0.48, seed: 4 },
            { id: 'kai', pose: 'dos', shot: 'americain', x: 0.42, y: 0.42, fill: 0.85 },
          ],
          fx: [{ type: 'teinte', color: '#000', opacity: 0.3 }, { type: 'lueur', x: 0.5, y: 0.35, color: VIOLET, size: 0.45, opacity: 0.5, layer: 'back' }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.35, 0.16, 0.65, 0.42, 'l’Oubli dans la fenêtre'], [0.22, 0.4, 0.62, 1, 'Kaï de dos']],
            free: [[0, 0, 1, 0.15, 'plafond'], [0.65, 0.5, 1, 1, 'mur']],
            mouths: [null, [0.42, 0.52]],
          },
          bubbles: [{ type: 'murmure', text: 'C’est quoi… ce truc ?', x: 0.5, y: 0.08, w: 0.86, tail: false }],
          sound: 'boss',
        },
        {
          action: 'Une lueur violette envahit la chambre. L’écran de l’ordi bugge, le texte du cours se désagrège en pixels. Sur le cahier, l’encre s’efface… sauf la formule S = u₀ / (1 − q), qui reste parfaitement nette (Kaï, paniqué, ne le remarque pas). Nuit, lumière violette. T-shirt, sans sac.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.4 },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'buste', x: 0.72, y: 0.3, fill: 0.72, turn: -0.25, light: VIOLET }],
          fx: [{ type: 'lueur', x: 0.3, y: 0.5, color: VIOLET, size: 0.6, opacity: 0.55, layer: 'back' }, { type: 'glitch', n: 16 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.58, 0.28, 0.88, 0.62, 'visage de Kaï'], [0.05, 0.45, 0.5, 0.95, 'ordi qui bugge et cahier (formule nette)']],
            free: [[0, 0, 0.55, 0.4, 'mur violet']],
            mouths: [[0.7, 0.52]],
          },
          sfx: [{ text: 'KSSSHHH', x: 0.28, y: 0.2, size: 40, rot: -8, color: '#c4b5fd' }],
          bubbles: [{ type: 'cri', text: 'Mes cours… !', x: 0.24, y: 0.62, w: 0.34, who: 0 }],
          sound: 'boss',
        },
        {
          action: 'Kaï a claqué l’ordi. La lumière orange du lampadaire est revenue derrière la fenêtre, tout est calme. Kaï, assis par terre contre son lit, en sueur. Nuit. T-shirt, sans sac.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.56, vp: 0.5 },
          chars: [{ id: 'kai', expr: 'encouragement', shot: 'buste', x: 0.5, y: 0.34, fill: 0.68 }],
          fx: [{ type: 'lueur', x: 0.85, y: 0.15, color: '#ff9a3d', size: 0.5, opacity: 0.45, layer: 'back' }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.3, 0.32, 0.7, 0.75, 'visage de Kaï'], [0.2, 0.6, 0.8, 1, 'Kaï assis contre le lit']],
            free: [[0, 0, 0.6, 0.3, 'mur'], [0, 0.3, 0.25, 0.6, 'lit']],
            mouths: [[0.5, 0.6]],
          },
          bubbles: [{ type: 'pensee', text: '… J’ai rêvé ?', x: 0.3, y: 0.14, w: 0.45, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 5 — Madina, les enseignes se vident
    {
      gutter: 'blanc',
      ambient: 'marche',
      rows: [{ h: 0.36, cols: [1], tilt: -30 }, { h: 0.3, cols: [0.5, 0.5], ctilt: [22] }, { h: 0.34, cols: [0.54, 0.46], ctilt: [-26] }],
      panels: [
        {
          action: 'Plan large. Le marché de Madina le matin (7 h 40, plein soleil, ombres nettes) : la foule, les étals, les motos-taxis, le grand panneau publicitaire au-dessus du carrefour. Kaï traverse en courant, sac sur le dos. Kaï intact.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'kai', pose: 'marche', expr: 'concentration', shot: 'pied', x: 0.36, y: 0.97, fill: 0.55, blur: -40 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.25, 0.42, 0.48, 0.97, 'Kaï qui court'], [0.55, 0.05, 0.92, 0.3, 'grand panneau du carrefour']],
            free: [[0, 0, 0.5, 0.3, 'ciel et fils'], [0.55, 0.62, 1, 1, 'foule']],
            mouths: [[0.36, 0.53]],
          },
          captions: [{ text: 'Le lendemain. 7 h 40. Marché de Madina.', x: 0.02, y: 0.04, w: 0.44, style: 'noir' }],
          bubbles: [{ type: 'parole', text: 'En retard dès le premier jour… bravo, Kaï.', x: 0.74, y: 0.5, w: 0.42, who: 0 }],
        },
        {
          action: 'Kaï ralentit devant une boutique du marché. L’enseigne se vide lettre par lettre, effet glitch violet. Plein soleil. Kaï intact, sac sur le dos.',
          bg: { id: 'rue', time: 'jour', horizon: 0.45, vp: 0.3, cars: false },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'buste', x: 0.62, y: 0.32, fill: 0.72, turn: 0.2 }],
          fx: [{ type: 'glitch', n: 10 }],
          illus: {
            focus: [0.55, 0.45],
            keep: [[0.45, 0.3, 0.8, 0.7, 'visage de Kaï'], [0.05, 0.05, 0.45, 0.3, 'enseigne qui se vide']],
            free: [[0.45, 0, 1, 0.26, 'ciel'], [0, 0.55, 0.4, 1, 'rue']],
            mouths: [[0.62, 0.56]],
          },
          sfx: [{ text: 'bzzt', x: 0.18, y: 0.4, size: 26, rot: -8, color: '#c4b5fd' }],
          bubbles: [{ type: 'parole', text: 'Hein… ?', x: 0.22, y: 0.78, w: 0.3, who: 0 }],
        },
        {
          action: 'Plan moyen. Autour de Kaï, d’autres enseignes du marché se vident. Des passants lèvent la tête, inquiets. Plein soleil. Kaï intact, sac sur le dos.',
          bg: { id: 'marche', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'passant', pose: 'pointer', expr: 'surprise', shot: 'pied', x: 0.74, y: 0.98, fill: 0.62, flip: true },
            { id: 'kai', pose: 'debout', expr: 'surprise', shot: 'pied', x: 0.3, y: 0.98, fill: 0.6 },
          ],
          fx: [{ type: 'glitch', n: 8 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.62, 0.4, 0.88, 0.98, 'passant'], [0.18, 0.4, 0.42, 0.98, 'Kaï']],
            free: [[0, 0, 1, 0.35, 'enseignes vides et ciel']],
            mouths: [[0.74, 0.5], [0.3, 0.5]],
          },
          bubbles: [{ type: 'parole', text: 'Mais… c’était écrit quoi, là ?', x: 0.55, y: 0.17, w: 0.62, who: 0 }],
        },
        {
          action: 'La vendeuse de mangues (pagne coloré, foulard) derrière son étal, désemparée, face à un client qui attend. Marché de Madina, plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.62 },
          chars: [
            { id: 'vendeuse', pose: 'debout', expr: 'surprise', shot: 'americain', x: 0.3, y: 0.3, fill: 0.72 },
            { id: 'passante', pose: 'dos', shot: 'americain', x: 0.82, y: 0.38, fill: 0.66 },
          ],
          illus: {
            focus: [0.4, 0.5],
            keep: [[0.15, 0.28, 0.45, 0.6, 'visage de la vendeuse'], [0.08, 0.5, 0.55, 1, 'étal de mangues'], [0.7, 0.35, 0.98, 1, 'client de dos']],
            free: [[0.4, 0, 1, 0.3, 'ciel et tissus']],
            mouths: [[0.3, 0.46], [0.82, 0.46]],
          },
          bubbles: [{ type: 'parole', text: 'Mes prix… je me souviens plus d’aucun prix !', x: 0.62, y: 0.16, w: 0.56, who: 0 }],
        },
        {
          action: 'Gros plan sur Kaï, sueur froide. Il tourne lentement la tête vers le grand panneau du carrefour, qui grésille en violet. Plein soleil, reflet violet sur sa joue. Kaï intact.',
          bg: { id: 'aplat', color: '#86c3ef', color2: '#2f86d6' },
          chars: [{ id: 'kai', expr: 'encouragement', shot: 'gros', x: 0.42, y: 0.22, fill: 0.8, turn: 0.3 }],
          fx: [{ type: 'lueur', x: 0.95, y: 0.2, color: VIOLET, size: 0.55, opacity: 0.55, layer: 'back' }, { type: 'glitch', n: 5 }],
          illus: {
            focus: [0.45, 0.55],
            keep: [[0.15, 0.22, 0.72, 0.95, 'visage de Kaï']],
            free: [[0.6, 0, 1, 0.3, 'panneau violet au loin'], [0, 0, 0.6, 0.18, 'ciel']],
            mouths: [[0.42, 0.72]],
          },
          bubbles: [{ type: 'pensee', text: 'Comme cette nuit…', x: 0.33, y: 0.1, w: 0.6, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 6 — L'Oubli surgit
    {
      gutter: 'noir',
      ambient: 'marche',
      rows: [{ h: 0.46, cols: [1], tilt: 40 }, { h: 0.27, cols: [0.5, 0.5], ctilt: [-24] }, { h: 0.27, cols: [0.5, 0.5], ctilt: [24] }],
      panels: [
        {
          action: 'GRANDE CASE. Marché de Madina, 7 h 40, plein soleil. Le grand panneau du carrefour se déchire de l’intérieur : l’Oubli en sort, immense, tentacules d’ombre déployés, pixels qui se détachent, yeux blancs, contour violet lumineux.',
          bg: { id: 'marche', time: 'jour', horizon: 0.62, vp: 0.5 },
          chars: [{ id: 'oubli', pose: 'cri', shot: 'pied', x: 0.55, y: 1.0, fill: 0.95, seed: 4 }],
          fx: [{ type: 'lueur', x: 0.55, y: 0.35, color: VIOLET, size: 0.6, opacity: 0.45, layer: 'back' }, { type: 'glitch', n: 14 }, { type: 'fissure', x: 0.55, y: 0.18, size: 0.4 }],
          illus: {
            focus: [0.55, 0.45],
            keep: [[0.42, 0.06, 0.68, 0.32, 'visage de l’Oubli'], [0.25, 0.05, 0.9, 0.95, 'l’Oubli et le panneau déchiré']],
            free: [[0, 0, 0.25, 0.5, 'ciel (gauche)'], [0, 0.75, 0.3, 1, 'étals']],
          },
          sfx: [{ text: 'KRRRAAACK !', x: 0.25, y: 0.2, size: 50, rot: -10, color: '#c084fc' }],
          sound: 'boss',
        },
        {
          action: 'Panique. La foule du marché fuit dans tous les sens, un étal se renverse, les mangues roulent au sol. Plein soleil, lueur violette au fond.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'passante', pose: 'course', shot: 'pied', x: 0.2, y: 0.98, fill: 0.6, blur: -40 },
            { id: 'passant', pose: 'course', shot: 'pied', x: 0.76, y: 0.98, fill: 0.66, flip: true, blur: 40 },
          ],
          fx: [{ type: 'vitesse', angle: 0, n: 20, opacity: 0.3 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.1, 0.35, 0.9, 0.98, 'foule qui fuit et étal renversé']],
            free: [[0, 0, 1, 0.3, 'ciel']],
          },
          bubbles: [{ type: 'cri', text: 'COUREZ !!', x: 0.5, y: 0.16, w: 0.5, size: 28, tail: false }],
        },
        {
          action: 'L’étudiant (jeune homme, lunettes, chemise claire, cahier bleu serré contre lui) trébuche et tombe dans le marché. Son cahier bleu glisse sur le sol. Plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.55, vp: 0.3 },
          chars: [{ id: 'etudiant', pose: 'chute', shot: 'pied', x: 0.5, y: 0.95, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.25, 0.35, 0.75, 0.95, 'l’étudiant qui tombe'], [0.7, 0.8, 0.95, 0.98, 'cahier bleu']],
            free: [[0, 0, 1, 0.3, 'haut de la case']],
            mouths: [[0.42, 0.58]],
          },
          bubbles: [{ type: 'cri', text: 'Mon cahier… !', x: 0.33, y: 0.21, w: 0.44, who: 0 }],
        },
        {
          action: 'Gros plan. Un tentacule d’ombre violet fonce vers l’étudiant à terre, qui lève le bras pour se protéger. Plein soleil, ombre violette.',
          bg: { id: 'flash', color: '#efe7ff', lines: VIOLET, cx: 0.75, cy: 0.4 },
          chars: [
            { id: 'oubli', pose: 'attaque', shot: 'taille', x: 0.85, y: 0.0, fill: 0.95, seed: 9 },
            { id: 'etudiant', pose: 'choc', shot: 'pied', x: 0.3, y: 1.0, fill: 0.7 },
          ],
          fx: [{ type: 'vitesse', angle: 160, n: 22, opacity: 0.4 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.55, 0, 1, 0.6, 'tentacule'], [0.1, 0.3, 0.5, 1, 'l’étudiant, bras levé']],
            free: [[0.05, 0, 0.5, 0.25, 'fond']],
          },
          sfx: [{ text: 'FWOOSH', x: 0.3, y: 0.15, size: 42, rot: -12, color: '#c4b5fd' }],
          sound: 'swipe',
        },
        {
          action: 'Kaï, à quelques mètres, figé. Gros plan sur ses jambes qui tremblent et ses poings serrés. Plein soleil, ombres nettes. Kaï intact.',
          bg: { id: 'aplat', color: '#cfe4f2', color2: '#86c3ef' },
          chars: [{ id: 'pieds', of: 'kai', x: 0.5, y: 0.98, size: 0.75 }],
          fx: [{ type: 'concentration', x: 0.5, y: 0.6, n: 40, opacity: 0.25 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.15, 0.3, 0.85, 1, 'jambes qui tremblent et poings serrés']],
            free: [[0, 0, 1, 0.26, 'haut de la case']],
          },
          bubbles: [{ type: 'pensee', text: 'Bouge… BOUGE !', x: 0.5, y: 0.13, w: 0.7, tail: false }],
        },
      ],
    },
    // ============================================================ PAGE 7 — Le sauvetage et le choc
    {
      gutter: 'blanc',
      ambient: 'marche',
      rows: [{ h: 0.25, cols: [1], tilt: -24 }, { h: 0.38, cols: [1], tilt: 36 }, { h: 0.37, cols: [0.34, 0.33, 0.33], ctilt: [18, -18] }],
      panels: [
        {
          action: 'Kaï s’élance, vu de profil, en pleine course dans le marché, poussière sous ses pieds, flou de vitesse. Plein soleil. Sac sur le dos. Kaï intact.',
          bg: { id: 'marche', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'course', shot: 'pied', x: 0.5, y: 0.96, fill: 0.85, blur: -80 }],
          fx: [{ type: 'vitesse', angle: 0, n: 30, opacity: 0.45, layer: 'front' }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.32, 0.1, 0.68, 0.98, 'Kaï qui court']],
            free: [[0.7, 0, 1, 0.5, 'étals'], [0, 0, 0.3, 0.5, 'étals']],
          },
          sfx: [{ text: 'TAP TAP TAP', x: 0.8, y: 0.8, size: 34, rot: -6, color: '#ffd23f' }],
        },
        {
          action: 'Kaï plonge et percute l’étudiant ; les deux roulent hors de la trajectoire. Le tentacule de l’Oubli frappe le sol à l’endroit exact où était l’étudiant, le sol se fissure. Marché, plein soleil. Kaï intact (sac encore sur le dos).',
          bg: { id: 'marche', time: 'jour', horizon: 0.62, vp: 0.72 },
          chars: [
            { id: 'oubli', pose: 'attaque', shot: 'pied', x: 0.82, y: 1.0, fill: 0.85, seed: 9 },
            { id: 'etudiant', pose: 'chute', shot: 'pied', x: 0.4, y: 0.95, fill: 0.5 },
            { id: 'kai', pose: 'plongeon', shot: 'pied', x: 0.22, y: 0.92, fill: 0.48, blur: -120 },
          ],
          fx: [{ type: 'vitesse', angle: 4, n: 30, opacity: 0.4 }, { type: 'impact', x: 0.62, y: 0.88, size: 0.22 }, { type: 'fissure', x: 0.62, y: 0.92, size: 0.3 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.08, 0.3, 0.55, 0.8, 'Kaï et l’étudiant'], [0.55, 0.62, 0.75, 1, 'impact du tentacule'], [0.7, 0.05, 1, 0.6, 'l’Oubli']],
            free: [[0, 0, 0.6, 0.26, 'ciel et fils']],
            mouths: [[0.82, 0.2], [0.4, 0.55], [0.22, 0.48]],
          },
          sfx: [{ text: 'BOOM !', x: 0.6, y: 0.62, size: 54, rot: 8, color: '#ff5a3d' }],
          bubbles: [{ type: 'cri', text: 'BOUGE !!', x: 0.15, y: 0.16, w: 0.28, size: 28, who: 2 }],
          sound: 'hit',
        },
        {
          action: 'Le cahier bleu, resté au sol, est touché par le tentacule : ses pages se vident en pixels violets. L’étudiant, à genoux derrière Kaï, regarde, horrifié. Plein soleil. Kaï intact.',
          bg: { id: 'marche', time: 'jour', horizon: 0.45, vp: 0.5 },
          chars: [{ id: 'etudiant', pose: 'genou', shot: 'pied', x: 0.55, y: 0.85, fill: 0.5 }],
          fx: [{ type: 'glitch', n: 12 }, { type: 'lueur', x: 0.5, y: 0.92, color: VIOLET, size: 0.3, opacity: 0.6 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.3, 0.4, 0.8, 0.85, 'l’étudiant horrifié'], [0.2, 0.82, 0.8, 1, 'cahier qui se vide']],
            free: [[0, 0, 1, 0.34, 'haut de la case']],
            mouths: [[0.55, 0.5]],
          },
          bubbles: [{ type: 'cri', text: 'Mon cahier ! Tout est effacé !', x: 0.5, y: 0.16, w: 0.9, who: 0 }],
        },
        {
          action: 'Un second tentacule surgit sur le côté et frappe Kaï de plein fouet au flanc. Plein soleil. Kaï intact jusqu’à ce coup.',
          bg: { id: 'flash', color: '#fff7e0', lines: '#120b09', cx: 0.5, cy: 0.5 },
          chars: [
            { id: 'oubli', pose: 'attaque', shot: 'taille', x: 0.05, y: 0.1, fill: 0.8, seed: 7 },
            { id: 'kai', pose: 'chute', shot: 'pied', x: 0.62, y: 0.85, fill: 0.62 },
          ],
          fx: [{ type: 'impact', x: 0.5, y: 0.45, size: 0.4, layer: 'front' }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.35, 0.25, 0.95, 0.85, 'Kaï frappé au flanc']],
            free: [[0, 0.75, 1, 1, 'sol']],
          },
          sfx: [{ text: 'BAM !', x: 0.5, y: 0.14, size: 56, rot: 8, color: '#ff5a3d' }],
          sound: 'hit',
        },
        {
          action: 'Kaï est projeté dans un étal de tissus wax colorés et s’effondre dedans ; le sac à dos vole et tombe plus loin. À partir d’ici : lèvre qui saigne un peu, manche droite déchirée, poussière, plus de sac. Plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.4, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'au_sol', shot: 'pied', x: 0.5, y: 0.98, fill: 0.5 }],
          fx: [{ type: 'impact', x: 0.5, y: 0.75, size: 0.3, color: '#f5c518' }, { type: 'vitesse', angle: 60, n: 16, opacity: 0.3 }],
          illus: {
            focus: [0.5, 0.65],
            keep: [[0.15, 0.45, 0.85, 1, 'Kaï dans les tissus wax'], [0.7, 0.1, 0.95, 0.35, 'sac à dos qui vole']],
            free: [[0, 0, 0.65, 0.35, 'haut de la case']],
          },
          sfx: [{ text: 'KRASH', x: 0.4, y: 0.18, size: 44, rot: -10, color: '#ff8a3d' }],
          sound: 'hit',
        },
      ],
    },
    // ============================================================ PAGE 8 — Au sol
    {
      gutter: 'noir',
      ambient: 'marche',
      rows: [{ h: 0.3, cols: [0.58, 0.42], ctilt: [-22] }, { h: 0.38, cols: [1], tilt: 30 }, { h: 0.32, cols: [0.44, 0.56], ctilt: [22] }],
      panels: [
        {
          action: 'Kaï à terre, à moitié enseveli sous les tissus wax, lèvre en sang, manche droite déchirée, sonné, il grimace. Marché, plein soleil. Plus de sac.',
          bg: { id: 'aplat', color: '#f5c518', color2: '#e8442e' },
          chars: [{ id: 'kai', expr: 'encouragement', shot: 'buste', x: 0.5, y: 0.28, fill: 0.72, turn: 0.2 }],
          fx: [{ type: 'trame', color: '#1f6fb2', opacity: 0.3 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.3, 0.28, 0.7, 0.7, 'visage de Kaï (lèvre en sang)'], [0.1, 0.6, 0.9, 1, 'tissus wax']],
            free: [[0, 0, 1, 0.24, 'haut de la case']],
            mouths: [[0.5, 0.55]],
          },
          bubbles: [{ type: 'pensee', text: 'J’ai… mal…', x: 0.24, y: 0.13, w: 0.4, who: 0 }],
        },
        {
          action: 'Gros plan sur le visage de Kaï, terrifié : il essaie de se souvenir de quelque chose et n’y arrive pas. Effet glitch violet sur le bord de la case. Lèvre en sang. Plein soleil.',
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0d0718' },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'gros', x: 0.5, y: 0.08, fill: 1.05, light: VIOLET }],
          fx: [{ type: 'glitch', n: 8 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.25, 0.08, 0.75, 0.95, 'visage terrifié de Kaï']],
            free: [[0, 0, 0.25, 0.6, 'bord glitché (gauche)'], [0.75, 0, 1, 0.6, 'bord glitché (droite)']],
          },
          bubbles: [{ type: 'pensee', text: 'Le prénom de ma mère… c’est… c’est…', x: 0.25, y: 0.2, w: 0.42, who: 0 }],
        },
        {
          action: 'Contre-plongée. L’Oubli se penche au-dessus de Kaï, immense, yeux blancs, contour violet. Kaï au premier plan, éclairé en violet. Lèvre en sang. Ciel bleu derrière, ombre violette.',
          bg: { id: 'oubli' },
          chars: [
            { id: 'oubli', pose: 'flotte', shot: 'taille', x: 0.6, y: 0.0, fill: 1, seed: 2 },
            { id: 'kai', expr: 'surprise', shot: 'gros', x: 0.2, y: 0.5, fill: 0.55, light: VIOLET, turn: 0.25 },
          ],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.02, 0.45, 0.4, 1, 'visage de Kaï'], [0.4, 0.02, 0.75, 0.4, 'tête de l’Oubli']],
            free: [[0.45, 0.5, 1, 1, 'robe de l’Oubli'], [0, 0, 0.38, 0.4, 'fond']],
          },
          bubbles: [{ type: 'murmure', text: '…Savoir… non révisé… À MOI…', x: 0.74, y: 0.76, w: 0.46, tail: false, fill: '#0b0614', ink: VIOLET, color: '#e9d5ff' }],
          sound: 'boss',
        },
        {
          action: '[ÉCRAN APPLI] À côté de la main de Kaï, son téléphone tombé au sol, écran fissuré, s’allume : message de Révision IA.',
          bg: { id: 'ecran', text: 'Révise une notion. Une seule. Maintenant.', from: 'RÉVISION IA', clock: '07:40' },
          fx: [{ type: 'fissure', x: 0.72, y: 0.82, size: 0.3, color: '#ffffff' }],
          sound: 'sparkle',
        },
        {
          action: 'Très gros plan sur les yeux de Kaï : le regard change, la peur laisse place à la concentration. Lèvre en sang (hors cadre). Plein soleil.',
          bg: { id: 'flash', color: '#2a1f55', lines: '#8b5cf6' },
          chars: [{ id: 'kai', expr: 'concentration', shot: 'yeux', x: 0.5, y: 0.62, fill: 0.56 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.12, 0.38, 0.88, 0.95, 'regard de Kaï']],
            free: [[0, 0, 1, 0.3, 'haut de la case']],
            mouths: [[0.5, 0.42]],
          },
          bubbles: [{ type: 'pensee', text: 'Une notion… Cette nuit…', x: 0.5, y: 0.15, w: 0.8, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 9 — Le chronomètre
    {
      gutter: 'blanc',
      ambient: 'marche',
      rows: [{ h: 0.34, cols: [1], tilt: -30 }, { h: 0.33, cols: [0.44, 0.56], ctilt: [24] }, { h: 0.33, cols: [0.5, 0.5], ctilt: [-20] }],
      panels: [
        {
          action: 'L’Oubli lance une vague : toutes les enseignes du marché clignotent en même temps en violet. Kaï, toujours au sol, attrape son téléphone et lève les yeux. Plein soleil, lueur violette. Kaï : lèvre en sang, manche déchirée, poussière, sans sac.',
          bg: { id: 'marche', time: 'jour', horizon: 0.55, vp: 0.6 },
          chars: [
            { id: 'oubli', pose: 'flotte', shot: 'pied', x: 0.68, y: 0.92, fill: 0.85, seed: 11 },
            { id: 'kai', pose: 'genou', shot: 'pied', x: 0.18, y: 0.98, fill: 0.5 },
          ],
          fx: [{ type: 'teinte', color: VIOLET, opacity: 0.18 }, { type: 'glitch', n: 12 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.55, 0.05, 0.85, 0.35, 'tête de l’Oubli'], [0.45, 0.05, 0.95, 0.9, 'l’Oubli'], [0.05, 0.5, 0.35, 0.98, 'Kaï au sol, téléphone en main']],
            free: [[0, 0, 0.42, 0.4, 'enseignes violettes']],
          },
          sfx: [{ text: 'VMMMM', x: 0.22, y: 0.2, size: 48, rot: -6, color: '#c084fc' }],
          sound: 'boss',
        },
        {
          action: '[ÉCRAN APPLI] Le chronomètre du téléphone, lancé : il affiche 00:08,0 au moment de la vague suivante. Écran fissuré.',
          bg: { id: 'ecran', text: '00:08,0', from: 'CHRONOMÈTRE', clock: '07:40' },
          fx: [{ type: 'fissure', x: 0.75, y: 0.62, size: 0.25, color: '#ffffff' }],
          bubbles: [{ type: 'pensee', text: 'Huit secondes entre les deux premières vagues.', x: 0.5, y: 0.82, w: 0.86, tail: false }],
        },
        {
          action: 'Nouvelles vagues, plus rapprochées ; les enseignes clignotent de plus en plus vite. Kaï compte, concentré. Plein soleil, éclats violets. Lèvre en sang, manche déchirée.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.4 },
          chars: [{ id: 'kai', expr: 'concentration', shot: 'buste', x: 0.7, y: 0.32, fill: 0.7, turn: -0.2 }],
          fx: [{ type: 'teinte', color: VIOLET, opacity: 0.12 }, { type: 'glitch', n: 10 }],
          illus: {
            focus: [0.6, 0.5],
            keep: [[0.5, 0.3, 0.9, 0.7, 'visage de Kaï']],
            free: [[0, 0, 0.48, 0.5, 'enseignes qui clignotent']],
            mouths: [[0.68, 0.56]],
          },
          sfx: [{ text: 'VMMM… VMM… VM', x: 0.32, y: 0.16, size: 18, rot: -6, color: '#c084fc' }],
          bubbles: [{ type: 'pensee', text: 'Puis quatre… puis deux… puis une…', x: 0.27, y: 0.6, w: 0.48, who: 0 }],
        },
        {
          action: 'Un passant caché derrière un étal renversé, paniqué. Marché de Madina, plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'passant', pose: 'debout', expr: 'surprise', shot: 'americain', x: 0.68, y: 0.42, fill: 0.62 }],
          fx: [{ type: 'trame', color: '#000', opacity: 0.15 }],
          illus: {
            focus: [0.6, 0.6],
            keep: [[0.5, 0.4, 0.85, 0.72, 'visage du passant'], [0.3, 0.7, 1, 1, 'étal renversé']],
            free: [[0, 0, 0.5, 0.45, 'fond']],
            mouths: [[0.68, 0.56]],
          },
          bubbles: [{ type: 'cri', text: 'Il accélère ! Il va tout dévorer, il s’arrêtera jamais !!', x: 0.44, y: 0.2, w: 0.74, size: 17, who: 0 }],
        },
        {
          action: 'Kaï, le regard dur, le téléphone à la main. Plein soleil. Lèvre en sang, manche droite déchirée, poussière.',
          bg: { id: 'aplat', color: '#86c3ef', color2: '#2f86d6' },
          chars: [{ id: 'kai', expr: 'concentration', shot: 'buste', x: 0.4, y: 0.28, fill: 0.72, turn: 0.2 }],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.2, 0.25, 0.6, 0.7, 'visage de Kaï'], [0.45, 0.6, 0.8, 1, 'main et téléphone']],
            free: [[0.55, 0, 1, 0.4, 'fond']],
            mouths: [[0.4, 0.52]],
          },
          bubbles: [{ type: 'parole', text: 'Non. Il va s’arrêter.', x: 0.73, y: 0.16, w: 0.42, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 10 — La limite
    {
      gutter: 'noir',
      ambient: 'marche',
      rows: [{ h: 0.28, cols: [0.5, 0.5], ctilt: [-22] }, { h: 0.46, cols: [1], tilt: 36 }, { h: 0.26, cols: [1] }],
      panels: [
        {
          action: 'Souvenir (teinte bleu nuit, bord de case flou) : le cahier de cette nuit, dans la chambre, la formule S = u₀ / (1 − q) restée intacte quand tout le reste s’effaçait.',
          bg: { id: 'cahier', lines: ['Somme d’une suite géométrique', 'S = u₀ / (1 − q)', '8 + 4 + 2 + 1 + … = 16'], keep: [1], fade: true, top: 3 },
          fx: [{ type: 'teinte', color: '#16204e', opacity: 0.45 }, { type: 'vignette', opacity: 0.7 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.15, 0.45, 0.95, 0.72, 'formule intacte']],
            free: [[0.1, 0, 1, 0.35, 'haut de la page']],
          },
          bubbles: [{ type: 'pensee', text: 'Premier terme : huit. Raison : un demi.', x: 0.55, y: 0.16, w: 0.8, tail: false }],
        },
        {
          action: 'Gros plan sur Kaï, un sourire de compréhension malgré le sang sur sa lèvre. Marché, plein soleil. Manche déchirée, poussière.',
          bg: { id: 'aplat', color: '#fff4dc', color2: '#86c3ef' },
          chars: [{ id: 'kai', expr: 'joie', shot: 'gros', x: 0.62, y: 0.3, fill: 0.75, turn: -0.2 }],
          illus: {
            focus: [0.6, 0.6],
            keep: [[0.35, 0.3, 0.9, 1, 'visage de Kaï (sourire, lèvre en sang)']],
            free: [[0, 0, 1, 0.28, 'haut de la case']],
            mouths: [[0.62, 0.78]],
          },
          bubbles: [{ type: 'parole', text: '8 + 4 + 2 + 1 + … Une infinité de vagues… mais en un temps FINI.', x: 0.36, y: 0.16, w: 0.7, size: 17, who: 0 }],
        },
        {
          action: 'GRANDE CASE. Kaï se relève, téléphone en main, au milieu du marché dévasté ; derrière lui, au loin, le grand panneau du carrefour et l’Oubli. Plein soleil, lueur violette au fond. Lèvre en sang, manche droite déchirée, poussière, sans sac.',
          bg: { id: 'marche', time: 'jour', horizon: 0.6, vp: 0.7 },
          chars: [
            { id: 'oubli', pose: 'flotte', shot: 'pied', x: 0.78, y: 0.72, fill: 0.42, seed: 11 },
            { id: 'kai', pose: 'debout', expr: 'concentration', shot: 'pied', x: 0.32, y: 0.98, fill: 0.88 },
          ],
          fx: [{ type: 'lueur', x: 0.78, y: 0.4, color: VIOLET, size: 0.3, opacity: 0.45, layer: 'back' }],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.22, 0.1, 0.44, 0.35, 'visage de Kaï'], [0.15, 0.1, 0.5, 1, 'Kaï debout, téléphone en main'], [0.62, 0.1, 0.95, 0.65, 'panneau et Oubli au loin']],
            free: [[0.5, 0.65, 1, 1, 'marché'], [0.45, 0, 1, 0.12, 'ciel']],
            mouths: [null, [0.32, 0.24]],
          },
          bubbles: [
            { type: 'parole', text: 'Seize secondes. Il va se condenser à la seizième seconde.', x: 0.7, y: 0.13, w: 0.52, who: 1 },
            { type: 'parole', text: 'Là où il a le plus mangé… devant le panneau !', x: 0.74, y: 0.8, w: 0.44, who: 1 },
          ],
        },
        {
          action: 'L’étudiant (lunettes, chemise claire) tend le bras vers Kaï qui part déjà en courant vers le panneau. Marché, plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.8 },
          chars: [
            { id: 'etudiant', pose: 'main_tendue', expr: 'surprise', shot: 'americain', x: 0.22, y: 0.18, fill: 0.85 },
            { id: 'kai', pose: 'course', shot: 'pied', x: 0.8, y: 0.85, fill: 0.5, blur: -60 },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.1, 0.15, 0.35, 0.5, 'visage de l’étudiant'], [0.1, 0.15, 0.55, 1, 'l’étudiant, bras tendu'], [0.7, 0.3, 0.9, 0.9, 'Kaï qui court']],
            free: [[0.4, 0, 0.7, 0.4, 'ciel']],
            mouths: [[0.22, 0.38], [0.8, 0.45]],
          },
          bubbles: [{ type: 'cri', text: 'T’es fou ?! Reviens !', x: 0.52, y: 0.27, w: 0.32, size: 26, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 11 — Seize
    {
      gutter: 'noir',
      ambient: 'marche',
      rows: [{ h: 0.24, cols: [0.5, 0.5], ctilt: [24] }, { h: 0.24, cols: [1], tilt: -30 }, { h: 0.34, cols: [1], tilt: 30 }, { h: 0.18, cols: [1] }],
      panels: [
        {
          action: 'Kaï court à travers le marché et glisse sous un étal pour esquiver un tentacule. Plein soleil. Lèvre en sang, manche déchirée, poussière, sans sac.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'plongeon', shot: 'pied', x: 0.5, y: 0.98, fill: 0.55, blur: -80 }],
          fx: [{ type: 'vitesse', angle: 0, n: 22, opacity: 0.4 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.2, 0.45, 0.8, 1, 'Kaï qui glisse sous l’étal'], [0.55, 0.1, 1, 0.45, 'tentacule']],
            free: [[0, 0, 0.5, 0.4, 'haut gauche']],
          },
          sfx: [{ text: 'FWOOSH', x: 0.72, y: 0.18, size: 34, rot: -10, color: '#c4b5fd' }],
          bubbles: [{ type: 'parole', text: 'Onze…', x: 0.2, y: 0.18, w: 0.3, who: 0 }],
          sound: 'swipe',
        },
        {
          action: 'Kaï saute par-dessus une moto renversée ; derrière lui, un tentacule fracasse le sol. Plein soleil. Lèvre en sang, manche déchirée.',
          bg: { id: 'marche', time: 'jour', horizon: 0.6, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'saut', shot: 'pied', x: 0.6, y: 0.8, fill: 0.55 }],
          fx: [{ type: 'impact', x: 0.18, y: 0.85, size: 0.3 }, { type: 'fissure', x: 0.18, y: 0.9, size: 0.3 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.4, 0.05, 0.8, 0.85, 'Kaï qui saute la moto'], [0.02, 0.6, 0.35, 1, 'tentacule qui fracasse le sol']],
            free: [[0, 0, 0.38, 0.5, 'haut gauche']],
          },
          sfx: [{ text: 'KRAK !', x: 0.2, y: 0.52, size: 30, rot: 10, color: '#ff5a3d' }],
          bubbles: [{ type: 'parole', text: 'Treize… quatorze…', x: 0.24, y: 0.16, w: 0.38, who: 0 }],
          sound: 'hit',
        },
        {
          action: 'Devant le grand panneau du carrefour, l’Oubli se contracte : ses tentacules sont aspirés vers le centre, un noyau compact violet translucide apparaît, brillant comme du verre. Kaï, au premier plan, arme son poing droit. Plein soleil, lueur violette intense. Lèvre en sang, manche déchirée.',
          bg: { id: 'flash', color: '#1a0b2e', lines: '#c4b5fd', cx: 0.65, cy: 0.5 },
          chars: [
            { id: 'oubli', pose: 'flotte', shot: 'pied', x: 0.68, y: 0.96, fill: 0.85, seed: 3 },
            { id: 'kai', pose: 'garde', shot: 'pied', x: 0.2, y: 0.98, fill: 0.8 },
          ],
          fx: [{ type: 'concentration', x: 0.68, y: 0.5, n: 60, opacity: 0.4, color: VIOLET }, { type: 'lueur', x: 0.68, y: 0.5, color: '#c084fc', size: 0.25, opacity: 0.85 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.55, 0.3, 0.82, 0.7, 'noyau de verre violet'], [0.05, 0.15, 0.38, 1, 'Kaï, poing armé']],
            free: [[0.38, 0, 0.62, 0.25, 'fond'], [0.82, 0, 1, 0.4, 'panneau']],
            mouths: [null, [0.2, 0.3]],
          },
          bubbles: [{ type: 'parole', text: 'Quinze…', x: 0.45, y: 0.15, w: 0.26, who: 1 }],
        },
        {
          action: 'PLEINE LARGEUR, MOMENT FORT. LE COUP : le poing droit de Kaï percute le noyau de verre de l’Oubli, des fissures partent dans tous les sens. Impact réaliste : son bras encaisse le choc, son visage est crispé. À partir d’ici : jointures de la main droite en sang (en plus de la lèvre, de la manche déchirée et de la poussière).',
          bg: { id: 'flash', color: '#fff3f8', lines: VIOLET, cx: 0.62, cy: 0.45 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.78, y: 1.02, fill: 0.95, seed: 7 },
            { id: 'poing', of: 'kai', x: 0.4, y: 0.52, size: 0.7, break: true },
          ],
          fx: [
            { type: 'lueur', x: 0.42, y: 0.5, color: '#8b5cf6', size: 0.5, opacity: 0.7, layer: 'back' },
            { type: 'impact', x: 0.6, y: 0.42, size: 0.28, color: '#e9d5ff', layer: 'front' },
            { type: 'fissure', x: 0.62, y: 0.45, size: 0.5 },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.08, 0.1, 0.3, 0.5, 'visage crispé de Kaï'], [0.2, 0.25, 0.68, 0.85, 'poing et noyau qui se fissure'], [0.7, 0.05, 0.98, 0.9, 'l’Oubli']],
            free: [[0.3, 0, 0.7, 0.2, 'haut'], [0, 0.75, 0.25, 1, 'bas gauche']],
          },
          bubbles: [{ type: 'cri', text: 'SEIZE !!!', x: 0.17, y: 0.2, w: 0.26, size: 30, tail: [0.3, 0.42] }],
          sfx: [{ text: 'KRAAAK !', x: 0.8, y: 0.86, size: 62, rot: -9, color: '#c084fc' }],
          sound: 'hit',
        },
        {
          action: 'Le noyau éclate en milliers de pixels ; ce qui reste de l’Oubli, en lambeaux, s’enfuit vers le ciel bleu au-dessus du marché. Plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.75, vp: 0.5 },
          chars: [{ id: 'oubli', pose: 'recul', shot: 'pied', x: 0.65, y: 0.6, fill: 0.45, seed: 11 }],
          fx: [{ type: 'glitch', n: 26 }],
          illus: {
            focus: [0.6, 0.4],
            keep: [[0.5, 0.05, 0.8, 0.6, 'l’Oubli en lambeaux qui s’enfuit']],
            free: [[0, 0, 0.45, 0.6, 'ciel']],
          },
          sfx: [{ text: 'SHHHRRRAAA', x: 0.25, y: 0.42, size: 40, rot: -6, color: '#c4b5fd' }],
          sound: 'sparkle',
        },
      ],
    },
    // ============================================================ PAGE 12 — Après le combat
    {
      gutter: 'blanc',
      ambient: 'marche',
      rows: [{ h: 0.3, cols: [1], tilt: -26 }, { h: 0.36, cols: [0.5, 0.5], ctilt: [22] }, { h: 0.34, cols: [0.42, 0.58], ctilt: [-24] }],
      panels: [
        {
          action: 'Les lettres reviennent sur les enseignes du marché, la vendeuse retrouve ses prix (joie), le cahier bleu de l’étudiant se remplit à nouveau. Marché de Madina, plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'vendeuse', pose: 'poing_leve', expr: 'joie', shot: 'americain', x: 0.28, y: 0.26, fill: 0.74 }],
          fx: [{ type: 'lueur', x: 0.7, y: 0.25, color: '#ffd23f', size: 0.4, opacity: 0.35 }],
          illus: {
            focus: [0.4, 0.5],
            keep: [[0.15, 0.24, 0.42, 0.55, 'visage de la vendeuse'], [0.05, 0.5, 0.55, 1, 'étal de mangues'], [0.6, 0.1, 0.95, 0.4, 'enseignes qui se remplissent']],
            free: [[0.45, 0.45, 1, 1, 'foule']],
            mouths: [[0.28, 0.4]],
          },
          bubbles: [{ type: 'cri', text: 'La mangue, cinq mille ! Je me souviens !!', x: 0.7, y: 0.66, w: 0.5, who: 0 }],
          sound: 'sparkle',
        },
        {
          action: 'Kaï à genoux, essoufflé, se tient le poing droit (jointures en sang), grimace. Marché, plein soleil. Lèvre en sang, manche déchirée, poussière, sans sac.',
          bg: { id: 'aplat', color: '#fff4dc', color2: '#b9a58c' },
          chars: [{ id: 'kai', expr: 'encouragement', shot: 'buste', x: 0.5, y: 0.36, fill: 0.64 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.3, 0.34, 0.7, 0.72, 'visage de Kaï (grimace)'], [0.3, 0.7, 0.75, 1, 'poing droit en sang']],
            free: [[0, 0, 1, 0.3, 'haut de la case']],
            mouths: [[0.5, 0.6]],
          },
          bubbles: [
            { type: 'parole', text: 'Aïe… aïe aïe aïe… Frapper du verre, plus jamais.', x: 0.36, y: 0.15, w: 0.68, size: 17, who: 0 },
            { type: 'pensee', text: 'Maman s’appelle… Mariama. … Ouf.', x: 0.78, y: 0.82, w: 0.4, size: 15, who: 0 },
          ],
        },
        {
          action: 'L’étudiant (lunettes, chemise claire, cahier bleu à nouveau rempli) tend la main à Kaï pour l’aider à se relever. Marché, plein soleil. Kaï : lèvre en sang, manche déchirée, jointures en sang.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'etudiant', pose: 'main_tendue', expr: 'surprise', shot: 'americain', x: 0.28, y: 0.3, fill: 0.72 },
            { id: 'kai', expr: 'clin', shot: 'buste', x: 0.78, y: 0.42, fill: 0.58, turn: -0.2 },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.12, 0.28, 0.42, 0.58, 'visage de l’étudiant'], [0.6, 0.4, 0.95, 0.8, 'visage de Kaï'], [0.35, 0.55, 0.65, 0.8, 'main tendue']],
            free: [[0, 0, 1, 0.26, 'haut de la case']],
            mouths: [[0.28, 0.44], [0.78, 0.66]],
          },
          bubbles: [
            { type: 'parole', text: 'Mec… t’as fait quoi, là ?', x: 0.28, y: 0.13, w: 0.46, who: 0 },
            { type: 'parole', text: 'Des maths… je crois.', x: 0.75, y: 0.22, w: 0.4, who: 1 },
          ],
        },
        {
          action: '[ÉCRAN APPLI] L’écran fissuré du téléphone s’allume : message du Créateur.',
          bg: { id: 'ecran', text: '1 sur 8. Trouve les autres.', from: 'LE CRÉATEUR', clock: '07:41' },
          fx: [{ type: 'fissure', x: 0.72, y: 0.82, size: 0.3, color: '#ffffff' }],
          sound: 'bubble',
        },
        {
          action: 'Plan large depuis un toit qui domine la même rue du marché (7 h 41, plein soleil). Mory, de profil, antenne bricolée posée à côté de lui, tient un chronomètre arrêté sur 16,0. Ses lunettes brillent.',
          bg: { id: 'toit', time: 'jour', horizon: 0.62, props: false, roofY: 0.98 },
          chars: [{ id: 'mory', expr: 'clin', shot: 'buste', x: 0.66, y: 0.2, fill: 0.8, turn: -0.3 }],
          fx: [{ type: 'lueur', x: 0.68, y: 0.5, color: '#22d3ee', size: 0.08, opacity: 0.8 }],
          illus: {
            focus: [0.6, 0.45],
            keep: [[0.5, 0.15, 0.85, 0.6, 'visage de Mory (lunettes qui brillent)'], [0.55, 0.55, 0.95, 1, 'chronomètre 16,0 et antenne']],
            free: [[0, 0, 0.48, 0.55, 'ciel'], [0, 0.75, 0.45, 1, 'toits']],
            mouths: [[0.64, 0.46]],
          },
          bubbles: [{ type: 'murmure', text: 'Il a trouvé la limite… tout seul. Un deuxième. Enfin.', x: 0.27, y: 0.25, w: 0.48, who: 0 }],
          captions: [{ text: 'À suivre…', x: 0.04, y: 0.86, style: 'noir' }],
        },
      ],
    },
  ],
};
