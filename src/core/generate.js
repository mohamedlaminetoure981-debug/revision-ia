// =====================================================================
// generate.js — Génération du résumé, des fiches et des quiz par l'IA
// ---------------------------------------------------------------------
// Le cours est découpé en MORCEAUX (quelques pages chacun). Pourquoi ?
//  - l'IA couvre mieux chaque partie (rien n'est oublié) ;
//  - les réponses restent courtes (pas de coupure) ;
//  - si la connexion coupe, les morceaux déjà faits sont gardés et
//    on reprend au morceau suivant.
// L'avancement est noté dans course.progress[type] = { done: [indices] }.
// =====================================================================

import * as db from './db.js';
import { generateJSON } from './gemini.js';
import * as P from '../data/prompts.js';
import { initialState } from './srs.js';

const CHUNK_CHARS = 12000; // taille maximale d'un morceau (en caractères)

/** "Page" ou "Photo" selon le type de cours. */
export function unitLabel(course) {
  return course.sourceType === 'photos' ? 'Photo' : 'Page';
}

/** Découpe les pages du cours en morceaux d'environ CHUNK_CHARS caractères. */
export function chunks(course) {
  const out = [];
  let cur = [];
  let size = 0;
  for (const p of course.pages) {
    if (cur.length && size + p.text.length > CHUNK_CHARS) {
      out.push(cur);
      cur = [];
      size = 0;
    }
    cur.push(p);
    size += p.text.length;
  }
  if (cur.length) out.push(cur);
  return out;
}

/** Avancement d'une génération : { done: [...], total } */
function prog(course, kind) {
  course.progress ||= {};
  course.progress[kind] ||= { done: [] };
  return course.progress[kind];
}

/** Indique si une génération est commencée mais pas terminée. */
export function isPartial(course, kind) {
  const p = course.progress?.[kind];
  return !!p && p.done.length > 0 && p.done.length < chunks(course).length;
}

/**
 * Exécute `fn(morceau, indice)` pour chaque morceau pas encore traité,
 * et enregistre l'avancement après chaque morceau.
 */
async function runChunked(course, kind, label, onStatus, fn) {
  const parts = chunks(course);
  const p = prog(course, kind);
  for (let i = 0; i < parts.length; i++) {
    if (p.done.includes(i)) continue;
    const status = (t) => onStatus?.(`${label} — partie ${i + 1}/${parts.length}${t ? ' : ' + t : '…'}`);
    status();
    await fn(parts[i], i, status);
    p.done.push(i);
    await db.put('courses', course);
  }
}

// ---------------------------------------------------------------------
// Résumé
// ---------------------------------------------------------------------
export async function generateSummary(course, onStatus) {
  course.summaryParts ||= {};
  await runChunked(course, 'summary', 'Résumé', onStatus, async (pages, i, status) => {
    const res = await generateJSON({
      parts: [{ text: P.summaryPrompt(P.courseText(pages, unitLabel(course)), unitLabel(course)) }],
      schema: P.SUMMARY_SCHEMA,
      system: P.SYSTEM,
      onStatus: status,
    });
    course.summaryParts[i] = res.sections;
  });
  // Toutes les parties sont prêtes : on les assemble dans l'ordre.
  course.summary = Object.keys(course.summaryParts)
    .sort((a, b) => a - b)
    .flatMap((k) => course.summaryParts[k]);
  await db.put('courses', course);
  return course.summary;
}

/** Efface le résumé pour le refaire. */
export async function resetSummary(course) {
  course.summary = null;
  course.summaryParts = {};
  if (course.progress) delete course.progress.summary;
  await db.put('courses', course);
}

// ---------------------------------------------------------------------
// Fiches
// ---------------------------------------------------------------------
export async function generateCards(course, onStatus) {
  await runChunked(course, 'cards', 'Fiches', onStatus, async (pages, i, status) => {
    const res = await generateJSON({
      parts: [{ text: P.cardsPrompt(P.courseText(pages, unitLabel(course))) }],
      schema: P.CARDS_SCHEMA,
      system: P.SYSTEM,
      onStatus: status,
      check: (json) => (json.cards.length ? null : 'aucune fiche'),
    });
    let cards = res.cards;
    // Phase 2 : relecture par l'IA si le mode vérification est activé.
    if (hooks.verifyCards) cards = await hooks.verifyCards(course, pages, cards, status);
    const now = new Date().toISOString();
    await db.putMany('cards', cards.map((c) => ({
      id: db.newId(),
      courseId: course.id,
      subject: course.subject,
      chunk: i,
      part: c.part,
      question: c.question,
      answer: c.answer,
      source: c.source,
      verified: c.verified, // défini seulement en mode vérification
      createdAt: now,
      ...initialState(),
    })));
  });
}

/** Supprime toutes les fiches d'un cours pour les refaire. */
export async function resetCards(course) {
  await db.delByIndex('cards', 'courseId', course.id);
  if (course.progress) delete course.progress.cards;
  await db.put('courses', course);
}

// ---------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------
export async function generateQuiz(course, count, onStatus) {
  const previous = await db.getByIndex('quizzes', 'courseId', course.id);
  const avoid = previous.flatMap((q) => q.questions.map((x) => x.question));
  onStatus?.('Création du quiz…');
  const res = await generateJSON({
    parts: [{ text: P.quizPrompt(P.courseText(course.pages, unitLabel(course)), count, avoid) }],
    schema: P.QUIZ_SCHEMA,
    system: P.SYSTEM,
    temperature: 0.7,
    onStatus,
    // Vérifie que chaque question a des choix et une bonne réponse valide.
    check: (json) => {
      const bad = json.questions.findIndex((q) => q.choices.length < 2 || q.correctIndex < 0 || q.correctIndex >= q.choices.length);
      return bad >= 0 ? `question ${bad + 1} mal formée` : json.questions.length ? null : 'aucune question';
    },
  });
  let questions = res.questions;
  if (hooks.verifyQuiz) questions = await hooks.verifyQuiz(course, questions, onStatus);
  const quiz = {
    id: db.newId(),
    courseId: course.id,
    createdAt: new Date().toISOString(),
    questions,
  };
  await db.put('quizzes', quiz);
  return quiz;
}

// ---------------------------------------------------------------------
// Points d'extension (utilisés par la phase 2 : mode vérification)
// ---------------------------------------------------------------------
export const hooks = { verifyCards: null, verifyQuiz: null };
