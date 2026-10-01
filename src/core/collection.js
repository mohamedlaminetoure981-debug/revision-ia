// =====================================================================
// collection.js — CARTES À COLLECTIONNER (Sora) — aucun appel à l'IA
// ---------------------------------------------------------------------
// Chaque fiche du cours devient une carte : titre, idée clé, perso,
// couleur de la matière. Sa RARETÉ suit ta maîtrise (répétition espacée) :
//   Commune    : fiche réussie au moins 1 fois (intervalle ≥ 1 jour)
//   Rare       : intervalle ≥ 6 jours
//   Épique     : intervalle ≥ 15 jours
//   Légendaire : intervalle ≥ 35 jours
// Les nouvelles cartes / montées de rareté arrivent dans un "paquet"
// à ouvrir (animation retournement + flash). Réglage 'collection' :
// { cardId: rareté déjà révélée }.
// =====================================================================

import * as db from './db.js';
import { TEAM } from '../data/characters.js';

export const RARITIES = [
  { id: 'commune', name: 'Commune', stars: 1, color: '#9AA3B5', min: 1 },
  { id: 'rare', name: 'Rare', stars: 2, color: '#22D3EE', min: 6 },
  { id: 'epique', name: 'Épique', stars: 3, color: '#A855F7', min: 15 },
  { id: 'legendaire', name: 'Légendaire', stars: 4, color: '#FFD23F', min: 35 },
];
const RANK = Object.fromEntries(RARITIES.map((r, i) => [r.id, i]));

/** Rareté d'une fiche (null = pas encore obtenue). */
export function rarityOf(card) {
  if (card.flagged || !(card.reps >= 1)) return null;
  let r = null;
  for (const x of RARITIES) if ((card.interval || 0) >= x.min) r = x;
  return r || RARITIES[0];
}

/** Perso attribué à une carte (toujours le même pour une fiche donnée). */
export function characterOf(card) {
  let h = 0;
  for (const c of String(card.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TEAM[h % TEAM.length];
}

/** Couleur réelle (hex) d'une matière, lue dans le thème (utile pour les images). */
export function subjectHex(subject) {
  let h = 0;
  for (const c of String(subject)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--subject-${(h % 7) + 1}`).trim();
  return v || '#8B5CF6';
}

/** Retire le LaTeX et le markdown pour un texte court de carte. */
export function plain(s, max = 140) {
  const t = String(s || '')
    .replace(/\$+([^$]*)\$+/g, '$1')
    .replace(/\\(frac|dfrac)\{([^}]*)\}\{([^}]*)\}/g, '($2)/($3)')
    .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
    .replace(/\\(times|cdot)/g, '×').replace(/\\(leq|le)/g, '≤').replace(/\\(geq|ge)/g, '≥').replace(/\\neq/g, '≠')
    .replace(/\\(infty)/g, '∞').replace(/\\(pi)/g, 'π').replace(/\\(sum)/g, 'Σ').replace(/\\(in)\b/g, '∈').replace(/\\(to|rightarrow)/g, '→')
    .replace(/\^\{?2\}?/g, '²').replace(/\^\{?3\}?/g, '³').replace(/\^\{?n\}?/g, 'ⁿ')
    .replace(/\\[a-zA-Z]+/g, '').replace(/[{}*_#`]/g, '').replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/**
 * Toute la collection, par matière.
 * @returns {{ subjects: [{subject, color, cards:[{card, rarity, char, course}], owned, total}], owned, total, pending: [...] }}
 */
export async function loadCollection() {
  const [cards, courses, seen] = await Promise.all([db.getAll('cards'), db.getAll('courses'), db.getSetting('collection')]);
  const revealed = seen || {};
  const byCourse = Object.fromEntries(courses.map((c) => [c.id, c]));
  const groups = {};
  const pending = [];
  let n = 0;
  for (const card of cards) {
    const course = byCourse[card.courseId];
    if (!course || card.flagged) continue;
    const subject = course.subject || 'Autre';
    const rarity = rarityOf(card);
    const item = { card, course, rarity, char: characterOf(card), num: ++n };
    (groups[subject] ||= []).push(item);
    if (rarity && (revealed[card.id] === undefined || RANK[revealed[card.id]] < RANK[rarity.id])) pending.push(item);
  }
  const subjects = Object.entries(groups).map(([subject, list]) => ({
    subject,
    color: subjectHex(subject),
    cards: list.sort((a, b) => (b.rarity ? RANK[b.rarity.id] + 1 : 0) - (a.rarity ? RANK[a.rarity.id] + 1 : 0)),
    owned: list.filter((x) => x.rarity).length,
    total: list.length,
  }));
  const owned = subjects.reduce((s, x) => s + x.owned, 0);
  const total = subjects.reduce((s, x) => s + x.total, 0);
  return { subjects, owned, total, pending, revealed };
}

/** Note les cartes comme révélées (après l'animation d'ouverture). */
export async function markRevealed(items) {
  const seen = (await db.getSetting('collection')) || {};
  for (const it of items) seen[it.card.id] = it.rarity.id;
  await db.setSetting('collection', seen);
}

/** Nombre de cartes à ouvrir (pour les pastilles). */
export async function pendingCount() {
  return (await loadCollection()).pending.length;
}
