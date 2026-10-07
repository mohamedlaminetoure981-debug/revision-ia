// =====================================================================
// verifier-maths.mjs — CONTRÔLE DE LA CHAÎNE DES FORMULES
// ---------------------------------------------------------------------
//   npm run verifier-maths
// Passe des dizaines de chaînes difficiles (src/core/math-tests.js) dans la
// réparation (normalizeMath) puis dans KaTeX en mode strict, et vérifie aussi la
// lecture du JSON de l'IA (barres obliques mal échappées). Signale tout échec :
//   ✗ formule refusée par KaTeX, français dans une formule, LaTeX brut hors
//     formule, caractère de contrôle restant, résultat attendu absent.
// =====================================================================

import katex from 'katex';
import { MATH_TESTS } from '../src/core/math-tests.js';
import { checkMath, checkSpacing } from '../src/core/mathcheck.js';
import { renderMathText, formulaHTML } from '../src/core/mathrender.js';
import { JSDOM } from 'jsdom';
import { parseJsonLatex, latexToText } from '../src/core/mathfix.js';

const verbose = process.argv.includes('-v');
// Rendu EXACTEMENT comme dans l'appli (renderMathText), puis lu dans un vrai DOM (jsdom).
const renderDom = (text, block) => {
  const { html, saved } = renderMathText(text, block, (tex, display) => formulaHTML(katex, tex, display) ?? `<span class="math-plain">${tex}</span>`);
  const dom = new JSDOM(`<div id="r">${html.replace(/\u0000(\d+)\u0000/g, (_, i) => saved[i])}</div>`);
  return dom.window.document.getElementById('r');
};
let fails = 0;
for (const t of MATH_TESTS) {
  const { fixed, errors } = checkMath(t.input, katex);
  for (const e of t.expect || []) if (!fixed.includes(e)) errors.push(`attendu : « ${e} »`);
  for (const e of t.avoid || []) if (fixed.includes(e)) errors.push(`à éviter : « ${e} »`);
  // Texte affiché : espaces avant/après chaque formule, en texte long (rich) et en texte court (mathText).
  for (const block of [true, false]) for (const e of checkSpacing(renderDom(t.input, block), block ? t.shown || [] : [])) errors.push(`affichage ${block ? 'long' : 'court'} : ${e}`);
  if (errors.length) fails++;
  console.log(`${errors.length ? '✗' : '✓'} ${t.name}`);
  if (errors.length || verbose) {
    console.log(`    entrée  : ${JSON.stringify(t.input)}`);
    console.log(`    réparée : ${fixed}`);
    console.log(`    texte   : ${latexToText(t.input)}`);
    for (const e of errors) console.log(`    ✗ ${e}`);
  }
}

// Lecture du JSON brut de l'IA (barres obliques simples, invalides en JSON).
const JSON_TESTS = [
  [String.raw`{"t":"$\frac{1}{2}$ et $q \times u_n$, $q \neq 1$"}`, '$\\frac{1}{2}$ et $q \\times u_n$, $q \\neq 1$'],
  [String.raw`{"t":"$\lim_{n \to +\infty} q^n = 0$ et $\sqrt{9} \leq 3$"}`, '$\\lim_{n \\to +\\infty} q^n = 0$ et $\\sqrt{9} \\leq 3$'],
  [String.raw`{"t":"$\left(\frac{1}{3}\right)^k$ et $\binom{n}{k}$"}`, '$\\left(\\frac{1}{3}\\right)^k$ et $\\binom{n}{k}$'],
  [String.raw`{"t":"Ligne 1\nLigne 2 : $n \in \mathbb{N}$"}`, 'Ligne 1\nLigne 2 : $n \\in \\mathbb{N}$'],
  [String.raw`{"t":"$\\frac{1}{2}$ bien échappé"}`, '$\\frac{1}{2}$ bien échappé'],
];
for (const [raw, want] of JSON_TESTS) {
  let got;
  try { got = parseJsonLatex(raw).t; } catch (e) { got = `ERREUR ${e.message}`; }
  const ok = got === want;
  if (!ok) fails++;
  console.log(`${ok ? '✓' : '✗'} JSON ${raw.slice(0, 50)}`);
  if (!ok) console.log(`    obtenu  : ${JSON.stringify(got)}\n    attendu : ${JSON.stringify(want)}`);
}

const total = MATH_TESTS.length + JSON_TESTS.length;
console.log(`\n${total} chaînes contrôlées — ${fails ? `${fails} échec(s)` : 'aucun échec'}.`);
process.exit(fails ? 1 : 0);
