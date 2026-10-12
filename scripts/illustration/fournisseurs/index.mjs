// =====================================================================
// fournisseurs/index.mjs — Choix du service d'images
// ---------------------------------------------------------------------
// ILLUS_FOURNISSEUR=gemini dans .env.local (gemini par défaut, le seul pour l'instant).
// Pour ajouter un service : créer fournisseurs/<nom>.mjs qui exporte creer(env) avec la même
// interface que gemini.mjs (generer, requete, traduire, listerModeles, nom, modeles), puis
// l'ajouter à la liste ci-dessous, avec le nom de sa variable de clé.
// =====================================================================

import * as gemini from './gemini.mjs';

export const FOURNISSEURS = {
  gemini: { module: gemini, cle: 'GEMINI_API_KEY' },
};

export function choisirFournisseur(env) {
  const nom = (env.ILLUS_FOURNISSEUR || 'gemini').toLowerCase();
  const f = FOURNISSEURS[nom];
  if (!f) throw new Error(`Fournisseur inconnu : ${nom} (choix : ${Object.keys(FOURNISSEURS).join(', ')})`);
  return { ...f, nom, service: f.module.creer(env) };
}
