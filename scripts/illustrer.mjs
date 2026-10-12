// =====================================================================
// scripts/illustrer.mjs — OUTIL D'ILLUSTRATION DE LA BD (sur TON PC)
// ---------------------------------------------------------------------
// Génère ou retouche les illustrations du Mode Histoire en appelant directement une IA
// d'images (Gemini), sans allers-retours dans AI Studio. Guide : docs/outil-illustration.md
//
//   npm run retoucher -- 3 5 2 "Kaï a la main DROITE bandée, la gauche nue"
//   npm run generer   -- 3            (cases du chapitre 3 qui n'ont pas encore d'image)
//   npm run generer   -- 3 5          (toutes les cases de la page 5)
//   npm run generer   -- 3 5 2        (la case 2 de la page 5)
//   npm run illustrer-lot -- 3        (les tâches de docs/retouches/chapitre-3.json)
//   npm run comparer  -- 3            (page avant / après dans le navigateur)
//   npm run accepter  -- 3 5 2        (la proposition remplace l'image, l'ancienne est sauvegardée)
//   npm run modeles-images            (modèles d'images ouverts à ta clé)
// Options : --essai (montre ce qui serait envoyé, SANS appeler l'API ni avoir de clé),
//           --refaire (refait aussi les tâches déjà faites), --toutes (generer : aussi les cases
//           déjà illustrées), --forcer (ignore l'arrêt pour quota enregistré).
//
// SÉCURITÉ : la clé est lue dans .env.local (ou .env), jamais affichée ni écrite ailleurs.
// Aucune image existante n'est écrasée : les résultats vont dans
// public/story/chapitre-N/_propositions/ (ni publié, ni commité) ; seul « accepter »
// remplace une image, après l'avoir copiée dans _sauvegardes/.
// =====================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import sharp from 'sharp';
import {
  ROOT, LOT_DIR, readEnv, retenirSecret, masquer, loadChapter, caseImage, isAppDrawn,
  propDir, saveDir, caseName, PERSONNAGES,
} from './illustration/config.mjs';
import { cleanAction, detectCharacters, detectDecor, characterRefs, decorRefs, styleRefs, decorPanelsElsewhere, buildGenerationPrompt, buildEditPrompt, rel } from './illustration/prompt.mjs';
import { choisirFournisseur } from './illustration/fournisseurs/index.mjs';
import { ArretQuota, ErreurCase, quandFr } from './illustration/fournisseurs/erreurs.mjs';

// ---------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const args = argv.filter((a) => !a.startsWith('--'));
const cmd = args.shift();
const ESSAI = flags.has('--essai') || flags.has('--dry-run');
const env = readEnv();
const MAX_REFS = Math.max(2, Math.min(14, Number(env.ILLUS_MAX_REFS) || 6));
const ETAT = path.join(ROOT, '.illustration-etat.json'); // arrêt pour quota (dans .gitignore)

const USAGE = `Commandes (voir docs/outil-illustration.md) :
  npm run retoucher -- <chapitre> <page> <case> "<consigne>" [--essai]
  npm run generer -- <chapitre> [page] [case] [--essai] [--toutes]
  npm run illustrer-lot -- <chapitre> [--essai] [--refaire]
  npm run comparer -- <chapitre>
  npm run accepter -- <chapitre> <page> <case> [fichier]
  npm run modeles-images`;

const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 2)}\n`); };
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const num = (v, what) => { const n = Number(v); if (!Number.isInteger(n) || n < 1) { console.log(`❌ ${what} invalide : « ${v ?? ''} ».\n\n${USAGE}`); process.exit(1); } return n; };

// ---------------------------------------------------------------------
// Journal (reprise après un arrêt) : public/story/chapitre-N/_propositions/journal.json
// ---------------------------------------------------------------------
const journalFile = (n) => path.join(propDir(n), 'journal.json');
const tacheId = (t) => crypto.createHash('sha1').update(JSON.stringify([t.type, t.page, t.case, t.consigne || '', t.personnages || null, t.decor || null])).digest('hex').slice(0, 12);
function noter(n, t, statut, extra = {}) {
  const j = readJson(journalFile(n), { taches: {} });
  j.taches[tacheId(t)] = { type: t.type, page: t.page, case: t.case, consigne: t.consigne || '', statut, date: new Date().toISOString(), ...extra };
  writeJson(journalFile(n), j);
}
const dejaFait = (n, t) => readJson(journalFile(n), { taches: {} }).taches[tacheId(t)]?.statut === 'fait';

// ---------------------------------------------------------------------
// Préparation d'une tâche : case, personnages, décor, références, prompt
// ---------------------------------------------------------------------
async function preparer(n, chapter, t) {
  const page = chapter.pages[t.page - 1];
  const panel = page?.panels?.[t.case - 1];
  if (!panel) throw new ErreurCase(`la case ${t.case} de la page ${t.page} n'existe pas dans le chapitre ${n}`);
  if (t.type === 'generation' && isAppDrawn(panel)) return { ignore: 'case dessinée par l’appli ([ÉCRAN APPLI] / [DESSIN APPLI]) : jamais d’illustration' };
  const target = caseImage(n, t.page, t.case);
  if (t.type === 'retouche' && !target) throw new ErreurCase(`pas encore d'image pour la page ${t.page} case ${t.case} : utilise « npm run generer -- ${n} ${t.page} ${t.case} »`);

  const avert = [];
  const chars = (t.personnages || detectCharacters(panel, t.consigne || '')).filter((id) => {
    if (PERSONNAGES[id]) return true;
    avert.push(`personnage inconnu « ${id} » ignoré (connus : ${Object.keys(PERSONNAGES).join(', ')})`); return false;
  });
  if (chars.includes('kai-bande') && !chars.includes('kai')) chars.unshift('kai');
  const decor = t.decor || detectDecor(chapter, t.page - 1, t.case - 1);

  // Références, par priorité : case à retoucher, style, 1 par personnage, décor, puis les suivantes.
  const prio = []; const rest = [];
  if (t.type === 'retouche') prio.push({ role: 'the existing panel to EDIT (keep everything not mentioned in the change).', file: target });
  const memeDecor = (p, c) => detectDecor(chapter, p - 1, c - 1) === decor;
  const st = styleRefs(n, t.page, t.case, t.type === 'retouche' ? 1 : Math.max(1, Number(env.ILLUS_STYLE_REFS) || 1), memeDecor);
  if (st.warn) avert.push(st.warn);
  if (!st.files.length) avert.push('aucune case illustrée trouvée pour la référence de STYLE : risque de photoréalisme');
  st.files.forEach((f) => prio.push({ role: 'STYLE reference: an already validated panel of this comic. Copy its drawing style, line weight, shading and colors only — not its content, characters or composition.', file: f }));
  for (const id of chars) {
    if (id === 'kai-bande') continue;
    let files = id === 'kai' && chars.includes('kai-bande') ? characterRefs('kai-bande') : [];
    if (!files.length) files = characterRefs(id);
    if (!files.length) {
      if (['kai', 'mory', 'nia', 'binta', 'sora', 'ren', 'awa', 'tidiane'].includes(id)) avert.push(`pas de référence pour ${PERSONNAGES[id].nom} : dépose references/personnages/${id === 'kai' && chars.includes('kai-bande') ? 'kai-bande' : id}.png`);
      continue;
    }
    files.forEach((f, k) => (k ? rest : prio).push({ role: `CHARACTER reference for ${PERSONNAGES[id].nom}: same face, hair and clothes. Ignore its background, pose and framing.`, file: f }));
  }
  let dr = decorRefs(decor, n);
  // Pas de fichier dans references/decors/ et aucune case de ce décor dans le chapitre : une case
  // illustrée du même lieu dans un autre chapitre (ex. la corniche du chapitre 1).
  if (!dr.length && t.type === 'generation' && !st.files.some((f) => { const m = path.basename(f).match(/^page-(\d+)-case-(\d+)\./); return m && memeDecor(+m[1], +m[2]); })) {
    dr = await decorPanelsElsewhere(decor, n, loadChapter);
  }
  if (decor && !dr.length && t.type === 'generation') avert.push(`pas de référence de décor « ${decor} » : tu peux déposer references/decors/${decor}.jpg`);
  dr.forEach((f, k) => (k ? rest : prio).push({ role: 'SETTING reference: layout and objects of the place only. Draw it in the manga style of the STYLE reference.', file: f }));
  for (const f of t.references || []) {
    const abs = path.resolve(ROOT, f);
    if (fs.existsSync(abs)) rest.push({ role: 'extra reference given by the author.', file: abs }); else avert.push(`référence introuvable : ${f}`);
  }
  const refs = [...prio, ...rest].slice(0, MAX_REFS);
  if (prio.length + rest.length > MAX_REFS) avert.push(`${prio.length + rest.length - MAX_REFS} référence(s) en trop non jointe(s) (maximum ${MAX_REFS}, réglable : ILLUS_MAX_REFS)`);

  return { panel, target, chars, decor, refs, avert };
}

/** Texte de la scène, traduit en anglais (cache local) sauf en mode essai. */
async function scene(n, panel, service) {
  const fr = cleanAction(panel.action);
  if (ESSAI || /^(non|no|0)$/i.test(env.ILLUS_TRADUIRE || '')) return { text: fr, lang: 'fr' };
  const cacheFile = path.join(propDir(n), 'traductions.json');
  const cache = readJson(cacheFile, {});
  const k = crypto.createHash('sha1').update(fr).digest('hex').slice(0, 16);
  if (!cache[k]) {
    try { cache[k] = await service.traduire(fr); writeJson(cacheFile, cache); } catch (e) {
      if (e instanceof ArretQuota) throw e;
      console.log(`   ⚠️ traduction impossible (${masquer(e.message).slice(0, 120)}) : description envoyée en français`);
      return { text: fr, lang: 'fr' };
    }
  }
  return { text: cache[k], lang: 'en' };
}

/** Image jointe : réduite (connexion lente), en JPEG. La case à retoucher garde sa taille. */
async function charger(ref, edit) {
  const max = edit ? 1600 : 1024;
  const data = await sharp(ref.file).rotate().resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: edit ? 92 : 85 }).toBuffer();
  return { mime: 'image/jpeg', data, nom: rel(ref.file) };
}

/** Recadre au format 16:9 (centre) si l'image n'y est pas. */
async function seize9(buf) {
  const m = await sharp(buf).metadata();
  const r = m.width / m.height;
  if (Math.abs(r - 16 / 9) < 0.01) return sharp(buf).png().toBuffer();
  const w = r > 16 / 9 ? Math.round(m.height * 16 / 9) : m.width;
  const h = r > 16 / 9 ? m.height : Math.round(m.width * 9 / 16);
  return sharp(buf).extract({ left: Math.round((m.width - w) / 2), top: Math.round((m.height - h) / 2), width: w, height: h }).png().toBuffer();
}

// ---------------------------------------------------------------------
// Exécution d'une tâche
// ---------------------------------------------------------------------
async function executer(n, chapter, t, four) {
  const label = `page ${t.page} case ${t.case}`;
  const prep = await preparer(n, chapter, t);
  if (prep.ignore) { console.log(`⏭️  ${label} : ${prep.ignore}`); return 'ignore'; }
  const sc = await scene(n, prep.panel, four.service);
  const o = { scene: sc.text, sceneLang: sc.lang, chars: prep.chars, decor: prep.decor, refs: prep.refs, consigne: t.consigne || '' };
  const texte = t.type === 'retouche' ? buildEditPrompt(o) : buildGenerationPrompt(o);
  const images = await Promise.all(prep.refs.map((r, i) => charger(r, t.type === 'retouche' && i === 0)));

  console.log(`\n${t.type === 'retouche' ? '🖌️  Retouche' : '🎨 Génération'} — chapitre ${n}, ${label}${t.consigne ? ` : « ${t.consigne} »` : ''}`);
  console.log(`   Personnages : ${prep.chars.filter((x) => x !== 'kai-bande').map((x) => PERSONNAGES[x].nom + (x === 'kai' && prep.chars.includes('kai-bande') ? ' (main droite bandée)' : '')).join(', ') || 'aucun'} · décor : ${prep.decor || '—'}`);
  prep.refs.forEach((r, i) => console.log(`   Image ${i + 1} : ${rel(r.file)}  (${Math.round(images[i].data.length / 1024)} Ko envoyés)`));
  prep.avert.forEach((a) => console.log(`   ⚠️ ${a}`));

  if (ESSAI) {
    const base = path.join(propDir(n), `essai-${caseName(t.page, t.case)}`);
    writeJson(`${base}.json`, { fournisseur: four.nom, modeles: four.service.modeles, requete: four.service.requete({ texte, images, format: '16:9' }, true) });
    fs.writeFileSync(`${base}.txt`, texte);
    console.log(`   🧪 MODE ESSAI : rien n'est envoyé. Modèle(s) prévu(s) : ${four.service.modeles.join(' → ')}`);
    console.log(`   Prompt complet : ${rel(base)}.txt · requête (images résumées) : ${rel(base)}.json`);
    if (sc.lang === 'fr') console.log('   (au vrai lancement, la description est d\'abord traduite en anglais)');
    console.log(`\n----- PROMPT -----\n${texte}\n------------------`);
    return 'essai';
  }

  const out = await four.service.generer({ texte, images, format: '16:9' });
  const png = await seize9(out.image);
  const file = path.join(propDir(n), `${caseName(t.page, t.case)}--${stamp()}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  writeJson(file.replace(/\.png$/, '.json'), {
    type: t.type, chapitre: n, page: t.page, case: t.case, consigne: t.consigne || '', modele: out.modele, fournisseur: four.nom,
    date: new Date().toISOString(), references: prep.refs.map((r) => ({ fichier: rel(r.file), role: r.role })), note: out.note || '', prompt: texte,
  });
  console.log(`   ✅ Proposition : ${rel(file)} (modèle ${out.modele})`);
  return 'fait';
}

/** Lance une liste de tâches ; s'arrête proprement au quota, reprend au prochain lancement. */
async function lancer(n, taches, { sauter = false } = {}) {
  const etat = readJson(ETAT, {});
  if (!ESSAI && etat.reprise && new Date(etat.reprise) > new Date() && !flags.has('--forcer')) {
    console.log(`⏸️  Arrêt précédent (${etat.raison}). Réessaie après ${quandFr(new Date(etat.reprise))}.\n   (ou ajoute --forcer pour essayer quand même)`);
    return;
  }
  let four;
  try { four = choisirFournisseur(env); } catch (e) { console.log(`❌ ${e.message}`); process.exit(1); }
  if (!ESSAI) {
    const key = env[four.cle];
    if (!key) {
      console.log(`❌ Clé manquante. Crée le fichier .env.local à la racine du projet avec la ligne :\n   ${four.cle}=ta_clé\n   (ou essaie sans clé avec --essai)`);
      process.exit(1);
    }
    retenirSecret(key);
  }
  const chapter = await loadChapter(n);
  const bilan = { fait: 0, ignore: 0, echec: 0, saute: 0, essai: 0 };
  let arrete = false;
  for (const t of taches) {
    if (sauter && !ESSAI && !flags.has('--refaire') && dejaFait(n, t)) { bilan.saute++; continue; }
    try {
      const r = await executer(n, chapter, t, four);
      bilan[r]++;
      if (r === 'fait') { noter(n, t, 'fait'); comparer(n, false); }
    } catch (e) {
      if (e instanceof ArretQuota) {
        arrete = true;
        writeJson(ETAT, { raison: e.message, reprise: e.reprise ? e.reprise.toISOString() : null, date: new Date().toISOString() });
        console.log(`\n⏸️  Arrêt propre : ${masquer(e.message)}.`);
        console.log(e.reprise ? `   Réessaie après ${quandFr(e.reprise)} : relance la même commande, elle reprendra là où elle s'est arrêtée.` : '   Relance la même commande plus tard : elle reprendra là où elle s\'est arrêtée.');
        break;
      }
      if (e instanceof ErreurCase) { bilan.echec++; noter(n, t, 'echec', { erreur: masquer(e.message) }); console.log(`   ❌ page ${t.page} case ${t.case} : ${masquer(e.message)}`); continue; }
      console.log(`\n❌ ${masquer(e.message)}`); process.exit(1);
    }
  }
  if (!ESSAI && !arrete && bilan.fait) { try { fs.rmSync(ETAT, { force: true }); } catch { /* ignoré */ } } // l'API répond de nouveau
  const parts = [bilan.fait && `${bilan.fait} proposition(s)`, bilan.essai && `${bilan.essai} essai(s)`, bilan.saute && `${bilan.saute} déjà faite(s)`, bilan.ignore && `${bilan.ignore} case(s) de l'appli ignorée(s)`, bilan.echec && `${bilan.echec} échec(s)`].filter(Boolean);
  console.log(`\nBilan : ${parts.join(' · ') || 'rien à faire'}.`);
  if (bilan.fait) console.log(`Compare : npm run comparer -- ${n}   puis   npm run accepter -- ${n} <page> <case>`);
}

// ---------------------------------------------------------------------
// Page de comparaison avant / après (HTML local)
// ---------------------------------------------------------------------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function comparer(n, ouvrir = true) {
  const dir = propDir(n);
  if (!fs.existsSync(dir)) { if (ouvrir) console.log(`Aucune proposition pour le chapitre ${n}.`); return null; }
  const props = fs.readdirSync(dir).map((f) => f.match(/^page-(\d+)-case-(\d+)--(.+)\.png$/) && { f, p: +RegExp.$1, c: +RegExp.$2, s: RegExp.$3 })
    .filter(Boolean).sort((a, b) => a.p - b.p || a.c - b.c || b.s.localeCompare(a.s));
  const groups = new Map();
  for (const x of props) { const k = `${x.p}-${x.c}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); }
  let body = '';
  for (const [, list] of groups) {
    const { p, c } = list[0];
    const avant = caseImage(n, p, c);
    body += `<section><h2>Page ${p} · case ${c}</h2><div class="row"><figure><img src="${avant ? `../${esc(path.basename(avant))}` : ''}" alt="avant"><figcaption>AVANT ${avant ? '' : '(pas encore d’image)'}</figcaption></figure>`;
    list.forEach((x, i) => {
      const meta = readJson(path.join(dir, x.f.replace(/\.png$/, '.json')), {});
      const cmdAcc = `npm run accepter -- ${n} ${p} ${c}${i ? ` ${x.f}` : ''}`;
      body += `<figure><img src="${esc(x.f)}" alt="proposition"><figcaption>${i ? 'Proposition plus ancienne' : 'APRÈS (la plus récente)'} · ${esc(meta.type || '')} · ${esc(meta.modele || '')}<br>${meta.consigne ? `« ${esc(meta.consigne)} »<br>` : ''}<code>${esc(cmdAcc)}</code><details><summary>Prompt et références</summary><pre>${esc((meta.references || []).map((r) => `- ${r.fichier}`).join('\n'))}\n\n${esc(meta.prompt || '')}</pre></details></figcaption></figure>`;
    });
    body += '</div></section>';
  }
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chapitre ${n} — propositions</title>
<style>body{font:15px system-ui,sans-serif;background:#14101c;color:#eee;margin:0;padding:16px}h1{font-size:20px}section{border-top:1px solid #444;padding:12px 0}
.row{display:flex;gap:12px;overflow-x:auto}figure{margin:0;flex:0 0 min(46vw,640px)}img{width:100%;aspect-ratio:16/9;object-fit:contain;background:#000;border-radius:6px}
figcaption{font-size:13px;color:#bbb;margin-top:4px}code{background:#2a2335;padding:2px 6px;border-radius:4px;user-select:all;color:#c4b5fd}pre{white-space:pre-wrap;font-size:12px;max-height:300px;overflow:auto;background:#0c0a12;padding:8px}</style>
<h1>Chapitre ${n} — avant / après</h1><p>Pour garder une proposition, copie la commande sous l'image dans PowerShell. L'ancienne image est sauvegardée dans <code>_sauvegardes</code>.</p>${body || '<p>Aucune proposition.</p>'}</html>`;
  const out = path.join(dir, 'comparer.html');
  fs.writeFileSync(out, html);
  if (ouvrir) {
    console.log(`Page de comparaison : ${rel(out)}`);
    if (process.platform === 'win32') execFile('cmd', ['/c', 'start', '', out], () => {});
  }
  return out;
}

// ---------------------------------------------------------------------
// Accepter une proposition
// ---------------------------------------------------------------------
async function accepter(n, p, c, fichier) {
  const dir = propDir(n);
  const re = new RegExp(`^${caseName(p, c)}--.+\\.png$`);
  const list = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => re.test(f)).sort() : [];
  const choix = fichier ? path.basename(fichier) : list.at(-1);
  if (!choix || !list.includes(choix)) { console.log(`❌ Aucune proposition ${fichier ? `« ${fichier} » ` : ''}pour la page ${p} case ${c} du chapitre ${n}.`); process.exit(1); }
  const chDir = path.dirname(dir);
  const olds = fs.readdirSync(chDir).filter((f) => new RegExp(`^${caseName(p, c)}\\.(webp|png|jpe?g)$`, 'i').test(f));
  const s = stamp();
  for (const f of olds) {
    fs.mkdirSync(saveDir(n), { recursive: true });
    const dest = path.join(saveDir(n), `${f.replace(/(\.\w+)$/, `--${s}$1`)}`);
    fs.copyFileSync(path.join(chDir, f), dest);
    fs.rmSync(path.join(chDir, f));
    console.log(`   💾 ancienne image sauvegardée : ${rel(dest)}`);
  }
  const png = await seize9(fs.readFileSync(path.join(dir, choix)));
  const dest = path.join(chDir, `${caseName(p, c)}.png`);
  fs.writeFileSync(dest, png);
  const meta = readJson(path.join(dir, choix.replace(/\.png$/, '.json')), {});
  if (meta.type) noter(n, { type: meta.type, page: p, case: c, consigne: meta.consigne }, 'fait', { accepte: choix });
  const m = await sharp(png).metadata();
  console.log(`✅ ${rel(dest)} remplacée par ${choix} (${m.width} × ${m.height}, 16:9).`);
  console.log(`Ensuite : npm run verifier-bulles -- ${n}  (les bulles de cette case sont peut-être à replacer), puis commit + push.`);
}

// ---------------------------------------------------------------------
// Lot : docs/retouches/chapitre-N.json
// ---------------------------------------------------------------------
function lireLot(n) {
  const f = path.join(LOT_DIR, `chapitre-${n}.json`);
  if (!fs.existsSync(f)) { console.log(`❌ Fichier ${rel(f)} introuvable. Copie docs/retouches/exemple.json et adapte-le.`); process.exit(1); }
  let j;
  try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.log(`❌ ${rel(f)} n'est pas un JSON valide : ${e.message}`); process.exit(1); }
  const list = (j.taches || []).filter((t) => !t.ignorer).map((t, i) => {
    const type = /^(retouche|retoucher)$/i.test(t.type) ? 'retouche' : /^(generation|génération|generer|générer)$/i.test(t.type) ? 'generation' : null;
    if (!type || !Number.isInteger(t.page) || !Number.isInteger(t.case)) { console.log(`❌ Tâche n° ${i + 1} invalide : il faut "type" (retouche ou generation), "page" et "case".`); process.exit(1); }
    if (type === 'retouche' && !t.consigne) { console.log(`❌ Tâche n° ${i + 1} : une retouche a besoin d'une "consigne".`); process.exit(1); }
    return { ...t, type };
  });
  return list;
}

// ---------------------------------------------------------------------
// Commandes
// ---------------------------------------------------------------------
try {
  if (cmd === 'retoucher') {
    const [n, p, c] = [num(args[0], 'Chapitre'), num(args[1], 'Page'), num(args[2], 'Case')];
    const consigne = args.slice(3).join(' ').trim();
    if (!consigne) { console.log(`❌ Il manque la consigne entre guillemets.\n\n${USAGE}`); process.exit(1); }
    await lancer(n, [{ type: 'retouche', page: p, case: c, consigne }]);
  } else if (cmd === 'generer') {
    const n = num(args[0], 'Chapitre');
    const chapter = await loadChapter(n);
    const taches = [];
    const pages = args[1] ? [num(args[1], 'Page')] : chapter.pages.map((_, i) => i + 1);
    for (const p of pages) {
      const panels = chapter.pages[p - 1]?.panels;
      if (!panels) { console.log(`❌ La page ${p} n'existe pas dans le chapitre ${n}.`); process.exit(1); }
      const cases = args[2] ? [num(args[2], 'Case')] : panels.map((_, i) => i + 1);
      for (const c of cases) {
        if (!args[2] && isAppDrawn(panels[c - 1])) continue;
        if (!args[1] && !flags.has('--toutes') && caseImage(n, p, c)) continue; // chapitre entier : seulement les cases sans image
        taches.push({ type: 'generation', page: p, case: c });
      }
    }
    if (!taches.length) console.log(`Rien à générer (toutes les cases ont déjà une image : ajoute --toutes, ou précise la page et la case).`);
    else await lancer(n, taches, { sauter: taches.length > 1 });
  } else if (cmd === 'lot') {
    const n = num(args[0], 'Chapitre');
    await lancer(n, lireLot(n), { sauter: true });
  } else if (cmd === 'comparer') {
    comparer(num(args[0], 'Chapitre'));
  } else if (cmd === 'accepter') {
    await accepter(num(args[0], 'Chapitre'), num(args[1], 'Page'), num(args[2], 'Case'), args[3]);
  } else if (cmd === 'modeles') {
    const four = choisirFournisseur(env);
    const key = env[four.cle];
    if (!key) { console.log(`❌ Clé manquante : ajoute ${four.cle}=ta_clé dans .env.local`); process.exit(1); }
    retenirSecret(key);
    const list = await four.service.listerModeles();
    console.log(list.length ? `Modèles d'images ouverts à ta clé :\n${list.map((m) => `  - ${m.nom}  ${m.description}`).join('\n')}\nPour en choisir un : GEMINI_IMAGE_MODEL=<nom> dans .env.local` : 'Aucun modèle d’images trouvé pour ta clé.');
    console.log(`Chaîne utilisée par défaut : ${four.service.modeles.join(' → ')}`);
  } else {
    console.log(USAGE);
  }
} catch (e) {
  console.log(`❌ ${masquer(e.message)}`);
  process.exit(1);
}
