// =====================================================================
// CHAPITRE 3 — « La voix de la bibliothèque »  (Nia) — VERSION 2 : 12 pages, 58 cases
// ---------------------------------------------------------------------
// Script de référence (et bible de continuité : lieux, heures, pluie,
// main bandée de Kaï, vêtements mouillés pages 1 à 4, règles de l'Oubli) :
// docs/scenario-ch03-v2.md
//
// Format : voir l'en-tête de ch01.js et le README (section "Mode Histoire en BD").
// Nouveautés de ce chapitre :
//   bg 'croquis' : croquis à main levée sur papier quadrillé (dessin de l'appli) :
//                  origin (axes), curve (points de la courbe), segs (corde, tangentes),
//                  dots ; les mots du croquis sont des labels de style 'main' (traduits).
//   bg 'ecran'   : un « \n » dans text force un retour à la ligne (chronomètre, page 8).
//   Figurants    : bibliothecaire, etudiante_hijab, etudiant_jaune (src/data/comic/looks.js).
// Illustrations : public/story/chapitre-3/page-P-case-C.jpg (16:9, sujet au centre).
// Les repères `illus` (focus, keep, free, mouths) sont à recaler sur chaque image
// après son dépôt (npm run verifier-bulles -- 3, puis contrôle visuel par captures).
// =====================================================================

// Continuité de Kaï (bible) : trempé pages 1 à 4, puis sec
const KAI_T = 'Kaï : trempé par la pluie (cheveux mouillés, sweat violet plus foncé là où il est mouillé, gouttes qui tombent), cordons blancs, casque noir autour du cou, jogging noir, baskets blanches, petit sac à dos gris foncé sur l’épaule droite, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.';
const MORY_T = 'Mory : trempé, afro noir volumineux à reflets sarcelle, lunettes rectangulaires aux verres transparents, veste marine à col montant et lignes cyan, cargo gris foncé, baskets noir et cyan, sac à dos noir ; il protège sa petite antenne portable sous sa veste.';
const KAI = 'Kaï : sweat violet, cordons blancs, casque noir autour du cou, jogging noir, baskets blanches, petit sac à dos gris foncé, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.';
const SALLE = 'Grande salle de lecture de la bibliothèque universitaire : longues tables en bois en rangées, lampes de lecture vertes, ventilateurs au plafond, grandes fenêtres à gauche où la pluie ruisselle, hautes étagères, bloc de rayonnages centraux au fond et, devant, la grande table centrale.';
const NIA = 'Nia (voir sa fiche « Référence Nia ») : calme, posée, un stylo à la main ; son gros dictionnaire à couverture rouge sur sa table.';
const VIOLET = '#c4b5fd';

export default {
  id: 3,
  title: 'La voix de la bibliothèque',
  pages: [
    // ============================================================ PAGE 1 — La pluie
    {
      gutter: 'blanc',
      ambient: 'pluie',
      rows: [
        { h: 0.36, cols: [1], tilt: 22 },
        { h: 0.32, cols: [0.55, 0.45], ctilt: [-22] },
        { h: 0.32, cols: [1] },
      ],
      panels: [
        {
          action: 'Plan large. Le campus de l’Université de Conakry sous une pluie battante (9 h 40, ciel gris, flaques) : bâtiments à arcades, palmiers ; des étudiants courent avec leur sac sur la tête.',
          bg: { id: 'rue', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'etudiant', pose: 'course', shot: 'pied', x: 0.28, y: 0.96, fill: 0.4 },
            { id: 'etudiante', pose: 'course', shot: 'pied', x: 0.72, y: 0.97, fill: 0.42, flip: true },
          ],
          fx: [{ type: 'pluie' }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.3, 0.45, 0.7, 0.95, 'étudiants qui courent sous la pluie']],
            free: [[0, 0, 0.5, 0.2, 'ciel gris (haut gauche)']],
          },
          captions: [{ text: 'Le lendemain. 9 h 40. Il pleut sur Conakry.', x: 0.03, y: 0.05, w: 0.5, style: 'noir' }],
          sound: 'swipe',
        },
        {
          action: `Kaï et Mory courent côte à côte sous la pluie, trempés, vers la bibliothèque ; Mory protège son antenne sous sa veste. Campus, 9 h 41. ${KAI_T} ${MORY_T}`,
          bg: { id: 'rue', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'course', expr: 'concentration', shot: 'americain', x: 0.3, y: 0.42, fill: 0.62 },
            { id: 'mory', pose: 'course', expr: 'concentration', shot: 'americain', x: 0.72, y: 0.44, fill: 0.62 },
          ],
          fx: [{ type: 'pluie' }, { type: 'vitesse', opacity: 0.35 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.22, 0.2, 0.4, 0.5, 'visage de Kaï'], [0.6, 0.2, 0.78, 0.5, 'visage de Mory'], [0.58, 0.5, 0.75, 0.7, 'antenne sous la veste']],
            free: [[0.35, 0, 0.65, 0.18, 'ciel de pluie']],
            mouths: [[0.31, 0.42], [0.69, 0.44]],
          },
          bubbles: [
            { type: 'parole', text: 'T’es sûr de ton coup ?', x: 0.22, y: 0.12, w: 0.4, who: 0 },
            { type: 'parole', text: 'Mon antenne se trompe jamais.', x: 0.74, y: 0.13, w: 0.44, who: 1 },
          ],
        },
        {
          action: `Devant le grand escalier de la bibliothèque universitaire, sous la pluie, Mory sort sa petite antenne portable de sous sa veste : ses lumières cyan clignotent. Kaï, à côté, regarde l’antenne. ${MORY_T} ${KAI_T}`,
          bg: { id: 'rue', time: 'pluie', horizon: 0.55, vp: 0.6 },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'concentration', shot: 'taille', x: 0.5, y: 0.5, fill: 0.7 }],
          fx: [{ type: 'pluie' }, { type: 'lueur', color: '#22d3ee', x: 0.62, y: 0.6, size: 0.25 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.38, 0.15, 0.6, 0.48, 'visage de Mory'], [0.55, 0.45, 0.72, 0.7, 'antenne qui clignote']],
            free: [[0.65, 0, 1, 0.3, 'pluie (haut droite)']],
            mouths: [[0.5, 0.4]],
          },
          bubbles: [{ type: 'parole', text: '10 heures. Ici.', x: 0.78, y: 0.14, w: 0.36, who: 0 }],
          sound: 'bubble',
        },
        {
          action: 'Contre-plongée sur la façade de la bibliothèque universitaire sous la pluie : bâtiment beige à colonnes, grand escalier, porte vitrée ; Kaï et Mory, petits de dos au pied des marches, la regardent.',
          bg: { id: 'classe', time: 'pluie', horizon: 0.7, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'dos', shot: 'pied', x: 0.4, y: 0.98, fill: 0.36 },
            { id: 'mory', pose: 'dos', shot: 'pied', x: 0.6, y: 0.98, fill: 0.36 },
          ],
          fx: [{ type: 'pluie' }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.3, 0.15, 0.7, 0.75, 'façade à colonnes et porte vitrée'], [0.38, 0.75, 0.62, 1, 'Kaï et Mory de dos']],
            free: [[0, 0, 0.3, 0.5, 'ciel gris (gauche)'], [0.7, 0, 1, 0.5, 'ciel gris (droite)']],
            mouths: [[0.42, 0.82], [0.58, 0.82]],
          },
          bubbles: [
            { type: 'parole', text: 'Une bibliothèque…', x: 0.16, y: 0.2, w: 0.28, who: 0 },
            { type: 'parole', text: 'Là où on garde les livres.', x: 0.84, y: 0.3, w: 0.3, who: 1 },
          ],
        },
      ],
    },
    // ============================================================ PAGE 2 — La voix
    {
      gutter: 'blanc',
      ambient: 'pluie',
      rows: [
        { h: 0.3, cols: [1], tilt: -20 },
        { h: 0.34, cols: [0.5, 0.5], ctilt: [20] },
        { h: 0.36, cols: [0.58, 0.42], ctilt: [-18] },
      ],
      panels: [
        {
          action: `Plan large de la grande salle de lecture, silencieuse (9 h 52), la pluie sur les grandes fenêtres. Kaï et Mory entrent par la porte, trempés, et s’arrêtent. ${SALLE} ${KAI_T} ${MORY_T}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.45, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'debout', shot: 'pied', x: 0.16, y: 0.97, fill: 0.5 },
            { id: 'mory', pose: 'debout', shot: 'pied', x: 0.28, y: 0.97, fill: 0.5 },
          ],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.08, 0.4, 0.35, 0.95, 'Kaï et Mory à l’entrée'], [0.4, 0.3, 0.9, 0.7, 'salle de lecture et tables']],
            free: [[0.4, 0, 1, 0.22, 'plafond et ventilateurs']],
          },
          captions: [{ text: '9 h 52. Bibliothèque universitaire.', x: 0.5, y: 0.05, w: 0.46, style: 'noir' }],
        },
        {
          action: `Au milieu de la salle, une longue table entourée d’une dizaine d’étudiants qui écoutent ; au centre, Nia, vue de trois quarts dos, parle. Lampes de lecture vertes, lumière grise de la pluie. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'etudiant', pose: 'assis_bureau', shot: 'taille', x: 0.18, y: 0.62, fill: 0.5 },
            { id: 'nia', pose: 'parle', expr: 'neutre', shot: 'taille', x: 0.52, y: 0.56, fill: 0.62 },
            { id: 'etudiante', pose: 'assis_bureau', shot: 'taille', x: 0.84, y: 0.62, fill: 0.5, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.4, 0.25, 0.62, 0.7, 'Nia de trois quarts'], [0.1, 0.4, 0.9, 0.8, 'étudiants autour de la table']],
            free: [[0.3, 0, 0.75, 0.2, 'étagères du fond']],
            mouths: [null, [0.55, 0.38]],
          },
          bubbles: [{ type: 'parole', text: 'Imaginez une pirogue.', x: 0.5, y: 0.12, w: 0.5, who: 1 }],
        },
        {
          action: `Nia, de face, plan taille, explique avec les mains, calme et vivante ; derrière elle, des étudiants attentifs et les étagères. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.4 },
          chars: [{ id: 'nia', pose: 'parle', expr: 'joie', shot: 'taille', x: 0.62, y: 0.5, fill: 0.74 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.48, 0.12, 0.7, 0.48, 'visage de Nia'], [0.4, 0.5, 0.85, 0.8, 'mains qui expliquent']],
            free: [[0, 0, 0.42, 0.6, 'étagères (gauche)']],
            mouths: [[0.6, 0.4]],
          },
          bubbles: [{ type: 'parole', text: 'Entre Kaloum et les îles de Loos, elle met une heure. Sa vitesse moyenne, c’est la distance divisée par le temps. Facile.', x: 0.26, y: 0.3, w: 0.48 }],
        },
        {
          action: '[DESSIN APPLI] Le croquis de Nia sur une feuille quadrillée : une courbe (la position de la pirogue en fonction du temps), une corde rouge entre deux points marquée « vitesse moyenne », et une tangente verte en un point marquée « vitesse instantanée ».',
          bg: {
            id: 'croquis',
            origin: [0.1, 0.86],
            curve: [[0.1, 0.86], [0.18, 0.84], [0.26, 0.787], [0.34, 0.709], [0.42, 0.614], [0.5, 0.51], [0.58, 0.406], [0.66, 0.311], [0.74, 0.233], [0.82, 0.18], [0.9, 0.16]],
            segs: [
              { a: [0.14, 0.855], b: [0.58, 0.406], color: '#c0392b' },
              { a: [0.616, 0.329], b: [0.896, 0.111], color: '#1f8a4c' },
            ],
            dots: [[0.14, 0.855, '#c0392b'], [0.58, 0.406, '#c0392b'], [0.756, 0.22, '#1f8a4c']],
          },
          labels: [
            { text: 'vitesse moyenne', x: 0.3, y: 0.5, size: 30, style: 'main', color: '#c0392b', rot: -14 },
            { text: 'vitesse instantanée', x: 0.6, y: 0.13, size: 28, style: 'main', color: '#1f8a4c', rot: -3 },
            { text: 'temps', x: 0.86, y: 0.93, size: 26, style: 'main' },
            { text: 'position', x: 0.16, y: 0.05, size: 26, style: 'main' },
          ],
        },
        {
          action: `Gros plan sur Nia, l’index levé, le regard vif, sûre d’elle. Lampe de lecture verte floue derrière. ${NIA}`,
          bg: { id: 'aplat', color: '#f3e8d0', color2: '#c9b48a' },
          chars: [{ id: 'nia', pose: 'pointer', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.44, fill: 0.56 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.38, 0.12, 0.62, 0.55, 'visage de Nia'], [0.6, 0.05, 0.72, 0.35, 'index levé']],
            free: [[0, 0.55, 0.4, 1, 'fond flou (bas gauche)']],
            mouths: [[0.5, 0.45]],
          },
          bubbles: [{ type: 'parole', text: 'Mais la dérivée, c’est la vitesse à UN instant précis. Pas sur tout le trajet. MAINTENANT.', x: 0.5, y: 0.15, w: 0.88, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 3 — Le signal
    {
      gutter: 'blanc',
      ambient: 'pluie',
      rows: [
        { h: 0.3, cols: [1], tilt: 20 },
        { h: 0.34, cols: [0.55, 0.45], ctilt: [-20] },
        { h: 0.36, cols: [0.5, 0.5], ctilt: [18] },
      ],
      panels: [
        {
          action: 'Une étudiante en hijab vert se lève d’un coup de sa chaise, ravie, les bras en l’air, à la table de Nia ; plus loin, à son comptoir près de l’entrée, la bibliothécaire (femme d’environ 50 ans, lunettes au bout du nez, foulard bleu marine, chemisier blanc) fronce les sourcils. Salle de lecture, lumière grise de la pluie et lampes vertes.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.7 },
          chars: [
            { id: 'etudiante_hijab', pose: 'victoire', expr: 'joie', shot: 'americain', x: 0.3, y: 0.44, fill: 0.66 },
            { id: 'bibliothecaire', pose: 'bras_croises', expr: 'neutre', shot: 'taille', x: 0.82, y: 0.5, fill: 0.46, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.2, 0.15, 0.42, 0.5, 'visage de l’étudiante (hijab vert)'], [0.72, 0.3, 0.86, 0.55, 'visage de la bibliothécaire']],
            free: [[0.45, 0, 0.7, 0.3, 'étagères (haut centre)']],
            mouths: [[0.31, 0.4], [0.79, 0.47]],
          },
          bubbles: [
            { type: 'cri', text: 'J’ai enfin compris !!', x: 0.53, y: 0.17, w: 0.34, who: 0 },
            { type: 'murmure', text: 'Chuuut !', x: 0.86, y: 0.15, w: 0.22, who: 1 },
          ],
        },
        {
          action: `Près de l’entrée, Mory tient sa petite antenne portable : elle clignote fort (lumières cyan), pointée vers Nia au loin ; Kaï regarde par-dessus son épaule. ${MORY_T} ${KAI_T}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.3 },
          chars: [
            { id: 'mory', pose: 'telephone', expr: 'surprise', shot: 'taille', x: 0.36, y: 0.5, fill: 0.68 },
            { id: 'kai', pose: 'debout', expr: 'neutre', shot: 'taille', x: 0.8, y: 0.55, fill: 0.6, flip: true },
          ],
          fx: [{ type: 'lueur', color: '#22d3ee', x: 0.55, y: 0.62, size: 0.2 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.26, 0.15, 0.46, 0.48, 'visage de Mory'], [0.46, 0.5, 0.62, 0.72, 'antenne qui clignote'], [0.7, 0.2, 0.88, 0.5, 'visage de Kaï']],
            free: [[0.4, 0, 0.7, 0.2, 'étagères (haut)']],
            mouths: [[0.36, 0.4], [0.79, 0.42]],
          },
          sfx: [{ text: 'bip bip bip', x: 0.62, y: 0.86, size: 30, rot: -6, color: '#22d3ee' }],
          bubbles: [{ type: 'murmure', text: 'Attends… quand elle parle, mon antenne s’affole.', x: 0.36, y: 0.13, w: 0.62, who: 0 }],
          sound: 'bubble',
        },
        {
          action: `Mory, sérieux, gros plan, regarde sa tablette noire : une courbe s’y dessine. La lumière de l’écran éclaire son visage. ${MORY_T}`,
          bg: { id: 'aplat', color: '#203048', color2: '#0b1220' },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.36, 0.12, 0.62, 0.55, 'visage de Mory'], [0.35, 0.65, 0.65, 0.95, 'tablette']],
            free: [[0, 0, 0.35, 0.6, 'fond (gauche)']],
            mouths: [[0.5, 0.46]],
          },
          bubbles: [{ type: 'murmure', text: 'Quand elle explique, le savoir s’ancre. L’Oubli peut plus y toucher.', x: 0.5, y: 0.13, w: 0.86, who: 0 }],
        },
        {
          action: `Kaï, plan buste, regarde Nia (hors champ), impressionné, un léger sourire ; ses cheveux gouttent encore. ${KAI_T}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.8 },
          chars: [{ id: 'kai', pose: 'debout', expr: 'joie', shot: 'buste', x: 0.56, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.42, 0.12, 0.68, 0.55, 'visage de Kaï']],
            free: [[0, 0, 0.4, 0.5, 'étagères (gauche)']],
            mouths: [[0.55, 0.45]],
          },
          bubbles: [{ type: 'pensee', text: 'C’est la seule qui explique vraiment bien.', x: 0.5, y: 0.13, w: 0.82, who: 0 }],
        },
        {
          action: `Nia lève les yeux de sa feuille et remarque les deux garçons trempés qui la fixent (Kaï et Mory, de dos en amorce, flous, au premier plan). ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'lire', expr: 'surprise', shot: 'buste', x: 0.6, y: 0.44, fill: 0.58 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.48, 0.15, 0.7, 0.55, 'visage de Nia'], [0.48, 0.6, 0.75, 0.9, 'feuille sur la table']],
            free: [[0, 0, 0.4, 0.4, 'fond (haut gauche)']],
            mouths: [[0.6, 0.45]],
          },
        },
      ],
    },
    // ============================================================ PAGE 4 — La rencontre
    {
      gutter: 'blanc',
      ambient: 'pluie',
      rows: [
        { h: 0.34, cols: [1], tilt: -18 },
        { h: 0.34, cols: [0.45, 0.55], ctilt: [18] },
        { h: 0.32, cols: [1] },
      ],
      panels: [
        {
          action: `Nia, debout, bras croisés, un sourcil levé, face à Kaï et Mory qui dégoulinent (flaques sous eux). Salle de lecture, lumière grise et lampes vertes. ${NIA} ${KAI_T} ${MORY_T}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'debout', expr: 'surprise', shot: 'americain', x: 0.18, y: 0.46, fill: 0.62 },
            { id: 'mory', pose: 'debout', expr: 'neutre', shot: 'americain', x: 0.38, y: 0.47, fill: 0.6 },
            { id: 'nia', pose: 'bras_croises', expr: 'clin', shot: 'americain', x: 0.78, y: 0.45, fill: 0.64, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.12, 0.15, 0.3, 0.45, 'visage de Kaï'], [0.32, 0.15, 0.48, 0.45, 'visage de Mory'], [0.66, 0.12, 0.84, 0.45, 'visage de Nia']],
            free: [[0.48, 0, 0.66, 0.4, 'étagères entre eux']],
            mouths: [[0.22, 0.38], [0.4, 0.38], [0.74, 0.36]],
          },
          bubbles: [{ type: 'parole', text: 'Vous voulez un cours… ou une serviette ?', x: 0.58, y: 0.16, w: 0.4, who: 2 }],
        },
        {
          action: `Kaï, gêné, se gratte la nuque de la main gauche ; une flaque d’eau à ses pieds, gouttes qui tombent de son sweat. ${KAI_T}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'decontracte', expr: 'surprise', shot: 'americain', x: 0.5, y: 0.42, fill: 0.7 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.38, 0.1, 0.62, 0.42, 'visage de Kaï'], [0.3, 0.85, 0.7, 1, 'flaque à ses pieds']],
            free: [[0, 0, 0.35, 0.5, 'étagères (gauche)']],
            mouths: [[0.5, 0.36]],
          },
          bubbles: [{ type: 'parole', text: 'On… on cherche quelqu’un.', x: 0.5, y: 0.12, w: 0.8, who: 0 }],
        },
        {
          action: `Nia, impassible, plan buste, reprend son stylo ; son gros dictionnaire rouge sur la table devant elle. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.6 },
          chars: [{ id: 'nia', pose: 'lire', expr: 'neutre', shot: 'buste', x: 0.6, y: 0.48, fill: 0.62 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.46, 0.12, 0.7, 0.52, 'visage de Nia'], [0.25, 0.7, 0.55, 0.95, 'dictionnaire rouge']],
            free: [[0, 0, 0.4, 0.6, 'étagères (gauche)']],
            mouths: [[0.6, 0.44]],
          },
          bubbles: [{ type: 'parole', text: 'Ici, on cherche des livres. Les gens, c’est dehors.', x: 0.22, y: 0.24, w: 0.4, who: 0 }],
        },
        {
          action: `L’horloge murale au-dessus de l’entrée passe à 10:00 (gros plan) ; en bas, la petite antenne de Mory s’affole (lumières cyan en rafale), Mory la tient, le visage tendu. ${MORY_T}`,
          bg: { id: 'aplat', color: '#e7d9b8', color2: '#9a8a6a' },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'concentration', shot: 'buste', x: 0.72, y: 0.44, fill: 0.62 }],
          fx: [{ type: 'concentration', opacity: 0.35 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.15, 0.08, 0.42, 0.62, 'horloge à 10:00'], [0.6, 0.2, 0.82, 0.6, 'visage de Mory'], [0.55, 0.62, 0.75, 0.95, 'antenne qui s’affole']],
            free: [[0.42, 0, 0.6, 0.4, 'mur (centre)']],
            mouths: [[0.7, 0.5]],
          },
          sfx: [{ text: 'BIP BIP BIP !', x: 0.3, y: 0.85, size: 40, rot: -8, color: '#22d3ee' }],
          bubbles: [{ type: 'murmure', text: 'Il est là.', x: 0.5, y: 0.14, w: 0.26, who: 0 }],
          sound: 'boss',
        },
      ],
    },
    // ============================================================ PAGE 5 — Les pages blanches
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [
        { h: 0.28, cols: [0.5, 0.5], ctilt: [22] },
        { h: 0.3, cols: [1], tilt: -22 },
        { h: 0.42, cols: [0.45, 0.55], ctilt: [-20] },
      ],
      panels: [
        {
          action: 'Les lampes de lecture vertes grésillent et clignotent en violet au-dessus des longues tables ; les étudiants lèvent la tête. Salle de lecture, 10 h 00.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          fx: [{ type: 'glitch', n: 16 }, { type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.2, 0.15, 0.8, 0.6, 'lampes vertes qui clignotent en violet']],
            free: [[0, 0.65, 1, 1, 'tables (bas)']],
          },
          sfx: [{ text: 'bzzt… bzzt', x: 0.5, y: 0.86, size: 34, rot: -4, color: VIOLET }],
          sound: 'boss',
        },
        {
          action: 'Gros plan sur un livre ouvert sur une table : les lettres s’envolent de la page une à une, en pixels violets ; la page se vide.',
          bg: { id: 'cahier', lines: ['Chapitre 4 : les dérivées', 'f′(a) = lim (f(a+h) − f(a)) / h', 'pente de la tangente'], fade: true, keep: [] },
          fx: [{ type: 'glitch', n: 22 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.2, 0.2, 0.8, 0.85, 'page qui se vide']],
            free: [[0.7, 0, 1, 0.3, 'pixels (haut droite)']],
          },
          sfx: [{ text: 'VMMMM', x: 0.78, y: 0.14, size: 36, rot: -8, color: VIOLET }],
        },
        {
          action: 'Les rayonnages : sur des centaines de livres, les titres disparaissent des dos ; un essaim de lettres violettes s’envole vers le fond de la salle, vers le bloc de rayonnages centraux.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.75 },
          fx: [{ type: 'glitch', n: 30 }, { type: 'teinte', color: '#7c3aed', opacity: 0.25 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.1, 0.1, 0.9, 0.9, 'rayonnages et essaim de lettres']],
            free: [],
          },
        },
        {
          action: 'Un étudiant en chemise jaune, son mémoire relié à la main, horrifié : les pages deviennent blanches sous ses yeux, les lettres s’envolent en pixels violets.',
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0b0614' },
          chars: [{ id: 'etudiant_jaune', pose: 'lire', expr: 'surprise', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          fx: [{ type: 'glitch', n: 14 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.35, 0.12, 0.65, 0.5, 'visage de l’étudiant (chemise jaune)'], [0.3, 0.55, 0.7, 0.9, 'mémoire qui s’efface']],
            free: [[0, 0, 0.3, 0.5, 'fond (haut gauche)']],
            mouths: [[0.5, 0.46]],
          },
          bubbles: [{ type: 'cri', text: 'Mon mémoire ! Tout s’efface !!', x: 0.5, y: 0.12, w: 0.7, who: 0 }],
        },
        {
          action: 'Panique : les étudiants courent vers la sortie, les chaises tombent, des feuilles volent ; lueur violette dans la salle, la pluie sur les fenêtres.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'etudiant', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.25, y: 0.97, fill: 0.55, flip: true, blur: 40 },
            { id: 'etudiante', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.6, y: 0.98, fill: 0.55, flip: true },
          ],
          fx: [{ type: 'vitesse', opacity: 0.4 }, { type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.15, 0.3, 0.85, 0.95, 'étudiants qui fuient, chaises renversées']],
            free: [[0.3, 0, 0.9, 0.2, 'plafond (haut)']],
          },
          bubbles: [{ type: 'cri', text: 'SORTEZ !!', x: 0.6, y: 0.13, w: 0.46, tail: false }],
          sound: 'swipe',
        },
      ],
    },
    // ============================================================ PAGE 6 — L'Oubli
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [
        { h: 0.5, cols: [1], tilt: -24 },
        { h: 0.28, cols: [0.5, 0.5], ctilt: [22] },
        { h: 0.22, cols: [1] },
      ],
      panels: [
        {
          action: 'GRANDE CASE. L’Oubli surgit du bloc de rayonnages centraux, immense : silhouette encapuchonnée, yeux blancs, contour violet ; ses tentacules sont faits de lettres arrachées aux livres. Les étagères se fendent, des livres volent. Salle de lecture baignée de violet.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'oubli', pose: 'cri', shot: 'taille', x: 0.5, y: 0.05, fill: 1.0, seed: 13 }],
          fx: [{ type: 'glitch', n: 30 }, { type: 'vignette', opacity: 0.5 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.3, 0.05, 0.7, 0.75, 'l’Oubli']],
            free: [[0, 0.7, 0.3, 1, 'tables (bas gauche)']],
          },
          sfx: [{ text: 'KRRRAAACK !', x: 0.3, y: 0.84, size: 64, rot: -8, color: VIOLET }],
          sound: 'boss',
        },
        {
          action: 'Un tentacule de lettres balaie une étagère : des dizaines de livres tombent en cascade.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.3 },
          fx: [{ type: 'vitesse', opacity: 0.4 }, { type: 'teinte', color: '#7c3aed', opacity: 0.25 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.2, 0.15, 0.8, 0.85, 'tentacule et livres qui tombent']],
            free: [[0, 0.75, 0.3, 1, 'sol (bas gauche)']],
          },
          sfx: [{ text: 'FRRRAAAS !', x: 0.62, y: 0.84, size: 40, rot: -6, color: VIOLET }],
        },
        {
          action: `Une haute étagère bascule vers Nia ; Kaï l’attrape par le bras et la tire en arrière. ${KAI} ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.6 },
          chars: [
            { id: 'kai', pose: 'main_tendue', expr: 'concentration', shot: 'americain', x: 0.3, y: 0.45, fill: 0.62 },
            { id: 'nia', pose: 'choc', expr: 'surprise', shot: 'americain', x: 0.66, y: 0.47, fill: 0.6, flip: true },
          ],
          fx: [{ type: 'vitesse', opacity: 0.35 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.2, 0.15, 0.4, 0.45, 'visage de Kaï'], [0.55, 0.18, 0.75, 0.48, 'visage de Nia'], [0.38, 0.4, 0.6, 0.6, 'main de Kaï qui tire Nia'], [0.7, 0, 1, 0.8, 'étagère qui bascule']],
            free: [[0, 0, 0.25, 0.25, 'fond (haut gauche)']],
            mouths: [[0.3, 0.38], [0.65, 0.4]],
          },
          bubbles: [{ type: 'cri', text: 'Attention !', x: 0.28, y: 0.15, w: 0.36, who: 0 }],
          sound: 'hit',
        },
        {
          action: `Nia, sauvée de justesse, garde son calme : gros plan, elle regarde l’Oubli (hors champ), analysant ; reflets violets sur son visage. ${NIA}`,
          bg: { id: 'aplat', color: '#3a2a5a', color2: '#120c1e' },
          chars: [{ id: 'nia', pose: 'debout', expr: 'reflexion', shot: 'gros', x: 0.42, y: 0.3, fill: 0.62 }],
          illus: {
            focus: [0.45, 0.45],
            keep: [[0.3, 0.1, 0.56, 0.75, 'visage de Nia']],
            free: [[0.6, 0, 1, 0.6, 'lueur violette (droite)']],
            mouths: [[0.43, 0.55]],
          },
          bubbles: [{ type: 'parole', text: '… Merci.', x: 0.8, y: 0.3, w: 0.24, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 7 — « ANCREZ-VOUS ! »
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [
        { h: 0.28, cols: [0.45, 0.55], ctilt: [20] },
        { h: 0.42, cols: [1], tilt: -24 },
        { h: 0.3, cols: [0.6, 0.4], ctilt: [-18] },
      ],
      panels: [
        {
          action: `Nia monte sur une longue table (un pied sur la chaise, l’autre sur la table) ; lueur violette autour. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.6, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'debout', expr: 'concentration', shot: 'pied', x: 0.5, y: 0.8, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.38, 0.1, 0.62, 0.95, 'Nia qui monte sur la table'], [0.42, 0.1, 0.58, 0.32, 'visage de Nia']],
            free: [[0, 0, 0.35, 0.4, 'étagères (haut gauche)']],
            mouths: [[0.5, 0.26]],
          },
          bubbles: [{ type: 'parole', text: 'Respirez.', x: 0.2, y: 0.14, w: 0.3, who: 0 }],
        },
        {
          action: `Nia, debout sur la table, voix posée, les mains ouvertes ; la salle sombre et violette derrière elle, l’Oubli flou au fond. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.6, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'parle', expr: 'neutre', shot: 'taille', x: 0.55, y: 0.5, fill: 0.68 }],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.4, 0.12, 0.66, 0.5, 'visage de Nia'], [0.35, 0.5, 0.75, 0.85, 'mains ouvertes']],
            free: [[0, 0, 0.35, 0.6, 'salle (gauche)']],
            mouths: [[0.54, 0.42]],
          },
          bubbles: [{ type: 'parole', text: 'L’Oubli, c’est une marée. Il n’emporte que ce qui n’est pas ancré.', x: 0.24, y: 0.32, w: 0.38, who: 0 }],
        },
        {
          action: `GRANDE CASE. Nia, debout sur la table, le bras tendu vers les étudiants restés dans la salle, cheveux soulevés par le souffle de l’Oubli ; contre-plongée, lueur violette derrière elle, lampes vertes. ${NIA}`,
          bg: { id: 'flash', color: '#2a0f3a', lines: '#a78bfa', cx: 0.6, cy: 0.4 },
          chars: [{ id: 'nia', pose: 'pointer', expr: 'concentration', shot: 'americain', x: 0.62, y: 0.4, fill: 0.72, aura: '#e879f9' }],
          fx: [{ type: 'concentration', opacity: 0.4 }],
          illus: {
            focus: [0.55, 0.45],
            keep: [[0.5, 0.1, 0.72, 0.45, 'visage de Nia'], [0.2, 0.25, 0.55, 0.45, 'bras tendu']],
            free: [[0, 0.55, 0.45, 1, 'salle (bas gauche)']],
            mouths: [[0.6, 0.38]],
          },
          bubbles: [{ type: 'cri', text: 'ANCREZ-VOUS ! Récitez vos notes ! À voix haute !', x: 0.24, y: 0.72, w: 0.42, who: 0 }],
          sound: 'sparkle',
        },
        {
          action: 'Les étudiants restés dans la salle (dont l’étudiante en hijab vert) récitent leurs notes à voix haute, cahiers ouverts ; autour d’eux, une bulle de lettres lumineuses blanches protège leurs pages, qui cessent de s’effacer.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'etudiante_hijab', pose: 'lire', expr: 'concentration', shot: 'taille', x: 0.28, y: 0.6, fill: 0.5 },
            { id: 'etudiant', pose: 'lire', expr: 'concentration', shot: 'taille', x: 0.74, y: 0.62, fill: 0.5, flip: true },
          ],
          fx: [{ type: 'lueur', color: '#ffffff', x: 0.5, y: 0.6, size: 0.4 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.18, 0.3, 0.38, 0.6, 'visage de l’étudiante (hijab vert)'], [0.62, 0.3, 0.82, 0.62, 'visage de l’étudiant'], [0.2, 0.6, 0.8, 0.95, 'pages protégées']],
            free: [[0.38, 0, 0.62, 0.3, 'bulle de lettres (haut centre)']],
            mouths: [[0.28, 0.5], [0.73, 0.52]],
          },
          bubbles: [
            { type: 'parole', text: 'La dérivée de x², c’est 2x…', x: 0.27, y: 0.13, w: 0.46, who: 0 },
            { type: 'parole', text: 'Un vecteur a une norme…', x: 0.74, y: 0.27, w: 0.42, who: 1 },
          ],
        },
        {
          action: `Mory, stupéfait, plan buste, regarde la bulle de lettres blanches ; ses lunettes reflètent la lumière. ${MORY_T}`,
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0b0614' },
          chars: [{ id: 'mory', pose: 'debout', expr: 'surprise', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.35, 0.12, 0.65, 0.55, 'visage de Mory']],
            free: [[0, 0.6, 1, 1, 'veste (bas)']],
            mouths: [[0.5, 0.47]],
          },
          bubbles: [{ type: 'parole', text: 'Ça marche… Elle a construit une digue.', x: 0.5, y: 0.13, w: 0.86, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 8 — Le chrono ne marche plus
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [
        { h: 0.3, cols: [1], tilt: 20 },
        { h: 0.36, cols: [0.4, 0.6], ctilt: [-18] },
        { h: 0.34, cols: [0.5, 0.5], ctilt: [18] },
      ],
      panels: [
        {
          action: `Kaï lance le chronomètre de son téléphone (main gauche), les yeux fixés sur l’Oubli ; une vague violette traverse la salle (anneau de lumière), les livres clignotent. ${KAI}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'kai', pose: 'telephone', expr: 'concentration', shot: 'taille', x: 0.28, y: 0.5, fill: 0.7 }],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.25 }],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.18, 0.15, 0.4, 0.5, 'visage de Kaï'], [0.25, 0.55, 0.4, 0.75, 'téléphone'], [0.5, 0.1, 0.9, 0.7, 'l’Oubli et sa vague']],
            free: [[0.6, 0.75, 1, 1, 'sol (bas droite)']],
            mouths: [[0.29, 0.42]],
          },
          sfx: [{ text: 'VMMMM', x: 0.78, y: 0.86, size: 40, rot: -6, color: VIOLET }],
          sound: 'boss',
        },
        {
          action: '[ÉCRAN APPLI] Le chronomètre du téléphone de Kaï, avec trois temps enregistrés : 5,0 s · 4,6 s · 4,1 s.',
          bg: { id: 'ecran', text: 'Tour 1 : 5,0 s\nTour 2 : 4,6 s\nTour 3 : 4,1 s', from: 'CHRONOMÈTRE', clock: '10:00' },
          sound: 'bubble',
        },
        {
          action: `Kaï, frustré, plan buste, serre son téléphone, les dents serrées ; reflets violets. ${KAI}`,
          bg: { id: 'flash', color: '#1a0b2e', lines: '#7c3aed', cx: 0.5, cy: 0.5 },
          chars: [{ id: 'kai', pose: 'telephone', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.36, 0.12, 0.64, 0.55, 'visage de Kaï'], [0.35, 0.65, 0.6, 0.9, 'téléphone']],
            free: [[0.65, 0, 1, 0.6, 'fond (droite)']],
            mouths: [[0.5, 0.46]],
          },
          bubbles: [{ type: 'cri', text: 'Ça marche pas ! C’est plus une suite géométrique !', x: 0.48, y: 0.2, w: 0.7, who: 0 }],
        },
        {
          action: `Mory, sur sa tablette : une courbe qui monte de moins en moins vite ; visage éclairé par l’écran, sérieux. ${MORY_T.replace('trempé, ', '')}`,
          bg: { id: 'aplat', color: '#203048', color2: '#0b1220' },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'reflexion', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.36, 0.12, 0.64, 0.55, 'visage de Mory'], [0.3, 0.62, 0.7, 0.95, 'tablette (courbe)']],
            free: [[0, 0, 0.32, 0.6, 'fond (gauche)']],
            mouths: [[0.5, 0.47]],
          },
          bubbles: [{ type: 'parole', text: 'Il s’est adapté. Son énergie monte… mais de moins en moins vite.', x: 0.5, y: 0.13, w: 0.86, who: 0 }],
        },
        {
          action: `Nia, descendue de sa table, tend la main ouverte vers la tablette de Mory (on voit la tablette en amorce). ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'main_tendue', expr: 'concentration', shot: 'taille', x: 0.56, y: 0.5, fill: 0.68 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.42, 0.12, 0.66, 0.5, 'visage de Nia'], [0.25, 0.5, 0.5, 0.7, 'main tendue vers la tablette']],
            free: [[0.68, 0, 1, 0.5, 'salle (droite)']],
            mouths: [[0.55, 0.42]],
          },
          bubbles: [{ type: 'parole', text: 'Donne.', x: 0.84, y: 0.14, w: 0.24, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 9 — La pente
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [
        { h: 0.24, cols: [1], tilt: -18 },
        { h: 0.38, cols: [1] },
        { h: 0.2, cols: [0.5, 0.5], ctilt: [18] },
        { h: 0.18, cols: [1] },
      ],
      panels: [
        {
          action: `Nia tient la tablette de Mory à deux mains et trace une ligne du doigt sur l’écran ; Mory et Kaï penchés de chaque côté. Lueur violette au loin. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'debout', expr: 'concentration', shot: 'taille', x: 0.18, y: 0.55, fill: 0.6 },
            { id: 'nia', pose: 'telephone', expr: 'concentration', shot: 'taille', x: 0.5, y: 0.52, fill: 0.64 },
            { id: 'mory', pose: 'debout', expr: 'concentration', shot: 'taille', x: 0.82, y: 0.55, fill: 0.6, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.4, 0.15, 0.6, 0.5, 'visage de Nia'], [0.4, 0.55, 0.62, 0.85, 'tablette et doigt'], [0.1, 0.15, 0.28, 0.5, 'visage de Kaï'], [0.72, 0.15, 0.9, 0.5, 'visage de Mory']],
            free: [[0.28, 0, 0.72, 0.12, 'fond (haut)']],
          },
        },
        {
          action: '[DESSIN APPLI] La courbe d’énergie de l’Oubli sur papier quadrillé (croissante, de plus en plus plate) avec trois tangentes : la première très pentue (rouge), la deuxième moins (orange), la troisième horizontale au sommet (verte), marquée « l’étale ».',
          bg: {
            id: 'croquis',
            origin: [0.08, 0.88],
            curve: [[0.08, 0.88], [0.16, 0.743], [0.24, 0.621], [0.32, 0.513], [0.4, 0.419], [0.48, 0.34], [0.56, 0.275], [0.64, 0.225], [0.72, 0.189], [0.8, 0.167], [0.88, 0.16]],
            segs: [
              { a: [0.09, 0.857], b: [0.23, 0.63], color: '#c0392b' },
              { a: [0.3, 0.527], b: [0.5, 0.311], color: '#e67e22' },
              { a: [0.74, 0.16], b: [0.97, 0.16], color: '#1f8a4c' },
            ],
            dots: [[0.16, 0.743, '#c0392b'], [0.4, 0.419, '#e67e22'], [0.88, 0.16, '#1f8a4c']],
          },
          labels: [
            { text: 'l’étale', x: 0.86, y: 0.07, size: 34, style: 'main', color: '#1f8a4c', rot: -3 },
            { text: 'énergie', x: 0.17, y: 0.06, size: 26, style: 'main' },
            { text: 'temps', x: 0.88, y: 0.95, size: 26, style: 'main' },
          ],
          sound: 'sparkle',
        },
        {
          action: `Nia, concentrée, plan buste, le regard sur la tablette, le doigt sur la courbe. ${NIA}`,
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0b0614' },
          chars: [{ id: 'nia', pose: 'telephone', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.36, 0.15, 0.64, 0.6, 'visage de Nia']],
            free: [[0, 0, 0.32, 0.5, 'fond (gauche)']],
            mouths: [[0.5, 0.52]],
          },
          bubbles: [{ type: 'parole', text: 'Regardez la pente. Elle diminue. C’est une marée montante.', x: 0.5, y: 0.22, w: 0.9, who: 0 }],
        },
        {
          action: `Nia, gros plan, le regard qui s’illumine (elle a compris) ; reflets verts des lampes et violets de l’Oubli. ${NIA}`,
          bg: { id: 'flash', color: '#1a0b2e', lines: '#e879f9', cx: 0.5, cy: 0.5 },
          chars: [{ id: 'nia', pose: 'debout', expr: 'joie', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.36, 0.15, 0.64, 0.6, 'visage de Nia']],
            free: [[0.68, 0, 1, 0.5, 'fond (droite)']],
            mouths: [[0.5, 0.52]],
          },
          bubbles: [{ type: 'parole', text: 'Quand la pente sera nulle, c’est l’étale. Il s’arrête au sommet… et il se fige.', x: 0.5, y: 0.22, w: 0.92, who: 0 }],
        },
        {
          action: `Kaï, prêt, gros plan sur ses yeux déterminés, le téléphone dans la main gauche, la main droite bandée serrée. ${KAI}`,
          bg: { id: 'aplat', color: '#3b1f4a', color2: '#1a0e24' },
          chars: [{ id: 'kai', pose: 'debout', expr: 'concentration', shot: 'gros', x: 0.32, y: 0.3, fill: 0.7 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.3, 0.2, 0.7, 0.7, 'visage de Kaï (yeux)']],
            free: [[0.72, 0, 1, 1, 'fond (droite)']],
            mouths: [[0.5, 0.62]],
          },
          bubbles: [{ type: 'parole', text: 'Quand ?', x: 0.76, y: 0.42, w: 0.24, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 10 — Le calcul
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [
        { h: 0.34, cols: [1] },
        { h: 0.33, cols: [0.45, 0.55], ctilt: [20] },
        { h: 0.33, cols: [0.42, 0.58], ctilt: [-20] },
      ],
      panels: [
        {
          action: '[DESSIN APPLI] Le calcul de Nia, comme écrit à la main sur une page de cahier : E(t) = 40t − 2t² ; E′(t) = 40 − 4t ; E′(t) = 0 ⟹ t = 10 (formules KaTeX).',
          bg: { id: 'cahier', lines: [], top: 2 },
          formules: [
            { tex: 'E(t) = 40t - 2t^2', x: 0.48, y: 0.24, size: 0.05, rot: -2, color: '#1d3a8a' },
            { tex: "E'(t) = 40 - 4t", x: 0.46, y: 0.5, size: 0.05, rot: -2, color: '#1d3a8a' },
            { tex: "E'(t) = 0 \\;\\Longrightarrow\\; t = 10", x: 0.52, y: 0.77, size: 0.05, rot: -3, color: '#c0392b' },
          ],
          sound: 'sparkle',
        },
        {
          action: `Nia relève la tête de la tablette, le regard droit, sûre d’elle. ${NIA}`,
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0b0614' },
          chars: [{ id: 'nia', pose: 'debout', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.36, 0.12, 0.64, 0.58, 'visage de Nia']],
            free: [[0, 0, 0.32, 0.5, 'fond (gauche)']],
            mouths: [[0.5, 0.5]],
          },
          bubbles: [{ type: 'parole', text: 'Dans dix secondes.', x: 0.5, y: 0.13, w: 0.7, who: 0 }],
        },
        {
          action: `Mory pointe du doigt la grande table centrale, devant le bloc de rayonnages centraux, où l’Oubli tourbillonne ; lueur violette. ${MORY_T.replace('trempé, ', '')}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.7 },
          chars: [{ id: 'mory', pose: 'pointer', expr: 'concentration', shot: 'americain', x: 0.3, y: 0.42, fill: 0.66 }],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.2, 0.12, 0.42, 0.45, 'visage de Mory'], [0.4, 0.3, 0.62, 0.45, 'bras tendu'], [0.6, 0.4, 0.95, 0.8, 'grande table centrale et l’Oubli']],
            free: [[0.5, 0, 1, 0.25, 'plafond (haut droite)']],
            mouths: [[0.31, 0.38]],
          },
          bubbles: [{ type: 'parole', text: 'Et il se condensera là où il a le plus mangé : la grande table centrale.', x: 0.62, y: 0.14, w: 0.66, who: 0 }],
        },
        {
          action: `Kaï regarde sa main droite bandée (bandage blanc, jointures abîmées), ouverte devant lui ; doute. ${KAI}`,
          chars: [{ id: 'poing', of: 'kai', x: 0.5, y: 0.62, size: 0.6 }],
          bg: { id: 'aplat', color: '#3b1f4a', color2: '#1a0e24' },
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.3, 0.35, 0.75, 0.95, 'main bandée'], [0.35, 0, 0.6, 0.3, 'visage de Kaï (haut)']],
            free: [[0, 0, 0.3, 0.5, 'fond (haut gauche)']],
            mouths: [[0.48, 0.22]],
          },
          bubbles: [{ type: 'pensee', text: 'Avec quoi je frappe ?', x: 0.2, y: 0.16, w: 0.36, tail: false }],
        },
        {
          action: `Nia tend à Kaï son gros dictionnaire à couverture rouge, à deux mains ; Kaï, à gauche de dos en amorce, va le prendre. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'main_tendue', expr: 'neutre', shot: 'taille', x: 0.62, y: 0.5, fill: 0.66, flip: true }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.5, 0.12, 0.72, 0.5, 'visage de Nia'], [0.3, 0.45, 0.6, 0.75, 'dictionnaire rouge']],
            free: [[0, 0, 0.35, 0.4, 'fond (haut gauche)']],
            mouths: [[0.6, 0.42]],
          },
          bubbles: [{ type: 'parole', text: 'Celui-là, je l’ai lu dix fois. Il ne peut pas l’effacer.', x: 0.24, y: 0.2, w: 0.44, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 11 — Dix
    {
      gutter: 'noir',
      ambient: 'pluie',
      rows: [
        { h: 0.26, cols: [0.5, 0.5], ctilt: [22] },
        { h: 0.24, cols: [1], tilt: -20 },
        { h: 0.32, cols: [1], tilt: 20 },
        { h: 0.18, cols: [1] },
      ],
      panels: [
        {
          action: `Kaï court sur les longues tables, le gros dictionnaire rouge sous le bras ; livres et feuilles volent autour. ${KAI}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'course', expr: 'concentration', shot: 'pied', x: 0.5, y: 0.95, fill: 0.7 }],
          fx: [{ type: 'vitesse', opacity: 0.45 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.3, 0.1, 0.7, 0.95, 'Kaï qui court sur les tables'], [0.42, 0.12, 0.58, 0.32, 'visage de Kaï']],
            free: [[0, 0, 0.3, 0.4, 'fond (haut gauche)']],
            mouths: [[0.5, 0.26]],
          },
          bubbles: [{ type: 'parole', text: 'Six…', x: 0.16, y: 0.14, w: 0.22, who: 0 }],
          sound: 'swipe',
        },
        {
          action: `Kaï saute d’une table à l’autre, le dictionnaire serré contre lui ; un tentacule de lettres passe sous lui. ${KAI}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'saut', expr: 'concentration', shot: 'pied', x: 0.5, y: 0.8, fill: 0.7 }],
          fx: [{ type: 'vitesse', opacity: 0.45 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.3, 0.05, 0.7, 0.75, 'Kaï en plein saut'], [0.42, 0.08, 0.58, 0.3, 'visage de Kaï'], [0.2, 0.7, 0.8, 0.95, 'tentacule sous lui']],
            free: [[0.7, 0, 1, 0.4, 'fond (haut droite)']],
            mouths: [[0.5, 0.24]],
          },
          bubbles: [{ type: 'parole', text: 'Huit… neuf…', x: 0.84, y: 0.15, w: 0.28, who: 0 }],
        },
        {
          action: 'Le noyau de verre violet de l’Oubli, solide et lourd, tombe lourdement sur la grande table centrale : le bois se fend, éclats et poussière.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          fx: [{ type: 'impact', x: 0.5, y: 0.6 }, { type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.3, 0.15, 0.7, 0.85, 'noyau qui tombe sur la table qui se fend']],
            free: [[0, 0, 0.28, 0.5, 'rayonnages (gauche)']],
          },
          sfx: [{ text: 'BOUM !', x: 0.82, y: 0.2, size: 56, rot: -8, color: '#ffd23f' }],
          sound: 'hit',
        },
        {
          action: `PLEINE LARGEUR, MOMENT FORT. Kaï frappe le noyau de verre violet avec le gros dictionnaire rouge tenu à deux mains, comme une batte : impact, le verre se fissure dans tous les sens, éclat blanc. ${KAI}`,
          bg: { id: 'flash', color: '#1a0b2e', lines: '#8b5cf6', cx: 0.6, cy: 0.5 },
          chars: [{ id: 'kai', pose: 'coup_de_poing', expr: 'concentration', shot: 'americain', x: 0.36, y: 0.42, fill: 0.72, aura: '#a78bfa' }],
          fx: [{ type: 'impact', x: 0.66, y: 0.5 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.15, 0.15, 0.32, 0.45, 'visage de Kaï'], [0.3, 0.3, 0.6, 0.6, 'dictionnaire tenu comme une batte'], [0.58, 0.25, 0.82, 0.75, 'noyau qui se fissure']],
            free: [[0, 0, 0.3, 0.15, 'fond (haut gauche)']],
            mouths: [[0.22, 0.38]],
          },
          bubbles: [{ type: 'cri', text: 'DIX !!!', x: 0.14, y: 0.13, w: 0.24, size: 30, who: 0 }],
          sfx: [{ text: 'KRAAAK !', x: 0.76, y: 0.86, size: 56, rot: -8, color: VIOLET }],
          sound: 'hit',
        },
        {
          action: 'Le noyau éclate en milliers de pixels violets ; les lettres repartent en essaim vers les livres et les rayonnages, qui se remplissent ; les lampes vertes se rallument.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          fx: [{ type: 'glitch', n: 24 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.3, 0.1, 0.7, 0.9, 'noyau qui éclate, lettres qui repartent']],
            free: [[0.72, 0.3, 1, 0.8, 'rayonnages (droite)']],
          },
          sfx: [{ text: 'SHHHRRRAAA', x: 0.76, y: 0.6, size: 30, rot: -6, color: VIOLET }],
          sound: 'sparkle',
        },
      ],
    },
    // ============================================================ PAGE 12 — Le pacte
    {
      gutter: 'blanc',
      ambient: 'pluie',
      rows: [
        { h: 0.26, cols: [1], tilt: 18 },
        { h: 0.26, cols: [0.5, 0.5], ctilt: [-18] },
        { h: 0.3, cols: [0.5, 0.5], ctilt: [18] },
        { h: 0.18, cols: [1] },
      ],
      panels: [
        {
          action: 'Les lettres reviennent sur les pages des livres ; l’étudiant en chemise jaune serre contre lui son mémoire redevenu complet, soulagé, les yeux humides. Salle de lecture en désordre, lampes vertes rallumées, lumière grise de la pluie.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'etudiant_jaune', pose: 'lire', expr: 'joie', shot: 'taille', x: 0.6, y: 0.5, fill: 0.64 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.48, 0.12, 0.7, 0.5, 'visage de l’étudiant (chemise jaune)'], [0.45, 0.5, 0.75, 0.85, 'mémoire serré contre lui']],
            free: [[0, 0, 0.4, 0.5, 'salle (gauche)']],
            mouths: [[0.59, 0.42]],
          },
          bubbles: [{ type: 'parole', text: 'Il est revenu ! Tout !', x: 0.24, y: 0.2, w: 0.36, who: 0 }],
        },
        {
          action: `Nia, assise sur le bord d’une table, le regard baissé, le stylo entre les doigts ; salle calme, feuilles au sol. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'assis_bureau', expr: 'reflexion', shot: 'taille', x: 0.5, y: 0.6, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.38, 0.15, 0.62, 0.55, 'visage de Nia']],
            free: [[0, 0, 0.35, 0.4, 'fond (haut gauche)']],
            mouths: [[0.5, 0.47]],
          },
          bubbles: [{ type: 'parole', text: 'On m’a toujours dit que je compliquais tout.', x: 0.5, y: 0.13, w: 0.86, who: 0 }],
        },
        {
          action: `Kaï et Mory, debout face à Nia (vue de dos en amorce, assise) : Kaï sincère, Mory un léger sourire. ${KAI} ${MORY_T.replace('trempé, ', '').replace(' ; il protège sa petite antenne portable sous sa veste', '')}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'debout', expr: 'joie', shot: 'taille', x: 0.3, y: 0.55, fill: 0.6 },
            { id: 'mory', pose: 'debout', expr: 'clin', shot: 'taille', x: 0.72, y: 0.56, fill: 0.6, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.2, 0.15, 0.4, 0.5, 'visage de Kaï'], [0.6, 0.15, 0.8, 0.5, 'visage de Mory']],
            free: [[0.4, 0, 0.6, 0.35, 'entre les deux (haut)']],
            mouths: [[0.3, 0.42], [0.7, 0.43]],
          },
          bubbles: [
            { type: 'parole', text: 'Toi ? Tu rends les choses simples.', x: 0.25, y: 0.13, w: 0.46, who: 0 },
            { type: 'parole', text: 'Rejoins-nous.', x: 0.78, y: 0.2, w: 0.36, who: 1 },
          ],
        },
        {
          action: `Nia sourit enfin, un peu, en coin, le regard relevé vers eux. ${NIA}`,
          bg: { id: 'aplat', color: '#f3e8d0', color2: '#c9b48a' },
          chars: [{ id: 'nia', pose: 'debout', expr: 'clin', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.36, 0.15, 0.64, 0.58, 'visage de Nia']],
            free: [[0, 0.6, 1, 1, 'bas de l’image']],
            mouths: [[0.5, 0.5]],
          },
          bubbles: [{ type: 'parole', text: 'D’accord. À une condition : c’est moi qui écris les résumés.', x: 0.5, y: 0.14, w: 0.88, who: 0 }],
        },
        {
          action: '[ÉCRAN APPLI] Le téléphone de Kaï s’allume : message du Créateur « 3 sur 8. ».',
          bg: { id: 'ecran', text: '3 sur 8.', from: 'LE CRÉATEUR', clock: '10:01' },
          sound: 'bubble',
        },
        {
          action: 'Le lendemain, à l’aube (5 h 40), sur la corniche de Conakry (même décor qu’au chapitre 1 : mer, pirogues, rambarde, palmiers, lampadaires encore allumés) : un éclair vert acide fend le paysage, une silhouette qui court à toute vitesse (on ne voit pas son visage), traînée de lumière verte. Aube bleue et rose.',
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          fx: [{ type: 'vitesse', opacity: 0.5 }, { type: 'lueur', color: '#a3e635', x: 0.55, y: 0.6, size: 0.25 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.35, 0.35, 0.75, 0.9, 'éclair vert et silhouette qui court']],
            free: [[0, 0, 0.35, 0.35, 'ciel de l’aube (haut gauche)']],
          },
          captions: [
            { text: 'Le lendemain. 5 h 40. La corniche.', x: 0.03, y: 0.06, w: 0.46, style: 'noir' },
            { text: 'À suivre…', x: 0.03, y: 0.82, style: 'noir', right: true },
          ],
          sound: 'swipe',
        },
      ],
    },
  ],
};
