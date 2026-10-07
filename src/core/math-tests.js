// =====================================================================
// math-tests.js — CHAÎNES DIFFICILES pour tester la chaîne des formules
// ---------------------------------------------------------------------
// Utilisées par `npm run verifier-maths` (contrôle automatique) et par la page
// « 🧪 Test des formules » du Panneau créateur (contrôle à l'œil sur téléphone).
//   input  : texte tel que l'IA (ou un ancien cours enregistré) peut le donner
//   expect : morceaux qui doivent se trouver dans le texte réparé (facultatif)
//   avoid  : morceaux qui ne doivent PAS s'y trouver (facultatif)
// Les caractères de contrôle (\t, \f, \n, \r, \b) imitent les commandes abîmées
// par les échappements JSON (\times → tabulation + « imes »…).
// =====================================================================

export const MATH_TESTS = [
  // --- Les erreurs réelles observées (cours « suites géométriques ») ---
  {
    name: '1. « $ » manquant au début (u_n$)',
    input: "Une suite (u_n$)_{n in ℕ} est géométrique s'il existe un réel $q$ tel que pour tout entier naturel $n$, on a $u_{n+1}$ = q $\\times$ $u_n$",
    expect: ['$(u_n)_{n \\in \\mathbb{N}}$', 'est géométrique', '$u_{n+1} = q \\times u_n$'],
  },
  {
    name: '2. Citation de la source (somme)',
    input: '$S_n = \\sum_{k=0}^{n}u_k = … \\times \\frac{1 - q^{n+1}}{1 - q}$',
    expect: ['\\sum_{k=0}^{n}', '\\frac{1 - q^{n+1}}{1 - q}', '\\dots'],
  },
  { name: '3. Barre oblique perdue : in', input: '$(u_n)_{n in \\mathbb{N}}$', expect: ['\\in \\mathbb{N}'] },
  { name: '3b. Barres perdues : times, frac, neq', input: 'On a $u_{n+1} = q times u_n$ et $q neq 1$, donc $S = frac{u_0}{1-q}$.', expect: ['\\times u_n', '\\neq 1', '\\frac{u_0}{1-q}'] },
  { name: '3c. Barres perdues : leq, geq, infty, to, lim', input: '$lim_{n to +infty} q^n = 0$ si $0 leq q$ et $q geq 0$', expect: ['\\lim_{n \\to', '\\infty', '\\leq q', '\\geq 0'] },
  { name: '3d. Barres perdues : sqrt, cdot, dots, mathbb', input: '$sqrt{9} = 3$, $2 cdot 3$, $u_0, u_1, dots$ et $n in mathbb{N}$', expect: ['\\sqrt{9}', '\\cdot 3', '\\dots', '\\in \\mathbb{N}'] },
  { name: '3e. Barres perdues : left, right', input: '$left(frac{1}{2}right)^n$', expect: ['\\left(\\frac{1}{2}\\right)^n'] },
  { name: '3f. JSON : \\t de \\times', input: 'On a $u_{n+1} = q \times u_n$ et $2 \times 3 = 6$', expect: ['\\times'] },
  { name: '3g. JSON : \\f de \\frac', input: 'La raison vaut $\frac{1}{2}$.', expect: ['\\frac{1}{2}'] },
  { name: '3h. JSON : \\n de \\neq', input: 'Pour $q \neq 1$ :', expect: ['\\neq 1'] },
  { name: '3i. JSON : \\r de \\right', input: '$\\left( \\frac{1}{3} \right)^k$', expect: ['\\right)^k'] },
  { name: '3j. JSON : \\b de \\binom, \\beta', input: '$\binom{n}{k}$ et $\beta = 2$', expect: ['\\binom{n}{k}', '\\beta'] },
  { name: '4. Fraction en ligne (lisible)', input: 'Avec $u_0 = 8$ et $q = \\frac{1}{2}$, on obtient $u_5 = 8 \\times \\left(\\frac{1}{2}\\right)^5 = \\frac{8}{32} = \\frac{1}{4}$.' },
  // --- Fractions, sommes, limites ---
  { name: 'Fractions imbriquées', input: '$S = \\frac{8}{1 - \\frac{1}{2}} = 16$ et $\\dfrac{\\frac{a}{b}}{\\frac{c}{d}}$' },
  { name: 'Somme infinie', input: '$$S = \\sum_{k=0}^{+\\infty} u_k = \\lim_{n \\to +\\infty} S_n = \\frac{u_0}{1-q}$$' },
  { name: 'Somme en ligne', input: 'On calcule $\\sum_{k=0}^{+\\infty} 6 \\times \\left(\\frac{1}{3}\\right)^k$.' },
  { name: 'Limites', input: 'Si $|q| < 1$, alors $\\lim_{n \\to +\\infty} q^n = 0$, donc $\\lim_{n\\to+\\infty} u_n = 0$.' },
  { name: 'Limite avec flèche Unicode', input: 'Si $q > 1$ et $u_0 > 0$, alors $\\lim_{n→+∞} u_n = +∞$.', expect: ['\\to', '\\infty'] },
  { name: 'Formule seule sur sa ligne', input: 'La somme vaut :\n$S_n = u_0 \\times \\frac{1 - q^{n+1}}{1 - q}$\npour $q \\neq 1$.' },
  { name: 'Quotient (méthode)', input: 'On calcule le quotient $\\frac{u_{n+1}}{u_n}$ (avec $u_n \\neq 0$) et on vérifie qu’il ne dépend pas de $n$.' },
  { name: 'Exemple vn = 3 × 5^n', input: 'Soit $v_n = 3 \\times 5^n$. Alors $\\frac{v_{n+1}}{v_n} = \\frac{3 \\times 5^{n+1}}{3 \\times 5^n} = 5$.' },
  // --- Ensembles, racines, Unicode ---
  { name: 'ℕ Unicode', input: 'pour tout $n ∈ ℕ$ : $u_n = u_0 × q^n$', expect: ['\\in \\mathbb{N}', '\\times q^n'] },
  { name: 'Racines', input: '$q = \\sqrt{9} = 3$, $\\sqrt[3]{8} = 2$ et $√2 ≈ 1,41$', expect: ['\\sqrt{2}', '1{,}41'] },
  { name: 'Symboles Unicode hors $', input: 'u_n = u_0 × q^n et q ≠ 1', expect: ['$u_n = u_0 \\times q^n$', '$q \\neq 1$'] },
  // --- Pourcentages, décimaux, espaces ---
  { name: 'Pourcentage dans une formule', input: 'Le capital augmente de $4 %$ : $C_{n+1} = C_n + 0,04 C_n = 1,04 \\times C_n$', expect: ['4 \\%', '1{,}04'] },
  { name: 'Pourcentage hors formule', input: 'Placé à 4 % par an, le capital $C_0 = 500 000$ GNF', expect: ['4 % par an', '500\\ 000'] },
  { name: 'Décimal à virgule', input: '$C_n = 500 000 \\times 1,04^n$', expect: ['1{,}04^n'] },
  { name: 'Espaces insécables', input: 'Si $q = 1$ : la suite est constante !' },
  { name: 'Grand nombre', input: '$C_0 = 500 000$ et $C_{10} ≈ 740 122$' },
  // --- Délimiteurs ---
  { name: '\\( \\) et \\[ \\]', input: 'On a \\(u_n = 2^n\\) et \\[S_n = 2^{n+1} - 1\\]', expect: ['$u_n = 2^n$', '$$S_n'] },
  { name: '$ en trop à la fin', input: 'La suite $u_n$ est croissante.$', avoid: ['$croissante'] },
  { name: 'Phrase entière entre $', input: '$u_n est une suite géométrique de raison q$', avoid: ['$u_n est'] },
  { name: 'Formule coupée en morceaux', input: '$u_{n+1}$ = $q$ $\\times$ $u_n$', expect: ['$u_{n+1} = q \\times u_n$'] },
  { name: 'Mot entre deux formules', input: '$u_n$ et $v_n$ sont géométriques', expect: ['$u_n$ et $v_n$'] },
  { name: '\\text dans une formule', input: '$u_n = 3 \\text{ pour tout } n$' },
  { name: 'Accolade manquante', input: '$u_{n+1 = q u_n$' },
  { name: 'Accolade en trop', input: '$\\frac{1}{2}} \\times q$' },
  { name: '\\left sans \\right', input: '$\\left( \\frac{1}{2} \\right.$ et $\\left[ 0 ; 1$' },
  // --- Écritures « à plat » de l'IA ---
  { name: 'u(n) et un+1', input: 'On a u(n+1) = q × u(n) et un+1 = 2un', expect: ['u_{n+1}', 'u_n'] },
  { name: 'Exposant long', input: '$x^10$ et $u_10$', expect: ['x^{10}', 'u_{10}'] },
  { name: 'Article « un » non modifié', input: 'Un capital est placé : on obtient un réel positif.', avoid: ['$'] },
  { name: 'Corrigé (ex. 1)', input: '$u_4 = 3 \\times 2^4 = 48$ ; $S_4 = 3 \\times \\frac{1 - 2^5}{1 - 2} = 93$.' },
  { name: 'Corrigé (ex. 2)', input: '$q^2 = \\frac{u_4}{u_2} = \\frac{162}{18} = 9$, donc $q = \\sqrt{9} = 3$ et $u_0 = \\frac{u_2}{q^2} = 2$.' },
  { name: 'Corrigé (ex. 3)', input: '$S = \\frac{6}{1 - \\frac{1}{3}} = \\frac{6}{\\frac{2}{3}} = 9$' },
  { name: 'Corrigé (ex. 4)', input: '$C_{n+1} = C_n + 0,04\\,C_n = 1,04 \\times C_n$, donc $C_n = 500\\,000 \\times 1,04^n$.' },
  { name: 'Markdown + maths', input: '**Définition** : une suite est *géométrique* si $u_{n+1} = q\\,u_n$.\n- terme général : $u_n = u_0 q^n$\n- somme : $S_n = u_0 \\frac{1-q^{n+1}}{1-q}$' },
  { name: 'Code non touché', input: 'Tape `u_n = 2^n` dans la calculatrice.', expect: ['`u_n = 2^n`'] },
];
