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
//  - QUOTA DU JOUR : chaque modèle gratuit a son propre quota quotidien. Un
//    modèle qui répond "quota du jour dépassé" est mémorisé (core/quota.js)
//    et n'est plus retenté avant la recharge (minuit, heure du Pacifique).
//    Chaque demande réussie est comptée (Réglages → Quota Gemini).
//  - JSON structuré (responseSchema) vérifié ; invalide → nouvel essai.
//  - LaTeX mal échappé par l'IA (\frac écrit avec une seule barre) réparé avant
//    lecture du JSON (voir core/mathfix.js).
//  - MESURE : chaque appel note ses temps (voir getTimings / Panneau créateur).
//  - La clé API est lue dans IndexedDB (Réglages), jamais dans le code.
// =====================================================================

import { getSetting, setSetting } from './db.js';
import { parseJsonLatex } from './mathfix.js';
import { MATH_FIX_PROMPT } from '../data/prompts.js';
import { countRequest, markExhausted, isExhausted, resetTimeText } from './quota.js';
import { t, getLang, LANGS } from '../i18n/index.js';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

/**
 * Modèles gratuits essayés dans l'ordre en cas de surcharge / quota
 * (offre gratuite de Google, oct. 2026 : les « Flash-Lite » ont le plus gros
 * quota quotidien, les « Flash » beaucoup moins). Chaque modèle a son propre
 * quota : quand l'un est épuisé, le suivant prend le relais.
 * Le modèle choisi dans les Réglages passe en premier.
 * 👉 Pour changer l'ordre de secours, modifie cette liste.
 */
export const MODEL_CHAIN = [
  'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite',
  'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash',
];

const REQUEST_TIMEOUT_MS = 90 * 1000; // pas de réponse du tout en 90 s → modèle suivant
const UPLOAD_BYTES_PER_MS = 20; // + 1 s par 20 Ko envoyés (photos sur connexion lente)
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
  onStatus?.(t('📡 Pas de connexion… en attente du réseau'));
  return new Promise((resolve) => window.addEventListener('online', resolve, { once: true }));
}

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
    return { error: new AIError('BAD_KEY', t('🔑 Clé API invalide. Vérifie-la dans les Réglages.')) };
  }
  if (status === 403) {
    return { error: new AIError('BAD_KEY', t('🔑 Clé API refusée (permission). Vérifie ta clé ou crée-en une nouvelle sur Google AI Studio.')) };
  }
  if (status === 404) {
    return { error: new AIError('BAD_MODEL', `${t("🤖 Modèle introuvable (")}${msg}).`), switchModel: true };
  }
  if (status === 413 || /too large|exceeds the maximum|payload size/i.test(msg)) {
    return { error: new AIError('TOO_BIG', t('📦 Fichier trop gros pour être envoyé. Réduis le nombre de pages ou de photos.')) };
  }
  if (status === 429) {
    const perDay = /PerDay|per day|daily/i.test(msg + reason);
    return {
      error: new AIError('QUOTA', perDay
        ? t('⏳ Quota gratuit du jour dépassé pour ce modèle.')
        : t('⏳ Quota gratuit dépassé. Réessaie dans quelques minutes.')),
      switchModel: true, perDay,
    };
  }
  if (status === 400 && /thinking/i.test(msg)) {
    return { error: new AIError('BAD_REQUEST', msg), noThinking: true };
  }
  if (status === 400) {
    return { error: new AIError('BAD_REQUEST', `${t("Requête refusée par Gemini :")} ${msg}`) };
  }
  if (status >= 500) {
    return { error: new AIError('SERVER', t('🛠️ Les serveurs de Gemini sont surchargés. Réessaie dans quelques minutes.')), switchModel: true };
  }
  return { error: new AIError('UNKNOWN', `${t("Erreur")} ${status} : ${msg || 'inconnue'}`) };
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
    else if (k === 'propertyOrdering') continue; // propre au format "openapi" (l'ordre des clés suffit ici)
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
export function validate(value, schema, path = t('réponse')) {
  const errors = [];
  const type = String(schema.type || '').toUpperCase();
  const fail = (m) => errors.push(`${path} : ${m}`);
  if (type === 'OBJECT') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${path} ${t(": objet attendu")}`];
    for (const key of schema.required || []) {
      if (value[key] === undefined || value[key] === null) fail(`champ "${key}" manquant`);
    }
    for (const [key, sub] of Object.entries(schema.properties || {})) {
      if (value[key] !== undefined && value[key] !== null) errors.push(...validate(value[key], sub, `${path}.${key}`));
    }
  } else if (type === 'ARRAY') {
    if (!Array.isArray(value)) return [`${path} ${t(": liste attendue")}`];
    value.forEach((v, i) => errors.push(...validate(v, schema.items, `${path}[${i}]`)));
  } else if (type === 'STRING') {
    if (typeof value !== 'string') fail(t('texte attendu'));
    else if (schema.enum && !schema.enum.includes(value)) fail(`valeur "${value}" non autorisée`);
  } else if (type === 'INTEGER') {
    if (!Number.isInteger(value)) fail(t('nombre entier attendu'));
  } else if (type === 'NUMBER') {
    if (typeof value !== 'number') fail(t('nombre attendu'));
  } else if (type === 'BOOLEAN') {
    if (typeof value !== 'boolean') fail(t('vrai/faux attendu'));
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
        try { items.push(parseJsonLatex(text.slice(objStart, i + 1))); } catch { /* objet pas encore lisible */ }
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
async function callModel(model, apiKey, body, { stream, onText, tm }) {
  const url = `${API_BASE}${encodeURIComponent(model)}:${stream ? 'streamGenerateContent?alt=sse' : 'generateContent'}`;
  const ctrl = new AbortController();
  const payload = JSON.stringify(body);
  // Le délai compte aussi l'envoi : plus il y a de photos, plus on attend.
  let timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS + payload.length / UPLOAD_BYTES_PER_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: payload,
      signal: ctrl.signal,
    });
    if (res.ok) countRequest(model);
    if (!res.ok) {
      let errBody = null;
      try { errBody = await res.json(); } catch { /* corps vide */ }
      return { http: classifyHttpError(res.status, errBody) };
    }
    if (!stream) {
      const data = await res.json();
      tm.firstText = tm.firstText || performance.now();
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
          if (!tm.firstText) tm.firstText = performance.now();
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
    throw new AIError('BLOCKED', `${t("Gemini a refusé de traiter ce contenu (")}${data.promptFeedback.blockReason}).`);
  }
  const cand = data?.candidates?.[0];
  if (!cand) {
    if (partial) return '';
    throw new AIError('EMPTY', t('Réponse vide de Gemini.'));
  }
  if (cand.finishReason === 'SAFETY' || cand.finishReason === 'PROHIBITED_CONTENT') {
    throw new AIError('BLOCKED', t('Gemini a bloqué la réponse (filtre de sécurité).'));
  }
  if (cand.finishReason === 'MAX_TOKENS') {
    throw new AIError('TOO_LONG', t('Réponse trop longue (coupée). Essaie avec un cours plus court.'));
  }
  return (cand.content?.parts || []).filter((p) => typeof p.text === 'string' && !p.thought).map((p) => p.text).join('');
}

/**
 * Langue du contenu créé (Réglages → « Langue du contenu créé par l'IA ») :
 * consigne ajoutée à la fin de la consigne système. Rien en français avec
 * le réglage par défaut (les demandes restent exactement les mêmes).
 * Pas de traduction : Gemini écrit directement dans la bonne langue.
 */
async function languageNote() {
  if (await getSetting('genLang') === 'cours') {
    return 'LANGUE : écris tout dans la langue du cours fourni (pas forcément le français). "quote" reste copié mot pour mot.';
  }
  const lang = getLang();
  if (lang === 'fr') return '';
  return `LANGUE : écris tout (titres, textes, questions, choix, explications, corrections, commentaires) en ${LANGS[lang]} (code ${lang}), même si le cours est dans une autre langue ; garde le ton (tutoiement, simple). "quote" reste copié mot pour mot du cours, dans sa langue d'origine.`;
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
 * @param {boolean}  [opts.keepLanguage] true = garder la langue du document (transcription)
 */
export async function generateJSON(opts) {
  const { schema, check, onStatus, streamKey, onItem, label = 'IA' } = opts;
  const apiKey = (await getSetting('apiKey') || '').trim();
  if (!apiKey) throw new AIError('NO_KEY', t('🔑 Aucune clé API. Va dans Réglages pour coller ta clé Gemini.'));
  const primary = (await getSetting('model') || MODEL_CHAIN[0]).trim();
  // opts.model : forcer UN modèle précis (banc d'essai du Panneau créateur).
  const all = opts.model ? [opts.model] : [primary, ...MODEL_CHAIN.filter((m) => m !== primary)];
  const chain = [];
  for (const m of all) if (opts.model || !(await isExhausted(m))) chain.push(m);
  if (!chain.length) throw quotaDayError();
  const req = { temperature: 0.4, thinking: 'minimal', ...opts };
  const note = opts.keepLanguage ? '' : await languageNote();
  if (note) req.system = req.system ? `${req.system}\n${note}` : note;

  const tm = { label, start: performance.now(), firstText: 0, end: 0, model: '', retries: 0, switches: [], stream: !!streamKey };
  let lastError = null;
  let jsonTries = 0;
  let mathFixTried = false;
  let sameModel = false; // true = on réessaie le même modèle (sans bascule)
  let quickSwitch = false; // modèle précédent épuisé pour la journée : bascule sans attendre

  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    await waitForOnline(onStatus);
    if (i > 0 && !sameModel) {
      const wait = quickSwitch ? 0 : SWITCH_DELAYS[Math.min(i - 1, SWITCH_DELAYS.length - 1)];
      onStatus?.(quickSwitch ? `⏳ ${chain[i - 1]} ${t(": quota du jour épuisé →")} ${model}…` : `⚡ ${chain[i - 1]} ${t("occupé → bascule sur")} ${model}…`);
      tm.switches.push(model);
      await sleep(wait);
    }
    quickSwitch = false;
    sameModel = false;
    tm.model = model;
    onStatus?.(`${t("via")} ${model}`); // modèle utilisé, affiché discrètement
    let emitted = 0; // éléments déjà envoyés à onItem (streaming)
    let result;
    try {
      result = await callModel(model, apiKey, buildBody(req, model), {
        stream: !!streamKey, tm,
        onText: streamKey ? (txt) => {
          const items = completeItems(txt, streamKey);
          for (; emitted < items.length; emitted++) onItem?.(items[emitted], emitted);
        } : null,
      });
    } catch (e) {
      if (e instanceof AIError) throw e; // contenu bloqué, trop long…
      // Coupure réseau ou délai dépassé : modèle suivant.
      lastError = new AIError('NETWORK', t('📡 Connexion interrompue. Vérifie ton internet puis réessaie.'));
      tm.retries++;
      continue;
    }

    if (result.http) {
      const h = result.http;
      if (h.noThinking) { noThinking.add(model); i--; sameModel = true; tm.retries++; continue; } // même modèle, sans réglage de réflexion
      if (h.error.code === 'BAD_REQUEST' && /schema|Unknown name|Invalid JSON payload/i.test(h.error.message) && !schemaSwitched) {
        schemaSwitched = true;
        schemaFormat = schemaFormat === 'openapi' ? 'jsonschema' : 'openapi';
        i--; sameModel = true; tm.retries++; continue;
      }
      lastError = h.error;
      // Quota du jour épuisé (ou modèle introuvable) : mémorisé jusqu'à la recharge.
      if (h.perDay && !opts.model) { await markExhausted(model, 'quota'); quickSwitch = true; }
      if (h.error.code === 'BAD_MODEL' && !opts.model) { await markExhausted(model, 'absent'); quickSwitch = true; }
      if (!h.switchModel) break; // erreur définitive (clé invalide, fichier trop gros…)
      tm.retries++;
      continue;
    }

    // Réponse reçue : on vérifie le JSON.
    let json;
    // parseJsonLatex : répare le LaTeX mal échappé (\frac, \times, \neq… abîmés ou illisibles en JSON).
    try { json = parseJsonLatex(result.text); } catch { json = null; }
    const problems = json ? validate(json, schema) : [t('JSON illisible')];
    const extra = json && !problems.length && check ? check(json) : null;
    if (json && !problems.length && !extra) {
      // Formules encore invalides après réparation : UNE demande de correction à l'IA.
      if (!opts.noMathCheck && !mathFixTried) {
        mathFixTried = true;
        const fixed = await fixMathOnce(json, { model, apiKey, req, schema, check, tm, onStatus });
        if (fixed) json = fixed;
      }
      // Streaming : on transmet les éventuels derniers éléments.
      if (streamKey && onItem) {
        const all = json[streamKey] || [];
        for (; emitted < all.length; emitted++) onItem(all[emitted], emitted);
      }
      tm.end = performance.now();
      record({
        label, model, stream: tm.stream, retries: tm.retries, switches: tm.switches,
        firstMs: Math.round((tm.firstText || tm.end) - tm.start), totalMs: Math.round(tm.end - tm.start),
        date: new Date().toISOString(),
      });
      return json;
    }
    console.warn('JSON non conforme :', problems, extra);
    lastError = new AIError('BAD_JSON', `${t("L'IA a renvoyé une réponse mal formée (")}${(problems[0] || extra)}). Réessaie.`);
    tm.retries++;
    if (jsonTries++ >= MAX_JSON_RETRIES) break;
  }
  // Tous les modèles sont épuisés pour la journée : message avec l'heure de recharge.
  if (lastError?.code === 'QUOTA' || lastError?.code === 'BAD_MODEL') {
    let left = 0;
    for (const m of all) if (!(await isExhausted(m))) left++;
    if (!left && !opts.model) throw quotaDayError();
  }
  throw lastError || new AIError('SERVER', t('🛠️ Les serveurs de Gemini sont surchargés. Réessaie dans quelques minutes.'));
}

/**
 * Vérifie les formules d'une réponse (après réparation, avec KaTeX) ; s'il en reste
 * d'invalides, redemande UNE fois au même modèle de corriger seulement ces formules.
 * Renvoie la réponse corrigée (si elle est meilleure) ou null (on garde l'originale :
 * l'affichage répare et montre en texte lisible ce qui reste invalide).
 */
async function fixMathOnce(json, { model, apiKey, req, schema, check, tm, onStatus }) {
  let bad;
  try {
    const [{ default: katex }, { badFormulas }] = await Promise.all([import('katex'), import('./mathcheck.js')]);
    bad = badFormulas(json, katex);
    if (!bad.length) return null;
    onStatus?.(t('🧮 Correction des formules…'));
    const prompt = `${MATH_FIX_PROMPT}\n\nFORMULES À CORRIGER :\n- ${bad.join('\n- ')}\n\nJSON À CORRIGER :\n${JSON.stringify(json)}`;
    const result = await callModel(model, apiKey, buildBody({ ...req, parts: [{ text: prompt }], temperature: 0.1 }, model), { stream: false, tm });
    if (result.http) return null;
    const out = parseJsonLatex(result.text);
    if (validate(out, schema).length || (check && check(out))) return null;
    return badFormulas(out, katex).length < bad.length ? out : null;
  } catch (e) {
    console.warn('Correction des formules impossible :', e);
    return null;
  }
}

/** Erreur "plus aucun modèle gratuit disponible aujourd'hui" (Tidiane l'explique). */
function quotaDayError() {
  const at = resetTimeText();
  const e = new AIError('QUOTA_DAY', `${t("⏳ Le quota gratuit du jour est épuisé sur tous les modèles Gemini. Il se recharge à")} ${at} ${t("(heure de ton téléphone).")}`);
  e.resetAt = at;
  return e;
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
