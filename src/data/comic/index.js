// =====================================================================
// index.js — CHAPITRES DE LA BD (chargés un par un, à la demande)
// ---------------------------------------------------------------------
// Chaque chapitre est un fichier : src/data/comic/chapitres/chNN.js
// Vite crée un petit fichier séparé par chapitre : on ne télécharge QUE
// le chapitre ouvert (bon pour les connexions lentes).
// ➕ Ajouter un chapitre : crée chNN.js (copie ch01.js) — rien d'autre à faire.
//    Les titres/teasers de la liste des chapitres sont dans src/data/story.js.
// =====================================================================

const FILES = import.meta.glob('./chapitres/ch*.js');

// Espace insécable avant ? ! : ; (pas de signe seul en début de ligne, ni dans les bulles ni sur les
// écrans de téléphone). Appliquée à tous les textes affichés de la BD, y compris traduits.
const NB = '\u00a0';
const typo = (t) => (typeof t === 'string' ? t.replace(/[ \u202f\u00a0]+([?!:;])/g, `${NB}$1`) : t);
function fixTypography(chapter) {
  for (const page of chapter.pages || []) {
    for (const panel of page.panels || []) {
      for (const list of [panel.bubbles, panel.captions, panel.sfx]) for (const it of list || []) it.text = typo(it.text);
      if (panel.bg) { panel.bg.text = typo(panel.bg.text); panel.bg.from = typo(panel.bg.from); }
    }
  }
  return chapter;
}

const fileOf = (id) => `./chapitres/ch${String(id).padStart(2, '0')}.js`;

/** Ce chapitre existe-t-il en version BD ? */
export function hasComic(id) {
  return !!FILES[fileOf(id)];
}

/**
 * Charge un chapitre BD (ou null s'il n'existe pas encore), avec les positions
 * de bulles de public/story/chapitre-N/bulles-chapitre-N.json si ce fichier existe.
 * Renvoie une COPIE : on peut la modifier sans toucher à l'original.
 */
export async function loadComic(id) {
  const load = FILES[fileOf(id)];
  if (!load) return null;
  const [mod, { applyLayout }, i18n] = await Promise.all([load(), import('../../comic/story-images.js'), import('../../i18n/index.js')]);
  // Textes de la BD traduits (src/i18n/contenu/<langue>/bd.json), sinon français.
  const copy = i18n.mergeContent(JSON.parse(JSON.stringify(mod.default)), i18n.getContent('bd')?.[`ch${String(id).padStart(2, '0')}`]);
  return applyLayout(fixTypography(copy));
}
