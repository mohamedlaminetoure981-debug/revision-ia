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
//   illus.zoom : agrandit l'image autour du point focal (carte à lire) ; modéré (≈ 1,5 max).
// Illustrations : public/story/chapitre-2/page-P-case-C.jpg (16:9, sujet au centre).
// =====================================================================

export default {
  id: 2,
  title: 'Le signal',
  pages: [
    // ============================================================ PAGE 1 — L'amphi
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [
        { h: 0.34, cols: [1], tilt: 24 },
        { h: 0.33, cols: [0.55, 0.45], ctilt: [-24] },
        { h: 0.33, cols: [0.45, 0.55], ctilt: [22] },
      ],
      panels: [
        {
          action: 'Plan large. L’esplanade de l’Université de Conakry le matin (8 h, lumière chaude) : bâtiments à arcades, palmiers, étudiants qui entrent, sacs sur l’épaule. Kaï, petit au centre du cadre, marche seul vers nous, sac à dos gris foncé. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'etudiante', pose: 'marche', shot: 'pied', x: 0.2, y: 0.95, fill: 0.4 },
            { id: 'kai', pose: 'marche', shot: 'pied', x: 0.5, y: 0.93, fill: 0.36 },
            { id: 'etudiant', pose: 'marche', shot: 'pied', x: 0.8, y: 0.96, fill: 0.42, flip: true },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.46, 0.42, 0.54, 0.75, 'Kaï qui marche seul']],
            free: [[0, 0, 0.5, 0.12, 'ciel (haut gauche)']],
          },
          captions: [{ text: 'Le lendemain. Université de Conakry.', x: 0.03, y: 0.05, w: 0.5, style: 'noir' }],
        },
        {
          action: 'Dans le grand amphithéâtre en gradins (vu du fond, par-dessus les épaules des étudiants ; ventilateurs au plafond, fenêtres hautes, lumière de jour) : le prof (55 ans, lunettes, chemise blanche, craie à la main), petit au loin, dessine au tableau un graphe : des points reliés par des traits.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.3 },
          chars: [{ id: 'prof', pose: 'pointer', shot: 'americain', x: 0.68, y: 0.3, fill: 0.7 }],
          illus: {
            focus: [0.45, 0.45],
            keep: [[0.42, 0.3, 0.48, 0.55, 'prof'], [0.31, 0.3, 0.44, 0.45, 'graphe au tableau']],
            free: [[0.5, 0, 0.76, 0.25, 'mur et fenêtres (droite)']],
            mouths: [[0.45, 0.35]],
          },
          bubbles: [
            { type: 'parole', text: 'Aujourd’hui : les graphes. Des sommets… et des arêtes.', x: 0.72, y: 0.15, w: 0.5, who: 0 },
          ],
        },
        {
          action: 'Kaï assis dans les gradins, le menton dans la main gauche, l’air ailleurs ; la main droite bandée posée sur la table, un carnet et un stylo devant lui ; autres étudiants qui écrivent autour. Amphi, lumière de jour. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'aplat', color: '#e7d9b8', color2: '#b9a07a' },
          chars: [{ id: 'kai', expr: 'reflexion', shot: 'buste', x: 0.5, y: 0.34, fill: 0.68 }],
          illus: {
            focus: [0.53, 0.5],
            keep: [[0.41, 0.12, 0.55, 0.5, 'visage de Kaï'], [0.46, 0.8, 0.6, 0.96, 'main bandée sur la table']],
            free: [[0.57, 0, 0.8, 0.3, 'fenêtres (droite)']],
            mouths: [[0.49, 0.4]],
          },
          bubbles: [{ type: 'pensee', text: 'Comment penser aux maths… après hier ?', x: 0.8, y: 0.13, w: 0.42, who: 0 }],
        },
        {
          action: 'Kaï se tourne vers son voisin et le montre du doigt (main droite bandée) : c’est l’étudiant de Madina (lunettes rondes, chemise bleu clair poussiéreuse, cahier bleu), l’air gêné, qui ne le connaît pas. Amphi, lumière de jour. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'classe', time: 'jour', horizon: 0.55, vp: 0.6 },
          chars: [
            { id: 'kai', expr: 'surprise', shot: 'buste', x: 0.3, y: 0.42, fill: 0.56, turn: 0.25 },
            { id: 'etudiant', pose: 'debout', shot: 'americain', x: 0.78, y: 0.4, fill: 0.62, flip: true },
          ],
          illus: {
            focus: [0.52, 0.5],
            keep: [[0.34, 0.13, 0.48, 0.52, 'visage de Kaï'], [0.56, 0.25, 0.72, 0.62, 'visage de l’étudiant (lunettes rondes)']],
            free: [[0.55, 0, 0.78, 0.2, 'fenêtres']],
            mouths: [[0.42, 0.4], [0.64, 0.45]],
          },
          bubbles: [{ type: 'parole', text: 'Toi ! Madina, hier ! Ça va ?!', x: 0.78, y: 0.1, w: 0.42, who: 0 }],
        },
        {
          action: 'L’étudiant de Madina, gros plan : sincèrement perplexe, une goutte de sueur, le stylo à la main (il ne se souvient de rien : règle 6). Amphi, lumière de jour.',
          bg: { id: 'aplat', color: '#dfe8f2', color2: '#9fb4e0' },
          chars: [{ id: 'etudiant', pose: 'debout', shot: 'americain', x: 0.5, y: 0.36, fill: 0.7 }],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.35, 0.12, 0.56, 0.52, 'visage perplexe de l’étudiant']],
            free: [[0.58, 0, 0.76, 0.3, 'mur (droite)']],
            mouths: [[0.47, 0.43]],
          },
          bubbles: [{ type: 'parole', text: 'Madina ? … On se connaît ?', x: 0.86, y: 0.22, w: 0.26, who: 0, size: 16 }],
        },
      ],
    },
    // ============================================================ PAGE 2 — Personne ne se souvient
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [
        { h: 0.32, cols: [0.55, 0.45], ctilt: [20] },
        { h: 0.34, cols: [1], tilt: -24 },
        { h: 0.34, cols: [0.45, 0.55], ctilt: [-20] },
      ],
      panels: [
        {
          action: 'Gros plan sur Kaï, sidéré, les yeux écarquillés, une goutte de sueur ; au bord droit, le profil de l’étudiant à lunettes (flou). Lignes de choc sur le côté. Amphi, lumière de jour. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'flash', color: '#fff7e0', lines: '#8b5cf6' },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'gros', x: 0.5, y: 0.3, fill: 0.75 }],
          illus: {
            focus: [0.45, 0.5],
            keep: [[0.3, 0.02, 0.6, 0.65, 'visage sidéré de Kaï']],
            free: [[0.6, 0, 0.77, 0.5, 'fond (droite)']],
            mouths: [[0.46, 0.58]],
          },
          bubbles: [{ type: 'pensee', text: 'Il… se souvient pas ?', x: 0.85, y: 0.2, w: 0.28, who: 0 }],
        },
        {
          action: '[ÉCRAN APPLI] Le téléphone de Kaï : une recherche « Madina attaque ».',
          bg: { id: 'ecran', text: 'Aucun résultat.', from: 'Recherche : « Madina attaque »', clock: '08:12' },
          sound: 'bubble',
        },
        {
          action: 'Derrière Kaï (de dos, flou, épaule violette au premier plan à gauche), deux étudiantes discutent normalement : l’une aux tresses et au haut jaune imprimé, l’autre au foulard bleu qui rit en regardant son téléphone. Amphi, lumière de jour.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'etudiante', pose: 'debout', shot: 'americain', x: 0.56, y: 0.34, fill: 0.62 },
            { id: 'passante', pose: 'debout', shot: 'americain', x: 0.82, y: 0.36, fill: 0.6, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [
              [0.38, 0.17, 0.53, 0.48, 'visage de l’étudiante (tresses)'],
              [0.65, 0.2, 0.75, 0.5, 'visage de l’étudiante (foulard)'],
              [0.71, 0.5, 0.78, 0.6, 'téléphone'],
            ],
            free: [[0.5, 0.05, 0.95, 0.15, 'mur du fond (haut)']],
            mouths: [[0.47, 0.38], [0.7, 0.35]],
          },
          bubbles: [
            {
              type: 'parole',
              text: 'Madina ? Le marché était tranquille hier, non ?',
              x: 0.62,
              y: 0.85,
              w: 0.5,
              who: 0,
              size: 22,
            },
          ],
        },
        {
          action: 'Gros plan : Kaï regarde sa main droite bandée (bandage blanc autour des jointures et de la paume, doigts posés sur la table), à côté d’un carnet noir et d’un stylo ; son visage froncé en haut de l’image. Amphi, lumière de jour. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'aplat', color: '#e7d9b8', color2: '#b9a07a' },
          chars: [{ id: 'poing', of: 'kai', x: 0.5, y: 0.62, size: 0.6 }],
          illus: {
            focus: [0.48, 0.5],
            keep: [[0.38, 0, 0.6, 0.2, 'visage de Kaï (haut)'], [0.26, 0.42, 0.7, 0.9, 'main bandée']],
            free: [[0.24, 0.1, 0.45, 0.4, 'mur (gauche)']],
            mouths: [[0.49, 0.26]],
          },
          bubbles: [{ type: 'pensee', text: 'Et ça, alors ? J’ai pas rêvé.', x: 0.13, y: 0.2, w: 0.24, tail: false, size: 16 }],
        },
        {
          action: 'Le prof (grisonnant, lunettes, chemise blanche), au tableau, montre son graphe (points reliés par des traits) avec sa craie et ouvre la main pour expliquer ; silhouettes d’étudiants de dos au premier plan. Amphi, lumière de jour.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.3 },
          chars: [{ id: 'prof', pose: 'pointer', shot: 'americain', x: 0.7, y: 0.36, fill: 0.62 }],
          illus: {
            focus: [0.59, 0.5],
            keep: [[0.65, 0.08, 0.75, 0.27, 'visage du prof'], [0.4, 0.08, 0.6, 0.4, 'graphe au tableau']],
            free: [[0.3, 0.6, 0.85, 0.9, 'gradins (bas)']],
            mouths: [[0.7, 0.2]],
          },
          bubbles: [
            {
              type: 'parole',
              text: 'Un graphe, c’est une carte des liens. Qui est relié à qui.',
              x: 0.45,
              y: 0.78,
              w: 0.8,
              who: 0,
            },
          ],
        },
      ],
    },
    // ============================================================ PAGE 3 — La rencontre
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [
        { h: 0.26, cols: [1], tilt: -20 },
        { h: 0.34, cols: [0.45, 0.55], ctilt: [22] },
        { h: 0.4, cols: [0.42, 0.58], ctilt: [-22] },
      ],
      panels: [
        {
          action: 'À la sortie de l’amphi : une GALERIE EXTÉRIEURE à piliers de béton, ouverte sur la cour (palmiers, bâtiment aux arcades), lumière de jour. Kaï avance vers nous au centre (sac à dos, main droite bandée), la foule d’étudiants derrière lui devant la porte ; Mory, adossé à un pilier à gauche, bras croisés, l’observe. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'etudiant', pose: 'marche', shot: 'pied', x: 0.18, y: 0.96, fill: 0.62 },
            { id: 'kai', pose: 'dos', shot: 'pied', x: 0.5, y: 0.98, fill: 0.7 },
            { id: 'etudiante', pose: 'marche', shot: 'pied', x: 0.82, y: 0.96, fill: 0.6, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.52, 0.35, 0.65, 0.85, 'Kaï qui marche'], [0.3, 0.33, 0.4, 0.75, 'Mory adossé au pilier']],
            free: [[0, 0.15, 0.3, 0.35, 'cour (gauche)']],
          },
          bubbles: [{ type: 'parole', text: 'Seize secondes.', x: 0.15, y: 0.22, w: 0.26, tail: [0.35, 0.39] }],
        },
        {
          action: 'Kaï (de dos, au premier plan à droite, sac à dos gris, main bandée) se retourne vers Mory : adossé à un pilier de la galerie, bras croisés, une jambe repliée, lunettes cyan qui brillent, sac à dos noir d’où dépasse une petite antenne ; la foule au fond de la galerie. Lumière de jour.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.15 },
          chars: [{ id: 'mory', pose: 'bras_croises', expr: 'clin', shot: 'taille', x: 0.55, y: 0.32, fill: 0.7 }],
          fx: [{ type: 'lueur', x: 0.55, y: 0.42, color: '#22d3ee', size: 0.16, opacity: 0.5 }],
          illus: {
            focus: [0.38, 0.5],
            keep: [[0.28, 0.3, 0.43, 0.72, 'Mory adossé au pilier']],
            free: [[0.35, 0, 0.65, 0.15, 'plafond de la galerie']],
            mouths: [[0.345, 0.4]],
          },
          bubbles: [{ type: 'parole', text: 'Pas mal, le gars de Madina.', x: 0.75, y: 0.1, w: 0.5, who: 0 }],
        },
        {
          action: 'Face à face dans la galerie à piliers : Mory (à gauche, bras croisés, un doigt sur ses lunettes, sourire en coin) et Kaï (à droite, stupéfait, il pointe Mory de sa main droite bandée). Lumière de jour. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'classe', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', expr: 'surprise', shot: 'buste', x: 0.24, y: 0.44, fill: 0.5, turn: 0.25 },
            { id: 'mory', expr: 'neutre', shot: 'buste', x: 0.76, y: 0.46, fill: 0.5, turn: -0.25 },
          ],
          illus: {
            focus: [0.525, 0.5],
            keep: [
              [0.26, 0.18, 0.42, 0.5, 'visage de Mory'],
              [0.68, 0.12, 0.81, 0.42, 'visage de Kaï'],
              [0.52, 0.5, 0.63, 0.65, 'main bandée qui pointe'],
            ],
            free: [[0.45, 0, 0.7, 0.15, 'plafond']],
            mouths: [[0.72, 0.3], [0.35, 0.4]],
          },
          bubbles: [
            { type: 'cri', text: 'Tu… tu t’en souviens ?!', x: 0.5, y: 0.12, w: 0.28, size: 17, who: 0 },
            {
              type: 'parole',
              text: 'Je révise tout. Tout le temps. Il peut pas me prendre ce que j’ai ancré.',
              x: 0.5,
              y: 0.8,
              w: 0.6,
              size: 15,
              who: 1,
            },
          ],
        },
        {
          action: 'Mory, plus grave, gros plan : le front plissé, les verres cyan lumineux, les bras croisés ; sac à dos et petite antenne dans son dos. Galerie à piliers, lumière de jour.',
          bg: { id: 'aplat', color: '#1b2238', color2: '#0b1022' },
          chars: [{ id: 'mory', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.4, fill: 0.62 }],
          fx: [{ type: 'lueur', x: 0.5, y: 0.5, color: '#22d3ee', size: 0.2, opacity: 0.35 }],
          illus: {
            focus: [0.37, 0.5],
            keep: [[0.28, 0.28, 0.46, 0.58, 'visage grave de Mory']],
            free: [[0.45, 0.1, 0.57, 0.9, 'galerie (droite)']],
            mouths: [[0.36, 0.52]],
          },
          bubbles: [
            {
              type: 'parole',
              text: 'Les autres ? Il leur a pris le souvenir. Comme tes enseignes.',
              x: 0.75,
              y: 0.14,
              w: 0.5,
              who: 0,
            },
          ],
        },
        {
          action: 'Kaï (à droite, méfiant, casque autour du cou, main droite bandée) et Mory (à gauche, une main ouverte, l’autre dans la poche, sac à dos et antenne) face à face dans la galerie à piliers ; sa petite antenne est posée contre un pilier. Lumière de jour. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'mains_poches', shot: 'americain', x: 0.26, y: 0.42, fill: 0.62 },
            { id: 'mory', pose: 'bras_croises', shot: 'americain', x: 0.74, y: 0.42, fill: 0.62, flip: true },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.35, 0.1, 0.43, 0.28, 'visage de Mory'], [0.6, 0.17, 0.68, 0.36, 'visage de Kaï']],
            free: [[0.45, 0.05, 0.58, 0.3, 'entre les deux (haut)']],
            mouths: [[0.64, 0.3], [0.4, 0.2]],
          },
          bubbles: [
            { type: 'parole', text: 'T’es qui, toi ?', x: 0.56, y: 0.12, w: 0.26, who: 0 },
            { type: 'parole', text: 'Mory. Licence 2 aussi. Rang du fond.', x: 0.5, y: 0.82, w: 0.6, who: 1 },
          ],
        },
      ],
    },
    // ============================================================ PAGE 4 — La carte
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [
        { h: 0.18, cols: [1], tilt: 18 },
        { h: 0.4, cols: [1], tilt: -18 },
        { h: 0.24, cols: [0.46, 0.54], ctilt: [16] },
        { h: 0.18, cols: [1] },
      ],
      panels: [
        {
          action: 'Dans la galerie à piliers, Mory (au centre, sourire) sort une tablette de son sac à dos noir (petite antenne qui dépasse) et la tend ; Kaï, de trois quarts à droite au premier plan, regarde. Lumière de jour. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.6 },
          chars: [
            { id: 'kai', pose: 'debout', shot: 'americain', x: 0.25, y: 0.3, fill: 0.7 },
            { id: 'mory', pose: 'telephone', shot: 'americain', x: 0.7, y: 0.3, fill: 0.7, flip: true },
          ],
          illus: {
            focus: [0.5, 0.32],
            keep: [
              [0.45, 0.15, 0.56, 0.33, 'visage de Mory'],
              [0.58, 0.36, 0.68, 0.55, 'tablette'],
              [0.7, 0.1, 0.85, 0.32, 'tête de Kaï'],
            ],
            free: [[0.15, 0.1, 0.4, 0.6, 'galerie (gauche)']],
            mouths: [[0.76, 0.25], [0.51, 0.28]],
          },
          bubbles: [{ type: 'parole', text: 'Regarde.', x: 0.3, y: 0.4, w: 0.24, who: 1 }],
        },
        {
          action: '[ILLUSTRATION + SURIMPRESSION] Gros plan sur l’écran de la tablette (tenue par une main en bas à gauche) : une carte RÉALISTE de la presqu’île de Conakry vue de dessus, sans aucun texte : la côte, la mer sombre, les grandes routes, les quartiers, des espaces verts ; la presqu’île va de la pointe (en bas à gauche) vers le nord-est. Onze points rouges lumineux (le plus gros, au centre, est la prochaine cible) reliés par une fine ligne pointillée violette. L’appli ajoute par-dessus les noms des quartiers et des dates (labels).',
          bg: {
            id: 'carte',
            bare: true,
            points: [[0.22, 0.76], [0.27, 0.69], [0.33, 0.6], [0.36, 0.66], [0.41, 0.57], [0.44, 0.52], [0.47, 0.5], [0.5, 0.47], [0.53, 0.45]],
            next: [0.6, 0.36],
          },
          illus: {
            focus: [0.43, 0.56],
            zoom: 1.4,
            keep: [[0.2, 0.3, 0.7, 0.8, 'presqu’île et points rouges']],
            free: [[0.62, 0.55, 0.9, 0.9, 'mer (bas droite)']],
          },
          labels: [
            { text: 'Hamdallaye', x: 0.809, y: 0.3, size: 26 },
            { text: 'Madina', x: 0.689, y: 0.415, size: 26 },
            { text: 'Matam', x: 0.536, y: 0.401, size: 26 },
            { text: 'Taouyah', x: 0.546, y: 0.48, size: 26 },
            { text: 'Dixinn', x: 0.41, y: 0.544, size: 20 },
            { text: 'Bonfi', x: 0.37, y: 0.605, size: 20 },
            { text: 'Kaloum', x: 0.253, y: 0.752, size: 16 },
            { text: '16/09', x: 0.447, y: 0.466, size: 14, style: 'date' },
            { text: '01/10', x: 0.579, y: 0.341, size: 18, style: 'date' },
            { text: '06/10', x: 0.652, y: 0.472, size: 18, style: 'date' },
          ],
          sound: 'bubble',
        },
        {
          action: 'Mory, en tenant la tablette à deux mains : le regard dur derrière ses lunettes aux verres transparents, l’écran éclaire sa veste en rouge et cyan ; galerie à piliers floue derrière lui. Lumière de jour.',
          bg: { id: 'aplat', color: '#1b2238', color2: '#0b1022' },
          chars: [{ id: 'mory', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.5, fill: 0.5 }],
          fx: [{ type: 'lueur', x: 0.5, y: 0.8, color: '#22d3ee', size: 0.3, opacity: 0.4 }],
          illus: {
            focus: [0.62, 0.5],
            keep: [[0.58, 0.2, 0.77, 0.55, 'visage de Mory'], [0.46, 0.72, 0.68, 0.97, 'tablette']],
            free: [[0.47, 0.5, 0.6, 0.7, 'galerie (gauche)']],
            mouths: [[0.69, 0.5]],
          },
          bubbles: [
            {
              type: 'parole',
              text: 'Un mois d’attaques. Personne n’a rien remarqué. Sauf moi.',
              x: 0.2,
              y: 0.35,
              w: 0.36,
              who: 0,
              size: 15,
            },
          ],
        },
        {
          action: 'Kaï (à droite, casque autour du cou, sac à dos) et Mory (à gauche, tablette sous le bras) face à face, très près, dans la galerie : Kaï interroge Mory du regard, Mory le fixe, sérieux. Profils se faisant face. Lumière de jour. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'classe', time: 'jour', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', expr: 'reflexion', shot: 'buste', x: 0.26, y: 0.6, fill: 0.36, turn: 0.25 },
            { id: 'mory', expr: 'clin', shot: 'buste', x: 0.74, y: 0.62, fill: 0.36, turn: -0.25 },
          ],
          illus: {
            focus: [0.535, 0.5],
            keep: [
              [0.36, 0.2, 0.5, 0.5, 'visage de Mory'],
              [0.58, 0.18, 0.74, 0.5, 'visage de Kaï'],
              [0.37, 0.8, 0.5, 0.98, 'tablette'],
            ],
            free: [[0.4, 0, 0.7, 0.12, 'plafond']],
            mouths: [[0.62, 0.45], [0.44, 0.43]],
          },
          bubbles: [
            { type: 'parole', text: 'Pourquoi tu me montres ça ?', x: 0.75, y: 0.1, w: 0.4, size: 15, who: 0 },
            {
              type: 'parole',
              text: 'Parce que toi, t’as trouvé QUAND il est vulnérable. Moi, je peux trouver OÙ.',
              x: 0.5,
              y: 0.64,
              w: 0.5,
              size: 15,
              who: 1,
            },
          ],
        },
        {
          action: 'Mory s’éloigne dans la galerie en levant la main, de dos (sac à dos noir, petite antenne, tablette sous le bras) ; Kaï, de dos en amorce au premier plan à droite, le regarde partir. Lumière de jour. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'mory', pose: 'poing_leve', shot: 'pied', x: 0.5, y: 0.94, fill: 0.55 }],
          illus: {
            focus: [0.43, 0.42],
            keep: [[0.35, 0.28, 0.52, 0.66, 'Mory qui s’éloigne']],
            free: [[0.28, 0, 0.58, 0.25, 'plafond et portes']],
            mouths: [[0.43, 0.38]],
          },
          bubbles: [
            {
              type: 'parole',
              text: 'Ce soir, chez moi. Kaloum. Prends de quoi noter.',
              x: 0.62,
              y: 0.2,
              w: 0.7,
              who: 0,
              size: 13,
              tail: [0.43, 0.36],
            },
          ],
        },
      ],
    },
    // ============================================================ PAGE 5 — Le toit de Mory
    {
      gutter: 'blanc',
      ambient: 'ville',
      rows: [
        { h: 0.24, cols: [1], tilt: 20 },
        { h: 0.28, cols: [1], tilt: -20 },
        { h: 0.28, cols: [0.56, 0.44], ctilt: [18] },
        { h: 0.2, cols: [1] },
      ],
      panels: [
        {
          action: 'Plan large. Le toit-terrasse de l’immeuble de Mory, à Kaloum, au coucher du soleil (19 h 30) : muret, réservoir d’eau sur pilotis avec son échelle, fil à linge, grande antenne bricolée à droite avec une parabole, câbles au sol, flaques, vieux PC portable sur une caisse ; la ville et la mer à l’horizon. Kaï (accroupi, à gauche de la caisse) et Mory (assis sur une chaise bleue, à droite), petits dans le cadre.',
          bg: { id: 'toit', time: 'couchant', horizon: 0.55, roofY: 0.9 },
          chars: [
            { id: 'kai', pose: 'debout', shot: 'pied', x: 0.55, y: 0.92, fill: 0.36 },
            { id: 'mory', pose: 'pointer', shot: 'pied', x: 0.72, y: 0.92, fill: 0.35, flip: true },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [
              [0.36, 0.45, 0.5, 0.8, 'Kaï accroupi'],
              [0.52, 0.4, 0.68, 0.8, 'Mory assis'],
              [0.78, 0.25, 0.96, 0.85, 'grande antenne bricolée'],
            ],
            free: [[0.2, 0.2, 0.7, 0.3, 'ciel du couchant']],
          },
          captions: [{ text: 'Le soir. Kaloum, sur le toit de Mory.', x: 0.18, y: 0.04, w: 0.55, style: 'noir' }],
        },
        {
          action: 'Le vieux PC portable sur sa caisse : un petit sablier de chargement sur l’écran. Kaï (à gauche, accroupi, le menton dans la main, l’air las) et Mory (à droite, bras croisés sur sa chaise, sourire serein) penchés dessus, éclairés par l’écran. Coucher du soleil. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'toit', time: 'couchant', horizon: 0.5, roofY: 0.98 },
          chars: [
            { id: 'kai', expr: 'neutre', shot: 'buste', x: 0.22, y: 0.42, fill: 0.56, turn: 0.2 },
            { id: 'mory', expr: 'concentration', shot: 'buste', x: 0.78, y: 0.42, fill: 0.56, turn: -0.2 },
          ],
          illus: {
            focus: [0.5, 0.45],
            keep: [
              [0.29, 0.22, 0.42, 0.55, 'visage de Kaï'],
              [0.6, 0.1, 0.76, 0.45, 'visage de Mory'],
              [0.38, 0.5, 0.68, 0.8, 'PC portable'],
            ],
            free: [[0.45, 0.08, 0.58, 0.3, 'ciel (centre)'], [0.02, 0.24, 0.25, 0.4, 'tabouret (gauche)']],
            mouths: [[0.35, 0.4], [0.68, 0.32]],
          },
          bubbles: [
            {
              type: 'parole',
              text: 'Deux barres de réseau. Quarante secondes de chargement.',
              x: 0.52,
              y: 0.17,
              w: 0.17,
              size: 14,
              who: 1,
            },
            { type: 'parole', text: 'Comment tu tiens ?', x: 0.14, y: 0.3, w: 0.22, size: 15, who: 0 },
            { type: 'parole', text: 'Entraînement mental.', x: 0.87, y: 0.6, w: 0.22, size: 15, who: 1 },
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
          bubbles: [
            {
              type: 'parole',
              text: 'Les quartiers, ce sont les sommets. Les routes, les arêtes.',
              x: 0.5,
              y: 0.14,
              w: 0.9,
              size: 15,
              tail: [1.04, 0.5],
            },
          ],
        },
        {
          action: 'Mory (à droite, assis sur sa chaise bleue), le stylo pointé sur son carnet où l’on distingue un graphe, explique à Kaï (à gauche, accroupi, concentré, casque autour du cou). Le soleil se couche derrière eux, ciel orange et violet.',
          bg: { id: 'aplat', color: '#ffab4a', color2: '#c4406a' },
          chars: [{ id: 'mory', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.52, fill: 0.48 }],
          illus: {
            focus: [0.53, 0.5],
            keep: [
              [0.62, 0.2, 0.76, 0.45, 'visage de Mory'],
              [0.31, 0.3, 0.43, 0.56, 'visage de Kaï'],
              [0.48, 0.55, 0.64, 0.78, 'carnet avec le graphe'],
            ],
            free: [[0.3, 0, 0.6, 0.28, 'ciel']],
            mouths: [[0.68, 0.36]],
          },
          bubbles: [
            {
              type: 'parole',
              text: 'Il saute toujours vers le voisin qui a le plus de routes. Le sommet de plus haut degré. Là où passe le plus de monde.',
              x: 0.42,
              y: 0.14,
              w: 0.56,
              size: 13,
              who: 0,
            },
          ],
        },
        {
          action: 'Kaï comprend : gros plan sur son visage inquiet, la nuit commence à tomber sur la ville aux lumières allumées ; une petite étincelle à côté de sa tête. Mory répond hors champ. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'toit', time: 'couchant', horizon: 0.5, roofY: 0.98 },
          chars: [
            { id: 'kai', expr: 'surprise', shot: 'buste', x: 0.2, y: 0.4, fill: 0.62, turn: 0.2 },
            { id: 'mory', expr: 'clin', shot: 'buste', x: 0.8, y: 0.4, fill: 0.62, turn: -0.2 },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.42, 0.26, 0.6, 0.74, 'visage de Kaï (yeux et bouche)']],
            free: [[0.65, 0.02, 0.79, 0.4, 'ciel (droite)']],
            mouths: [[0.53, 0.64]],
          },
          bubbles: [
            { type: 'parole', text: 'Et depuis Madina, le plus connecté, c’est…', x: 0.83, y: 0.5, w: 0.3, size: 15, who: 0 },
            {
              type: 'parole',
              text: 'Le rond-point de Hamdallaye. Six routes.',
              x: 0.83,
              y: 0.85,
              w: 0.34,
              size: 15,
              tail: [1.05, 0.8],
            },
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
          action: 'La grande antenne bricolée du toit s’allume : ses lumières cyan clignotent, des ondes l’entourent. Mory (au centre, penché, lunettes qui brillent) la regarde ; Kaï, petit au fond à gauche, observe. Crépuscule bleu, premières lumières de la ville.',
          bg: { id: 'toit', time: 'nuit', horizon: 0.6, roofY: 0.95 },
          chars: [{ id: 'mory', expr: 'concentration', shot: 'buste', x: 0.68, y: 0.56, fill: 0.44 }],
          fx: [{ type: 'lueur', x: 0.3, y: 0.3, color: '#22d3ee', size: 0.25, opacity: 0.6 }],
          illus: {
            focus: [0.65, 0.5],
            keep: [
              [0.6, 0.3, 0.72, 0.42, 'visage de Mory'],
              [0.54, 0.3, 0.72, 0.97, 'Mory'],
              [0.76, 0, 0.97, 0.9, 'antenne qui clignote'],
            ],
            free: [[0.34, 0, 0.7, 0.3, 'ciel']],
            mouths: [[0.66, 0.4]],
          },
          sfx: [{ text: 'BIP BIP BIP', x: 0.15, y: 0.9, size: 18, rot: -6, color: '#22d3ee' }],
          bubbles: [{ type: 'parole', text: 'Pic d’énergie. Il se prépare.', x: 0.35, y: 0.15, w: 0.5, who: 0 }],
          sound: 'sparkle',
        },
        {
          action: 'Gros plan sur Mory, les lunettes reflétant une courbe qui monte, penché derrière l’écran du vieux PC portable (au premier plan à gauche) ; Kaï, minuscule, au fond près du réservoir. La nuit tombe sur Kaloum.',
          bg: { id: 'toit', time: 'nuit', horizon: 0.5, roofY: 0.98 },
          chars: [{ id: 'mory', expr: 'reflexion', shot: 'buste', x: 0.36, y: 0.46, fill: 0.5, turn: 0.25 }],
          fx: [{ type: 'lueur', x: 0.7, y: 0.75, color: '#22d3ee', size: 0.2, opacity: 0.45 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.4, 0.2, 0.6, 0.6, 'visage de Mory'], [0.5, 0.72, 0.68, 0.95, 'main sur le clavier']],
            free: [[0.19, 0, 0.33, 0.3, 'ciel (gauche)']],
            mouths: [[0.5, 0.52]],
          },
          bubbles: [{ type: 'parole', text: 'Ce soir. Vers 21 heures.', x: 0.15, y: 0.15, w: 0.3, who: 0 }],
        },
        {
          action: 'Kaï (casque autour du cou, sweat violet) debout au bord du toit, de profil, la ville de nuit devant lui (lumières de Conakry, la mer sombre à l’horizon) : il regarde sa main droite bandée, levée devant lui. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'toit', time: 'nuit', horizon: 0.55, roofY: 0.92 },
          chars: [{ id: 'kai', pose: 'debout', shot: 'pied', x: 0.6, y: 0.94, fill: 0.72 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.57, 0.07, 0.76, 0.98, 'Kaï au bord du toit'], [0.55, 0.32, 0.62, 0.45, 'main bandée']],
            free: [[0, 0, 0.5, 0.35, 'ciel de nuit']],
            mouths: [[0.64, 0.27]],
          },
          bubbles: [{ type: 'pensee', text: 'Avec cette main… je pourrai pas frapper pareil.', x: 0.25, y: 0.17, w: 0.45, who: 0 }],
        },
        {
          action: 'Mory (à droite, souriant, lunettes cyan) rejoint Kaï (à gauche, souriant) au bord du toit : les deux de trois quarts dos, accoudés au muret, face à la ville de nuit ; la main bandée de Kaï sur le muret ; la grande antenne tout à droite. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'toit', time: 'nuit', horizon: 0.55, roofY: 0.92 },
          chars: [
            { id: 'kai', pose: 'dos', shot: 'pied', x: 0.38, y: 0.95, fill: 0.62 },
            { id: 'mory', pose: 'dos', shot: 'pied', x: 0.62, y: 0.95, fill: 0.6 },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.25, 0.18, 0.42, 0.5, 'visage de Kaï'], [0.6, 0.22, 0.78, 0.5, 'visage de Mory']],
            free: [[0, 0, 1, 0.15, 'ciel']],
            mouths: [[0.36, 0.35], [0.68, 0.32]],
          },
          bubbles: [
            { type: 'parole', text: 'Moi, je trouve OÙ. Toi, tu trouves QUAND.', x: 0.9, y: 0.3, w: 0.2, size: 16, who: 1 },
            { type: 'parole', text: '… Deal.', x: 0.12, y: 0.52, w: 0.2, who: 0 },
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
          action: 'Une moto-taxi rouge file dans la nuit, vue de côté (20 h 52, Route du Prince) : le conducteur (casque, gilet orange) devant, Kaï (téléphone lumineux dans la main gauche) au milieu, Mory (sac à dos noir, petite antenne) derrière ; lampadaires orange, taxis jaunes, boutiques néon ; lignes de vitesse. Bande de ciel bleu en haut de l’image.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'conducteur', pose: 'debout', shot: 'pied', x: 0.42, y: 0.9, fill: 0.5 },
            { id: 'kai', pose: 'debout', shot: 'pied', x: 0.52, y: 0.9, fill: 0.5 },
            { id: 'mory', pose: 'debout', shot: 'pied', x: 0.62, y: 0.9, fill: 0.48 },
          ],
          fx: [{ type: 'vitesse', angle: 0, n: 26, opacity: 0.35, color: '#ffcf7a' }],
          illus: {
            focus: [0.5, 0.55],
            keep: [
              [0.3, 0.2, 0.78, 0.9, 'la moto avec les trois passagers'],
              [0.57, 0.24, 0.65, 0.42, 'visage du conducteur'],
              [0.44, 0.22, 0.52, 0.4, 'visage de Kaï'],
              [0.34, 0.2, 0.43, 0.37, 'visage de Mory'],
            ],
            free: [[0, 0, 1, 0.12, 'bandeau de ciel']],
          },
          captions: [{ text: '20 h 52. Route du Prince.', x: 0.03, y: 0.05, w: 0.3, style: 'noir' }],
          sound: 'swipe',
        },
        {
          action: 'Vue de côté en gros plan, les trois sur la moto en pleine vitesse : le conducteur (casque, gilet orange) devant, Kaï au milieu (téléphone allumé dans la main gauche, main droite bandée posée sur le gilet), Mory derrière, penché à l’oreille de Kaï pour lui parler. Fond flou, lampadaires orange. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'aplat', color: '#3a2a4a', color2: '#120c1e' },
          chars: [
            { id: 'kai', expr: 'concentration', shot: 'buste', x: 0.32, y: 0.5, fill: 0.48 },
            { id: 'mory', expr: 'neutre', shot: 'buste', x: 0.72, y: 0.42, fill: 0.46 },
          ],
          illus: {
            focus: [0.55, 0.5],
            keep: [
              [0.4, 0.2, 0.53, 0.36, 'visage de Mory'],
              [0.53, 0.18, 0.65, 0.4, 'visage de Kaï'],
              [0.64, 0.45, 0.74, 0.72, 'téléphone et main bandée'],
            ],
            free: [[0.25, 0, 0.55, 0.12, 'ciel flou'], [0.1, 0.5, 0.3, 0.9, 'route (gauche)']],
            mouths: [[0.62, 0.35], [0.485, 0.3]],
          },
          bubbles: [
            { type: 'parole', text: 'T’as ton chrono ?', x: 0.25, y: 0.12, w: 0.4, who: 1 },
            { type: 'parole', text: 'Toujours.', x: 0.75, y: 0.12, w: 0.3, who: 0 },
          ],
        },
        {
          action: 'Vue de dos : devant la moto, les feux tricolores clignotent en violet ; les trois passagers de dos (Mory et son sac à dos gris, Kaï, le conducteur qui se retourne, bouche ouverte, effrayé) ; feux arrière de voitures arrêtées à droite. Nuit, lampadaires orange.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'conducteur', pose: 'choc', shot: 'americain', x: 0.62, y: 0.4, fill: 0.62 }],
          fx: [{ type: 'lueur', x: 0.25, y: 0.25, color: '#7c3aed', size: 0.2, opacity: 0.6 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [
              [0.57, 0.25, 0.68, 0.42, 'visage du conducteur'],
              [0.33, 0.28, 0.68, 0.85, 'les trois passagers de dos'],
              [0.62, 0.1, 0.7, 0.25, 'feu violet'],
              [0.8, 0.28, 0.84, 0.42, 'feu violet'],
            ],
            free: [[0.255, 0, 0.6, 0.15, 'ciel flou']],
            mouths: [[0.62, 0.37]],
          },
          bubbles: [{ type: 'cri', text: 'Wallahi, c’est quoi ça ?!', x: 0.3, y: 0.1, w: 0.55, size: 17, who: 0 }],
        },
        {
          action: 'Le conducteur (gilet orange), assis sur sa moto à gauche, se prend la tête à deux mains, terrifié ; Kaï (au centre, de dos, téléphone allumé dans la main gauche) et Mory (à droite, tablette sous le bras, petite antenne) ont sauté de la moto et font face au rond-point de Hamdallaye : les panneaux de direction vides, des étincelles violettes, un lampadaire au centre. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'saut', shot: 'pied', x: 0.32, y: 0.95, fill: 0.62 },
            { id: 'mory', pose: 'course', shot: 'pied', x: 0.62, y: 0.96, fill: 0.58 },
          ],
          fx: [{ type: 'lueur', x: 0.5, y: 0.45, color: '#7c3aed', size: 0.3, opacity: 0.4, layer: 'back' }],
          illus: {
            focus: [0.5, 0.5],
            keep: [
              [0.4, 0.45, 0.62, 1, 'Kaï de dos'],
              [0.66, 0.38, 0.88, 1, 'Mory'],
              [0.17, 0.38, 0.28, 0.58, 'visage du conducteur'],
            ],
            free: [[0.36, 0, 0.66, 0.1, 'ciel']],
          },
          captions: [{ text: 'Rond-point de Hamdallaye.', x: 0.36, y: 0.03, w: 0.3, style: 'noir' }],
        },
      ],
    },
    // ============================================================ PAGE 8 — L'attaque
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [
        { h: 0.24, cols: [1], tilt: 20 },
        { h: 0.42, cols: [1], tilt: -28 },
        { h: 0.34, cols: [0.4, 0.4, 0.2], ctilt: [18, -18] },
      ],
      panels: [
        {
          action: 'Plan large, en plongée, du rond-point de Hamdallaye la nuit (21 h) : six routes qui se croisent, l’îlot central surélevé avec son lampadaire orange, des palmiers, les voitures et taxis jaunes arrêtés qui klaxonnent (petits traits « klaxon »), les feux tricolores violets, les panneaux de direction vides. Kaï et Mory, petits, de dos au premier plan sur la butte en bas.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.12 }],
          illus: {
            focus: [0.5, 0.65],
            keep: [[0.44, 0.72, 0.56, 0.96, 'Kaï et Mory'], [0.36, 0.42, 0.66, 0.65, 'îlot central']],
            free: [[0, 0.3, 0.2, 0.5, 'immeubles (gauche)']],
          },
          sfx: [{ text: 'TUUT ! TUUUT !', x: 0.2, y: 0.3, size: 26, rot: -8, color: '#ffd23f' }],
          sound: 'boss',
        },
        {
          action: 'GRANDE CASE. L’Oubli surgit au-dessus de l’îlot central : silhouette encapuchonnée immense, yeux dorés, contour violet, tentacules d’ombre, le ciel fissuré derrière lui ; tout le rond-point vire au violet. Kaï (de dos, main droite bandée ouverte) et Mory (de dos, sac à dos) au premier plan, face à lui.',
          bg: { id: 'oubli' },
          chars: [{ id: 'oubli', pose: 'flotte', shot: 'taille', x: 0.55, y: 0.04, fill: 0.95, seed: 4 }],
          fx: [{ type: 'concentration', x: 0.55, y: 0.35, n: 60, opacity: 0.35, color: '#7c3aed' }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.38, 0.03, 0.65, 0.55, 'l’Oubli'], [0.33, 0.55, 0.52, 1, 'Kaï de dos'], [0.55, 0.6, 0.74, 1, 'Mory de dos']],
            free: [[0.05, 0.7, 0.3, 0.95, 'rue (gauche)']],
          },
          sfx: [{ text: 'KRRRAAACK !', x: 0.17, y: 0.86, size: 36, rot: -10, color: '#c084fc' }],
          sound: 'boss',
        },
        {
          action: 'Panique : les conducteurs abandonnent leurs voitures et s’enfuient, portières de taxis ouvertes ; une mère en pagne coloré serre son bébé, un homme court en tendant le bras, un autre se tient la tête. Au centre, un tentacule de l’Oubli écrase le capot d’une voiture ; l’Oubli plane au-dessus, lueur violette. Nuit.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'chauffeur', pose: 'course', shot: 'pied', x: 0.3, y: 0.95, fill: 0.55 },
            { id: 'passante', pose: 'course', shot: 'pied', x: 0.7, y: 0.95, fill: 0.5, flip: true },
          ],
          illus: {
            focus: [0.62, 0.5],
            keep: [
              [0.45, 0.05, 0.62, 0.55, 'l’Oubli'],
              [0.54, 0.5, 0.66, 0.9, 'mère et bébé'],
              [0.68, 0.45, 0.8, 0.75, 'homme qui se tient la tête'],
            ],
            free: [[0.44, 0.8, 0.8, 0.97, 'route']],
          },
          bubbles: [{ type: 'cri', text: 'COUREZ !!', x: 0.8, y: 0.86, w: 0.3, size: 13, tail: [0.45, 0.6] }],
        },
        {
          action: 'Kaï (à gauche, de trois quarts, casque autour du cou) lance le chronomètre de son téléphone (main gauche) en regardant l’Oubli ; Mory (à droite, tablette allumée, sac à dos) se tient près de lui ; au centre, l’Oubli lance une vague : un grand anneau violet autour de lui. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0d0718' },
          chars: [{ id: 'kai', expr: 'concentration', shot: 'buste', x: 0.5, y: 0.48, fill: 0.48, light: '#7c3aed' }],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.15 }],
          illus: {
            focus: [0.43, 0.5],
            keep: [
              [0.27, 0.27, 0.4, 0.45, 'visage de Kaï'],
              [0.3, 0.6, 0.42, 0.75, 'téléphone'],
              [0.42, 0.1, 0.58, 0.55, 'l’Oubli et sa vague'],
            ],
            free: [[0.43, 0.7, 0.61, 0.95, 'rue (droite)']],
            mouths: [[0.34, 0.4]],
          },
          sfx: [{ text: 'VMMMM', x: 0.15, y: 0.1, size: 22, rot: -6, color: '#c084fc' }],
          bubbles: [{ type: 'parole', text: 'Première vague.', x: 0.78, y: 0.85, w: 0.4, who: 0, size: 16 }],
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
      rows: [
        { h: 0.3, cols: [1], tilt: -24 },
        { h: 0.34, cols: [0.55, 0.45], ctilt: [20] },
        { h: 0.36, cols: [0.45, 0.55], ctilt: [-20] },
      ],
      panels: [
        {
          action: 'Les vagues s’accélèrent : plusieurs anneaux violets de plus en plus rapprochés autour de l’Oubli, au-dessus de l’îlot central ; des voitures percutées dans le rond-point. Kaï, de dos au premier plan à gauche, tient son téléphone (chronomètre) dans la main gauche. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.6 },
          chars: [{ id: 'oubli', pose: 'flotte', shot: 'pied', x: 0.66, y: 0.9, fill: 0.8, seed: 11 }],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.18 }, { type: 'glitch', n: 10 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [
              [0.18, 0.17, 0.34, 0.45, 'tête de Kaï'],
              [0.43, 0.1, 0.65, 0.55, 'l’Oubli et ses anneaux'],
              [0.33, 0.52, 0.42, 0.7, 'téléphone'],
            ],
            free: [[0.75, 0.1, 0.97, 0.5, 'immeubles (droite)']],
          },
          sfx: [{ text: 'VMM… VM', x: 0.12, y: 0.75, size: 26, rot: -6, color: '#c084fc' }],
          bubbles: [{ type: 'pensee', text: 'Puis trois… puis une et demie…', x: 0.86, y: 0.3, w: 0.26, tail: false }],
        },
        {
          action: 'Kaï (à gauche, casque autour du cou, téléphone avec le chronomètre dans la main droite bandée) et Mory (à droite, lunettes cyan, tablette sous le bras, petite antenne dans le dos) côte à côte sur la butte, face à face, sérieux ; derrière eux le rond-point dans une lueur violette, un halo violet au-dessus du lampadaire. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'kai', expr: 'concentration', shot: 'buste', x: 0.28, y: 0.44, fill: 0.5, turn: 0.2 },
            { id: 'mory', expr: 'reflexion', shot: 'buste', x: 0.74, y: 0.46, fill: 0.5, turn: -0.2 },
          ],
          illus: {
            focus: [0.5, 0.5],
            keep: [
              [0.27, 0.18, 0.43, 0.52, 'visage de Kaï'],
              [0.58, 0.15, 0.73, 0.52, 'visage de Mory'],
              [0.41, 0.62, 0.5, 0.82, 'téléphone'],
            ],
            free: [[0.43, 0, 0.58, 0.4, 'ciel violet']],
            mouths: [[0.4, 0.42], [0.6, 0.4]],
          },
          bubbles: [
            { type: 'parole', text: 'Même raison qu’à Madina. Un demi.', x: 0.28, y: 0.09, w: 0.36, who: 0, size: 15 },
            { type: 'parole', text: 'Alors ?', x: 0.8, y: 0.11, w: 0.22, who: 1, size: 16 },
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
          action: 'Kaï, tendu, de profil au premier plan à droite (sueur, casque autour du cou), regarde l’immense rond-point en contrebas : six routes, voitures abandonnées portières ouvertes, l’îlot central et, au bout du lampadaire, le noyau de l’Oubli qui luit en violet. Il tient son téléphone (main bandée). Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'kai', expr: 'surprise', shot: 'buste', x: 0.3, y: 0.42, fill: 0.56, turn: 0.25 }],
          illus: {
            focus: [0.6, 0.5],
            keep: [
              [0.6, 0.2, 0.76, 0.52, 'visage de Kaï'],
              [0.5, 0.7, 0.63, 0.9, 'téléphone'],
              [0.44, 0.03, 0.56, 0.2, 'noyau violet au bout du lampadaire'],
            ],
            free: [[0.37, 0.5, 0.64, 0.7, 'rond-point (voitures)']],
            mouths: [[0.64, 0.45]],
          },
          bubbles: [
            {
              type: 'cri',
              text: 'Douze secondes ! Mais où ? Le rond-point est immense !',
              x: 0.25,
              y: 0.5,
              w: 0.38,
              size: 15,
              who: 0,
            },
          ],
        },
        {
          action: 'Mory (à droite, de profil, verres cyan lumineux, sac à dos et antenne) pointe du doigt le centre du rond-point (l’îlot central, son lampadaire et le noyau violet) ; Kaï (à gauche, inquiet, téléphone à la main) se retourne vers lui. Nuit, lueur violette.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.7 },
          chars: [{ id: 'mory', pose: 'pointer', shot: 'americain', x: 0.3, y: 0.4, fill: 0.62 }],
          illus: {
            focus: [0.455, 0.5],
            keep: [
              [0.18, 0.25, 0.3, 0.5, 'visage de Kaï'],
              [0.62, 0.2, 0.74, 0.5, 'visage de Mory'],
              [0.49, 0.43, 0.6, 0.57, 'doigt tendu'],
            ],
            free: [[0.28, 0.55, 0.63, 0.78, 'rond-point (route)']],
            mouths: [[0.67, 0.46]],
          },
          bubbles: [
            {
              type: 'parole',
              text: 'Là où il a le plus mangé. Le centre. Le nœud. Le sommet de tous les sommets.',
              x: 0.5,
              y: 0.7,
              w: 0.6,
              size: 15,
              who: 0,
            },
          ],
        },
      ],
    },
    // ============================================================ PAGE 10 — La course
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [
        { h: 0.28, cols: [0.5, 0.5], ctilt: [22] },
        { h: 0.3, cols: [1], tilt: -26 },
        { h: 0.42, cols: [0.5, 0.5], ctilt: [-22] },
      ],
      panels: [
        {
          action: 'Kaï s’élance en courant entre deux voitures arrêtées aux portières ouvertes et aux phares allumés, téléphone lumineux dans la main gauche, main droite bandée ; poussière sous ses pieds ; au loin, l’îlot central et le noyau violet. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'course', shot: 'pied', x: 0.5, y: 0.95, fill: 0.7, blur: -60 }],
          fx: [{ type: 'vitesse', angle: 0, n: 18, opacity: 0.35 }],
          illus: {
            focus: [0.55, 0.5],
            keep: [[0.34, 0.28, 0.7, 0.96, 'Kaï qui court'], [0.55, 0.3, 0.66, 0.48, 'visage de Kaï']],
            free: [[0.21, 0, 0.45, 0.3, 'ciel (gauche)']],
            mouths: [[0.6, 0.44]],
          },
          bubbles: [{ type: 'parole', text: 'Cinq…', x: 0.16, y: 0.15, w: 0.26, who: 0 }],
          sound: 'swipe',
        },
        {
          action: 'Kaï glisse en parkour sur le capot d’une voiture blanche au premier plan (téléphone dans la main gauche, main droite bandée levée) pendant qu’un tentacule de l’Oubli écrase le capot d’un taxi jaune derrière lui : éclats de verre, étincelles violettes. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'plongeon', shot: 'pied', x: 0.6, y: 0.75, fill: 0.5 }],
          fx: [{ type: 'impact', x: 0.18, y: 0.78, size: 0.3 }],
          illus: {
            focus: [0.47, 0.5],
            keep: [
              [0.15, 0.1, 0.65, 0.8, 'Kaï qui glisse sur le capot'],
              [0.55, 0.5, 0.75, 0.65, 'impact sur le taxi'],
              [0.5, 0.2, 0.75, 0.5, 'tentacule'],
            ],
            free: [[0.72, 0, 0.8, 0.3, 'ciel (droite)']],
            mouths: [[0.27, 0.22]],
          },
          sfx: [{ text: 'KRAAANG !', x: 0.6, y: 0.88, size: 26, rot: 8, color: '#ff5a3d' }],
          bubbles: [{ type: 'parole', text: 'Sept…', x: 0.88, y: 0.1, w: 0.24, who: 0 }],
          sound: 'hit',
        },
        {
          action: 'Mory, sur le trottoir devant un panneau de direction, crie ses indications en tendant le bras gauche vers la gauche ; dans l’autre main, sa petite antenne portable qui crépite (étincelles cyan). Le rond-point flou derrière lui, le noyau violet au loin. Nuit.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.8 },
          chars: [{ id: 'mory', pose: 'pointer', shot: 'americain', x: 0.3, y: 0.24, fill: 0.72 }],
          fx: [{ type: 'lueur', x: 0.15, y: 0.6, color: '#22d3ee', size: 0.12, opacity: 0.6 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [
              [0.48, 0.08, 0.78, 0.95, 'Mory'],
              [0.53, 0.18, 0.63, 0.4, 'visage de Mory'],
              [0.28, 0.33, 0.55, 0.42, 'bras tendu'],
            ],
            free: [[0.78, 0.1, 0.99, 0.7, 'rond-point (droite)']],
            mouths: [[0.58, 0.36]],
          },
          bubbles: [{ type: 'cri', text: 'À gauche ! Derrière le taxi !', x: 0.88, y: 0.4, w: 0.22, size: 20, who: 0 }],
        },
        {
          action: 'Kaï se baisse derrière un taxi jaune (une main à terre, main droite bandée), son téléphone allumé dans l’autre main ; un long tentacule noir passe au-dessus du taxi et traverse l’image, le noyau violet à son extrémité. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'genou', shot: 'pied', x: 0.5, y: 0.95, fill: 0.5 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [
              [0.33, 0.43, 0.66, 0.97, 'Kaï baissé derrière le taxi'],
              [0.54, 0.45, 0.62, 0.6, 'visage de Kaï'],
              [0.3, 0.2, 0.75, 0.45, 'tentacule au-dessus'],
            ],
            free: [[0.55, 0, 0.71, 0.2, 'ciel']],
            mouths: [[0.58, 0.52]],
          },
          bubbles: [{ type: 'parole', text: 'Neuf… dix…', x: 0.8, y: 0.1, w: 0.38, who: 0 }],
        },
        {
          action: 'Kaï grimpe sur l’îlot central du rond-point, au pied du lampadaire, un genou fléchi, le téléphone lumineux dans la main gauche, l’autre main bandée posée sur l’herbe sèche ; au-dessus de lui, l’Oubli (yeux multiples, tentacules) et un faisceau violet. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.6, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'saut', shot: 'pied', x: 0.55, y: 0.92, fill: 0.62 }],
          fx: [{ type: 'lueur', x: 0.5, y: 0.1, color: '#7c3aed', size: 0.3, opacity: 0.5, layer: 'back' }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.3, 0.3, 0.66, 0.97, 'Kaï qui grimpe sur l’îlot'], [0.52, 0.32, 0.6, 0.45, 'visage de Kaï']],
            free: [[0.58, 0.8, 0.71, 0.97, 'rond-point (bas droite)']],
            mouths: [[0.56, 0.4]],
          },
          bubbles: [{ type: 'parole', text: 'Onze…', x: 0.85, y: 0.88, w: 0.3, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 11 — Le coup
    {
      gutter: 'noir',
      ambient: 'nuit',
      rows: [
        { h: 0.22, cols: [1], tilt: 20 },
        { h: 0.24, cols: [0.5, 0.5], ctilt: [-22] },
        { h: 0.34, cols: [1], tilt: 26 },
        { h: 0.2, cols: [1] },
      ],
      panels: [
        {
          action: 'L’Oubli se contracte : ses tentacules sont aspirés vers le centre, et en se condensant il devient solide et lourd (règle 5) ; son noyau de verre violet translucide tombe et s’arrête à hauteur de poitrine au-dessus de l’îlot central. Kaï, debout sur la butte au premier plan, téléphone dans la main gauche, le regarde. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'flash', color: '#1a0b2e', lines: '#c4b5fd', cx: 0.6, cy: 0.5 },
          chars: [{ id: 'oubli', pose: 'flotte', shot: 'pied', x: 0.62, y: 0.95, fill: 0.85, seed: 3 }],
          fx: [{ type: 'lueur', x: 0.62, y: 0.55, color: '#c084fc', size: 0.22, opacity: 0.8 }],
          illus: {
            focus: [0.5, 0.6],
            keep: [
              [0.42, 0.4, 0.6, 0.9, 'Kaï sur la butte'],
              [0.3, 0.3, 0.62, 0.55, 'l’Oubli qui se contracte'],
              [0.52, 0.42, 0.64, 0.6, 'noyau de verre violet'],
            ],
            free: [[0, 0.5, 0.25, 0.9, 'toits (gauche)']],
          },
          sound: 'boss',
        },
        {
          action: 'Gros plan sur la main droite bandée de Kaï (bandage blanc, tache de sang aux jointures), qui tremble, le poing serré ; derrière, flou, le noyau de verre violet. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'aplat', color: '#2a1f55', color2: '#0d0718' },
          chars: [{ id: 'poing', of: 'kai', x: 0.5, y: 0.66, size: 0.56 }],
          fx: [{ type: 'vitesse', angle: 90, n: 10, opacity: 0.25, color: '#c4b5fd' }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.52, 0.18, 0.78, 0.95, 'main bandée qui tremble'], [0.25, 0.18, 0.48, 0.65, 'noyau flou']],
            free: [[0.1, 0.65, 0.45, 0.95, 'flou (bas gauche)']],
          },
          bubbles: [{ type: 'pensee', text: 'Pas avec cette main…', x: 0.25, y: 0.84, w: 0.4, tail: [0.62, 0.7] }],
        },
        {
          action: 'Kaï, sur la butte, pivote sur son pied droit et lève la jambe gauche (préparation du coup de pied retourné), le téléphone dans la main gauche, la main droite bandée serrée ; des tentacules d’ombre filent derrière lui ; à droite, le noyau de verre violet. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'flash', color: '#1a0b2e', lines: '#8b5cf6', cx: 0.5, cy: 0.5 },
          chars: [{ id: 'kai', pose: 'coup_de_pied', shot: 'pied', x: 0.5, y: 0.95, fill: 0.8 }],
          fx: [{ type: 'vitesse', angle: 0, n: 16, opacity: 0.3, color: '#c4b5fd' }],
          illus: {
            focus: [0.52, 0.5],
            keep: [
              [0.25, 0.13, 0.52, 0.97, 'Kaï qui pivote'],
              [0.27, 0.15, 0.36, 0.3, 'visage de Kaï'],
              [0.67, 0.35, 0.84, 0.7, 'noyau'],
            ],
            free: [[0.7, 0, 0.95, 0.3, 'ciel (droite)']],
            mouths: [[0.31, 0.24]],
          },
          sfx: [{ text: 'SWISH', x: 0.75, y: 0.12, size: 26, rot: -10, color: '#c4b5fd' }],
          sound: 'swipe',
        },
        {
          action: 'PLEINE LARGEUR, MOMENT FORT. Coup de pied retourné de la jambe GAUCHE : le talon gauche de Kaï percute le noyau de verre violet, qui se fissure dans tous les sens (éclat blanc à l’impact, éclats de verre) ; son visage est crispé, le téléphone dans la main droite. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'flash', color: '#fff3f8', lines: '#7c3aed', cx: 0.62, cy: 0.45 },
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
            keep: [
              [0.12, 0.25, 0.22, 0.42, 'visage crispé de Kaï'],
              [0.35, 0.35, 0.68, 0.55, 'jambe gauche et talon'],
              [0.67, 0.33, 0.84, 0.72, 'noyau qui se fissure'],
            ],
            free: [[0, 0, 0.3, 0.2, 'ciel']],
            mouths: [null, [0.17, 0.36]],
          },
          bubbles: [{ type: 'cri', text: 'DOUZE !!!', x: 0.14, y: 0.1, w: 0.24, size: 26, tail: [0.17, 0.36] }],
          sfx: [{ text: 'KRAAAK !', x: 0.8, y: 0.9, size: 50, rot: -9, color: '#c084fc' }],
          sound: 'hit',
        },
        {
          action: 'Le noyau éclate en milliers de pixels violets et d’éclats de verre qui retombent sur le rond-point ; ce qui reste de l’Oubli, en lambeaux, s’enfuit vers le ciel ; les feux tricolores repassent au vert, les panneaux se rallument (flèches). Kaï, essoufflé, court au premier plan sur la butte. Nuit.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.75, vp: 0.5 },
          chars: [{ id: 'oubli', pose: 'recul', shot: 'pied', x: 0.6, y: 0.6, fill: 0.45, seed: 11 }],
          fx: [{ type: 'glitch', n: 26 }, { type: 'lueur', x: 0.15, y: 0.4, color: '#22c55e', size: 0.12, opacity: 0.7 }],
          illus: {
            focus: [0.55, 0.37],
            keep: [[0.38, 0.1, 0.62, 0.4, 'noyau qui éclate'], [0.48, 0.5, 0.58, 0.62, 'tête de Kaï']],
            free: [[0.75, 0.3, 0.97, 0.6, 'immeubles (droite)']],
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
      rows: [
        { h: 0.3, cols: [1], tilt: -24 },
        { h: 0.34, cols: [0.5, 0.5], ctilt: [22] },
        { h: 0.36, cols: [0.42, 0.58], ctilt: [-22] },
      ],
      panels: [
        {
          action: 'Plan large du rond-point, en plongée : les voitures et taxis redémarrent (phares), les panneaux de direction se remplissent, une poussière de pixels brille encore au-dessus de l’îlot. Kaï est assis sur le bord de l’îlot central, épuisé. Mory traverse entre les voitures pour le rejoindre. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'au_sol', shot: 'pied', x: 0.48, y: 0.78, fill: 0.3 },
            { id: 'mory', pose: 'marche', shot: 'pied', x: 0.72, y: 0.95, fill: 0.5, flip: true },
          ],
          illus: {
            focus: [0.5, 0.55],
            keep: [[0.45, 0.47, 0.53, 0.65, 'Kaï assis sur l’îlot'], [0.55, 0.48, 0.64, 0.78, 'Mory qui traverse']],
            free: [[0, 0.2, 0.3, 0.5, 'immeubles (gauche)']],
          },
        },
        {
          action: 'Mory (à droite, penché, souriant, petite antenne qui dépasse de son sac) tend la main à Kaï, assis sur le bord de l’îlot (sweat poussiéreux, main droite bandée, qui lui sourit) ; lampadaire et brume orange derrière eux. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'mory', pose: 'main_tendue', shot: 'americain', x: 0.55, y: 0.36, fill: 0.62 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [
              [0.32, 0.22, 0.45, 0.42, 'visage de Kaï'],
              [0.5, 0.07, 0.66, 0.3, 'visage de Mory'],
              [0.5, 0.42, 0.6, 0.55, 'main tendue'],
            ],
            free: [[0.23, 0, 0.48, 0.2, 'ciel (gauche)']],
            mouths: [[0.57, 0.28]],
          },
          bubbles: [
            {
              type: 'parole',
              text: 'Je suis pas un combattant. Je suis le gars qui sait OÙ frapper.',
              x: 0.25,
              y: 0.64,
              w: 0.45,
              size: 14,
              who: 0,
            },
          ],
        },
        {
          action: 'Gros plan sur la poignée de main : la main droite bandée de Kaï (bandage blanc) serrée dans celle de Mory (manche bleu nuit à lignes cyan), au centre ; de part et d’autre, les deux visages souriants en amorce ; quelques pixels violets flottent ; le lampadaire et le rond-point flous derrière. Nuit. Kaï : sweat violet propre, casque autour du cou, main droite bandée (bandage blanc), petite croûte au coin de la lèvre.',
          bg: { id: 'aplat', color: '#283672', color2: '#050817' },
          chars: [{ id: 'poing', of: 'kai', x: 0.5, y: 0.62, size: 0.6 }],
          illus: {
            focus: [0.5, 0.5],
            keep: [[0.37, 0.32, 0.65, 0.8, 'poignée de main']],
            free: [[0.3, 0, 0.7, 0.28, 'fond flou (haut)']],
          },
          bubbles: [{ type: 'parole', text: 'Et moi, QUAND.', x: 0.5, y: 0.15, w: 0.6, tail: [0.02, 0.2] }],
        },
        {
          action: '[ÉCRAN APPLI] Le téléphone de Kaï s’allume : message du Créateur.',
          bg: { id: 'ecran', text: '2 sur 8. Bien joué.', from: 'LE CRÉATEUR', clock: '21:01' },
          sound: 'bubble',
        },
        {
          action: 'Mory, au centre, tient dans une main sa petite antenne portable qui clignote fort (ondes cyan) et dans l’autre sa tablette qui affiche un pic énorme ; lunettes aux verres cyan, sac à dos avec antenne ; il regarde au loin, inquiet. Kaï, de dos en amorce à gauche (nuque et sweat violet poussiéreux, casque autour du cou). Nuit, lampadaire et brume orange.',
          bg: { id: 'rue', time: 'nuit', horizon: 0.5, vp: 0.3 },
          chars: [{ id: 'mory', expr: 'concentration', shot: 'buste', x: 0.62, y: 0.4, fill: 0.5, turn: -0.25 }],
          fx: [{ type: 'lueur', x: 0.25, y: 0.75, color: '#22d3ee', size: 0.2, opacity: 0.6 }],
          illus: {
            focus: [0.58, 0.5],
            keep: [
              [0.6, 0.28, 0.76, 0.52, 'visage de Mory (lunettes)'],
              [0.49, 0.33, 0.59, 0.58, 'petite antenne qui clignote'],
              [0.64, 0.68, 0.86, 0.9, 'tablette avec le pic'],
            ],
            free: [[0.28, 0, 0.58, 0.28, 'ciel (gauche)']],
            mouths: [[0.67, 0.5]],
          },
          bubbles: [
            {
              type: 'parole',
              text: 'Attends… Un pic énorme. Demain matin… là où on garde les livres.',
              x: 0.34,
              y: 0.15,
              w: 0.55,
              size: 15,
              who: 0,
            },
          ],
          captions: [{ text: 'À suivre…', x: 0.02, y: 0.9, style: 'noir' }],
        },
      ],
    },
  ],
};
