// =====================================================================
// CHAPITRE 1 — « 3 h 12 »  (Kaï) — VERSION 2 : 12 pages, 61 cases
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
    // Illustrations en paysage 16:9 : cases larges, recadrage guidé par `focus` et `keep`.
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [{ h: 0.34, cols: [1], tilt: -20 }, { h: 0.3, cols: [0.66, 0.34], ctilt: [16] }, { h: 0.36, cols: [0.55, 0.45], ctilt: [-18] }],
      panels: [
        {
          action: 'Plan large. La corniche de Conakry au coucher du soleil (lumière dorée), la mer à gauche, la route et les taxis jaunes à droite, des lampadaires et des palmiers. Kaï, au centre, marche seul le long du muret, mains dans les poches du sweat violet, casque autour du cou, sac à dos sur l’épaule. Kaï intact.',
          bg: { id: 'corniche', time: 'couchant', horizon: 0.58, vp: 0.46, sunX: 0.8, fg: 'feuilles', fgSide: -1 },
          chars: [{ id: 'kai', pose: 'marche', expr: 'neutre', shot: 'pied', x: 0.6, y: 0.95, fill: 0.32, light: 'contre' }],
          illus: {
            focus: [0.52, 0.45],
            keep: [[0.43, 0.2, 0.54, 0.42, 'visage de Kaï'], [0.43, 0.2, 0.62, 0.73, 'Kaï']],
            free: [[0, 0, 0.42, 0.45, 'ciel (gauche)'], [0.65, 0, 1, 0.2, 'ciel (droite)']],
            mouths: [[0.49, 0.36]],
          },
          captions: [{ text: 'Conakry. Septembre 2026. La veille de la rentrée.', x: 0.02, y: 0.05, w: 0.4, style: 'noir' }],
        },
        {
          action: 'Plan poitrine. Kaï s’est arrêté, accoudé au muret de la corniche, les yeux fermés, visage fermé ; derrière lui la mer, les pirogues colorées et le soleil bas, lumière dorée. Sac à dos sur l’épaule, casque autour du cou. Kaï intact.',
          bg: { id: 'corniche', time: 'couchant', horizon: 0.45, vp: 0.15, sunX: 0.3 },
          chars: [{ id: 'kai', expr: 'neutre', shot: 'buste', x: 0.7, y: 0.14, fill: 0.92, turn: -0.3 }],
          illus: {
            focus: [0.6, 0.45],
            keep: [[0.53, 0.03, 0.71, 0.27, 'visage de Kaï'], [0.48, 0.03, 0.9, 0.88, 'Kaï, mains et muret']],
            free: [[0.2, 0.05, 0.47, 0.9, 'mer (gauche)']],
            mouths: [[0.62, 0.23]],
          },
          bubbles: [{ type: 'pensee', text: 'Licence 2. Encore une année à faire semblant d’être prêt.', x: 0.185, y: 0.42, w: 0.29, who: 0 }],
        },
        {
          action: '[ÉCRAN APPLI] Gros plan sur le téléphone de Kaï, dans sa main : notification « Révision IA — 5 minutes de révision ? ». Coucher du soleil.',
          bg: { id: 'ecran', text: '5 minutes de révision ?', from: 'RÉVISION IA', clock: '18:52' },
          sfx: [{ text: 'bzz', x: 0.82, y: 0.86, size: 30, rot: -12, color: ECRAN }],
          sound: 'bubble',
        },
        {
          action: 'Gros plan sur la main de Kaï : son pouce balaie la notification pour la faire disparaître (geste net, un peu agacé), le téléphone posé sur le muret ; derrière, la mer, les pirogues et le soleil couchant. Lumière dorée. Kaï intact.',
          bg: { id: 'aplat', color: '#d0507a', color2: '#2a1b5c' },
          chars: [{ id: 'kai', expr: 'neutre', shot: 'gros', x: 0.62, y: 0.12, fill: 1, turn: -0.25 }],
          illus: {
            focus: [0.55, 0.62],
            keep: [[0.3, 0.46, 0.8, 0.83, 'main, téléphone et notification']],
            free: [[0.02, 0.1, 0.4, 0.6, 'sweat (gauche)'], [0.55, 0, 1, 0.3, 'ciel']],
          },
          bubbles: [{ type: 'parole', text: 'Demain.', x: 0.2, y: 0.24, w: 0.26, tail: [0.42, 0.0] }],
        },
        {
          action: 'Kaï repart et traverse la route de la corniche, les yeux sur son téléphone, sac à dos et casque. La nuit tombe : ciel violet et orange, lampadaires allumés. Au fond, deux phares jaunes approchent. Kaï intact.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.42, vp: 0.6, vehicles: [{ k: 'taxi', X: 0.6, z: 9, front: true }], crowd: 0 },
          chars: [{ id: 'kai', pose: 'telephone', expr: 'neutre', shot: 'pied', x: 0.3, y: 0.96, fill: 0.62 }],
          illus: {
            focus: [0.52, 0.55],
            keep: [[0.41, 0.24, 0.63, 0.98, 'Kaï sur la route'], [0.4, 0.43, 0.48, 0.5, 'phares du taxi au fond']],
            free: [[0.64, 0, 1, 0.3, 'ciel'], [0, 0, 0.2, 0.3, 'ciel (gauche)']],
            mouths: [[0.49, 0.35]],
          },
        },
      ],
    },
    // ============================================================ PAGE 2 — Le taxi et le panneau (6 cases)
    // Images en paysage 16:9. Cases 2 et 3 : pleine largeur (action sur toute la largeur de l'image) ;
    // cases 4, 5, 6 : trois cases identiques côte à côte (effet de « ralenti » : même cadrage, une
    // seule chose change à chaque case). Pas de biais : les cadrages sont serrés.
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [{ h: 0.264, cols: [1] }, { h: 0.2, cols: [1] }, { h: 0.279, cols: [1] }, { h: 0.257, cols: [1, 1, 1] }],
      panels: [
        {
          action: 'Vue depuis l’INTÉRIEUR du taxi, à travers le pare-brise : au premier plan les mains gantées de noir du chauffeur sur le volant. Kaï, au milieu de la route de la corniche, sac à dos, téléphone à la main, les yeux écarquillés, est pris dans la lumière des phares. Soleil bas à gauche, lampadaires allumés. Kaï intact.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.42, vp: 0.55, vehicles: [{ k: 'taxi', X: 0.55, z: 1.2, front: true }], crowd: 0 },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'buste', x: 0.17, y: 0.16, fill: 0.8, turn: 0.3 }],
          illus: {
            focus: [0.46, 0.58],
            keep: [[0.45, 0.24, 0.61, 0.67, 'Kaï dans les phares'], [0.26, 0.7, 0.56, 0.91, 'mains gantées sur le volant']],
            free: [[0.1, 0.08, 0.42, 0.42, 'ciel et soleil (gauche)'], [0.75, 0.04, 0.98, 0.3, 'ciel (droite)']],
            mouths: [[0.495, 0.34]],
          },
          sfx: [{ text: 'TUUUT !', x: 0.26, y: 0.2, size: 52, rot: -8, color: '#ffd23f' }],
          sound: 'boss',
        },
        {
          action: 'Vue de DERRIÈRE le taxi : il braque violemment vers la gauche (fumée de pneus, traces noires sur la route). Kaï plonge vers la droite, vers le trottoir côté immeubles, sac à dos, téléphone toujours en main. Lampadaires, soleil bas à gauche. Kaï intact.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.45, vp: 0.3, vehicles: [{ k: 'taxi', X: 0.62, z: 2.2 }], crowd: 0 },
          chars: [{ id: 'kai', pose: 'esquive', shot: 'pied', x: 0.25, y: 0.98, fill: 0.85, flip: true, blur: 60 }],
          illus: {
            focus: [0.55, 0.55],
            keep: [[0.13, 0.45, 0.47, 0.82, 'taxi qui braque'], [0.53, 0.33, 0.98, 0.8, 'Kaï qui plonge']],
            free: [[0.2, 0, 0.7, 0.4, 'ciel']],
            mouths: [[0.84, 0.54]],
          },
          sfx: [{ text: 'VRAOOOM', x: 0.42, y: 0.2, size: 46, rot: -6, color: '#ff8a3d' }],
          sound: 'swipe',
        },
        {
          action: 'Kaï à genoux sur le trottoir de droite, la main au sol, son sac tombé à côté de lui, le téléphone à la main, essoufflé. Le taxi s’éloigne (fumée, traces de pneus) : le chauffeur, gants noirs, se retourne par la fenêtre et crie. Lampadaires, soleil bas. Kaï intact (sac tombé).',
          bg: { id: 'rue', time: 'couchant', horizon: 0.5, vp: 0.7, vehicles: [{ k: 'taxi', X: 0.72, z: 5 }], crowd: 0 },
          chars: [
            { id: 'chauffeur', pose: 'pointer', expr: 'surprise', shot: 'americain', x: 0.82, y: 0.2, fill: 0.62, flip: true },
            { id: 'kai', pose: 'genou', shot: 'pied', x: 0.26, y: 0.98, fill: 0.62 },
          ],
          illus: {
            focus: [0.55, 0.615],
            keep: [[0.13, 0.46, 0.47, 0.82, 'taxi et chauffeur (gant levé)'], [0.55, 0.4, 0.96, 0.97, 'Kaï à genoux et sac']],
            free: [[0.1, 0.25, 0.5, 0.45, 'ciel (gauche)'], [0.5, 0.25, 0.78, 0.39, 'ciel (centre)']],
            mouths: [[0.4, 0.52], [0.82, 0.49]],
          },
          bubbles: [
            { type: 'cri', text: 'Hé, petit ! On dort debout ?!', x: 0.28, y: 0.15, w: 0.3, size: 18, who: 0 },
            { type: 'parole', text: 'Pardon, tonton !', x: 0.66, y: 0.12, w: 0.2, size: 18, who: 1 },
          ],
        },
        {
          action: 'Kaï s’est relevé au même endroit, sur le trottoir, sac sur l’épaule : il finit d’épousseter son genou, tête tournée, et regarde de travers le panneau publicitaire devant lui, sur le même trottoir, qui glitche en violet (lueur violette sur le sol). Soleil bas, lampadaires. Kaï intact.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.55, vp: 0.5, crowd: 0, cars: false },
          chars: [{ id: 'kai', pose: 'debout', expr: 'surprise', shot: 'americain', x: 0.62, y: 0.3, fill: 0.72 }],
          illus: {
            focus: [0.665, 0.5],
            keep: [[0.47, 0.33, 0.62, 0.97, 'Kaï qui s’époussette'], [0.64, 0.17, 0.83, 0.87, 'panneau qui glitche']],
            free: [[0.46, 0, 0.64, 0.3, 'ciel au-dessus de Kaï']],
            mouths: [[0.585, 0.45]],
          },
          sfx: [{ text: 'bzzt', x: 0.74, y: 0.08, size: 20, rot: -10, color: '#c4b5fd' }],
          bubbles: [{ type: 'parole', text: 'Hein… ?', x: 0.28, y: 0.15, w: 0.4, size: 18, who: 0 }],
        },
        {
          action: 'Même cadrage. Kaï, de dos, se frotte les yeux des deux mains (sac sur l’épaule) ; le panneau glitche toujours en violet. Soleil bas, lampadaires. Kaï intact.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.55, vp: 0.5, crowd: 0, cars: false },
          chars: [{ id: 'kai', pose: 'dos', shot: 'americain', x: 0.62, y: 0.3, fill: 0.72 }],
          illus: {
            focus: [0.665, 0.5],
            keep: [[0.48, 0.31, 0.63, 0.97, 'Kaï de dos, mains sur les yeux'], [0.64, 0.17, 0.83, 0.87, 'panneau qui glitche']],
            free: [[0.46, 0, 0.64, 0.28, 'ciel au-dessus de Kaï']],
            mouths: [[0.57, 0.4]],
          },
          bubbles: [{ type: 'murmure', text: 'C’est quoi ce bug… ?', x: 0.35, y: 0.14, w: 0.56, who: 0 }],
        },
        {
          action: 'Même cadrage. Kaï a baissé les mains et fixe le panneau, de profil, sac à dos ; le panneau est redevenu une pub normale : plage, palmier, mer turquoise. Soleil bas, lampadaires. Kaï intact.',
          bg: { id: 'rue', time: 'couchant', horizon: 0.55, vp: 0.5, crowd: 0, cars: false },
          chars: [{ id: 'kai', pose: 'debout', expr: 'reflexion', shot: 'americain', x: 0.62, y: 0.3, fill: 0.72 }],
          illus: {
            focus: [0.665, 0.5],
            keep: [[0.5, 0.31, 0.62, 0.97, 'Kaï qui fixe le panneau'], [0.64, 0.17, 0.83, 0.87, 'panneau : pub de plage']],
            free: [[0.46, 0, 0.64, 0.28, 'ciel au-dessus de Kaï']],
            mouths: [[0.575, 0.43]],
          },
          bubbles: [{ type: 'pensee', text: '… Faut vraiment que je dorme.', x: 0.22, y: 0.15, w: 0.4, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 3 — La chambre, la révision
    // Images en paysage 16:9. Cases 1-2 côte à côte, 3 et 4 côte à côte (la 4 est un dessin de
    // l'appli : le cahier), case 5 pleine largeur. À la maison : t-shirt gris foncé, sweat violet
    // sur le dossier de la chaise, casque sur le bureau, sac à dos accroché au mur.
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.31, cols: [0.5, 0.5] }, { h: 0.325, cols: [0.5, 0.5] }, { h: 0.365, cols: [1] }],
      panels: [
        {
          action: 'Transition. L’escalier de l’immeuble de Kaï, nuit tombée, vu en légère contre-plongée : ampoule nue qui pend, murs fissurés, rampe en bois. Kaï monte les marches, fatigué, une main sur la rampe, la tête tournée vers le bas ; il porte encore son sweat violet, son casque autour du cou et son sac sur l’épaule. Lumière faible de l’ampoule.',
          bg: { id: 'aplat', color: '#2b2f4a', color2: '#0b0d18' },
          chars: [{ id: 'kai', pose: 'dos_marche', shot: 'americain', x: 0.55, y: 0.22, fill: 0.8 }],
          illus: {
            focus: [0.53, 0.5],
            keep: [[0.46, 0.14, 0.56, 0.28, 'visage de Kaï'], [0.42, 0.14, 0.64, 0.98, 'Kaï dans l’escalier']],
            free: [[0.2, 0.02, 0.4, 0.5, 'mur (gauche)'], [0.66, 0.1, 0.95, 0.5, 'mur (droite)']],
            mouths: [[0.5, 0.21]],
          },
          captions: [{ text: 'Plus tard.', x: 0.04, y: 0.05, style: 'noir' }],
        },
        {
          action: 'Plan serré, vu d’au-dessus : Kaï allongé sur son lit dans le noir de sa chambre, t-shirt gris foncé, un bras derrière la tête, les yeux grands ouverts vers le plafond. Lumière bleue froide. On entend le ventilateur tourner au plafond. 2 h 47.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.44, vp: 0.6 },
          chars: [{ id: 'kai', expr: 'reflexion', shot: 'gros', x: 0.62, y: 0.2, fill: 0.85, turn: 0.15 }],
          illus: {
            focus: [0.6, 0.5],
            keep: [[0.4, 0.13, 0.6, 0.72, 'visage de Kaï'], [0.6, 0.14, 0.9, 0.6, 'bras derrière la tête']],
            free: [[0.2, 0.0, 0.7, 0.1, 'tête de lit sombre'], [0.55, 0.7, 0.95, 1, 't-shirt et drap'], [0.28, 0.45, 0.4, 0.95, 'oreiller']],
            mouths: [[0.5, 0.63]],
          },
          captions: [{ text: '2 h 47.', x: 0.03, y: 0.04, style: 'noir' }],
          sfx: [{ text: 'vvvvv…', x: 0.6, y: 0.07, size: 20, rot: 0, color: '#8be9ff' }],
          bubbles: [{ type: 'pensee', text: 'Je dors jamais avant une rentrée.', x: 0.8, y: 0.82, w: 0.36, who: 0 }],
        },
        {
          action: 'Plan large de la chambre (lit, fenêtre sur la ville de nuit, étagère, sac à dos accroché au mur, ventilateur au plafond). Kaï, assis à son bureau, de dos et de profil, le menton dans la main, ordi allumé (lumière bleue), cahier ouvert ; son sweat violet est sur le dossier de la chaise, son casque sur le bureau. Sur l’écran : un cours « Somme d’une suite géométrique ». Nuit, 2 h 47. T-shirt gris foncé.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.3 },
          chars: [{ id: 'kai', expr: 'concentration', shot: 'buste', x: 0.68, y: 0.22, fill: 0.85, turn: -0.3 }],
          illus: {
            focus: [0.6, 0.55],
            keep: [[0.57, 0.4, 0.72, 0.54, 'visage de Kaï'], [0.56, 0.4, 0.72, 0.97, 'Kaï à son bureau'], [0.46, 0.52, 0.66, 0.67, 'ordi, cahier et casque'], [0.64, 0.62, 0.76, 0.97, 'chaise et sweat']],
            free: [[0.15, 0.04, 0.55, 0.3, 'plafond et ventilateur'], [0.12, 0.3, 0.38, 0.62, 'mur (gauche)']],
            mouths: [[0.62, 0.48]],
          },
          bubbles: [{ type: 'pensee', text: 'Bon. Une notion. Une seule.', x: 0.36, y: 0.13, w: 0.5, who: 0 }],
        },
        {
          action: '[DESSIN APPLI] Gros plan sur le cahier (dessiné par l’appli, pas d’illustration) : la main de Kaï écrit S = u₀ / (1 − q), et en dessous l’exemple 8 + 4 + 2 + 1 + … = 16. Lumière bleue de l’écran.',
          bg: { id: 'cahier', lines: ['S = u₀ / (1 − q)', '8 + 4 + 2 + 1 + … = 16'], top: 3 },
          fx: [{ type: 'lueur', x: 0.9, y: 0.1, color: ECRAN, size: 0.6, opacity: 0.25 }],
          bubbles: [{ type: 'pensee', text: 'Une infinité de termes… mais une somme finie.', x: 0.55, y: 0.15, w: 0.78, tail: false }],
        },
        {
          action: 'Même chambre, même cadrage que la case 3. Kaï s’étire à son bureau, de dos, les bras en l’air, satisfait. Sur le bureau, le téléphone s’allume et vibre à côté de l’ordi et du casque ; le réveil à côté affiche 03:12. Sweat violet sur le dossier de la chaise, sac accroché au mur. T-shirt gris foncé.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'kai', expr: 'joie', shot: 'buste', x: 0.36, y: 0.24, fill: 0.8, turn: 0.2 }],
          illus: {
            focus: [0.6, 0.55],
            keep: [[0.5, 0.25, 0.78, 0.97, 'Kaï qui s’étire'], [0.46, 0.55, 0.78, 0.67, 'ordi, téléphone, casque et réveil'], [0.64, 0.62, 0.76, 0.97, 'chaise et sweat']],
            free: [[0.12, 0.04, 0.5, 0.32, 'plafond et ventilateur'], [0.1, 0.34, 0.4, 0.62, 'mur (gauche)']],
            mouths: [[0.67, 0.4]],
          },
          bubbles: [{ type: 'parole', text: 'Ça y est… j’ai compris.', x: 0.32, y: 0.13, w: 0.3, who: 0 }],
          sfx: [{ text: 'BZZZT', x: 0.37, y: 0.52, size: 30, rot: -10, color: ECRAN }],
          sound: 'bubble',
        },
      ],
    },
    // ============================================================ PAGE 4 — 3 h 12
    // Case 1 : écran de l'appli (+ case 2 : très gros plan). Cases 3 à 6 : même chambre, même cadrage,
    // deux par rangée (la fenêtre, l'Oubli, la chaise et le sweat restent dans le cadre).
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.27, cols: [0.34, 0.66] }, { h: 0.365, cols: [0.5, 0.5] }, { h: 0.365, cols: [0.5, 0.5] }],
      panels: [
        {
          action: '[ÉCRAN APPLI] Écran du téléphone, heure 03:12 : message du Créateur.',
          bg: { id: 'ecran', text: 'Kaï. Tu es le guide. Réunis-les avant que l’Oubli n’efface tout.', from: 'LE CRÉATEUR', clock: '03:12' },
          sound: 'bubble',
        },
        {
          action: 'Très gros plan sur les yeux de Kaï, écarquillés, une goutte de sueur sur la tempe, le reflet du téléphone dans les pupilles. Lignes de concentration bleues. Chambre, nuit, 3 h 12.',
          bg: { id: 'flash', color: '#0d1530', lines: ECRAN, cy: 0.5 },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'yeux', x: 0.5, y: 0.6, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.14, 0.2, 0.86, 0.62, 'yeux de Kaï']],
            free: [[0.1, 0.0, 0.9, 0.15, 'front'], [0.3, 0.88, 0.7, 1, 'téléphone']],
            mouths: [[0.5, 0.75]],
          },
          bubbles: [{ type: 'murmure', text: '… Comment il connaît mon nom ?', x: 0.5, y: 0.085, w: 0.6, size: 14, tail: false }],
        },
        {
          action: 'Kaï debout devant son bureau, de dos, une main sur le bureau et le téléphone dans l’autre, face à la fenêtre. Au loin, sur Kaloum, les lumières s’éteignent quartier par quartier. Ordi allumé (lumière bleue), cahier ouvert et réveil sur le bureau, sweat violet sur le dossier de la chaise, sac accroché au mur. T-shirt gris foncé.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'dos', shot: 'americain', x: 0.5, y: 0.34, fill: 0.85 }],
          illus: {
            focus: [0.575, 0.55],
            keep: [[0.48, 0.38, 0.6, 0.97, 'Kaï de dos'], [0.4, 0.22, 0.68, 0.58, 'fenêtre : Kaloum qui s’éteint'], [0.57, 0.62, 0.74, 0.97, 'chaise et sweat']],
            free: [[0.3, 0.02, 0.8, 0.17, 'plafond']],
            mouths: [[0.54, 0.4]],
          },
          captions: [{ text: 'Au même moment, sur Kaloum, les lumières s’éteignent. Une à une.', x: 0.03, y: 0.03, w: 0.94, style: 'noir' }],
        },
        {
          action: 'Même fenêtre, même cadrage. L’obscurité est arrivée jusqu’aux immeubles voisins. L’Oubli, immense (capuche, yeux blancs, tentacules, contour violet), se dresse dans la fenêtre. Kaï, de dos, en reculant de peur, heurte sa chaise, qui commence à basculer ; le sweat glisse du dossier. Lueur violette. T-shirt gris foncé.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'oubli', pose: 'cri', shot: 'pied', x: 0.5, y: 0.66, fill: 0.48, seed: 4 },
            { id: 'kai', pose: 'dos', shot: 'americain', x: 0.42, y: 0.42, fill: 0.85 },
          ],
          illus: {
            focus: [0.575, 0.55],
            keep: [[0.34, 0.18, 0.7, 0.62, 'l’Oubli dans la fenêtre'], [0.48, 0.38, 0.6, 0.97, 'Kaï de dos'], [0.57, 0.62, 0.84, 0.95, 'chaise qui bascule et sweat']],
            free: [[0.3, 0.02, 0.8, 0.16, 'plafond']],
            mouths: [null, [0.54, 0.4]],
          },
          bubbles: [{ type: 'murmure', text: 'C’est quoi… ce truc ?', x: 0.4, y: 0.09, w: 0.62, tail: false }],
          sfx: [{ text: 'CLAC !', x: 0.84, y: 0.46, size: 24, rot: -8, color: '#ffd23f' }],
          sound: 'boss',
        },
        {
          action: 'Même cadrage. Une lueur violette envahit la chambre. Kaï, paniqué, une main dans les cheveux, le téléphone dans l’autre. La chaise est renversée par terre, le sweat au sol. L’écran de l’ordi bugge, le texte du cours et le cahier se désagrègent en pixels. Sur le cahier, l’encre s’efface… sauf une ligne : la formule S = u₀ / (1 − q) reste parfaitement nette, écrite comme à la main, légèrement lumineuse (Kaï, paniqué, ne le remarque pas). T-shirt gris foncé.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.5, vp: 0.4 },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'buste', x: 0.72, y: 0.3, fill: 0.72, turn: -0.25, light: VIOLET }],
          illus: {
            focus: [0.575, 0.55],
            keep: [[0.48, 0.3, 0.62, 0.97, 'Kaï, main dans les cheveux'], [0.56, 0.5, 0.74, 0.66, 'ordi et cahier qui se désagrègent'], [0.57, 0.68, 0.8, 1.0, 'chaise renversée et sweat au sol']],
            free: [[0.3, 0.02, 0.8, 0.16, 'plafond']],
            mouths: [[0.54, 0.38]],
          },
          // La seule ligne du cahier qui reste intacte : la vraie formule, rendue par KaTeX.
          formules: [{ tex: 'S = u_0 \\,/\\, (1 - q)', x: 0.68, y: 0.58, size: 0.023, rot: -4, color: '#f3e8ff' }],
          sfx: [{ text: 'KSSSHHH', x: 0.78, y: 0.1, size: 26, rot: -8, color: '#c4b5fd' }],
          bubbles: [{ type: 'cri', text: 'Mes cours… !', x: 0.3, y: 0.1, w: 0.36, who: 0 }],
          sound: 'boss',
        },
        {
          action: 'Même cadrage. La lumière violette a disparu, l’ordi est fermé, la chambre est plongée dans la nuit, éclairée seulement par les lumières de la ville qui se sont rallumées à travers la fenêtre. Kaï, assis par terre contre le lit, en sueur, les bras autour des genoux ; son téléphone est au sol, la chaise et le sweat sont toujours par terre. T-shirt gris foncé.',
          bg: { id: 'chambre', time: 'nuit', horizon: 0.56, vp: 0.5 },
          chars: [{ id: 'kai', expr: 'encouragement', shot: 'buste', x: 0.5, y: 0.34, fill: 0.68 }],
          illus: {
            focus: [0.575, 0.55],
            keep: [[0.35, 0.6, 0.45, 0.74, 'visage de Kaï'], [0.34, 0.6, 0.56, 0.98, 'Kaï assis contre le lit'], [0.52, 0.85, 0.6, 0.92, 'téléphone au sol'], [0.57, 0.68, 0.8, 1.0, 'chaise renversée et sweat au sol']],
            free: [[0.3, 0.02, 0.8, 0.2, 'plafond']],
            mouths: [[0.41, 0.68]],
          },
          bubbles: [{ type: 'pensee', text: '… J’ai rêvé ?', x: 0.3, y: 0.1, w: 0.4, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 5 — Madina, les enseignes se vident
    // Images en paysage 16:9 (rue du marché, grand panneau au carrefour au fond). Continuité : plein soleil,
    // Kaï intact (sac à dos, casque autour du cou) ; case 2 : le GRAND PANNEAU commence à se vider ; case 3 :
    // toutes les enseignes des boutiques sont vides à leur tour ; case 5 : le panneau est presque effacé.
    {
      gutter: 'blanc',
      ambient: 'marche',
      rows: [{ h: 0.36, cols: [1] }, { h: 0.3, cols: [0.5, 0.5] }, { h: 0.34, cols: [0.46, 0.54] }],
      panels: [
        {
          action: 'Plan large. La rue du marché de Madina le matin (7 h 40, plein soleil, ombres nettes) : étal de mangues et étal de tissus wax à gauche, boutiques à droite, motos, foule, et au fond, au-dessus du carrefour, le grand panneau publicitaire encore intact. Kaï traverse la rue en courant, sac à dos sur l’épaule, casque autour du cou. Kaï intact.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'kai', pose: 'marche', expr: 'concentration', shot: 'pied', x: 0.36, y: 0.97, fill: 0.55, blur: -40 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.46, 0.42, 0.64, 0.88, 'Kaï qui court'], [0.43, 0.1, 0.59, 0.24, 'grand panneau du carrefour']],
            free: [[0, 0, 0.4, 0.3, 'ciel (gauche)'], [0.64, 0.02, 0.92, 0.28, 'ciel (droite)']],
            mouths: [[0.54, 0.47]],
          },
          captions: [{ text: 'Le lendemain. 7 h 40. Marché de Madina.', x: 0.02, y: 0.05, w: 0.38, style: 'noir' }],
          bubbles: [{ type: 'parole', text: 'En retard dès le premier jour… bravo, Kaï.', x: 0.8, y: 0.17, w: 0.34, who: 0 }],
        },
        {
          action: 'Plan large. Kaï s’est arrêté au milieu de la rue, sac à dos, casque autour du cou, la tête levée vers le GRAND PANNEAU publicitaire du carrefour, qui commence à se vider : l’affiche part en pixels violets, de la droite vers la gauche, et laisse un fond jaune uni. Plein soleil. Kaï intact.',
          bg: { id: 'rue', time: 'jour', horizon: 0.45, vp: 0.3, cars: false },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'buste', x: 0.62, y: 0.32, fill: 0.72, turn: 0.2 }],
          illus: {
            focus: [0.52, 0.5],
            keep: [[0.5, 0.42, 0.6, 0.9, 'Kaï au milieu de la rue'], [0.43, 0.08, 0.64, 0.24, 'grand panneau qui se vide']],
            free: [[0, 0, 0.4, 0.28, 'ciel (gauche)'], [0.64, 0.62, 1, 1, 'rue (droite)']],
            mouths: [[0.545, 0.48]],
          },
          sfx: [{ text: 'bzzt', x: 0.2, y: 0.12, size: 24, rot: -8, color: '#c4b5fd' }],
          bubbles: [{ type: 'parole', text: 'Hein… ?', x: 0.3, y: 0.55, w: 0.2, who: 0 }],
        },
        {
          action: 'Plan large. Toutes les enseignes des boutiques de la rue sont maintenant vides (fond blanc ou jaune uni) ; le grand panneau, presque vide, laisse échapper quelques pixels violets. Des passants, inquiets, lèvent les bras et pointent le doigt vers le haut. Kaï, de dos, avance vers le carrefour. Plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'passant', pose: 'pointer', expr: 'surprise', shot: 'pied', x: 0.74, y: 0.98, fill: 0.62, flip: true }],
          illus: {
            focus: [0.6, 0.55],
            keep: [[0.5, 0.42, 0.6, 0.88, 'Kaï de dos'], [0.43, 0.08, 0.64, 0.24, 'grand panneau presque vide'], [0.69, 0.42, 0.84, 0.78, 'passants qui pointent']],
            free: [[0, 0, 0.4, 0.28, 'ciel (gauche)']],
            mouths: [[0.715, 0.5]],
          },
          bubbles: [{ type: 'parole', text: 'Mais… c’était écrit quoi, là ?', x: 0.78, y: 0.15, w: 0.3, who: 0 }],
        },
        {
          action: 'La vendeuse de mangues (pagne orange et vert, foulard), désemparée, la main sur la tête, face à un client en chemise blanche qui tient une mangue. Derrière eux, Kaï avance vers le carrefour ; les enseignes des boutiques sont vides, le grand panneau est presque effacé. Marché de Madina, plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.62 },
          chars: [
            { id: 'vendeuse', pose: 'debout', expr: 'surprise', shot: 'americain', x: 0.3, y: 0.3, fill: 0.72 },
            { id: 'passante', pose: 'dos', shot: 'americain', x: 0.82, y: 0.38, fill: 0.66 },
          ],
          illus: {
            focus: [0.36, 0.55],
            keep: [[0.16, 0.4, 0.32, 0.8, 'vendeuse'], [0.34, 0.42, 0.44, 0.92, 'client à la mangue'], [0.51, 0.44, 0.58, 0.73, 'Kaï au loin'], [0.43, 0.1, 0.58, 0.24, 'grand panneau presque effacé']],
            free: [[0.11, 0.0, 0.42, 0.38, 'bâtiment et ciel (gauche)']],
            mouths: [[0.22, 0.47]],
          },
          bubbles: [{ type: 'parole', text: 'Mes prix… je me souviens plus d’aucun prix !', x: 0.32, y: 0.17, w: 0.55, who: 0 }],
        },
        {
          action: 'Gros plan de profil sur Kaï, à droite de la case, près du carrefour : sueur froide, reflet violet sur la joue, casque autour du cou, sac à dos. Au fond, le grand panneau presque entièrement effacé grésille en violet. Plein soleil. Kaï intact.',
          bg: { id: 'aplat', color: '#86c3ef', color2: '#2f86d6' },
          chars: [{ id: 'kai', expr: 'encouragement', shot: 'gros', x: 0.42, y: 0.22, fill: 0.8, turn: 0.3 }],
          illus: {
            focus: [0.62, 0.5],
            keep: [[0.67, 0.19, 0.9, 0.7, 'visage de Kaï'], [0.43, 0.08, 0.6, 0.24, 'grand panneau qui grésille']],
            free: [[0, 0.3, 0.42, 1, 'rue (gauche)']],
            mouths: [[0.69, 0.51]],
          },
          bubbles: [{ type: 'pensee', text: 'Comme cette nuit…', x: 0.24, y: 0.56, w: 0.36, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 6 — L'Oubli surgit
    // Kaï est plus près du carrefour (de l'Oubli) que l'étudiant. Le panneau reste déchiré jusqu'à la fin ;
    // l'étal de mangues est renversé à partir de la case 2 ; l'étal de tissus wax reste intact.
    {
      gutter: 'noir',
      ambient: 'marche',
      rows: [{ h: 0.355, cols: [1] }, { h: 0.32, cols: [0.5, 0.5] }, { h: 0.325, cols: [0.5, 0.5] }],
      panels: [
        {
          action: 'GRANDE CASE. Le carrefour du marché de Madina, 7 h 40, plein soleil. Le grand panneau se déchire de l’intérieur : l’Oubli en sort en déchirant l’affiche (lambeaux de papier), immense, capuche, yeux blancs, tentacules déployés, pixels qui se détachent, contour violet. Au premier plan à droite, Kaï, de dos (sac à dos, main tendue), le regarde.',
          bg: { id: 'marche', time: 'jour', horizon: 0.62, vp: 0.5 },
          chars: [{ id: 'oubli', pose: 'cri', shot: 'pied', x: 0.55, y: 1.0, fill: 0.95, seed: 4 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.46, 0.06, 0.58, 0.2, 'visage de l’Oubli'], [0.3, 0.04, 0.66, 0.5, 'l’Oubli et le panneau déchiré'], [0.72, 0.5, 0.97, 1.0, 'Kaï de dos']],
            free: [[0, 0, 0.3, 0.45, 'ciel (gauche)'], [0.72, 0.02, 1, 0.45, 'ciel (droite)']],
            mouths: [null],
          },
          sfx: [{ text: 'KRRRAAACK !', x: 0.15, y: 0.2, size: 34, rot: -10, color: '#c084fc' }],
          sound: 'boss',
        },
        {
          action: 'Panique dans la rue du marché : la foule fuit dans tous les sens, les vendeuses de mangues crient, l’étal de mangues est renversé par la foule (parasol à terre, mangues qui roulent sur la route). Kaï, immobile au milieu de la rue, regarde l’Oubli sur le panneau déchiré. Plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'passante', pose: 'course', shot: 'pied', x: 0.2, y: 0.98, fill: 0.6, blur: -40 },
            { id: 'passant', pose: 'course', shot: 'pied', x: 0.76, y: 0.98, fill: 0.66, flip: true, blur: 40 },
          ],
          illus: {
            focus: [0.6, 0.55],
            keep: [[0.33, 0.05, 0.72, 0.34, 'l’Oubli'], [0.47, 0.5, 0.57, 0.8, 'Kaï'], [0.71, 0.55, 0.87, 0.85, 'homme qui fuit']],
            free: [[0.0, 0.0, 0.3, 0.3, 'ciel (gauche)'], [0.72, 0.1, 1, 0.5, 'bâtiment (droite)']],
          },
          bubbles: [{ type: 'cri', text: 'COUREZ !!', x: 0.41, y: 0.91, w: 0.36, size: 22, tail: false }],
        },
        {
          action: 'L’étudiant (jeune homme, lunettes, chemise claire) trébuche sur une mangue et s’étale en plein élan, bras écartés, la bouche ouverte ; son cahier bleu lui échappe et glisse sur la route. L’étal de mangues renversé et le parasol à terre sont derrière lui ; l’Oubli domine le carrefour. Kaï, plus près du carrefour que lui, est hors champ. Plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.55, vp: 0.3 },
          chars: [{ id: 'etudiant', pose: 'chute', shot: 'pied', x: 0.5, y: 0.95, fill: 0.62 }],
          illus: {
            focus: [0.6, 0.55],
            keep: [[0.58, 0.52, 0.65, 0.66, 'visage de l’étudiant'], [0.45, 0.5, 0.77, 0.9, 'étudiant qui tombe'], [0.33, 0.05, 0.72, 0.34, 'l’Oubli']],
            free: [[0, 0, 0.3, 0.3, 'ciel (gauche)'], [0.77, 0.1, 1, 0.5, 'bâtiment (droite)']],
            mouths: [[0.61, 0.6]],
          },
          bubbles: [{ type: 'cri', text: 'Mon cahier… !', x: 0.17, y: 0.92, w: 0.24, size: 14, who: 0 }],
        },
        {
          action: 'Un tentacule de l’Oubli fonce vers l’étudiant, assis par terre et de dos, qui lève le bras pour se protéger ; son cahier bleu est resté à quelques mètres. Mangues éparpillées, étal de mangues renversé. Kaï, plus près du carrefour que l’étudiant, est hors champ. Plein soleil.',
          bg: { id: 'flash', color: '#efe7ff', lines: VIOLET, cx: 0.75, cy: 0.4 },
          chars: [{ id: 'etudiant', pose: 'choc', shot: 'pied', x: 0.3, y: 1.0, fill: 0.7 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.37, 0.05, 0.66, 0.34, 'l’Oubli'], [0.47, 0.25, 0.63, 0.43, 'tentacule'], [0.37, 0.52, 0.62, 0.92, 'étudiant, bras levé']],
            free: [[0.0, 0.0, 0.34, 0.3, 'ciel (gauche)'], [0.66, 0.0, 1, 0.3, 'ciel (droite)']],
          },
          sfx: [{ text: 'FWOOSH', x: 0.86, y: 0.5, size: 24, rot: -10, color: '#c4b5fd' }],
          sound: 'swipe',
        },
        {
          action: 'Kaï, au carrefour, plus près de l’Oubli que l’étudiant, figé : gros plan sur ses jambes qui tremblent et ses poings serrés (sweat violet, baskets blanches). Autour : étal renversé, mangues, parasol à terre, foule qui fuit au fond. Plein soleil. Kaï intact.',
          bg: { id: 'aplat', color: '#cfe4f2', color2: '#86c3ef' },
          chars: [{ id: 'pieds', of: 'kai', x: 0.5, y: 0.98, size: 0.75 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.34, 0.15, 0.66, 0.93, 'jambes qui tremblent et poings serrés']],
            free: [[0.0, 0.0, 1, 0.12, 'ciel (haut)']],
          },
          bubbles: [{ type: 'pensee', text: 'Bouge… BOUGE !', x: 0.5, y: 0.07, w: 0.5, size: 17, tail: false }],
        },
      ],
    },
    // ============================================================ PAGE 7 — Le sauvetage et le choc
    {
      gutter: 'blanc',
      ambient: 'marche',
      rows: [{ h: 0.31, cols: [0.5, 0.5] }, { h: 0.37, cols: [1] }, { h: 0.32, cols: [0.5, 0.5] }],
      panels: [
        {
          action: 'Kaï court depuis le fond de la rue (près du carrefour, sous le panneau déchiré) vers l’étudiant tombé au premier plan à droite, qui lève le bras ; poussière sous les pieds de Kaï, le tentacule de l’Oubli fend l’air derrière lui. Étal de mangues renversé, mangues et caisses au sol, cahier bleu à terre. Plein soleil. Kaï intact (sac à dos, casque).',
          bg: { id: 'marche', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'course', shot: 'pied', x: 0.5, y: 0.96, fill: 0.85, blur: -80 }],
          illus: {
            focus: [0.6, 0.55],
            keep: [[0.4, 0.34, 0.53, 0.76, 'Kaï qui court'], [0.5, 0.47, 0.92, 1.0, 'étudiant tombé au premier plan'], [0.38, 0.05, 0.66, 0.3, 'l’Oubli']],
            free: [[0, 0, 0.36, 0.3, 'ciel (gauche)']],
          },
          sfx: [{ text: 'TAP TAP TAP', x: 0.19, y: 0.88, size: 18, rot: -6, color: '#ffd23f' }],
        },
        {
          action: 'Kaï attrape l’étudiant par le torse et plonge avec lui vers la droite ; le tentacule de l’Oubli frappe le sol là où se trouvait l’étudiant : éclat violet, le sol se fissure. Cahier bleu à terre, étal de mangues renversé. Plein soleil. Kaï intact (sac à dos encore sur le dos).',
          bg: { id: 'marche', time: 'jour', horizon: 0.62, vp: 0.72 },
          chars: [
            { id: 'etudiant', pose: 'chute', shot: 'pied', x: 0.4, y: 0.95, fill: 0.5 },
            { id: 'kai', pose: 'plongeon', shot: 'pied', x: 0.22, y: 0.92, fill: 0.48, blur: -120 },
          ],
          illus: {
            focus: [0.62, 0.5],
            keep: [[0.5, 0.42, 0.9, 0.84, 'Kaï et l’étudiant qui plongent'], [0.44, 0.8, 0.58, 0.97, 'impact du tentacule'], [0.33, 0.05, 0.72, 0.34, 'l’Oubli']],
            free: [[0, 0, 0.32, 0.3, 'ciel (gauche)']],
            mouths: [[0.75, 0.5]],
          },
          sfx: [{ text: 'BOOM !', x: 0.6, y: 0.91, size: 34, rot: 8, color: '#ff5a3d' }],
          bubbles: [{ type: 'cri', text: 'BOUGE !!', x: 0.82, y: 0.13, w: 0.24, size: 18, who: 0 }],
          sound: 'hit',
        },
        {
          action: 'Gros plan au ras du sol sur le cahier bleu, resté ouvert sur la route : le tentacule le touche et l’encre se vide en pixels violets. Derrière, flous, Kaï et l’étudiant (lunettes), allongés par terre, regardent, horrifiés. Plein soleil. Kaï intact.',
          bg: { id: 'marche', time: 'jour', horizon: 0.45, vp: 0.5 },
          chars: [{ id: 'etudiant', pose: 'genou', shot: 'pied', x: 0.55, y: 0.85, fill: 0.5 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.08, 0.6, 0.66, 0.95, 'cahier bleu qui se vide'], [0.32, 0.2, 0.46, 0.7, 'tentacule'], [0.58, 0.18, 0.92, 0.6, 'visages de Kaï et de l’étudiant']],
            free: [[0, 0, 0.3, 0.45, 'rue floue (gauche)'], [0.66, 0.7, 1, 1, 'route (droite)']],
            mouths: [[0.64, 0.27]],
          },
          bubbles: [{ type: 'cri', text: 'Mon cahier ! Tout est effacé !', x: 0.15, y: 0.22, w: 0.26, size: 20, who: 0 }],
        },
        {
          action: 'Un second tentacule surgit sur le côté et frappe Kaï de plein fouet au flanc, en plein mouvement ; l’étudiant, assis à droite, regarde. Éclat blanc au point d’impact. Plein soleil. Kaï intact jusqu’à ce coup.',
          bg: { id: 'flash', color: '#fff7e0', lines: '#120b09', cx: 0.5, cy: 0.5 },
          chars: [
            { id: 'oubli', pose: 'attaque', shot: 'taille', x: 0.05, y: 0.1, fill: 0.8, seed: 7 },
            { id: 'kai', pose: 'chute', shot: 'pied', x: 0.62, y: 0.85, fill: 0.62 },
          ],
          illus: {
            focus: [0.66, 0.5],
            keep: [[0.55, 0.42, 0.8, 0.9, 'Kaï frappé au flanc'], [0.78, 0.62, 0.93, 1.0, 'étudiant'], [0.37, 0.03, 0.66, 0.32, 'l’Oubli']],
            free: [[0.37, 0.55, 0.6, 1, 'sol (gauche)']],
          },
          sfx: [{ text: 'BAM !', x: 0.2, y: 0.84, size: 30, rot: 8, color: '#ff5a3d' }],
          sound: 'hit',
        },
        {
          action: 'Kaï est projeté contre le pilier en béton d’une boutique du côté droit de la rue (enseigne blanche vide) : le pilier se fissure, des éclats volent, les caisses en plastique bleues et vertes tombent autour de lui, son sac à dos tombe sur la route. Il ne tombe PAS dans l’étal de tissus wax (resté intact). À partir d’ici : lèvre qui saigne un peu, manche droite déchirée, poussière, plus de sac. Plein soleil.',
          bg: { id: 'marche', time: 'jour', horizon: 0.4, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'au_sol', shot: 'pied', x: 0.5, y: 0.98, fill: 0.5 }],
          illus: {
            focus: [0.66, 0.55],
            keep: [[0.46, 0.13, 0.84, 0.93, 'Kaï contre le pilier'], [0.82, 0.25, 0.94, 0.6, 'pilier fissuré'], [0.69, 0.6, 0.96, 0.97, 'caisses qui tombent'], [0.37, 0.82, 0.48, 0.92, 'sac à dos sur la route']],
            free: [[0.37, 0.4, 0.5, 0.78, 'route (gauche)']],
          },
          sfx: [{ text: 'KRASH', x: 0.09, y: 0.55, size: 22, rot: -10, color: '#ff8a3d' }],
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
          action: 'Kaï est assis au pied du pilier fissuré de la boutique (côté droit de la rue), parmi les caisses en plastique bleues et vertes renversées ; lèvre en sang, manche droite déchirée, poussière, sonné, il grimace. Son téléphone à l’écran fissuré est au sol près de sa main, son sac à dos un peu plus loin. L’étudiant, à genoux, est en arrière-plan. Marché, plein soleil.',
          bg: { id: 'aplat', color: '#b9a58c', color2: '#6f6a74' },
          chars: [{ id: 'kai', expr: 'encouragement', shot: 'buste', x: 0.5, y: 0.28, fill: 0.72, turn: 0.2 }],
          fx: [{ type: 'trame', color: '#1f6fb2', opacity: 0.3 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.3, 0.28, 0.7, 0.7, 'visage de Kaï (lèvre en sang)'], [0.1, 0.6, 0.9, 1, 'pilier fissuré et caisses renversées']],
            free: [[0, 0, 1, 0.24, 'haut de la case']],
            mouths: [[0.5, 0.55]],
          },
          bubbles: [{ type: 'pensee', text: 'J’ai… mal…', x: 0.24, y: 0.13, w: 0.4, who: 0 }],
        },
        {
          action: 'Gros plan sur le visage terrifié de Kaï : il essaie de se souvenir de quelque chose et n’y arrive pas. Effet glitch violet UNIQUEMENT sur les bords de la case. Lèvre en sang. Plein soleil.',
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
          action: 'Vue depuis les yeux de Kaï, en contre-plongée : l’Oubli a quitté le grand panneau et flotte au-dessus de lui, immense, yeux blancs, contour violet ; au loin, le panneau est déchiré et vide. Les pieds de Kaï en bas de l’image. Ciel bleu, ombre violette.',
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
          action: 'Même point de vue que la page 8 case 3 (les yeux de Kaï) : sa main (manche déchirée) ramasse son téléphone ; l’Oubli lance une vague (anneau violet) et les enseignes vides s’allument en violet. Plein soleil, lueur violette.',
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
          action: 'Même point de vue : quatre anneaux violets de plus en plus rapprochés, les enseignes clignotent de plus en plus vite. Kaï, qui compte, tient son téléphone. Plein soleil, éclats violets.',
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
          action: 'Un passant (chemise verte, petit bonnet blanc) caché derrière l’étal de mangues renversé, paniqué ; l’Oubli et ses anneaux au loin, Kaï assis au fond de la rue. Marché de Madina, plein soleil.',
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
          action: 'GRANDE CASE. Kaï se relève près du pilier fissuré, téléphone en main ; l’Oubli s’éloigne vers le grand panneau du carrefour, comme aspiré. Le sac à dos est sur la route. Plein soleil. Lèvre en sang, manche droite déchirée, poussière, sans sac sur lui.',
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
          action: 'L’étudiant (lunettes, chemise claire), à genoux au premier plan, tend le bras vers Kaï qui court déjà vers le carrefour, le long des boutiques. Marché, plein soleil.',
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
          action: 'Kaï, à mi-chemin du carrefour, glisse sur l’asphalte comme au baseball sous un tentacule de l’Oubli (il n’y a pas d’étal sur sa route). Plein soleil. Lèvre en sang, manche déchirée, poussière, sans sac.',
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
          action: 'Kaï saute par-dessus une moto rouge renversée, près du carrefour ; derrière lui, un tentacule fracasse le sol. Plein soleil. Lèvre en sang, manche déchirée.',
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
          action: 'En se condensant, l’Oubli devient solide et lourd : son noyau de verre violet translucide tombe du grand panneau et s’arrête à hauteur de poitrine, au pied de l’immeuble d’angle. Kaï, au premier plan, arme son poing droit. Plein soleil. Lèvre en sang, manche déchirée.',
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
          action: 'Tout revient : les lettres sur les enseignes, les prix de la vendeuse (joie ; son étal de mangues reste renversé), le cahier bleu de l’étudiant. Kaï est au loin, à genoux au carrefour. Marché de Madina, plein soleil.',
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
          action: 'Plan large depuis le toit-terrasse au réservoir d’eau, au-dessus des boutiques de droite, qui domine la même rue du marché (7 h 41, plein soleil). Mory, accroupi, antenne bricolée posée à côté de lui, tient un chronomètre (sa mention « 16,0 » est dans sa réplique). Ses lunettes brillent.',
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
