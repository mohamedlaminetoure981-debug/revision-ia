// =====================================================================
// badges.js — Les badges à débloquer (présentés par Binta)
// ---------------------------------------------------------------------
// 👉 Pour AJOUTER un badge : ajoute un objet dans BADGES avec
//    id (unique), icon, name, desc et une fonction test(ctx) qui renvoie
//    true quand le badge est gagné. ctx contient :
//      profile   le profil (xp, streak, bestStreak, totals…)
//      level     niveau actuel
//      courses, cards, reviews, results   (listes lues dans la base)
// Les badges déjà gagnés sont dans profile.badges = { id: date }.
// =====================================================================

import * as db from './db.js';
import { levelFromXp, saveProfile, getProfileSync } from './game.js';
import { t } from '../i18n/index.js';

const quizzes = (ctx) => ctx.results.filter((r) => r.type === 'quiz');
const exercises = (ctx) => ctx.results.filter((r) => r.type === 'exercise');
const exams = (ctx) => ctx.results.filter((r) => r.type === 'exam');

export const BADGES = [
  // --- Premiers pas ---
  { id: 'first_course', icon: '📥', name: t('Premier scan'), desc: t('Ajouter ton premier cours'), test: (c) => c.courses.length >= 1 },
  { id: 'first_card', icon: '🗂️', name: t('Première fiche'), desc: t('Réviser ta première fiche'), test: (c) => c.reviews.length >= 1 },
  { id: 'first_quiz', icon: '⚔️', name: t('Premier duel'), desc: t('Terminer ton premier quiz'), test: (c) => quizzes(c).length >= 1 },
  { id: 'reader', icon: '📖', name: t('Lecteur assidu'), desc: t('Lire 5 résumés en entier'), test: (c) => (c.profile.totals?.summaries || 0) >= 5 },
  // --- Régularité ---
  { id: 'streak_3', icon: '🔥', name: t('Ça chauffe'), desc: t('3 jours de suite'), test: (c) => c.profile.bestStreak >= 3 },
  { id: 'streak_7', icon: '🌋', name: t('Semaine de feu'), desc: t('7 jours de suite'), test: (c) => c.profile.bestStreak >= 7 },
  { id: 'streak_30', icon: '👑', name: t('Mois légendaire'), desc: t('30 jours de suite'), test: (c) => c.profile.bestStreak >= 30 },
  { id: 'streak_100', icon: '💎', name: t('Centenaire'), desc: t('100 jours de suite'), test: (c) => c.profile.bestStreak >= 100 },
  // --- Fiches ---
  { id: 'cards_100', icon: '💯', name: t('Centurion'), desc: t('100 fiches révisées'), test: (c) => c.reviews.length >= 100 },
  { id: 'cards_500', icon: '🧠', name: t('Cerveau XXL'), desc: t('500 fiches révisées'), test: (c) => c.reviews.length >= 500 },
  { id: 'night_owl', icon: '🦉', name: t('Oiseau de nuit'), desc: t('Réviser après minuit'), test: (c) => c.reviews.some((r) => r.hour !== undefined && r.hour < 4) },
  { id: 'early_bird', icon: '🌅', name: t('Lève-tôt'), desc: t('Réviser avant 7 h'), test: (c) => c.reviews.some((r) => r.hour >= 4 && r.hour < 7) },
  // --- Quiz ---
  { id: 'quiz_perfect', icon: '🎯', name: t('Sans faute'), desc: t('100 % à un quiz'), test: (c) => quizzes(c).some((r) => r.score === r.total) },
  { id: 'quiz_10', icon: '🏟️', name: t('Gladiateur'), desc: t('10 quiz terminés'), test: (c) => quizzes(c).length >= 10 },
  // --- Exercices & examens ---
  { id: 'exercise_first', icon: '✍️', name: t('À l’entraînement'), desc: t('Faire corriger un exercice'), test: (c) => exercises(c).length >= 1 },
  { id: 'exercise_ace', icon: '🥇', name: t('Copie parfaite'), desc: t('20/20 à un exercice'), test: (c) => exercises(c).some((r) => r.score >= 20) },
  { id: 'exam_first', icon: '📝', name: t('Jour J'), desc: t('Terminer un examen blanc'), test: (c) => exams(c).length >= 1 },
  { id: 'exam_pass', icon: '🎓', name: 'Admis(e)', desc: t('Au moins 10/20 à un examen blanc'), test: (c) => exams(c).some((r) => r.score >= 10) },
  { id: 'exam_perfect', icon: '🏆', name: t('Major de promo'), desc: t('20/20 à un examen blanc'), test: (c) => exams(c).some((r) => r.score >= 20) },
  // --- Niveaux & divers ---
  { id: 'level_5', icon: '⭐', name: t('Niveau 5'), desc: t('Atteindre le niveau 5'), test: (c) => c.level >= 5 },
  { id: 'level_10', icon: '🌟', name: t('Niveau 10'), desc: t('Atteindre le niveau 10'), test: (c) => c.level >= 10 },
  { id: 'level_25', icon: '🚀', name: t('Niveau 25'), desc: t('Atteindre le niveau 25'), test: (c) => c.level >= 25 },
  { id: 'subjects_3', icon: '🌈', name: t('Touche-à-tout'), desc: t('Des cours dans 3 matières'), test: (c) => new Set(c.courses.map((x) => x.subject)).size >= 3 },
  // --- Manga & Histoire ---
  { id: 'manga_first', icon: '📖', name: t('Mangaka'), desc: t('Lire ta première planche manga'), test: (c) => (c.profile.totals?.mangas || 0) >= 1 },
  { id: 'manga_10', icon: '🖋️', name: t('Collectionneur de planches'), desc: t('Lire 10 planches manga'), test: (c) => (c.profile.totals?.mangas || 0) >= 10 },
  { id: 'story_5', icon: '📚', name: t('Fan de la série'), desc: t('Lire 5 chapitres du mode Histoire'), test: (c) => (c.profile.totals?.chapters || 0) >= 5 },
  { id: 'story_all', icon: '🎬', name: t('Fin de saison'), desc: t('Lire les 12 chapitres de la saison 1'), test: (c) => (c.profile.totals?.chapters || 0) >= 12 },
  { id: 'boss_first', icon: '👊', name: t('Tueur de boss'), desc: t('Vaincre un boss de fin d’arc'), test: (c) => c.results.some((r) => r.type === 'boss' && r.won) },
  { id: 'boss_flawless', icon: '🛡️', name: t('Intouchable'), desc: t('Vaincre un boss sans perdre de cœur'), test: (c) => c.results.some((r) => r.type === 'boss' && r.won && r.hearts === 3) },
  // --- Cartes & Focus ---
  { id: 'card_epic', icon: '💜', name: t('Holo !'), desc: t('Obtenir une carte Épique'), test: (c) => c.cards.some((x) => !x.flagged && x.interval >= 15) },
  { id: 'card_legend', icon: '🌟', name: t('Légendaire'), desc: t('Obtenir une carte Légendaire'), test: (c) => c.cards.some((x) => !x.flagged && x.interval >= 35) },
  { id: 'collector_50', icon: '🃏', name: t('Collectionneur'), desc: t('Posséder 50 cartes'), test: (c) => c.cards.filter((x) => !x.flagged && x.reps >= 1).length >= 50 },
  { id: 'focus_first', icon: '🥋', name: t('Premier entraînement'), desc: t('Terminer une session au dojo'), test: (c) => c.focus.some((f) => f.completed) },
  { id: 'focus_pure', icon: '🧘', name: t('Esprit d’acier'), desc: t('Session complète sans quitter l’appli'), test: (c) => c.focus.some((f) => f.completed && !f.leaves && f.minutes >= 20) },
  { id: 'focus_10h', icon: '⏳', name: t('Maître du dojo'), desc: t('10 heures de focus au total'), test: (c) => c.focus.reduce((s, f) => s + (f.minutes || 0), 0) >= 600 },
  // --- Explique-moi & veille ---
  { id: 'feynman_first', icon: '🧠', name: t('Prof d’un jour'), desc: t('Expliquer une notion à Ren'), test: (c) => c.results.some((r) => r.type === 'feynman' && r.grading) },
  { id: 'feynman_ace', icon: '🎓', name: t('Ren a compris !'), desc: t('18/20 à « Explique-moi »'), test: (c) => c.results.some((r) => r.type === 'feynman' && r.score >= 18) },
  { id: 'veille_ultime', icon: '🌙', name: t('Nuit légendaire'), desc: t('Réussir l’examen final d’une veille'), test: (c) => !!c.veille?.final?.passed },
  { id: 'bug_hunter', icon: '🕵️', name: t('Chasseur d’erreurs'), desc: t('Signaler ou corriger une fiche'), test: (c) => c.cards.some((x) => x.flagged || x.edited) },
];

/** Lit tout ce qu'il faut pour tester les badges. */
export async function badgeContext() {
  const profile = getProfileSync();
  const [courses, cards, reviews, results, focus] = await Promise.all([
    db.getAll('courses'), db.getAll('cards'), db.getAll('reviews'), db.getAll('results'), db.getAll('focus'),
  ]);
  const veille = await db.getSetting('veille');
  return { profile, level: levelFromXp(profile.xp), courses, cards, reviews, results, focus, veille };
}

/**
 * Vérifie les badges et enregistre ceux qui viennent d'être gagnés.
 * @returns {Promise<Array>} les badges NOUVELLEMENT débloqués
 */
export async function checkBadges() {
  const p = getProfileSync();
  if (!p) return [];
  const ctx = await badgeContext();
  p.badges ||= {};
  const fresh = BADGES.filter((b) => !p.badges[b.id] && safe(() => b.test(ctx)));
  if (fresh.length) {
    const now = new Date().toISOString();
    fresh.forEach((b) => { p.badges[b.id] = now; });
    await saveProfile(p);
  }
  return fresh;
}

function safe(fn) {
  try { return !!fn(); } catch { return false; }
}
