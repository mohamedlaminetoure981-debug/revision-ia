// =====================================================================
// math.js — KaTeX (formules) + sa feuille de style, chargés à la demande
// ---------------------------------------------------------------------
// Ce module n'est PAS chargé au démarrage de l'appli (≈ 270 Ko) : voir
// preloadMath() dans ui.js.
// =====================================================================
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default katex;
