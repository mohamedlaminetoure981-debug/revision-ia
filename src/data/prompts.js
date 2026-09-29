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
export const SYSTEM = `Tu es un professeur particulier expert et bienveillant qui aide un lycéen ou
un étudiant (15-25 ans, en Guinée / Afrique francophone) à réviser ses cours.
Règles absolues :
- Réponds toujours en français clair et simple, en tutoyant. Phrases courtes.
- Sérieux sur le fond : exactitude avant tout.
- Base-toi UNIQUEMENT sur le cours fourni. N'invente jamais un fait qui contredit le cours.
- Écris toutes les formules mathématiques en LaTeX entre $...$ (en ligne) ou $$...$$ (bloc).
- Tu peux utiliser du Markdown simple : **gras**, *italique*, listes "- ", titres "### ", \`code\`.
- Les citations ("quote") doivent être copiées MOT POUR MOT depuis le cours (10 à 30 mots maximum).`;

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
  return pages.map((p) => `[[${unitLabel} ${p.n}]]\n${p.text}`).join('\n\n');
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
  return `Fais un résumé structuré de ce morceau de cours, partie par partie, dans l'ordre du cours.
- N'oublie AUCUNE notion, définition, formule, propriété, exemple important ou méthode.
- Une "section" par partie du cours, avec son titre et les numéros de ${unitLabel.toLowerCase()} concernés.
- Blocs de type "cours" : le contenu du cours, résumé fidèlement.
- Quand un passage du cours est peu expliqué (définition sèche, étape de calcul sautée,
  notion supposée connue), ajoute juste après un bloc de type "explication" qui le développe
  simplement, avec un exemple si utile. Ces blocs seront marqués "💡 Explication ajoutée".

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
  return `Crée des fiches de révision question/réponse sur ce morceau de cours.
- Couvre TOUTES les parties et TOUTES les notions importantes (définitions, formules,
  propriétés, méthodes, exemples, pièges). Mieux vaut trop de fiches que pas assez.
- Une question = une seule notion. Réponse courte et précise (1 à 4 phrases ou une formule).
- Pour chaque fiche, donne la source : numéro de page/photo et une citation mot pour mot.

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
  return `Crée un QCM de ${count} questions sur ce cours.
- Répartis les questions sur TOUTES les parties du cours.
- 4 choix par question, UNE seule bonne réponse ; les mauvais choix doivent être plausibles.
- Mélange compréhension, application (petits calculs si le cours s'y prête) et définitions.
- "explanation" : explique pourquoi la bonne réponse est juste ET pourquoi les autres sont fausses.
- Donne la source (page/photo + citation mot pour mot).
${avoid.length ? `\nÉvite de reposer ces questions déjà posées :\n- ${avoid.slice(0, 60).join('\n- ')}\n` : ''}
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
