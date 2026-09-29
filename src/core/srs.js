// =====================================================================
// srs.js — Répétition espacée (algorithme SM-2)
// ---------------------------------------------------------------------
// Principe : plus une fiche est facile pour toi, plus on attend longtemps
// avant de te la redemander. Une fiche ratée revient dès aujourd'hui.
//
// Chaque fiche garde :
//   ease     : facilité (2.5 au départ, minimum 1.3)
//   interval : nombre de jours avant la prochaine révision
//   reps     : nombre de réussites d'affilée
//   due      : date de la prochaine révision ("AAAA-MM-JJ")
// =====================================================================

/** Boutons de réponse et note SM-2 associée (0 à 5). */
export const GRADES = {
  rate: { label: 'Raté', q: 1 },
  difficile: { label: 'Difficile', q: 3 },
  moyen: { label: 'Moyen', q: 4 },
  facile: { label: 'Facile', q: 5 },
};

/** Date du jour au format "AAAA-MM-JJ" (heure locale). */
export function today(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Ajoute `n` jours à aujourd'hui et renvoie "AAAA-MM-JJ". */
export function addDays(n, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + n);
  return today(d);
}

/** État initial d'une nouvelle fiche (à réviser aujourd'hui). */
export function initialState() {
  return { ease: 2.5, interval: 0, reps: 0, due: today(), lapses: 0 };
}

/**
 * Calcule le nouvel état d'une fiche après une réponse.
 * @param {object} card  la fiche (avec ease, interval, reps)
 * @param {string} grade 'rate' | 'difficile' | 'moyen' | 'facile'
 * @returns {object} { ease, interval, reps, due, lapses }
 */
export function schedule(card, grade) {
  const q = GRADES[grade].q;
  let { ease = 2.5, interval = 0, reps = 0, lapses = 0 } = card;

  if (q < 3) {
    // Raté : on recommence depuis le début, à revoir aujourd'hui.
    reps = 0;
    interval = 0;
    lapses += 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ease);
    // "Difficile" : on raccourcit un peu l'intervalle.
    if (q === 3) interval = Math.max(1, Math.round(interval * 0.8));
  }

  // Formule SM-2 de mise à jour de la facilité.
  ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ease < 1.3) ease = 1.3;

  return { ease: Math.round(ease * 100) / 100, interval, reps, lapses, due: addDays(interval) };
}

/** Une fiche est-elle à réviser aujourd'hui ? (les fiches signalées sont exclues) */
export function isDue(card, day = today()) {
  return !card.flagged && card.due <= day;
}
