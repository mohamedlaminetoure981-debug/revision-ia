// =====================================================================
// scripts/bulles.mjs — RANGER ET PUBLIER LES BULLES RÉGLÉES (sur TON PC)
// ---------------------------------------------------------------------
//   npm run bulles -- 3                 prend le dernier bulles-chapitre-3*.json de Téléchargements
//   npm run bulles -- 3 "C:\chemin\bulles-chapitre-3.json"   un fichier précis
//   Options : --essai (montre sans rien faire) · --sans-publier · --minutes=N (âge maximal, défaut : aucun)
// L'éditeur de bulles (Panneau créateur → ✏️ Éditer les bulles → 💾 Enregistrer) télécharge
// bulles-chapitre-N.json ; le navigateur le renomme « bulles-chapitre-3 (1).json » s'il existe déjà.
// Ce script copie le plus récent dans public/story/chapitre-N/bulles-chapitre-N.json, puis lance
// « npm run publier » (git pull, commit, push).
// =====================================================================

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readEnv, dossierTelechargements, chapDir } from './illustration/config.mjs';

const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith('--'));
const args = argv.filter((a) => !a.startsWith('--'));
const ESSAI = flags.includes('--essai');
const n = Number(args[0]);
if (!Number.isInteger(n) || n < 1) {
  console.log('Utilisation : npm run bulles -- <chapitre>      (exemple : npm run bulles -- 3)\nOptions : --essai · --sans-publier');
  process.exit(1);
}
const env = readEnv();
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, '/');

// 1. Le fichier : celui donné, sinon le plus récent des Téléchargements
let src;
if (args[1]) {
  const full = path.resolve(args[1]);
  if (!fs.existsSync(full)) { console.log(`❌ Fichier introuvable : ${full}`); process.exit(1); }
  src = { f: path.basename(full), full, t: fs.statSync(full).mtimeMs };
} else {
  const dir = dossierTelechargements(env);
  if (!fs.existsSync(dir)) { console.log(`❌ Dossier Téléchargements introuvable : ${dir}\n   Indique-le dans .env.local : ILLUS_TELECHARGEMENTS=C:\\chemin\\vers\\dossier`); process.exit(1); }
  const re = new RegExp(`^bulles-chapitre-${n}([^0-9].*)?\\.json$`, 'i'); // « bulles-chapitre-3 (1).json » compris, pas « …-30.json »
  const list = fs.readdirSync(dir).filter((f) => re.test(f)).map((f) => ({ f, full: path.join(dir, f), t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t);
  const minutes = Number((flags.find((a) => a.startsWith('--minutes=')) || '').split('=')[1]) || 0;
  const ok = minutes ? list.filter((x) => Date.now() - x.t <= minutes * 60000) : list;
  if (!ok.length) {
    console.log(`❌ Aucun fichier bulles-chapitre-${n}*.json${minutes ? ` de moins de ${minutes} minutes` : ''} dans ${dir}.`);
    console.log('   Dans l’appli : Panneau créateur → ✏️ Éditer les bulles → 💾 Enregistrer (le fichier se télécharge), puis relance cette commande.');
    process.exit(1);
  }
  src = ok[0];
  if (ok.length > 1) console.log(`(${ok.length} fichiers trouvés : le plus récent est pris — ${ok[0].f} ; les autres sont ignorés)`);
}

// 2. Contrôle du contenu
let data;
try { data = JSON.parse(fs.readFileSync(src.full, 'utf8')); } catch (e) { console.log(`❌ ${src.f} n'est pas un JSON valide (${e.message}). Enregistre-le de nouveau depuis l'éditeur de bulles.`); process.exit(1); }
const cases = data && typeof data === 'object' ? data.cases : null;
if (!cases || typeof cases !== 'object') { console.log(`❌ ${src.f} ne ressemble pas à un fichier de bulles (il manque « cases »). Enregistre-le depuis l'éditeur de bulles.`); process.exit(1); }
const nb = Object.keys(cases).length;
const age = Math.max(0, Math.round((Date.now() - src.t) / 60000));
console.log(`📥 ${src.full}\n   ${nb} case(s) réglée(s), enregistré il y a ${age < 120 ? `${age} min` : `${Math.round(age / 60)} h`}.`);
if (age > 24 * 60) console.log('   ⚠️ Ce fichier date de plus d\'un jour : est-ce bien le dernier que tu as enregistré ?');

// 3. Copie (jamais d'écrasement silencieux d'un fichier identique)
const dest = path.join(chapDir(n), `bulles-chapitre-${n}.json`);
const texte = fs.readFileSync(src.full, 'utf8');
const identique = fs.existsSync(dest) && fs.readFileSync(dest, 'utf8') === texte;
if (ESSAI) { console.log(`🧪 ESSAI : ${identique ? 'déjà identique à' : 'serait copié dans'} ${rel(dest)}. Rien n'est fait.`); process.exit(0); }
if (identique) console.log(`ℹ️ ${rel(dest)} est déjà identique à ce fichier.`);
else {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, texte);
  console.log(`✅ Copié dans ${rel(dest)}  (ton fichier téléchargé n'est pas touché)`);
}

// 4. Publication
if (flags.includes('--sans-publier')) { console.log('Pour l\'envoyer : npm run publier'); process.exit(0); }
const { publier } = await import('./publier.mjs');
console.log('');
try {
  const r = await publier({ message: `Chapitre ${n} : réglage des bulles` });
  if (r.statut === 'rien') console.log('(les bulles étaient déjà publiées)');
} catch { console.log('\n⚠️ Le fichier est bien copié sur ton PC, mais pas envoyé. Corrige le point ci-dessus puis lance : npm run publier'); process.exit(1); }
