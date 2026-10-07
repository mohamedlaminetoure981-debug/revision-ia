// =====================================================================
// story-widths.mjs — Tailles publiées des illustrations de la BD
// ---------------------------------------------------------------------
// Partagé par vite.config.js (build : création des fichiers WebP) et
// scripts/verifier-nettete.mjs (contrôle de la netteté à l'écran).
//
// Une illustration est publiée en plusieurs LARGEURS ; l'appli choisit la
// plus petite qui couvre la taille réellement affichée (src/comic/story-images.js).
// Jamais d'agrandissement : une image de 1376 px de large est publiée en
// 600, 900, 1200 et 1376 px (sa taille d'origine). Si tu déposes de plus grandes
// images (1600, 2000 px…), les versions 1600, 2000… sont créées toutes seules.
// =====================================================================

/** Largeurs candidates (px). La plus grande publiée garde le nom sans suffixe. */
export const STORY_WIDTHS = [600, 900, 1200, 1600, 2000, 2400];

/** Qualité WebP visée (0-100). */
export const STORY_QUALITY = 85;

/** Plafond de poids par largeur : filet de sécurité (la qualité baisse un peu, jamais sous 77). */
export const STORY_MAX_BYTES = { 600: 120 * 1024, 900: 220 * 1024, 1200: 330 * 1024, 1600: 480 * 1024, 2000: 640 * 1024, 2400: 800 * 1024 };

/**
 * Largeurs à publier pour une image de largeur `w` : celles qui ne l'agrandissent pas,
 * plus sa taille d'origine (jusqu'à 2400 px) si elle dépasse la dernière d'au moins 100 px.
 */
export function widthsFor(w) {
  const list = STORY_WIDTHS.filter((x) => x <= w);
  if (!list.length) return [Math.max(1, Math.round(w) || 1200)];
  const last = list.at(-1);
  if (w - last >= 100 && w <= STORY_WIDTHS.at(-1)) list.push(Math.round(w));
  return list;
}

/** Nom publié d'une largeur : chapitre-1/page-1-case-1.webp (la plus grande) ou …-900.webp */
export const variantName = (key, w, widths) => (w === widths.at(-1) ? `${key}.webp` : `${key}-${w}.webp`);

/** Plafond de poids d'une largeur (la plus proche par le haut). */
export const maxBytesFor = (w) => STORY_MAX_BYTES[Object.keys(STORY_MAX_BYTES).map(Number).find((x) => x >= w) ?? 2400];
