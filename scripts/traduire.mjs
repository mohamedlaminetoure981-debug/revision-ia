// =====================================================================
// scripts/traduire.mjs — Traduction automatique avec Gemini (sur TON PC)
// ---------------------------------------------------------------------
// Traduit ce qui MANQUE encore dans une langue :
//   - personnages : répliques, rôles, conseils… → src/i18n/contenu/<langue>/personnages.json
//   - bd          : bulles et textes des BD     → src/i18n/contenu/<langue>/bd.json
//   - histoire    : textes du Mode Histoire     → src/i18n/contenu/<langue>/histoire.json
//   - interface   : boutons, menus, messages    → src/i18n/<langue>.json
// Ce qui est déjà traduit n'est JAMAIS redemandé (pas de quota gaspillé).
// Le travail est enregistré après chaque paquet : si ça coupe, relance,
// ça reprend où ça s'était arrêté.
//
// UTILISATION (dans le dossier du projet) :
//   1. Crée un fichier .env (jamais envoyé sur GitHub) avec la ligne :
//        GEMINI_API_KEY=ta_clé
//      (optionnel : GEMINI_MODEL=gemini-2.5-flash pour forcer un modèle)
//   2. npm run traduire -- en                 (tout)
//      npm run traduire -- en personnages     (seulement les répliques)
//      npm run traduire -- en bd histoire     (plusieurs parties)
//   3. Vérifie l'appli (npm run dev), puis commit + push des fichiers .json.
//
// Pour faire retraduire un texte : supprime-le du fichier .json et relance.
// =====================================================================

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PARTS = ['personnages', 'bd', 'histoire', 'interface'];
const BATCH = 40; // textes par demande (≈ 1 demande par personnage / chapitre)
const MODELS = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite'];
const LANG_NAMES = { en: 'English', ar: 'Arabic (العربية)', es: 'Spanish', pt: 'Portuguese', de: 'German', it: 'Italian' };

// ---------- Paramètres ----------
const [lang, ...wanted] = process.argv.slice(2);
if (!lang || !/^[a-z]{2}$/.test(lang) || lang === 'fr') {
  console.log('Utilisation : npm run traduire -- <langue> [personnages|bd|histoire|interface]\nExemple : npm run traduire -- en');
  process.exit(1);
}
const parts = wanted.length ? wanted : PARTS;
for (const p of parts) if (!PARTS.includes(p)) { console.log(`Partie inconnue : ${p} (choix : ${PARTS.join(', ')})`); process.exit(1); }

const env = readEnv();
const API_KEY = env.GEMINI_API_KEY;
if (!API_KEY) {
  console.log('❌ Clé manquante. Crée un fichier .env à la racine du projet avec :\nGEMINI_API_KEY=ta_clé');
  process.exit(1);
}
const models = env.GEMINI_MODEL ? [env.GEMINI_MODEL] : [...MODELS];
const langName = LANG_NAMES[lang] || lang;

/** Lit le fichier .env (lignes CLE=valeur). */
function readEnv() {
  const out = { ...process.env };
  try {
    for (const l of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
      const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* pas de .env */ }
  return out;
}

// ---------- Fichiers JSON ----------
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; } };
const writeJson = (f, data) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(data, null, 1) + '\n'); };
const getAt = (o, keys) => keys.reduce((x, k) => (x == null ? undefined : x[k]), o);
function setAt(o, keys, v) {
  let x = o;
  keys.slice(0, -1).forEach((k, i) => { if (x[k] == null) x[k] = typeof keys[i + 1] === 'number' ? [] : {}; x = x[k]; });
  x[keys.at(-1)] = v;
}
const done = (out, keys) => { const v = getAt(out, keys); return typeof v === 'string' && v.trim() !== ''; };

/** Relève les textes d'un objet : visit(clé, chemin) dit si un champ texte est à traduire. */
function collect(obj, keep, keys = [], list = []) {
  if (typeof obj === 'string') { if (obj.trim() && keep(keys)) list.push({ keys, fr: obj }); return list; }
  if (Array.isArray(obj)) obj.forEach((v, i) => collect(v, keep, [...keys, i], list));
  else if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) collect(v, keep, [...keys, k], list);
  return list;
}
const load = async (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

// ---------- Appel à Gemini ----------
const SYSTEM = `You translate a French study app for teenagers (Guinea, West Africa) into ${langName}.
Rules:
- Keep the same tone: young, casual, friendly, funny (anime/manga vibe). Adapt jokes and idioms so they still land; don't translate word for word.
- NEVER translate character names: Kaï, Mory, Nia, Sora, Ren, Awa, Tidiane, Binta, MLT, the app name "Révision IA", place names (Conakry, Kaloum…).
- Keep exactly: placeholders like {prenom}, emojis, *actions between asterisks*, LaTeX between $…$, line breaks, leading/trailing punctuation and spaces.
- Informal "you" (tutoiement). Keep it short when the French is short (speech bubbles, buttons).
- A text may be a fragment of a sentence (a variable comes before or after it): translate it so it still fits as a fragment.
- Answer ONLY with the JSON array: one object {"id", "t"} per input text, same ids.`;

let modelIndex = 0;
async function translate(items, context) {
  const prompt = `${context}\n\nTranslate each "fr" text into ${langName}:\n${JSON.stringify(items.map((x, id) => ({ id, fr: x.fr })))}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.6,
      responseMimeType: 'application/json',
      responseSchema: { type: 'ARRAY', items: { type: 'OBJECT', properties: { id: { type: 'INTEGER' }, t: { type: 'STRING' } }, required: ['id', 't'] } },
    },
  };
  for (let attempt = 0; attempt < 8; attempt++) {
    const model = models[modelIndex];
    if (!model) throw new Error('Tous les modèles sont épuisés pour aujourd’hui. Relance demain : le travail fait est gardé.');
    let res;
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY }, body: JSON.stringify(body),
      });
    } catch {
      console.log('   📡 Pas de connexion, nouvel essai dans 10 s…'); await sleep(10000); continue;
    }
    if (res.status === 400 || res.status === 401 || res.status === 403) throw new Error(`Clé refusée ou demande invalide (${res.status}) : vérifie GEMINI_API_KEY dans .env.\n${(await res.text()).slice(0, 300)}`);
    if (res.status === 404 || res.status === 429) {
      const txt = await res.text();
      if (res.status === 404 || /per day|PerDay|daily/i.test(txt)) { console.log(`   ⏭️ ${model} indisponible ou quota du jour épuisé → modèle suivant`); modelIndex++; continue; }
      console.log('   ⏳ Trop de demandes, pause de 30 s…'); await sleep(30000); continue;
    }
    if (!res.ok) { console.log(`   🛠️ Erreur ${res.status}, nouvel essai dans 15 s…`); await sleep(15000); continue; }
    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    let arr;
    try { arr = JSON.parse(text); } catch { console.log('   🤔 Réponse illisible, nouvel essai…'); continue; }
    const out = new Map();
    for (const o of Array.isArray(arr) ? arr : []) if (Number.isInteger(o?.id) && typeof o.t === 'string' && o.t.trim()) out.set(o.id, o.t);
    return items.map((x, id) => out.get(id) ?? null); // null = pas traduit (sera redemandé la prochaine fois)
  }
  throw new Error('Gemini ne répond pas correctement. Réessaie plus tard (le travail fait est gardé).');
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Traduit une liste par paquets et enregistre après chaque paquet. */
async function run(label, list, out, file, context) {
  const todo = list.filter((x) => !done(out, x.keys));
  if (!todo.length) return 0;
  let n = 0;
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH);
    const tr = await translate(batch, context);
    batch.forEach((x, k) => { if (tr[k]) { setAt(out, x.keys, tr[k]); n++; } });
    writeJson(file, out);
    console.log(`   ${label} : ${Math.min(i + BATCH, todo.length)}/${todo.length}`);
  }
  return n;
}

// ---------- Les 4 parties ----------
const CONTENU = path.join(ROOT, 'src/i18n/contenu', lang);

async function personnages() {
  const { CHARACTERS } = await load('src/data/characters.js');
  const file = path.join(CONTENU, 'personnages.json');
  const out = readJson(file);
  // Champs affichés : rôle, personnalité, répliques, conseil, pouvoir, répliques « créateur ».
  const keep = (k) => ['role', 'personality'].includes(k[0]) || ['lines', 'council', 'createur'].includes(k[0]) || (k[0] === 'power' && ['name', 'desc'].includes(k[1]));
  let n = 0;
  for (const [id, c] of Object.entries(CHARACTERS)) {
    const list = collect(c, keep).map((x) => ({ ...x, keys: [id, ...x.keys] }));
    n += await run(c.name, list, out, file,
      `Character: ${c.name} — ${c.role}. Personality: ${c.personality}\nThese are this character's lines (speech bubbles). Keep their voice and humour.`);
  }
  return n;
}

async function bd() {
  const file = path.join(CONTENU, 'bd.json');
  const out = readJson(file);
  const dir = path.join(ROOT, 'src/data/comic/chapitres');
  // Textes affichés : titres, bulles, cartouches, messages (pas les réglages de dessin).
  const keep = (k) => !k.includes('illus') && ['title', 'text', 'label', 'lines', 'from'].includes(String(k.findLast((x) => typeof x === 'string')));
  let n = 0;
  for (const f of fs.readdirSync(dir).filter((x) => /^ch\d+\.js$/.test(x)).sort()) {
    const ch = f.replace('.js', '');
    const data = (await load(`src/data/comic/chapitres/${f}`)).default;
    const list = collect(data, keep).map((x) => ({ ...x, keys: [ch, ...x.keys] }));
    n += await run(`BD ${ch}`, list, out, file, `Comic chapter "${data.title}" (speech bubbles, captions, signs). Keep it punchy and short.`);
  }
  return n;
}

async function histoire() {
  const { CHAPTERS, STORY_TITLE } = await load('src/data/story.js');
  const file = path.join(CONTENU, 'histoire.json');
  const out = readJson(file);
  const keep = (k) => k[0] === 'STORY_TITLE' || ['title', 'teaser', 'line', 'narration'].includes(String(k.at(-1)));
  const list = collect({ STORY_TITLE, CHAPTERS }, keep);
  return run('Histoire', list, out, file, 'Story mode of the app (chapter titles, teasers, dialogue lines, narration).');
}

async function interfaceUI() {
  const fr = readJson(path.join(ROOT, 'src/i18n/fr.json'));
  const file = path.join(ROOT, 'src/i18n', `${lang}.json`);
  const out = readJson(file);
  const list = Object.keys(fr).map((k) => ({ keys: [k], fr: k }));
  const n = await run('Interface', list, out, file, 'App interface texts (buttons, menus, settings, messages, errors).');
  // Même ordre que fr.json (plus facile à relire).
  const sorted = {};
  for (const k of Object.keys(fr)) if (out[k]) sorted[k] = out[k];
  writeJson(file, sorted);
  return n;
}

const RUN = { personnages, bd, histoire, interface: interfaceUI };
console.log(`🌍 Traduction en ${langName} (${lang}) : ${parts.join(', ')}`);
try {
  for (const p of parts) {
    console.log(`\n▶ ${p}`);
    const n = await RUN[p]();
    console.log(n ? `✅ ${p} : ${n} textes traduits` : `✅ ${p} : rien à traduire (déjà fait)`);
  }
  console.log(`\nFini ! Vérifie l'appli (npm run dev), puis commit + push.`);
  if (lang !== 'en' && !fs.readFileSync(path.join(ROOT, 'src/i18n/index.js'), 'utf8').includes(`${lang}:`)) {
    console.log(`⚠️ Pense à ajouter la langue "${lang}" dans LANGS (src/i18n/index.js) pour qu'elle apparaisse dans l'appli.`);
  }
} catch (e) {
  console.log(`\n❌ ${e.message}`);
  process.exit(1);
}
