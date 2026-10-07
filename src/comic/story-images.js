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

/** Nom de fichier attendu (pageIdx et panelIdx commencent à 0) ; .png et .webp marchent aussi. */
export function storyFileName(chapter, pageIdx, panelIdx) {
  return `public/story/${keyOf(chapter, pageIdx, panelIdx)}.jpg`;
}

/** Illustration de cette case : { src, w, h, lqip, srcs } (chemins relatifs au site), ou null. */
export function storyImage(chapter, pageIdx, panelIdx) {
  return chapter ? IMAGES[keyOf(chapter, pageIdx, panelIdx)] || null : null;
}

// ---------------------------------------------------------------------
// CHOIX DE LA TAILLE (équivalent de srcset, que les images SVG n'ont pas)
// ---------------------------------------------------------------------
// Largeur affichée (px CSS) d'une CASE { w, h } (unités de page). Par défaut : estimation
// du lecteur "case par case" (zoom sur la case) ; le lecteur la précise à l'ouverture.
let displayWidth = (box) => {
  if (typeof window === 'undefined') return 1000;
  return Math.min(window.innerWidth - 20, (box.w * (window.innerHeight - 140)) / box.h);
};

/** Le lecteur indique comment la page est affichée : (case { w, h }) → largeur de la case en px CSS à l'écran. */
export function setDisplayWidth(fn) { displayWidth = fn; }

/** Connexion lente ou "économie de données" : on vise une image un peu plus légère. */
function slowNet() {
  const c = typeof navigator !== 'undefined' ? navigator.connection : null;
  return !!c && (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || ''));
}

/**
 * Part de l'image qui dépasse de la case : l'image remplit la case en gardant ses proportions
 * (recadrage « cover »), donc dans une case étroite elle est bien PLUS LARGE que la case.
 * Ex. image 16:9 dans une case de 305 × 400 : l'image fait 2,3 fois la largeur de la case.
 */
export const coverFactor = (img, box) => Math.max(1, (img.w / img.h) * (box.h / box.w) || 1);

/**
 * Fichier le mieux adapté à l'écran : la plus petite largeur publiée qui couvre la largeur
 * RÉELLEMENT affichée de l'IMAGE (case × recadrage) × densité de l'écran (jusqu'à 3 : téléphones
 * haute densité). Avant, seule la largeur de la case comptait : une image recadrée dans une case
 * étroite était agrandie, donc floue.
 */
export function pickSrc(img, box) {
  if (!img?.srcs) return img?.src || null;
  const dpr = typeof window !== 'undefined' ? Math.min(3, window.devicePixelRatio || 1) : 1;
  const need = displayWidth(box) * (img.w ? coverFactor(img, box) : 1) * dpr * (slowNet() ? 0.85 : 1);
  const widths = Object.keys(img.srcs).map(Number).sort((a, b) => a - b);
  const w = widths.find((x) => x >= need * 0.97) ?? widths.at(-1);
  return img.srcs[w];
}

// ---------------------------------------------------------------------
// PRÉCHARGEMENT
// ---------------------------------------------------------------------
const started = new Map(); // url → Promise (une seule fois par image)

/** Télécharge et décode une image à l'avance (priorité 'high' ou 'low'). */
export function preloadUrl(url, priority = 'low') {
  if (!url || typeof Image === 'undefined') return Promise.resolve();
  if (!started.has(url)) {
    const im = new Image();
    im.fetchPriority = priority;
    im.decoding = 'async';
    im.src = url;
    started.set(url, (im.decode ? im.decode() : new Promise((r) => { im.onload = r; })).catch(() => {}));
  }
  return started.get(url);
}

/**
 * La PREMIÈRE image seule (elle a tout le débit pour elle), puis les autres ensemble.
 * Sur une connexion lente, la case qu'on regarde devient nette bien plus tôt.
 */
export function preloadInOrder(urls, priority = 'low') {
  if (!urls.length) return Promise.resolve();
  const first = preloadUrl(urls[0], priority);
  return first.then(() => Promise.all(urls.slice(1).map((u) => preloadUrl(u, priority))));
}

/**
 * Précharge les illustrations d'une page, dans l'ordre de lecture (case 1 d'abord).
 * @param boxes cadres des cases { w, h } (unités de page), dans l'ordre
 * @param toUrl chemin relatif → adresse complète
 */
export function preloadPage(chapter, page, pageIdx, boxes, toUrl, priority = 'low') {
  const urls = (page?.panels || []).map((p, i) => {
    const img = storyImage(chapter, pageIdx, i);
    return img && toUrl(pickSrc(img, boxes[i] ?? { w: 948, h: 600 }));
  }).filter(Boolean);
  return preloadInOrder(urls, priority);
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
