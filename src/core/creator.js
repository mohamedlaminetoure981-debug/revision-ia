// =====================================================================
// creator.js — MODE CRÉATEUR (réservé à MLT, le créateur de l'appli)
// ---------------------------------------------------------------------
// La phrase secrète n'est JAMAIS écrite ici. On garde seulement son
// "empreinte" SHA-256 (une suite de caractères impossible à relire).
// Quand quelqu'un tape un code dans Réglages → Code créateur, on calcule
// l'empreinte de ce qu'il a tapé (Web Crypto API) et on compare.
// Majuscules et espaces autour sont ignorés.
//
// 👉 Pour CHANGER la phrase secrète : calcule l'empreinte de la nouvelle
//    phrase (voir README, section Mode Créateur) et remplace CREATOR_HASH.
//
// ⚠️ C'est un "œuf de Pâques" amusant, pas une vraie sécurité : le Mode
//    Créateur ne donne accès à aucune donnée privée.
//
// Réglage "creator" dans IndexedDB : { active: true, name: 'MLT', welcomed: true }
// =====================================================================

import * as db from './db.js';

// Grain de sel ajouté avant le calcul (rend les tables d'empreintes toutes faites inutiles).
const SALT = 'revision-ia/createur:';
// Empreinte SHA-256 de SALT + phrase secrète (en minuscules, sans espaces autour).
const CREATOR_HASH = '626b4800d1dfefcec8366e19a1332814e25bf9478c333ad44d368b96b8cc2292';

let cache = null; // état du mode créateur en mémoire

/** Calcule l'empreinte SHA-256 (hexadécimal) d'un texte. */
async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Le code tapé est-il le bon ? */
export async function checkCode(input) {
  if (!input || !crypto?.subtle) return false;
  return (await sha256(SALT + input.trim().toLowerCase())) === CREATOR_HASH;
}

/** Charge l'état du mode créateur (au démarrage). */
export async function loadCreator() {
  cache = (await db.getSetting('creator')) || null;
  return cache;
}

/** Mode créateur actif ? (lecture rapide) */
export function isCreator() {
  return !!cache?.active;
}

/** Infos du mode créateur ({ active, name, welcomed }) ou null. */
export function getCreator() {
  return cache;
}

/** Nom affiché pour le créateur (MLT par défaut). */
export function creatorName() {
  return cache?.name || 'MLT';
}

/** Active le mode créateur. Renvoie true si c'est la toute première fois (scène d'accueil). */
export async function enableCreator() {
  const first = !cache?.welcomed;
  cache = { name: cache?.name || 'MLT', ...cache, active: true, welcomed: true };
  await db.setSetting('creator', cache);
  return first;
}

/** Désactive le mode créateur (il pourra être réactivé avec le code). */
export async function disableCreator() {
  cache = { ...(cache || {}), active: false };
  await db.setSetting('creator', cache);
}

/** Change le nom affiché du créateur. */
export async function setCreatorName(name) {
  cache = { ...(cache || {}), name: name.trim() || 'MLT' };
  await db.setSetting('creator', cache);
}
