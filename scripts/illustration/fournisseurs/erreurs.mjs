// =====================================================================
// fournisseurs/erreurs.mjs — Erreurs communes à tous les fournisseurs d'images
// =====================================================================

/** Quota, limite ou service indisponible : on s'arrête proprement, on reprendra au prochain lancement. */
export class ArretQuota extends Error {
  constructor(message, reprise, code = null) { super(message); this.reprise = reprise; this.code = code; } // reprise : Date ou null ; code : 'modeles-refuses' si aucun modèle n'est ouvert
}
/** Échec limité à UNE case (image refusée, réponse vide…) : on passe à la suivante. */
export class ErreurCase extends Error {}

export const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

/** Prochain minuit, heure du Pacifique (remise à zéro des quotas Google). */
export function prochainMinuitPacifique(now = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const pacificAsUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  const offset = pacificAsUtc - now.getTime(); // décalage du Pacifique par rapport à UTC
  const nextMidnight = Date.UTC(+parts.year, +parts.month - 1, +parts.day + 1, 0, 5, 0); // + 5 min de marge
  return new Date(nextMidnight - offset);
}

/** « mardi 14 octobre à 08:05 (heure de Conakry) ». */
export function quandFr(d) {
  if (!d) return 'plus tard';
  const s = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Conakry', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(d);
  return `${s} (heure de Conakry)`;
}
