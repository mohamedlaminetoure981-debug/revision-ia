// =====================================================================
// game.js — Gamification : XP, niveaux, série de jours 🔥, objectifs
// ---------------------------------------------------------------------
// Le "profil" est enregistré dans IndexedDB (réglage "profile") :
// {
//   name, companion,            prénom et perso compagnon choisi
//   xp,                         points d'expérience totaux
//   streak: { count, last },    série de jours (last = dernier jour actif)
//   bestStreak,
//   daily: { day, cards, quizzes, summaries, xp },   compteurs du jour
//   xpByDay: { 'AAAA-MM-JJ': xp },                  historique (stats)
//   badges: { id: date }                             (phase 2)
// }
//
// 👉 Pour changer les gains d'XP : modifie XP_RULES.
// 👉 Pour changer les objectifs du jour : modifie DAILY_GOALS.
// =====================================================================

import * as db from './db.js';
import { today, addDays } from './srs.js';

/** XP gagnés par action. */
export const XP_RULES = {
  cardEasy: 12, // fiche "Facile"
  card: 10, // fiche "Je sais" / "Moyen"
  cardHard: 8, // fiche "Difficile"
  cardFail: 4, // fiche ratée (on récompense quand même l'effort !)
  quizGood: 10, // bonne réponse au quiz
  quizDone: 20, // quiz terminé
  quizPerfect: 40, // bonus 100 %
  summaryDone: 25, // résumé lu jusqu'au bout
  courseAdded: 40, // nouveau cours ajouté
  exercise: 20, // exercice corrigé (+ 2 XP par point obtenu sur 20)
  exam: 60, // examen blanc terminé (+ 4 XP par point obtenu sur 20)
};

/** Objectifs du jour affichés sur l'accueil. */
export const DAILY_GOALS = [
  { id: 'cards', label: 'Révise 10 fiches', target: 10, icon: '🗂️' },
  { id: 'quizzes', label: 'Fais 1 quiz', target: 1, icon: '🎯' },
  { id: 'summaries', label: 'Lis 1 résumé', target: 1, icon: '📖' },
  { id: 'exercises', label: 'Fais 1 exercice avec Awa', target: 1, icon: '✍️' },
];

/** Paliers de la série qui font évoluer l'aura du compagnon. */
export const AURA_STEPS = [3, 7, 30];

let cache = null; // profil en mémoire (lecture rapide)

/** Profil actuel (déjà chargé). */
export function getProfileSync() {
  return cache;
}

/** Charge le profil depuis la base. */
export async function loadProfile() {
  cache = (await db.getSetting('profile')) || null;
  if (cache) resetDailyIfNeeded(cache);
  return cache;
}

/** Enregistre le profil. */
export async function saveProfile(p) {
  cache = p;
  await db.setSetting('profile', p);
  return p;
}

/** Crée un nouveau profil (première ouverture). */
export async function createProfile(name, companion) {
  return saveProfile({
    name: name.trim() || 'Champion',
    companion,
    xp: 0,
    streak: { count: 0, last: null },
    bestStreak: 0,
    daily: { day: today(), cards: 0, quizzes: 0, summaries: 0, xp: 0 },
    xpByDay: {},
    badges: {},
    createdAt: new Date().toISOString(),
  });
}

/** Remet les compteurs du jour à zéro quand on change de jour. */
function resetDailyIfNeeded(p) {
  if (!p.daily || p.daily.day !== today()) p.daily = { day: today(), cards: 0, quizzes: 0, summaries: 0, xp: 0 };
}

// ---------------------------------------------------------------------
// Niveaux : niveau n atteint à 50 × (n-1)² XP → 0, 50, 200, 450, 800…
// ---------------------------------------------------------------------
export function levelFromXp(xp) {
  return Math.floor(Math.sqrt((xp || 0) / 50)) + 1;
}

/** Infos de niveau : { level, from, to, progress (0-1) } */
export function levelInfo(xp) {
  const level = levelFromXp(xp);
  const from = 50 * (level - 1) ** 2;
  const to = 50 * level ** 2;
  return { level, from, to, progress: (xp - from) / (to - from) };
}

// ---------------------------------------------------------------------
// Série de jours
// ---------------------------------------------------------------------

/** Série actuelle (0 si elle est cassée : aucun jour actif hier ni aujourd'hui). */
export function currentStreak(p) {
  if (!p?.streak?.last) return 0;
  const alive = p.streak.last === today() || p.streak.last === addDays(-1);
  return alive ? p.streak.count : 0;
}

/** A-t-on déjà révisé aujourd'hui ? */
export function activeToday(p) {
  return p?.streak?.last === today();
}

/** Niveau d'aura du compagnon selon la série : 0, 1 (3 j), 2 (7 j), 3 (30 j). */
export function auraLevel(streak) {
  return AURA_STEPS.filter((s) => streak >= s).length;
}

// ---------------------------------------------------------------------
// Gagner des XP
// ---------------------------------------------------------------------

/**
 * Ajoute des XP et met à jour la série et les objectifs.
 * @param {number} amount   XP gagnés
 * @param {string} [counter] compteur du jour à augmenter : 'cards' | 'quizzes' | 'summaries'
 * @returns {Promise<{gained, levelUp, level, streak, streakUp, auraUp, goalsDone}>}
 */
export async function addXp(amount, counter) {
  const p = cache || (await loadProfile());
  if (!p) return { gained: 0 };
  resetDailyIfNeeded(p);
  const beforeLevel = levelFromXp(p.xp);
  const beforeGoals = goals(p).filter((g) => g.done).length;
  const beforeAura = auraLevel(currentStreak(p));

  // Série : +1 si on était actif hier, 1 si la série était cassée.
  let streakUp = false;
  if (p.streak.last !== today()) {
    p.streak.count = p.streak.last === addDays(-1) ? p.streak.count + 1 : 1;
    p.streak.last = today();
    p.bestStreak = Math.max(p.bestStreak || 0, p.streak.count);
    streakUp = true;
  }

  p.xp += amount;
  p.daily.xp += amount;
  p.xpByDay[today()] = (p.xpByDay[today()] || 0) + amount;
  if (counter) {
    p.daily[counter] = (p.daily[counter] || 0) + 1;
    p.totals ||= {};
    p.totals[counter] = (p.totals[counter] || 0) + 1; // compteurs à vie (badges)
  }
  await saveProfile(p);

  const level = levelFromXp(p.xp);
  const streak = currentStreak(p);
  // Badges débloqués par cette action (chargé à la demande pour éviter une boucle d'import).
  const { checkBadges } = await import('./badges.js');
  const newBadges = await checkBadges();
  return {
    newBadges,
    gained: amount,
    level,
    levelUp: level > beforeLevel,
    streak,
    streakUp,
    auraUp: auraLevel(streak) > beforeAura,
    goalsDone: goals(p).filter((g) => g.done).length > beforeGoals,
  };
}

/** Objectifs du jour avec leur avancement. */
export function goals(p) {
  const d = p?.daily?.day === today() ? p.daily : {};
  return DAILY_GOALS.map((g) => {
    const value = Math.min(g.target, d[g.id] || 0);
    return { ...g, value, done: value >= g.target };
  });
}
