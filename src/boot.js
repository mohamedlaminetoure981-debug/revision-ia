// =====================================================================
// boot.js — Démarrage : la LANGUE d'abord, puis l'appli (src/main.js)
// ---------------------------------------------------------------------
// Les textes de l'interface sont traduits au moment où les écrans sont
// chargés : le dictionnaire doit donc être prêt AVANT. En français, rien
// n'est téléchargé en plus (le français est dans le code).
// =====================================================================

import './styles/main.css';
import { initI18n, getContent, mergeContent } from './i18n/index.js';

initI18n().then(async () => {
  // Répliques des persos et titres des chapitres traduits (s'ils existent) : fusionnés
  // dans les données d'origine ; ce qui manque reste en français.
  const persos = getContent('personnages');
  if (persos) mergeContent((await import('./data/characters.js')).CHARACTERS, persos);
  const histoire = getContent('histoire');
  if (histoire) mergeContent({ CHAPTERS: (await import('./data/story.js')).CHAPTERS }, histoire);
  await import('./main.js');
});
