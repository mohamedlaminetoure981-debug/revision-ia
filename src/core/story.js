// =====================================================================
// story.js — Progression du MODE HISTOIRE (aucun appel à l'IA)
// ---------------------------------------------------------------------
// Tes révisions rapportent des "points d'histoire" :
//   +1  par fiche maîtrisée (révisée avec succès au moins 2 fois de suite)
//   +3  par quiz réussi (≥ 70 %)
//   +3  par exercice réussi (≥ 10/20)
//   +10 par boss vaincu
// - Les CHAPITRES de la saison se débloquent avec le total de points.
// - Chaque MATIÈRE est un "Arc" : ses propres points remplissent sa barre,
//   et à BOSS_POINTS, le boss de l'arc apparaît (examen blanc en combat).
// - Le chapitre 12 (bataille finale) demande en plus un boss vaincu.
// État enregistré dans le réglage 'story' : { read: [ids], bosses: {matière: date} }
// =====================================================================

import * as db from './db.js';
import { CHAPTERS } from '../data/story.js';
import { isCreator } from './creator.js';

/** Points nécessaires pour débloquer chaque chapitre (chapitre 1 = 0). */
export const CHAPTER_POINTS = [0, 3, 6, 10, 15, 20, 26, 33, 40, 48, 57, 67];
/** Points d'une matière pour faire apparaître son boss. */
export const BOSS_POINTS = 6;

/** État sauvegardé (chapitres lus, boss vaincus). */
export async function storyState() {
  const s = (await db.getSetting('story')) || {};
  return { read: s.read || [], bosses: s.bosses || {}, unlockAll: !!s.unlockAll, seen: s.seen || 0 };
}
export async function saveStory(s) {
  await db.setSetting('story', s);
}

/** Points d'histoire, au total et par matière. */
export async function storyPoints() {
  const [courses, cards, results] = await Promise.all([db.getAll('courses'), db.getAll('cards'), db.getAll('results')]);
  const subjectOf = Object.fromEntries(courses.map((c) => [c.id, c.subject || 'Autre']));
  const bySubject = {};
  const add = (subject, n) => { if (subject) bySubject[subject] = (bySubject[subject] || 0) + n; };
  for (const c of courses) bySubject[c.subject || 'Autre'] ||= 0;
  for (const card of cards) if (!card.flagged && (card.reps || 0) >= 2) add(subjectOf[card.courseId], 1);
  for (const r of results) {
    const subject = subjectOf[r.courseId] || r.subject;
    if (r.type === 'quiz' && r.total && r.score / r.total >= 0.7) add(subject, 3);
    if (r.type === 'exercise' && r.score >= 10) add(subject, 3);
    if (r.type === 'boss' && r.won) add(r.subject, 10);
  }
  const total = Object.values(bySubject).reduce((a, b) => a + b, 0);
  return { total, bySubject };
}

/** Tout ce qu'il faut pour l'écran Histoire. */
export async function storyOverview() {
  const [state, pts] = await Promise.all([storyState(), storyPoints()]);
  const all = state.unlockAll && isCreator(); // Panneau créateur : tout débloquer pour tester
  const anyBoss = Object.keys(state.bosses).length > 0;
  const chapters = CHAPTERS.map((ch, i) => {
    const need = CHAPTER_POINTS[i] ?? CHAPTER_POINTS.at(-1) + 10 * (i - CHAPTER_POINTS.length + 1);
    const needBoss = ch.id === 12 && !anyBoss;
    return { ...ch, need, needBoss, unlocked: all || (pts.total >= need && !needBoss), read: state.read.includes(ch.id) };
  });
  const arcs = Object.entries(pts.bySubject).map(([subject, points]) => ({
    subject, points, ready: all || points >= BOSS_POINTS, defeated: !!state.bosses[subject],
  })).sort((a, b) => b.points - a.points);
  return { state, total: pts.total, chapters, arcs };
}

/**
 * Nombre de chapitres débloqués non encore annoncés (pour "Nouveau chapitre !").
 * Met à jour le compteur 'seen'.
 */
export async function newChaptersSinceLastVisit() {
  const o = await storyOverview();
  const unlocked = o.chapters.filter((c) => c.unlocked).length;
  const fresh = Math.max(0, unlocked - o.state.seen);
  if (unlocked !== o.state.seen) await saveStory({ ...o.state, seen: unlocked });
  return { fresh, unlocked, overview: o };
}

/** Marque un chapitre comme lu. Renvoie true si c'est la 1re lecture. */
export async function markRead(id) {
  const s = await storyState();
  if (s.read.includes(id)) return false;
  s.read.push(id);
  await saveStory(s);
  return true;
}

/** Enregistre un boss vaincu pour une matière. */
export async function markBossDefeated(subject) {
  const s = await storyState();
  s.bosses[subject] = new Date().toISOString();
  await saveStory(s);
}
