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

// Commandes LaTeX dont la barre oblique se perd souvent (« n in \mathbb{N} », « q times u_n »).
// Remises SEULEMENT dans une formule. Celles qui prennent un argument exigent « { » (ou « [ »).
const LOST_PLAIN = ['notin', 'in', 'times', 'neq', 'leq', 'geq', 'leqslant', 'geqslant', 'infty', 'to', 'sum', 'prod', 'lim', 'cdot', 'cdots', 'ldots', 'dots', 'approx', 'pm', 'div', 'forall', 'exists', 'Rightarrow', 'rightarrow', 'Leftrightarrow', 'iff', 'implies', 'alpha', 'beta', 'gamma', 'delta', 'Delta', 'lambda', 'varepsilon', 'epsilon', 'sigma', 'theta', 'omega', 'quad', 'qquad', 'subset', 'cup', 'cap', 'emptyset'];
const LOST_ARG = ['dfrac', 'tfrac', 'frac', 'sqrt', 'mathbb', 'mathrm', 'mathbf', 'text', 'binom', 'overline', 'vec', 'operatorname'];
const LOST_DELIM = ['left', 'right'];
// Mots qui peuvent être une commande sans barre (« le », « ne », « ge » sont aussi du français :
// seulement dans une formule sans autre mot français).
const LOST_AMBIG = ['le', 'ge', 'ne'];
// Mots « mathématiques » qui ne trahissent pas du français dans une formule.
const MATH_WORDS = new Set([...LOST_PLAIN, ...LOST_ARG, ...LOST_DELIM, 'lim', 'sin', 'cos', 'tan', 'ln', 'log', 'exp', 'max', 'min', 'sup', 'inf', 'det', 'mod', 'pgcd', 'ppcm', 'card', 'arccos', 'arcsin', 'arctan', 'ch', 'sh', 'th', 'dx', 'dt', 'dy', 'Im', 'Re', 'id', 'un', 'vn', 'wn', 'GNF', 'FCFA', 'cm', 'km', 'kg', 'mm', 'ml']);
const reWord = (w) => new RegExp(`(?<![\\\\A-Za-z])${w}(?![A-Za-z])`, 'g');

/** Remet la barre oblique des commandes perdues (dans une formule seulement). */
function restoreCommands(t) {
  for (const w of LOST_ARG) t = t.replace(new RegExp(`(?<![\\\\A-Za-z])${w}(?=\\s*[{[])`, 'g'), `\\${w}`);
  for (const w of LOST_DELIM) t = t.replace(new RegExp(`(?<![\\\\A-Za-z])${w}(?=\\s*(?:[()[\\]|.]|\\\\[{}|]))`, 'g'), `\\${w}`);
  for (const w of LOST_PLAIN) t = t.replace(reWord(w), `\\${w} `);
  // « le », « ge », « ne » seuls entre deux termes (x le 3) : \le, \ge, \ne
  for (const w of LOST_AMBIG) t = t.replace(new RegExp(`(?<=[\\w})]\\s)${w}(?=\\s[\\w\\\\({-])`, 'g'), `\\${w}`);
  return t.replace(/\\(\w+) +(?=[\s_^}),.=+\-]|$)/g, '\\$1');
}

/** Accolades et \left / \right équilibrés (sinon KaTeX refuse toute la formule). */
function balance(t) {
  let depth = 0; let out = '';
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '\\' && i + 1 < t.length) { out += c + t[++i]; continue; }
    if (c === '{') depth++;
    if (c === '}') { if (!depth) continue; depth--; }
    out += c;
  }
  out += '}'.repeat(depth);
  const L = (out.match(/\\left(?![A-Za-z])/g) || []).length; const R = (out.match(/\\right(?![A-Za-z])/g) || []).length;
  if (L !== R) out = out.replace(/\\(?:left|right)(?![A-Za-z])\s*/g, '');
  return out;
}

const UNI = [
  [/×/g, '\\times '], [/÷/g, '\\div '], [/≤/g, '\\leq '], [/≥/g, '\\geq '], [/≠/g, '\\neq '], [/→/g, '\\to '],
  [/⇒/g, '\\Rightarrow '], [/⇔/g, '\\Leftrightarrow '], [/∞/g, '\\infty '], [/∈/g, '\\in '], [/∉/g, '\\notin '],
  [/·/g, '\\cdot '], [/…/g, '\\dots '], [/−/g, '-'], [/±/g, '\\pm '], [/≈/g, '\\approx '], [/∑/g, '\\sum '], [/Σ(?=_)/g, '\\sum'],
  [/ℕ/g, '\\mathbb{N}'], [/ℤ/g, '\\mathbb{Z}'], [/ℚ/g, '\\mathbb{Q}'], [/ℝ/g, '\\mathbb{R}'], [/ℂ/g, '\\mathbb{C}'],
  [/√\s*(\d+(?:[.,]\d+)?|[A-Za-z])/g, '\\sqrt{$1}'], [/√/g, '\\sqrt'], [/²/g, '^2'], [/³/g, '^3'], [/ⁿ/g, '^n'],
  [/[\u00a0\u202f\u2009\u2007]/g, ' '], [/[‘’]/g, "'"],
];

/** Corrections à l'INTÉRIEUR d'une formule (le texte de \text{…} n'est pas touché). */
function fixInside(t) {
  t = restoreCommands(t);
  const kept = [];
  t = t.replace(/\\(?:text|mathrm|textbf|textit|operatorname|mbox)\s*\{[^{}]*\}/g, (m) => `\u0001${kept.push(m) - 1}\u0001`);
  for (const [re, by] of UNI) t = t.replace(re, by);
  t = t
    // u(n), u(n+1), U(0) → u_n, u_{n+1}, U_0 (pas f(x) : seulement les lettres de suite)
    .replace(new RegExp(`(?<![A-Za-z\\\\])(${SEQ})\\s*\\(\\s*(${IDX})\\s*\\)`, 'g'), (_, l, i) => l + sub(i))
    // u_(n+1) → u_{n+1} ; q^(n+1) → q^{n+1}
    .replace(/([_^])\(([^()]{1,12})\)/g, (_, op, i) => `${op}{${squash(i)}}`)
    // un+1, un-1, Un+1 (collés) → u_{n+1} ; 2un → 2u_n ; un, Un seuls → u_n (dans une formule)
    .replace(new RegExp(`(?<![A-Za-z\\\\{])(${SEQ})n([+-]\\d+)(?![\\d])`, 'g'), (_, l, k) => `${l}_{n${k}}`)
    .replace(new RegExp(`(?<![A-Za-z\\\\{])(${SEQ})(n)(?![A-Za-z_{(])`, 'g'), '$1_$2')
    // x^10 → x^{10} ; u_10 → u_{10} (sinon seul le 1er chiffre monte/descend)
    .replace(/([_^])(\d{2,})/g, '$1{$2}')
    // Pourcentage : « % » commence un commentaire en LaTeX (tout le reste disparaissait)
    .replace(/(?<!\\)%/g, '\\%')
    // Virgule décimale (1,04) : sans espace parasite après la virgule
    .replace(/(\d),(?=\d)/g, '$1{,}')
    // Espaces des grands nombres (500 000) gardés
    .replace(/(\d) (?=\d{3}(?!\d))/g, '$1\\ ')
    .replace(/\u0001(\d+)\u0001/g, (_, i) => kept[i]);
  return balance(t.replace(/[ \t]{2,}/g, ' ').trim());
}

// ---------------------------------------------------------------------
// Découpage texte / formule : retrouver le « $ » fautif
// ---------------------------------------------------------------------
const STRONG = /[_^\\{}=<>≤≥≠∈∉ℕℤℚℝℂ∞∑√×÷→]|\d\s*[+\-*/]\s*\d/;
const FR_SHORT = new Set(['et', 'ou', 'si', 'on', 'de', 'la', 'le', 'les', 'un', 'une', 'en', 'au', 'du', 'ne', 'est', 'il', 'pour', 'tout', 'donc', 'avec', 'par', 'que', 'qui', 'des', 'sa', 'son', 'se', 'sur', 'a', 'à', 'où', 'alors', 'car', 'mais', 'ni', 'soit', 'sont', 'sans', 'dans', 'tel', 'telle', 'puis', 'quand', 'lorsque', 'ainsi', 'vers', 'entre']);
// Petits mots français qui, seuls entre deux expressions mathématiques (« $u_n à u_{n+1}$ »), sortent de la formule.
// « a », « de », « un » restent : ce peuvent être des variables ou des suites (a, u_n…).
const GLUE_WORDS = ['à', 'et', 'ou', 'où', 'donc', 'si', 'alors', 'car', 'mais', 'ni', 'soit', 'sont', 'est', 'pour', 'avec', 'sans', 'dans', 'sur', 'par', 'tel', 'telle', 'puis', 'quand', 'lorsque', 'ainsi', 'vers', 'entre', 'que', 'qui'];

/** Mots français présents dans un morceau (hors \text{…} et hors commandes LaTeX). */
export function frenchWords(piece) {
  const t = piece.replace(/\\(?:text|mathrm|textbf|textit|operatorname|mbox)\s*\{[^{}]*\}/g, ' ').replace(/\\[A-Za-z]+/g, ' ');
  return (t.match(/[A-Za-zÀ-ÖØ-öø-ÿœŒ]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ]+)?/g) || [])
    .filter((w) => (w.length >= 2 && !MATH_WORDS.has(w)) || /^[àâéèêôùûçÀ]$/.test(w));
}

/** 'text' (contient du français), 'math' (formule) ou 'neutral' (espaces, signes, lettre isolée). */
function classify(piece) {
  const words = frenchWords(piece);
  const strong = STRONG.test(piece);
  if (words.length) {
    // « a et b », « u_n à u_{n+1} » : seulement de petits mots de liaison → formule (le mot ressortira : splitGlue)
    if (words.every((w) => GLUE_WORDS.includes(w.toLowerCase())) && /[A-Za-z0-9\\)}]\s+\S+\s+[A-Za-z0-9\\({|]/.test(piece)) return 'math';
    // « x le 3 » : un seul mot ambigu au milieu d'une formule → c'est \le
    if (strong && words.every((w) => LOST_AMBIG.includes(w)) && words.length === 1) return 'math';
    if (words.length >= 2 || words.some((w) => w.length >= 3 || FR_SHORT.has(w.toLowerCase()))) return 'text';
  }
  if (strong) return 'math';
  return /[A-Za-z0-9]/.test(piece) && piece.trim().length <= 3 && /^[\s\d+\-*/().,=A-Za-z]*$/.test(piece) ? 'neutral' : (piece.trim() ? 'neutral' : 'empty');
}

/**
 * Une « formule » où un petit mot français sépare deux expressions (« u_n à u_{n+1} ») :
 * le mot ressort → « $u_n$ à $u_{n+1}$ ». Les \text{…} ne sont pas touchés.
 */
function splitGlue(tex) {
  const kept = [];
  const t = tex.replace(/\\(?:text|mathrm|textbf|textit|operatorname|mbox)\s*\{[^{}]*\}/g, (m) => `\u0001${kept.push(m) - 1}\u0001`);
  const re = new RegExp(`(?<=[\\w})\\]|]) +(${GLUE_WORDS.join('|')}) +(?=[\\w\\\\({|\\u0001])`, 'gi');
  if (!re.test(t)) return `$${fixInside(tex)}$`;
  const parts = t.split(new RegExp(` +(?:${GLUE_WORDS.join('|')}) +(?=[\\w\\\\({|\\u0001])`, 'i'));
  const words = [...t.matchAll(new RegExp(` +(${GLUE_WORDS.join('|')}) +(?=[\\w\\\\({|\\u0001])`, 'gi'))].map((m) => m[1]);
  let out = '';
  parts.forEach((p, k) => {
    const piece = p.replace(/\u0001(\d+)\u0001/g, (_, i) => kept[i]).trim();
    if (piece) out += `$${fixInside(piece)}$`;
    if (k < words.length) out += ` ${words[k]} `;
  });
  return out;
}

/**
 * Répare une ligne : chaque morceau entre deux « $ » est classé (texte ou formule).
 * Si les « $ » sont déséquilibrés, ou si une « formule » contient du français, le
 * découpage est refait : on ne fait plus confiance à la parité des « $ ».
 */
function repairLine(line) {
  const pieces = line.split(/(?<!\\)\$/);
  if (pieces.length === 1) return fixOutside(line);
  const kinds = pieces.map(classify);
  const nDollars = pieces.length - 1;
  const parityOk = nDollars % 2 === 0 && pieces.every((p, i) => i % 2 === 0 || kinds[i] !== 'text');
  // Étiquette de chaque morceau : parité respectée → morceaux impairs = formules ;
  // sinon → chaque morceau selon son contenu.
  let lab = pieces.map((p, i) => (parityOk ? (i % 2 ? 'math' : (kinds[i] !== 'text' && !/^\s*[.,;:!?)]/.test(p) ? 'math?' : 'text')) : kinds[i]));
  // Un morceau neutre (« = q ») ou vide entre deux formules fait partie de la formule.
  lab = lab.map((l, i) => {
    if (l === 'math') return 'math';
    if (l === 'text') return 'text';
    const prev = lab.slice(0, i).reverse().find((x) => x !== 'empty');
    const next = lab.slice(i + 1).find((x) => x !== 'empty');
    const near = (x) => x === 'math' || x === 'math?';
    if (l === 'math?') return near(prev) && near(next) ? 'math' : 'text';
    // Les « $ » étant faux, une variable seule ($q$, $n$, $3$) reste une formule.
    if (!parityOk && /^\s*[A-Za-z0-9]{1,3}\s*$/.test(pieces[i]) && !FR_SHORT.has(pieces[i].trim().toLowerCase())) return 'math';
    return near(prev) && near(next) ? 'math' : 'text';
  });
  // Regroupe les morceaux voisins de même nature (les « $ » entre eux disparaissent).
  let out = '';
  for (let i = 0; i < pieces.length;) {
    let j = i; let buf = '';
    while (j < pieces.length && lab[j] === lab[i]) buf += pieces[j++];
    if (lab[i] === 'math' && buf.trim()) {
      const lead = buf.match(/^\s*/)[0]; const trail = buf.match(/\s*$/)[0];
      out += `${lead}${splitGlue(buf.trim())}${trail}`;
    } else out += fixOutside(buf);
    i = j;
  }
  return out;
}

// ---------------------------------------------------------------------
// Maths écrites HORS formule (« (u_n)_{n in ℕ} », « \frac{1}{2} ») → entre $…$
// ---------------------------------------------------------------------
// Noyaux sûrs : commande LaTeX (avec ses arguments), lettre/chiffre/parenthèse suivi de _ ou ^,
// symbole mathématique Unicode.
const CORE = /\\[A-Za-z]+(?:\[[^\]]*\])?(?:\s*\{(?:[^{}]|\{[^{}]*\})*\})*|(?:(?<![A-Za-zÀ-ÿ\\])[A-Za-z]|(?<![A-Za-zÀ-ÿ\\\d])\d+|\))[_^](?:\{(?:[^{}]|\{[^{}]*\})*\}|\([^()\s]{1,10}\)|-?[A-Za-z0-9]{1,3}(?![A-Za-zÀ-ÿ]))|[ℕℤℚℝℂ∞∑√≤≥≠∈]/g;
const OPS = '=+\\-−×÷*/<>≤≥≠∈→';

/** Étend une formule trouvée aux opérations voisines : « 2 × u_n = 3 », « (u_n) ». */
function grow(t, s, e) {
  const isOp = (c) => OPS.includes(c);
  const operand = (i, dir) => { // longueur d'un opérande (nombre, lettre seule, parenthèse) à partir de i
    if (dir > 0) {
      const m = t.slice(i).match(/^(?:\d+(?:[.,]\d+)?|[A-Za-z](?![A-Za-zÀ-ÿ'’])|\\[A-Za-z]+(?:\{[^{}]*\})*)/);
      return m ? m[0].length : 0;
    }
    const m = t.slice(0, i).match(/(?:\d+(?:[.,]\d+)?|(?<![A-Za-zÀ-ÿ'’])[A-Za-z])$/);
    return m ? m[0].length : 0;
  };
  // Le noyau est un symbole de relation (≠, ≤, ∈…) : il prend un opérande de chaque côté.
  if (e - s === 1 && OPS.includes(t[s])) {
    let m = e; while (t[m] === ' ') m++;
    const n = operand(m, 1); if (n) e = m + n;
    let k = s; while (t[k - 1] === ' ') k--;
    const p = operand(k, -1); if (p) s = k - p;
  }
  for (let moved = true; moved;) {
    moved = false;
    // à droite : « ) » fermant, ou [espace] opérateur [espace] opérande
    let k = e; while (t[k] === ' ') k++;
    if (t[e] === ')' && (t.slice(s, e).split('(').length > t.slice(s, e).split(')').length)) { e++; moved = true; continue; }
    if (isOp(t[k])) { let m = k + 1; while (t[m] === ' ') m++; const n = operand(m, 1) || (t[m] === '(' ? 1 : 0); if (n) { e = m + n; moved = true; continue; } }
    if (/[0-9]/.test(t[e - 1]) && /[A-Za-z]/.test(t[e]) && !/[A-Za-zÀ-ÿ]/.test(t[e + 1] || '')) { e++; moved = true; continue; }
    // à gauche : « ( », opérande opérateur, chiffre collé (2u_n)
    k = s; while (t[k - 1] === ' ') k--;
    if (t[s - 1] === '(') { s--; moved = true; continue; }
    if (isOp(t[k - 1])) { let m = k - 1; while (t[m - 1] === ' ') m--; const n = operand(m, -1) || (t[m - 1] === ')' ? 1 : 0); if (n) { s = m - n; moved = true; continue; } }
    if (/\d/.test(t[s - 1])) { s--; moved = true; continue; }
  }
  return [s, e];
}

/** Corrections HORS formule : u(n) → $u_n$, un+1 → $u_{n+1}$, (u_n)_{n in ℕ} → $(u_n)_{n \in \mathbb{N}}$… */
function fixOutside(t) {
  if (!t.trim()) return t;
  t = t
    .replace(new RegExp(`(?<![A-Za-zÀ-ÿ\\\\])(${SEQ})\\s*\\(\\s*(\\d*n(?:\\s*[+-]\\s*\\d+)?|\\d+)\\s*\\)`, 'g'), (_, l, i) => `${l}${sub(i)}`)
    // "un+1" collé (jamais "un + 1" avec espaces : "ajouter un + 1" reste du français)
    .replace(new RegExp(`(?<![A-Za-zÀ-ÿ\\\\])(${SEQ})n([+-]\\d+)(?![\\d])`, 'g'), (_, l, k) => `${l}_{n${k}}`)
    // "Un" en début de mot suivi de "=" : U_n = … (pas "Un élève")
    .replace(new RegExp(`(?<![A-Za-zÀ-ÿ\\\\])(${SEQ})n(?=\\s*=)`, 'g'), (_, l) => `${l}_n`)
    // "un" juste après un signe de calcul (= q × un, 2un) : c'est u_n, pas l'article
    .replace(new RegExp(`(?<=[×*/]\\s?|\\d)(${SEQ})n(?![A-Za-zÀ-ÿ0-9_])`, 'g'), (_, l) => `${l}_n`)
    .replace(new RegExp(`(?<=[=+-]\\s?)(${SEQ})n(?=\\s*(?:[-+×*/=.,;:)]|$))`, 'gm'), (_, l) => `${l}_n`);
  // Formules repérées puis étendues, puis fusionnées si elles se touchent.
  const spans = [];
  for (const m of t.matchAll(CORE)) {
    // « in » et « to » perdus au milieu d'une formule restent dans la formule (ils sont dans les accolades)
    const [s, e] = grow(t, m.index, m.index + m[0].length);
    if (spans.length && s <= spans.at(-1)[1] + 1 && !/[A-Za-zÀ-ÿ]{2,}/.test(t.slice(spans.at(-1)[1], s))) spans.at(-1)[1] = Math.max(e, spans.at(-1)[1]);
    else spans.push([s, e]);
  }
  if (!spans.length) return t;
  let out = ''; let last = 0;
  for (let [s, e] of spans) {
    let tex = t.slice(s, e);
    // ponctuation finale et parenthèse ouvrante orpheline laissées dehors
    const tail = tex.match(/[\s.,;:!?]*$/)[0]; tex = tex.slice(0, tex.length - tail.length); e -= tail.length;
    if (!tex.trim() || !/[_^\\ℕℤℚℝℂ∞∑√≤≥≠∈]/.test(tex)) continue;
    out += `${t.slice(last, s)}$${fixInside(tex)}$`;
    last = e;
  }
  return out + t.slice(last);
}

/**
 * RÉPARATION des maths d'un texte (Markdown + LaTeX), avant tout affichage :
 *  - caractères abîmés par les échappements JSON réparés (\t → \times, \f → \frac…) ;
 *  - \( … \) et \[ … \] convertis en $…$ et $$…$$ ;
 *  - « $ » déséquilibrés ou formules qui contiennent du français : découpage refait ;
 *  - commandes sans barre oblique remises (in → \in…) dans les formules seulement ;
 *  - notations mal écrites corrigées (u(n) → u_n, x^10 → x^{10}, 1,04, %, ℕ…) ;
 *  - maths écrites hors formule mises entre $…$.
 * Résultat : uniquement des $…$ (en ligne) et $$…$$ (seuls sur leur ligne), bien appariés.
 * Les blocs de code (`…`) ne sont pas touchés.
 */
export function normalizeMath(text) {
  let s = repairControlChars(String(text ?? ''));
  if (!s) return s;
  const kept = [];
  const keep = (v) => `\u0002${kept.push(v) - 1}\u0002`;
  s = s.replace(/`[^`\n]+`/g, keep)
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, t) => `$$${t}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, t) => `$${t}$`)
    // \$ (vrai signe dollar) mis de côté
    .replace(/\\\$/g, keep)
    // Formules centrées $$…$$ (bien appariées) : réparées à part, sur leur propre ligne
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => keep(`\n$$${fixInside(t.replace(/\s*\n\s*/g, ' '))}$$\n`))
    .replace(/\$\$/g, '$');
  s = s.split('\n').map(repairLine).join('\n');
  // Lignes vides parasites autour des formules centrées
  s = s.replace(/\u0002(\d+)\u0002/g, (_, i) => kept[i]);
  return s.replace(/^[ \t]*\n(?=\$\$)/gm, '').replace(/(\$\$)\n[ \t]*\n/g, '$1\n').replace(/^\n+|\n+$/g, (m) => (text.startsWith('\n') ? m : ''));
}

/**
 * Découpe un texte RÉPARÉ en morceaux : [{ text }] ou [{ tex, display }].
 * À utiliser après normalizeMath (les « $ » y sont toujours appariés).
 */
export function mathSegments(fixed) {
  const out = [];
  let last = 0;
  for (const m of String(fixed).matchAll(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g)) {
    if (m.index > last) out.push({ text: fixed.slice(last, m.index) });
    out.push(m[1] !== undefined ? { tex: m[1].trim(), display: true } : { tex: m[2].trim(), display: false });
    last = m.index + m[0].length;
  }
  if (last < fixed.length) out.push({ text: fixed.slice(last) });
  return out;
}

/** Une formule « haute » (fraction, somme, limite…) : affichée en grand pour rester lisible. */
export const isTallMath = (tex) => /\\(?:d?frac|sum|prod|lim|int|binom|sqrt\s*\{[^{}]*\\frac)/.test(tex);

/** Version de secours encore plus prudente d'une formule refusée par KaTeX. */
export function safeTex(tex) {
  return balance(String(tex).replace(/\\(?:left|right|big|Big|bigg|Bigg)(?![A-Za-z])\s*/g, '').replace(/&/g, '\\&').replace(/#/g, '\\#'));
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

/** Convertit une formule LaTeX en texte Unicode lisible (aussi : secours si KaTeX refuse une formule). */
export function texToText(tex) {
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
