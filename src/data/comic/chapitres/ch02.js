// =====================================================================
// CHAPITRE 2 — « Le signal »  (Kaï et Mory) — VERSION 2 : 12 pages, 58 cases
// ---------------------------------------------------------------------
// Script de référence (et bible de continuité : lieux, heures, lumières,
// main bandée de Kaï, règles de l'Oubli) : docs/scenario-ch02-v2.md
//
// Format : voir l'en-tête de ch01.js et le README (section "Mode Histoire en BD").
// Nouveautés de ce chapitre :
//   labels  : textes posés SUR l'illustration (surimpression : noms de quartiers,
//             dates…), style écran de tablette ; x, y = centre du texte en fractions
//             de la case ; style 'nom' | 'date' ; size facultatif. Déplaçables avec
//             l'éditeur de bulles, traduits comme les bulles.
//   bg 'graphe' : graphe dessiné à la main dans un carnet (dessin de l'appli).
//   bg 'carte' + bare : carte sans texte (les noms viennent des labels).
// Illustrations : public/story/chapitre-2/page-P-case-C.jpg (16:9, sujet au centre).
// =====================================================================

const VIOLET = '#7c3aed';
const CYAN = '#22d3ee';

// Main droite de Kaï : rappel de continuité ajouté aux descriptions.
const MAIN = 'Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.';

export default {
  id: 2,
  title: 'Le signal',
  pages: [
    // ============================================================ PAGE 1 — L'amphi
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [{ h: 0.34, cols: [1], tilt: 24 }, { h: 0.33, cols: [0.55, 0.45], ctilt: [-24] }, { h: 0.33, cols: [0.45, 0.55], ctilt: [22] }],
      panels: [
        {
          action: `Plan large. L’esplanade de l’Université de Conakry le matin (8 h, lumière chaude) : des étudiants entrent, sacs sur l’épaule. Kaï, petit dans le cadre au centre, marche seul, sac à dos gris foncé sur l’épaule droite. ${MAIN}`,
          bg: { id: 'rue', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'etudiante', pose: 'marche', shot: 'pied', x: 0.2, y: 0.95, fill: 0.4 },
            { id: 'kai', pose: 'marche', shot: 'pied', x: 0.5, y: 0.93, fill: 0.36 },
            { id: 'etudiant', pose: 'marche', shot: 'pied', x: 0.8, y: 0.96, fill: 0.42, flip: true },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.42, 0.45, 0.58, 0.95, 'Kaï qui marche seul']],
            free: [[0, 0, 0.45, 0.25, 'ciel (gauche)']],
          },
          captions: [{ text: 'Le lendemain. Université de Conakry.', x: 0.03, y: 0.05, w: 0.5, style: 'noir' }],
        },
        {
          action: 'Dans le grand amphithéâtre en gradins (tableau noir, ventilateurs au plafond, fenêtres hautes ; lumière de jour). Le prof (55 ans, lunettes, chemise blanche, craie à la main) dessine au tableau des points reliés par des traits.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.3 },
          chars: [{ id: 'prof', pose: 'pointer', shot: 'americain', x: 0.68, y: 0.3, fill: 0.7 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.55, 0.25, 0.8, 0.5, 'visage du prof'], [0.2, 0.2, 0.55, 0.7, 'graphe au tableau']],
            free: [[0, 0, 0.5, 0.2, 'haut du tableau']],
            mouths: [[0.66, 0.42]],
          },
          bubbles: [{ type: 'parole', text: 'Aujourd’hui : les graphes. Des sommets… et des arêtes.', x: 0.3, y: 0.16, w: 0.56, who: 0 }],
        },
        {
          action: `Kaï assis dans les gradins, la main bandée posée sur la table, l’air ailleurs. Amphi, lumière de jour. ${MAIN}`,
          bg: { id: 'aplat', color: '#e7d9b8', color2: '#b9a07a' },
          chars: [{ id: 'kai', expr: 'reflexion', shot: 'buste', x: 0.5, y: 0.34, fill: 0.68 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.35, 0.25, 0.65, 0.65, 'visage de Kaï'], [0.4, 0.7, 0.75, 0.95, 'main bandée sur la table']],
            free: [[0, 0, 1, 0.22, 'haut de la case']],
            mouths: [[0.5, 0.55]],
          },
          bubbles: [{ type: 'pensee', text: 'Comment penser aux maths… après hier ?', x: 0.5, y: 0.14, w: 0.8, who: 0 }],
        },
        {
          action: `Kaï se tourne vers son voisin : c’est l’étudiant de Madina (lunettes rondes noires, chemise bleu clair, cahier bleu). Amphi. ${MAIN}`,
          bg: { id: 'classe', time: 'jour', horizon: 0.55, vp: 0.6 },
          chars: [
            { id: 'kai', expr: 'surprise', shot: 'buste', x: 0.3, y: 0.42, fill: 0.56, turn: 0.25 },
            { id: 'etudiant', pose: 'debout', shot: 'americain', x: 0.78, y: 0.4, fill: 0.62, flip: true },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.15, 0.35, 0.45, 0.75, 'visage de Kaï'], [0.6, 0.35, 0.9, 0.7, 'visage de l’étudiant (lunettes rondes)']],
            free: [[0, 0, 1, 0.3, 'haut de la case']],
            mouths: [[0.3, 0.6], [0.78, 0.55]],
          },
          bubbles: [{ type: 'parole', text: 'Toi ! Madina, hier ! Ça va ?!', x: 0.32, y: 0.15, w: 0.56, who: 0 }],
        },
        {
          action: 'L’étudiant de Madina, sincèrement perplexe (il ne se souvient de rien : règle 6). Gros plan, amphi, lumière de jour.',
          bg: { id: 'aplat', color: '#dfe8f2', color2: '#9fb4e0' },
          chars: [{ id: 'etudiant', pose: 'debout', shot: 'americain', x: 0.5, y: 0.36, fill: 0.7 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.3, 0.25, 0.7, 0.7, 'visage perplexe de l’étudiant']],
            free: [[0, 0, 1, 0.24, 'haut de la case']],
            mouths: [[0.5, 0.55]],
          },
          bubbles: [{ type: 'parole', text: 'Madina ? … On se connaît ?', x: 0.5, y: 0.14, w: 0.7, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 2 — Personne ne se souvient
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [{ h: 0.32, cols: [0.55, 0.45], ctilt: [20] }, { h: 0.34, cols: [1], tilt: -24 }, { h: 0.34, cols: [0.45, 0.55], ctilt: [-20] }],
      panels: [
        {
          action: `Gros plan sur Kaï, sidéré. Amphi, lumière de jour. ${MAIN}`,
          bg: { id: 'flash', color: '#fff7e0', lines: '#8b5cf6' },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'gros', x: 0.5, y: 0.3, fill: 0.75 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.3, 0.3, 0.7, 0.95, 'visage sidéré de Kaï']],
            free: [[0, 0, 1, 0.26, 'haut de la case']],
            mouths: [[0.5, 0.78]],
          },
          bubbles: [{ type: 'pensee', text: 'Il… se souvient pas ?', x: 0.5, y: 0.14, w: 0.7, who: 0 }],
        },
        {
          action: '[ÉCRAN APPLI] Le téléphone de Kaï : une recherche « Madina attaque ».',
          bg: { id: 'ecran', text: 'Aucun résultat.', from: 'Recherche : « Madina attaque »', clock: '08:12' },
          sound: 'bubble',
        },
        {
          action: 'Derrière Kaï, dans les gradins, deux étudiantes discutent normalement, détendues. Kaï de dos, flou, au premier plan à gauche. Amphi, lumière de jour.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'etudiante', pose: 'debout', shot: 'americain', x: 0.56, y: 0.34, fill: 0.62 },
            { id: 'passante', pose: 'debout', shot: 'americain', x: 0.82, y: 0.36, fill: 0.6, flip: true },
          ],
          illus: {
            focus: [0.6, 0.5],
            keep: [[0.45, 0.25, 0.92, 0.62, 'visages des deux étudiantes']],
            free: [[0, 0, 0.42, 0.45, 'Kaï de dos (flou)']],
            mouths: [[0.56, 0.45], [0.82, 0.47]],
          },
          bubbles: [{ type: 'parole', text: 'Madina ? Le marché était tranquille hier, non ?', x: 0.24, y: 0.22, w: 0.4, who: 0 }],
        },
        {
          action: `Kaï regarde sa main droite bandée (bandage blanc autour des jointures et de la paume), posée sur la table. Gros plan sur la main, son visage flou derrière. ${MAIN}`,
          bg: { id: 'aplat', color: '#e7d9b8', color2: '#b9a07a' },
          chars: [{ id: 'poing', of: 'kai', x: 0.5, y: 0.62, size: 0.6 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.25, 0.4, 0.75, 0.95, 'main bandée']],
            free: [[0, 0, 1, 0.3, 'haut de la case']],
          },
          bubbles: [{ type: 'pensee', text: 'Et ça, alors ? J’ai pas rêvé.', x: 0.5, y: 0.14, w: 0.8, tail: false }],
        },
        {
          action: 'Le prof, au tableau, montre son graphe (points reliés par des traits) avec sa craie. Amphi, lumière de jour.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.3 },
          chars: [{ id: 'prof', pose: 'pointer', shot: 'americain', x: 0.7, y: 0.36, fill: 0.62 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.58, 0.28, 0.84, 0.55, 'visage du prof'], [0.15, 0.3, 0.55, 0.75, 'graphe au tableau']],
            free: [[0, 0, 1, 0.24, 'haut du tableau']],
            mouths: [[0.7, 0.47]],
          },
          bubbles: [{ type: 'parole', text: 'Un graphe, c’est une carte des liens. Qui est relié à qui.', x: 0.36, y: 0.15, w: 0.66, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 3 — La rencontre
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [{ h: 0.26, cols: [1], tilt: -20 }, { h: 0.34, cols: [0.45, 0.55], ctilt: [22] }, { h: 0.4, cols: [0.42, 0.58], ctilt: [-22] }],
      panels: [
        {
          action: `À la sortie de l’amphi, la foule des étudiants dans le couloir (lumière de jour par les fenêtres). Kaï de dos au centre, une voix derrière lui. ${MAIN}`,
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'etudiant', pose: 'marche', shot: 'pied', x: 0.18, y: 0.96, fill: 0.62 },
            { id: 'kai', pose: 'dos', shot: 'pied', x: 0.5, y: 0.98, fill: 0.7 },
            { id: 'etudiante', pose: 'marche', shot: 'pied', x: 0.82, y: 0.96, fill: 0.6, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.4, 0.2, 0.6, 1, 'Kaï de dos']],
            free: [[0.62, 0, 1, 0.35, 'couloir (droite)']],
          },
          bubbles: [{ type: 'parole', text: 'Seize secondes.', x: 0.8, y: 0.2, w: 0.3, tail: [1.02, 0.45] }],
        },
        {
          action: 'Kaï se retourne : Mory (afro volumineux à reflets sarcelle, lunettes aux verres cyan lumineux, veste marine à lignes cyan, sac à dos noir d’où dépasse une petite antenne) est adossé à un pilier du couloir, bras croisés, lunettes qui brillent.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.15 },
          chars: [{ id: 'mory', pose: 'bras_croises', expr: 'clin', shot: 'taille', x: 0.55, y: 0.32, fill: 0.7 }],
          fx: [{ type: 'lueur', x: 0.55, y: 0.42, color: CYAN, size: 0.16, opacity: 0.5 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.38, 0.2, 0.7, 0.62, 'visage de Mory (lunettes cyan)'], [0.35, 0.55, 0.75, 1, 'bras croisés']],
            free: [[0, 0, 0.36, 0.5, 'couloir (gauche)']],
            mouths: [[0.55, 0.5]],
          },
          bubbles: [{ type: 'parole', text: 'Pas mal, le gars de Madina.', x: 0.5, y: 0.13, w: 0.8, who: 0 }],
        },
        {
          action: `Kaï, stupéfait, face à Mory, dans le couloir (Kaï à gauche, Mory à droite). ${MAIN}`,
          bg: { id: 'classe', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', expr: 'surprise', shot: 'buste', x: 0.24, y: 0.44, fill: 0.5, turn: 0.25 },
            { id: 'mory', expr: 'neutre', shot: 'buste', x: 0.76, y: 0.46, fill: 0.5, turn: -0.25 },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.1, 0.38, 0.4, 0.75, 'visage de Kaï'], [0.6, 0.38, 0.9, 0.75, 'visage de Mory']],
            free: [[0, 0, 1, 0.35, 'haut de la case']],
            mouths: [[0.24, 0.62], [0.76, 0.64]],
          },
          bubbles: [
            { type: 'cri', text: 'Tu… tu t’en souviens ?!', x: 0.26, y: 0.13, w: 0.46, size: 17, who: 0 },
            { type: 'parole', text: 'Je révise tout. Tout le temps. Il peut pas me prendre ce que j’ai ancré.', x: 0.7, y: 0.27, w: 0.56, size: 15, who: 1 },
          ],
        },
        {
          action: 'Mory, plus grave, lunettes qui brillent, gros plan. Couloir de l’université, lumière de jour.',
          bg: { id: 'aplat', color: '#1b2238', color2: '#0b1022' },
          chars: [{ id: 'mory', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.4, fill: 0.62 }],
          fx: [{ type: 'lueur', x: 0.5, y: 0.5, color: CYAN, size: 0.2, opacity: 0.35 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.3, 0.32, 0.7, 0.75, 'visage grave de Mory']],
            free: [[0, 0, 1, 0.28, 'haut de la case']],
            mouths: [[0.5, 0.62]],
          },
          bubbles: [{ type: 'parole', text: 'Les autres ? Il leur a pris le souvenir. Comme tes enseignes.', x: 0.5, y: 0.15, w: 0.86, who: 0 }],
        },
        {
          action: `Kaï et Mory face à face dans le couloir, plan taille, des étudiants passent derrière. ${MAIN}`,
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'mains_poches', shot: 'americain', x: 0.26, y: 0.42, fill: 0.62 },
            { id: 'mory', pose: 'bras_croises', shot: 'americain', x: 0.74, y: 0.42, fill: 0.62, flip: true },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.12, 0.38, 0.4, 0.68, 'visage de Kaï'], [0.6, 0.38, 0.88, 0.68, 'visage de Mory']],
            free: [[0, 0, 1, 0.34, 'haut de la case']],
            mouths: [[0.26, 0.5], [0.74, 0.5]],
          },
          bubbles: [
            { type: 'parole', text: 'T’es qui, toi ?', x: 0.22, y: 0.13, w: 0.36, who: 0 },
            { type: 'parole', text: 'Mory. Licence 2 aussi. Rang du fond.', x: 0.7, y: 0.26, w: 0.5, who: 1 },
          ],
        },
      ],
    },
    // ============================================================ PAGE 4 — La carte
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [{ h: 0.22, cols: [1], tilt: 18 }, { h: 0.42, cols: [1], tilt: -18 }, { h: 0.36, cols: [0.3, 0.4, 0.3], ctilt: [16, -16] }],
      panels: [
        {
          action: `Couloir de l’université, lumière de jour. Mory sort une tablette de son sac à dos noir (petite antenne qui dépasse) ; Kaï regarde, intrigué. ${MAIN}`,
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.6 },
          chars: [
            { id: 'kai', pose: 'debout', shot: 'americain', x: 0.25, y: 0.3, fill: 0.7 },
            { id: 'mory', pose: 'telephone', shot: 'americain', x: 0.7, y: 0.3, fill: 0.7, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.15, 0.25, 0.38, 0.6, 'visage de Kaï'], [0.58, 0.25, 0.82, 0.6, 'visage de Mory'], [0.55, 0.55, 0.85, 0.9, 'tablette qui sort du sac']],
            free: [[0.38, 0, 0.6, 0.35, 'entre les deux (haut)']],
            mouths: [[0.25, 0.42], [0.7, 0.42]],
          },
          bubbles: [{ type: 'parole', text: 'Regarde.', x: 0.5, y: 0.2, w: 0.2, who: 1 }],
        },
        {
          action: '[ILLUSTRATION + SURIMPRESSION] Gros plan sur l’écran de la tablette : une carte réaliste de la presqu’île de Conakry (la côte, la mer, les grandes routes, les quartiers), vue de dessus, la presqu’île allant du coin bas-gauche (Kaloum, la pointe) vers le haut-droit. Une dizaine de points rouges lumineux, reliés par une fine ligne pointillée violette, de Kaloum jusqu’à Madina. AUCUN texte dans l’illustration : l’appli ajoute par-dessus les noms des quartiers et les dates (labels, déplaçables avec l’éditeur de bulles).',
          bg: { id: 'carte', bare: true, points: [[0.22, 0.76], [0.27, 0.69], [0.33, 0.6], [0.36, 0.66], [0.41, 0.57], [0.44, 0.52], [0.47, 0.5], [0.5, 0.47], [0.53, 0.45]], next: [0.6, 0.36] },
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.15, 0.3, 0.7, 0.85, 'presqu’île et points rouges']],
            free: [[0.62, 0.55, 0.95, 0.9, 'mer (bas-droite)']],
          },
          labels: [
            { text: 'Kaloum', x: 0.13, y: 0.82 },
            { text: 'Dixinn', x: 0.27, y: 0.52 },
            { text: 'Bonfi', x: 0.33, y: 0.73 },
            { text: 'Matam', x: 0.47, y: 0.62 },
            { text: 'Taouyah', x: 0.38, y: 0.4 },
            { text: 'Madina', x: 0.6, y: 0.53 },
            { text: 'Hamdallaye', x: 0.68, y: 0.3 },
            { text: '08/09', x: 0.29, y: 0.79, style: 'date' },
            { text: '16/09', x: 0.21, y: 0.62, style: 'date' },
            { text: '25/09', x: 0.37, y: 0.49, style: 'date' },
            { text: '06/10', x: 0.58, y: 0.42, style: 'date' },
          ],
          sound: 'bubble',
        },
        {
          action: 'Mory tient la tablette, l’écran éclaire son visage en cyan. Couloir, lumière de jour.',
          bg: { id: 'aplat', color: '#1b2238', color2: '#0b1022' },
          chars: [{ id: 'mory', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.5, fill: 0.5 }],
          fx: [{ type: 'lueur', x: 0.5, y: 0.8, color: CYAN, size: 0.3, opacity: 0.4 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.3, 0.42, 0.7, 0.75, 'visage de Mory'], [0.3, 0.75, 0.7, 1, 'tablette']],
            free: [[0, 0, 1, 0.38, 'haut de la case']],
            mouths: [[0.5, 0.68]],
          },
          bubbles: [{ type: 'parole', text: 'Un mois d’attaques. Personne n’a rien remarqué. Sauf moi.', x: 0.5, y: 0.2, w: 0.9, who: 0 }],
        },
        {
          action: `Kaï regarde Mory, sérieux (Kaï à gauche, Mory à droite, la tablette entre eux). ${MAIN}`,
          bg: { id: 'classe', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', expr: 'reflexion', shot: 'buste', x: 0.26, y: 0.6, fill: 0.36, turn: 0.25 },
            { id: 'mory', expr: 'clin', shot: 'buste', x: 0.74, y: 0.62, fill: 0.36, turn: -0.25 },
          ],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.1, 0.55, 0.42, 0.85, 'visage de Kaï'], [0.58, 0.55, 0.9, 0.85, 'visage de Mory']],
            free: [[0, 0, 1, 0.5, 'haut de la case']],
            mouths: [[0.26, 0.72], [0.74, 0.74]],
          },
          bubbles: [
            { type: 'parole', text: 'Pourquoi tu me montres ça ?', x: 0.3, y: 0.1, w: 0.56, size: 15, who: 0 },
            { type: 'parole', text: 'Parce que toi, t’as trouvé QUAND il est vulnérable. Moi, je peux trouver OÙ.', x: 0.62, y: 0.33, w: 0.74, size: 15, who: 1 },
          ],
        },
        {
          action: 'Mory s’éloigne dans le couloir en levant la main, de dos, sac à dos noir avec la petite antenne. Lumière de jour.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'mory', pose: 'poing_leve', shot: 'pied', x: 0.5, y: 0.94, fill: 0.55 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.38, 0.35, 0.62, 0.95, 'Mory qui s’éloigne, main levée']],
            free: [[0, 0, 1, 0.3, 'haut de la case']],
            mouths: [[0.5, 0.45]],
          },
          bubbles: [{ type: 'parole', text: 'Ce soir, chez moi. Kaloum. Prends de quoi noter.', x: 0.5, y: 0.17, w: 0.9, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 5 — Le toit de Mory
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [{ h: 0.24, cols: [1], tilt: 20 }, { h: 0.28, cols: [1], tilt: -20 }, { h: 0.28, cols: [0.56, 0.44], ctilt: [18] }, { h: 0.2, cols: [1] }],
      panels: [
        {
          action: 'Plan large. Le toit-terrasse de l’immeuble de Mory, à Kaloum, au coucher du soleil (19 h 30) : muret, réservoir d’eau, câbles, grande antenne bricolée, vieux PC portable sur une caisse ; la ville et la mer derrière. Kaï et Mory, petits, près de la caisse.',
          bg: { id: 'toit', time: 'couchant', horizon: 0.55, roofY: 0.9 },
          chars: [
            { id: 'kai', pose: 'debout', shot: 'pied', x: 0.55, y: 0.92, fill: 0.36 },
            { id: 'mory', pose: 'pointer', shot: 'pied', x: 0.72, y: 0.92, fill: 0.35, flip: true },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.45, 0.45, 0.8, 0.95, 'Kaï, Mory et le PC'], [0.15, 0.1, 0.35, 0.85, 'grande antenne bricolée']],
            free: [[0.38, 0, 1, 0.3, 'ciel du couchant']],
          },
          captions: [{ text: 'Le soir. Kaloum, sur le toit de Mory.', x: 0.03, y: 0.05, w: 0.5, style: 'noir', right: true }],
        },
        {
          action: `Le vieux PC portable sur sa caisse : une page qui charge lentement (barre de chargement, deux barres de réseau). Kaï (à gauche) et Mory (à droite) penchés dessus, éclairés par l’écran. Coucher du soleil. ${MAIN}`,
          bg: { id: 'toit', time: 'couchant', horizon: 0.5, roofY: 0.98 },
          chars: [
            { id: 'kai', expr: 'neutre', shot: 'buste', x: 0.22, y: 0.42, fill: 0.56, turn: 0.2 },
            { id: 'mory', expr: 'concentration', shot: 'buste', x: 0.78, y: 0.42, fill: 0.56, turn: -0.2 },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.08, 0.38, 0.36, 0.78, 'visage de Kaï'], [0.64, 0.38, 0.92, 0.78, 'visage de Mory'], [0.38, 0.55, 0.62, 1, 'PC qui charge']],
            free: [[0.3, 0, 0.7, 0.5, 'ciel (centre)']],
            mouths: [[0.22, 0.62], [0.78, 0.62]],
          },
          bubbles: [
            { type: 'parole', text: 'Deux barres de réseau. Quarante secondes de chargement.', x: 0.6, y: 0.17, w: 0.36, size: 16, who: 1 },
            { type: 'parole', text: 'Comment tu tiens ?', x: 0.4, y: 0.37, w: 0.2, size: 16, who: 0 },
            { type: 'parole', text: 'Entraînement mental.', x: 0.58, y: 0.57, w: 0.2, size: 16, who: 1 },
          ],
        },
        {
          action: '[DESSIN APPLI] Le carnet de Mory : un graphe dessiné à la main. Sept sommets (Kaloum, Matam, Madina, Dixinn, Hamdallaye, Bonfi, Taouyah) reliés par des arêtes (les routes). Les sommets déjà attaqués sont entourés en rouge. Hamdallaye a six arêtes.',
          bg: {
            id: 'graphe',
            nodes: [
              { name: 'Kaloum', x: 0.24, y: 0.82, red: true },
              { name: 'Dixinn', x: 0.2, y: 0.58, red: true },
              { name: 'Bonfi', x: 0.5, y: 0.86, red: true },
              { name: 'Matam', x: 0.5, y: 0.62, red: true },
              { name: 'Madina', x: 0.78, y: 0.7, red: true },
              { name: 'Taouyah', x: 0.44, y: 0.4 },
              { name: 'Hamdallaye', x: 0.72, y: 0.38 },
            ],
            edges: [[0, 1], [0, 3], [2, 3], [2, 4], [3, 4], [1, 5], [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5]],
          },
          bubbles: [{ type: 'parole', text: 'Les quartiers, ce sont les sommets. Les routes, les arêtes.', x: 0.5, y: 0.14, w: 0.9, size: 15, tail: [1.04, 0.5] }],
        },
        {
          action: 'Mory, le stylo pointé sur le carnet, lunettes qui brillent. Coucher du soleil, toit de Kaloum.',
          bg: { id: 'aplat', color: '#ffab4a', color2: '#c4406a' },
          chars: [{ id: 'mory', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.52, fill: 0.48 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.3, 0.45, 0.7, 0.8, 'visage de Mory'], [0.35, 0.78, 0.8, 1, 'stylo sur le carnet']],
            free: [[0, 0, 1, 0.4, 'haut de la case']],
            mouths: [[0.5, 0.71]],
          },
          bubbles: [{ type: 'parole', text: 'Il saute toujours vers le voisin qui a le plus de routes. Le sommet de plus haut degré. Là où passe le plus de monde.', x: 0.5, y: 0.22, w: 0.96, size: 14, who: 0 }],
        },
        {
          action: `Kaï comprend, Mory à côté de lui (Kaï à gauche, Mory à droite), le carnet entre eux. Fin du coucher du soleil. ${MAIN}`,
          bg: { id: 'toit', time: 'couchant', horizon: 0.5, roofY: 0.98 },
          chars: [
            { id: 'kai', expr: 'surprise', shot: 'buste', x: 0.2, y: 0.4, fill: 0.62, turn: 0.2 },
            { id: 'mory', expr: 'clin', shot: 'buste', x: 0.8, y: 0.4, fill: 0.62, turn: -0.2 },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.08, 0.35, 0.32, 0.8, 'visage de Kaï'], [0.68, 0.35, 0.92, 0.8, 'visage de Mory']],
            free: [[0.32, 0, 0.68, 1, 'ciel et carnet (centre)']],
            mouths: [[0.2, 0.66], [0.8, 0.66]],
          },
          bubbles: [
            { type: 'parole', text: 'Et depuis Madina, le plus connecté, c’est…', x: 0.43, y: 0.22, w: 0.3, size: 16, who: 0 },
            { type: 'parole', text: 'Le rond-point de Hamdallaye. Six routes.', x: 0.58, y: 0.7, w: 0.3, size: 16, who: 1 },
          ],
        },
      ],
    },
    // ============================================================ PAGE 6 — Le signal
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.3, cols: [0.5, 0.5], ctilt: [-20] }, { h: 0.35, cols: [1], tilt: 24 }, { h: 0.35, cols: [1] }],
      panels: [
        {
          action: 'La grande antenne bricolée du toit s’allume : ses petites lumières cyan clignotent. Mory, en bas de l’image, la regarde. Crépuscule bleu.',
          bg: { id: 'toit', time: 'nuit', horizon: 0.6, roofY: 0.95 },
          chars: [{ id: 'mory', expr: 'concentration', shot: 'buste', x: 0.68, y: 0.56, fill: 0.44 }],
          fx: [{ type: 'lueur', x: 0.3, y: 0.3, color: CYAN, size: 0.25, opacity: 0.6 }],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.2, 0.05, 0.45, 0.7, 'antenne qui clignote'], [0.55, 0.5, 0.82, 0.9, 'visage de Mory']],
            free: [[0.5, 0, 1, 0.4, 'ciel (droite)']],
            mouths: [[0.68, 0.77]],
          },
          sfx: [{ text: 'BIP BIP BIP', x: 0.3, y: 0.86, size: 22, rot: -6, color: CYAN }],
          bubbles: [{ type: 'parole', text: 'Pic d’énergie. Il se prépare.', x: 0.68, y: 0.2, w: 0.56, who: 0 }],
          sound: 'sparkle',
        },
        {
          action: 'Mory regarde son vieux PC (écran avec une courbe qui monte), la nuit tombe sur Kaloum, lumières de la ville au loin.',
          bg: { id: 'toit', time: 'nuit', horizon: 0.5, roofY: 0.98 },
          chars: [{ id: 'mory', expr: 'reflexion', shot: 'buste', x: 0.36, y: 0.46, fill: 0.5, turn: 0.25 }],
          fx: [{ type: 'lueur', x: 0.7, y: 0.75, color: CYAN, size: 0.2, opacity: 0.45 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.2, 0.4, 0.52, 0.8, 'visage de Mory'], [0.55, 0.55, 0.9, 1, 'écran du PC']],
            free: [[0.5, 0, 1, 0.45, 'ciel de nuit']],
            mouths: [[0.36, 0.68]],
          },
          bubbles: [{ type: 'parole', text: 'Ce soir. Vers 21 heures.', x: 0.72, y: 0.2, w: 0.44, who: 0 }],
        },
        {
          action: `Kaï debout au bord du toit, la ville de nuit devant lui (lumières de Conakry, la mer sombre), il regarde sa main droite bandée. Vu de trois quarts dos. ${MAIN}`,
          bg: { id: 'toit', time: 'nuit', horizon: 0.55, roofY: 0.92 },
          chars: [{ id: 'kai', pose: 'debout', shot: 'pied', x: 0.6, y: 0.94, fill: 0.72 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.48, 0.15, 0.72, 0.95, 'Kaï au bord du toit'], [0.5, 0.45, 0.68, 0.62, 'main bandée']],
            free: [[0, 0, 0.42, 0.5, 'ville de nuit (gauche)']],
            mouths: [[0.6, 0.25]],
          },
          bubbles: [{ type: 'pensee', text: 'Avec cette main… je pourrai pas frapper pareil.', x: 0.24, y: 0.2, w: 0.4, who: 0 }],
        },
        {
          action: `Mory rejoint Kaï au bord du toit : les deux de dos, côte à côte, face à la ville de nuit (Kaï à gauche, Mory à droite, la petite antenne qui dépasse de son sac). ${MAIN}`,
          bg: { id: 'toit', time: 'nuit', horizon: 0.55, roofY: 0.92 },
          chars: [
            { id: 'kai', pose: 'dos', shot: 'pied', x: 0.38, y: 0.95, fill: 0.62 },
            { id: 'mory', pose: 'dos', shot: 'pied', x: 0.62, y: 0.95, fill: 0.6 },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.28, 0.3, 0.72, 0.98, 'Kaï et Mory de dos']],
            free: [[0, 0, 1, 0.28, 'ciel de nuit']],
            mouths: [[0.38, 0.4], [0.62, 0.41]],
          },
          bubbles: [
            { type: 'parole', text: 'Moi, je trouve OÙ. Toi, tu trouves QUAND.', x: 0.7, y: 0.17, w: 0.5, size: 22, who: 1 },
            { type: 'parole', text: '… Deal.', x: 0.16, y: 0.3, w: 0.2, who: 0 },
          ],
        },
      ],
    },
    // ============================================================ PAGE 7 — Le trajet
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.34, cols: [1], tilt: -26 }, { h: 0.3, cols: [0.5, 0.5], ctilt: [22] }, { h: 0.36, cols: [1] }],
      panels: [
        {
          action: 'Une moto-taxi file dans la nuit (20 h 52, Route du Prince) : le conducteur (gilet orange, casque) devant, Kaï puis Mory derrière lui ; lampadaires orange qui défilent, phares, lignes de vitesse.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'conducteur', pose: 'debout', shot: 'pied', x: 0.42, y: 0.9, fill: 0.5 },
            { id: 'kai', pose: 'debout', shot: 'pied', x: 0.52, y: 0.9, fill: 0.5 },
            { id: 'mory', pose: 'debout', shot: 'pied', x: 0.62, y: 0.9, fill: 0.48 },
          ],
          fx: [{ type: 'vitesse', angle: 0, n: 26, opacity: 0.35, color: '#ffcf7a' }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.3, 0.3, 0.72, 0.95, 'moto-taxi avec le conducteur, Kaï et Mory']],
            free: [[0, 0, 0.3, 0.35, 'nuit (gauche)']],
          },
          captions: [{ text: '20 h 52. Route du Prince.', x: 0.03, y: 0.05, w: 0.4, style: 'noir' }],
          sound: 'swipe',
        },
        {
          action: `Sur la moto, gros plan : Kaï tient son téléphone prêt (main gauche), Mory derrière lui, lunettes cyan. Lumière orange des lampadaires. ${MAIN}`,
          bg: { id: 'aplat', color: '#3a2a4a', color2: '#120c1e' },
          chars: [
            { id: 'kai', expr: 'concentration', shot: 'buste', x: 0.32, y: 0.5, fill: 0.48 },
            { id: 'mory', expr: 'neutre', shot: 'buste', x: 0.72, y: 0.42, fill: 0.46 },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.15, 0.45, 0.48, 0.8, 'visage de Kaï'], [0.58, 0.38, 0.88, 0.7, 'visage de Mory'], [0.2, 0.78, 0.5, 1, 'téléphone']],
            free: [[0, 0, 1, 0.35, 'haut de la case']],
            mouths: [[0.32, 0.7], [0.72, 0.6]],
          },
          bubbles: [
            { type: 'parole', text: 'T’as ton chrono ?', x: 0.66, y: 0.13, w: 0.5, who: 1 },
            { type: 'parole', text: 'Toujours.', x: 0.2, y: 0.25, w: 0.3, who: 0 },
          ],
        },
        {
          action: 'Devant la moto, les feux tricolores clignotent en violet. Le conducteur (gilet orange, casque) freine, paniqué. Nuit.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'conducteur', pose: 'choc', shot: 'americain', x: 0.62, y: 0.4, fill: 0.62 }],
          fx: [{ type: 'lueur', x: 0.25, y: 0.25, color: VIOLET, size: 0.2, opacity: 0.6 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.48, 0.35, 0.78, 0.75, 'visage du conducteur'], [0.1, 0.1, 0.35, 0.45, 'feux tricolores violets']],
            free: [[0.35, 0, 1, 0.3, 'nuit (haut)']],
            mouths: [[0.62, 0.52]],
          },
          bubbles: [{ type: 'cri', text: 'Wallahi, c’est quoi ça ?!', x: 0.62, y: 0.15, w: 0.6, size: 17, who: 0 }],
        },
        {
          action: 'Kaï et Mory sautent de la moto (au premier plan, de dos). Au bout de la route, le rond-point de Hamdallaye : les panneaux de direction se vident, lueur violette. Nuit, lampadaires.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'saut', shot: 'pied', x: 0.32, y: 0.95, fill: 0.62 },
            { id: 'mory', pose: 'course', shot: 'pied', x: 0.62, y: 0.96, fill: 0.58 },
          ],
          fx: [{ type: 'lueur', x: 0.5, y: 0.45, color: VIOLET, size: 0.3, opacity: 0.4, layer: 'back' }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.2, 0.35, 0.75, 1, 'Kaï et Mory qui sautent de la moto'], [0.4, 0.3, 0.62, 0.5, 'rond-point et panneaux qui se vident']],
            free: [[0, 0, 0.4, 0.3, 'nuit (haut gauche)']],
          },
          captions: [{ text: 'Rond-point de Hamdallaye.', x: 0.03, y: 0.05, w: 0.4, style: 'noir', right: true }],
        },
      ],
    },
    // ============================================================ PAGE 8 — L'attaque
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.24, cols: [1], tilt: 20 }, { h: 0.42, cols: [1], tilt: -28 }, { h: 0.34, cols: [0.34, 0.33, 0.33], ctilt: [18, -18] }],
      panels: [
        {
          action: 'Plan large du rond-point de Hamdallaye la nuit (21 h) : six routes qui se croisent, l’îlot central surélevé avec son lampadaire, les voitures et taxis jaunes arrêtés qui klaxonnent, les feux tricolores violets, les panneaux de direction vides.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          fx: [{ type: 'teinte', color: VIOLET, opacity: 0.12 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.35, 0.3, 0.65, 0.8, 'îlot central et lampadaire']],
            free: [[0, 0, 0.35, 0.4, 'nuit (gauche)'], [0.65, 0, 1, 0.4, 'nuit (droite)']],
          },
          sfx: [{ text: 'TUUT ! TUUUT !', x: 0.2, y: 0.24, size: 26, rot: -8, color: '#ffd23f' }],
          sound: 'boss',
        },
        {
          action: 'GRANDE CASE. L’Oubli surgit au-dessus de l’îlot central du rond-point : silhouette encapuchonnée immense, yeux blancs, contour violet, tentacules d’ombre, pixels qui se détachent. Voitures arrêtées, lumières violettes. Nuit.',
          bg: { id: 'oubli' },
          chars: [{ id: 'oubli', pose: 'flotte', shot: 'taille', x: 0.55, y: 0.04, fill: 0.95, seed: 4 }],
          fx: [{ type: 'concentration', x: 0.55, y: 0.35, n: 60, opacity: 0.35, color: VIOLET }],
          illus: {
            focus: [0.5, 0.45],
            keep: [[0.3, 0.02, 0.75, 0.75, 'l’Oubli'], [0.35, 0.7, 0.65, 1, 'îlot central']],
            free: [[0, 0.6, 0.3, 1, 'voitures (bas gauche)']],
          },
          sfx: [{ text: 'KRRRAAACK !', x: 0.22, y: 0.86, size: 48, rot: -10, color: '#c084fc' }],
          sound: 'boss',
        },
        {
          action: 'Panique : les conducteurs abandonnent leurs voitures et s’enfuient, portières ouvertes. Nuit, lueur violette.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'chauffeur', pose: 'course', shot: 'pied', x: 0.3, y: 0.95, fill: 0.55 },
            { id: 'passante', pose: 'course', shot: 'pied', x: 0.7, y: 0.95, fill: 0.5, flip: true },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.2, 0.35, 0.8, 0.95, 'conducteurs qui s’enfuient']],
            free: [[0, 0, 1, 0.3, 'haut de la case']],
          },
          bubbles: [{ type: 'cri', text: 'COUREZ !!', x: 0.5, y: 0.15, w: 0.6, size: 18, tail: [0.3, 0.45] }],
        },
        {
          action: `Kaï lance son chronomètre (téléphone dans la main gauche), les yeux sur l’Oubli. Une vague violette (anneau) traverse la case. Nuit. ${MAIN}`,
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0d0718' },
          chars: [{ id: 'kai', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.48, fill: 0.48, light: VIOLET }],
          fx: [{ type: 'teinte', color: VIOLET, opacity: 0.15 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.3, 0.42, 0.7, 0.75, 'visage de Kaï'], [0.5, 0.75, 0.85, 1, 'téléphone']],
            free: [[0, 0, 1, 0.35, 'haut de la case']],
            mouths: [[0.5, 0.67]],
          },
          sfx: [{ text: 'VMMMM', x: 0.36, y: 0.13, size: 22, rot: -6, color: '#c084fc' }],
          bubbles: [{ type: 'parole', text: 'Première vague.', x: 0.5, y: 0.3, w: 0.7, who: 0 }],
          sound: 'boss',
        },
        {
          action: '[ÉCRAN APPLI] Le chronomètre du téléphone de Kaï affiche 00:06,0.',
          bg: { id: 'ecran', text: '00:06,0', from: 'CHRONOMÈTRE', clock: '21:00' },
          bubbles: [{ type: 'pensee', text: 'Six secondes.', x: 0.5, y: 0.86, w: 0.7, tail: false }],
        },
      ],
    },
    // ============================================================ PAGE 9 — Le calcul
    {
      gutter: 'blanc',
      ambient: 'nuit',
      rows: [{ h: 0.3, cols: [1], tilt: -24 }, { h: 0.34, cols: [0.55, 0.45], ctilt: [20] }, { h: 0.36, cols: [0.45, 0.55], ctilt: [-20] }],
      panels: [
        {
          action: 'Au rond-point, les vagues s’accélèrent : les feux tricolores clignotent de plus en plus vite en violet, anneaux violets autour de l’Oubli au-dessus de l’îlot central. Nuit.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'oubli', pose: 'flotte', shot: 'pied', x: 0.66, y: 0.9, fill: 0.8, seed: 11 }],
          fx: [{ type: 'teinte', color: VIOLET, opacity: 0.18 }, { type: 'glitch', n: 10 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.5, 0.05, 0.82, 0.8, 'l’Oubli et ses anneaux']],
            free: [[0, 0, 0.45, 0.5, 'feux qui clignotent (gauche)']],
          },
          sfx: [{ text: 'VMM… VM', x: 0.2, y: 0.18, size: 26, rot: -6, color: '#c084fc' }],
          bubbles: [{ type: 'pensee', text: 'Puis trois… puis une et demie…', x: 0.24, y: 0.62, w: 0.4, tail: false }],
        },
        {
          action: `Kaï et Mory côte à côte sur le trottoir du rond-point (Kaï à gauche, Mory à droite), lueur violette sur eux. Nuit. ${MAIN}`,
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'kai', expr: 'concentration', shot: 'buste', x: 0.28, y: 0.44, fill: 0.5, turn: 0.2 },
            { id: 'mory', expr: 'reflexion', shot: 'buste', x: 0.74, y: 0.46, fill: 0.5, turn: -0.2 },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.12, 0.38, 0.44, 0.75, 'visage de Kaï'], [0.6, 0.4, 0.9, 0.78, 'visage de Mory']],
            free: [[0, 0, 1, 0.35, 'haut de la case']],
            mouths: [[0.28, 0.62], [0.74, 0.64]],
          },
          bubbles: [
            { type: 'parole', text: 'Même raison qu’à Madina. Un demi.', x: 0.28, y: 0.14, w: 0.48, who: 0 },
            { type: 'parole', text: 'Alors ?', x: 0.78, y: 0.2, w: 0.2, who: 1 },
          ],
        },
        {
          action: '[DESSIN APPLI] Le calcul, comme écrit à la main dans la tête de Kaï : S = 6 / (1 − ½) = 12 (formule KaTeX sur une page de cahier teintée de violet).',
          bg: { id: 'cahier', lines: [], top: 2 },
          fx: [{ type: 'teinte', color: '#2a1f55', opacity: 0.25 }, { type: 'vignette', opacity: 0.55 }],
          formules: [
            { tex: 'S = \\dfrac{u_0}{1-q}', x: 0.52, y: 0.32, size: 0.06, rot: -3, color: '#1d3a8a' },
            { tex: 'S = \\dfrac{6}{1-\\frac{1}{2}} = 12', x: 0.54, y: 0.66, size: 0.07, rot: -2, color: '#1d3a8a' },
          ],
        },
        {
          action: `Kaï, tendu, regarde l’immense rond-point : six routes, voitures abandonnées, l’Oubli au-dessus de l’îlot central au loin. Nuit. ${MAIN}`,
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'buste', x: 0.3, y: 0.42, fill: 0.56, turn: 0.25 }],
          illus: {
            focus: [0.45, 0.55],
            keep: [[0.12, 0.35, 0.48, 0.8, 'visage de Kaï'], [0.55, 0.2, 0.9, 0.6, 'rond-point et Oubli au loin']],
            free: [[0, 0, 1, 0.28, 'haut de la case']],
            mouths: [[0.3, 0.62]],
          },
          bubbles: [{ type: 'cri', text: 'Douze secondes ! Mais où ? Le rond-point est immense !', x: 0.5, y: 0.16, w: 0.86, size: 16, who: 0 }],
        },
        {
          action: 'Mory pointe du doigt le centre du rond-point (l’îlot central, son lampadaire), la petite antenne dans l’autre main. Nuit, lueur violette.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.7 },
          chars: [{ id: 'mory', pose: 'pointer', shot: 'americain', x: 0.3, y: 0.4, fill: 0.62 }],
          illus: {
            focus: [0.45, 0.55],
            keep: [[0.15, 0.35, 0.45, 0.7, 'visage de Mory'], [0.45, 0.4, 0.95, 0.75, 'bras tendu vers l’îlot central']],
            free: [[0, 0, 1, 0.32, 'haut de la case']],
            mouths: [[0.3, 0.5]],
          },
          bubbles: [{ type: 'parole', text: 'Là où il a le plus mangé. Le centre. Le nœud. Le sommet de tous les sommets.', x: 0.52, y: 0.17, w: 0.9, size: 15, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 10 — La course
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.28, cols: [0.5, 0.5], ctilt: [22] }, { h: 0.3, cols: [1], tilt: -26 }, { h: 0.42, cols: [0.5, 0.5], ctilt: [-22] }],
      panels: [
        {
          action: `Kaï s’élance entre les voitures arrêtées du rond-point, téléphone en main. Nuit, phares, lueur violette. ${MAIN}`,
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'course', shot: 'pied', x: 0.5, y: 0.95, fill: 0.7, blur: -60 }],
          fx: [{ type: 'vitesse', angle: 0, n: 18, opacity: 0.35 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.32, 0.2, 0.68, 1, 'Kaï qui court']],
            free: [[0, 0, 0.3, 0.35, 'nuit (gauche)']],
            mouths: [[0.5, 0.3]],
          },
          bubbles: [{ type: 'parole', text: 'Cinq…', x: 0.16, y: 0.16, w: 0.26, who: 0 }],
          sound: 'swipe',
        },
        {
          action: `Un tentacule de l’Oubli écrase le capot d’une voiture derrière Kaï ; Kaï roule par-dessus le capot d’une autre voiture. Nuit. ${MAIN}`,
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'plongeon', shot: 'pied', x: 0.6, y: 0.75, fill: 0.5 }],
          fx: [{ type: 'impact', x: 0.18, y: 0.78, size: 0.3 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.42, 0.25, 0.85, 0.8, 'Kaï qui roule sur le capot'], [0.02, 0.45, 0.35, 0.95, 'tentacule qui écrase la voiture']],
            free: [[0.35, 0, 1, 0.25, 'nuit (haut)']],
            mouths: [[0.62, 0.42]],
          },
          sfx: [{ text: 'KRAAANG !', x: 0.2, y: 0.3, size: 26, rot: 8, color: '#ff5a3d' }],
          bubbles: [{ type: 'parole', text: 'Sept…', x: 0.82, y: 0.16, w: 0.26, who: 0 }],
          sound: 'hit',
        },
        {
          action: 'Mory, sur le trottoir, crie ses indications, sa petite antenne portable à la main (ses lumières cyan clignotent). Nuit, lueur violette.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.8 },
          chars: [{ id: 'mory', pose: 'pointer', shot: 'americain', x: 0.3, y: 0.24, fill: 0.72 }],
          fx: [{ type: 'lueur', x: 0.15, y: 0.6, color: CYAN, size: 0.12, opacity: 0.6 }],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.18, 0.2, 0.42, 0.55, 'visage de Mory'], [0.05, 0.45, 0.3, 0.8, 'petite antenne']],
            free: [[0.45, 0, 1, 0.45, 'rond-point (droite)']],
            mouths: [[0.3, 0.35]],
          },
          bubbles: [{ type: 'cri', text: 'À gauche ! Derrière le taxi !', x: 0.68, y: 0.3, w: 0.5, size: 22, who: 0 }],
        },
        {
          action: `Kaï se baisse derrière un taxi jaune, un tentacule passe au-dessus de lui. Nuit. ${MAIN}`,
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'genou', shot: 'pied', x: 0.5, y: 0.95, fill: 0.5 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.3, 0.45, 0.7, 1, 'Kaï baissé derrière le taxi jaune'], [0.1, 0.1, 0.9, 0.4, 'tentacule au-dessus']],
            free: [[0, 0.42, 0.3, 0.75, 'taxi (gauche)']],
            mouths: [[0.5, 0.6]],
          },
          bubbles: [{ type: 'parole', text: 'Neuf… dix…', x: 0.24, y: 0.5, w: 0.4, who: 0 }],
        },
        {
          action: `Kaï grimpe sur l’îlot central du rond-point, au pied du lampadaire. Nuit, lueur violette au-dessus. ${MAIN}`,
          bg: { id: 'rue', time: 'nuit', horizon: 0.6, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'saut', shot: 'pied', x: 0.55, y: 0.92, fill: 0.62 }],
          fx: [{ type: 'lueur', x: 0.5, y: 0.1, color: VIOLET, size: 0.3, opacity: 0.5, layer: 'back' }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.35, 0.3, 0.75, 0.95, 'Kaï qui grimpe sur l’îlot'], [0.6, 0.0, 0.75, 0.6, 'lampadaire']],
            free: [[0, 0, 0.35, 0.45, 'nuit (gauche)']],
            mouths: [[0.55, 0.42]],
          },
          bubbles: [{ type: 'parole', text: 'Onze…', x: 0.18, y: 0.16, w: 0.26, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 11 — Le coup
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [{ h: 0.22, cols: [1], tilt: 20 }, { h: 0.24, cols: [0.5, 0.5], ctilt: [-22] }, { h: 0.34, cols: [1], tilt: 26 }, { h: 0.2, cols: [1] }],
      panels: [
        {
          action: 'L’Oubli se contracte : son noyau de verre violet translucide tombe (solide et lourd, règle 5) et s’arrête à hauteur de poitrine, au-dessus de l’îlot central. Kaï debout sur l’îlot, à gauche. Nuit, lueur violette intense.',
          bg: { id: 'flash', color: '#1a0b2e', lines: '#c4b5fd', cx: 0.6, cy: 0.5 },
          chars: [{ id: 'oubli', pose: 'flotte', shot: 'pied', x: 0.62, y: 0.95, fill: 0.85, seed: 3 }],
          fx: [{ type: 'lueur', x: 0.62, y: 0.55, color: '#c084fc', size: 0.22, opacity: 0.8 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.5, 0.35, 0.72, 0.75, 'noyau de verre violet'], [0.1, 0.2, 0.35, 1, 'Kaï sur l’îlot']],
            free: [[0.75, 0, 1, 0.4, 'nuit (droite)']],
          },
          sound: 'boss',
        },
        {
          action: `Gros plan sur la main droite bandée de Kaï, qui tremble. ${MAIN}`,
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0d0718' },
          chars: [{ id: 'poing', of: 'kai', x: 0.5, y: 0.66, size: 0.56 }],
          fx: [{ type: 'vitesse', angle: 90, n: 10, opacity: 0.25, color: '#c4b5fd' }],
          illus: {
            focus: [0.5, 0.6],
            keep: [[0.25, 0.4, 0.75, 1, 'main bandée qui tremble']],
            free: [[0, 0, 1, 0.34, 'haut de la case']],
          },
          bubbles: [{ type: 'pensee', text: 'Pas avec cette main…', x: 0.5, y: 0.16, w: 0.8, tail: false }],
        },
        {
          action: `Kaï pivote sur son pied droit, la jambe gauche qui part (préparation du coup de pied retourné), sur l’îlot central. Nuit, lueur violette. ${MAIN}`,
          bg: { id: 'flash', color: '#1a0b2e', lines: '#8b5cf6', cx: 0.5, cy: 0.5 },
          chars: [{ id: 'kai', pose: 'coup_de_pied', shot: 'pied', x: 0.5, y: 0.95, fill: 0.8 }],
          fx: [{ type: 'vitesse', angle: 0, n: 16, opacity: 0.3, color: '#c4b5fd' }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.3, 0.1, 0.75, 1, 'Kaï qui pivote']],
            free: [[0, 0, 0.3, 0.5, 'nuit (gauche)']],
          },
          sfx: [{ text: 'SWISH', x: 0.2, y: 0.22, size: 26, rot: -10, color: '#c4b5fd' }],
          sound: 'swipe',
        },
        {
          action: `PLEINE LARGEUR, MOMENT FORT. Coup de pied retourné : le talon gauche de Kaï percute le noyau de verre violet, qui se fissure dans tous les sens. Impact réaliste, visage crispé. Au-dessus de l’îlot central, nuit. ${MAIN}`,
          bg: { id: 'flash', color: '#fff3f8', lines: VIOLET, cx: 0.62, cy: 0.45 },
          chars: [
            { id: 'oubli', pose: 'recul', shot: 'pied', x: 0.8, y: 1.02, fill: 0.9, seed: 7 },
            { id: 'kai', pose: 'coup_de_pied', shot: 'pied', x: 0.32, y: 0.98, fill: 0.85 },
          ],
          fx: [
            { type: 'impact', x: 0.62, y: 0.42, size: 0.26, color: '#e9d5ff', layer: 'front' },
            { type: 'fissure', x: 0.64, y: 0.45, size: 0.45 },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.15, 0.15, 0.35, 0.45, 'visage crispé de Kaï'], [0.45, 0.25, 0.85, 0.75, 'talon et noyau qui se fissure']],
            free: [[0, 0, 0.15, 0.4, 'haut gauche'], [0.6, 0.8, 1, 1, 'bas droite']],
            mouths: [null, [0.26, 0.34]],
          },
          bubbles: [{ type: 'cri', text: 'DOUZE !!!', x: 0.16, y: 0.13, w: 0.26, size: 28, tail: [0.3, 0.32] }],
          sfx: [{ text: 'KRAAAK !', x: 0.82, y: 0.9, size: 46, rot: -9, color: '#c084fc' }],
          sound: 'hit',
        },
        {
          action: 'Le noyau éclate en milliers de pixels violets ; les feux tricolores du rond-point repassent au vert. Nuit.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.75, vp: 0.5 },
          chars: [{ id: 'oubli', pose: 'recul', shot: 'pied', x: 0.6, y: 0.6, fill: 0.45, seed: 11 }],
          fx: [{ type: 'glitch', n: 26 }, { type: 'lueur', x: 0.15, y: 0.4, color: '#22c55e', size: 0.12, opacity: 0.7 }],
          illus: {
            focus: [0.55, 0.4],
            keep: [[0.45, 0.1, 0.75, 0.65, 'noyau qui éclate en pixels'], [0.05, 0.2, 0.2, 0.6, 'feux qui repassent au vert']],
            free: [[0.2, 0, 0.45, 0.6, 'nuit et pixels']],
          },
          sfx: [{ text: 'SHHHRRRAAA', x: 0.82, y: 0.6, size: 30, rot: -6, color: '#c4b5fd' }],
          sound: 'sparkle',
        },
      ],
    },
    // ============================================================ PAGE 12 — Le pacte
    {
      gutter: 'blanc',
      ambient: 'nuit',
      rows: [{ h: 0.3, cols: [1], tilt: -24 }, { h: 0.34, cols: [0.5, 0.5], ctilt: [22] }, { h: 0.36, cols: [0.42, 0.58], ctilt: [-22] }],
      panels: [
        {
          action: `Plan large du rond-point : les voitures redémarrent (phares), les panneaux de direction se remplissent à nouveau. Kaï est assis sur l’îlot central, épuisé, au pied du lampadaire. Mory traverse entre les voitures pour le rejoindre. Nuit. ${MAIN}`,
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'au_sol', shot: 'pied', x: 0.48, y: 0.78, fill: 0.3 },
            { id: 'mory', pose: 'marche', shot: 'pied', x: 0.72, y: 0.95, fill: 0.5, flip: true },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.38, 0.45, 0.58, 0.85, 'Kaï assis sur l’îlot'], [0.62, 0.45, 0.82, 1, 'Mory qui traverse']],
            free: [[0, 0, 0.35, 0.4, 'nuit (gauche)']],
          },
        },
        {
          action: 'Mory tend la main à Kaï (assis sur l’îlot), lunettes cyan, petite antenne qui dépasse de son sac. Nuit, lampadaire.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'mory', pose: 'main_tendue', shot: 'americain', x: 0.55, y: 0.36, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.4, 0.3, 0.7, 0.6, 'visage de Mory'], [0.2, 0.5, 0.55, 0.75, 'main tendue']],
            free: [[0, 0, 1, 0.3, 'haut de la case']],
            mouths: [[0.55, 0.47]],
          },
          bubbles: [{ type: 'parole', text: 'Je suis pas un combattant. Je suis le gars qui sait OÙ frapper.', x: 0.5, y: 0.16, w: 0.9, size: 15, who: 0 }],
        },
        {
          action: `Gros plan sur la poignée de main : la main droite bandée de Kaï dans celle de Mory (manche violette à gauche, manche marine à lignes cyan à droite). Nuit, lampadaire. ${MAIN}`,
          bg: { id: 'aplat', color: '#283672', color2: '#050817' },
          chars: [{ id: 'poing', of: 'kai', x: 0.5, y: 0.62, size: 0.6 }],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.2, 0.35, 0.8, 0.9, 'poignée de main']],
            free: [[0, 0, 1, 0.3, 'haut de la case']],
          },
          bubbles: [{ type: 'parole', text: 'Et moi, QUAND.', x: 0.5, y: 0.15, w: 0.6, tail: [0.2, 0.5] }],
        },
        {
          action: '[ÉCRAN APPLI] Le téléphone de Kaï s’allume : message du Créateur.',
          bg: { id: 'ecran', text: '2 sur 8. Bien joué.', from: 'LE CRÉATEUR', clock: '21:01' },
          sound: 'bubble',
        },
        {
          action: 'La petite antenne de Mory clignote fort (lumières cyan), l’écran de sa tablette affiche un pic énorme. Mory, les lunettes qui brillent, regarde au loin. Nuit, rond-point.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.3 },
          chars: [{ id: 'mory', expr: 'concentration', shot: 'buste', x: 0.62, y: 0.4, fill: 0.5, turn: -0.25 }],
          fx: [{ type: 'lueur', x: 0.25, y: 0.75, color: CYAN, size: 0.2, opacity: 0.6 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.45, 0.35, 0.8, 0.75, 'visage de Mory (lunettes qui brillent)'], [0.1, 0.6, 0.4, 1, 'tablette avec le pic et antenne']],
            free: [[0, 0, 0.45, 0.5, 'nuit (gauche)']],
            mouths: [[0.62, 0.6]],
          },
          bubbles: [{ type: 'parole', text: 'Attends… Un pic énorme. Demain matin… là où on garde les livres.', x: 0.5, y: 0.16, w: 0.9, size: 15, who: 0 }],
          captions: [{ text: 'À suivre…', x: 0.04, y: 0.86, style: 'noir', right: true }],
        },
      ],
    },
  ],
};
