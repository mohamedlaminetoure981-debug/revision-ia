// =====================================================================
// veille.js — MODE "VEILLE D'EXAMEN" : construction du plan intensif
// ---------------------------------------------------------------------
// À partir de TES statistiques (fiches ratées, oublis, questions de quiz
// manquées), on classe les notions les plus fragiles de la matière, puis
// on remplit le temps disponible avec un cycle d'environ 1 heure :
//   🥋 Focus 25 min (relire la notion fragile) → ☕ 5 min
//   🗂️ Fiches 15 min (les plus ratées)        → 🎯 Quiz 10 min → ☕ 5 min
// et on termine TOUJOURS par 🏁 un mini examen final (15 min).
// On réutilise les fiches et quiz existants. L'IA n'est appelée que s'il
// n'existe AUCUN quiz pour la matière (une seule fois).
// État enregistré dans le réglage 'veille'.
// =====================================================================

import * as db from './db.js';

const CYCLE = [
  { type: 'focus', minutes: 25 },
  { type: 'pause', minutes: 5 },
  { type: 'cards', minutes: 15 },
  { type: 'quiz', minutes: 10 },
  { type: 'pause', minutes: 5 },
];
const FINAL_MINUTES = 15;
const CARDS_PER_BLOCK = 12;
export const SLEEP_HOURS = 8.5; // 8 h de sommeil + 30 min pour se préparer

/** Prochaine occurrence d'une heure "HH:MM" (aujourd'hui ou demain). */
export function nextAt(hhmm, from = Date.now()) {
  const [h, m] = String(hhmm || '08:00').split(':').map(Number);
  const d = new Date(from);
  d.setHours(h || 0, m || 0, 0, 0);
  if (d.getTime() <= from) d.setDate(d.getDate() + 1);
  return d.getTime();
}

/** Heure de coucher conseillée avant l'examen. */
export function bedtime(examAt) {
  return examAt - SLEEP_HOURS * 3600e3;
}

/** Notions et fiches les plus fragiles d'une matière. */
export async function weakPoints(subject) {
  const [courses, cards, reviews, results, quizzes] = await Promise.all([
    db.getAll('courses'), db.getAll('cards'), db.getAll('reviews'), db.getAll('results'), db.getAll('quizzes'),
  ]);
  const mine = courses.filter((c) => (c.subject || 'Autre') === subject);
  const ids = new Set(mine.map((c) => c.id));
  const fails = {};
  for (const r of reviews) if (r.grade === 'rate') fails[r.cardId] = (fails[r.cardId] || 0) + 1;
  // Score de fragilité d'une fiche : échecs, oublis, jamais vue, peu maîtrisée.
  const weak = cards.filter((c) => ids.has(c.courseId) && !c.flagged).map((c) => ({
    card: c,
    score: 2 * (fails[c.id] || 0) + 2 * (c.lapses || 0) + (c.reps ? 0 : 1) + ((c.interval || 0) < 6 ? 1 : 0),
  })).sort((a, b) => b.score - a.score);
  // Fragilité par cours (fiches + questions ratées aux quiz/exos/explications).
  const missed = {};
  const courseWeak = Object.fromEntries(mine.map((c) => [c.id, 0]));
  for (const w of weak) courseWeak[w.card.courseId] += w.score;
  for (const r of results) {
    if (!ids.has(r.courseId)) continue;
    for (const q of r.missed || []) { missed[q] = (missed[q] || 0) + 1; courseWeak[r.courseId] += 2; }
  }
  const rankedCourses = mine.slice().sort((a, b) => courseWeak[b.id] - courseWeak[a.id]);
  const subjectQuizzes = quizzes.filter((q) => ids.has(q.courseId));
  return { courses: rankedCourses, weak, missed, quizzes: subjectQuizzes, courseWeak };
}

/** Construit le plan (liste de blocs) pour `hours` heures. */
export async function buildPlan(subject, hours) {
  const wp = await weakPoints(subject);
  const total = Math.round(hours * 60);
  const budget = total - FINAL_MINUTES;
  const plan = [];
  let used = 0;
  let cycle = 0;
  let k = 0;
  while (true) {
    const step = CYCLE[k % CYCLE.length];
    if (used + step.minutes > budget) break;
    const course = wp.courses[cycle % Math.max(1, wp.courses.length)];
    const block = { id: `b${plan.length}`, type: step.type, minutes: step.minutes, done: false };
    if (step.type === 'focus' && course) {
      // Notion à relire : la 1re partie du résumé jamais "comprise", sinon le cours entier.
      block.courseId = course.id;
      block.title = course.title;
      block.notionIndex = course.summary?.length ? cycle % course.summary.length : null;
      block.notion = course.summary?.[block.notionIndex]?.title || course.title;
    }
    if (step.type === 'cards') {
      const start = (cycle * CARDS_PER_BLOCK) % Math.max(1, wp.weak.length);
      const pick = [...wp.weak.slice(start), ...wp.weak.slice(0, start)].slice(0, CARDS_PER_BLOCK);
      block.cardIds = pick.map((w) => w.card.id);
      if (!block.cardIds.length) { k++; if (k % CYCLE.length === 0) cycle++; continue; } // pas de fiches : on saute
    }
    if (step.type === 'quiz') {
      const q = wp.quizzes.filter((x) => x.courseId === course?.id)[0] || wp.quizzes[cycle % Math.max(1, wp.quizzes.length)];
      block.quizId = q?.id || null;
      block.courseId = course?.id;
    }
    plan.push(block);
    used += step.minutes;
    k++;
    if (k % CYCLE.length === 0) cycle++;
  }
  // Pas de pause en dernier avant l'examen final.
  if (plan.at(-1)?.type === 'pause') { used -= plan.pop().minutes; }
  plan.push({ id: 'final', type: 'final', minutes: FINAL_MINUTES, done: false });
  return { plan, minutes: used + FINAL_MINUTES, weakCount: wp.weak.filter((w) => w.score > 0).length, courses: wp.courses.length, hasQuiz: wp.quizzes.length > 0 };
}

/** Questions du mini examen final : d'abord celles déjà ratées, puis au hasard. */
export async function finalQuestions(subject, n = 8) {
  const wp = await weakPoints(subject);
  const all = wp.quizzes.flatMap((q) => q.questions.map((x) => ({ ...x, courseId: q.courseId })));
  const shuffled = all.sort(() => Math.random() - 0.5);
  shuffled.sort((a, b) => (wp.missed[b.question] || 0) - (wp.missed[a.question] || 0));
  return shuffled.slice(0, n);
}

export async function loadVeille() {
  return (await db.getSetting('veille')) || null;
}
export async function saveVeille(v) {
  await db.setSetting('veille', v);
}
