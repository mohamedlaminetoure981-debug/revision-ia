// =====================================================================
// gemini.js — Appels à l'API Google Gemini, directement depuis le navigateur
// ---------------------------------------------------------------------
// - La clé API est lue dans IndexedDB (écran Réglages), jamais dans le code.
// - Les réponses sont demandées en JSON structuré (responseSchema).
// - Le JSON reçu est vérifié ; s'il est invalide → nouvel essai automatique.
// - Coupure réseau / serveur surchargé → réessais automatiques.
// - Toutes les erreurs sont traduites en messages clairs en français.
// =====================================================================

import { getSetting } from './db.js';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

// Nombre maximal d'essais pour un même appel.
const MAX_NETWORK_RETRIES = 4; // coupures réseau / serveur surchargé
const MAX_JSON_RETRIES = 2; // JSON invalide
const REQUEST_TIMEOUT_MS = 5 * 60 * 1000; // 5 min (connexion lente + gros cours)

/** Erreur "compréhensible" affichée à l'utilisateur. */
export class AIError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code; // 'NO_KEY', 'BAD_KEY', 'QUOTA', 'NETWORK', 'TOO_BIG', …
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Attend le retour de la connexion internet (événement "online"). */
function waitForOnline(onStatus) {
  if (navigator.onLine) return Promise.resolve();
  onStatus?.('📡 Pas de connexion… en attente du réseau');
  return new Promise((resolve) => window.addEventListener('online', resolve, { once: true }));
}

/**
 * Traduit une réponse HTTP en erreur claire.
 * Renvoie { error, retry, waitMs } : retry = faut-il réessayer ?
 */
function classifyHttpError(status, body) {
  const msg = body?.error?.message || '';
  const reason = JSON.stringify(body?.error?.details || '');

  if (status === 400 && /API key not valid|API_KEY_INVALID/i.test(msg + reason)) {
    return { error: new AIError('BAD_KEY', '🔑 Clé API invalide. Vérifie-la dans les Réglages.') };
  }
  if (status === 403) {
    return { error: new AIError('BAD_KEY', "🔑 Clé API refusée (permission). Vérifie ta clé ou crée-en une nouvelle sur Google AI Studio.") };
  }
  if (status === 404) {
    return { error: new AIError('BAD_MODEL', `🤖 Modèle introuvable. Vérifie le nom du modèle dans les Réglages. (${msg})`) };
  }
  if (status === 413 || /too large|exceeds the maximum|payload size/i.test(msg)) {
    return { error: new AIError('TOO_BIG', '📦 Fichier trop gros pour être envoyé. Réduis le nombre de pages ou de photos.') };
  }
  if (status === 429) {
    // Gemini indique parfois combien de temps attendre ("retryDelay": "30s").
    const m = reason.match(/"retryDelay":"(\d+)(?:\.\d+)?s"/);
    const waitMs = m ? (Number(m[1]) + 1) * 1000 : 20000;
    const perDay = /PerDay|per day/i.test(msg + reason);
    return {
      error: new AIError('QUOTA', perDay
        ? '⏳ Quota gratuit du jour dépassé. Réessaie demain (ou change de modèle dans les Réglages).'
        : '⏳ Quota gratuit dépassé. Réessaie dans quelques minutes.'),
      retry: !perDay && waitMs <= 65000,
      waitMs,
    };
  }
  if (status === 400) {
    return { error: new AIError('BAD_REQUEST', `Requête refusée par Gemini : ${msg}`) };
  }
  if (status >= 500) {
    return { error: new AIError('SERVER', '🛠️ Les serveurs de Gemini sont surchargés. Réessaie dans quelques minutes.'), retry: true, waitMs: 5000 };
  }
  return { error: new AIError('UNKNOWN', `Erreur ${status} : ${msg || 'inconnue'}`) };
}

/** Envoie UNE requête à Gemini (avec délai maximal). */
async function postOnce(url, apiKey, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Envoie la requête avec réessais automatiques en cas de coupure réseau,
 * de serveur surchargé ou de quota par minute. Renvoie le JSON brut de Gemini.
 */
async function callWithRetry(url, apiKey, body, onStatus) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_NETWORK_RETRIES; attempt++) {
    await waitForOnline(onStatus);
    let res;
    try {
      res = await postOnce(url, apiKey, body);
    } catch (e) {
      // fetch échoue = coupure réseau ou délai dépassé
      lastError = new AIError('NETWORK', '📡 Connexion interrompue. Vérifie ton internet puis réessaie.');
      const wait = 3000 * attempt;
      onStatus?.(`📡 Connexion perdue, nouvel essai ${attempt}/${MAX_NETWORK_RETRIES - 1} dans ${wait / 1000} s…`);
      await sleep(wait);
      continue;
    }
    if (res.ok) return res.json();

    let errBody = null;
    try { errBody = await res.json(); } catch { /* corps vide */ }
    const { error, retry, waitMs } = classifyHttpError(res.status, errBody);
    lastError = error;
    if (!retry || attempt === MAX_NETWORK_RETRIES) throw error;
    onStatus?.(`${error.message} Nouvel essai automatique dans ${Math.round(waitMs / 1000)} s…`);
    await sleep(waitMs * attempt);
  }
  throw lastError;
}

/** Extrait le texte de la réponse de Gemini (en ignorant les "pensées"). */
function extractText(data) {
  if (data?.promptFeedback?.blockReason) {
    throw new AIError('BLOCKED', `Gemini a refusé de traiter ce contenu (${data.promptFeedback.blockReason}).`);
  }
  const cand = data?.candidates?.[0];
  if (!cand) throw new AIError('EMPTY', 'Réponse vide de Gemini.');
  const text = (cand.content?.parts || [])
    .filter((p) => typeof p.text === 'string' && !p.thought)
    .map((p) => p.text)
    .join('');
  if (cand.finishReason === 'MAX_TOKENS') {
    throw new AIError('TOO_LONG', 'Réponse trop longue (coupée). Essaie avec un cours plus court.');
  }
  if (cand.finishReason === 'SAFETY' || cand.finishReason === 'PROHIBITED_CONTENT') {
    throw new AIError('BLOCKED', 'Gemini a bloqué la réponse (filtre de sécurité).');
  }
  return text;
}

/**
 * Vérifie qu'une valeur respecte le schéma (le même que celui envoyé à Gemini).
 * Renvoie la liste des problèmes trouvés (vide = tout va bien).
 */
export function validate(value, schema, path = 'réponse') {
  const errors = [];
  const type = String(schema.type || '').toUpperCase();
  const fail = (m) => errors.push(`${path} : ${m}`);

  if (type === 'OBJECT') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${path} : objet attendu`];
    for (const key of schema.required || []) {
      if (value[key] === undefined || value[key] === null) fail(`champ "${key}" manquant`);
    }
    for (const [key, sub] of Object.entries(schema.properties || {})) {
      if (value[key] !== undefined && value[key] !== null) errors.push(...validate(value[key], sub, `${path}.${key}`));
    }
  } else if (type === 'ARRAY') {
    if (!Array.isArray(value)) return [`${path} : liste attendue`];
    if (schema.minItems && value.length < schema.minItems) fail(`au moins ${schema.minItems} éléments attendus`);
    value.forEach((v, i) => errors.push(...validate(v, schema.items, `${path}[${i}]`)));
  } else if (type === 'STRING') {
    if (typeof value !== 'string') fail('texte attendu');
    else if (schema.enum && !schema.enum.includes(value)) fail(`valeur "${value}" non autorisée`);
  } else if (type === 'INTEGER') {
    if (!Number.isInteger(value)) fail('nombre entier attendu');
  } else if (type === 'NUMBER') {
    if (typeof value !== 'number') fail('nombre attendu');
  } else if (type === 'BOOLEAN') {
    if (typeof value !== 'boolean') fail('vrai/faux attendu');
  }
  return errors;
}

// Gemini accepte le schéma sous deux formes :
//  - 'openapi'    : champ "responseSchema", types en MAJUSCULES (OBJECT…) — format historique
//  - 'jsonschema' : champ "responseJsonSchema", JSON Schema standard (object…) — format récent
// On commence par le premier ; si Gemini le refuse, on passe automatiquement à l'autre.
let schemaFormat = 'openapi';
let switched = false;

/** Convertit les types en minuscules (format JSON Schema standard). */
function toJsonSchema(s) {
  if (Array.isArray(s)) return s.map(toJsonSchema);
  if (!s || typeof s !== 'object') return s;
  const out = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === 'type' && typeof v === 'string') out[k] = v.toLowerCase();
    else if (k === 'properties') out[k] = Object.fromEntries(Object.entries(v).map(([p, sub]) => [p, toJsonSchema(sub)]));
    else out[k] = toJsonSchema(v);
  }
  return out;
}

/** Place le schéma dans la requête selon le format choisi. */
function setSchema(body, schema) {
  const cfg = body.generationConfig;
  delete cfg.responseSchema;
  delete cfg.responseJsonSchema;
  if (schemaFormat === 'openapi') cfg.responseSchema = schema;
  else cfg.responseJsonSchema = toJsonSchema(schema);
}

/**
 * Fonction principale : demande à Gemini une réponse JSON conforme au schéma.
 *
 * @param {object}   opts
 * @param {Array}    opts.parts        contenu envoyé : [{ text }, { inlineData: { mimeType, data } }, …]
 * @param {object}   opts.schema       schéma JSON attendu (voir prompts.js)
 * @param {string}   [opts.system]     consigne "système" (rôle de l'IA)
 * @param {Function} [opts.check]      vérification supplémentaire (renvoie un message d'erreur ou null)
 * @param {Function} [opts.onStatus]   fonction appelée pour afficher la progression
 * @param {number}   [opts.temperature]
 */
export async function generateJSON({ parts, schema, system, check, onStatus, temperature = 0.4 }) {
  const apiKey = (await getSetting('apiKey') || '').trim();
  if (!apiKey) throw new AIError('NO_KEY', "🔑 Aucune clé API. Va dans Réglages pour coller ta clé Gemini.");
  const model = (await getSetting('model') || '').trim();
  const url = `${API_BASE}${encodeURIComponent(model)}:generateContent`;

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature, responseMimeType: 'application/json' },
  };
  setSchema(body, schema);
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  let lastProblem = '';
  for (let attempt = 0; attempt <= MAX_JSON_RETRIES; attempt++) {
    if (attempt > 0) onStatus?.(`🔁 Réponse incorrecte, nouvel essai (${attempt}/${MAX_JSON_RETRIES})…`);
    let data;
    try {
      data = await callWithRetry(url, apiKey, body, onStatus);
    } catch (e) {
      // Si Gemini refuse le format du schéma, on essaie l'autre format une fois.
      if (e.code === 'BAD_REQUEST' && /schema|Unknown name|Invalid JSON payload/i.test(e.message) && !switched) {
        switched = true;
        schemaFormat = schemaFormat === 'openapi' ? 'jsonschema' : 'openapi';
        setSchema(body, schema);
        data = await callWithRetry(url, apiKey, body, onStatus);
      } else {
        throw e;
      }
    }
    const text = extractText(data);
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      lastProblem = 'JSON illisible';
      continue;
    }
    const errors = validate(json, schema);
    if (errors.length) {
      lastProblem = errors.slice(0, 3).join(' ; ');
      console.warn('JSON non conforme :', errors);
      continue;
    }
    const extra = check ? check(json) : null;
    if (extra) {
      lastProblem = extra;
      continue;
    }
    return json;
  }
  throw new AIError('BAD_JSON', `L'IA a renvoyé une réponse mal formée plusieurs fois (${lastProblem}). Réessaie.`);
}

/** Petit appel de test pour vérifier la clé et le nom du modèle. */
export async function testConnection() {
  const res = await generateJSON({
    parts: [{ text: 'Réponds {"ok": true}' }],
    schema: { type: 'OBJECT', properties: { ok: { type: 'BOOLEAN' } }, required: ['ok'] },
  });
  return res.ok === true;
}

/** Convertit un Blob (image) en base64 pour l'envoyer à Gemini. */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
