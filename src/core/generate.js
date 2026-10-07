// =====================================================================
// generate.js — Génération du résumé, des fiches et des quiz par l'IA
// ---------------------------------------------------------------------
// Le cours est découpé en MORCEAUX (quelques pages chacun). Pourquoi ?
//  - l'IA couvre mieux chaque partie (rien n'est oublié) ;
//  - les réponses restent courtes (pas de coupure) ;
//  - si la connexion coupe, les morceaux déjà faits sont gardés et
//    on reprend au morceau suivant.
// L'avancement est noté dans course.progress[type] = { done: [indices] }.
//
// ÉCONOMIE DE QUOTA : à la préparation d'un cours, résumé + fiches + quiz
// sont demandés ENSEMBLE, en une seule demande par morceau (generatePack).
// Le reste (manga, Explique-moi, exercices, examen blanc, nouveau quiz) ne
// part qu'à la demande de l'élève, et ce qui est déjà enregistré n'est
// jamais redemandé.
// =====================================================================

import * as db from './db.js';
import { generateJSON, blobToBase64 } from './gemini.js';
import * as P from '../data/prompts.js';
import { initialState } from './srs.js';
import { startJob, getJob } from './jobs.js';
import { t } from '../i18n/index.js';

const CHUNK_CHARS = 20000; // taille maximale d'un morceau (en caractères)
const OLD_CHUNK_CHARS = 12000; // ancienne taille : gardée pour les cours déjà commencés
const QUIZ_QUESTIONS = 10; // questions du quiz préparé automatiquement

/** "Page" ou "Photo" selon le type de cours. */
export function unitLabel(course) {
  return course.sourceType === 'photos' ? 'Photo' : 'Page';
}

/**
 * Taille des morceaux d'un cours. Un cours dont la génération a commencé avec
 * l'ancienne taille la garde (sinon les parties déjà faites ne correspondraient plus).
 */
function chunkSize(course) {
  if (course.chunkChars) return course.chunkChars;
  const started = course.summary || Object.keys(course.summaryParts || {}).length || Object.keys(course.progress || {}).length;
  return started ? OLD_CHUNK_CHARS : CHUNK_CHARS;
}

/** Découpe les pages du cours en morceaux d'environ chunkSize caractères. */
export function chunks(course) {
  const max = chunkSize(course);
  const out = [];
  let cur = [];
  let size = 0;
  for (const p of course.pages) {
    if (cur.length && size + p.text.length > max) {
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
    const status = (msg) => onStatus?.(`${label} ${t("— partie")} ${i + 1}/${parts.length}${msg ? ' : ' + msg : '…'}`);
    status();
    await fn(parts[i], i, status);
    p.done.push(i);
    await db.put('courses', course);
  }
}

/** Comme runChunked, mais traite 2 morceaux EN MÊME TEMPS (plus rapide). */
async function runChunkedParallel(course, kind, label, onStatus, fn, limit = 2) {
  const parts = chunks(course);
  const p = prog(course, kind);
  const todo = parts.map((_, i) => i).filter((i) => !p.done.includes(i));
  let finished = parts.length - todo.length;
  const worker = async () => {
    while (todo.length) {
      const i = todo.shift();
      const status = (msg) => onStatus?.(`${label} — ${finished}/${parts.length} ${t("parties prêtes")}${msg ? ' · ' + msg : ''}`);
      status();
      await fn(parts[i], i, status);
      p.done.push(i);
      finished++;
      status();
      await db.put('courses', course);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, todo.length) }, worker));
}

// ---------------------------------------------------------------------
// Résumé — en STREAMING : chaque partie arrive dès qu'elle est prête
// ---------------------------------------------------------------------
/**
 * @param {Function} [onSection] (section, indexGlobal) appelé à chaque nouvelle partie reçue
 */
export async function generateSummary(course, onStatus, onSection) {
  course.chunkChars = chunkSize(course);
  course.summaryParts ||= {};
  const parts = chunks(course);
  // Nombre de parties déjà prêtes avant chaque morceau (pour l'index global).
  const before = (i) => Object.keys(course.summaryParts).filter((k) => Number(k) < i).reduce((s, k) => s + course.summaryParts[k].length, 0);
  // Les parties déjà reçues (reprise après coupure) sont renvoyées tout de suite.
  Object.keys(course.summaryParts).sort((a, b) => a - b).forEach((k) => {
    course.summaryParts[k].forEach((sec, j) => onSection?.(sec, before(Number(k)) + j));
  });
  await runChunked(course, 'summary', t('Résumé'), onStatus, async (pages, i, status) => {
    const res = await generateJSON({
      parts: [{ text: P.summaryPrompt(P.courseText(pages, unitLabel(course)), unitLabel(course)) }],
      schema: P.SUMMARY_SCHEMA,
      system: P.SYSTEM,
      onStatus: status,
      label: `résumé ${i + 1}/${parts.length}`,
      streamKey: 'sections',
      // idx = position dans ce morceau : si un autre modèle reprend la réponse,
      // les parties déjà affichées sont simplement remplacées (pas de doublon).
      onItem: (sec, idx) => {
        if (!sec?.title || !Array.isArray(sec.blocks)) return;
        onSection?.(sec, before(i) + idx);
      },
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

// ---------------------------------------------------------------------
// Résumé + fiches + quiz en UNE demande par morceau (préparation d'un cours)
// ---------------------------------------------------------------------
/** Une question de QCM est-elle bien formée ? */
const goodQuestion = (q) => q && Array.isArray(q.choices) && q.choices.length >= 2 && q.correctIndex >= 0 && q.correctIndex < q.choices.length;

/** Enregistre les fiches d'un morceau (après vérification éventuelle). */
async function saveCards(course, pages, i, cards, status) {
  if (await db.getSetting('verifyMode')) cards = await verifyCards(course, pages, cards, status);
  const now = new Date().toISOString();
  await db.putMany('cards', cards.map((c, idx) => ({
    id: db.newId(),
    courseId: course.id,
    subject: course.subject,
    chunk: i,
    order: idx, // ordre de l'IA = ordre du cours (l'identifiant, aléatoire, ne le garde pas)
    part: c.part,
    question: c.question,
    answer: c.answer,
    source: c.source,
    check: c.check, // 'ok' | 'corrige' | 'faux' (seulement en mode vérification)
    checkComment: c.checkComment,
    flagged: c.check === 'faux', // fiche jugée fausse → à corriger, pas proposée en révision
    createdAt: now,
    ...initialState(),
  })));
}

/**
 * Prépare le cours : pour chaque morceau, UNE demande renvoie le résumé
 * (en streaming), les fiches et les questions du quiz. Seules les parties
 * qui manquent sont demandées (reprise après coupure, cours déjà préparé…).
 * @param {Function} [onSection] (section, indexGlobal) à chaque partie du résumé reçue
 */
export async function generatePack(course, onStatus, onSection) {
  course.chunkChars = chunkSize(course); // taille figée pour ce cours
  course.summaryParts ||= {};
  course.quizParts ||= {};
  const parts = chunks(course);
  const unit = unitLabel(course);
  const sumP = prog(course, 'summary');
  const cardsP = prog(course, 'cards');
  const hasQuiz = (await db.getByIndex('quizzes', 'courseId', course.id)).length > 0;
  const perChunk = Math.max(2, Math.ceil(QUIZ_QUESTIONS / parts.length));
  const before = (i) => Object.keys(course.summaryParts).filter((k) => Number(k) < i).reduce((s, k) => s + course.summaryParts[k].length, 0);
  // Les parties déjà reçues (reprise après coupure) sont renvoyées tout de suite.
  Object.keys(course.summaryParts).sort((a, b) => a - b).forEach((k) => {
    course.summaryParts[k].forEach((sec, j) => onSection?.(sec, before(Number(k)) + j));
  });

  for (let i = 0; i < parts.length; i++) {
    const want = { sections: !course.summaryParts[i], cards: !cardsP.done.includes(i), questions: !hasQuiz && !course.quizParts[i] };
    if (!want.sections && !want.cards && !want.questions) continue;
    const status = (msg) => onStatus?.(`${want.sections ? t('Résumé') : want.cards ? t('Fiches') : t('Quiz')} ${t("— partie")} ${i + 1}/${parts.length}${msg ? ' : ' + msg : '…'}`);
    status();
    const res = await generateJSON({
      parts: [{ text: P.packPrompt(P.courseText(parts[i], unit), unit, want, perChunk) }],
      schema: P.packSchema(want),
      system: P.SYSTEM,
      temperature: 0.5,
      onStatus: status,
      label: `cours ${i + 1}/${parts.length}`,
      streamKey: want.sections ? 'sections' : undefined,
      // idx = position dans ce morceau : si un autre modèle reprend la réponse,
      // les parties déjà affichées sont simplement remplacées (pas de doublon).
      onItem: (sec, idx) => {
        if (!sec?.title || !Array.isArray(sec.blocks)) return;
        onSection?.(sec, before(i) + idx);
      },
      check: (json) => {
        if (want.sections && !json.sections.length) return t('résumé vide');
        if (want.cards && !json.cards.length) return t('aucune fiche');
        if (want.questions && !json.questions.some(goodQuestion)) return t('aucune question valable');
        return null;
      },
    });
    if (want.sections) { course.summaryParts[i] = res.sections; sumP.done.push(i); }
    if (want.questions) course.quizParts[i] = res.questions.filter(goodQuestion);
    if (want.cards) { await saveCards(course, parts[i], i, res.cards, status); cardsP.done.push(i); }
    await db.put('courses', course); // sauvegarde après chaque morceau
  }

  // Toutes les parties sont prêtes : résumé assemblé dans l'ordre.
  if (parts.every((_, i) => course.summaryParts[i])) {
    course.summary = Object.keys(course.summaryParts).sort((a, b) => a - b).flatMap((k) => course.summaryParts[k]);
  }
  // Quiz : les questions de chaque morceau forment UN quiz.
  if (!hasQuiz && parts.every((_, i) => course.quizParts[i])) {
    let questions = parts.flatMap((_, i) => course.quizParts[i]);
    if (questions.length && (await db.getSetting('verifyMode'))) questions = await verifyQuiz(course, questions, onStatus);
    if (questions.length) await db.put('quizzes', { id: db.newId(), courseId: course.id, createdAt: new Date().toISOString(), questions });
    delete course.quizParts;
  }
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
  course.chunkChars = chunkSize(course);
  await runChunkedParallel(course, 'cards', t('Fiches'), onStatus, async (pages, i, status) => {
    const res = await generateJSON({
      parts: [{ text: P.cardsPrompt(P.courseText(pages, unitLabel(course))) }],
      schema: P.CARDS_SCHEMA,
      system: P.SYSTEM,
      onStatus: status,
      label: `fiches ${i + 1}`,
      check: (json) => (json.cards.length ? null : t('aucune fiche')),
    });
    // Mode vérification : un 2e appel relit les fiches avant affichage.
    await saveCards(course, pages, i, res.cards, status);
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
  onStatus?.(t('Création du quiz…'));
  const res = await generateJSON({
    parts: [{ text: P.quizPrompt(P.courseText(course.pages, unitLabel(course)), count, avoid) }],
    schema: P.QUIZ_SCHEMA,
    system: P.SYSTEM,
    temperature: 0.7,
    onStatus,
    label: 'quiz',
    // Vérifie que chaque question a des choix et une bonne réponse valide.
    check: (json) => {
      const bad = json.questions.findIndex((q) => q.choices.length < 2 || q.correctIndex < 0 || q.correctIndex >= q.choices.length);
      return bad >= 0 ? `${t("question")} ${bad + 1} ${t("mal formée")}` : json.questions.length ? null : t('aucune question');
    },
  });
  let questions = res.questions;
  if (await db.getSetting('verifyMode')) questions = await verifyQuiz(course, questions, onStatus);
  const quiz = {
    id: db.newId(),
    courseId: course.id,
    createdAt: new Date().toISOString(),
    questions,
  };
  await db.put('quizzes', quiz);
  return quiz;
}

// =====================================================================
// MODE VÉRIFICATION (phase 2) — un 2e appel à l'IA relit le travail
// ---------------------------------------------------------------------
// Activé dans Réglages. Coûte un appel de plus (quota), mais réduit les
// erreurs : les fiches/questions sont corrigées ou signalées AVANT affichage.
// =====================================================================

/** Relit des fiches : corrige les réponses fausses, signale les fiches absurdes. */
async function verifyCards(course, pages, cards, onStatus) {
  onStatus?.(t('🔍 vérification des fiches…'));
  const res = await generateJSON({
    parts: [{ text: P.verifyCardsPrompt(P.courseText(pages, unitLabel(course)), cards) }],
    schema: P.VERIFY_SCHEMA,
    system: P.SYSTEM,
    temperature: 0.1,
  });
  return cards.map((c, i) => {
    const v = res.items.find((x) => x.index === i);
    if (!v) return c;
    if (v.status === 'corrige' && v.fixed.trim()) return { ...c, answer: v.fixed, check: 'corrige', checkComment: v.comment };
    return { ...c, check: v.status, checkComment: v.comment };
  });
}

/** Relit un QCM : corrige la bonne réponse / l'explication, retire les questions ambiguës. */
async function verifyQuiz(course, questions, onStatus) {
  onStatus?.(t('🔍 vérification des questions…'));
  const res = await generateJSON({
    parts: [{ text: P.verifyQuizPrompt(P.courseText(course.pages, unitLabel(course)), questions) }],
    schema: P.VERIFY_SCHEMA,
    system: P.SYSTEM,
    temperature: 0.1,
  });
  const out = [];
  questions.forEach((q, i) => {
    const v = res.items.find((x) => x.index === i);
    if (v?.status === 'faux') return; // question ambiguë : on la retire
    if (v?.status === 'corrige') {
      const idx = v.fixedIndex >= 0 && v.fixedIndex < q.choices.length ? v.fixedIndex : q.correctIndex;
      out.push({ ...q, correctIndex: idx, explanation: v.fixed.trim() || q.explanation, check: 'corrige' });
    } else {
      out.push({ ...q, check: v ? 'ok' : undefined });
    }
  });
  return out.length ? out : questions;
}

// =====================================================================
// EXERCICES (phase 2, Awa)
// =====================================================================

/** Crée `count` exercices d'application sur le cours et les enregistre. */
export async function generateExercises(course, count, onStatus) {
  const previous = await db.getByIndex('exercises', 'courseId', course.id);
  onStatus?.(t('Awa prépare les exercices…'));
  const res = await generateJSON({
    parts: [{ text: P.exercisesPrompt(P.courseText(course.pages, unitLabel(course)), count, previous.map((e) => e.title)) }],
    schema: P.EXERCISES_SCHEMA,
    system: P.SYSTEM,
    temperature: 0.7,
    onStatus,
    check: (json) => (json.exercises.length ? null : t('aucun exercice')),
  });
  const now = new Date().toISOString();
  const list = res.exercises.map((e) => ({
    id: db.newId(), courseId: course.id, subject: course.subject, createdAt: now, attempts: [], ...e,
  }));
  await db.putMany('exercises', list);
  return list;
}

/**
 * Corrige la réponse de l'élève (texte et/ou photo du brouillon), étape par étape.
 * @param {Blob} [image] photo compressée de la réponse manuscrite (facultatif)
 */
export async function correctExercise(course, exercise, answer, image, onStatus) {
  // Même réponse (sans photo) déjà corrigée : on réutilise la correction, sans redemander.
  const same = !image && (exercise.attempts || []).find((a) => !a.hasImage && String(a.answer || '').trim() === String(answer || '').trim());
  if (same) return same;
  const text = P.courseText(course.pages, unitLabel(course));
  const parts = [{ text: P.correctionPrompt(text, exercise.statement, answer, !!image) }];
  if (image) parts.push({ inlineData: { mimeType: 'image/jpeg', data: await blobToBase64(image) } });
  onStatus?.(t('Awa corrige ta copie…'));
  let correction = await generateJSON({
    parts, schema: P.CORRECTION_SCHEMA, system: P.SYSTEM, temperature: 0.2, onStatus,
    thinking: 'low', // un peu de réflexion pour vérifier les calculs
    label: 'correction exercice',
    check: (j) => (j.grade < 0 || j.grade > 20 ? t('note hors de 0-20') : null),
  });
  // Mode vérification : un 2e appel relit la correction.
  if (await db.getSetting('verifyMode')) {
    onStatus?.(t('🔍 vérification de la correction…'));
    const v = await generateJSON({
      parts: [{ text: P.verifyCorrectionPrompt(text, exercise.statement, answer, correction) }],
      schema: P.VERIFY_SCHEMA, system: P.SYSTEM, temperature: 0.1,
    });
    const item = v.items[0];
    if (item?.status === 'corrige' && item.fixed.trim()) {
      correction = {
        ...correction,
        solution: item.fixed,
        grade: item.fixedIndex >= 0 && item.fixedIndex <= 20 ? item.fixedIndex : correction.grade,
        check: 'corrige',
        checkComment: item.comment,
      };
    } else if (item) {
      correction = { ...correction, check: item.status, checkComment: item.comment };
    }
  }
  const attempt = { date: new Date().toISOString(), answer, hasImage: !!image, correction };
  exercise.attempts = [...(exercise.attempts || []), attempt];
  await db.put('exercises', exercise);
  await db.put('results', {
    id: db.newId(), type: 'exercise', courseId: course.id, subject: course.subject, exerciseId: exercise.id,
    score: correction.grade, total: 20, date: attempt.date,
    missed: correction.grade < 10 ? [exercise.title] : [],
  });
  return attempt;
}

// =====================================================================
// EXAMEN BLANC (phase 2, Ren)
// =====================================================================

/** Texte de plusieurs cours à la suite (pour un examen multi-cours). */
function multiCourseText(courses) {
  return courses.map((c) => `===== ${c.title} (${c.subject}) =====\n${P.courseText(c.pages, unitLabel(c))}`).join('\n\n');
}

/** Crée un sujet d'examen blanc (barème sur 20) sur un ou plusieurs cours. */
export async function generateExam(courses, minutes, onStatus) {
  onStatus?.(t('Ren rédige le sujet…'));
  const res = await generateJSON({
    parts: [{ text: P.examPrompt(multiCourseText(courses), minutes) }],
    schema: P.EXAM_SCHEMA,
    system: P.SYSTEM,
    temperature: 0.6,
    onStatus,
    check: (j) => {
      if (!j.questions.length) return t('aucune question');
      const bad = j.questions.findIndex((q) => q.kind === 'qcm' && (q.choices.length < 2 || q.correctIndex < 0 || q.correctIndex >= q.choices.length));
      return bad >= 0 ? `${t("QCM")} ${bad + 1} ${t("mal formé")}` : null;
    },
  });
  // Remet le barème exactement sur 20 si l'IA s'est trompée dans le total.
  const sum = res.questions.reduce((s, q) => s + q.points, 0);
  if (sum > 0 && Math.abs(sum - 20) > 0.01) {
    res.questions.forEach((q) => { q.points = Math.round((q.points * 20 * 2) / sum) / 2; });
  }
  const exam = {
    id: db.newId(), createdAt: new Date().toISOString(), minutes,
    courseIds: courses.map((c) => c.id), subjects: [...new Set(courses.map((c) => c.subject))],
    title: res.title, instructions: res.instructions, questions: res.questions, attempts: [],
  };
  await db.put('exams', exam);
  return exam;
}

/** Corrige une copie d'examen blanc avec le barème. QCM notés automatiquement. */
export async function correctExam(exam, courses, answers, onStatus) {
  // Mêmes réponses déjà corrigées : on réutilise la correction, sans redemander.
  const same = (exam.attempts || []).find((a) => JSON.stringify(a.answers) === JSON.stringify(answers));
  if (same) return same;
  onStatus?.(t('Le jury délibère…'));
  const res = await generateJSON({
    parts: [{ text: P.examCorrectionPrompt(multiCourseText(courses), exam, answers) }],
    schema: P.EXAM_CORRECTION_SCHEMA,
    thinking: 'low', // un peu de réflexion pour vérifier les calculs
    label: 'correction examen',
    system: P.SYSTEM,
    temperature: 0.2,
    onStatus,
  });
  // Les QCM sont notés par l'appli (pas par l'IA) : fiable à 100 %.
  const details = exam.questions.map((q, i) => {
    const ai = res.questions.find((x) => x.index === i);
    if (q.kind === 'qcm') {
      const ok = answers[i] === q.correctIndex;
      return { points: ok ? q.points : 0, comment: ok ? t('Bonne réponse ✓') : `${t("Mauvaise réponse.")} ${ai?.comment || ''}`.trim() };
    }
    const pts = Math.max(0, Math.min(q.points, Number(ai?.points) || 0));
    return { points: pts, comment: ai?.comment || t('Pas de commentaire.') };
  });
  const total = Math.round(details.reduce((s, d) => s + d.points, 0) * 2) / 2;
  const attempt = { date: new Date().toISOString(), answers, details, total, verdict: verdictOf(total), advice: res.advice };
  exam.attempts = [...(exam.attempts || []), attempt];
  await db.put('exams', exam);
  await db.put('results', {
    id: db.newId(), type: 'exam', examId: exam.id, courseId: exam.courseIds[0], subject: exam.subjects.join(', '),
    score: total, total: 20, date: attempt.date,
    missed: exam.questions.filter((q, i) => details[i].points < q.points / 2).map((q) => q.statement.slice(0, 160)),
  });
  return attempt;
}

/** Niveau de résultat à partir d'une note sur 20. */
export function verdictOf(note20) {
  return note20 >= 16 ? 'excellent' : note20 >= 12 ? 'bon' : note20 >= 8 ? 'moyen' : 'a_retravailler';
}

// =====================================================================
// PRÉPARATION AUTOMATIQUE D'UN COURS (en arrière-plan)
// ---------------------------------------------------------------------
// UNE demande par morceau : le résumé arrive en STREAMING (les stories
// s'affichent au fur et à mesure), puis les fiches et les questions du quiz
// dans la même réponse. Les écrans suivent l'avancement grâce à core/jobs.js
// (tâche 'summary' ; 'cards' et 'quiz' suivent la même préparation).
// =====================================================================

/** Lance (ou rejoint) la préparation d'un cours. Renvoie la tâche "résumé". */
export function prepareCourse(course) {
  const existing = getJob(course.id, 'summary');
  if (existing?.status === 'running') return existing;
  const sections = [];
  const followers = []; // tâches 'cards' et 'quiz' : même avancement
  const job = startJob(course.id, 'summary', async (update) => {
    const set = (s) => { update({ status: s }); followers.forEach((u) => u({ status: s })); };
    await generatePack(course, set, (sec, idx) => {
      sections[idx] = sec;
      update({ sections: sections.slice() });
    });
    return course.summary;
  });
  for (const kind of ['cards', 'quiz']) {
    startJob(course.id, kind, (update) => {
      followers.push(update);
      return job.promise.then(() => { if (job.status === 'error') throw job.error; });
    });
  }
  return job;
}
