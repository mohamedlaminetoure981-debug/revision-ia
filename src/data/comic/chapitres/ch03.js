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
// Illustrations : public/story/chapitre-3/page-P-case-C.png ou .jpg (16:9, 53 images ;
// 5 cases dessinées par l'appli). Chaque `action` décrit ce qui est réellement dessiné ;
// repères `illus` (focus, keep, free, mouths) recalés sur chaque image
// (npm run verifier-bulles -- 3 : aucun problème ; contrôle visuel page par page).
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
          action: 'Plan large. Le campus de l’Université de Conakry sous une pluie battante (9 h 40, ciel gris, flaques, palmiers couchés par le vent) : bâtiments beiges à deux étages au fond et à droite, galerie couverte à droite. À gauche, trois étudiants traversent la cour en courant de gauche à droite (l’un avec son sac sur la tête, un autre avec un cahier, le troisième avec sa veste sur la tête) ; à droite, un groupe s’abrite serré sous la galerie. Bande gris foncé unie en haut de l’image (place du cartouche).',
          bg: { id: 'rue', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'etudiant', pose: 'course', shot: 'pied', x: 0.28, y: 0.96, fill: 0.4 },
            { id: 'etudiante', pose: 'course', shot: 'pied', x: 0.72, y: 0.97, fill: 0.42, flip: true },
          ],
          fx: [{ type: 'pluie' }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.07, 0.48, 0.42, 0.8, 'étudiants qui courent sous la pluie'], [0.7, 0.5, 0.95, 0.8, 'étudiants abrités sous la galerie']],
            free: [[0, 0, 1, 0.2, 'bande gris foncé (haut)']],
          },
          captions: [{ text: 'Le lendemain. 9 h 40. Il pleut sur Conakry.', x: 0.03, y: 0.05, w: 0.5, style: 'noir' }],
          sound: 'swipe',
        },
        {
          action: `Kaï (à gauche) et Mory (à droite) courent côte à côte vers nous dans la cour du campus, sous la pluie, trempés, les pieds dans les flaques. Kaï tourne la tête vers Mory, l’air sceptique, et lève sa main bandée ; Mory regarde droit devant, les deux mains serrées sur sa poitrine où il protège l’antenne sous sa veste. Au fond : palmiers, bâtiments, étudiants abrités sous la galerie à droite. Campus, 9 h 41. ${KAI_T} ${MORY_T}`,
          bg: { id: 'rue', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'course', expr: 'concentration', shot: 'americain', x: 0.3, y: 0.42, fill: 0.62 },
            { id: 'mory', pose: 'course', expr: 'concentration', shot: 'americain', x: 0.72, y: 0.44, fill: 0.62 },
          ],
          fx: [{ type: 'pluie' }, { type: 'vitesse', opacity: 0.35 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.37, 0.17, 0.47, 0.36, 'visage de Kaï'], [0.55, 0.16, 0.65, 0.34, 'visage de Mory'], [0.55, 0.34, 0.67, 0.46, 'mains sur l’antenne sous la veste']],
            free: [[0.23, 0, 0.38, 0.3, 'ciel de pluie (gauche)'], [0.68, 0.1, 0.87, 0.3, 'toit et ciel (droite)']],
            mouths: [[0.425, 0.31], [0.6, 0.3]],
          },
          bubbles: [
            { type: 'parole', text: 'T’es sûr de ton coup ?', x: 0.15, y: 0.1, w: 0.28, who: 0 },
            { type: 'parole', text: 'Mon antenne se trompe jamais.', x: 0.83, y: 0.3, w: 0.28, who: 1 },
          ],
        },
        {
          action: `Devant le grand escalier à colonnes de la bibliothèque universitaire, sous la pluie. À gauche, Kaï, la main droite bandée contre la joue, regarde l’antenne de côté, perplexe. À droite, Mory tient sa petite antenne portable levée dans sa main droite (de petites ondes en sortent) et regarde Kaï. ${MORY_T} ${KAI_T}`,
          bg: { id: 'rue', time: 'pluie', horizon: 0.55, vp: 0.6 },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'concentration', shot: 'taille', x: 0.5, y: 0.5, fill: 0.7 }],
          fx: [{ type: 'pluie' }, { type: 'lueur', color: '#22d3ee', x: 0.62, y: 0.6, size: 0.25 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.3, 0.2, 0.42, 0.42, 'visage de Kaï'], [0.57, 0.24, 0.69, 0.47, 'visage de Mory'], [0.44, 0.35, 0.53, 0.6, 'antenne qui émet']],
            free: [[0.42, 0, 0.56, 0.3, 'porte et colonnes (haut centre)']],
            mouths: [[0.62, 0.45]],
          },
          bubbles: [{ type: 'parole', text: '10 heures. Ici.', x: 0.47, y: 0.1, w: 0.3, who: 0 }],
          sound: 'bubble',
        },
        {
          action: 'Contre-plongée sur la façade de la bibliothèque universitaire sous la pluie : bâtiment beige à fronton et grandes colonnes, grand escalier où ruisselle l’eau, porte vitrée éclairée au centre. Au premier plan en bas, Kaï (à gauche, capuche violette, casque autour du cou, sac gris) et Mory (à droite, afro, veste à lignes cyan) de dos, coupés aux épaules, regardent la porte.',
          bg: { id: 'classe', time: 'pluie', horizon: 0.7, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'dos', shot: 'pied', x: 0.4, y: 0.98, fill: 0.36 },
            { id: 'mory', pose: 'dos', shot: 'pied', x: 0.6, y: 0.98, fill: 0.36 },
          ],
          fx: [{ type: 'pluie' }],
          illus: {
            focus: [0.5, 0.7],
            keep: [[0.44, 0.4, 0.56, 0.62, 'porte vitrée éclairée'], [0.3, 0.58, 0.44, 1, 'tête de Kaï (de dos)'], [0.56, 0.62, 0.71, 1, 'tête de Mory (de dos)']],
            free: [[0, 0.14, 0.26, 0.5, 'ciel et aile gauche'], [0.74, 0.14, 1, 0.5, 'ciel et aile droite']],
            mouths: [[0.4, 0.66], [0.6, 0.7]],
          },
          bubbles: [
            { type: 'parole', text: 'Une bibliothèque…', x: 0.15, y: 0.24, w: 0.24, who: 0 },
            { type: 'parole', text: 'Là où on garde les livres.', x: 0.85, y: 0.3, w: 0.26, who: 1 },
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
          action: `Plan large de la grande salle de lecture, vue depuis l’entrée, silencieuse (9 h 52). Au premier plan, Kaï (à gauche, main droite bandée qui dégouline) et Mory (à droite), trempés, de dos, coupés à la taille, s’arrêtent sur le seuil. Grandes fenêtres et pluie à GAUCHE, hauts rayonnages à DROITE, ventilateurs au plafond ; l’horloge ronde est sur le mur du fond, au-dessus des rayonnages centraux. Au fond à gauche, le long des fenêtres, un groupe d’étudiants serrés autour d’une table ; au centre, longues tables vides aux lampes vertes. ${SALLE} ${KAI_T} ${MORY_T}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.45, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'debout', shot: 'pied', x: 0.16, y: 0.97, fill: 0.5 },
            { id: 'mory', pose: 'debout', shot: 'pied', x: 0.28, y: 0.97, fill: 0.5 },
          ],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.13, 0.32, 0.42, 0.84, 'Kaï de dos'], [0.56, 0.33, 0.78, 0.84, 'Mory de dos'], [0.27, 0.46, 0.42, 0.72, 'groupe autour de Nia (fond)'], [0.47, 0.24, 0.54, 0.34, 'horloge']],
            free: [[0.6, 0.06, 1, 0.24, 'plafond et ventilateurs (droite)']],
          },
          captions: [{ text: '9 h 52. Bibliothèque universitaire.', x: 0.56, y: 0.04, w: 0.42, style: 'noir' }],
        },
        {
          action: `La longue table de Nia, vue depuis l’autre bout : Nia est assise au bout, côté fond de la salle, face à nous (face à l’entrée), et parle en ouvrant les mains ; une feuille et un stylo devant elle. Huit étudiants l’écoutent, quatre de chaque côté, tournés vers elle (dont une étudiante au hijab vert à gauche). Deux lampes de lecture vertes ; au premier plan à droite, son gros dictionnaire rouge. Fenêtres et pluie à gauche, rayonnages à droite et au fond, ventilateurs au plafond. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'etudiant', pose: 'assis_bureau', shot: 'taille', x: 0.18, y: 0.62, fill: 0.5 },
            { id: 'nia', pose: 'parle', expr: 'neutre', shot: 'taille', x: 0.52, y: 0.56, fill: 0.62 },
            { id: 'etudiante', pose: 'assis_bureau', shot: 'taille', x: 0.84, y: 0.62, fill: 0.5, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.46, 0.37, 0.54, 0.53, 'visage de Nia'], [0.41, 0.53, 0.6, 0.66, 'mains de Nia'], [0.24, 0.42, 0.37, 0.56, 'visages des étudiants (gauche)'], [0.63, 0.4, 0.77, 0.55, 'visages des étudiants (droite)'], [0.54, 0.72, 0.7, 0.89, 'dictionnaire rouge']],
            free: [[0.3, 0, 0.7, 0.3, 'plafond et ventilateurs']],
            mouths: [null, [0.5, 0.5]],
          },
          bubbles: [{ type: 'parole', text: 'Imaginez une pirogue.', x: 0.5, y: 0.17, w: 0.5, who: 1 }],
        },
        {
          action: `Nia, assise au bout de la table, face à nous, plan taille : elle sourit et explique avec les mains (la main droite à plat devant sa poitrine, la gauche ouverte), une feuille, un stylo et son dictionnaire rouge sur la table. Au premier plan, deux étudiants de dos, flous, l’encadrent (chemise jaune à gauche, veste en jean à droite). Fenêtres et pluie à gauche, rayonnages à droite. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.4 },
          chars: [{ id: 'nia', pose: 'parle', expr: 'joie', shot: 'taille', x: 0.62, y: 0.5, fill: 0.74 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.44, 0.26, 0.56, 0.49, 'visage de Nia'], [0.43, 0.54, 0.66, 0.72, 'mains qui expliquent']],
            free: [[0.25, 0, 0.75, 0.24, 'plafond et ventilateurs']],
            mouths: [[0.5, 0.46]],
          },
          bubbles: [{ type: 'parole', text: 'Entre Kaloum et les îles de Loos, elle met une heure. Sa vitesse moyenne, c’est la distance divisée par le temps. Facile.', x: 0.5, y: 0.12, w: 0.88, size: 15, who: 0 }],
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
          action: `Gros plan sur Nia, de face, l’index de la main droite levé à côté du visage, le regard vif, un petit sourire sûr d’elle ; tresses à perles, créoles. Derrière elle : fenêtres et pluie à gauche, tables aux lampes vertes, rayonnages à droite. ${NIA}`,
          bg: { id: 'aplat', color: '#f3e8d0', color2: '#c9b48a' },
          chars: [{ id: 'nia', pose: 'pointer', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.44, fill: 0.56 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.39, 0.15, 0.61, 0.64, 'visage de Nia'], [0.27, 0.45, 0.4, 0.9, 'index levé']],
            free: [[0.4, 0.7, 0.72, 1, 'cou et gilet (bas)']],
            mouths: [[0.5, 0.58]],
          },
          bubbles: [{ type: 'parole', text: 'Mais la dérivée, c’est la vitesse à UN instant précis. Pas sur tout le trajet. MAINTENANT.', x: 0.64, y: 0.84, w: 0.72, who: 0 }],
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
          action: 'La table de Nia, même cadrage que page 2 case 2 : l’étudiante au hijab vert (côté gauche de la table) se dresse d’un coup, un genou sur sa chaise, les deux poings levés, ravie, la bouche grande ouverte. Nia, assise au bout côté fond, face à nous, et les autres étudiants la regardent, surpris. La bibliothécaire est HORS CHAMP : son « Chuuut ! » vient de l’extérieur de la case (côté entrée, derrière nous). Fenêtres et pluie à gauche, rayonnages à droite, ventilateurs au plafond.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.7 },
          chars: [
            { id: 'etudiante_hijab', pose: 'victoire', expr: 'joie', shot: 'americain', x: 0.3, y: 0.44, fill: 0.66 },
            { id: 'bibliothecaire', pose: 'bras_croises', expr: 'neutre', shot: 'taille', x: 0.82, y: 0.5, fill: 0.46, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.29, 0.31, 0.38, 0.47, 'visage de l’étudiante (hijab vert)'], [0.26, 0.24, 0.43, 0.32, 'poings levés'], [0.46, 0.39, 0.53, 0.54, 'visage de Nia'], [0.04, 0.35, 0.24, 0.55, 'visages des étudiants (gauche)'], [0.63, 0.4, 0.9, 0.56, 'visages des étudiants (droite)']],
            free: [[0.45, 0.08, 0.95, 0.35, 'plafond, ventilateurs et rayonnages (haut droite)']],
            mouths: [[0.33, 0.43]],
          },
          bubbles: [
            { type: 'cri', text: 'J’ai enfin compris !!', x: 0.62, y: 0.2, w: 0.3, size: 26, who: 0 },
            { type: 'murmure', text: 'Chuuut !', x: 0.915, y: 0.1, w: 0.16, size: 24, tail: [1.04, 0.28] },
          ],
        },
        {
          action: `Près de l’entrée de la salle de lecture. À gauche, Kaï (main droite bandée posée sur la poitrine) regarde Mory, un léger sourire. À droite, Mory, de profil tourné vers Kaï, met une main en cornet devant sa bouche pour chuchoter ; de l’autre main il tient sa petite antenne, qui émet des ondes. Au fond : l’horloge sur le mur du fond, au-dessus des rayonnages centraux ; fenêtres et pluie à gauche (des étudiants travaillent aux tables), rayonnages à droite. ${MORY_T} ${KAI_T}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.3 },
          chars: [
            { id: 'mory', pose: 'telephone', expr: 'surprise', shot: 'taille', x: 0.36, y: 0.5, fill: 0.68 },
            { id: 'kai', pose: 'debout', expr: 'neutre', shot: 'taille', x: 0.8, y: 0.55, fill: 0.6, flip: true },
          ],
          fx: [{ type: 'lueur', color: '#22d3ee', x: 0.55, y: 0.62, size: 0.2 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.3, 0.28, 0.4, 0.53, 'visage de Kaï'], [0.55, 0.3, 0.68, 0.6, 'visage de Mory'], [0.47, 0.45, 0.55, 0.72, 'antenne qui émet']],
            free: [[0.2, 0, 0.55, 0.25, 'plafond (haut gauche)']],
            mouths: [[0.6, 0.54], [0.35, 0.47]],
          },
          sfx: [{ text: 'bip bip bip', x: 0.47, y: 0.9, size: 30, rot: -6, color: '#22d3ee' }],
          bubbles: [{ type: 'murmure', text: 'Attends… quand elle parle, mon antenne s’affole.', x: 0.33, y: 0.12, w: 0.6, who: 0 }],
          sound: 'bubble',
        },
        {
          action: `Kaï (à gauche) et Mory (à droite), épaule contre épaule, penchés sur la tablette noire que Mory tient à deux mains : une courbe lumineuse en forme de pouls s’y dessine. Kaï la désigne de sa main droite bandée ; tous deux sérieux, les yeux sur l’écran. Fond flou : salle de lecture, fenêtres à gauche, horloge et rayonnages derrière eux. ${MORY_T} ${KAI_T}`,
          bg: { id: 'aplat', color: '#203048', color2: '#0b1220' },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.33, 0.22, 0.45, 0.5, 'visage de Kaï'], [0.53, 0.22, 0.67, 0.52, 'visage de Mory'], [0.32, 0.62, 0.66, 0.88, 'tablette et main bandée']],
            free: [[0.66, 0, 0.75, 0.6, 'rayonnages (droite)']],
            mouths: [[0.58, 0.47]],
          },
          bubbles: [{ type: 'murmure', text: 'Quand elle explique, le savoir s’ancre. L’Oubli peut plus y toucher.', x: 0.5, y: 0.1, w: 0.98, size: 13, who: 0 }],
        },
        {
          action: `Gros plan de Kaï, de trois quarts, tourné vers la gauche : il regarde Nia (hors champ), impressionné, un léger sourire ; ses cheveux et son visage gouttent encore, capuche violette mouillée, casque autour du cou. Fond flou : fenêtres et lampe verte à gauche, rayonnages à droite. ${KAI_T}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.8 },
          chars: [{ id: 'kai', pose: 'debout', expr: 'joie', shot: 'buste', x: 0.56, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.44, 0.2, 0.7, 0.8, 'visage de Kaï']],
            free: [[0.19, 0, 0.43, 0.45, 'fenêtre et plafond (gauche)']],
            mouths: [[0.48, 0.64]],
          },
          bubbles: [{ type: 'pensee', text: 'C’est la seule qui explique vraiment bien.', x: 0.22, y: 0.2, w: 0.38, who: 0 }],
        },
        {
          action: `Nia, assise à sa table, de face, le stylo posé sur sa feuille, lève les yeux vers nous avec un petit sourire ; son dictionnaire rouge à droite sur la table, une lampe verte derrière elle à gauche. Au fond à droite, dans l’encadrement d’une porte, deux garçons trempés (t-shirts blancs mouillés) la regardent, l’air hébété. Fenêtre et pluie à gauche, rayonnages derrière elle. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'lire', expr: 'surprise', shot: 'buste', x: 0.6, y: 0.44, fill: 0.58 }],
          illus: {
            focus: [0.62, 0.5],
            keep: [[0.43, 0.12, 0.57, 0.46, 'visage de Nia'], [0.76, 0.38, 0.88, 0.82, 'les deux garçons trempés à la porte'], [0.4, 0.68, 0.52, 0.92, 'main qui écrit']],
            free: [[0.6, 0, 0.75, 0.3, 'rayonnages (haut droite)']],
            mouths: [[0.5, 0.42]],
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
          action: `Composition en miroir. À GAUCHE, Mory (tout à gauche) et Kaï (devant lui), trempés, de profil tournés vers la droite, dégoulinent ; une flaque sous Kaï, main droite bandée le long du corps. À DROITE, Nia, sèche, debout près de sa table, bras croisés, les toise en coin, un sourcil levé. Sur la table à droite : son dictionnaire rouge, une feuille et un stylo, une lampe verte. Au fond, flous : rayonnages et deux étudiants à une table (hijab vert, t-shirt jaune). ${NIA} ${KAI_T} ${MORY_T}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'debout', expr: 'surprise', shot: 'americain', x: 0.18, y: 0.46, fill: 0.62 },
            { id: 'mory', pose: 'debout', expr: 'neutre', shot: 'americain', x: 0.38, y: 0.47, fill: 0.6 },
            { id: 'nia', pose: 'bras_croises', expr: 'clin', shot: 'americain', x: 0.78, y: 0.45, fill: 0.64, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.32, 0.05, 0.43, 0.33, 'visage de Kaï'], [0.11, 0.06, 0.25, 0.33, 'visage de Mory'], [0.66, 0.09, 0.78, 0.33, 'visage de Nia'], [0.78, 0.7, 0.98, 0.9, 'dictionnaire rouge']],
            free: [[0.44, 0.05, 0.64, 0.35, 'ventilateur et rayonnages (entre eux)']],
            mouths: [[0.41, 0.27], [0.22, 0.29], [0.71, 0.26]],
          },
          bubbles: [{ type: 'parole', text: 'Vous voulez un cours… ou une serviette ?', x: 0.535, y: 0.42, w: 0.24, size: 24, who: 2 }],
        },
        {
          action: `Kaï (à gauche), gêné, sourire forcé, se gratte l’arrière de la tête de sa main droite bandée, les yeux vers Mory ; une flaque d’eau à ses pieds, gouttes qui tombent de son sweat. À droite, Mory, trempé, remonte ses lunettes du doigt, l’air blasé. Fond flou : rayonnages, fenêtre. ${KAI_T} ${MORY_T}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'decontracte', expr: 'surprise', shot: 'americain', x: 0.5, y: 0.42, fill: 0.7 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.3, 0.1, 0.42, 0.38, 'visage de Kaï'], [0.6, 0.08, 0.72, 0.36, 'visage de Mory']],
            free: [[0.43, 0.05, 0.58, 0.45, 'fond entre eux']],
            mouths: [[0.38, 0.3]],
          },
          bubbles: [{ type: 'parole', text: 'On… on cherche quelqu’un.', x: 0.52, y: 0.5, w: 0.36, who: 0 }],
        },
        {
          action: `Nia, plan taille, bras croisés, tournée de trois quarts, impassible : elle ne les regarde que du coin de l’œil (vers la gauche), les lèvres pincées. À droite, sa table avec le dictionnaire rouge, une feuille, un stylo et la lampe verte. Fond flou : rayonnages, fenêtre à gauche. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.6 },
          chars: [{ id: 'nia', pose: 'lire', expr: 'neutre', shot: 'buste', x: 0.6, y: 0.48, fill: 0.62 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.53, 0.12, 0.67, 0.45, 'visage de Nia'], [0.42, 0.68, 0.72, 0.95, 'bras croisés']],
            free: [[0.26, 0.05, 0.5, 0.6, 'rayonnages flous (gauche)']],
            mouths: [[0.59, 0.4]],
          },
          bubbles: [{ type: 'parole', text: 'Ici, on cherche des livres. Les gens, c’est dehors.', x: 0.24, y: 0.3, w: 0.42, who: 0 }],
        },
        {
          action: `Vue subjective de Mory : sa main (manche marine à lignes cyan) entre par le bas à gauche et brandit la petite antenne, qui émet de grandes ondes blanches. En face, sur le mur du fond, l’horloge ronde au-dessus des rayonnages centraux (aiguilles presque verticales). Ventilateurs au plafond, hauts rayonnages sur les côtés, lampes vertes qui grésillent (étincelles rouges sur l’une d’elles), fenêtres hautes en haut à droite. ${MORY_T}`,
          bg: { id: 'aplat', color: '#e7d9b8', color2: '#9a8a6a' },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'concentration', shot: 'buste', x: 0.72, y: 0.44, fill: 0.62 }],
          fx: [{ type: 'concentration', opacity: 0.35 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.45, 0.2, 0.55, 0.34, 'horloge'], [0.4, 0.35, 0.6, 0.85, 'antenne qui s’affole et main de Mory']],
            free: [[0.05, 0.05, 0.3, 0.4, 'rayonnages (haut gauche)'], [0.6, 0.35, 0.8, 0.6, 'rayonnages (droite)']],
          },
          sfx: [{ text: 'BIP BIP BIP !', x: 0.8, y: 0.56, size: 40, rot: -8, color: '#22d3ee' }],
          bubbles: [{ type: 'murmure', text: 'Il est là.', x: 0.17, y: 0.3, w: 0.22, tail: [0.14, 0.98] }],
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
          action: 'La salle de lecture s’assombrit (10 h 00) : les lampes de lecture virent au violet et grésillent ; au premier plan à gauche, une lampe crache de petits éclairs violets sur une table couverte de livres ouverts, d’un cahier, d’un téléphone. Fenêtres et pluie à gauche, rayonnages à droite (quelques étudiants assis, de dos), horloge sur le mur du fond au-dessus des rayonnages centraux.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          fx: [{ type: 'glitch', n: 16 }, { type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          illus: {
            focus: [0.42, 0.45],
            keep: [[0.09, 0.55, 0.24, 0.9, 'lampe qui crache des éclairs'], [0.22, 0.5, 0.56, 0.62, 'rangée de lampes violettes'], [0.47, 0.24, 0.53, 0.33, 'horloge']],
            free: [[0.54, 0.05, 0.84, 0.45, 'plafond et mur du fond (droite)']],
          },
          sfx: [{ text: 'bzzt… bzzt', x: 0.66, y: 0.17, size: 34, rot: -4, color: VIOLET }],
          sound: 'boss',
        },
        {
          action: '[ILLUSTRATION] Gros plan sur un gros livre ouvert sur une table : au milieu, les lettres noires se détachent des pages et s’envolent en spirale vers le haut à droite, en se changeant en pixels violets ; les pages se vident. Fond flou : lampe violette à gauche devant la fenêtre, horloge et rayonnages au fond. (En attendant l’image, l’appli dessine une page de cahier qui s’efface.)',
          bg: { id: 'cahier', lines: ['Chapitre 4 : les dérivées', 'f′(a) = lim (f(a+h) − f(a)) / h', 'pente de la tangente'], fade: true, keep: [] },
          fx: [{ type: 'glitch', n: 22 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.4, 0.45, 0.66, 0.75, 'lettres qui quittent la page'], [0.5, 0.06, 0.78, 0.5, 'spirale de pixels']],
            free: [[0.16, 0, 0.45, 0.3, 'plafond flou (haut gauche)']],
          },
          sfx: [{ text: 'VMMMM', x: 0.25, y: 0.16, size: 36, rot: -8, color: VIOLET }],
        },
        {
          action: 'La salle de lecture vue dans l’allée : un essaim de lettres noires, comme une nuée d’oiseaux, traverse la salle depuis les fenêtres (à gauche) et les rayonnages (à droite, traînées violettes) et converge vers le fond, où un tourbillon d’ombre violette se forme devant les rayonnages centraux, sous l’horloge. Au premier plan, des livres aux dos devenus vides ; au fond à droite, deux silhouettes figées près du tourbillon ; une échelle contre les rayonnages.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.75 },
          fx: [{ type: 'glitch', n: 30 }, { type: 'teinte', color: '#7c3aed', opacity: 0.25 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.25, 0.12, 0.7, 0.75, 'essaim de lettres et tourbillon'], [0.6, 0.53, 0.7, 0.75, 'deux silhouettes']],
            free: [[0.02, 0.62, 0.3, 0.9, 'tables (bas gauche)']],
          },
        },
        {
          action: 'Un étudiant en t-shirt jaune, assis à une table, tient à deux mains son mémoire à spirale ouvert, horrifié, la bouche ouverte : en haut à droite, les lignes du texte s’envolent de la page en pixels violets. Lampe verte au premier plan à gauche ; fenêtres à gauche, rayonnages à droite.',
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0b0614' },
          chars: [{ id: 'etudiant_jaune', pose: 'lire', expr: 'surprise', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          fx: [{ type: 'glitch', n: 14 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.43, 0.2, 0.56, 0.46, 'visage de l’étudiant (chemise jaune)'], [0.4, 0.43, 0.73, 0.85, 'mémoire qui s’efface']],
            free: [[0.3, 0, 0.7, 0.14, 'plafond (haut)']],
            mouths: [[0.5, 0.41]],
          },
          bubbles: [{ type: 'cri', text: 'Mon mémoire ! Tout s’efface !!', x: 0.5, y: 0.09, w: 0.84, size: 14, who: 0 }],
        },
        {
          action: 'Panique : une dizaine d’étudiants courent vers nous (vers la sortie) dans l’allée centrale, terrifiés, l’étudiant au t-shirt jaune en tête, une feuille à la main ; derrière eux, des pixels violets envahissent l’air devant les rayonnages centraux et l’horloge. Une chaise renversée au premier plan à gauche, des feuilles, un cahier et un sac par terre. Fenêtres et pluie à gauche, rayonnages à droite.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'etudiant', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.25, y: 0.97, fill: 0.55, flip: true, blur: 40 },
            { id: 'etudiante', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.6, y: 0.98, fill: 0.55, flip: true },
          ],
          fx: [{ type: 'vitesse', opacity: 0.4 }, { type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.3, 0.38, 0.7, 0.6, 'visages des étudiants qui fuient'], [0.42, 0.35, 0.58, 0.97, 'étudiant au t-shirt jaune']],
            free: [[0.26, 0, 0.74, 0.22, 'plafond (haut)']],
          },
          bubbles: [{ type: 'cri', text: 'SORTEZ !!', x: 0.55, y: 0.11, w: 0.46, tail: false }],
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
          action: 'GRANDE CASE. L’Oubli surgit au-dessus des tables centrales, devant les rayonnages du fond : une immense masse d’ombre violette faite de lettres arrachées aux livres, avec en son cœur un cristal violet qui brille ; de longs tentacules de lettres s’étirent vers les fenêtres (à gauche) et les rayonnages (à droite). L’horloge du mur du fond est arrachée de travers, des livres et des feuilles volent (certains, flous, au premier plan). Salle de lecture baignée de violet, lampes vertes encore allumées.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'oubli', pose: 'cri', shot: 'taille', x: 0.5, y: 0.05, fill: 1.0, seed: 13 }],
          fx: [{ type: 'glitch', n: 30 }, { type: 'vignette', opacity: 0.5 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.36, 0.02, 0.64, 0.7, 'l’Oubli et son cristal']],
            free: [[0.13, 0.62, 0.42, 0.9, 'tables et sol (bas gauche)']],
          },
          sfx: [{ text: 'KRRRAAACK !', x: 0.3, y: 0.84, size: 64, rot: -8, color: VIOLET, impact: true }],
          sound: 'boss',
        },
        {
          action: 'Un tentacule de lettres violettes balaie en diagonale un haut rayonnage (au centre) : des livres s’envolent sur la droite, s’ouvrent et retombent en cascade sur le sol, des feuilles volent. Fenêtres et tables aux lampes vertes à gauche.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.3 },
          fx: [{ type: 'vitesse', opacity: 0.4 }, { type: 'teinte', color: '#7c3aed', opacity: 0.25 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.25, 0.25, 0.8, 0.5, 'tentacule de lettres'], [0.62, 0.15, 0.83, 0.7, 'livres qui tombent']],
            free: [[0.17, 0.6, 0.5, 0.85, 'tables et rayonnage (bas gauche)']],
          },
          sfx: [{ text: 'FRRRAAAS !', x: 0.32, y: 0.7, size: 40, rot: -6, color: VIOLET, impact: true }],
        },
        {
          action: `Un haut rayonnage (à droite) bascule dans une lueur violette, ses livres en tombent ; Kaï (à gauche), en fente, attrape Nia par l’avant-bras et la tire vers lui, sa main droite bandée tendue en arrière pour l’équilibre ; Nia, déséquilibrée, regarde par-dessus son épaule le rayonnage qui tombe. Au fond, l’horloge au-dessus des rayonnages centraux ; fenêtres et pluie à gauche. ${KAI} ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.6 },
          chars: [
            { id: 'kai', pose: 'main_tendue', expr: 'concentration', shot: 'americain', x: 0.3, y: 0.45, fill: 0.62 },
            { id: 'nia', pose: 'choc', expr: 'surprise', shot: 'americain', x: 0.66, y: 0.47, fill: 0.6, flip: true },
          ],
          fx: [{ type: 'vitesse', opacity: 0.35 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.29, 0.22, 0.37, 0.38, 'visage de Kaï'], [0.51, 0.31, 0.58, 0.46, 'visage de Nia'], [0.4, 0.46, 0.48, 0.56, 'main de Kaï qui tire Nia'], [0.63, 0.06, 0.86, 0.85, 'rayonnage qui bascule']],
            free: [[0.23, 0, 0.6, 0.2, 'plafond (haut)']],
            mouths: [[0.335, 0.35], [0.54, 0.43]],
          },
          bubbles: [{ type: 'cri', text: 'Attention !', x: 0.3, y: 0.12, w: 0.36, who: 0 }],
          sound: 'hit',
        },
        {
          action: `Gros plan sur Nia, sauvée de justesse : elle garde son calme et regarde vers la droite (vers l’Oubli, hors champ), en analysant ; lueur violette derrière elle, à droite, sur le rayonnage renversé. À gauche, fenêtres et tables aux lampes vertes dans la pénombre. ${NIA}`,
          bg: { id: 'aplat', color: '#3a2a5a', color2: '#120c1e' },
          chars: [{ id: 'nia', pose: 'debout', expr: 'reflexion', shot: 'gros', x: 0.42, y: 0.3, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.4],
            keep: [[0.48, 0.15, 0.66, 0.6, 'visage de Nia']],
            free: [[0.7, 0.1, 1, 0.6, 'lueur violette (droite)'], [0, 0.1, 0.35, 0.6, 'fenêtres (gauche)']],
            mouths: [[0.58, 0.51]],
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
          action: `Nia monte sur sa longue table, posée dans la longueur le long des fenêtres (fenêtres et pluie à gauche) : un pied sur la chaise, l’autre genou plié sur la table, elle regarde vers la salle (à droite), décidée. Lampe verte qui luit violet, livres et cahiers ouverts sur la table ; salle baignée de lumière violette, rayonnages au fond à droite. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.6, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'debout', expr: 'concentration', shot: 'pied', x: 0.5, y: 0.8, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.52, 0.08, 0.72, 0.95, 'Nia qui monte sur la table'], [0.59, 0.11, 0.66, 0.26, 'visage de Nia']],
            free: [[0.2, 0, 0.5, 0.45, 'fenêtres (haut gauche)']],
            mouths: [[0.62, 0.23]],
          },
          bubbles: [{ type: 'parole', text: 'Respirez.', x: 0.24, y: 0.14, w: 0.3, who: 0 }],
        },
        {
          action: `Nia, debout sur la longue table (vue dans l’axe de la table), face à nous, voix posée, les mains ouvertes le long du corps, les tresses soulevées par un souffle ; une lampe verte entre ses pieds. Derrière elle, la salle sombre : fenêtres à gauche, rayonnages à droite, lueur violette au fond à droite. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.6, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'parle', expr: 'neutre', shot: 'taille', x: 0.55, y: 0.5, fill: 0.68 }],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.46, 0.05, 0.54, 0.2, 'visage de Nia'], [0.43, 0.2, 0.57, 0.95, 'Nia debout sur la table']],
            free: [[0.13, 0.1, 0.38, 0.55, 'fenêtres (gauche)'], [0.62, 0.1, 0.87, 0.5, 'rayonnages (droite)']],
            mouths: [[0.5, 0.17]],
          },
          bubbles: [{ type: 'parole', text: 'L’Oubli, c’est une marée. Il n’emporte que ce qui n’est pas ancré.', x: 0.2, y: 0.4, w: 0.32, size: 16, who: 0 }],
        },
        {
          action: `GRANDE CASE. Nia, debout sur la longue table, jambes écartées, crie en pointant le doigt vers les étudiants (vers nous) ; derrière elle, la masse violette de l’Oubli et ses tentacules de lettres soulèvent ses tresses. Au premier plan, deux étudiants vus de dos (en bas à gauche et à droite) lèvent les yeux vers elle ; à droite, un rayonnage renversé. Fenêtres à gauche, rayonnages à droite, lampes vertes. ${NIA}`,
          bg: { id: 'flash', color: '#2a0f3a', lines: '#a78bfa', cx: 0.6, cy: 0.4 },
          chars: [{ id: 'nia', pose: 'pointer', expr: 'concentration', shot: 'americain', x: 0.62, y: 0.4, fill: 0.72, aura: '#e879f9' }],
          fx: [{ type: 'concentration', opacity: 0.4 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.47, 0.17, 0.54, 0.31, 'visage de Nia'], [0.38, 0.24, 0.48, 0.36, 'bras tendu'], [0.28, 0.7, 0.37, 0.88, 'tête de l’étudiant (bas gauche)'], [0.79, 0.69, 0.88, 0.88, 'tête de l’étudiant (bas droite)']],
            free: [[0.06, 0.55, 0.3, 0.75, 'tables (gauche)'], [0.62, 0.05, 0.94, 0.3, 'plafond (droite)']],
            mouths: [[0.5, 0.28]],
          },
          bubbles: [{ type: 'cri', text: 'ANCREZ-VOUS ! Récitez vos notes ! À voix haute !', x: 0.2, y: 0.51, w: 0.36, size: 23, who: 0 }],
          sound: 'sparkle',
        },
        {
          action: 'Trois étudiants restés dans la salle récitent à voix haute, debout côte à côte derrière une table où repose un livre ouvert : à gauche, un garçon à lunettes en t-shirt blanc avec un cahier ; au centre, un garçon en chemise vert clair avec une fiche de cours ; à droite, une étudiante en hijab bleu marine, à lunettes, avec un livre. Autour de chacun, un cercle de lettres lumineuses dorées les protège ; des pixels violets et des traînées d’ombre se heurtent aux cercles. Horloge au-dessus des rayonnages centraux, fenêtres à gauche.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'etudiante_hijab', pose: 'lire', expr: 'concentration', shot: 'taille', x: 0.28, y: 0.6, fill: 0.5 },
            { id: 'etudiant', pose: 'lire', expr: 'concentration', shot: 'taille', x: 0.74, y: 0.62, fill: 0.5, flip: true },
          ],
          fx: [{ type: 'lueur', color: '#ffffff', x: 0.5, y: 0.6, size: 0.4 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.68, 0.33, 0.77, 0.48, 'visage de l’étudiante (hijab)'], [0.25, 0.33, 0.33, 0.47, 'visage de l’étudiant (gauche)'], [0.46, 0.32, 0.54, 0.48, 'visage de l’étudiant (centre)'], [0.22, 0.5, 0.75, 0.75, 'cahiers et livres']],
            free: [[0.14, 0, 0.86, 0.28, 'plafond (haut)']],
            mouths: [[0.725, 0.44], [0.29, 0.44]],
          },
          bubbles: [
            { type: 'parole', text: 'La dérivée de x², c’est 2x…', x: 0.24, y: 0.15, w: 0.4, who: 1 },
            { type: 'parole', text: 'Un vecteur a une norme…', x: 0.77, y: 0.15, w: 0.4, who: 0 },
          ],
        },
        {
          action: `Mory, stupéfait, plan buste, bouche entrouverte, la main à son col, sa tablette dans l’autre main : derrière lui, un cercle de lettres lumineuses dorées brille. Toujours mouillé, l’antenne dépasse de son sac à dos. Fond : fenêtres à gauche, rayonnages et lampes vertes à droite. ${MORY_T}`,
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0b0614' },
          chars: [{ id: 'mory', pose: 'debout', expr: 'surprise', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.45, 0.19, 0.61, 0.44, 'visage de Mory'], [0.6, 0.72, 0.74, 0.98, 'tablette']],
            free: [[0.26, 0, 0.74, 0.17, 'cheveux et plafond (haut)']],
            mouths: [[0.53, 0.4]],
          },
          bubbles: [{ type: 'parole', text: 'Ça marche… Elle a construit une digue.', x: 0.5, y: 0.1, w: 0.9, size: 14, who: 0 }],
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
          action: `Kaï (à gauche), encore mouillé, la main droite bandée sur la bretelle de son sac, lance le chronomètre du téléphone qu’il tient dans la main gauche, les yeux fixés sur l’Oubli : au centre droit, un anneau de lumière violette (la vague) entoure la masse d’ombre et son cristal, des débris et des feuilles volent ; un rayonnage renversé. Fenêtres à gauche, rayonnages et bureau à droite. ${KAI}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'kai', pose: 'telephone', expr: 'concentration', shot: 'taille', x: 0.28, y: 0.5, fill: 0.7 }],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.25 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.33, 0.1, 0.44, 0.31, 'visage de Kaï'], [0.46, 0.38, 0.53, 0.53, 'téléphone'], [0.46, 0.17, 0.74, 0.82, 'l’Oubli et sa vague']],
            free: [[0.76, 0.7, 1, 0.92, 'bureau et sol (bas droite)']],
            mouths: [[0.4, 0.27]],
          },
          sfx: [{ text: 'VMMMM', x: 0.87, y: 0.2, size: 40, rot: -6, color: VIOLET }],
          sound: 'boss',
        },
        {
          action: '[ÉCRAN APPLI] Le chronomètre du téléphone de Kaï, avec trois temps enregistrés : 5,0 s · 4,6 s · 4,1 s.',
          bg: { id: 'ecran', text: 'Tour 1 : 5,0 s\nTour 2 : 4,6 s\nTour 3 : 4,1 s', from: 'CHRONOMÈTRE', clock: '10:00' },
          sound: 'bubble',
        },
        {
          action: `Kaï, frustré, plan buste, mouillé, les dents serrées : la main droite bandée crispée sur le haut de sa tête, il fixe son téléphone tenu dans la main gauche. Derrière lui à droite, l’anneau violet de l’Oubli ; fenêtres à gauche, rayonnages à droite. ${KAI}`,
          bg: { id: 'flash', color: '#1a0b2e', lines: '#7c3aed', cx: 0.5, cy: 0.5 },
          chars: [{ id: 'kai', pose: 'telephone', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.43, 0.12, 0.6, 0.56, 'visage de Kaï'], [0.33, 0.17, 0.44, 0.42, 'main bandée sur la tête'], [0.33, 0.72, 0.47, 0.95, 'téléphone']],
            free: [[0.62, 0.62, 0.82, 1, 'sac et sweat (bas droite)']],
            mouths: [[0.52, 0.46]],
          },
          bubbles: [{ type: 'cri', text: 'Ça marche pas ! C’est plus une suite géométrique !', x: 0.72, y: 0.83, w: 0.5, size: 17, who: 0 }],
        },
        {
          action: `Mory, plan buste, sérieux, encore mouillé, désigne du doigt sa tablette : au-dessus de l’écran flotte un hologramme cyan, une courbe qui monte de moins en moins vite. Lueur violette au fond ; fenêtres à gauche, rayonnages et lampes vertes à droite. ${MORY_T.replace('trempé, ', '')}`,
          bg: { id: 'aplat', color: '#203048', color2: '#0b1220' },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'reflexion', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.45, 0.2, 0.6, 0.44, 'visage de Mory'], [0.46, 0.58, 0.78, 0.92, 'tablette et courbe en hologramme']],
            free: [[0.22, 0, 0.4, 0.55, 'fenêtres (gauche)']],
            mouths: [[0.53, 0.41]],
          },
          bubbles: [{ type: 'parole', text: 'Il s’est adapté. Son énergie monte… mais de moins en moins vite.', x: 0.2, y: 0.3, w: 0.38, size: 13, who: 0 }],
        },
        {
          action: `Nia (à gauche), descendue de sa table, s’avance et tend la main ouverte vers la tablette lumineuse de Mory, le regard décidé ; Mory (à droite) de trois quarts dos, mouillé, tient la tablette, l’antenne dépasse de son sac. Salle sombre : fenêtres et lampes à gauche. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'main_tendue', expr: 'concentration', shot: 'taille', x: 0.56, y: 0.5, fill: 0.68 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.37, 0.07, 0.47, 0.31, 'visage de Nia'], [0.45, 0.58, 0.69, 0.84, 'main tendue et tablette']],
            free: [[0.47, 0, 0.62, 0.4, 'salle (entre eux)']],
            mouths: [[0.41, 0.26]],
          },
          bubbles: [{ type: 'parole', text: 'Donne.', x: 0.57, y: 0.13, w: 0.22, who: 0 }],
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
          action: `Par-dessus l’épaule de Nia (de profil à gauche, tresses à perles au premier plan) : elle tient la tablette de Mory de la main gauche et pose l’index droit sur l’écran quadrillé, où une courbe cyan monte puis redescend ; une ligne blanche (la tangente) touche la courbe sous son doigt. Fond flou : salle violette, lampe verte à droite. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'debout', expr: 'concentration', shot: 'taille', x: 0.18, y: 0.55, fill: 0.6 },
            { id: 'nia', pose: 'telephone', expr: 'concentration', shot: 'taille', x: 0.5, y: 0.52, fill: 0.64 },
            { id: 'mory', pose: 'debout', expr: 'concentration', shot: 'taille', x: 0.82, y: 0.55, fill: 0.6, flip: true },
          ],
          illus: {
            focus: [0.5, 0.52],
            keep: [[0.38, 0.3, 0.78, 0.8, 'courbe, tangente et doigt'], [0.18, 0.2, 0.34, 0.5, 'visage de Nia (profil)']],
            free: [[0.78, 0.25, 1, 0.6, 'rayonnages flous (droite)']],
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
            { text: 'l’étale', x: 0.84, y: 0.07, size: 46, style: 'main', color: '#1f8a4c', rot: -3 },
            { text: 'énergie', x: 0.2, y: 0.1, size: 36, style: 'main' },
            { text: 'temps', x: 0.86, y: 0.94, size: 36, style: 'main' },
          ],
          sound: 'sparkle',
        },
        {
          action: `Nia, plan buste, tient la tablette (écran blanc lumineux tourné vers nous) de la main droite, à gauche de l’image, et la désigne de l’index gauche ; elle parle en regardant vers la droite (vers Kaï et Mory, hors champ). Fond flou : fenêtres à gauche, rayonnages à droite, lueur violette. ${NIA}`,
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0b0614' },
          chars: [{ id: 'nia', pose: 'telephone', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.46, 0.08, 0.62, 0.47, 'visage de Nia'], [0.13, 0.43, 0.48, 0.9, 'tablette et index']],
            free: [[0.66, 0, 0.97, 0.6, 'rayonnages (droite)']],
            mouths: [[0.54, 0.45]],
          },
          bubbles: [{ type: 'parole', text: 'Regardez la pente. Elle diminue. C’est une marée montante.', x: 0.82, y: 0.3, w: 0.34, who: 0 }],
        },
        {
          action: `Très gros plan sur le visage de Nia, éclairé par-dessous en cyan par l’écran de la tablette (bord en bas) : le regard s’illumine, un cristal violet de l’Oubli se reflète dans chaque œil, petit sourire (elle a compris). Fond sombre : fenêtres violettes à gauche, rayonnages et lampe à droite. ${NIA}`,
          bg: { id: 'flash', color: '#1a0b2e', lines: '#e879f9', cx: 0.5, cy: 0.5 },
          chars: [{ id: 'nia', pose: 'debout', expr: 'joie', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.38, 0.15, 0.66, 0.8, 'visage de Nia']],
            free: [[0.03, 0, 0.3, 1, 'fenêtres et tresses (gauche)'], [0.72, 0, 0.97, 1, 'rayonnages (droite)']],
            mouths: [[0.5, 0.67]],
          },
          bubbles: [{ type: 'parole', text: 'Quand la pente sera nulle, c’est l’étale. Il s’arrête au sommet… et il se fige.', x: 0.19, y: 0.5, w: 0.31, size: 12, who: 0 }],
        },
        {
          action: `Kaï, prêt, en garde, penché en avant, le regard dur tourné vers la gauche, le poing droit bandé levé, la main gauche près du genou ; il est encore mouillé. Derrière lui à droite, l’anneau violet de l’Oubli ; fenêtres et tables à gauche, rayonnages à droite. ${KAI}`,
          bg: { id: 'aplat', color: '#3b1f4a', color2: '#1a0e24' },
          chars: [{ id: 'kai', pose: 'debout', expr: 'concentration', shot: 'gros', x: 0.32, y: 0.3, fill: 0.7 }],
          illus: {
            focus: [0.5, 0.32],
            keep: [[0.41, 0.08, 0.51, 0.31, 'visage de Kaï'], [0.31, 0.27, 0.38, 0.4, 'poing bandé']],
            free: [[0.74, 0.1, 1, 0.55, 'rayonnages (droite)'], [0, 0.1, 0.3, 0.55, 'fenêtres (gauche)']],
            mouths: [[0.45, 0.26]],
          },
          bubbles: [{ type: 'parole', text: 'Quand ?', x: 0.72, y: 0.4, w: 0.24, who: 0 }],
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
          action: `Nia, plan buste, la tablette en bas de l’image (écran cyan), relève la tête et regarde vers la droite, sûre d’elle, les tresses soulevées par le souffle ; lueur violette à droite, fenêtre et pluie à gauche. ${NIA}`,
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0b0614' },
          chars: [{ id: 'nia', pose: 'debout', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.5, 0.12, 0.68, 0.55, 'visage de Nia'], [0.33, 0.78, 0.74, 1, 'tablette']],
            free: [[0.24, 0, 0.45, 0.6, 'fenêtre et rayonnages (gauche)']],
            mouths: [[0.63, 0.45]],
          },
          bubbles: [{ type: 'parole', text: 'Dans dix secondes.', x: 0.17, y: 0.2, w: 0.3, who: 0 }],
        },
        {
          action: `Mory, de dos au premier plan à gauche (antenne qui dépasse de son sac), tend le bras et pointe du doigt la grande table centrale qui luit en violet ; au-dessus d’elle, l’Oubli tourne en un immense tourbillon de pixels et de pages. À droite, un rayonnage renversé et, en bas, la tablette tenue dans sa main. Fenêtres à gauche, rayonnages à droite, lampes vertes. ${MORY_T.replace('trempé, ', '')}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.7 },
          chars: [{ id: 'mory', pose: 'pointer', expr: 'concentration', shot: 'americain', x: 0.3, y: 0.42, fill: 0.66 }],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.22, 0.33, 0.37, 0.62, 'tête de Mory (de dos)'], [0.37, 0.58, 0.53, 0.75, 'bras tendu'], [0.47, 0.08, 0.6, 0.5, 'cœur du tourbillon'], [0.4, 0.55, 0.6, 0.85, 'grande table centrale']],
            free: [[0.19, 0, 0.36, 0.35, 'fenêtres (haut gauche)'], [0.68, 0.15, 0.81, 0.55, 'rayonnages (droite)']],
            mouths: [[0.3, 0.45]],
          },
          bubbles: [{ type: 'parole', text: 'Et il se condensera là où il a le plus mangé : la grande table centrale.', x: 0.2, y: 0.16, w: 0.36, size: 15, who: 0 }],
        },
        {
          action: `Kaï, plan buste, encore mouillé, lève sa main droite bandée, doigts écartés (une tache de sang sur le bandage), et la regarde, plein de doute, les sourcils froncés. Fenêtre et pluie à gauche, rayonnages à droite, lumière violette. ${KAI}`,
          chars: [{ id: 'poing', of: 'kai', x: 0.5, y: 0.62, size: 0.6 }],
          bg: { id: 'aplat', color: '#3b1f4a', color2: '#1a0e24' },
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.26, 0.45, 0.39, 0.84, 'main bandée'], [0.43, 0.17, 0.56, 0.48, 'visage de Kaï']],
            free: [[0.26, 0, 0.4, 0.42, 'fenêtre (haut gauche)']],
            mouths: [[0.48, 0.43]],
          },
          bubbles: [{ type: 'pensee', text: 'Avec quoi je frappe ?', x: 0.2, y: 0.1, w: 0.34, size: 15, tail: false }],
        },
        {
          action: `Nia (à gauche) tend à deux mains son gros dictionnaire à couverture rouge à Kaï (à droite), qui le prend à deux mains (main droite bandée dessous) ; ils se regardent, elle avec un petit sourire, lui sérieux. Derrière eux : une table avec une lampe verte, une grande fenêtre et la pluie, lumière violette. ${NIA} ${KAI}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'main_tendue', expr: 'neutre', shot: 'taille', x: 0.62, y: 0.5, fill: 0.66, flip: true }],
          illus: {
            focus: [0.48, 0.5],
            keep: [[0.16, 0.12, 0.27, 0.36, 'visage de Nia'], [0.7, 0.08, 0.81, 0.33, 'visage de Kaï'], [0.41, 0.52, 0.64, 0.75, 'dictionnaire rouge et mains']],
            free: [[0.3, 0, 0.66, 0.45, 'fenêtre et plafond (centre)']],
            mouths: [[0.24, 0.31]],
          },
          bubbles: [{ type: 'parole', text: 'Celui-là, je l’ai lu dix fois. Il ne peut pas l’effacer.', x: 0.47, y: 0.2, w: 0.42, who: 0 }],
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
          action: `Kaï court de gauche à droite sur les longues tables, le gros dictionnaire rouge serré sous le bras gauche, le poing droit bandé en avant, le regard fixé droit devant ; ses baskets font voler feuilles, crayons et un livre. À droite, le tourbillon violet de l’Oubli devant les rayonnages ; fenêtres et lampes à gauche. ${KAI}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'course', expr: 'concentration', shot: 'pied', x: 0.5, y: 0.95, fill: 0.7 }],
          fx: [{ type: 'vitesse', opacity: 0.45 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.23, 0.12, 0.66, 0.92, 'Kaï qui court sur les tables'], [0.52, 0.12, 0.6, 0.29, 'visage de Kaï']],
            free: [[0.13, 0, 0.36, 0.45, 'fenêtres et plafond (haut gauche)']],
            mouths: [[0.57, 0.26]],
          },
          bubbles: [{ type: 'parole', text: 'Six…', x: 0.17, y: 0.14, w: 0.22, who: 0 }],
          sound: 'swipe',
        },
        {
          action: `Même décor : Kaï bondit d’une table à l’autre, en grand écart, le dictionnaire rouge sous le bras ; un tentacule de lettres et de pages violettes, parti du tourbillon (à droite), passe juste sous lui. ${KAI}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'saut', expr: 'concentration', shot: 'pied', x: 0.5, y: 0.8, fill: 0.7 }],
          fx: [{ type: 'vitesse', opacity: 0.45 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.36, 0.12, 0.66, 0.6, 'Kaï en plein saut'], [0.23, 0.6, 0.75, 0.9, 'jambes de Kaï'], [0.52, 0.12, 0.6, 0.29, 'visage de Kaï'], [0.3, 0.6, 0.87, 0.92, 'tentacule sous lui']],
            free: [[0.13, 0, 0.36, 0.45, 'fenêtres et plafond (haut gauche)']],
            mouths: [[0.57, 0.26]],
          },
          bubbles: [{ type: 'parole', text: 'Huit… neuf…', x: 0.2, y: 0.15, w: 0.28, who: 0 }],
        },
        {
          action: 'Le noyau de l’Oubli, un grand cristal violet devenu solide et lourd, s’écrase sur la grande table centrale : le bois se fend en étoile, éclats et anneau de poussière ; au-dessus, l’ombre de l’Oubli pend du plafond en tentacules, des livres volent. Horloge au mur du fond, fenêtres à gauche, rayonnages à droite.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          fx: [{ type: 'impact', x: 0.5, y: 0.6 }, { type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.36, 0.3, 0.66, 0.8, 'noyau qui s’écrase sur la table qui se fend']],
            free: [[0.7, 0.18, 1, 0.55, 'rayonnages (droite)']],
          },
          sfx: [{ text: 'BOUM !', x: 0.82, y: 0.2, size: 56, rot: -8, color: '#ffd23f', impact: true }],
          sound: 'hit',
        },
        {
          action: `PLEINE LARGEUR, MOMENT FORT. Kaï (à gauche), en fente, frappe le cristal violet à deux mains avec le gros dictionnaire rouge, monté au bout d’un manche comme une masse : dans un grand éclat blanc, le cristal se fissure et des éclats violets volent à droite. Tentacules d’ombre au plafond, fenêtres à gauche, sol fendu. ${KAI}`,
          bg: { id: 'flash', color: '#1a0b2e', lines: '#8b5cf6', cx: 0.6, cy: 0.5 },
          chars: [{ id: 'kai', pose: 'coup_de_poing', expr: 'concentration', shot: 'americain', x: 0.36, y: 0.42, fill: 0.72, aura: '#a78bfa' }],
          fx: [{ type: 'impact', x: 0.66, y: 0.5 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.29, 0.09, 0.37, 0.25, 'visage de Kaï'], [0.42, 0.36, 0.72, 0.6, 'dictionnaire'], [0.6, 0.15, 0.85, 0.75, 'cristal qui se fissure']],
            free: [[0, 0.05, 0.26, 0.55, 'fenêtres (gauche)']],
            mouths: [[0.335, 0.21]],
          },
          bubbles: [{ type: 'cri', text: 'DIX !!!', x: 0.13, y: 0.2, w: 0.24, size: 30, who: 0 }],
          sfx: [{ text: 'KRAAAK !', x: 0.77, y: 0.88, size: 56, rot: -8, color: VIOLET, impact: true }],
          sound: 'hit',
        },
        {
          action: `Après l’impact : Kaï, de dos à gauche, le dictionnaire rouge dans la main droite bandée, regarde la salle. Des milliers de lettres dorées et lumineuses repartent en rubans vers les livres et les rayonnages ; les dernières fumées violettes se dissipent près des ventilateurs ; la grande table centrale est fendue en deux, les lampes vertes sont rallumées. ${KAI}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          fx: [{ type: 'glitch', n: 24 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.22, 0.28, 0.33, 0.46, 'tête de Kaï (de dos)'], [0.32, 0.26, 0.62, 0.6, 'lettres qui repartent, table fendue']],
            free: [[0.55, 0.6, 0.8, 0.74, 'tables (bas droite)']],
          },
          sfx: [{ text: 'SHHHRRRAAA', x: 0.72, y: 0.84, size: 30, rot: -6, color: '#ffd23f' }],
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
          action: 'L’étudiant au t-shirt jaune tient à deux mains son mémoire à spirale ouvert : des lettres lumineuses dorées reviennent se poser sur les pages. Il rit, soulagé, les larmes aux yeux. Salle de lecture plus claire, lumière dorée par les fenêtres à gauche, lampes vertes rallumées, une porte vitrée ouverte à droite, livres au sol.',
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'etudiant_jaune', pose: 'lire', expr: 'joie', shot: 'taille', x: 0.6, y: 0.5, fill: 0.64 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.43, 0.1, 0.56, 0.42, 'visage de l’étudiant (chemise jaune)'], [0.42, 0.42, 0.74, 0.8, 'mémoire qui se remplit']],
            free: [[0, 0.1, 0.4, 0.55, 'fenêtres (gauche)']],
            mouths: [[0.5, 0.38]],
          },
          bubbles: [{ type: 'parole', text: 'Il est revenu ! Tout !', x: 0.24, y: 0.2, w: 0.36, who: 0 }],
        },
        {
          action: `Nia, assise seule sur le bord d’une longue table en bois, les mains posées à plat de chaque côté, la tête baissée, pensive ; une lampe verte allumée sur la table à droite, des livres et des feuilles au sol. Salle calme, lumière dorée et douce par la grande fenêtre à gauche, rayonnages en bois. ${NIA}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'assis_bureau', expr: 'reflexion', shot: 'taille', x: 0.5, y: 0.6, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.55, 0.06, 0.64, 0.23, 'visage de Nia'], [0.5, 0.23, 0.78, 0.95, 'Nia assise sur la table']],
            free: [[0.14, 0, 0.5, 0.5, 'fenêtre et rayonnages (gauche)']],
            mouths: [[0.59, 0.2]],
          },
          bubbles: [{ type: 'parole', text: 'On m’a toujours dit que je compliquais tout.', x: 0.27, y: 0.22, w: 0.46, who: 0 }],
        },
        {
          action: `Nia, assise, de dos en amorce à gauche (tresses à perles) ; face à elle, debout, Kaï (au centre), sincère, le dictionnaire rouge à la main, et Mory (à droite), un léger sourire, sa tablette dans une main, l’autre main ouverte tendue vers Nia. Lumière dorée par la fenêtre à gauche, rayonnages en bois, lampe verte au fond à droite. ${KAI} ${MORY_T.replace('trempé, ', '').replace(' ; il protège sa petite antenne portable sous sa veste', '')}`,
          bg: { id: 'bibliotheque', time: 'pluie', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'debout', expr: 'joie', shot: 'taille', x: 0.3, y: 0.55, fill: 0.6 },
            { id: 'mory', pose: 'debout', expr: 'clin', shot: 'taille', x: 0.72, y: 0.56, fill: 0.6, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.47, 0.12, 0.56, 0.31, 'visage de Kaï'], [0.69, 0.11, 0.8, 0.33, 'visage de Mory'], [0.12, 0.22, 0.32, 0.65, 'tête de Nia (de dos)'], [0.54, 0.66, 0.66, 0.8, 'main ouverte de Mory']],
            free: [[0.13, 0, 0.45, 0.18, 'fenêtre (haut gauche)']],
            mouths: [[0.52, 0.27], [0.73, 0.28]],
          },
          bubbles: [
            { type: 'parole', text: 'Toi ? Tu rends les choses simples.', x: 0.2, y: 0.11, w: 0.36, size: 14, who: 0 },
            { type: 'parole', text: 'Rejoins-nous.', x: 0.66, y: 0.06, w: 0.3, size: 15, who: 1 },
          ],
        },
        {
          action: `Nia, plan buste, assise à la table, sourit enfin, un peu, en coin, le regard relevé vers la droite (vers Kaï et Mory, hors champ). Lumière dorée par la fenêtre à gauche, rayonnages en bois, lampe verte au fond à droite. ${NIA}`,
          bg: { id: 'aplat', color: '#f3e8d0', color2: '#c9b48a' },
          chars: [{ id: 'nia', pose: 'debout', expr: 'clin', shot: 'buste', x: 0.5, y: 0.44, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.41, 0.12, 0.62, 0.56, 'visage de Nia']],
            free: [[0.18, 0, 0.37, 0.6, 'fenêtre (gauche)'], [0.66, 0, 0.82, 0.5, 'rayonnages (droite)']],
            mouths: [[0.53, 0.48]],
          },
          bubbles: [{ type: 'parole', text: 'D’accord. À une condition : c’est moi qui écris les résumés.', x: 0.18, y: 0.3, w: 0.34, size: 15, who: 0 }],
        },
        {
          action: '[ÉCRAN APPLI] Le téléphone de Kaï s’allume : message du Créateur « 3 sur 8. ».',
          bg: { id: 'ecran', text: '3 sur 8.', from: 'LE CRÉATEUR', clock: '10:01', big: true },
          sound: 'bubble',
        },
        {
          action: 'Le lendemain, à l’aube (5 h 40), sur la corniche de Conakry : une silhouette sombre, sans visage, vue de dos, court à toute vitesse sur la route mouillée en s’éloignant vers l’horizon ; une traînée d’éclairs vert acide la suit au sol et l’eau gicle sous ses pas. Mer et rochers à droite derrière le muret, maisons, palmiers et lampadaires encore allumés à gauche, lignes de vitesse. Ciel d’aube bleu et rose.',
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          fx: [{ type: 'vitesse', opacity: 0.5 }, { type: 'lueur', color: '#a3e635', x: 0.55, y: 0.6, size: 0.25 }],
          illus: {
            focus: [0.5, 0.47],
            keep: [[0.45, 0.27, 0.56, 0.7, 'silhouette qui court']],
            free: [[0, 0.28, 0.3, 0.5, 'maisons et palmiers (gauche)'], [0.62, 0.42, 1, 0.72, 'mer et muret (droite)']],
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
