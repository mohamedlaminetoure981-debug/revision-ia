// =====================================================================
// mathfix.js — NOTATION MATHÉMATIQUE CORRECTE PARTOUT
// ---------------------------------------------------------------------
// 1. repairJsonLatex(texte JSON brut)  → AVANT JSON.parse (réponses de Gemini)
//    En JSON, "\f", "\t", "\n", "\b", "\r" sont des caractères spéciaux : un
//    "\frac" mal échappé par l'IA devenait [saut de page]+"rac", "\times"
//    [tabulation]+"imes", "\neq" [retour à la ligne]+"eq"… et "\sqrt", "\le"
//    rendaient le JSON illisible. On double ces barres obliques à la source.
// 2. normalizeMath(texte)  → À L'AFFICHAGE (aussi pour les cours déjà enregistrés)
//    - répare les caractères déjà abîmés (saut de page + "rac" → \frac…) ;
//    - corrige les écritures courantes mal formées : u(n) → u_n,
//      un+1 → u_{n+1}, x^10 → x^{10}, q^(n+1) → q^{n+1}… ;
//    - met entre $…$ les maths écrites hors formule (u_n, q^n, \frac{1}{2}…).
// 3. latexToText(texte)  → texte simple avec symboles Unicode (uₙ, x², ½, √, ≤, →)
//    pour les images (cartes, planches manga, statuts) où KaTeX ne peut pas aller.
//
// Aucune dépendance, aucun accès à la page : testable avec Node.
// =====================================================================

// Commandes LaTeX qui commencent par une lettre qui est AUSSI un échappement JSON.
const T_CMDS = new Set(['times', 'to', 'tan', 'tanh', 'text', 'textbf', 'textit', 'textrm', 'textsf', 'texttt', 'textnormal', 'textstyle', 'tfrac', 'theta', 'tau', 'tilde', 'top', 'triangle', 'therefore', 'tbinom', 'tt', 'triangleq']);
// \n… : on écarte "ne", "nu", "not" hors formule (un retour à la ligne suivi de
// "ne pas…" ou "nu" est du vrai texte).
const N_SURE = new Set(['neq', 'nabla', 'notin', 'neg', 'nleq', 'ngeq', 'nleqslant', 'ngeqslant', 'nmid', 'nexists', 'newline', 'nless', 'ngtr', 'nsubseteq', 'nrightarrow', 'nearrow', 'nwarrow', 'natural']);
const N_MATH = new Set(['ne', 'nu', 'not']);

/**
 * Répare un texte JSON brut avant JSON.parse : dans les chaînes, toute barre
 * oblique qui commence une commande LaTeX (ou un échappement invalide) est doublée.
 */
export function repairJsonLatex(raw) {
  const s = String(raw ?? '');
  if (!s.includes('\\')) return s;
  let out = '';
  let inStr = false;
  let dollars = 0; // nombre de $ depuis le début de la chaîne en cours (impair = dans une formule)
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (!inStr) {
      if (c === '"') { inStr = true; dollars = 0; }
      out += c;
      continue;
    }
    if (c === '"') { inStr = false; out += c; continue; }
    if (c === '$') dollars++;
    if (c !== '\\') { out += c; continue; }
    const n = s[i + 1];
    const word = (s.slice(i + 1).match(/^[A-Za-z]+/) || [''])[0];
    const inMath = dollars % 2 === 1;
    let latex = false;
    if (n === '\\' || n === '"' || n === '/') {
      // Échappement JSON valide : "\\\\" peut aussi être un \\ LaTeX (retour à la ligne) — gardé tel quel.
      out += c + n; i++; continue;
    } else if (n === 'u') {
      latex = !/^u[0-9a-fA-F]{4}/.test(s.slice(i + 1, i + 6));
    } else if (n === 'b' || n === 'f') {
      latex = word.length > 1 || inMath; // \b, \f seuls : jamais voulus dans un texte
    } else if (n === 'r') {
      latex = word.length > 1; // \rightarrow, \rho… (\r\n reste un retour à la ligne)
    } else if (n === 't') {
      latex = T_CMDS.has(word);
    } else if (n === 'n') {
      latex = N_SURE.has(word) || (inMath && N_MATH.has(word));
    } else {
      latex = true; // \s, \l, \a, \{, \, … : invalides en JSON → forcément du LaTeX
    }
    out += latex ? '\\\\' : c + n;
    if (!latex) i++;
  }
  return out;
}

/** JSON.parse tolérant au LaTeX mal échappé (réparé seulement si besoin). */
export function parseJsonLatex(raw) {
  const fixed = repairJsonLatex(raw);
  try { return JSON.parse(fixed); } catch (e) {
    if (fixed !== raw) { try { return JSON.parse(raw); } catch { /* erreur d'origine */ } }
    throw e;
  }
}

// ---------------------------------------------------------------------
// Réparation des caractères déjà abîmés (cours enregistrés avant la correction)
// ---------------------------------------------------------------------
function repairControlChars(s) {
  if (!/[\b\f\t\r\n]/.test(s)) return s;
  // Saut de page / retour arrière : n'apparaissent jamais dans un vrai texte.
  s = s.replace(/\f(?=[a-z])/g, '\\f').replace(/\x08(?=[a-z])/g, '\\b');
  // Retour chariot isolé suivi d'une lettre : \rightarrow, \rho…
  s = s.replace(/\r(?=[a-z]{2,})/g, '\\r');
  s = s.replace(/\t([a-z]+)/g, (m, w) => (T_CMDS.has(`t${w}`) ? `\\t${w}` : m));
  // Retour à la ligne + "eq" : \neq. Ambigu ("ne", "nu"…) seulement dans une formule.
  let out = '';
  let dollars = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '$') dollars++;
    if (c === '\n') {
      const w = `n${(s.slice(i + 1).match(/^[a-z]+/) || [''])[0]}`;
      if (w.length > 1 && (N_SURE.has(w) || (dollars % 2 === 1 && N_MATH.has(w)))) { out += '\\n'; continue; }
    }
    out += c;
  }
  return out;
}

// ---------------------------------------------------------------------
// Écritures mal formées → notation correcte
// ---------------------------------------------------------------------
const SEQ = '[uvwUVW]'; // lettres habituelles des suites
// Indice d'une suite : n, n+1, n-1, 2n, 2n+1, k, p, 0, 1, 10…
const IDX = '(?:\\d*n(?:\\s*[+-]\\s*\\d+)?|[kp](?:\\s*[+-]\\s*\\d+)?|\\d+)';
const squash = (t) => t.replace(/\s+/g, '');
const sub = (t) => (squash(t).length > 1 ? `_{${squash(t)}}` : `_${squash(t)}`);

/** Corrections à l'INTÉRIEUR d'une formule (le texte de \text{…} n'est pas touché). */
function fixInside(t) {
  const kept = [];
  t = t.replace(/\\(?:text|mathrm|textbf|operatorname)\{[^{}]*\}/g, (m) => `\u0001${kept.push(m) - 1}\u0001`);
  return t
    // u(n), u(n+1), U(0) → u_n, u_{n+1}, U_0 (pas f(x) : seulement les lettres de suite)
    .replace(new RegExp(`(?<![A-Za-z\\\\])(${SEQ})\\s*\\(\\s*(${IDX})\\s*\\)`, 'g'), (_, l, i) => l + sub(i))
    // u_(n+1) → u_{n+1} ; q^(n+1) → q^{n+1}
    .replace(/([_^])\(([^()]{1,12})\)/g, (_, op, i) => `${op}{${squash(i)}}`)
    // un+1, un-1, Un+1 (collés) → u_{n+1} ; 2un → 2u_n ; un, Un seuls → u_n (dans une formule)
    .replace(new RegExp(`(?<![A-Za-z\\\\{])(${SEQ})n([+-]\\d+)(?![\\d])`, 'g'), (_, l, k) => `${l}_{n${k}}`)
    .replace(new RegExp(`(?<![A-Za-z\\\\{])(${SEQ})(n)(?![A-Za-z_{(])`, 'g'), '$1_$2')
    // u_n+1 écrit comme indice : laissé tel quel (peut vouloir dire u_n + 1)
    // x^10 → x^{10} ; u_10 → u_{10} (sinon seul le 1er chiffre monte/descend)
    .replace(/([_^])(\d{2,})/g, '$1{$2}')
    // Symboles Unicode courants que KaTeX rend mal en mode formule
    .replace(/×/g, '\\times ').replace(/÷/g, '\\div ').replace(/≤/g, '\\leq ').replace(/≥/g, '\\geq ')
    .replace(/≠/g, '\\neq ').replace(/→/g, '\\to ').replace(/⇒/g, '\\Rightarrow ').replace(/⇔/g, '\\Leftrightarrow ')
    .replace(/∞/g, '\\infty ')
    .replace(/\u0001(\d+)\u0001/g, (_, i) => kept[i]);
}

// Maths écrites HORS formule, à mettre entre $…$ (on reste prudent : jamais un mot français).
const BARE = [
  // commandes LaTeX avec arguments : \frac{a}{b}, \sqrt{2}, \sqrt[3]{x}, \lim_{n \to +\infty}, \sum_{k=0}^{n}
  /\\(?:d?frac|binom)\{[^{}]*\}\{[^{}]*\}/g,
  /\\sqrt(?:\[[^\]]*\])?\{[^{}]*\}/g,
  /\\(?:lim|sum|prod|int)(?:_\{[^{}]*\}|_[A-Za-z0-9])?(?:\^\{[^{}]*\}|\^[A-Za-z0-9])?/g,
  // symboles isolés : \times, \leq, \to, \infty, \pi…
  /\\(?:times|cdot|div|pm|leq?|geq?|leqslant|geqslant|neq|approx|equiv|to|rightarrow|Rightarrow|Leftrightarrow|infty|pi|alpha|beta|gamma|delta|Delta|lambda|mu|sigma|theta|in|notin|subset|cup|cap|forall|exists|mathbb\{[A-Z]\})(?![A-Za-z])/g,
  // u_n, u_{n+1}, U_0, x_1 ; q^n, x^2, 2^{n+1}, e^{-x}
  /(?<![A-Za-z\\])[A-Za-z]_(?:\{[^{}\s]{1,12}\}|\([^()\s]{1,10}\)|[A-Za-z0-9]{1,2})(?![A-Za-z])/g,
  /(?<![A-Za-z\\])[A-Za-z0-9)]+\^(?:\{[^{}]{1,12}\}|\([^()]{1,10}\)|-?[A-Za-z0-9]{1,3})(?![A-Za-z])/g,
];

/** Corrections HORS formule : u(n) → $u_n$, un+1 → $u_{n+1}$, u_n → $u_n$… */
function fixOutside(t) {
  t = t
    .replace(new RegExp(`(?<![A-Za-zÀ-ÿ\\\\])(${SEQ})\\s*\\(\\s*(\\d*n(?:\\s*[+-]\\s*\\d+)?|\\d+)\\s*\\)`, 'g'), (_, l, i) => `$${l}${sub(i)}$`)
    // "un+1" collé (jamais "un + 1" avec espaces : "ajouter un + 1" reste du français)
    .replace(new RegExp(`(?<![A-Za-zÀ-ÿ\\\\])(${SEQ})n([+-]\\d+)(?![\\d])`, 'g'), (_, l, k) => `$${l}_{n${k}}$`)
    // "Un" en début de mot suivi de "=" : U_n = … (pas "Un élève")
    .replace(new RegExp(`(?<![A-Za-zÀ-ÿ\\\\])(${SEQ})n(?=\\s*=)`, 'g'), (_, l) => `$${l}_n$`)
    // "un" juste après un signe de calcul (= q × un, 2un) : c'est u_n, pas l'article
    .replace(new RegExp(`(?<=[×*/]\\s?|\\d)(${SEQ})n(?![A-Za-zÀ-ÿ0-9_])`, 'g'), (_, l) => `$${l}_n$`)
    .replace(new RegExp(`(?<=[=+-]\\s?)(${SEQ})n(?=\\s*(?:[-+×*/=.,;:)]|$))`, 'gm'), (_, l) => `$${l}_n$`);
  // Chaque motif n'agit que sur le texte encore hors formule (pas de $ dans un $…$).
  for (const re of BARE) {
    t = t.split(/(\$[^$\n]+\$)/).map((part, k) => (k % 2 ? part : part.replace(re, (m) => `$${fixInside(m)}$`))).join('');
  }
  return t;
}

/**
 * Normalise un texte (Markdown + LaTeX) avant affichage : caractères abîmés réparés,
 * notations mal écrites corrigées, maths hors formule mises entre $…$.
 * Les blocs de code (`…`) ne sont pas touchés.
 */
export function normalizeMath(text) {
  let s = repairControlChars(String(text ?? ''));
  // Découpe : formules ($$…$$, $…$, \[…\], \(…\)), code (`…`) et texte normal.
  const re = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$|`[^`\n]+`)/g;
  let out = '';
  let last = 0;
  for (let m; (m = re.exec(s));) {
    out += fixOutside(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('`')) out += tok;
    else if (tok.startsWith('$$')) out += `$$${fixInside(tok.slice(2, -2))}$$`;
    else if (tok.startsWith('$')) out += `$${fixInside(tok.slice(1, -1))}$`;
    else out += tok.slice(0, 2) + fixInside(tok.slice(2, -2)) + tok.slice(-2);
    last = m.index + tok.length;
  }
  out += fixOutside(s.slice(last));
  return out;
}

// ---------------------------------------------------------------------
// LaTeX → texte Unicode (images, aperçus, lecteurs d'écran)
// ---------------------------------------------------------------------
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ' };
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ' };
const SYMBOLS = {
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', leq: '≤', le: '≤', leqslant: '≤', geq: '≥', ge: '≥', geqslant: '≥', neq: '≠', ne: '≠',
  approx: '≈', equiv: '≡', sim: '∼', to: '→', rightarrow: '→', longrightarrow: '⟶', leftarrow: '←', Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', iff: '⇔', implies: '⇒',
  infty: '∞', pi: 'π', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', epsilon: 'ε', varepsilon: 'ε', lambda: 'λ', mu: 'μ', sigma: 'σ', Sigma: 'Σ',
  theta: 'θ', omega: 'ω', Omega: 'Ω', phi: 'φ', varphi: 'φ', rho: 'ρ', tau: 'τ', nu: 'ν',
  in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', cup: '∪', cap: '∩', emptyset: '∅', varnothing: '∅', forall: '∀', exists: '∃', neg: '¬',
  sum: 'Σ', prod: 'Π', int: '∫', partial: '∂', nabla: '∇', ldots: '…', cdots: '⋯', dots: '…', circ: '∘', degree: '°', perp: '⊥', parallel: '∥', angle: '∠',
  lim: 'lim', ln: 'ln', log: 'log', exp: 'exp', sin: 'sin', cos: 'cos', tan: 'tan', max: 'max', min: 'min',
  quad: ' ', qquad: '  ', ',': ' ', ';': ' ', '!': '', ' ': ' ', '{': '{', '}': '}', '%': '%', '&': '&', '#': '#', '_': '_', '$': '$',
};
const BB = { N: 'ℕ', Z: 'ℤ', Q: 'ℚ', R: 'ℝ', C: 'ℂ' };
const FRAC = { '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/5': '⅕', '1/6': '⅙', '1/8': '⅛' };

/** Argument entre accolades à la position i (renvoie [contenu, position après]). */
function group(s, i) {
  while (s[i] === ' ') i++;
  if (s[i] !== '{') return [s[i] ?? '', i + 1];
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}' && --depth === 0) return [s.slice(i + 1, j), j + 1];
  }
  return [s.slice(i + 1), s.length];
}
const script = (t, table, mark) => {
  const chars = [...t.replace(/\s+/g, '')];
  return chars.every((c) => table[c]) ? chars.map((c) => table[c]).join('') : `${mark}(${t})`;
};
const atom = (t) => (/^[\w.²³ⁿ√π∞]+$/u.test(t) ? t : `(${t})`);

/** Convertit une formule LaTeX en texte Unicode lisible. */
function texToText(tex) {
  let s = String(tex);
  let out = '';
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (c === '\\') {
      const m = s.slice(i + 1).match(/^([A-Za-z]+|.)/);
      const cmd = m ? m[1] : '';
      i += 1 + cmd.length;
      if (cmd === 'frac' || cmd === 'dfrac' || cmd === 'tfrac') {
        const [a, j] = group(s, i); const [b, k] = group(s, j); i = k;
        const A = texToText(a); const B = texToText(b);
        out += FRAC[`${A}/${B}`] || `${atom(A)}/${atom(B)}`;
      } else if (cmd === 'sqrt') {
        let n = '';
        if (s[i] === '[') { const e = s.indexOf(']', i); n = s.slice(i + 1, e); i = e + 1; }
        const [a, j] = group(s, i); i = j;
        const A = texToText(a);
        out += `${n === '3' ? '∛' : n === '4' ? '∜' : n ? script(n, SUP, '^') : ''}√${atom(A)}`;
      } else if (cmd === 'mathbb') {
        const [a, j] = group(s, i); i = j; out += BB[a] || a;
      } else if (['text', 'mathrm', 'textbf', 'mathbf', 'textit', 'mathit', 'operatorname', 'boldsymbol', 'bm', 'textrm', 'textnormal', 'overline', 'vec', 'hat', 'bar', 'widehat', 'underline', 'boxed'].includes(cmd)) {
        const [a, j] = group(s, i); i = j;
        const A = texToText(a);
        out += cmd === 'vec' ? `${A}⃗` : cmd === 'overline' || cmd === 'bar' ? `${A}̄` : A;
      } else if (cmd === 'left' || cmd === 'right' || cmd === 'big' || cmd === 'Big' || cmd === 'bigg' || cmd === 'displaystyle') {
        if (s[i] === '.') i++;
      } else if (cmd === 'binom') {
        const [a, j] = group(s, i); const [b, k] = group(s, j); i = k; out += `C(${texToText(a)}, ${texToText(b)})`;
      } else if (cmd === '\\') {
        out += ' ; ';
      } else {
        out += SYMBOLS[cmd] ?? cmd;
        if (/^[A-Za-z]+$/.test(cmd) && ['lim', 'ln', 'log', 'exp', 'sin', 'cos', 'tan', 'max', 'min'].includes(cmd) && s[i] !== '_' && s[i] !== '^') out += ' ';
      }
    } else if (c === '_' || c === '^') {
      const [a, j] = group(s, i + 1); i = j;
      const A = texToText(a);
      out += c === '_' ? (A.length > 6 ? ` (${A}) ` : script(A, SUB, '_')) : script(A, SUP, '^');
    } else if (c === '{' || c === '}') {
      i++;
    } else {
      out += c; i++;
    }
  }
  return out.replace(/[ \t]{2,}/g, ' ').replace(/\s+([,.;)])/g, '$1').trim();
}

/**
 * Texte simple (sans LaTeX ni Markdown) avec les symboles mathématiques en Unicode :
 * "$u_{n+1} = q \times u_n$" → "uₙ₊₁ = q × uₙ". Pour les images et les aperçus.
 */
export function latexToText(text) {
  const s = normalizeMath(text);
  return s
    .replace(/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$/g, (_, a, b, c, d) => texToText(a ?? b ?? c ?? d))
    .replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1').replace(/^#+\s*/gm, '');
}
