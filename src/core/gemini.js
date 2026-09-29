// =====================================================================
// gemini.js — Appels à l'API Google Gemini, directement depuis le navigateur
// ---------------------------------------------------------------------
// OBJECTIF : du "tac au tac".
//  - STREAMING (streamGenerateContent) : le texte arrive morceau par morceau ;
//    `onItem` reçoit chaque élément JSON complet dès qu'il est prêt
//    (ex. chaque partie du résumé → la 1re story s'affiche en quelques s).
//  - RÉFLEXION MINIMALE : thinkingLevel "minimal"/"low" (Gemini 3) ou
//    thinkingBudget 0 (Gemini 2.5), sauf demande contraire (corrections).
//  - BASCULE AUTOMATIQUE : si un modèle est surchargé (503) ou à court de
//    quota (429), on passe tout de suite au suivant de MODEL_CHAIN
//    (attente 1 s puis 3 s max). La requête suivante repart du modèle principal.
//  - JSON structuré (responseSchema) vérifié ; invalide → nouvel essai.
//  - MESURE : chaque appel note ses temps (voir getTimings / Panneau créateur).
//  - La clé API est lue dans IndexedDB (Réglages), jamais dans le code.
// =====================================================================

import { getSetting, setSetting } from './db.js';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

/**
 * Modèles gratuits essayés dans l'ordre en cas de surcharge / quota
 * (doc Google, sept. 2026). Le modèle choisi dans les Réglages passe en premier.
 * 👉 Pour changer l'ordre de secours, modifie cette liste.
 */
export const MODEL_CHAIN = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash-lite'];

const REQUEST_TIMEOUT_MS = 90 * 1000; // pas de réponse du tout en 90 s → modèle suivant
const STREAM_IDLE_MS = 45 * 1000; // plus rien reçu pendant 45 s en streaming → modèle suivant
const MAX_JSON_RETRIES = 1; // JSON invalide : 1 nouvel essai (sur le modèle suivant)
const SWITCH_DELAYS = [1000, 3000]; // attente avant bascule : 1 s, puis 3 s maximum

/** Erreur "compréhensible" affichée à l'utilisateur. */
export class AIError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code; // 'NO_KEY', 'BAD_KEY', 'QUOTA', 'NETWORK', 'TOO_BIG', 'SERVER', …
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Attend le retour de la connexion internet (événement "online"). */
function waitForOnline(onStatus) {
  if (navigator.onLine) return Promise.resolve();
  onStatus?.('📡 Pas de connexion… en attente du réseau');
  return new Promise((resolve) => window.addEventListener('online', resolve, { once: true }));
}

// Modèles épuisés pour la journée (quota quotidien) : on ne les réessaie plus.
const exhausted = new Set();
// Modèles qui refusent le réglage de réflexion : on ne l'envoie plus.
const noThinking = new Set();

/**
 * Traduit une réponse HTTP en erreur claire.
 * switchModel = true → essayer tout de suite un autre modèle.
 */
function classifyHttpError(status, body) {
  const msg = body?.error?.message || '';
  const reason = JSON.stringify(body?.error?.details || '');
  if (status === 400 && /API key not valid|API_KEY_INVALID/i.test(msg + reason)) {
    return { error: new AIError('BAD_KEY', '🔑 Clé API invalide. Vérifie-la dans les Réglages.') };
  }
  if (status === 403) {
    return { error: new AIError('BAD_KEY', '🔑 Clé API refusée (permission). Vérifie ta clé ou crée-en une nouvelle sur Google AI Studio.') };
  }
  if (status === 404) {
    return { error: new AIError('BAD_MODEL', `🤖 Modèle introuvable (${msg}).`), switchModel: true };
  }
  if (status === 413 || /too large|exceeds the maximum|payload size/i.test(msg)) {
    return { error: new AIError('TOO_BIG', '📦 Fichier trop gros pour être envoyé. Réduis le nombre de pages ou de photos.') };
  }
  if (status === 429) {
    const perDay = /PerDay|per day/i.test(msg + reason);
    return {
      error: new AIError('QUOTA', perDay
        ? '⏳ Quota gratuit du jour dépassé sur tous les modèles. Réessaie demain.'
        : '⏳ Quota gratuit dépassé. Réessaie dans quelques minutes.'),
      switchModel: true, perDay,
    };
  }
  if (status === 400 && /thinking/i.test(msg)) {
    return { error: new AIError('BAD_REQUEST', msg), noThinking: true };
  }
  if (status === 400) {
    return { error: new AIError('BAD_REQUEST', `Requête refusée par Gemini : ${msg}`) };
  }
  if (status >= 500) {
    return { error: new AIError('SERVER', '🛠️ Les serveurs de Gemini sont surchargés. Réessaie dans quelques minutes.'), switchModel: true };
  }
  return { error: new AIError('UNKNOWN', `Erreur ${status} : ${msg || 'inconnue'}`) };
}

// ---------------------------------------------------------------------
// Réflexion ("thinking") : au minimum par défaut
// ---------------------------------------------------------------------
/**
 * Réglage de réflexion adapté au modèle.
 * @param {string} model
 * @param {'minimal'|'low'|'medium'} level  'minimal' = le moins possible
 */
function thinkingConfig(model, level) {
  if (noThinking.has(model) || level === 'default') return null; // 'default' = réglage du modèle (ancienne méthode)
  if (/gemini-2\.5/.test(model)) {
    if (/pro/.test(model)) return null; // la version Pro ne peut pas couper la réflexion
    return { thinkingBudget: level === 'minimal' ? 0 : level === 'low' ? 1024 : 4096 };
  }
  if (/gemini-3/.test(model)) {
    // "minimal" n'existe que sur les Flash-Lite ; sinon "low" est le plus bas.
    const lite = /lite/.test(model);
    return { thinkingLevel: level === 'minimal' ? (lite ? 'minimal' : 'low') : level };
  }
  return null;
}

// ---------------------------------------------------------------------
// Schéma : deux formats acceptés par Gemini (on bascule si besoin)
// ---------------------------------------------------------------------
let schemaFormat = 'openapi';
let schemaSwitched = false;

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

/** Corps de la requête pour un modèle donné. */
function buildBody({ parts, schema, system, temperature, thinking }, model) {
  const cfg = { temperature, responseMimeType: 'application/json' };
  if (schemaFormat === 'openapi') cfg.responseSchema = schema;
  else cfg.responseJsonSchema = toJsonSchema(schema);
  const th = thinkingConfig(model, thinking);
  if (th) cfg.thinkingConfig = th;
  const body = { contents: [{ role: 'user', parts }], generationConfig: cfg };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  return body;
}

// ---------------------------------------------------------------------
// Validation du JSON (même schéma que celui envoyé à Gemini)
// ---------------------------------------------------------------------
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

// ---------------------------------------------------------------------
// Lecture progressive d'un JSON en cours d'arrivée (streaming)
// ---------------------------------------------------------------------
/**
 * Renvoie les objets COMPLETS déjà reçus dans la liste `key` d'un JSON
 * partiel, ex. {"sections":[{…},{…},{… (incomplet)
 * → les 2 premiers objets.
 */
export function completeItems(text, key) {
  const k = text.indexOf(`"${key}"`);
  if (k < 0) return [];
  const start = text.indexOf('[', k);
  if (start < 0) return [];
  const items = [];
  let depth = 0; let inStr = false; let esc = false; let objStart = -1;
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{' || c === '[') { if (depth === 0 && c === '{') objStart = i; depth++; } else if (c === '}' || c === ']') {
      depth--;
      if (depth === 0 && c === '}' && objStart >= 0) {
        try { items.push(JSON.parse(text.slice(objStart, i + 1))); } catch { /* objet pas encore lisible */ }
        objStart = -1;
      }
      if (depth < 0) break; // fin de la liste
    }
  }
  return items;
}

// ---------------------------------------------------------------------
// Mesure des temps (Panneau créateur)
// ---------------------------------------------------------------------
const timings = [];
/** Dernières mesures (la plus récente en premier). */
export function getTimings() {
  return timings;
}
function record(t) {
  timings.unshift(t);
  if (timings.length > 12) timings.pop();
  setSetting('timings', timings.slice(0, 12)).catch(() => {});
}
/** Recharge les mesures enregistrées (au démarrage du panneau). */
export async function loadTimings() {
  if (!timings.length) (await getSetting('timings') || []).forEach((t) => timings.push(t));
  return timings;
}

// ---------------------------------------------------------------------
// Un appel à un modèle (streaming ou non)
// ---------------------------------------------------------------------
async function callModel(model, apiKey, body, { stream, onText, t }) {
  const url = `${API_BASE}${encodeURIComponent(model)}:${stream ? 'streamGenerateContent?alt=sse' : 'generateContent'}`;
  const ctrl = new AbortController();
  let timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      let errBody = null;
      try { errBody = await res.json(); } catch { /* corps vide */ }
      return { http: classifyHttpError(res.status, errBody) };
    }
    if (!stream) {
      const data = await res.json();
      t.firstText = t.firstText || performance.now();
      return { text: extractText(data) };
    }
    // --- Streaming SSE : lignes "data: {json}" ---
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let text = '';
    for (;;) {
      clearTimeout(timer);
      timer = setTimeout(() => ctrl.abort(), STREAM_IDLE_MS);
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const lineStr = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!lineStr.startsWith('data:')) continue;
        const payload = lineStr.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        let chunk;
        try { chunk = JSON.parse(payload); } catch { continue; }
        const piece = extractText(chunk, true);
        if (piece) {
          if (!t.firstText) t.firstText = performance.now();
          text += piece;
          onText?.(text);
        }
      }
    }
    return { text };
  } finally {
    clearTimeout(timer);
  }
}

/** Extrait le texte d'une réponse (en ignorant les "pensées"). */
function extractText(data, partial = false) {
  if (data?.promptFeedback?.blockReason) {
    throw new AIError('BLOCKED', `Gemini a refusé de traiter ce contenu (${data.promptFeedback.blockReason}).`);
  }
  const cand = data?.candidates?.[0];
  if (!cand) {
    if (partial) return '';
    throw new AIError('EMPTY', 'Réponse vide de Gemini.');
  }
  if (cand.finishReason === 'SAFETY' || cand.finishReason === 'PROHIBITED_CONTENT') {
    throw new AIError('BLOCKED', 'Gemini a bloqué la réponse (filtre de sécurité).');
  }
  if (cand.finishReason === 'MAX_TOKENS') {
    throw new AIError('TOO_LONG', 'Réponse trop longue (coupée). Essaie avec un cours plus court.');
  }
  return (cand.content?.parts || []).filter((p) => typeof p.text === 'string' && !p.thought).map((p) => p.text).join('');
}

/**
 * Fonction principale : demande à Gemini une réponse JSON conforme au schéma.
 *
 * @param {object}   opts
 * @param {Array}    opts.parts        contenu envoyé : [{ text }, { inlineData: { mimeType, data } }, …]
 * @param {object}   opts.schema       schéma JSON attendu (voir src/data/prompts.js)
 * @param {string}   [opts.system]     consigne "système" (rôle de l'IA)
 * @param {Function} [opts.check]      vérification supplémentaire (renvoie un message d'erreur ou null)
 * @param {Function} [opts.onStatus]   affichage de la progression (texte court)
 * @param {number}   [opts.temperature]
 * @param {string}   [opts.thinking]   'minimal' (défaut) | 'low' | 'medium' (corrections de calcul)
 * @param {string}   [opts.streamKey]  nom de la liste à diffuser au fil de l'eau (ex. 'sections')
 * @param {Function} [opts.onItem]     (élément, index) appelé pour chaque élément complet reçu
 * @param {string}   [opts.label]      nom de l'étape (mesures), ex. 'résumé'
 */
export async function generateJSON(opts) {
  const { schema, check, onStatus, streamKey, onItem, label = 'IA' } = opts;
  const apiKey = (await getSetting('apiKey') || '').trim();
  if (!apiKey) throw new AIError('NO_KEY', '🔑 Aucune clé API. Va dans Réglages pour coller ta clé Gemini.');
  const primary = (await getSetting('model') || MODEL_CHAIN[0]).trim();
  // opts.model : forcer UN modèle précis (banc d'essai du Panneau créateur).
  const chain = opts.model ? [opts.model] : [primary, ...MODEL_CHAIN.filter((m) => m !== primary)].filter((m) => !exhausted.has(m));
  const req = { temperature: 0.4, thinking: 'minimal', ...opts };

  const t = { label, start: performance.now(), firstText: 0, end: 0, model: '', retries: 0, switches: [], stream: !!streamKey };
  let lastError = null;
  let jsonTries = 0;
  let sameModel = false; // true = on réessaie le même modèle (sans bascule)

  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    await waitForOnline(onStatus);
    if (i > 0 && !sameModel) {
      const wait = SWITCH_DELAYS[Math.min(i - 1, SWITCH_DELAYS.length - 1)];
      onStatus?.(`⚡ ${chain[i - 1]} occupé → bascule sur ${model}…`);
      t.switches.push(model);
      await sleep(wait);
    }
    sameModel = false;
    t.model = model;
    onStatus?.(`via ${model}`); // modèle utilisé, affiché discrètement
    let emitted = 0; // éléments déjà envoyés à onItem (streaming)
    let result;
    try {
      result = await callModel(model, apiKey, buildBody(req, model), {
        stream: !!streamKey, t,
        onText: streamKey ? (txt) => {
          const items = completeItems(txt, streamKey);
          for (; emitted < items.length; emitted++) onItem?.(items[emitted], emitted);
        } : null,
      });
    } catch (e) {
      if (e instanceof AIError) throw e; // contenu bloqué, trop long…
      // Coupure réseau ou délai dépassé : modèle suivant.
      lastError = new AIError('NETWORK', '📡 Connexion interrompue. Vérifie ton internet puis réessaie.');
      t.retries++;
      continue;
    }

    if (result.http) {
      const h = result.http;
      if (h.noThinking) { noThinking.add(model); i--; sameModel = true; t.retries++; continue; } // même modèle, sans réglage de réflexion
      if (h.error.code === 'BAD_REQUEST' && /schema|Unknown name|Invalid JSON payload/i.test(h.error.message) && !schemaSwitched) {
        schemaSwitched = true;
        schemaFormat = schemaFormat === 'openapi' ? 'jsonschema' : 'openapi';
        i--; sameModel = true; t.retries++; continue;
      }
      lastError = h.error;
      if (h.perDay) exhausted.add(model);
      if (!h.switchModel) break; // erreur définitive (clé invalide, fichier trop gros…)
      t.retries++;
      continue;
    }

    // Réponse reçue : on vérifie le JSON.
    let json;
    try { json = JSON.parse(result.text); } catch { json = null; }
    const problems = json ? validate(json, schema) : ['JSON illisible'];
    const extra = json && !problems.length && check ? check(json) : null;
    if (json && !problems.length && !extra) {
      // Streaming : on transmet les éventuels derniers éléments.
      if (streamKey && onItem) {
        const all = json[streamKey] || [];
        for (; emitted < all.length; emitted++) onItem(all[emitted], emitted);
      }
      t.end = performance.now();
      record({
        label, model, stream: t.stream, retries: t.retries, switches: t.switches,
        firstMs: Math.round((t.firstText || t.end) - t.start), totalMs: Math.round(t.end - t.start),
        date: new Date().toISOString(),
      });
      return json;
    }
    console.warn('JSON non conforme :', problems, extra);
    lastError = new AIError('BAD_JSON', `L'IA a renvoyé une réponse mal formée (${(problems[0] || extra)}). Réessaie.`);
    t.retries++;
    if (jsonTries++ >= MAX_JSON_RETRIES) break;
  }
  throw lastError || new AIError('SERVER', '🛠️ Les serveurs de Gemini sont surchargés. Réessaie dans quelques minutes.');
}

/** Petit appel de test pour vérifier la clé et le nom du modèle. */
export async function testConnection() {
  const res = await generateJSON({
    parts: [{ text: 'Réponds {"ok": true}' }],
    schema: { type: 'OBJECT', properties: { ok: { type: 'BOOLEAN' } }, required: ['ok'] },
    label: 'test',
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
