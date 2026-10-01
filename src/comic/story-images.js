// =====================================================================
// story-images.js — ILLUSTRATIONS QUI REMPLACENT LES CASES DESSINÉES
// ---------------------------------------------------------------------
// Convention de nommage (aucun code à modifier) :
//   public/story/chapitre-1/page-2-case-3.webp   (ou .png / .jpg)
//   = chapitre 1, page 2, 3e case dans l'ordre de lecture.
// Si le fichier existe, il remplace le dessin SVG de la case ; sinon le
// dessin reste affiché. La liste des fichiers présents (avec leurs
// dimensions) est fournie au build par le plugin "story-images"
// (vite.config.js), ainsi que les positions de bulles enregistrées avec
// l'éditeur : public/story/chapitre-N/bulles-chapitre-N.json.
// =====================================================================

import { IMAGES, LAYOUTS } from 'virtual:story-images';

export const caseKey = (pageIdx, panelIdx) => `page-${pageIdx + 1}-case-${panelIdx + 1}`;
const keyOf = (chapter, pageIdx, panelIdx) => `chapitre-${chapter}/${caseKey(pageIdx, panelIdx)}`;

/** Nom de fichier attendu (pageIdx et panelIdx commencent à 0). */
export function storyFileName(chapter, pageIdx, panelIdx) {
  return `public/story/${keyOf(chapter, pageIdx, panelIdx)}.webp`;
}

/** Illustration de cette case : { src, w, h } (src relatif au site), ou null. */
export function storyImage(chapter, pageIdx, panelIdx) {
  return chapter ? IMAGES[keyOf(chapter, pageIdx, panelIdx)] || null : null;
}

/** Nom du fichier de positions des bulles d'un chapitre. */
export const layoutFileName = (chapter) => `public/story/chapitre-${chapter}/bulles-chapitre-${chapter}.json`;

// Propriétés de placement modifiables par l'éditeur (le TEXTE reste dans le code).
export const LAYOUT_PROPS = {
  bubbles: ['x', 'y', 'w', 'size', 'tail'],
  captions: ['x', 'y', 'w', 'size', 'right'],
  sfx: ['x', 'y', 'size', 'rot'],
};

/** Applique au chapitre les positions d'un fichier bulles-chapitre-N.json. */
export function applyLayout(chapter, cases = LAYOUTS[chapter?.id]) {
  if (!chapter || !cases) return chapter;
  chapter.pages.forEach((page, p) => (page.panels || []).forEach((panel, c) => {
    const saved = cases[caseKey(p, c)];
    if (!saved) return;
    for (const [list, props] of Object.entries(LAYOUT_PROPS)) {
      (saved[list] || []).forEach((item, i) => {
        const target = panel[list]?.[i];
        if (!target || !item) return;
        for (const k of props) {
          if (!(k in item)) continue;
          if (item[k] === null) delete target[k]; // null = valeur par défaut
          else target[k] = item[k];
        }
      });
    }
  }));
  return chapter;
}
