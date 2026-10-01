// =====================================================================
// prompts.js — TOUTES les consignes (prompts) envoyées à Gemini
// ---------------------------------------------------------------------
// 👉 C'est LE fichier à modifier pour changer le comportement de l'IA.
//
// Chaque fonctionnalité a :
//   - un texte de consigne (ce qu'on demande à l'IA) ;
//   - un "schéma" (la forme exacte du JSON que l'IA doit renvoyer).
//
// Tu peux modifier librement les TEXTES des consignes.
// Si tu modifies un SCHÉMA (ajout/suppression de champ), il faut aussi
// adapter le code qui utilise ce champ (voir le README).
//
// Types possibles dans un schéma : OBJECT, ARRAY, STRING, INTEGER,
// NUMBER, BOOLEAN. "required" = champs obligatoires.
// =====================================================================

// ---------------------------------------------------------------------
// Rôle général de l'IA (envoyé avec chaque demande)
// ---------------------------------------------------------------------
// ⚡ Consignes volontairement COURTES : moins de texte envoyé = réponse plus rapide.
export const SYSTEM = `Prof particulier pour lycéen/étudiant francophone (Guinée). Français simple, tutoiement.
Exactitude avant tout ; uniquement d'après le cours fourni.
Formules en LaTeX $...$ ou $$...$$. Markdown simple autorisé.
"quote" = citation copiée mot pour mot du cours (10 à 25 mots).`;

// Morceau de schéma réutilisé : le passage source dans le cours.
const SOURCE = {
  type: 'OBJECT',
  properties: {
    page: { type: 'INTEGER', description: 'Numéro de la page ou de la photo (celui indiqué entre [[ ]])' },
    quote: { type: 'STRING', description: 'Citation courte copiée mot pour mot du cours' },
  },
  required: ['page', 'quote'],
};

/**
 * Met le texte du cours en forme pour l'envoyer à l'IA.
 * Chaque page est précédée d'un repère : [[Page 3]] ou [[Photo 3]].
 */
export function courseText(pages, unitLabel) {
  // Espaces et lignes vides en trop supprimés : moins de texte à envoyer.
  const compact = (t) => String(t).replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return pages.map((p) => `[[${unitLabel} ${p.n}]]\n${compact(p.text)}`).join('\n');
}

// =====================================================================
// 1. TRANSCRIPTION des photos / pages scannées → texte
// =====================================================================
export const TRANSCRIBE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    pages: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          n: { type: 'INTEGER', description: "Numéro de l'image (celui indiqué avant l'image)" },
          text: { type: 'STRING', description: 'Transcription complète en Markdown' },
        },
        required: ['n', 'text'],
      },
    },
  },
  required: ['pages'],
};

export function transcribePrompt(numbers) {
  return `Voici ${numbers.length} image(s) d'un cours (numéros : ${numbers.join(', ')}).
Transcris INTÉGRALEMENT le texte de chaque image, sans rien résumer ni omettre :
- conserve les titres, listes, tableaux (en Markdown) et la structure ;
- écris les formules en LaTeX ($...$) ;
- décris brièvement les schémas/figures entre crochets : [Figure : ...] ;
- si un mot est illisible, écris [illisible].
Renvoie un élément par image, avec son numéro "n".`;
}

// =====================================================================
// 2. RÉSUMÉ structuré (partie par partie)
// =====================================================================
export const SUMMARY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    sections: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          pages: { type: 'ARRAY', items: { type: 'INTEGER' } },
          blocks: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                kind: { type: 'STRING', enum: ['cours', 'explication'] },
                text: { type: 'STRING' },
              },
              required: ['kind', 'text'],
            },
          },
        },
        required: ['title', 'blocks'],
      },
    },
  },
  required: ['sections'],
};

export function summaryPrompt(text, unitLabel) {
  return `Résume ce cours partie par partie, dans l'ordre, sans oublier aucune notion, formule ou méthode.
Une section par partie (titre + n° de ${unitLabel.toLowerCase()}). Commence par la 1re partie, courte.
Blocs "cours" = contenu fidèle et concis. Si un passage est peu expliqué, ajoute juste après un bloc
"explication" simple (avec un exemple si utile).

COURS :
${text}`;
}

// =====================================================================
// 3. FICHES question / réponse
// =====================================================================
export const CARDS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    cards: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          part: { type: 'STRING', description: 'Titre de la partie du cours' },
          question: { type: 'STRING' },
          answer: { type: 'STRING' },
          source: SOURCE,
        },
        required: ['part', 'question', 'answer', 'source'],
      },
    },
  },
  required: ['cards'],
};

export function cardsPrompt(text) {
  return `Fiches question/réponse couvrant TOUTES les notions de ce cours (définitions, formules, méthodes, pièges).
Une notion par fiche ; réponse courte (1-3 phrases ou une formule) ; source (page + citation).

COURS :
${text}`;
}

// =====================================================================
// 4. QUIZ (QCM)
// =====================================================================
export const QUIZ_SCHEMA = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          question: { type: 'STRING' },
          choices: { type: 'ARRAY', items: { type: 'STRING' } },
          correctIndex: { type: 'INTEGER', description: 'Indice (à partir de 0) de la bonne réponse' },
          explanation: { type: 'STRING' },
          source: SOURCE,
        },
        required: ['question', 'choices', 'correctIndex', 'explanation', 'source'],
      },
    },
  },
  required: ['questions'],
};

export function quizPrompt(text, count, avoid = []) {
  return `QCM de ${count} questions réparties sur tout le cours. 4 choix plausibles, 1 seule bonne réponse.
Mélange définitions, compréhension et petits calculs. "explanation" : pourquoi c'est juste (2 phrases max).
Source : page + citation.${avoid.length ? `\nNe repose pas : ${avoid.slice(0, 20).map((q) => q.slice(0, 70)).join(' | ')}` : ''}

COURS :
${text}`;
}

// =====================================================================
// 5. EXERCICES D'APPLICATION (Awa) — phase 2
// =====================================================================
export const EXERCISES_SCHEMA = {
  type: 'OBJECT',
  properties: {
    exercises: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Titre court' },
          statement: { type: 'STRING', description: 'Énoncé complet (Markdown + LaTeX)' },
          difficulty: { type: 'STRING', enum: ['facile', 'moyen', 'difficile'] },
          hint: { type: 'STRING', description: 'Petit indice sans donner la réponse' },
          source: SOURCE,
        },
        required: ['title', 'statement', 'difficulty', 'hint', 'source'],
      },
    },
  },
  required: ['exercises'],
};

export function exercisesPrompt(text, count, avoid = []) {
  return `Crée ${count} exercices d'application sur ce cours, du plus facile au plus difficile.
- Des exercices concrets qui font APPLIQUER le cours : calculs, démonstrations courtes,
  algorithmes, cas pratiques, selon la matière. Données numériques précises si calcul.
- Chaque exercice doit pouvoir être résolu avec le cours seul.
- Énoncé clair et complet (formules en LaTeX). Un indice qui aide sans donner la réponse.
- Donne la source (page/photo + citation mot pour mot) de la notion utilisée.
${avoid.length ? `\nÉvite ces exercices déjà proposés :\n- ${avoid.slice(0, 40).join('\n- ')}\n` : ''}
COURS :
${text}`;
}

// Correction d'une réponse d'exercice, étape par étape.
export const CORRECTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    grade: { type: 'NUMBER', description: 'Note sur 20' },
    verdict: { type: 'STRING', enum: ['excellent', 'bon', 'moyen', 'a_retravailler'] },
    steps: {
      type: 'ARRAY',
      description: "Correction étape par étape de la réponse de l'élève",
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          status: { type: 'STRING', enum: ['juste', 'partiel', 'faux', 'manquant'] },
          comment: { type: 'STRING', description: 'Ce qui est juste / faux et pourquoi' },
        },
        required: ['title', 'status', 'comment'],
      },
    },
    solution: { type: 'STRING', description: 'Corrigé complet et rédigé (Markdown + LaTeX)' },
    advice: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Conseils et astuces pour progresser' },
    source: SOURCE,
  },
  required: ['grade', 'verdict', 'steps', 'solution', 'advice', 'source'],
};

export function correctionPrompt(text, statement, answer, hasImage) {
  return `Tu es Awa, une coach exigeante mais bienveillante. Corrige la réponse de l'élève à cet exercice.
- Appuie-toi UNIQUEMENT sur le cours ci-dessous (méthodes, notations, formules).
- Corrige ÉTAPE PAR ÉTAPE : pour chaque étape attendue, dis si elle est juste, partielle,
  fausse ou manquante, et explique pourquoi. Vérifie chaque calcul.
- Note sur 20, juste et motivante (valorise la méthode même si le résultat est faux).
- Donne un corrigé complet et 2 à 4 conseils concrets.
- Jamais moqueur. Tutoie l'élève.
${hasImage ? "- La réponse de l'élève est (en partie) sur la photo jointe : lis-la attentivement.\n" : ''}
ÉNONCÉ :
${statement}

RÉPONSE DE L'ÉLÈVE :
${answer || '(voir la photo)'}

COURS :
${text}`;
}

// =====================================================================
// 6. MODE VÉRIFICATION (2e appel qui relit le travail de l'IA) — phase 2
// =====================================================================
export const VERIFY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          index: { type: 'INTEGER', description: "Numéro de l'élément vérifié (à partir de 0)" },
          status: { type: 'STRING', enum: ['ok', 'corrige', 'faux'] },
          fixed: { type: 'STRING', description: 'Si "corrige" : la version corrigée. Sinon vide.' },
          fixedIndex: { type: 'INTEGER', description: 'Quiz : bon indice si corrigé ; correction d’exercice : note corrigée ; sinon -1' },
          comment: { type: 'STRING', description: 'Pourquoi (court)' },
        },
        required: ['index', 'status', 'fixed', 'fixedIndex', 'comment'],
      },
    },
  },
  required: ['items'],
};

export function verifyCardsPrompt(text, cards) {
  return `Tu es un relecteur très rigoureux. Vérifie chaque fiche en la comparant au COURS.
Pour chaque fiche (index à partir de 0) :
- "ok" si la réponse est exacte et conforme au cours ;
- "corrige" si elle contient une erreur ou une imprécision : donne la réponse corrigée dans "fixed" ;
- "faux" si la question elle-même n'a pas de sens ou n'est pas couverte par le cours.
Mets "fixedIndex" à -1. Sois bref dans "comment".

FICHES :
${cards.map((c, i) => `[${i}] Q : ${c.question}\n    R : ${c.answer}`).join('\n')}

COURS :
${text}`;
}

export function verifyQuizPrompt(text, questions) {
  return `Tu es un relecteur très rigoureux. Vérifie chaque question de QCM en la comparant au COURS.
Pour chaque question (index à partir de 0) :
- "ok" si la bonne réponse indiquée est juste et l'explication correcte ;
- "corrige" si la bonne réponse ou l'explication est fausse : mets le bon indice dans "fixedIndex"
  (à partir de 0) et l'explication corrigée dans "fixed" ;
- "faux" si la question est ambiguë (plusieurs bonnes réponses) ou hors du cours.
Sinon "fixedIndex" = -1 et "fixed" vide.

QUESTIONS :
${questions.map((q, i) => `[${i}] ${q.question}\n${q.choices.map((c, k) => `    ${k}) ${c}`).join('\n')}\n    Bonne réponse indiquée : ${q.correctIndex}\n    Explication : ${q.explanation}`).join('\n')}

COURS :
${text}`;
}

export function verifyCorrectionPrompt(text, statement, answer, correction) {
  return `Tu es un relecteur très rigoureux. Voici la correction d'un exercice faite par une IA.
Vérifie qu'elle est juste par rapport au COURS (refais les calculs un par un, note cohérente).
Renvoie UN seul élément (index 0) :
- "ok" si la correction est juste ;
- "corrige" si elle contient une erreur : écris dans "fixed" le corrigé complet correct, dans
  "comment" ce qui était faux, et dans "fixedIndex" la note corrigée sur 20 (entier) ;
- "faux" si l'exercice lui-même est incorrect ou insoluble avec le cours.

ÉNONCÉ : ${statement}
RÉPONSE DE L'ÉLÈVE : ${answer || '(photo)'}
CORRECTION À VÉRIFIER (note ${correction.grade}/20) :
${correction.solution}

COURS :
${text}`;
}

// =====================================================================
// 7. EXAMEN BLANC (Ren) — phase 2
// =====================================================================
export const EXAM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    instructions: { type: 'STRING', description: 'Consignes générales (courtes)' },
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          kind: { type: 'STRING', enum: ['qcm', 'question', 'calcul', 'exercice'] },
          statement: { type: 'STRING', description: 'Énoncé (Markdown + LaTeX)' },
          choices: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Seulement pour qcm, sinon liste vide' },
          correctIndex: { type: 'INTEGER', description: 'qcm : indice de la bonne réponse ; sinon -1' },
          points: { type: 'NUMBER', description: 'Barème de la question' },
          expected: { type: 'STRING', description: 'Éléments de réponse attendus (corrigé type)' },
          course: { type: 'STRING', description: 'Titre du cours concerné' },
          source: SOURCE,
        },
        required: ['kind', 'statement', 'choices', 'correctIndex', 'points', 'expected', 'course', 'source'],
      },
    },
  },
  required: ['title', 'instructions', 'questions'],
};

export function examPrompt(text, minutes) {
  return `Crée un sujet d'examen type (examen blanc) sur ce(s) cours, à faire en ${minutes} minutes.
- Total du barème = 20 points exactement. Mélange QCM, questions de cours, calculs et un exercice.
- Couvre toutes les parties importantes ; difficulté progressive, niveau examen réel.
- Pour chaque question : barème, éléments de réponse attendus (corrigé type) et source
  (page/photo + citation mot pour mot). Indique le titre du cours concerné.
- Pour un QCM : 4 choix, une seule bonne réponse. Sinon "choices" vide et correctIndex = -1.

COURS (chaque cours commence par ===== Titre =====) :
${text}`;
}

export const EXAM_CORRECTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          index: { type: 'INTEGER' },
          points: { type: 'NUMBER', description: 'Points obtenus' },
          comment: { type: 'STRING', description: "Correction détaillée de la réponse de l'élève" },
        },
        required: ['index', 'points', 'comment'],
      },
    },
    total: { type: 'NUMBER', description: 'Note totale sur 20' },
    verdict: { type: 'STRING', enum: ['excellent', 'bon', 'moyen', 'a_retravailler'] },
    advice: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['questions', 'total', 'verdict', 'advice'],
};

export function examCorrectionPrompt(text, exam, answers) {
  return `Corrige cette copie d'examen blanc avec le barème indiqué, en t'appuyant sur le cours.
- Pour chaque question non-QCM (index à partir de 0), attribue des points (de 0 au barème,
  demi-points possibles) et explique ce qui est juste, faux ou manquant. Valorise la méthode.
- Les QCM sont déjà notés automatiquement : recopie simplement leurs points.
- Donne la note totale sur 20, un verdict et 3 conseils prioritaires. Tutoie l'élève, jamais moqueur.

SUJET ET RÉPONSES :
${exam.questions.map((q, i) => `[${i}] (${q.kind}, ${q.points} pts) ${q.statement}
    Attendu : ${q.expected}
    Réponse de l'élève : ${q.kind === 'qcm' ? `choix ${answers[i] ?? 'aucun'} → ${answers[i] === q.correctIndex ? `JUSTE (${q.points} pts)` : 'FAUX (0 pt)'}` : (answers[i] || '(pas de réponse)')}`).join('\n')}

COURS :
${text}`;
}

// =====================================================================
// 8. LE COURS EN MANGA (yonkoma : planche de 4 cases)
// ---------------------------------------------------------------------
// L'IA écrit UNIQUEMENT le contenu des 4 cases ; l'appli dessine la planche
// avec les personnages SVG. Persos et expressions possibles ci-dessous.
// =====================================================================
const MANGA_CHARS = ['kai', 'mory', 'nia', 'sora', 'ren', 'awa', 'tidiane', 'binta'];
const MANGA_EXPR = ['neutre', 'joie', 'reflexion', 'celebration', 'encouragement', 'surprise', 'concentration', 'clin'];

export const MANGA_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING', description: 'Titre court et drôle de la planche' },
    panels: {
      type: 'ARRAY',
      description: 'Exactement 4 cases, dans l’ordre de lecture',
      items: {
        type: 'OBJECT',
        properties: {
          character: { type: 'STRING', enum: MANGA_CHARS },
          expression: { type: 'STRING', enum: MANGA_EXPR },
          line: { type: 'STRING', description: 'Réplique (max 120 caractères, SANS LaTeX)' },
          narration: { type: 'STRING', description: 'Petit texte de narration optionnel (max 60 caractères), sinon vide' },
          sfx: { type: 'STRING', description: 'Onomatopée manga optionnelle (ex. "BAM!", "?!"), sinon vide' },
        },
        required: ['character', 'expression', 'line', 'narration', 'sfx'],
      },
    },
    source: SOURCE,
  },
  required: ['title', 'panels', 'source'],
};

export function mangaPrompt(notion, text) {
  return `Écris un yonkoma (manga en 4 cases) où l'équipe s'explique cette notion avec humour.
Persos : kai (guide), mory (geek), nia (explique avec des métaphores), sora (rapide, conclut),
ren (rival qui ne comprend pas / taquine), awa (coach rigoureuse), tidiane (calme), binta (hype).
Ex. : Ren ne comprend pas → Nia explique avec une métaphore → quelqu'un précise → Sora conclut.
Contenu EXACT et fidèle au cours. Répliques courtes, sans LaTeX (écris x², √x, a/b).
4 cases exactement. Source : page + citation.

NOTION : ${notion}

COURS :
${text}`;
}

// =====================================================================
// 9. "EXPLIQUE-MOI COMME SI J'ÉTAIS NUL" (méthode Feynman, avec Ren)
// ---------------------------------------------------------------------
// Étape 1 : Ren lit l'explication de l'élève et pose 2-3 questions naïves
//           mais piégeuses (sur les trous de l'explication).
// Étape 2 : note de compréhension + points oubliés/faux + correction courte.
// =====================================================================
export const FEYNMAN_QUESTIONS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reaction: { type: 'STRING', description: 'Réaction courte de Ren à l’explication (taquin, 1 phrase)' },
    questions: { type: 'ARRAY', items: { type: 'STRING' }, description: '2 ou 3 questions naïves mais piégeuses' },
  },
  required: ['reaction', 'questions'],
};

export function feynmanQuestionsPrompt(notion, explanation, text) {
  return `Tu joues Ren, un élève qui fait semblant de ne RIEN comprendre. L'élève t'explique une notion.
Pose 2 ou 3 questions naïves (vocabulaire simple, tutoiement) mais piégeuses, qui visent ce qui
MANQUE ou est FLOU ou FAUX dans son explication, d'après le cours. Une question par idée. Pas de LaTeX.

NOTION : ${notion}

EXPLICATION DE L'ÉLÈVE :
${explanation}

COURS (référence) :
${text}`;
}

export const FEYNMAN_GRADE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    grade: { type: 'INTEGER', description: 'Note de compréhension sur 20' },
    understood: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Ce que l’élève a bien compris (court)' },
    missed: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Points importants oubliés' },
    wrong: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Erreurs ou confusions' },
    correction: { type: 'STRING', description: 'Explication correcte et courte de la notion (5 lignes max)' },
    source: SOURCE,
  },
  required: ['grade', 'understood', 'missed', 'wrong', 'correction', 'source'],
};

export function feynmanGradePrompt(notion, explanation, qa, text) {
  return `Évalue la compréhension de l'élève qui a expliqué une notion puis répondu aux questions de Ren.
Base-toi UNIQUEMENT sur le cours. Sois juste et bienveillant. Note sur 20.
Liste ce qui est compris, oublié, faux (listes courtes, vides si rien). Correction courte et exacte.
Source : page + citation exacte du cours.

NOTION : ${notion}

EXPLICATION :
${explanation}

QUESTIONS DE REN ET RÉPONSES :
${qa.map((x, i) => `${i + 1}. ${x.q}\n→ ${x.a || '(pas de réponse)'}`).join('\n')}

COURS :
${text}`;
}
