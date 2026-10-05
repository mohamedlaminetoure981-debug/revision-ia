// =====================================================================
// feynman.js — "Explique-moi comme si j'étais nul" (méthode Feynman, Ren)
// ---------------------------------------------------------------------
// 1. askQuestions : Ren lit ton explication et pose 2-3 questions naïves
//    (en streaming : la 1re question s'affiche dès qu'elle arrive).
// 2. gradeExplanation : note /20, compris / oublié / faux, correction
//    courte et passage du cours.
// Jamais 2 fois le même appel : les réponses sont gardées (store 'results',
// type 'feynman') et réutilisées si le texte est identique.
// =====================================================================

import * as db from './db.js';
import { generateJSON } from './gemini.js';
import * as P from '../data/prompts.js';
import { unitLabel } from './generate.js';
import { notionOf } from './manga.js';
import { t } from '../i18n/index.js';

/** Empreinte d'un texte (pour reconnaître une explication déjà envoyée). */
function hash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
const clean = (s) => String(s || '').trim().replace(/\s+/g, ' ');

/** Texte du cours limité aux pages de la notion (plus court = plus rapide). */
function courseTextFor(course, notion) {
  const pages = notion.pages.length ? course.pages.filter((p) => notion.pages.includes(p.n)) : course.pages;
  return P.courseText(pages.length ? pages : course.pages, unitLabel(course)).slice(0, 14000);
}

/** Essai déjà enregistré pour cette explication ? */
async function findAttempt(course, key) {
  const list = await db.getByIndex('results', 'courseId', course.id);
  return list.find((r) => r.type === 'feynman' && r.key === key) || null;
}

/**
 * Questions naïves de Ren.
 * @returns {Promise<{attempt, reaction, questions}>}
 */
export async function askQuestions(course, index, explanation, onStatus, onQuestion) {
  const notion = notionOf(course, index);
  const key = hash(`${notion.title}|${clean(explanation)}`);
  const old = await findAttempt(course, key);
  if (old) return { attempt: old, reaction: old.reaction, questions: old.questions };
  const res = await generateJSON({
    parts: [{ text: P.feynmanQuestionsPrompt(notion.text.slice(0, 2500), explanation.slice(0, 4000), courseTextFor(course, notion)) }],
    schema: P.FEYNMAN_QUESTIONS_SCHEMA,
    system: P.SYSTEM,
    temperature: 0.7,
    onStatus,
    label: 'feynman questions',
    streamKey: 'questions',
    onItem: (q, i) => { if (typeof q === 'string' && i < 3) onQuestion?.(q, i); },
    check: (j) => (j.questions.length >= 1 ? null : t('aucune question')),
  });
  const attempt = {
    id: db.newId(), type: 'feynman', key, courseId: course.id, subject: course.subject, notion: notion.title, notionIndex: index,
    explanation, reaction: res.reaction, questions: res.questions.slice(0, 3), date: new Date().toISOString(),
  };
  await db.put('results', attempt);
  return { attempt, reaction: attempt.reaction, questions: attempt.questions };
}

/** Note de compréhension (réutilisée si mêmes réponses). */
export async function gradeExplanation(course, attempt, answers, onStatus) {
  const ansKey = hash(answers.map(clean).join('|'));
  if (attempt.grading && attempt.ansKey === ansKey) return attempt.grading;
  const notion = notionOf(course, attempt.notionIndex) || { title: attempt.notion, pages: [], text: attempt.notion };
  const qa = attempt.questions.map((q, i) => ({ q, a: answers[i] }));
  const g = await generateJSON({
    parts: [{ text: P.feynmanGradePrompt(notion.text.slice(0, 2500), attempt.explanation.slice(0, 4000), qa, courseTextFor(course, notion)) }],
    schema: P.FEYNMAN_GRADE_SCHEMA,
    system: P.SYSTEM,
    thinking: 'low', // une évaluation demande un peu de réflexion
    onStatus,
    label: 'feynman note',
    check: (j) => (j.grade >= 0 && j.grade <= 20 ? null : t('note hors de 0-20')),
  });
  attempt.answers = answers;
  attempt.ansKey = ansKey;
  attempt.grading = g;
  attempt.score = g.grade; // pour les statistiques
  attempt.total = 20;
  attempt.missed = [...(g.missed || []), ...(g.wrong || [])].slice(0, 5);
  await db.put('results', attempt);
  return g;
}
