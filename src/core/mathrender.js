// =====================================================================
// mathrender.js — RENDU DES MATHS (texte réparé → HTML), sans accès à la page
// ---------------------------------------------------------------------
// Partagé par l'appli (src/ui/ui.js) et par le contrôle automatique
// (scripts/verifier-maths.mjs, qui passe le HTML dans un vrai DOM).
//   formulaHTML(katex, tex, display) : UNE formule → HTML KaTeX (null si invalide)
//   renderMathText(text, block, renderFormula) : texte entier → { html, saved }
// Espaces autour des formules : un VRAI espace est toujours présent entre un mot et
// une formule (ajouté si l'IA a collé le mot au « $ »), et chaque formule en ligne est
// enveloppée dans <span class="mi"> (marge CSS) : les lettres italiques de KaTeX
// « mangeaient » visuellement l'espace avant la formule. Pas d'espace avant « , . ) ».
// =====================================================================

import { normalizeMath, mathSegments, isTallMath, safeTex } from './mathfix.js';

/** KaTeX strict : HTML de la formule, ou null si elle est invalide (même en version prudente). */
export function formulaHTML(katex, tex, display) {
  const t = !display && isTallMath(tex) ? `\\displaystyle ${tex}` : tex;
  for (const x of [t, safeTex(t)]) {
    try {
      const html = katex.renderToString(x, { displayMode: display, throwOnError: true, strict: 'ignore', output: 'html' });
      return !display && t !== tex ? `<span class="math-tall">${html}</span>` : html;
    } catch { /* essai suivant */ }
  }
  return null;
}

const WORD = /[A-Za-zÀ-ÖØ-öø-ÿŒœ0-9]/;
const LETTER = /[A-Za-zÀ-ÖØ-öø-ÿŒœ]/;
/** Ponctuation qui colle à la formule qui précède (pas d'espace avant). */
const TIGHT_AFTER = /^[,.;:!?)\]}»…'’\-–]/;
/** Début de phrase ou ouverture : pas d'espace après (« (u_n) », « « x »). */
const TIGHT_BEFORE = /[(\[{«'’\-–/]$/;

/**
 * Texte réparé → texte avec une espace entre un mot et une formule en ligne.
 * « réel$q$ » → « réel $q$ » ; « $q$est » → « $q$ est » ; « $q$, » et « ($q$) » inchangés.
 */
export function spaceAroundMath(fixed) {
  const segs = mathSegments(fixed);
  let out = '';
  segs.forEach((seg, i) => {
    if (seg.text !== undefined) { out += seg.text; return; }
    if (seg.display) { out += `$$${seg.tex}$$`; return; }
    const prev = out.slice(-1); const next = (segs[i + 1]?.text ?? '')[0] ?? '';
    // lettre collée avant : espace (un chiffre collé « 2$x$ » reste : produit)
    if (LETTER.test(prev)) out += ' ';
    out += `$${seg.tex}$`;
    if (next && LETTER.test(next)) out += ' ';
  });
  return out;
}

/**
 * FONCTION CENTRALE : texte (Markdown + LaTeX, même abîmé) → { html, saved }.
 * html contient des repères \u0000n\u0000 ; saved[n] = formule rendue.
 * @param {string} text
 * @param {boolean} block true = formule haute seule sur sa ligne : centrée (texte long)
 * @param {(tex: string, display: boolean) => string} renderFormula rendu d'UNE formule
 */
export function renderMathText(text, block, renderFormula) {
  const saved = [];
  const keep = (html) => `\u0000${saved.push(html) - 1}\u0000`;
  let s = spaceAroundMath(normalizeMath(text));
  // Une formule haute seule sur sa ligne (fraction, somme, limite) : centrée, en grand.
  if (block) s = s.replace(/^[ \t]*\$([^$\n]+)\$[ \t]*([.,;:]?)[ \t]*$/gm, (m, t, p) => (isTallMath(t) ? `$$${t}${p === '.' || p === ',' ? `\\,${p}` : ''}$$` : m));
  const segs = mathSegments(s);
  const html = segs.map((seg, i) => {
    if (seg.text !== undefined) return seg.text;
    const display = block && seg.display;
    const out = renderFormula(seg.tex, display);
    if (seg.display && !display) return keep(out);
    if (display) return keep(out);
    // Formule en ligne : marge à gauche (sauf après une ouverture), à droite (sauf avant une ponctuation)
    const before = segs[i - 1]?.text ?? ''; const after = segs[i + 1]?.text ?? '';
    const cls = ['mi', !before || TIGHT_BEFORE.test(before) ? 'mi-l0' : '', !after || TIGHT_AFTER.test(after) ? 'mi-r0' : ''].filter(Boolean).join(' ');
    return keep(`<span class="${cls}">${out}</span>`);
  }).join('');
  return { html, saved };
}
