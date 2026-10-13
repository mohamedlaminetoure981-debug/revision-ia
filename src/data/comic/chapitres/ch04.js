// =====================================================================
// CHAPITRE 4 — « Éclair sur la corniche »  (Sora) — VERSION 2 : 12 pages, 60 cases
// ---------------------------------------------------------------------
// Script de référence (et bible de continuité : corniche à l'aube, main
// droite bandée de Kaï qui frappe de la GAUCHE, Sora, Fatou, règles de
// l'Oubli de l'aube, courbe de l'oubli et répétition espacée) :
// docs/scenario-ch04-v2.md
//
// Format : voir l'en-tête de ch01.js et le README (section "Mode Histoire en BD").
// Nouveautés de ce chapitre :
//   bg 'croquis' : `curves` (plusieurs morceaux de courbe : dents de scie, page 8).
//   Figurante    : fatou (src/data/comic/looks.js).
// Illustrations : public/story/chapitre-4/page-P-case-C.png ou .jpg (16:9, 56 images ;
// 4 cases dessinées par l'appli : pages 4-2, 7-1, 8-1 et 12-5). Tant qu'une image
// manque, l'appli dessine la case (décor de la corniche + personnages).
// Chaque `action` est la description envoyée à l'outil d'illustration
// (npm run generer) : positions À GAUCHE / À DROITE DE L'IMAGE, regards, mains,
// décor toujours dans la même orientation (route à gauche, mer à droite).
// Repères `illus` (focus, keep, free, mouths) : à ajouter avec chaque image
// (npm run bulles -- 4, puis npm run verifier-bulles -- 4).
// =====================================================================

// Bible : personnages (rappelés dans chaque case où ils apparaissent)
const KAI = 'Kaï : sweat violet à cordons blancs, casque noir autour du cou (jamais sur les oreilles), jogging noir, baskets blanches, petit sac à dos gris foncé sur l’épaule droite ; sa main DROITE est bandée (gaze blanche), sa main GAUCHE est nue ; vêtements secs.';
const MORY = 'Mory : afro noir volumineux à reflets sarcelle, lunettes rectangulaires aux verres transparents légèrement teintés cyan (les deux yeux bien visibles), veste marine à col montant avec lignes cyan lumineuses, cargo gris foncé, baskets noir et cyan, sac à dos noir avec sa petite antenne, tablette noire.';
const NIA = 'Nia (voir sa fiche) : longues tresses perlées or et rose, créoles dorées, long gilet prune sur un haut rose, pantalon noir, baskets grises ; calme.';
const SORA = 'Sora (voir sa fiche « Référence Sora ») : jeune femme noire d’environ 20 ans au visage ADULTE (pas une enfant ni une ado), peau brun foncé, deux gros chignons afro bouclés en haut de la tête, barrettes en étoile vert fluo, sweat à capuche vert olive foncé à cordons et bandes vert fluo (poignets et bas), cargo kaki, baskets olive ; un paquet de fiches bristol blanches tenu par un élastique dans la poche du sweat.';
const FATOU = 'Fatou : étudiante en médecine d’environ 20 ans, peau brun foncé, tresses relevées en chignon, gilet beige, pantalon gris, sac à dos bordeaux, écouteurs blancs.';
const ADULTES = 'Tous les personnages sont de jeunes adultes d’environ 20 ans (visages et corps d’adultes).';
// Bible : décor (même orientation dans toutes les cases)
const CORNICHE = 'Décor : la corniche de Conakry à l’aube, toujours dans la même orientation : à GAUCHE de l’image, la route mouillée de rosée, les maisons basses, les palmiers et les lampadaires encore allumés ; à DROITE de l’image, le muret de béton, puis les rochers volcaniques et l’océan ; quelques bancs le long du muret. Lumière : ciel bleu nuit en haut, orange et rose à l’horizon.';
const VIOLET_LUM = 'Lueur violette de l’Oubli qui teinte la scène.';
const SOLEIL = 'Décor : la corniche de Conakry, même orientation : route, maisons basses, palmiers et lampadaires qui s’éteignent à GAUCHE de l’image ; muret, rochers et océan à DROITE. Lumière : le soleil se lève sur la mer, à droite, lumière dorée et chaude, longues ombres.';
const VERT = '#c6ff3d';
const VIOLET = '#c4b5fd';
const OR = '#ffd23f';

export default {
  id: 4,
  title: 'Éclair sur la corniche',
  pages: [
    // ============================================================ PAGE 1 — 5 h 40
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [
        { h: 0.36, cols: [1], tilt: -20 },
        { h: 0.3, cols: [0.55, 0.45], ctilt: [20] },
        { h: 0.34, cols: [0.6, 0.4], ctilt: [-18] },
      ],
      panels: [
        {
          action: `Plan large de la corniche à l’aube (5 h 40), vue dans l’axe de la route, vers le fond. Au centre de l’image, Kaï (à gauche) et Mory (à droite) courent côte à côte en s’éloignant vers le fond, vus de trois quarts dos ; Mory traîne déjà un peu. Au premier plan à gauche de l’image, Nia marche tranquillement derrière eux, un livre sous le bras, sans se presser. Personne ne regarde vers nous. Bande de ciel bleu nuit unie en haut de l’image (place des cartouches). ${CORNICHE} ${KAI} ${MORY} ${NIA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.55 },
          chars: [
            { id: 'nia', pose: 'marche', expr: 'neutre', shot: 'pied', x: 0.18, y: 0.98, fill: 0.56 },
            { id: 'kai', pose: 'course', expr: 'joie', shot: 'pied', x: 0.48, y: 0.82, fill: 0.36 },
            { id: 'mory', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.62, y: 0.8, fill: 0.33 },
          ],
          captions: [
            { text: 'Le lendemain. 5 h 40. La corniche.', x: 0.03, y: 0.05, w: 0.46, style: 'noir' },
            { text: 'L’entraînement du matin : idée de Kaï.', x: 0.03, y: 0.05, w: 0.42, style: 'noir', right: true },
          ],
          sound: 'swipe',
        },
        {
          action: `À gauche de l’image, Mory, à bout de souffle, plié en deux, les deux mains sur les genoux, sueur sur le front, lève les yeux vers Kaï. À droite de l’image, Kaï trottine sur place, tourné vers Mory (vers la gauche), le regard sur lui, sourire motivé, le poing GAUCHE serré à hauteur de poitrine, la main droite bandée le long du corps. Derrière eux : route, maisons et lampadaires allumés à gauche ; muret et mer à droite. ${CORNICHE} ${MORY} ${KAI} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'mory', pose: 'tete_mains', expr: 'surprise', shot: 'americain', x: 0.28, y: 0.3, fill: 0.66 },
            { id: 'kai', pose: 'course', expr: 'joie', shot: 'americain', x: 0.74, y: 0.14, fill: 0.76, flip: true },
          ],
          bubbles: [
            { type: 'parole', text: 'Pourquoi… on court… avant le soleil ?', x: 0.25, y: 0.12, w: 0.42, who: 0 },
            { type: 'parole', text: 'Parce que l’Oubli, lui, ne dort jamais.', x: 0.7, y: 0.86, w: 0.5, who: 1 },
          ],
        },
        {
          action: `Nia, plan taille, marche calmement le long de la route, un livre tenu sous le bras gauche, le dos droit, un petit sourire tranquille ; elle regarde de côté, vers la droite de l’image (vers Kaï et Mory, hors champ). Derrière elle : lampadaires allumés et maisons à gauche, muret et mer à droite. ${CORNICHE} ${NIA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.4 },
          chars: [{ id: 'nia', pose: 'marche', expr: 'clin', shot: 'taille', x: 0.42, y: 0.2, fill: 0.82 }],
          bubbles: [{ type: 'parole', text: 'Moi, je marche. C’est un principe.', x: 0.74, y: 0.16, w: 0.44, who: 0 }],
        },
        {
          action: `Kaï (à gauche de l’image) et Mory (à droite de l’image), vus de trois quarts dos, courent vers le fond de la corniche. Entre eux, au centre, un éclair vert fluo passe à toute vitesse vers le fond : une longue traînée lumineuse vert fluo, avec, à sa pointe, une silhouette floue en vert olive dont on ne voit pas le visage. Le souffle fait claquer leurs vêtements : le sweat de Kaï et la veste de Mory se gonflent, Mory perd l’équilibre. Ils tournent la tête vers l’éclair, surpris. Gouttes de rosée soulevées sur la route mouillée, lignes de vitesse. ${CORNICHE} ${KAI} ${MORY} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.22, y: 0.97, fill: 0.7 },
            { id: 'mory', pose: 'choc', expr: 'surprise', shot: 'pied', x: 0.8, y: 0.97, fill: 0.68, flip: true },
          ],
          fx: [{ type: 'vitesse', angle: 0, n: 30, opacity: 0.55, color: VERT, layer: 'front' }, { type: 'lueur', color: VERT, x: 0.5, y: 0.55, size: 0.22 }],
          sfx: [{ text: 'ZIP !', x: 0.5, y: 0.22, size: 64, rot: -10, color: VERT }],
          sound: 'swipe',
        },
        {
          action: `Gros plan de Kaï, sidéré : yeux écarquillés, bouche ouverte, il tourne la tête vers la droite de l’image pour suivre du regard la traînée vert fluo qui s’éloigne au fond ; ses cheveux et les cordons de son sweat encore soulevés par le souffle, casque autour du cou. Fond : lampadaires et maisons à gauche, muret et mer à droite, reflets verts. ${CORNICHE} ${KAI} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.6 },
          chars: [{ id: 'kai', pose: 'choc', expr: 'surprise', shot: 'buste', x: 0.4, y: 0.16, fill: 0.84 }],
          fx: [{ type: 'lueur', color: VERT, x: 0.85, y: 0.5, size: 0.3 }],
          bubbles: [{ type: 'cri', text: 'C’était quoi, ÇA ?!', x: 0.72, y: 0.2, w: 0.48, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 2 — Sora
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [
        { h: 0.32, cols: [1], tilt: 20 },
        { h: 0.32, cols: [0.5, 0.5], ctilt: [-20] },
        { h: 0.36, cols: [0.45, 0.55], ctilt: [18] },
      ],
      panels: [
        {
          action: `Vingt mètres plus loin sur la route, au centre de l’image (plan moyen, en pied), Sora s’est arrêtée net et s’est retournée vers nous : elle trottine sur place, nous fait un clin d’œil avec un sourire joueur et lève deux doigts en salut. Derrière elle, la traînée vert fluo retombe en étincelles sur la route mouillée. Elle regarde vers le bas de l’image (vers les garçons, hors champ, au premier plan). ${CORNICHE} ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'sora', pose: 'course', expr: 'clin', shot: 'pied', x: 0.5, y: 0.94, fill: 0.72 }],
          fx: [{ type: 'lueur', color: VERT, x: 0.5, y: 0.8, size: 0.3 }],
          bubbles: [{ type: 'parole', text: 'Trop lents !', x: 0.78, y: 0.2, w: 0.28, who: 0 }],
        },
        {
          action: `À gauche de l’image, Kaï rejoint Sora, essoufflé, penché en avant, la main GAUCHE sur la hanche, la main droite bandée le long du corps ; il la regarde. À droite de l’image, Sora, pas du tout essoufflée, décontractée, une main sur la hanche, sourit en le regardant, sûre d’elle. Ils se regardent. Fond : lampadaires allumés à gauche, muret et mer à droite. ${CORNICHE} ${KAI} ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'tete_mains', expr: 'surprise', shot: 'americain', x: 0.28, y: 0.26, fill: 0.7 },
            { id: 'sora', pose: 'decontracte', expr: 'joie', shot: 'americain', x: 0.74, y: 0.14, fill: 0.78, flip: true },
          ],
          bubbles: [{ type: 'parole', text: 'Sora. Dix kilomètres tous les matins, avant les cours.', x: 0.5, y: 0.16, w: 0.58, size: 15, who: 1 }],
        },
        {
          action: `Gros plan : la main droite de Sora sort de la poche ventrale de son sweat vert olive un épais paquet de fiches bristol blanches tenu par un élastique (les fiches sans texte lisible). En haut à droite de l’image, son visage souriant, en partie coupé par le cadre, un clin d’œil. Fond flou : muret et mer à droite, lumière d’aube. ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.65, vp: 0.5 },
          chars: [{ id: 'sora', pose: 'debout', expr: 'clin', shot: 'buste', x: 0.62, y: 0.12, fill: 0.84 }],
          bubbles: [{ type: 'parole', text: 'Et deux cents fiches dans le taxi.', x: 0.26, y: 0.16, w: 0.44, who: 0 }],
        },
        {
          action: `Mory et Nia arrivent. À gauche de l’image, Mory, essoufflé, les yeux ronds derrière ses lunettes, fixe le paquet de fiches. Au centre, Nia, calme, un sourcil levé, intéressée, regarde Sora. À droite de l’image, Sora, de trois quarts dos, en amorce, tient son paquet de fiches. Fond : route et lampadaires à gauche, muret et mer à droite. ${CORNICHE} ${MORY} ${NIA} ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'mory', pose: 'choc', expr: 'surprise', shot: 'taille', x: 0.24, y: 0.3, fill: 0.7 },
            { id: 'nia', pose: 'bras_croises', expr: 'reflexion', shot: 'taille', x: 0.62, y: 0.26, fill: 0.72 },
          ],
          bubbles: [
            { type: 'cri', text: 'Deux cents fiches ?!', x: 0.24, y: 0.12, w: 0.4, who: 0 },
            { type: 'parole', text: 'Toutes en même temps ?', x: 0.74, y: 0.12, w: 0.36, who: 1 },
          ],
        },
        {
          action: `Sora, malicieuse, plan taille, au centre-droit de l’image, l’index levé, un clin d’œil, regarde Nia. À gauche de l’image, Nia, de profil tournée vers Sora, pensive, la main sous le menton, la regarde. Fond : lampadaires allumés à gauche, muret et mer à droite, ciel qui rosit. ${CORNICHE} ${NIA} ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5 },
          chars: [
            { id: 'nia', pose: 'penseur', expr: 'reflexion', shot: 'taille', x: 0.2, y: 0.4, fill: 0.62 },
            { id: 'sora', pose: 'pointer', expr: 'clin', shot: 'taille', x: 0.7, y: 0.36, fill: 0.66, flip: true },
          ],
          bubbles: [
            { type: 'parole', text: 'Jamais. Dix minutes par jour. Le cerveau garde ce qu’on lui redemande.', x: 0.62, y: 0.12, w: 0.7, size: 14, who: 1 },
            { type: 'parole', text: 'Répétition espacée…', x: 0.2, y: 0.3, w: 0.34, size: 14, who: 0 },
            { type: 'parole', text: 'Je sais pas comment ça s’appelle. Je sais que ça marche.', x: 0.7, y: 0.9, w: 0.56, size: 14, who: 1 },
          ],
        },
      ],
    },
    // ============================================================ PAGE 3 — La brume
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [
        { h: 0.32, cols: [0.42, 0.58], ctilt: [20] },
        { h: 0.34, cols: [1], tilt: -20 },
        { h: 0.34, cols: [0.5, 0.5], ctilt: [-18] },
      ],
      panels: [
        {
          action: `Mory, plan taille, à gauche de l’image, tend à bout de bras sa petite antenne portable vers la droite de l’image (vers la mer) : la diode de l’antenne clignote ROUGE et de petites ondes en sortent. Il regarde la mer, l’air tendu, les sourcils froncés. Derrière lui : muret et mer à droite, route et lampadaires à gauche. ${CORNICHE} ${MORY} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.3 },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'concentration', shot: 'taille', x: 0.34, y: 0.3, fill: 0.7 }],
          fx: [{ type: 'lueur', color: '#ef4444', x: 0.72, y: 0.5, size: 0.18 }],
          sfx: [{ text: 'BIP BIP BIP', x: 0.64, y: 0.82, size: 26, rot: -6, color: '#ef4444' }],
          bubbles: [{ type: 'cri', text: 'Signal ! Côté mer !', x: 0.42, y: 0.12, w: 0.66, who: 0 }],
          sound: 'bubble',
        },
        {
          action: `Plan large sur l’océan, vu depuis la promenade : le muret de béton traverse l’image en diagonale, la mer occupe la droite et le fond, un bout de route et un lampadaire allumé à gauche. Une brume violette monte des vagues et rampe vers le muret ; dans la brume tourbillonnent des fiches blanches et des pages déchirées (sans texte lisible). Aucun personnage. ${CORNICHE} ${VIOLET_LUM}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.45, vp: 0.2 },
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.22 }, { type: 'glitch', n: 12 }],
          sfx: [{ text: 'SHHHHH…', x: 0.3, y: 0.2, size: 40, rot: -4, color: VIOLET }],
          sound: 'boss',
        },
        {
          action: `Plan large. Sur un banc de la promenade, adossé au muret (à droite de l’image), Fatou est assise de profil, tournée vers la gauche de l’image (vers la route), penchée sur ses fiches d’anatomie, écouteurs blancs dans les oreilles, son sac à dos bordeaux posé à côté d’elle. Elle ne voit pas, derrière elle, la brume violette qui passe par-dessus le muret en longs filaments et descend vers elle depuis la droite. Route et lampadaires allumés à gauche, mer derrière le muret à droite. Aucun autre personnage. ${CORNICHE} ${FATOU} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.4 },
          chars: [{ id: 'fatou', pose: 'assis_bureau', expr: 'concentration', shot: 'pied', x: 0.62, y: 0.92, fill: 0.5, flip: true }],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.18 }],
        },
        {
          action: `[ILLUSTRATION] Gros plan sur les fiches bristol de Fatou, tenues dans ses mains (peau brun foncé, manches de gilet beige) : les lignes manuscrites (illisibles, sans lettres) et un petit schéma de squelette se défont en pixels violets qui s’envolent vers la droite de l’image. Fond flou : muret et mer à droite, brume violette. (En attendant l’image, l’appli dessine une fiche qui s’efface.) ${VIOLET_LUM}`,
          bg: { id: 'cahier', lines: ['Nerf facial (VII)', 'Humérus', 'Fémur : l’os le plus long'], fade: true, keep: [] },
          fx: [{ type: 'glitch', n: 20 }],
          sfx: [{ text: 'VMMMM', x: 0.3, y: 0.16, size: 36, rot: -8, color: VIOLET }],
        },
        {
          action: `Fatou, plan buste, figée, le regard vide, la bouche entrouverte ; elle tient une fiche devenue toute blanche. Ses écouteurs blancs pendent. Des volutes de brume violette l’entourent. Fond : muret et mer à droite, lampadaire allumé à gauche. ${FATOU} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5 },
          chars: [{ id: 'fatou', pose: 'lire', expr: 'surprise', shot: 'taille', x: 0.5, y: 0.24, fill: 0.8 }],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.25 }, { type: 'glitch', n: 10 }],
          bubbles: [{ type: 'parole', text: 'Le nerf… le nerf qui… Je… je sais plus. Je sais plus RIEN.', x: 0.5, y: 0.12, w: 0.86, size: 14, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 4 — Trop loin
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [
        { h: 0.34, cols: [1], tilt: -18 },
        { h: 0.36, cols: [0.45, 0.55], ctilt: [18] },
        { h: 0.3, cols: [1] },
      ],
      panels: [
        {
          action: `Au premier plan à gauche de l’image, Kaï, de trois quarts dos, démarre en courant, le bras GAUCHE tendu vers le fond, la main droite bandée serrée contre lui. Loin devant, à droite de l’image, le long du muret, le banc de Fatou, tout petit, noyé dans la brume violette (on devine une minuscule silhouette assise). Route et lampadaires allumés à gauche, mer à droite. ${CORNICHE} ${KAI} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.7 },
          chars: [{ id: 'kai', pose: 'course', expr: 'concentration', shot: 'americain', x: 0.24, y: 0.22, fill: 0.78 }],
          fx: [{ type: 'lueur', color: '#7c3aed', x: 0.8, y: 0.5, size: 0.2 }],
          bubbles: [{ type: 'cri', text: 'Elle est à 300 mètres !', x: 0.62, y: 0.16, w: 0.4, who: 0 }],
        },
        {
          action: '[ÉCRAN APPLI] La tablette de Mory : « Mémoire de la cible : 100 % (0 s) · 50 % (7 s) · 25 % (14 s) », et la formule R(t) = 100 × 2^(−t/7) (KaTeX).',
          bg: { id: 'ecran', text: 'Mémoire de la cible :\n100 % (0 s)\n50 % (7 s)\n25 % (14 s)', from: 'ANTENNE DE MORY', clock: '05:44' },
          formules: [{ tex: 'R(t) = 100 \\times 2^{-t/7}', x: 0.5, y: 0.9, size: 0.06, rot: 0, color: '#8be9ff' }],
          sound: 'bubble',
        },
        {
          action: `Mory, plan buste, livide, les yeux écarquillés derrière ses lunettes, tient sa tablette noire à deux mains ; l’écran éclaire son visage en cyan par en dessous ; une goutte de sueur. Fond flou : muret et mer à droite, brume violette au loin. ${MORY} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.65, vp: 0.5 },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'surprise', shot: 'buste', x: 0.5, y: 0.2, fill: 0.84 }],
          fx: [{ type: 'lueur', color: '#22d3ee', x: 0.5, y: 0.85, size: 0.3 }],
          bubbles: [{ type: 'cri', text: 'Elle perd la moitié de ce qu’elle sait toutes les sept secondes ! On n’y arrivera jamais !', x: 0.5, y: 0.16, w: 0.88, size: 13, who: 0 }],
        },
        {
          action: `Sora, accroupie en position de départ de sprint au milieu de la route mouillée, au centre-gauche de l’image, vue de profil tournée vers la droite de l’image : un genou au sol, le bout des doigts posé sur le bitume, le dos tendu, les yeux fixés au loin sur le banc noyé dans la brume violette (petit, à droite de l’image, le long du muret). Expression concentrée, petit sourire en coin. Étincelles vert fluo autour de ses baskets. ${CORNICHE} ${SORA} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.75 },
          chars: [{ id: 'sora', pose: 'genou', expr: 'concentration', shot: 'pied', x: 0.36, y: 0.95, fill: 0.62 }],
          fx: [{ type: 'lueur', color: VERT, x: 0.36, y: 0.9, size: 0.2 }],
          bubbles: [{ type: 'parole', text: 'Vous, peut-être pas.', x: 0.16, y: 0.2, w: 0.26, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 5 — L'éclair
    {
      gutter: 'noir',
      ambient: 'mer',
      rows: [
        { h: 0.38, cols: [1], tilt: 22 },
        { h: 0.3, cols: [0.5, 0.5], ctilt: [-20] },
        { h: 0.32, cols: [0.45, 0.55], ctilt: [18] },
      ],
      panels: [
        {
          action: `GRANDE CASE. Sora part comme une flèche sur la route mouillée, de gauche à droite de l’image et vers le fond : corps très penché en avant, bras qui fendent l’air, une longue traînée de lumière vert fluo derrière elle, la rosée gicle en gerbes sous ses baskets olive ; lignes de vitesse. Au loin, à droite de l’image, le long du muret, la brume violette autour d’un petit banc. Personne d’autre. ${CORNICHE} ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.7 },
          chars: [{ id: 'sora', pose: 'course', expr: 'concentration', shot: 'pied', x: 0.5, y: 0.94, fill: 0.7, blur: -140, aura: VERT }],
          fx: [{ type: 'vitesse', angle: 0, n: 40, opacity: 0.6, color: VERT, layer: 'front' }],
          sfx: [{ text: 'ZZZIIIIP', x: 0.3, y: 0.22, size: 72, rot: -4, color: VERT }],
          sound: 'swipe',
        },
        {
          action: `Un tentacule de brume violette, sorti de la mer à droite de l’image, s’abat sur le haut du muret, à l’endroit où la coureuse se trouvait une seconde plus tôt : le béton se fissure en étoile, éclats et poussière. Il ne reste d’elle qu’une traînée vert fluo qui sort déjà du cadre par la gauche. Aucun personnage visible. Mer et rochers à droite, route à gauche. ${CORNICHE} ${VIOLET_LUM}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.4 },
          fx: [{ type: 'impact', x: 0.6, y: 0.6 }, { type: 'fissure', x: 0.6, y: 0.62 }, { type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          sfx: [{ text: 'KRAK !', x: 0.28, y: 0.24, size: 56, rot: -8, color: OR, impact: true }],
          sound: 'hit',
        },
        {
          action: `Sora freine en glissant sur la route mouillée (gerbe d’eau, traînée vert fluo qui s’éteint) à côté d’un banc et se met à genoux, à gauche de l’image, tournée vers la droite ; elle ramasse par terre une fiche encore lisible. À droite de l’image, Fatou, assise sur le banc adossé au muret, figée, le regard vide, enveloppée de brume violette. Mer derrière le muret à droite. ${CORNICHE} ${SORA} ${FATOU} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'sora', pose: 'genou', expr: 'concentration', shot: 'pied', x: 0.3, y: 0.95, fill: 0.62, blur: -60 },
            { id: 'fatou', pose: 'assis_bureau', expr: 'neutre', shot: 'pied', x: 0.76, y: 0.92, fill: 0.62, flip: true },
          ],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.15 }],
        },
        {
          action: `Plan rapproché. À gauche de l’image, Sora, à genoux, de profil tournée vers la droite, tient une fiche devant les yeux de Fatou et la regarde droit dans les yeux, sérieuse et douce. À droite de l’image, Fatou, assise sur le banc, de trois quarts tournée vers Sora, le regard encore vague. Brume violette autour d’elles, muret et mer à droite. ${SORA} ${FATOU} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5 },
          chars: [
            { id: 'sora', pose: 'main_tendue', expr: 'concentration', shot: 'taille', x: 0.28, y: 0.3, fill: 0.7 },
            { id: 'fatou', pose: 'debout', expr: 'neutre', shot: 'taille', x: 0.76, y: 0.34, fill: 0.66, flip: true },
          ],
          bubbles: [{ type: 'parole', text: 'Hé. Regarde-moi. Question : le nerf qui te fait sourire ?', x: 0.5, y: 0.12, w: 0.84, size: 14, who: 0 }],
        },
        {
          action: `Fatou, plan buste, cligne des yeux, lutte… puis trouve : son visage se ranime, les sourcils se lèvent. Sur la fiche qu’elle tient devant elle, des traits dorés lumineux reviennent se poser (lueur dorée, sans lettres lisibles). La brume violette recule autour d’elle. Fond : muret et mer à droite. ${FATOU} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.65, vp: 0.5 },
          chars: [{ id: 'fatou', pose: 'lire', expr: 'joie', shot: 'taille', x: 0.5, y: 0.26, fill: 0.78 }],
          fx: [{ type: 'lueur', color: OR, x: 0.5, y: 0.75, size: 0.3 }],
          sfx: [{ text: 'TCHING !', x: 0.72, y: 0.8, size: 36, rot: -8, color: OR }],
          bubbles: [{ type: 'parole', text: 'Le… le nerf facial !', x: 0.24, y: 0.14, w: 0.4, who: 0 }],
          sound: 'sparkle',
        },
      ],
    },
    // ============================================================ PAGE 6 — L'Oubli se montre
    {
      gutter: 'noir',
      ambient: 'mer',
      rows: [
        { h: 0.4, cols: [1], tilt: -22 },
        { h: 0.3, cols: [0.5, 0.5], ctilt: [20] },
        { h: 0.3, cols: [0.5, 0.5], ctilt: [-18] },
      ],
      panels: [
        {
          action: `GRANDE CASE. L’Oubli surgit de la mer, à droite de l’image, derrière le muret : une immense masse de brume violette et de fiches déchirées, haute comme un immeuble, qui se penche au-dessus de la promenade ; au milieu, son noyau violet brille, encore flou. Ses tentacules de brume descendent vers un banc au pied du muret, où l’on voit deux toutes petites silhouettes (de dos, sans détail). Route et lampadaires allumés à gauche, ciel d’aube assombri. ${CORNICHE} ${VIOLET_LUM}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.62, vp: 0.3 },
          chars: [{ id: 'oubli', pose: 'cri', shot: 'taille', x: 0.68, y: 0.03, fill: 1.0, seed: 17 }],
          fx: [{ type: 'glitch', n: 18 }, { type: 'teinte', color: '#1a0b2e', opacity: 0.25 }],
          sfx: [{ text: 'SHHHRAAA !', x: 0.3, y: 0.2, size: 80, rot: -6, color: VIOLET }],
          sound: 'boss',
        },
        {
          action: `Les tentacules de brume violette enroulés autour de Fatou se desserrent d’un coup, comme brûlés : ils se rétractent vers la droite de l’image (vers le muret) en fumant, avec des étincelles dorées. Fatou, assise sur le banc à droite de l’image, reprend son souffle, une main sur la poitrine. À gauche de l’image, Sora, à genoux, une fiche à la main, la regarde. ${CORNICHE} ${SORA} ${FATOU} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'sora', pose: 'genou', expr: 'concentration', shot: 'pied', x: 0.26, y: 0.95, fill: 0.6 },
            { id: 'fatou', pose: 'assis_bureau', expr: 'surprise', shot: 'pied', x: 0.72, y: 0.92, fill: 0.6, flip: true },
          ],
          fx: [{ type: 'lueur', color: OR, x: 0.72, y: 0.55, size: 0.25 }],
        },
        {
          action: `Kaï, Mory et Nia arrivent en courant jusqu’au banc, depuis la gauche de l’image : Kaï en tête (au centre), inquiet, la main GAUCHE tendue en avant, la main droite bandée le long du corps ; Mory derrière lui à gauche, essoufflé ; Nia à droite de Kaï, qui court cette fois. Ils regardent tous vers la droite de l’image (vers Sora, hors champ). Fond : lampadaires et maisons à gauche, muret et brume violette à droite. ${CORNICHE} ${KAI} ${MORY} ${NIA} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.3 },
          chars: [
            { id: 'mory', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.18, y: 0.94, fill: 0.56 },
            { id: 'kai', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.46, y: 0.97, fill: 0.66 },
            { id: 'nia', pose: 'course', expr: 'concentration', shot: 'pied', x: 0.74, y: 0.95, fill: 0.6 },
          ],
          bubbles: [{ type: 'cri', text: 'Sora ! Ça va ?!', x: 0.62, y: 0.14, w: 0.34, who: 1 }],
        },
        {
          action: `Mory, plan buste, regarde sa tablette noire (l’écran éclaire son visage en cyan) : d’abord soulagé, il fronce déjà les sourcils, inquiet. Fond flou : muret, brume violette et mer à droite. ${MORY} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.65, vp: 0.5 },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'concentration', shot: 'buste', x: 0.52, y: 0.22, fill: 0.82 }],
          fx: [{ type: 'lueur', color: '#22d3ee', x: 0.5, y: 0.85, size: 0.28 }],
          bubbles: [{ type: 'parole', text: 'Sa mémoire est remontée à cent pour cent ! … Mais ça redescend déjà.', x: 0.5, y: 0.12, w: 0.92, size: 13, who: 0 }],
        },
        {
          action: `Les tentacules de brume violette repoussent par-dessus le muret, à droite de l’image, et reviennent vers Fatou, assise sur le banc (à droite, effrayée, ses fiches serrées contre elle). À gauche de l’image, Sora, à genoux, tourne la tête et fixe les tentacules, sérieuse, les sourcils froncés. ${CORNICHE} ${SORA} ${FATOU} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'sora', pose: 'genou', expr: 'concentration', shot: 'pied', x: 0.26, y: 0.95, fill: 0.6 },
            { id: 'fatou', pose: 'assis_bureau', expr: 'surprise', shot: 'pied', x: 0.74, y: 0.92, fill: 0.58, flip: true },
          ],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.22 }],
          bubbles: [{ type: 'parole', text: 'Il revient à chaque fois.', x: 0.3, y: 0.14, w: 0.44, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 7 — La courbe
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [
        { h: 0.38, cols: [1], tilt: 18 },
        { h: 0.3, cols: [0.55, 0.45], ctilt: [-18] },
        { h: 0.32, cols: [0.55, 0.45], ctilt: [18] },
      ],
      panels: [
        {
          action: '[DESSIN APPLI] La courbe de l’oubli sur papier quadrillé : R(t) = 100 × 2^(−t/7) (KaTeX), avec les points (0 ; 100), (7 ; 50), (14 ; 25) et une ligne pointillée à 50 %. Étiquette : « demi-vie = 7 s ».',
          bg: {
            id: 'croquis',
            origin: [0.1, 0.86],
            curve: [[0.1, 0.18], [0.157, 0.274], [0.214, 0.355], [0.271, 0.424], [0.329, 0.485], [0.386, 0.536], [0.443, 0.581], [0.5, 0.62], [0.557, 0.653], [0.614, 0.681], [0.671, 0.706], [0.729, 0.727], [0.786, 0.746], [0.843, 0.761], [0.9, 0.775]],
            segs: [
              { a: [0.1, 0.52], b: [0.93, 0.52], color: '#c0392b', dash: true },
              { a: [0.367, 0.52], b: [0.367, 0.86], color: '#7f8c8d', dash: true },
              { a: [0.633, 0.69], b: [0.633, 0.86], color: '#7f8c8d', dash: true },
              { a: [0.1, 0.69], b: [0.633, 0.69], color: '#7f8c8d', dash: true },
            ],
            dots: [[0.1, 0.18, '#1f8a4c'], [0.367, 0.52, '#c0392b'], [0.633, 0.69, '#c0392b']],
          },
          formules: [
            { tex: 'R(t) = 100 \\times 2^{-t/7}', x: 0.66, y: 0.15, size: 0.05, rot: -2, color: '#1d3a8a' },
            { tex: '(0\\,;\\,100)', x: 0.22, y: 0.21, size: 0.032, rot: -2, color: '#1f8a4c' },
            { tex: '(7\\,;\\,50)', x: 0.45, y: 0.45, size: 0.032, rot: -2, color: '#c0392b' },
            { tex: '(14\\,;\\,25)', x: 0.72, y: 0.62, size: 0.032, rot: -2, color: '#c0392b' },
          ],
          labels: [
            { text: 'demi-vie = 7 s', x: 0.24, y: 0.62, size: 26, style: 'main', color: '#c0392b', rot: -3 },
            { text: 'mémoire (%)', x: 0.15, y: 0.04, size: 22, style: 'main' },
            { text: 'temps (s)', x: 0.87, y: 0.93, size: 22, style: 'main' },
            { text: '50 %', x: 0.05, y: 0.52, size: 18, style: 'main', color: '#c0392b' },
            { text: '7', x: 0.367, y: 0.93, size: 20, style: 'main' },
            { text: '14', x: 0.633, y: 0.93, size: 20, style: 'main' },
          ],
          sound: 'sparkle',
        },
        {
          action: `À gauche de l’image, Nia, calme, montre du doigt (index droit) la courbe sur la tablette que tient Mory, à droite de l’image ; tous deux regardent l’écran (lumière cyan sur leurs visages). Fond : muret, mer et brume violette à droite, lampadaire allumé à gauche. ${CORNICHE} ${NIA} ${MORY} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5 },
          chars: [
            { id: 'nia', pose: 'pointer', expr: 'concentration', shot: 'taille', x: 0.3, y: 0.3, fill: 0.68 },
            { id: 'mory', pose: 'telephone', expr: 'surprise', shot: 'taille', x: 0.74, y: 0.3, fill: 0.68, flip: true },
          ],
          bubbles: [{ type: 'parole', text: 'Elle perd la moitié de ce qu’elle sait toutes les sept secondes. C’est une demi-vie.', x: 0.5, y: 0.12, w: 0.92, size: 13, who: 0 }],
        },
        {
          action: `Kaï, plan buste, déterminé, le poing GAUCHE serré levé devant lui ; sa main droite bandée reste le long du corps. Il regarde vers la droite de l’image (vers la brume). Fond : lampadaires allumés à gauche, brume violette au-dessus du muret à droite. ${KAI} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.65, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'poing_leve', expr: 'concentration', shot: 'buste', x: 0.42, y: 0.2, fill: 0.84 }],
          bubbles: [{ type: 'cri', text: 'Alors on lui pose une question toutes les sept secondes !', x: 0.5, y: 0.17, w: 0.86, size: 13, who: 0 }],
        },
        {
          action: `À gauche de l’image, Sora, à genoux près du banc, tourne la tête vers la gauche (vers Kaï, hors champ) et secoue la tête en souriant, une fiche à la main. À droite de l’image, Fatou, assise sur le banc, ses fiches sur les genoux, écoute. Muret et mer à droite, brume violette. ${CORNICHE} ${SORA} ${FATOU} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'sora', pose: 'genou', expr: 'clin', shot: 'pied', x: 0.3, y: 0.95, fill: 0.62, flip: true },
            { id: 'fatou', pose: 'assis_bureau', expr: 'neutre', shot: 'pied', x: 0.76, y: 0.92, fill: 0.58, flip: true },
          ],
          bubbles: [{ type: 'parole', text: 'Non. Pas toujours sept. Chaque fois qu’elle se souvient toute seule, ça tient plus longtemps.', x: 0.5, y: 0.13, w: 0.94, size: 13, who: 0 }],
        },
        {
          action: `Gros plan sur Nia : son regard s’illumine (reflets vert fluo et violets dans les yeux), petit sourire de quelqu’un qui vient de comprendre. Fond flou : lampadaire à gauche, brume violette à droite. ${NIA} ${ADULTES}`,
          bg: { id: 'flash', color: '#1a0b2e', lines: VERT, cx: 0.5, cy: 0.5 },
          chars: [{ id: 'nia', pose: 'debout', expr: 'joie', shot: 'gros', x: 0.5, y: 0.2, fill: 0.78 }],
          bubbles: [{ type: 'parole', text: 'Le rappel double la demi-vie…', x: 0.5, y: 0.12, w: 0.8, size: 14, who: 0 }],
          sound: 'sparkle',
        },
      ],
    },
    // ============================================================ PAGE 8 — La suite
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [
        { h: 0.38, cols: [1], tilt: -18 },
        { h: 0.3, cols: [0.45, 0.55], ctilt: [18] },
        { h: 0.32, cols: [0.45, 0.55], ctilt: [-18] },
      ],
      panels: [
        {
          action: '[DESSIN APPLI] Les rappels espacés sur papier quadrillé : 7 s, 14 s, 28 s, 56 s (raison 2). La courbe en dents de scie remonte à 100 % à chaque rappel, avec des pentes de plus en plus douces (KaTeX : u_{n+1} = 2 u_n).',
          bg: {
            id: 'croquis',
            origin: [0.08, 0.86],
            curves: [
              [[0.08, 0.2], [0.1, 0.305], [0.12, 0.393], [0.14, 0.468], [0.16, 0.53]],
              [[0.16, 0.2], [0.183, 0.272], [0.207, 0.336], [0.23, 0.393], [0.253, 0.444], [0.277, 0.49], [0.3, 0.53]],
              [[0.3, 0.2], [0.324, 0.244], [0.348, 0.285], [0.372, 0.324], [0.396, 0.36], [0.42, 0.393], [0.444, 0.425], [0.468, 0.454], [0.492, 0.481], [0.516, 0.506], [0.54, 0.53]],
              [[0.54, 0.2], [0.565, 0.23], [0.591, 0.258], [0.616, 0.285], [0.641, 0.311], [0.667, 0.336], [0.692, 0.36], [0.717, 0.382], [0.743, 0.404], [0.768, 0.425], [0.793, 0.444], [0.819, 0.463], [0.844, 0.481], [0.869, 0.498], [0.895, 0.514], [0.92, 0.53]],
            ],
            segs: [
              { a: [0.08, 0.53], b: [0.93, 0.53], color: '#c0392b', dash: true },
              { a: [0.16, 0.53], b: [0.16, 0.2], color: '#1f8a4c' },
              { a: [0.3, 0.53], b: [0.3, 0.2], color: '#1f8a4c' },
              { a: [0.54, 0.53], b: [0.54, 0.2], color: '#1f8a4c' },
            ],
            dots: [[0.16, 0.2, '#1f8a4c'], [0.3, 0.2, '#1f8a4c'], [0.54, 0.2, '#1f8a4c']],
          },
          formules: [
            { tex: 'u_{n+1} = 2\\,u_n', x: 0.74, y: 0.1, size: 0.045, rot: -2, color: '#1d3a8a' },
            { tex: '7 \\to 14 \\to 28 \\to 56', x: 0.66, y: 0.7, size: 0.04, rot: -2, color: '#1d3a8a' },
          ],
          labels: [
            { text: '7 s', x: 0.12, y: 0.93, size: 20, style: 'main' },
            { text: '14 s', x: 0.23, y: 0.93, size: 20, style: 'main' },
            { text: '28 s', x: 0.42, y: 0.93, size: 20, style: 'main' },
            { text: '56 s', x: 0.73, y: 0.93, size: 20, style: 'main' },
            { text: 'rappel !', x: 0.3, y: 0.12, size: 22, style: 'main', color: '#1f8a4c', rot: -4 },
            { text: 'raison 2', x: 0.82, y: 0.8, size: 24, style: 'main', color: '#c0392b', rot: -3 },
            { text: '100 %', x: 0.035, y: 0.2, size: 16, style: 'main' },
            { text: '50 %', x: 0.035, y: 0.53, size: 16, style: 'main', color: '#c0392b' },
          ],
          sound: 'sparkle',
        },
        {
          action: `Kaï, plan buste, grand sourire, l’index GAUCHE levé (il a compris) ; la main droite bandée contre la poitrine. Il regarde vers la droite de l’image (vers Nia et Mory, hors champ). Fond : lampadaires à gauche, mer à droite, ciel qui s’éclaircit. ${KAI} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.65, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'pointer', expr: 'joie', shot: 'buste', x: 0.44, y: 0.2, fill: 0.84 }],
          bubbles: [{ type: 'parole', text: 'Une suite géométrique ! Comme au marché !', x: 0.5, y: 0.12, w: 0.9, size: 14, who: 0 }],
        },
        {
          action: `Mory, plan taille, calcule sur sa tablette en tapant de l’index, concentré, la lumière cyan de l’écran sur ses lunettes (verres transparents, yeux visibles) ; un petit sourire en coin. Fond : muret et brume violette à droite. ${MORY} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5 },
          chars: [{ id: 'mory', pose: 'telephone', expr: 'concentration', shot: 'taille', x: 0.5, y: 0.3, fill: 0.7 }],
          bubbles: [{ type: 'parole', text: 'Après quatre rappels, elle tient presque une minute toute seule. Il n’aura plus rien à manger.', x: 0.5, y: 0.12, w: 0.94, size: 13, who: 0 }],
        },
        {
          action: `Nia (à gauche de l’image) et Kaï (à droite de l’image), face à face, de profil, se regardent dans les yeux, complices, un léger sourire. Entre eux, au loin, la brume violette au-dessus du muret. ${CORNICHE} ${NIA} ${KAI} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5 },
          chars: [
            { id: 'nia', pose: 'debout', expr: 'clin', shot: 'taille', x: 0.24, y: 0.36, fill: 0.64 },
            { id: 'kai', pose: 'debout', expr: 'concentration', shot: 'taille', x: 0.78, y: 0.34, fill: 0.66, flip: true },
          ],
          bubbles: [
            { type: 'parole', text: 'Et un Oubli qui n’a plus rien à manger…', x: 0.3, y: 0.12, w: 0.54, size: 14, who: 0 },
            { type: 'parole', text: '… se condense. Et tombe.', x: 0.74, y: 0.88, w: 0.44, size: 14, who: 1 },
          ],
        },
        {
          action: `Au centre de l’image, Sora, debout devant le banc, son paquet de fiches bristol à la main (élastique enlevé), tournée vers la gauche, parle d’un ton décidé. Derrière elle, à droite de l’image, Fatou, assise sur le banc, ses fiches à la main. À gauche de l’image, Mory lance le chrono sur sa tablette, le pouce sur l’écran. Muret, brume violette et mer à droite. ${CORNICHE} ${MORY} ${SORA} ${FATOU} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'mory', pose: 'telephone', expr: 'concentration', shot: 'americain', x: 0.14, y: 0.3, fill: 0.66 },
            { id: 'sora', pose: 'pointer', expr: 'concentration', shot: 'americain', x: 0.5, y: 0.24, fill: 0.72, flip: true },
            { id: 'fatou', pose: 'assis_bureau', expr: 'neutre', shot: 'pied', x: 0.84, y: 0.94, fill: 0.5, flip: true },
          ],
          bubbles: [
            { type: 'parole', text: 'Je pose les questions. Vous, vous le tenez loin d’elle.', x: 0.58, y: 0.1, w: 0.62, size: 14, who: 1 },
            { type: 'parole', text: 'Chrono lancé !', x: 0.18, y: 0.86, w: 0.3, size: 14, who: 0 },
          ],
          sound: 'bubble',
        },
      ],
    },
    // ============================================================ PAGE 9 — Le rythme
    {
      gutter: 'noir',
      ambient: 'mer',
      rows: [
        { h: 0.34, cols: [1], tilt: 20 },
        { h: 0.32, cols: [0.5, 0.5], ctilt: [-20] },
        { h: 0.34, cols: [0.5, 0.5], ctilt: [18] },
      ],
      panels: [
        {
          action: `Les tentacules de brume violette fouettent l’air depuis la droite de l’image (au-dessus du muret). Au centre, Sora tient Fatou par le poignet et la tire vivement sur le côté pour esquiver ; images fantômes de leur mouvement (à gauche, puis à droite), traînée vert fluo. Fatou serre ses fiches contre elle. Route à gauche, muret et mer à droite. ${CORNICHE} ${SORA} ${FATOU} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.5 },
          chars: [
            { id: 'sora', pose: 'esquive', expr: 'concentration', shot: 'pied', x: 0.4, y: 0.95, fill: 0.7, blur: 60 },
            { id: 'fatou', pose: 'course', expr: 'surprise', shot: 'pied', x: 0.6, y: 0.96, fill: 0.66, blur: 40 },
          ],
          fx: [{ type: 'vitesse', angle: 0, n: 20, opacity: 0.4, color: VERT }, { type: 'teinte', color: '#7c3aed', opacity: 0.15 }],
          bubbles: [{ type: 'cri', text: 'Gauche ! Droite !', x: 0.2, y: 0.16, w: 0.3, who: 0 }],
        },
        {
          action: `Mory, à gauche de l’image, plan taille, crie le compte en brandissant sa tablette (chrono). À droite de l’image, derrière lui, Fatou répond, une fiche à la main sur laquelle brillent des traits dorés (sans lettres lisibles). Brume violette au fond à droite. ${MORY} ${FATOU} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5 },
          chars: [
            { id: 'mory', pose: 'telephone', expr: 'celebration', shot: 'taille', x: 0.3, y: 0.3, fill: 0.7 },
            { id: 'fatou', pose: 'lire', expr: 'concentration', shot: 'taille', x: 0.78, y: 0.36, fill: 0.58, flip: true },
          ],
          fx: [{ type: 'lueur', color: OR, x: 0.78, y: 0.75, size: 0.2 }],
          bubbles: [
            { type: 'cri', text: 'SEPT !', x: 0.24, y: 0.14, w: 0.26, who: 0 },
            { type: 'parole', text: 'L’humérus !', x: 0.76, y: 0.14, w: 0.3, who: 1 },
          ],
        },
        {
          action: `Kaï, au centre de l’image, dévie un tentacule de brume violette d’un grand coup de pied (jambe tendue vers la droite de l’image) ; sa main droite bandée reste en retrait, serrée contre sa poitrine ; il tourne la tête vers la gauche (vers Fatou, hors champ). Muret et mer à droite. ${CORNICHE} ${KAI} ${VIOLET_LUM} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'kai', pose: 'coup_de_pied', expr: 'concentration', shot: 'pied', x: 0.44, y: 0.95, fill: 0.74 }],
          fx: [{ type: 'impact', x: 0.75, y: 0.45 }],
          bubbles: [{ type: 'cri', text: 'Recule !', x: 0.26, y: 0.22, w: 0.26, who: 0 }],
          sound: 'hit',
        },
        {
          action: `À gauche de l’image, Mory, de profil, crie le compte, la tablette levée. À droite de l’image, Fatou, debout près du banc, répond sans regarder la fiche, les yeux fermés, sûre d’elle, l’index levé ; une lueur dorée autour de ses fiches. Brume violette qui s’amincit. ${MORY} ${FATOU} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5 },
          chars: [
            { id: 'mory', pose: 'telephone', expr: 'celebration', shot: 'taille', x: 0.24, y: 0.34, fill: 0.66 },
            { id: 'fatou', pose: 'pointer', expr: 'joie', shot: 'taille', x: 0.74, y: 0.3, fill: 0.68, flip: true },
          ],
          bubbles: [
            { type: 'cri', text: 'QUATORZE !', x: 0.24, y: 0.13, w: 0.34, who: 0 },
            { type: 'parole', text: 'Le fémur ! L’os le plus long du corps !', x: 0.66, y: 0.88, w: 0.56, size: 14, who: 1 },
          ],
        },
        {
          action: `Nia, debout à côté du banc, au centre-gauche de l’image, lit à voix haute ses propres notes dans un petit carnet. Autour d’elle, la brume violette s’amincit en filaments transparents ; au fond à droite, au-dessus de la mer, l’Oubli rapetisse. Le ciel s’éclaircit. ${CORNICHE} ${NIA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'nia', pose: 'lire', expr: 'concentration', shot: 'americain', x: 0.36, y: 0.2, fill: 0.74 },
            { id: 'oubli', pose: 'recul', shot: 'taille', x: 0.82, y: 0.2, fill: 0.5, seed: 9 },
          ],
          fx: [{ type: 'teinte', color: '#7c3aed', opacity: 0.1 }],
          bubbles: [{ type: 'parole', text: 'Il maigrit.', x: 0.7, y: 0.14, w: 0.26, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 10 — Condensation
    {
      gutter: 'noir',
      ambient: 'mer',
      rows: [
        { h: 0.32, cols: [1], tilt: -20 },
        { h: 0.34, cols: [0.5, 0.5], ctilt: [20] },
        { h: 0.34, cols: [0.55, 0.45], ctilt: [-18] },
      ],
      panels: [
        {
          action: `Fatou, debout au centre de l’image, plan américain, sûre d’elle, répond seule, la tête haute, ses fiches serrées dans une main (lueur dorée). En amorce à gauche de l’image, Mory, de trois quarts dos, crie le compte, la tablette levée. Brume violette qui recule vers le muret à droite. ${CORNICHE} ${MORY} ${FATOU} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5 },
          chars: [
            { id: 'mory', pose: 'telephone', expr: 'celebration', shot: 'americain', x: 0.12, y: 0.3, fill: 0.66 },
            { id: 'fatou', pose: 'poing_leve', expr: 'joie', shot: 'americain', x: 0.56, y: 0.16, fill: 0.76 },
          ],
          bubbles: [
            { type: 'cri', text: 'VINGT-HUIT !', x: 0.24, y: 0.22, w: 0.24, who: 0 },
            { type: 'parole', text: 'Douze paires de nerfs crâniens !', x: 0.82, y: 0.22, w: 0.3, who: 1 },
          ],
        },
        {
          action: `L’Oubli se contracte au-dessus du muret, à droite de l’image : toute la brume violette est aspirée en spirale vers un noyau de verre violet, qui devient solide et brillant. Fiches et pages déchirées aspirées dans le tourbillon. Mer et rochers à droite, route à gauche. Aucun personnage. ${CORNICHE}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.4 },
          chars: [{ id: 'oubli', pose: 'recul', shot: 'taille', x: 0.62, y: 0.08, fill: 0.7, seed: 23 }],
          fx: [{ type: 'concentration', opacity: 0.3 }, { type: 'teinte', color: '#7c3aed', opacity: 0.2 }],
          sfx: [{ text: 'KRRRK…', x: 0.24, y: 0.2, size: 40, rot: -6, color: VIOLET }],
        },
        {
          action: `Le noyau de l’Oubli, un gros cristal de verre violet devenu lourd, tombe sur le haut du muret (à droite de l’image) : le béton se fend en étoile, éclats et anneau de poussière. Mer derrière le muret à droite, route à gauche. Aucun personnage. ${CORNICHE}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.4 },
          fx: [{ type: 'impact', x: 0.6, y: 0.55 }, { type: 'fissure', x: 0.6, y: 0.6 }],
          sfx: [{ text: 'BOUM !', x: 0.32, y: 0.24, size: 50, rot: -8, color: OR, impact: true }],
          sound: 'hit',
        },
        {
          action: `Le cristal violet roule lentement sur le haut du muret vers le bord côté mer, à droite de l’image (les vagues en contrebas). Au premier plan à gauche de l’image, Nia tend la main vers lui, alarmée, les yeux écarquillés. ${CORNICHE} ${NIA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.5 },
          chars: [{ id: 'nia', pose: 'main_tendue', expr: 'surprise', shot: 'taille', x: 0.22, y: 0.3, fill: 0.7 }],
          fx: [{ type: 'lueur', color: '#a78bfa', x: 0.74, y: 0.55, size: 0.18 }],
          bubbles: [{ type: 'cri', text: 'S’il tombe à l’eau, la mer le reformera !', x: 0.58, y: 0.14, w: 0.66, size: 14, who: 0 }],
        },
        {
          action: `Kaï (à gauche de l’image) et Sora (à droite de l’image), plan buste, échangent un regard décidé et hochent la tête en même temps ; silence. Kaï serre le poing GAUCHE, sa main droite bandée visible. Lueur violette entre eux, ciel qui s’éclaircit derrière. ${KAI} ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.65, vp: 0.5 },
          chars: [
            { id: 'kai', pose: 'debout', expr: 'concentration', shot: 'buste', x: 0.28, y: 0.24, fill: 0.74 },
            { id: 'sora', pose: 'debout', expr: 'concentration', shot: 'buste', x: 0.74, y: 0.24, fill: 0.74, flip: true },
          ],
        },
      ],
    },
    // ============================================================ PAGE 11 — Double impact
    {
      gutter: 'noir',
      ambient: 'mer',
      rows: [
        { h: 0.28, cols: [0.5, 0.5], ctilt: [20] },
        { h: 0.42, cols: [1], tilt: -22 },
        { h: 0.3, cols: [0.5, 0.5], ctilt: [18] },
      ],
      panels: [
        {
          action: `Plan large. Le cristal violet est posé au bord du muret, au centre-droit de l’image. Sora sprinte le long du muret vers lui depuis le fond de l’image (traînée vert fluo) ; Kaï court vers lui depuis le premier plan à gauche, de l’autre côté, la main GAUCHE serrée, la main droite bandée. Mer et rochers à droite, route et lampadaires à gauche ; le ciel rosit à l’horizon. ${CORNICHE} ${KAI} ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.6 },
          chars: [
            { id: 'kai', pose: 'course', expr: 'concentration', shot: 'pied', x: 0.24, y: 0.97, fill: 0.66 },
            { id: 'sora', pose: 'course', expr: 'concentration', shot: 'pied', x: 0.66, y: 0.7, fill: 0.36, flip: true, aura: VERT },
          ],
          fx: [{ type: 'vitesse', angle: 0, n: 20, opacity: 0.4, color: VERT }],
          bubbles: [{ type: 'cri', text: 'À trois !', x: 0.2, y: 0.16, w: 0.26, who: 0 }],
        },
        {
          action: `Sora bondit dans les airs, à gauche de l’image, pour un coup de pied sauté vers la droite (jambe tendue, traînée vert fluo). En bas, au premier plan au centre, Kaï arme son poing GAUCHE nu, le bras gauche tiré en arrière, la main droite bandée ramenée contre la hanche ; il regarde le cristal violet posé sur le muret à droite de l’image. ${CORNICHE} ${KAI} ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.5, vp: 0.6 },
          chars: [
            { id: 'sora', pose: 'saut', expr: 'celebration', shot: 'pied', x: 0.3, y: 0.62, fill: 0.56, aura: VERT },
            { id: 'kai', pose: 'garde', expr: 'concentration', shot: 'pied', x: 0.62, y: 0.98, fill: 0.62 },
          ],
          bubbles: [{ type: 'cri', text: 'TROIS !', x: 0.2, y: 0.14, w: 0.24, who: 0 }],
        },
        {
          action: `GRANDE CASE. Double impact sur le cristal violet, au bord du muret (au centre-droit de l’image), juste avant qu’il tombe dans la mer. À gauche de l’image, Sora, en l’air, le frappe d’un coup de pied sauté, longue traînée vert fluo derrière elle. Au centre-gauche, Kaï, au sol en fente avant, frappe du poing GAUCHE nu (le bras gauche tendu vers la droite) ; sa main droite bandée est ramenée contre sa hanche. Grande onde de choc blanche, éclats violets qui volent vers la droite au-dessus de la mer. Mer et rochers à droite, route à gauche ; le soleil commence à se lever à l’horizon. ${KAI} ${SORA} ${ADULTES}`,
          bg: { id: 'flash', color: '#fffdf2', lines: '#7c3aed', cx: 0.62, cy: 0.45 },
          chars: [
            { id: 'kai', pose: 'coup_de_poing', expr: 'celebration', shot: 'pied', x: 0.38, y: 1.02, fill: 0.78, aura: '#8b5cf6', break: true },
            { id: 'sora', pose: 'coup_de_pied', expr: 'celebration', shot: 'pied', x: 0.16, y: 0.8, fill: 0.7, aura: VERT },
          ],
          fx: [{ type: 'impact', x: 0.64, y: 0.45, size: 0.3, color: '#f0ffd0', layer: 'front' }],
          sfx: [{ text: 'BADABOOM !', x: 0.66, y: 0.86, size: 90, rot: -4, color: VERT, impact: true }],
          sound: 'hit',
        },
        {
          action: `Le cristal éclate en pixels violets qui se changent en lettres dorées lumineuses et filent en rubans vers la gauche de l’image (vers les fiches de Fatou, hors champ). Au-dessus de la mer, à droite, le soleil se lève. Aucun personnage. ${SOLEIL}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5, sunX: 0.8 },
          fx: [{ type: 'glitch', n: 24 }, { type: 'lueur', color: OR, x: 0.5, y: 0.45, size: 0.4 }],
          sfx: [{ text: 'SHHHRRRAAA', x: 0.32, y: 0.84, size: 30, rot: -6, color: OR }],
          sound: 'sparkle',
        },
        {
          action: `Fatou, debout à côté du banc, au centre de l’image, serre contre sa poitrine ses fiches redevenues pleines (lueur dorée), émue, les yeux brillants, un sourire. Derrière elle à droite, le soleil se lève sur la mer, au-dessus du muret. ${SOLEIL} ${FATOU} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5, sunX: 0.82 },
          chars: [{ id: 'fatou', pose: 'debout', expr: 'joie', shot: 'taille', x: 0.44, y: 0.26, fill: 0.74 }],
          fx: [{ type: 'lueur', color: OR, x: 0.44, y: 0.7, size: 0.25 }],
          bubbles: [{ type: 'parole', text: 'Mon partiel… Je me souviens de tout.', x: 0.24, y: 0.13, w: 0.42, size: 14, who: 0 }],
        },
      ],
    },
    // ============================================================ PAGE 12 — La gardienne
    {
      gutter: 'blanc',
      ambient: 'mer',
      rows: [
        { h: 0.26, cols: [1], tilt: 18 },
        { h: 0.26, cols: [0.5, 0.5], ctilt: [-18] },
        { h: 0.3, cols: [0.5, 0.5], ctilt: [18] },
        { h: 0.18, cols: [1] },
      ],
      panels: [
        {
          action: `Fatou s’éloigne en courant vers la gauche de l’image (vers la route et les maisons), son sac à dos bordeaux sur le dos, et se retourne pour faire un grand signe de la main, souriante. Le soleil se lève sur la mer derrière le muret, à droite ; lampadaires qui s’éteignent. Personne d’autre. ${SOLEIL} ${FATOU} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.55, vp: 0.5, sunX: 0.85 },
          chars: [{ id: 'fatou', pose: 'course', expr: 'joie', shot: 'pied', x: 0.34, y: 0.95, fill: 0.7, flip: true }],
          bubbles: [{ type: 'parole', text: 'Merci ! Je file, c’est à huit heures !', x: 0.68, y: 0.2, w: 0.4, who: 0 }],
        },
        {
          action: `Les quatre assis côte à côte sur le muret, au soleil levant, de trois quarts, les jambes pendantes côté route ; de gauche à droite de l’image : Mory, Nia, Kaï et Sora. Kaï est tourné vers Sora et la regarde ; Sora lui répond d’un sourire en coin. Le soleil se lève sur la mer derrière eux, à droite (contre-jour doré). ${SOLEIL} ${MORY} ${NIA} ${KAI} ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5, sunX: 0.8 },
          chars: [
            { id: 'mory', pose: 'assis_bureau', expr: 'joie', shot: 'taille', x: 0.14, y: 0.42, fill: 0.5 },
            { id: 'nia', pose: 'assis_bureau', expr: 'joie', shot: 'taille', x: 0.37, y: 0.42, fill: 0.5 },
            { id: 'kai', pose: 'assis_bureau', expr: 'joie', shot: 'taille', x: 0.6, y: 0.4, fill: 0.52 },
            { id: 'sora', pose: 'assis_bureau', expr: 'clin', shot: 'taille', x: 0.84, y: 0.42, fill: 0.5, flip: true },
          ],
          bubbles: [
            { type: 'parole', text: 'Rejoins-nous.', x: 0.5, y: 0.12, w: 0.3, size: 14, who: 2 },
            { type: 'parole', text: 'Une équipe qui court à cinq heures quarante ? … Ça me plaît.', x: 0.68, y: 0.88, w: 0.6, size: 13, who: 3 },
          ],
        },
        {
          action: `Sora, debout au centre de l’image, tend une fiche bristol blanche à chacun, d’un geste théâtral. À gauche de l’image, Kaï prend la sienne de sa main GAUCHE (main droite bandée). À droite de l’image, Mory et Nia tendent la main, amusés. Lumière dorée du soleil levant à droite. ${SOLEIL} ${KAI} ${SORA} ${MORY} ${NIA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5, sunX: 0.85 },
          chars: [
            { id: 'kai', pose: 'main_tendue', expr: 'joie', shot: 'taille', x: 0.16, y: 0.36, fill: 0.6 },
            { id: 'sora', pose: 'main_tendue', expr: 'clin', shot: 'taille', x: 0.5, y: 0.3, fill: 0.68 },
            { id: 'mory', pose: 'debout', expr: 'joie', shot: 'taille', x: 0.76, y: 0.38, fill: 0.56, flip: true },
            { id: 'nia', pose: 'debout', expr: 'joie', shot: 'taille', x: 0.92, y: 0.4, fill: 0.54, flip: true },
          ],
          bubbles: [{ type: 'parole', text: 'Règle numéro un : dix minutes par jour. Pas plus, pas moins.', x: 0.5, y: 0.12, w: 0.9, size: 13, who: 1 }],
        },
        {
          action: `À gauche de l’image, Mory, une fiche bristol à la main, l’air sérieux ; au centre, Nia, un léger sourire, la regarde ; à droite de l’image, Sora fait un clin d’œil, ravie. Lumière dorée du matin, mer et soleil levant à droite. ${SOLEIL} ${MORY} ${NIA} ${SORA} ${ADULTES}`,
          bg: { id: 'corniche', time: 'aube', horizon: 0.6, vp: 0.5, sunX: 0.85 },
          chars: [
            { id: 'mory', pose: 'debout', expr: 'concentration', shot: 'taille', x: 0.16, y: 0.36, fill: 0.6 },
            { id: 'nia', pose: 'debout', expr: 'joie', shot: 'taille', x: 0.48, y: 0.36, fill: 0.6 },
            { id: 'sora', pose: 'victoire', expr: 'clin', shot: 'taille', x: 0.82, y: 0.34, fill: 0.62, flip: true },
          ],
          bubbles: [
            { type: 'parole', text: 'Il lui faut un titre.', x: 0.17, y: 0.12, w: 0.3, size: 13, who: 0 },
            { type: 'parole', text: 'Gardienne de la mémoire.', x: 0.52, y: 0.16, w: 0.34, size: 13, who: 1 },
            { type: 'parole', text: 'Ça claque.', x: 0.82, y: 0.86, w: 0.24, size: 13, who: 2 },
          ],
        },
        {
          action: '[ÉCRAN APPLI] Le téléphone de Kaï s’allume : message du Créateur « 4 sur 8. ».',
          bg: { id: 'ecran', text: '4 sur 8.', from: 'LE CRÉATEUR', clock: '06:05', big: true },
          sound: 'bubble',
        },
        {
          action: `[ILLUSTRATION + SURIMPRESSION] Plus tard, dans un couloir de l’université (lumière de jour qui entre par une fenêtre au fond) : au centre-gauche de l’image, un grand panneau d’affichage en liège avec une grande affiche de tournoi VIERGE (couleurs vives rouge et or, trophée dessiné, AUCUN texte : l’appli ajoute le texte par-dessus). Devant, à droite de l’image, en contre-jour, Ren : silhouette d’un jeune homme bras croisés, appuyé contre le mur, sourire en coin. Couloir vide. ${ADULTES}`,
          bg: { id: 'classe', time: 'jour', horizon: 0.5, vp: 0.85 },
          chars: [{ id: 'ren', pose: 'bras_croises', expr: 'clin', shot: 'americain', x: 0.8, y: 0.16, fill: 0.8, light: 'contre' }],
          labels: [
            { text: 'TOURNOI DE QUIZ', x: 0.36, y: 0.32, size: 30, color: '#ffd23f' },
            { text: 'Champion invaincu : REN', x: 0.36, y: 0.52, size: 22 },
          ],
          captions: [{ text: 'À suivre…', x: 0.03, y: 0.78, style: 'noir', right: true }],
          sound: 'boss',
        },
      ],
    },
  ],
};
