// =====================================================================
// story-images.js — ILLUSTRATIONS QUI REMPLACENT LES CASES DESSINÉES
// ---------------------------------------------------------------------
// Convention de nommage (aucun code à modifier) :
//   public/story/chapitre-1/page-2-case-3.webp   (ou .png / .jpg)
//   = chapitre 1, page 2, 3e case dans l'ordre de lecture.
// Si le fichier existe, il remplace le dessin SVG de la case ; sinon le
// dessin reste affiché. La liste des fichiers présents est fournie au
// moment du build par le plugin "story-images" (vite.config.js).
// =====================================================================

import STORY from 'virtual:story-images';

const keyOf = (chapter, pageIdx, panelIdx) => `chapitre-${chapter}/page-${pageIdx + 1}-case-${panelIdx + 1}`;

/** Nom de fichier attendu (pageIdx et panelIdx commencent à 0). */
export function storyFileName(chapter, pageIdx, panelIdx) {
  return `public/story/${keyOf(chapter, pageIdx, panelIdx)}.webp`;
}

/** Chemin de l'illustration de cette case (relatif au site), ou null. */
export function storyImage(chapter, pageIdx, panelIdx) {
  return chapter ? STORY[keyOf(chapter, pageIdx, panelIdx)] || null : null;
}
