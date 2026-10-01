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

const quizzes = (ctx) => ctx.results.filter((r) => r.type === 'quiz');
const exercises = (ctx) => ctx.results.filter((r) => r.type === 'exercise');
const exams = (ctx) => ctx.results.filter((r) => r.type === 'exam');

export const BADGES = [
  // --- Premiers pas ---
  { id: 'first_course', icon: '📥', name: 'Premier scan', desc: 'Ajouter ton premier cours', test: (c) => c.courses.length >= 1 },
  { id: 'first_card', icon: '🗂️', name: 'Première fiche', desc: 'Réviser ta première fiche', test: (c) => c.reviews.length >= 1 },
  { id: 'first_quiz', icon: '⚔️', name: 'Premier duel', desc: 'Terminer ton premier quiz', test: (c) => quizzes(c).length >= 1 },
  { id: 'reader', icon: '📖', name: 'Lecteur assidu', desc: 'Lire 5 résumés en entier', test: (c) => (c.profile.totals?.summaries || 0) >= 5 },
  // --- Régularité ---
  { id: 'streak_3', icon: '🔥', name: 'Ça chauffe', desc: '3 jours de suite', test: (c) => c.profile.bestStreak >= 3 },
  { id: 'streak_7', icon: '🌋', name: 'Semaine de feu', desc: '7 jours de suite', test: (c) => c.profile.bestStreak >= 7 },
  { id: 'streak_30', icon: '👑', name: 'Mois légendaire', desc: '30 jours de suite', test: (c) => c.profile.bestStreak >= 30 },
  { id: 'streak_100', icon: '💎', name: 'Centenaire', desc: '100 jours de suite', test: (c) => c.profile.bestStreak >= 100 },
  // --- Fiches ---
  { id: 'cards_100', icon: '💯', name: 'Centurion', desc: '100 fiches révisées', test: (c) => c.reviews.length >= 100 },
  { id: 'cards_500', icon: '🧠', name: 'Cerveau XXL', desc: '500 fiches révisées', test: (c) => c.reviews.length >= 500 },
  { id: 'night_owl', icon: '🦉', name: 'Oiseau de nuit', desc: 'Réviser après minuit', test: (c) => c.reviews.some((r) => r.hour !== undefined && r.hour < 4) },
  { id: 'early_bird', icon: '🌅', name: 'Lève-tôt', desc: 'Réviser avant 7 h', test: (c) => c.reviews.some((r) => r.hour >= 4 && r.hour < 7) },
  // --- Quiz ---
  { id: 'quiz_perfect', icon: '🎯', name: 'Sans faute', desc: '100 % à un quiz', test: (c) => quizzes(c).some((r) => r.score === r.total) },
  { id: 'quiz_10', icon: '🏟️', name: 'Gladiateur', desc: '10 quiz terminés', test: (c) => quizzes(c).length >= 10 },
  // --- Exercices & examens ---
  { id: 'exercise_first', icon: '✍️', name: 'À l’entraînement', desc: 'Faire corriger un exercice', test: (c) => exercises(c).length >= 1 },
  { id: 'exercise_ace', icon: '🥇', name: 'Copie parfaite', desc: '20/20 à un exercice', test: (c) => exercises(c).some((r) => r.score >= 20) },
  { id: 'exam_first', icon: '📝', name: 'Jour J', desc: 'Terminer un examen blanc', test: (c) => exams(c).length >= 1 },
  { id: 'exam_pass', icon: '🎓', name: 'Admis(e)', desc: 'Au moins 10/20 à un examen blanc', test: (c) => exams(c).some((r) => r.score >= 10) },
  { id: 'exam_perfect', icon: '🏆', name: 'Major de promo', desc: '20/20 à un examen blanc', test: (c) => exams(c).some((r) => r.score >= 20) },
  // --- Niveaux & divers ---
  { id: 'level_5', icon: '⭐', name: 'Niveau 5', desc: 'Atteindre le niveau 5', test: (c) => c.level >= 5 },
  { id: 'level_10', icon: '🌟', name: 'Niveau 10', desc: 'Atteindre le niveau 10', test: (c) => c.level >= 10 },
  { id: 'level_25', icon: '🚀', name: 'Niveau 25', desc: 'Atteindre le niveau 25', test: (c) => c.level >= 25 },
  { id: 'subjects_3', icon: '🌈', name: 'Touche-à-tout', desc: 'Des cours dans 3 matières', test: (c) => new Set(c.courses.map((x) => x.subject)).size >= 3 },
  // --- Manga & Histoire ---
  { id: 'manga_first', icon: '📖', name: 'Mangaka', desc: 'Lire ta première planche manga', test: (c) => (c.profile.totals?.mangas || 0) >= 1 },
  { id: 'manga_10', icon: '🖋️', name: 'Collectionneur de planches', desc: 'Lire 10 planches manga', test: (c) => (c.profile.totals?.mangas || 0) >= 10 },
  { id: 'story_5', icon: '📚', name: 'Fan de la série', desc: 'Lire 5 chapitres du mode Histoire', test: (c) => (c.profile.totals?.chapters || 0) >= 5 },
  { id: 'story_all', icon: '🎬', name: 'Fin de saison', desc: 'Lire les 12 chapitres de la saison 1', test: (c) => (c.profile.totals?.chapters || 0) >= 12 },
  { id: 'boss_first', icon: '👊', name: 'Tueur de boss', desc: 'Vaincre un boss de fin d’arc', test: (c) => c.results.some((r) => r.type === 'boss' && r.won) },
  { id: 'boss_flawless', icon: '🛡️', name: 'Intouchable', desc: 'Vaincre un boss sans perdre de cœur', test: (c) => c.results.some((r) => r.type === 'boss' && r.won && r.hearts === 3) },
  // --- Cartes & Focus ---
  { id: 'card_epic', icon: '💜', name: 'Holo !', desc: 'Obtenir une carte Épique', test: (c) => c.cards.some((x) => !x.flagged && x.interval >= 15) },
  { id: 'card_legend', icon: '🌟', name: 'Légendaire', desc: 'Obtenir une carte Légendaire', test: (c) => c.cards.some((x) => !x.flagged && x.interval >= 35) },
  { id: 'collector_50', icon: '🃏', name: 'Collectionneur', desc: 'Posséder 50 cartes', test: (c) => c.cards.filter((x) => !x.flagged && x.reps >= 1).length >= 50 },
  { id: 'focus_first', icon: '🥋', name: 'Premier entraînement', desc: 'Terminer une session au dojo', test: (c) => c.focus.some((f) => f.completed) },
  { id: 'focus_pure', icon: '🧘', name: 'Esprit d’acier', desc: 'Session complète sans quitter l’appli', test: (c) => c.focus.some((f) => f.completed && !f.leaves && f.minutes >= 20) },
  { id: 'focus_10h', icon: '⏳', name: 'Maître du dojo', desc: '10 heures de focus au total', test: (c) => c.focus.reduce((s, f) => s + (f.minutes || 0), 0) >= 600 },
  // --- Explique-moi & veille ---
  { id: 'feynman_first', icon: '🧠', name: 'Prof d’un jour', desc: 'Expliquer une notion à Ren', test: (c) => c.results.some((r) => r.type === 'feynman' && r.grading) },
  { id: 'feynman_ace', icon: '🎓', name: 'Ren a compris !', desc: '18/20 à « Explique-moi »', test: (c) => c.results.some((r) => r.type === 'feynman' && r.score >= 18) },
  { id: 'veille_ultime', icon: '🌙', name: 'Nuit légendaire', desc: 'Réussir l’examen final d’une veille', test: (c) => !!c.veille?.final?.passed },
  { id: 'bug_hunter', icon: '🕵️', name: 'Chasseur d’erreurs', desc: 'Signaler ou corriger une fiche', test: (c) => c.cards.some((x) => x.flagged || x.edited) },
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
