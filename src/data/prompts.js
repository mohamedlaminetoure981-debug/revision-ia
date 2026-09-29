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
