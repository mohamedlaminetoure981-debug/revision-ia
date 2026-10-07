// =====================================================================
// mathcheck.js — CONTRÔLE DES FORMULES (après réparation)
// ---------------------------------------------------------------------
// checkMath(texte, katex) : répare le texte (normalizeMath), puis vérifie chaque
// morceau : formule acceptée par KaTeX (mode strict), pas de français dans une
// formule, pas de LaTeX brut ni de caractère de contrôle dans le texte.
// Utilisé par : scripts/verifier-maths.mjs (npm run verifier-maths), la page
// « 🧪 Test des formules » du Panneau créateur, et la vérification des réponses
// de l'IA (generate.js : une demande de correction si une formule reste invalide).
// KaTeX est passé en paramètre : ce module ne charge rien lui-même.
// =====================================================================

import { normalizeMath, mathSegments, isTallMath, safeTex, frenchWords } from './mathfix.js';

/** La formule passe-t-elle dans KaTeX (comme à l'affichage) ? */
export function katexOk(katex, tex, display = false) {
  const t = !display && isTallMath(tex) ? `\\displaystyle ${tex}` : tex;
  for (const x of [t, safeTex(t)]) {
    try { katex.renderToString(x, { displayMode: display, throwOnError: true, strict: 'ignore' }); return true; } catch { /* essai suivant */ }
  }
  return false;
}

/**
 * @returns {{ fixed: string, segments: object[], errors: string[] }}
 */
export function checkMath(text, katex) {
  const fixed = normalizeMath(text);
  const segments = mathSegments(fixed);
  const errors = [];
  for (const seg of segments) {
    if (seg.text !== undefined) {
      const raw = seg.text.replace(/`[^`]*`/g, '');
      if (/\\[A-Za-z]{2,}|[_^]\{|(?<!\\)\$/.test(raw)) errors.push(`LaTeX brut hors formule : « ${raw.trim().slice(0, 60)} »`);
    } else {
      if (katex && !katexOk(katex, seg.tex, seg.display)) errors.push(`formule refusée par KaTeX : $${seg.tex}$`);
      const fr = frenchWords(seg.tex).filter((w) => w.length >= 3);
      if (fr.length >= 2) errors.push(`français dans une formule : $${seg.tex}$`);
    }
  }
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(fixed.replace(/[\u0000]/g, ''))) errors.push('caractère de contrôle restant (échappement JSON)');
  return { fixed, segments, errors };
}

/** Toutes les chaînes d'un objet (réponse JSON de l'IA). */
export function allStrings(obj, out = []) {
  if (typeof obj === 'string') out.push(obj);
  else if (Array.isArray(obj)) obj.forEach((x) => allStrings(x, out));
  else if (obj && typeof obj === 'object') Object.values(obj).forEach((x) => allStrings(x, out));
  return out;
}

/** Formules encore invalides après réparation, dans toute une réponse de l'IA (max 12). */
export function badFormulas(obj, katex) {
  const bad = [];
  for (const s of allStrings(obj)) {
    if (!/[$\\_^]/.test(s)) continue;
    const { errors } = checkMath(s, katex);
    for (const e of errors) if (/KaTeX|brut/.test(e) && bad.length < 12) bad.push(e);
  }
  return bad;
}

// ---------------------------------------------------------------------
// Contrôle du TEXTE AFFICHÉ (rendu dans un vrai DOM : jsdom ou le navigateur)
// ---------------------------------------------------------------------
/**
 * Texte lu par l'élève : chaque formule est remplacée par ⟦ses signes⟧, les caractères invisibles
 * sont retirés et les espaces normalisés. Ex. « un réel ⟦q⟧ tel que » : on voit tout de suite
 * s'il y a une espace avant et après la formule.
 */
export function shownText(root) {
  const clone = root.cloneNode(true);
  clone.querySelectorAll('.katex').forEach((k) => {
    k.replaceWith(clone.ownerDocument.createTextNode(`⟦${k.textContent}⟧`));
  });
  return clone.textContent.replace(/[\u200b\u2060]/g, '').replace(/[\s\u00a0]+/g, ' ').trim();
}

/**
 * Espaces autour des formules en ligne : une vraie espace entre un mot et la formule
 * (avant ET après), sauf après une ouverture « ( » ou avant une ponctuation « , . ) ».
 * Les formules portent la classe « mi » (mi-l0 / mi-r0 = pas d'espace attendu de ce côté).
 * @returns {string[]} problèmes trouvés
 */
export function checkSpacing(root, expectShown = []) {
  const errors = [];
  for (const m of root.querySelectorAll('.mi')) {
    const prev = m.previousSibling; const next = m.nextSibling;
    const ptxt = prev?.nodeType === 3 ? prev.data : ''; const ntxt = next?.nodeType === 3 ? next.data : '';
    const label = shownText(m).slice(0, 20);
    if (!m.classList.contains('mi-l0') && ptxt && !/\s$/.test(ptxt)) errors.push(`pas d'espace AVANT la formule « ${label} » (après « ${ptxt.slice(-12)} »)`);
    if (!m.classList.contains('mi-r0') && ntxt && !/^\s/.test(ntxt)) errors.push(`pas d'espace APRÈS la formule « ${label} » (avant « ${ntxt.slice(0, 12)} »)`);
    if (m.classList.contains('mi-l0') && /[A-Za-zÀ-ÿ0-9]$/.test(ptxt)) errors.push(`formule « ${label} » collée au mot « ${ptxt.slice(-12)} »`);
  }
  // Les attentes décrivent le texte et les espaces ; le contenu d'une formule (⟦…⟧) est contrôlé ailleurs.
  const skeleton = (x) => x.replace(/⟦[^⟧]*⟧/g, '⟦⟧');
  const txt = shownText(root);
  for (const e of expectShown) if (!skeleton(txt).includes(skeleton(e))) errors.push(`texte affiché attendu : « ${e} » (obtenu : « ${skeleton(txt).slice(0, 120)} »)`);
  return errors;
}
