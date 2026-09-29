// =====================================================================
// db.js — Stockage local dans IndexedDB (la "base de données" du navigateur)
// ---------------------------------------------------------------------
// Toutes les données restent SUR TON APPAREIL : cours, fiches, quiz,
// résultats, réglages (dont la clé API). Rien n'est envoyé sur GitHub.
//
// "Stores" (équivalent de tables) :
//   settings  : réglages { key, value }            (clé API, modèle, …)
//   courses   : cours importés (texte transcrit, résumé, …)
//   images    : photos compressées des cours      { id, courseId, n, blob }
//   cards     : fiches question/réponse + état de répétition espacée
//   quizzes   : QCM générés
//   results   : résultats (quiz, exercices, examens)
//   reviews   : historique des révisions de fiches (pour les statistiques)
//   exercises : exercices d'application (phase 2)
//   exams     : évaluations complètes (phase 2)
// =====================================================================

const DB_NAME = 'revision-ia';
const DB_VERSION = 1; // ⚠️ à augmenter si tu ajoutes un store ou un index

// Description des stores et de leurs index (pour rechercher vite).
const STORES = {
  settings: { keyPath: 'key', indexes: [] },
  courses: { keyPath: 'id', indexes: ['subject'] },
  images: { keyPath: 'id', indexes: ['courseId'] },
  cards: { keyPath: 'id', indexes: ['courseId', 'due'] },
  quizzes: { keyPath: 'id', indexes: ['courseId'] },
  results: { keyPath: 'id', indexes: ['courseId', 'type'] },
  reviews: { keyPath: 'id', indexes: ['cardId', 'day'] },
  exercises: { keyPath: 'id', indexes: ['courseId'] },
  exams: { keyPath: 'id', indexes: [] },
};

let dbPromise = null;

/** Ouvre (et crée si besoin) la base de données. */
function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    // Appelé à la première ouverture ou quand DB_VERSION augmente.
    req.onupgradeneeded = () => {
      const db = req.result;
      const tx = req.transaction;
      for (const [name, def] of Object.entries(STORES)) {
        const store = db.objectStoreNames.contains(name)
          ? tx.objectStore(name)
          : db.createObjectStore(name, { keyPath: def.keyPath });
        for (const idx of def.indexes) {
          if (!store.indexNames.contains(idx)) store.createIndex(idx, idx);
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

/** Transforme une requête IndexedDB (à base d'événements) en Promise. */
function wrap(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Ouvre une transaction et renvoie le store demandé. */
async function store(name, mode = 'readonly') {
  const db = await openDB();
  return db.transaction(name, mode).objectStore(name);
}

/** Génère un identifiant unique. */
export function newId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Lit un objet par son identifiant. */
export async function get(name, id) {
  return wrap((await store(name)).get(id));
}

/** Lit tous les objets d'un store. */
export async function getAll(name) {
  return wrap((await store(name)).getAll());
}

/** Lit tous les objets dont l'index `index` vaut `value`. */
export async function getByIndex(name, index, value) {
  return wrap((await store(name)).index(index).getAll(value));
}

/** Ajoute ou remplace un objet. */
export async function put(name, obj) {
  await wrap((await store(name, 'readwrite')).put(obj));
  return obj;
}

/** Ajoute ou remplace plusieurs objets en une seule transaction. */
export async function putMany(name, list) {
  const db = await openDB();
  const tx = db.transaction(name, 'readwrite');
  const s = tx.objectStore(name);
  for (const obj of list) s.put(obj);
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

/** Supprime un objet par son identifiant. */
export async function del(name, id) {
  return wrap((await store(name, 'readwrite')).delete(id));
}

/** Supprime tous les objets liés à un index (ex. toutes les fiches d'un cours). */
export async function delByIndex(name, index, value) {
  const items = await getByIndex(name, index, value);
  const s = await store(name, 'readwrite');
  const key = STORES[name].keyPath;
  await Promise.all(items.map((it) => wrap(s.delete(it[key]))));
}

/** Vide complètement un store. */
export async function clear(name) {
  return wrap((await store(name, 'readwrite')).clear());
}

// ---------------------------------------------------------------------
// Réglages (clé API, modèle, options…)
// ---------------------------------------------------------------------

/** Valeurs par défaut des réglages. */
export const DEFAULT_SETTINGS = {
  apiKey: '',
  // Modèle Gemini par défaut : le Flash-Lite gratuit, le plus RAPIDE et le moins
  // surchargé (doc Google, sept. 2026). En cas de surcharge, l'appli bascule
  // toute seule sur les modèles de secours (MODEL_CHAIN dans core/gemini.js).
  // Modifiable dans Profil → Réglages, sans toucher au code.
  model: 'gemini-3.5-flash-lite',
  verifyMode: false, // Phase 2 : 2e appel IA de vérification
  theme: 'dark', // 'dark' ou 'light'
  sounds: false, // sons courts (désactivés par défaut)
  vibration: true, // vibrations légères sur mobile
  quizTimer: false, // minuteur visuel pendant les quiz
  // Phase 3 : scène du conseil de correction ET pouvoirs spéciaux.
  // 'complete' (tout), 'short' (version courte, pas de pouvoir plein écran), 'off' (désactivé)
  council: 'short', // version courte par défaut : la note arrive vite
  // Profil de jeu : prénom, compagnon, XP, série, badges… (voir core/game.js)
  profile: null,
};

export async function getSetting(key) {
  const row = await get('settings', key);
  return row ? row.value : DEFAULT_SETTINGS[key];
}

export async function setSetting(key, value) {
  return put('settings', { key, value });
}

// ---------------------------------------------------------------------
// Sauvegarde / restauration (fichier JSON)
// ---------------------------------------------------------------------

// Stores inclus dans la sauvegarde. Les images (lourdes) ne sont pas
// incluses : le texte transcrit du cours suffit pour réviser.
const BACKUP_STORES = ['courses', 'cards', 'quizzes', 'results', 'reviews', 'exercises', 'exams'];

/** Crée un objet contenant toutes les données (sauf la clé API). */
export async function exportAll() {
  const data = { app: 'revision-ia', version: 1, date: new Date().toISOString(), stores: {} };
  for (const name of BACKUP_STORES) data.stores[name] = await getAll(name);
  // Réglages : on exporte tout SAUF la clé API (sécurité).
  data.stores.settings = (await getAll('settings')).filter((s) => s.key !== 'apiKey');
  return data;
}

/**
 * Importe une sauvegarde. Les éléments existants avec le même identifiant
 * sont remplacés ; les autres données sont conservées (fusion).
 */
export async function importAll(data) {
  if (!data || data.app !== 'revision-ia' || !data.stores) {
    throw new Error("Ce fichier n'est pas une sauvegarde de Révision IA.");
  }
  let count = 0;
  for (const [name, list] of Object.entries(data.stores)) {
    if (!STORES[name] || !Array.isArray(list)) continue;
    const clean = name === 'settings' ? list.filter((s) => s.key !== 'apiKey') : list;
    await putMany(name, clean);
    count += clean.length;
  }
  return count;
}

/** Demande au navigateur de ne pas effacer nos données (si possible). */
export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
  } catch { /* pas grave si refusé */ }
}
