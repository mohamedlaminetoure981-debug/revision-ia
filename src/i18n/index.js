// =====================================================================
// i18n/index.js — Langues de l'appli
// ---------------------------------------------------------------------
// PRINCIPE : le texte FRANÇAIS sert de repère. Dans le code, chaque texte
// de l'interface est écrit t('Texte en français') :
//   - en français, t() renvoie le texte tel quel (l'appli ne change pas) ;
//   - dans une autre langue, t() cherche la traduction dans
//     src/i18n/<langue>.json ({ "Texte en français": "Translation" }) ;
//   - traduction absente → le texte français s'affiche (jamais de vide).
// La liste complète des textes est dans src/i18n/fr.json
// (régénérée par : npm run i18n:extraire).
//
// RÉPLIQUES DES PERSOS ET BD : fichiers src/i18n/contenu/<langue>/*.json
// (même forme que les données d'origine, seulement les champs traduits),
// fusionnés au démarrage ; ce qui manque reste en français. Remplis par
// le script : npm run traduire -- en (voir README).
//
// La langue est choisie AVANT le chargement de l'appli (src/boot.js) :
// changer de langue recharge la page (à la demande de l'élève seulement).
// Langues de droite à gauche (arabe…) : <html dir="rtl"> est posé tout seul.
// =====================================================================

/** Langues proposées : code → nom affiché (dans sa propre langue). */
export const LANGS = { fr: 'Français', en: 'English' };
/** Langues qui s'écrivent de droite à gauche (pour plus tard). */
const RTL = ['ar', 'he', 'fa', 'ur'];
const KEY = 'lang';

// Dictionnaires d'interface et contenus traduits, chargés seulement pour la langue choisie.
const UI = import.meta.glob(['./*.json', '!./fr.json']);
const CONTENT = import.meta.glob('./contenu/*/*.json');

let lang = 'fr';
let dict = null;
const content = {};

/** Langue du téléphone si elle est proposée, sinon le français. */
function detect() {
  for (const l of navigator.languages || [navigator.language || '']) {
    const code = String(l).slice(0, 2).toLowerCase();
    if (LANGS[code]) return code;
  }
  return 'fr';
}

/** Langue choisie (enregistrée), sinon détectée. */
export function savedLang() {
  try { const l = localStorage.getItem(KEY); if (l && LANGS[l]) return l; } catch { /* navigation privée */ }
  return detect();
}

/** Charge la langue (à appeler UNE fois, avant l'appli : voir src/boot.js). */
export async function initI18n() {
  lang = savedLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL.includes(lang) ? 'rtl' : 'ltr';
  if (lang === 'fr') return; // le français est déjà dans le code : rien à charger
  const load = UI[`./${lang}.json`];
  try { dict = load ? (await load()).default : null; } catch { dict = null; } // hors ligne sans cache : français
  for (const [path, imp] of Object.entries(CONTENT)) {
    const m = path.match(/^\.\/contenu\/([^/]+)\/([^/]+)\.json$/);
    if (m && m[1] === lang) {
      try { content[m[2]] = (await imp()).default; } catch { /* reste en français */ }
    }
  }
}

/** Langue de l'appli ('fr', 'en'…). */
export function getLang() {
  return lang;
}

/** Change de langue (choix de l'élève) : enregistrée, puis la page se recharge. */
export function setLang(l) {
  if (!LANGS[l]) return;
  try { localStorage.setItem(KEY, l); } catch { /* navigation privée */ }
  if (l !== lang) location.reload();
}

/** Locale pour les dates et nombres (Intl). */
export function locale() {
  return lang === 'fr' ? 'fr-FR' : lang;
}

/**
 * Traduit un texte de l'interface (le texte français sert de repère).
 * Les espaces autour du texte sont gardés ; traduction absente → français.
 */
export function t(fr) {
  if (!dict || typeof fr !== 'string') return fr;
  const k = fr.replace(/\s+/g, ' ').trim();
  const tr = dict[k];
  if (!tr) return fr;
  return fr.match(/^\s*/)[0] + tr + fr.match(/\s*$/)[0];
}

/**
 * Fusionne une traduction dans des données d'origine (répliques, BD…) :
 * chaque texte traduit remplace le texte français ; le reste ne bouge pas.
 * Listes : élément par élément (une liste plus courte garde la fin en français).
 */
export function mergeContent(target, tr) {
  if (!tr || typeof tr !== 'object' || !target || typeof target !== 'object') return target;
  for (const [k, v] of Object.entries(tr)) {
    if (!(k in target)) continue;
    if (typeof v === 'string') { if (v.trim() && typeof target[k] === 'string') target[k] = v; } else if (v && typeof v === 'object') mergeContent(target[k], v);
  }
  return target;
}

/** Contenu traduit chargé ('personnages', 'bd', 'histoire') ou null. */
export function getContent(name) {
  return content[name] || null;
}
