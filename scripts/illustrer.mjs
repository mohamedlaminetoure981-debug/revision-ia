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
//   npm run accepter  -- 3 5 2        (la proposition remplace l'image, l'ancienne est sauvegardée,
//                                      puis publication automatique ; --sans-publier pour ne pas envoyer)
//   npm run modeles-images            (modèles d'images ouverts à ta clé)
// MODE GRATUIT À LA MAIN (si ta clé n'ouvre aucun modèle d'images) :
//   npm run preparer -- 3 4 2 "consigne"   prompt copié + images à joindre dans un dossier numéroté
//   npm run importer -- 3 4 2              ramène l'image téléchargée dans _propositions/
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
import os from 'node:os';
import { execFile } from 'node:child_process';
import sharp from 'sharp';
import {
  ROOT, LOT_DIR, readEnv, retenirSecret, masquer, loadChapter, caseImage, isAppDrawn,
  propDir, saveDir, caseName, PERSONNAGES, IMG_EXT,
} from './illustration/config.mjs';
import { cleanAction, detectCharacters, detectDecor, characterRefs, decorRefs, styleRefs, decorPanelsElsewhere, buildGenerationPrompt, buildEditPrompt, resumeCase, decrireRef, rel } from './illustration/prompt.mjs';
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
  npm run accepter -- <chapitre> <page> <case> [fichier] [--sans-publier]   (puis publie tout seul sur GitHub)
  npm run modeles-images
Mode gratuit à la main (AI Studio) :
  npm run preparer -- <chapitre> <page> <case> ["consigne"] [--essai]
  npm run preparer -- <chapitre> --suivante      (prochaine tâche de docs/retouches/chapitre-N.json)
  npm run importer -- <chapitre> <page> <case> [--essai]
  npm run relancer -- <chapitre> <page> <case> ["consigne"]   (message de relance à coller dans la MÊME discussion)`;

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
  const tousPersos = t.personnages || detectCharacters(panel, t.consigne || '');
  const chars = tousPersos.filter((id) => {
    if (PERSONNAGES[id]) return true;
    avert.push(`personnage inconnu « ${id} » ignoré (connus : ${Object.keys(PERSONNAGES).join(', ')})`); return false;
  });
  if (chars.includes('kai-bande') && !chars.includes('kai')) chars.unshift('kai');
  const decor = t.decor || detectDecor(chapter, t.page - 1, t.case - 1);

  // Références, par priorité : case à retoucher, style, 1 par personnage, décor, puis les suivantes.
  const prio = []; const rest = [];
  if (t.type === 'retouche') prio.push({ kind: 'edit', file: target });
  const memeDecor = (p, c) => detectDecor(chapter, p - 1, c - 1) === decor;
  // RETOUCHE : on ne joint que la case + les fiches des personnages dont parle la consigne ; la case de style
  // et le décor seulement si la consigne en parle (trop d'images → Gemini renvoie l'image inchangée).
  const retouche = t.type === 'retouche';
  const parleStyle = retouche && /\b(style|dessin|trait|encrage|ink|line ?art|cel[- ]?shad)/i.test(t.consigne || '');
  const parleDecor = retouche && /\b(background|backdrop|setting|d[ée]cor|arri[èe]re-plan|fond|window|fen[êe]tre|shel(f|ves)|bookshel|rayonnage|[ée]tag[èe]re|wall|mur|floor|sol|ceiling|plafond|lamp|lampe|rain|pluie|clock|horloge|library|biblioth[èe]que|room|salle|street|rue)\b/i.test(t.consigne || '');
  let persosRetouche = chars;
  if (retouche) {
    const nomme = new Set(detectCharacters({ action: t.consigne || '' }, '').filter((id) => id !== 'kai-bande'));
    for (const id of (t.personnages || [])) nomme.add(id);
    const bandage = /band(é|e|age)/i.test(t.consigne || '') && chars.includes('kai');
    if (bandage) nomme.add('kai');
    persosRetouche = chars.filter((id) => nomme.has(id) || (id === 'kai-bande' && nomme.has('kai')));
    if (!persosRetouche.includes('kai-bande') && bandage && chars.includes('kai-bande')) persosRetouche.push('kai-bande');
  }
  const st = retouche && !parleStyle ? { files: [] } : styleRefs(n, t.page, t.case, retouche ? 1 : Math.max(1, Number(env.ILLUS_STYLE_REFS) || 1), memeDecor);
  if (st.warn) avert.push(st.warn);
  if (!retouche && !st.files.length) avert.push('aucune case illustrée trouvée pour la référence de STYLE : risque de photoréalisme');
  st.files.forEach((f) => prio.push({ kind: 'style', file: f }));
  for (const id of (retouche ? persosRetouche : chars)) {
    if (id === 'kai-bande') continue;
    let files = id === 'kai' && chars.includes('kai-bande') ? characterRefs('kai-bande') : [];
    if (!files.length) files = characterRefs(id);
    if (!files.length) {
      if (['kai', 'mory', 'nia', 'binta', 'sora', 'ren', 'awa', 'tidiane'].includes(id)) avert.push(`pas de référence pour ${PERSONNAGES[id].nom} : dépose references/personnages/${id === 'kai' && chars.includes('kai-bande') ? 'kai-bande' : id}.png`);
      continue;
    }
    const variante = id === 'kai' && chars.includes('kai-bande') && characterRefs('kai-bande').length ? 'kai-bande' : null;
    files.forEach((f, k) => (k ? rest : prio).push({ kind: 'character', charId: id, variante, file: f }));
  }
  let dr = retouche && !parleDecor ? [] : decorRefs(decor, n);
  // Pas de fichier dans references/decors/ et aucune case de ce décor dans le chapitre : une case
  // illustrée du même lieu dans un autre chapitre (ex. la corniche du chapitre 1).
  if (!dr.length && !retouche && !st.files.some((f) => { const m = path.basename(f).match(/^page-(\d+)-case-(\d+)\./); return m && memeDecor(+m[1], +m[2]); })) {
    dr = await decorPanelsElsewhere(decor, n, loadChapter);
  }
  if (decor && !dr.length && !retouche) avert.push(`pas de référence de décor « ${decor} » : tu peux déposer references/decors/${decor}.jpg`);
  dr.forEach((f, k) => (k ? rest : prio).push({ kind: 'decor', decor, file: f }));
  for (const f of t.references || []) {
    const abs = path.resolve(ROOT, f);
    if (fs.existsSync(abs)) rest.push({ kind: 'extra', file: abs }); else avert.push(`référence introuvable : ${f}`);
  }
  const refs = [...prio, ...rest].slice(0, MAX_REFS);
  if (prio.length + rest.length > MAX_REFS) avert.push(`${prio.length + rest.length - MAX_REFS} référence(s) en trop non jointe(s) (maximum ${MAX_REFS}, réglable : ILLUS_MAX_REFS)`);

  return { panel, target, chars, decor, refs, avert };
}

/** Texte de la scène, traduit en anglais (cache local) sauf en mode essai. */
async function scene(n, panel, service) {
  const fr = cleanAction(panel.action);
  if (ESSAI || !service || /^(non|no|0)$/i.test(env.ILLUS_TRADUIRE || '')) return { text: fr, lang: 'fr' };
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
/**
 * Légende de chaque image jointe PAR SON CONTENU (les images ne restent pas dans l'ordre dans
 * AI Studio) : résumé court et visuel de la case à retoucher / de chaque case de style.
 */
async function decrireRefs(n, chapter, t, prep, sc) {
  const resumeDe = async (file) => {
    const m = file.replace(/\\/g, '/').match(/chapitre-(\d+)\/page-(\d+)-case-(\d+)\./i);
    if (!m) return '';
    const [k, p, c] = [+m[1], +m[2], +m[3]];
    const ch = k === n ? chapter : await loadChapter(k).catch(() => null);
    const panel = ch?.pages?.[p - 1]?.panels?.[c - 1];
    if (!panel) return '';
    return resumeCase({ chars: detectCharacters(panel), decor: detectDecor(ch, p - 1, c - 1), texte: '' }); // sans la scène : il ne doit pas ressembler à la case à retoucher
  };
  for (const r of prep.refs) {
    if (r.kind === 'edit') r.resume = resumeCase({ chars: prep.chars.filter((x) => x !== 'kai-bande'), decor: prep.decor, texte: '' }); // sans « main bandée » : l'image à retoucher a justement ce défaut
    else if (r.kind === 'style') { r.resume = await resumeDe(r.file); r.pourRetouche = t.type === 'retouche'; }
    r.role = decrireRef(r);
  }
}

/** Tout ce qu'il faut pour une tâche : références, scène, prompt, images (identique en mode API et à la main). */
async function construire(n, chapter, t, service, { redimensionner = true } = {}) {
  const label = `page ${t.page} case ${t.case}`;
  const prep = await preparer(n, chapter, t);
  if (prep.ignore) return { ignore: prep.ignore, label };
  const sc = t.type === 'retouche' ? { text: '', lang: 'fr' } : await scene(n, prep.panel, service); // retouche : pas de description de scène (prompt court)
  await decrireRefs(n, chapter, t, prep, sc);
  const o = { scene: sc.text, sceneLang: sc.lang, chars: prep.chars, decor: prep.decor, refs: prep.refs, consigne: t.consigne || '' };
  const texte = t.type === 'retouche' ? buildEditPrompt(o) : buildGenerationPrompt(o);
  const images = redimensionner ? await Promise.all(prep.refs.map((r, i) => charger(r, t.type === 'retouche' && i === 0))) : [];
  return { prep, sc, texte, images, label };
}

function afficherTache(n, t, c) {
  const { prep, images, label } = c;
  console.log(`\n${t.type === 'retouche' ? '🖌️  Retouche' : '🎨 Génération'} — chapitre ${n}, ${label}${t.consigne ? ` : « ${t.consigne} »` : ''}`);
  console.log(`   Personnages : ${prep.chars.filter((x) => x !== 'kai-bande').map((x) => PERSONNAGES[x].nom + (x === 'kai' && prep.chars.includes('kai-bande') ? ' (main droite bandée)' : '')).join(', ') || 'aucun'} · décor : ${prep.decor || '—'}`);
  prep.refs.forEach((r, i) => console.log(`   Image jointe : ${rel(r.file)}${images[i] ? `  (${Math.round(images[i].data.length / 1024)} Ko envoyés)` : ''}`));
  prep.avert.forEach((a) => console.log(`   ⚠️ ${a}`));
}

async function executer(n, chapter, t, four) {
  const c = await construire(n, chapter, t, four.service);
  if (c.ignore) { console.log(`⏭️  ${c.label} : ${c.ignore}`); return 'ignore'; }
  const { prep, sc, texte, images } = c;
  afficherTache(n, t, c);

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
let lotCourant = false;
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
      console.log(`❌ Clé manquante. Crée le fichier .env.local à la racine du projet avec la ligne :\n   ${four.cle}=ta_clé\n   (ou essaie sans clé avec --essai, ou travaille gratuitement avec AI Studio : npm run preparer)`);
      process.exit(1);
    }
    retenirSecret(key);
  }
  const chapter = await loadChapter(n);
  const bilan = { fait: 0, ignore: 0, echec: 0, saute: 0, essai: 0 };
  let arrete = false; let refuses = null;
  for (const t of taches) {
    if (sauter && !ESSAI && !flags.has('--refaire') && dejaFait(n, t)) { bilan.saute++; continue; }
    try {
      const r = await executer(n, chapter, t, four);
      bilan[r]++;
      if (r === 'fait') { noter(n, t, 'fait'); comparer(n, false); }
    } catch (e) {
      if (e instanceof ArretQuota) {
        arrete = true;
        if (e.code === 'modeles-refuses') refuses = t;
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
  if (refuses) {
    const cmdP = lotCourant ? `npm run preparer -- ${n} --suivante` : `npm run preparer -- ${n} ${refuses.page} ${refuses.case}${refuses.consigne ? ` "${refuses.consigne.replace(/"/g, '\\"')}"` : ''}`;
    console.log(`\n💡 Aucun modèle d'images n'est ouvert à ta clé (en général : facturation requise). Tu peux continuer GRATUITEMENT avec AI Studio à la main :\n   1) ${cmdP}\n   2) colle le prompt dans AI Studio, joins les images du dossier, génère, télécharge l'image\n   3) npm run importer -- ${n} ${refuses.page} ${refuses.case}\n   Guide : docs/outil-illustration.md (mode gratuit à la main).`);
  }
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
  if (flags.has('--sans-publier')) {
    console.log(`Ensuite : npm run verifier-bulles -- ${n}  (les bulles de cette case sont peut-être à replacer), puis npm run publier.`);
    return;
  }
  // Publication automatique : git pull, commit, push (voir scripts/publier.mjs).
  const { publier } = await import('./publier.mjs');
  const quoi = meta.type === 'generation' ? 'illustration' : 'retouche';
  console.log('');
  try { await publier({ message: `Chapitre ${n} : ${quoi} page ${p} case ${c}` }); } catch { console.log('\n⚠️ L\'image est bien remplacée sur ton PC, mais pas envoyée. Corrige le point ci-dessus puis lance : npm run publier'); process.exit(1); }
  console.log(`Ensuite : npm run verifier-bulles -- ${n}  (les bulles de cette case sont peut-être à replacer ; bulles réglées : npm run bulles -- ${n}).`);
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
// MODE GRATUIT À LA MAIN (AI Studio) : preparer → (AI Studio) → importer
// ---------------------------------------------------------------------
const ORDRE_FR = (t) => (t.type === 'retouche'
  ? 'Joins D\'ABORD la case à retoucher SEULE (a-RETOUCHER-…), puis les autres images ENSEMBLE (style-…, perso-…, decor-…) : l\'ordre des autres n\'a pas d\'importance.'
  : 'Joins toutes les images du dossier (style-…, perso-…, decor-…) : l\'ordre n\'a pas d\'importance.');
const DOSSIER_PREP = path.join(os.tmpdir(), 'revision-ia-illustration');
const prepMetaFile = (n, p, c) => path.join(propDir(n), '_preparees', `${caseName(p, c)}.json`);

/** Court nom lisible pour une image jointe, d'après son rôle. */
function nomRef(r) {
  const base = path.basename(r.file).replace(/\.[^.]+$/, '');
  if (r.kind === 'edit') return `a-RETOUCHER-${base}`;
  if (r.kind === 'style') return `style-${base}`;
  if (r.kind === 'character') return `perso-${base}`;
  if (r.kind === 'decor') return `decor-${base}`;
  return `autre-${base}`;
}

/** Copie le texte dans le presse-papiers (Windows : Set-Clipboard). Renvoie true si c'est fait. */
function presserPapiers(fichier) {
  return new Promise((resolve) => {
    let cmd; let a;
    if (process.platform === 'win32') {
      cmd = 'powershell'; a = ['-NoProfile', '-Command', `Get-Content -Raw -Encoding UTF8 -LiteralPath '${fichier.replace(/'/g, "''")}' | Set-Clipboard`];
    } else if (process.platform === 'darwin') { cmd = 'sh'; a = ['-c', `pbcopy < "${fichier}"`]; } else { cmd = 'sh'; a = ['-c', `(command -v wl-copy >/dev/null && wl-copy < "${fichier}") || (command -v xclip >/dev/null && xclip -selection clipboard < "${fichier}")`]; }
    try { execFile(cmd, a, (err) => resolve(!err)); } catch { resolve(false); }
  });
}
function ouvrirDossier(dir) {
  const cmd = process.platform === 'win32' ? 'explorer' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  try { execFile(cmd, [dir], () => {}); } catch { /* pas d'explorateur */ }
}

/** Ligne de suivi d'un lot : ✅ fait · ⏳ à faire · ⏸️ mise de côté. */
function etatLot(n) {
  const f = path.join(LOT_DIR, `chapitre-${n}.json`);
  let all = [];
  try { all = (JSON.parse(fs.readFileSync(f, 'utf8')).taches || []); } catch { return null; }
  return all.map((t, i) => ({ i: i + 1, t, ignore: !!t.ignorer, type: /^(retouche|retoucher)$/i.test(t.type) ? 'retouche' : 'generation' }))
    .map((x) => ({ ...x, fait: !x.ignore && dejaFait(n, { ...x.t, type: x.type }) }));
}

async function preparerManuel(n, t) {
  const chapter = await loadChapter(n);
  // Traduction de la scène : seulement si une clé existe (les modèles TEXTE sont gratuits) ; sinon description en français.
  let service = null;
  const key = env.GEMINI_API_KEY;
  if (!ESSAI && key) { retenirSecret(key); try { service = choisirFournisseur(env).service; } catch { service = null; } }
  const c = await construire(n, chapter, t, service, { redimensionner: false });
  if (c.ignore) { console.log(`⏭️  ${c.label} : ${c.ignore}`); return 'ignore'; }
  const { prep, texte } = c;
  const dir = path.join(DOSSIER_PREP, `ch${n}-p${t.page}-c${t.case}`);
  const vus = new Set();
  const noms = prep.refs.map((r) => {
    let nom = `${nomRef(r)}${r.kind === 'edit' ? path.extname(r.file).toLowerCase() : '.jpg'}`;
    for (let k = 2; vus.has(nom); k++) nom = nom.replace(/(-\d+)?(\.\w+)$/, `-${k}$2`);
    vus.add(nom); return nom;
  });
  c.images = new Array(prep.refs.length).fill(null);
  afficherTache(n, t, c);
  console.log(`\n📋 MODE À LA MAIN (AI Studio, gratuit)${ESSAI ? ' — ESSAI : rien n\'est copié ni ouvert' : ''}`);
  console.log(`   Dossier des images à joindre : ${dir}`);
  prep.refs.forEach((r, i) => console.log(`   ${noms[i]}   ←  ${rel(r.file)}`));
  if (c.sc.lang === 'fr' && !ESSAI) console.log('   (description en français : pas de clé ou traduction impossible — AI Studio comprend le français, ça marche aussi)');
  if (ESSAI && c.sc.lang === 'fr') console.log('   (au vrai lancement, la description est traduite en anglais si une clé est disponible)');

  if (!ESSAI) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < prep.refs.length; i++) {
      const dest = path.join(dir, noms[i]);
      if (prep.refs[i].kind === 'edit') fs.copyFileSync(prep.refs[i].file, dest); // la case à retoucher : copie exacte
      else fs.writeFileSync(dest, (await charger(prep.refs[i], false)).data);
    }
    fs.writeFileSync(path.join(dir, 'prompt.txt'), texte);
    fs.writeFileSync(path.join(dir, 'LISEZ-MOI.txt'), `Chapitre ${n}, page ${t.page}, case ${t.case} (${t.type === 'retouche' ? 'retouche' : 'génération'})\n\n1. Colle le prompt (déjà dans le presse-papiers, sinon ouvre prompt.txt) dans AI Studio.\n2. ${ORDRE_FR(t)}\n3. Vérifie que le modèle « Image » est sélectionné, génère, télécharge l'ORIGINAL (pas une capture).\n4. Dans PowerShell : npm run importer -- ${n} ${t.page} ${t.case}\n\nLes images ne restent pas toujours dans l'ordre dans AI Studio : ce n'est pas grave, le prompt décrit chaque image par son contenu.\n`);
    writeJson(prepMetaFile(n, t.page, t.case), {
      type: t.type, consigne: t.consigne || '', date: new Date().toISOString(), prompt: texte,
      references: prep.refs.map((r) => ({ fichier: rel(r.file), role: r.role })),
    });
  } else {
    fs.mkdirSync(propDir(n), { recursive: true });
    fs.writeFileSync(path.join(propDir(n), `essai-${caseName(t.page, t.case)}.txt`), texte);
  }
  console.log(`\n----- PROMPT (à coller dans AI Studio) -----\n${texte}\n--------------------------------------------`);
  if (!ESSAI) {
    const ok = await presserPapiers(path.join(dir, 'prompt.txt'));
    console.log(ok ? '\n✅ Le prompt est dans le presse-papiers (Ctrl+V pour coller).' : `\n⚠️ Copie automatique impossible ici : ouvre ${path.join(dir, 'prompt.txt')} et copie-le.`);
    ouvrirDossier(dir);
  }
  console.log(`\nÀ FAIRE MAINTENANT :
  1. Colle le prompt dans AI Studio (aistudio.google.com).
  2. ${ORDRE_FR(t)}
     (dossier ${ESSAI ? 'qui s\'ouvrira' : 'qui vient de s\'ouvrir'} ; le prompt décrit chaque image par son contenu : si AI Studio les mélange, ce n'est pas grave)
  3. Vérifie que le modèle « Image » est sélectionné, clique sur Générer, puis télécharge l'original.
  4. Reviens ici : npm run importer -- ${n} ${t.page} ${t.case}`);
  return 'fait';
}

/**
 * Message de RELANCE (retouche) : à coller dans la MÊME discussion AI Studio quand Gemini a renvoyé
 * l'image inchangée. La consigne vient de (dans l'ordre) : la ligne de commande, la dernière préparation
 * de la case, le lot docs/retouches/chapitre-N.json.
 */
async function relancer(n, p, c, consigneDonnee) {
  let consigne = consigneDonnee;
  let source = 'ta consigne';
  if (!consigne) {
    const meta = readJson(prepMetaFile(n, p, c), {});
    if (meta.type === 'retouche' && meta.consigne) { consigne = meta.consigne; source = 'la dernière préparation de cette case'; }
  }
  if (!consigne) {
    const lot = etatLot(n);
    const x = lot && (lot.find((q) => q.type === 'retouche' && q.t.page === p && q.t.case === c && !q.ignore) || lot.find((q) => q.type === 'retouche' && q.t.page === p && q.t.case === c));
    if (x?.t.consigne) { consigne = x.t.consigne; source = `le lot docs/retouches/chapitre-${n}.json (tâche n°${x.i})`; }
  }
  if (!consigne) { console.log(`❌ Je ne trouve pas la consigne de la page ${p} case ${c}. Écris-la : npm run relancer -- ${n} ${p} ${c} "ta consigne"`); process.exit(1); }
  const message = `You returned an unchanged image. The edit was NOT applied. Apply it now: ${consigne.replace(/[.\s]+$/, '')}.`;
  console.log(`🔁 Message de relance (consigne prise dans ${source}) :\n\n${message}\n`);
  if (ESSAI) { console.log('🧪 ESSAI : rien n\'est copié.'); return; }
  const f = path.join(DOSSIER_PREP, 'relance.txt');
  fs.mkdirSync(DOSSIER_PREP, { recursive: true });
  fs.writeFileSync(f, message);
  console.log((await presserPapiers(f)) ? '✅ Copié dans le presse-papiers (Ctrl+V).' : `⚠️ Copie automatique impossible ici : copie le message ci-dessus (ou ouvre ${f}).`);
  console.log(`\nÀ FAIRE : colle-le dans la MÊME discussion AI Studio (sans nouvelle image, sans nouvelle discussion), laisse Gemini régénérer,\npuis télécharge l'original et lance : npm run importer -- ${n} ${p} ${c}\nSi ça ne marche toujours pas après 2 relances : nouvelle discussion + npm run preparer -- ${n} ${p} ${c} "consigne plus précise" (voir les positions DANS L'IMAGE).`);
}

/** Image la plus récente du dossier Téléchargements. */
function dernierTelechargement(minutes) {
  const dir = env.ILLUS_TELECHARGEMENTS || path.join(os.homedir(), 'Downloads');
  if (!fs.existsSync(dir)) throw new Error(`Dossier Téléchargements introuvable : ${dir}. Indique-le dans .env.local : ILLUS_TELECHARGEMENTS=C:\\chemin\\vers\\dossier`);
  const list = fs.readdirSync(dir).filter((f) => IMG_EXT.test(f))
    .map((f) => { const full = path.join(dir, f); const st = fs.statSync(full); return { f, full, t: st.mtimeMs, ok: st.isFile() && st.size > 20000 }; })
    .filter((x) => x.ok).sort((a, b) => b.t - a.t);
  const recent = list.filter((x) => Date.now() - x.t <= minutes * 60000);
  return { dir, list, recent };
}

async function importerManuel(n, p, c, fichier) {
  const minutes = Number((argv.find((a) => a.startsWith('--minutes=')) || '').split('=')[1]) || 30;
  let src;
  if (fichier) {
    const full = path.resolve(fichier);
    if (!fs.existsSync(full)) { console.log(`❌ Fichier introuvable : ${full}`); process.exit(1); }
    src = { f: path.basename(full), full, t: fs.statSync(full).mtimeMs };
  } else {
    const { dir, list, recent } = dernierTelechargement(minutes);
    if (!recent.length) {
      console.log(`❌ Aucune image de moins de ${minutes} minutes dans ${dir}.`);
      if (list[0]) console.log(`   La plus récente : ${list[0].f} (il y a ${Math.round((Date.now() - list[0].t) / 60000)} min). Pour la prendre : ajoute --minutes=${Math.ceil((Date.now() - list[0].t) / 60000) + 5}, ou donne son chemin en 4ᵉ argument.`);
      else console.log('   Aucune image trouvée : as-tu bien téléchargé l\'image depuis AI Studio (bouton de téléchargement, pas une capture) ?');
      process.exit(1);
    }
    src = recent[0];
    if (recent.length > 1) console.log(`   (${recent.length} images récentes : la plus récente est prise, ${recent[1].f} sera ignorée)`);
  }
  const buf = fs.readFileSync(src.full);
  const m = await sharp(buf).metadata();
  const ratio = m.width / m.height;
  console.log(`📥 Image prise : ${src.full}  (${m.width} × ${m.height}, il y a ${Math.max(0, Math.round((Date.now() - src.t) / 60000))} min)`);
  if (m.width < 1000) console.log('   ⚠️ Image petite (moins de 1000 px de large) : est-ce bien l\'original téléchargé, et pas une capture d\'écran ?');
  if (Math.abs(ratio - 16 / 9) > 0.05) console.log(`   ⚠️ Format ${ratio.toFixed(2)} au lieu de 1,78 (16:9) : l'image sera recadrée au centre.`);
  const meta = readJson(prepMetaFile(n, p, c), {});
  if (!meta.type) console.log('   (pas de préparation trouvée pour cette case : métadonnées minimales)');
  const dir = propDir(n);
  const nom = `${caseName(p, c)}--${stamp()}.png`;
  if (ESSAI) { console.log(`🧪 ESSAI : elle serait rangée dans ${rel(path.join(dir, nom))}. Rien n'est copié.`); return; }
  // Déjà importée ?
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter((x) => x.startsWith(`${caseName(p, c)}--`) && x.endsWith('.json'))) {
    const j = readJson(path.join(dir, f), {});
    if (j.source?.nom === src.f && j.source?.mtime === Math.round(src.t)) { console.log(`   ⚠️ Cette image a déjà été importée pour cette case (${f.replace('.json', '.png')}).`); }
  }
  const png = await seize9(buf);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, nom);
  fs.writeFileSync(file, png);
  writeJson(file.replace(/\.png$/, '.json'), {
    type: meta.type || 'generation', chapitre: n, page: p, case: c, consigne: meta.consigne || '', modele: 'AI Studio (à la main)', fournisseur: 'manuel',
    date: new Date().toISOString(), references: meta.references || [], note: '', prompt: meta.prompt || '', source: { nom: src.f, mtime: Math.round(src.t) },
  });
  // Tâche du lot correspondante : faite.
  const lot = etatLot(n);
  if (lot) { const x = lot.find((q) => !q.ignore && !q.fait && q.t.page === p && q.t.case === c); if (x) noter(n, { ...x.t, type: x.type }, 'fait', { importe: nom }); }
  comparer(n, false);
  console.log(`✅ Proposition rangée : ${rel(file)}  (ton fichier téléchargé n'est pas touché)`);
  console.log(`Ensuite :\n   npm run comparer -- ${n}          (voir avant / après)\n   npm run accepter -- ${n} ${p} ${c}      (la garder : l'ancienne image est sauvegardée)`);
  if (lot) { const reste = etatLot(n).filter((q) => !q.ignore && !q.fait).length; if (reste) console.log(`   Lot : ${reste} tâche(s) restante(s) → npm run preparer -- ${n} --suivante`); else console.log('   Lot : toutes les tâches sont faites 🎉'); }
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
    lotCourant = true;
    await lancer(n, lireLot(n), { sauter: true });
  } else if (cmd === 'preparer') {
    const n = num(args[0], 'Chapitre');
    if (flags.has('--suivante') || flags.has('--etat') || args.length === 1) {
      const lot = etatLot(n);
      if (!lot) { console.log(`❌ Pas de lot pour le chapitre ${n} : crée docs/retouches/chapitre-${n}.json (copie exemple.json), ou précise la page et la case : npm run preparer -- ${n} <page> <case> ["consigne"]`); process.exit(1); }
      const actifs = lot.filter((x) => !x.ignore);
      console.log(`Lot du chapitre ${n} : ${actifs.filter((x) => x.fait).length}/${actifs.length} faite(s)`);
      lot.forEach((x) => console.log(`   ${x.ignore ? '⏸️' : x.fait ? '✅' : '⏳'} n°${x.i} · ${x.type} · page ${x.t.page} case ${x.t.case}${x.t.consigne ? ` · « ${String(x.t.consigne).slice(0, 70)} »` : ''}`));
      if (flags.has('--etat')) process.exit(0);
      let fini = false;
      for (const x of lot) {
        if (x.ignore || (x.fait && !flags.has('--refaire'))) continue;
        const r = await preparerManuel(n, { ...x.t, type: x.type });
        if (r === 'ignore') { if (!ESSAI) noter(n, { ...x.t, type: x.type }, 'fait', { ignore: true }); continue; }
        console.log(`\n(tâche n°${x.i} du lot ; après l'import, relance « npm run preparer -- ${n} --suivante » pour la tâche d'après)`);
        fini = true; break;
      }
      if (!fini) console.log('\n✅ Toutes les tâches du lot sont faites (ou mises de côté).');
    } else {
      const [p, c] = [num(args[1], 'Page'), num(args[2], 'Case')];
      const consigne = args.slice(3).join(' ').trim();
      await preparerManuel(n, { type: consigne ? 'retouche' : 'generation', page: p, case: c, consigne });
    }
  } else if (cmd === 'relancer') {
    await relancer(num(args[0], 'Chapitre'), num(args[1], 'Page'), num(args[2], 'Case'), args.slice(3).join(' ').trim());
  } else if (cmd === 'importer') {
    await importerManuel(num(args[0], 'Chapitre'), num(args[1], 'Page'), num(args[2], 'Case'), args[3]);
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
