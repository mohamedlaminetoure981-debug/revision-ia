// =====================================================================
// quota.js — Compteur de demandes Gemini et modèles épuisés
// ---------------------------------------------------------------------
// Chaque modèle gratuit a son PROPRE quota quotidien. Google le recharge à
// minuit, heure du Pacifique (America/Los_Angeles).
//  - countRequest(model)  : +1 demande réussie pour ce modèle aujourd'hui ;
//  - markExhausted(model) : le modèle a répondu "quota du jour dépassé" (429)
//    → on ne le retente plus jusqu'à la prochaine recharge (même après
//    fermeture de l'appli : c'est enregistré dans IndexedDB) ;
//  - nextReset()          : heure de la prochaine recharge (heure du téléphone).
// Affiché dans Profil → Réglages (« Quota Gemini aujourd'hui »).
// =====================================================================

import { getSetting, setSetting } from './db.js';

import { locale } from '../i18n/index.js';
const TZ = 'America/Los_Angeles';

/** Jour en cours chez Google (heure du Pacifique), ex. "2026-10-05". */
export function pacificDay(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Heure, minute, seconde actuelles à l'heure du Pacifique. */
function ptClock(d) {
  const p = {};
  for (const x of new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(d)) p[x.type] = Number(x.value);
  return p;
}

/** Instant de la prochaine recharge : minuit pile à l'heure du Pacifique. */
export function nextReset(now = new Date()) {
  const { hour, minute, second } = ptClock(now);
  let t = new Date(now.getTime() - now.getMilliseconds() + (86400 - (hour * 3600 + minute * 60 + second)) * 1000);
  // Jour de changement d'heure (été/hiver) : on recale sur minuit.
  const h = ptClock(t).hour;
  if (h === 23) t = new Date(t.getTime() + 3600e3);
  else if (h === 1) t = new Date(t.getTime() - 3600e3);
  return t;
}

/** Heure de la prochaine recharge, en heure locale du téléphone (ex. "08:00"). */
export function resetTimeText(now = new Date()) {
  return nextReset(now).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
}

// État du jour : { day, counts: { modèle: n }, exhausted: { modèle: 'quota' | 'absent' } }
let state = null;

function fresh() {
  return { day: pacificDay(), counts: {}, exhausted: {} };
}

/** Charge l'état (et le remet à zéro si la recharge est passée). */
export async function loadQuota() {
  if (!state) {
    const saved = await getSetting('quota').catch(() => null);
    state = saved && saved.day === pacificDay() ? saved : fresh();
  }
  if (state.day !== pacificDay()) { state = fresh(); save(); }
  return state;
}

function save() {
  setSetting('quota', state).catch(() => {});
}

/** +1 demande réussie pour ce modèle aujourd'hui. */
export async function countRequest(model) {
  await loadQuota();
  state.counts[model] = (state.counts[model] || 0) + 1;
  save();
}

/**
 * Modèle inutilisable jusqu'à la prochaine recharge.
 * @param {'quota'|'absent'} reason  quota du jour épuisé, ou modèle introuvable
 */
export async function markExhausted(model, reason = 'quota') {
  await loadQuota();
  state.exhausted[model] = reason;
  save();
}

/** Le modèle est-il épuisé (ou introuvable) pour aujourd'hui ? */
export async function isExhausted(model) {
  return !!(await loadQuota()).exhausted[model];
}
