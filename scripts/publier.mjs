// =====================================================================
// scripts/publier.mjs — ENVOYER LES CHANGEMENTS SUR GITHUB EN UNE COMMANDE (sur TON PC)
// ---------------------------------------------------------------------
//   npm run publier                         message automatique (en français)
//   npm run publier -- "Chapitre 3 : bulles"  ton propre message
//   npm run publier -- --essai              montre ce qui serait envoyé, sans rien faire
//
// Ce que ça fait, dans l'ordre :
//   1. git pull (récupère ce qui a été fait ailleurs : cloud, autre PC) ;
//   2. git add des fichiers modifiés du projet — JAMAIS .env, .env.local, _propositions,
//      _sauvegardes, node_modules (ni une clé API : si une clé est détectée, tout s'arrête) ;
//   3. git commit (message automatique si tu n'en donnes pas) ;
//   4. git push sur la branche main (GitHub Actions publie ensuite le site tout seul).
// Rien n'est jamais forcé : en cas de conflit, l'outil s'arrête, remet ton dossier comme avant
// et t'explique quoi faire. Aussi utilisé par « npm run accepter » et « npm run bulles ».
// =====================================================================

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRANCHE = 'main';

/** Fichiers à ne JAMAIS envoyer (chemins relatifs, avec « / »). */
const INTERDITS = [
  /(^|\/)\.env(\..*)?$/i, // .env, .env.local, .env.production…
  /(^|\/)_propositions(\/|$)/, /(^|\/)_sauvegardes(\/|$)/,
  /(^|\/)node_modules(\/|$)/, /(^|\/)dist(\/|$)/,
  /(^|\/)\.claude(\/|$)/, /(^|\/)\.illustration-etat\.json$/,
  /\.log$/i, /(^|\/)revision-ia-sauvegarde-.*\.json$/i,
];
export const estInterdit = (f) => INTERDITS.some((re) => re.test(f.replace(/\\/g, '/')));

/** Erreur « expliquée simplement » : on affiche message + conseil, sans trace technique. */
class Explique extends Error {
  constructor(titre, conseils = []) { super(titre); this.conseils = conseils; }
}

function git(args, { ok = false, input } = {}) {
  try {
    return { code: 0, out: execFileSync('git', ['-c', 'core.quotepath=false', ...args], { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], input, windowsHide: true, maxBuffer: 64 * 1024 * 1024 }).toString() };
  } catch (e) {
    if (e.code === 'ENOENT') throw new Explique('Git n’est pas installé (ou pas trouvé) sur cet ordinateur.', ['Installe Git pour Windows (git-scm.com), puis rouvre PowerShell.']);
    const r = { code: e.status ?? 1, out: `${e.stdout || ''}${e.stderr || ''}` };
    if (ok) return r;
    const err = new Error(r.out.trim() || `git ${args[0]} a échoué`);
    err.git = r; throw err;
  }
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/** Traduit une erreur git courante en explication simple. */
function expliquerGit(texte) {
  const t = String(texte);
  if (/Could not resolve host|unable to access|Failed to connect|Connection (timed out|refused|reset)|Operation timed out|network is unreachable|early EOF|RPC failed|SSL/i.test(t)) {
    return new Explique('Pas de connexion à GitHub (internet coupé ou trop lent).', ['Vérifie ta connexion, puis relance la même commande : rien n’est perdu.']);
  }
  if (/Authentication failed|could not read Username|Permission denied|403|401|Invalid username or password|not authorized/i.test(t)) {
    return new Explique('GitHub refuse la connexion (identifiants absents ou expirés).', ['Ouvre GitHub Desktop ou lance « git push » une fois à la main pour te reconnecter, puis relance la commande.']);
  }
  if (/non-fast-forward|fetch first|rejected.*(behind|stale)|Updates were rejected/i.test(t)) {
    return new Explique('GitHub a reçu des changements pendant ce temps (ailleurs que sur ce PC).', ['Relance simplement « npm run publier » : il va d’abord récupérer ces changements.']);
  }
  if (/protected branch|GH006|GH013|repository rule/i.test(t)) {
    return new Explique('GitHub refuse l’envoi direct sur main (branche protégée).', ['Dis-le-moi dans Claude Code : il faudra changer la règle de la branche sur GitHub.']);
  }
  if (/file is [0-9.]+ MB; this exceeds|large files detected|GH001/i.test(t)) {
    return new Explique('Un fichier est trop gros pour GitHub (plus de 100 Mo).', ['Retire ce fichier du dossier du projet (ou réduis-le), puis relance.', t.split('\n').find((l) => /remote:.*(file|File)/.test(l))?.replace(/^remote:\s*/, '') || '']);
  }
  if (/Please tell me who you are|unable to auto-detect email|user\.email|user\.name/i.test(t)) {
    return new Explique('Git ne connaît pas ton nom / ton e-mail (nécessaire pour enregistrer).', ['Tape une seule fois :', '  git config --global user.name "Ton Nom"', '  git config --global user.email "ton@email.com"', 'puis relance la commande.']);
  }
  return null;
}

/** Fichiers modifiés / nouveaux / supprimés (statut git), et fichiers en conflit. */
function etat() {
  const out = git(['status', '--porcelain=v1', '-z', '--untracked-files=all']).out;
  const items = [];
  const parts = out.split('\0').filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    const code = parts[i].slice(0, 2); const f = parts[i].slice(3);
    if (/^R|^C/.test(code)) i++; // renommage : l'ancien nom suit
    items.push({ code, f });
  }
  return items;
}
const enConflit = (it) => /^(DD|AU|UD|UA|DU|AA|UU)$/.test(it.code);

/** Message automatique clair, en français, d'après les fichiers envoyés. */
export function messageAuto(fichiers) {
  const parts = []; const vus = new Set();
  const ajoute = (t) => { if (!vus.has(t)) { vus.add(t); parts.push(t); } };
  const cases = {}; const bulles = new Set(); const textes = new Set();
  let docs = 0; let i18n = 0; let code = 0; let outils = 0; let persos = 0; let readme = 0; let autres = 0;
  for (const f0 of fichiers) {
    const f = f0.replace(/\\/g, '/');
    let m;
    if ((m = f.match(/^public\/story\/chapitre-(\d+)\/bulles-chapitre-\d+\.json$/))) bulles.add(+m[1]);
    else if ((m = f.match(/^public\/story\/chapitre-(\d+)\/page-(\d+)-case-(\d+)\./))) (cases[+m[1]] ||= []).push(`page ${m[2]} case ${m[3]}`);
    else if ((m = f.match(/^src\/data\/comic\/chapitres\/ch(\d+)\.js$/))) textes.add(+m[1]);
    else if (f === 'README.md' || f === 'CLAUDE.md') readme++;
    else if (f.startsWith('docs/') || f.startsWith('references/')) docs++;
    else if (f.startsWith('src/i18n/')) i18n++;
    else if (f.startsWith('public/characters/')) persos++;
    else if (f.startsWith('scripts/') || f === 'package.json' || f === 'package-lock.json') outils++;
    else if (f.startsWith('src/')) code++;
    else autres++;
  }
  for (const [n, l] of Object.entries(cases)) ajoute(`Chapitre ${n} : ${l.length === 1 ? `image ${l[0]}` : `${l.length} images (${l.slice(0, 3).join(', ')}${l.length > 3 ? '…' : ''})`}`);
  for (const n of bulles) ajoute(`Chapitre ${n} : réglage des bulles`);
  for (const n of textes) ajoute(`Chapitre ${n} : textes de la BD`);
  if (persos) ajoute('portraits des personnages');
  if (i18n) ajoute('traductions');
  if (code) ajoute('code de l’appli');
  if (outils) ajoute('outils');
  if (docs) ajoute('documentation');
  if (readme) ajoute('README');
  if (autres) ajoute('autres fichiers');
  const liste = parts.slice(0, 3).join(' ; ') + (parts.length > 3 ? ' ; …' : '');
  return `Mise à jour : ${liste || 'fichiers du projet'}`;
}

/** Cherche une clé API dans ce qui va être envoyé. */
function cleDetectee() {
  const diff = git(['diff', '--cached', '-U0', '--no-color']).out;
  const l = diff.split('\n').find((x) => x.startsWith('+') && !x.startsWith('+++') && /AIza[0-9A-Za-z_-]{30,}|GEMINI_API_KEY\s*=\s*["']?[A-Za-z0-9_-]{20,}/.test(x));
  return !!l;
}

/**
 * Pull → add → commit → push. Renvoie { statut: 'envoye' | 'rien', message, fichiers }.
 * @param {object} o { message, essai, silencieux }
 */
export async function publier({ message = '', essai = false, silencieux = false } = {}) {
  const say = (s = '') => { if (!silencieux) console.log(s); };
  try {
    const dedans = git(['rev-parse', '--is-inside-work-tree'], { ok: true });
    if (dedans.code !== 0) throw new Explique('Ce dossier n’est pas un dépôt git.', ['Va dans le dossier du projet : cd "$HOME\\Desktop\\Nouveau dossier\\revision-ia"']);
    const branche = git(['rev-parse', '--abbrev-ref', 'HEAD']).out.trim();
    if (branche !== BRANCHE) {
      throw new Explique(`Tu es sur la branche « ${branche} », pas sur « ${BRANCHE} ».`, [`Je n’envoie que sur ${BRANCHE}. Tape : git checkout ${BRANCHE}  (puis relance).`, 'Si git refuse, dis-le-moi dans Claude Code.']);
    }
    // Un git pull / merge déjà en cours ?
    if (git(['rev-parse', '-q', '--verify', 'MERGE_HEAD'], { ok: true }).code === 0 || etat().some(enConflit)) {
      throw new Explique('Un conflit git est déjà en cours dans ce dossier.', ['Ne touche à rien. Ouvre Claude Code dans ce dossier et écris :', '  « Il y a un conflit git. Aide-moi à le résoudre sans rien perdre. »']);
    }

    // 1. git pull
    if (essai) say('🧪 ESSAI : pas de git pull, rien ne sera enregistré ni envoyé.');
    else {
      say('⬇️  Récupération de ce qui est sur GitHub (git pull)…');
      let essais = 0; let r;
      for (;;) {
        r = git(['pull', '--no-rebase', '--no-edit'], { ok: true });
        if (r.code === 0 || !/Could not resolve host|unable to access|Connection (timed out|reset)|early EOF|RPC failed/i.test(r.out) || ++essais > 2) break;
        say(`   📡 Pas de connexion, nouvel essai dans ${2 * 2 ** essais} s…`); await dormir(2000 * 2 ** essais);
      }
      if (r.code !== 0) {
        const conflits = etat().filter(enConflit).map((x) => x.f);
        if (conflits.length || /CONFLICT|Automatic merge failed/i.test(r.out)) {
          git(['merge', '--abort'], { ok: true }); // on remet le dossier comme avant (rien n'est perdu)
          const liste = conflits.length ? conflits : (r.out.match(/CONFLICT[^\n]*in ([^\n]+)/g) || []).map((l) => l.replace(/.* in /, ''));
          throw new Explique('Conflit : les mêmes fichiers ont été modifiés ici ET sur GitHub.', [
            ...liste.slice(0, 8).map((f) => `  • ${f}`),
            'Je n’ai rien forcé et j’ai remis ton dossier comme avant : rien n’est perdu.',
            'QUE FAIRE : ouvre Claude Code dans ce dossier et écris :',
            `  « Conflit git sur ${liste[0] || 'ces fichiers'}. Aide-moi à garder les deux versions sans rien perdre. »`,
          ]);
        }
        if (/would be overwritten|Please commit your changes or stash|local changes/i.test(r.out)) {
          const lignes = r.out.split('\n'); const d = lignes.findIndex((l) => /would be overwritten/i.test(l));
          const fich = d < 0 ? [] : lignes.slice(d + 1).filter((l, i, a) => /^\s+\S/.test(l) && a.slice(0, i).every((x) => /^\s+\S/.test(x))).map((l) => l.trim()).slice(0, 8);
          throw new Explique('Des fichiers que tu as modifiés ici ont AUSSI changé sur GitHub : je n’écrase rien.', [
            ...fich.map((f) => `  • ${f}`),
            'QUE FAIRE : ouvre Claude Code dans ce dossier et écris :',
            '  « Mes modifications locales touchent les mêmes fichiers que GitHub. Aide-moi à les fusionner sans rien perdre. »',
          ]);
        }
        const ex = expliquerGit(r.out);
        if (ex) throw ex;
        throw new Explique('git pull a échoué.', r.out.trim().split('\n').slice(0, 6));
      }
      const resume = r.out.trim().split('\n')[0];
      say(`   ${/Already up to date|Déjà à jour/i.test(resume) ? 'Déjà à jour.' : 'Nouveautés récupérées.'}`);
    }

    // 2. git add (sans les fichiers interdits)
    const items = etat().filter((x) => !enConflit(x));
    const interdits = items.filter((x) => estInterdit(x.f));
    const aEnvoyer = items.filter((x) => !estInterdit(x.f));
    // Interdit déjà préparé par erreur (git add à la main) : on le retire de la préparation, sans le toucher.
    const prepares = interdits.filter((x) => /^[MADRC]/.test(x.code) && x.code[0] !== '?');
    if (prepares.length && !essai) git(['reset', '-q', '--', ...prepares.map((x) => x.f)], { ok: true });
    if (interdits.length) say(`   🔒 Jamais envoyés : ${[...new Set(interdits.map((x) => x.f.split('/').slice(0, 2).join('/')))].slice(0, 4).join(', ')}${interdits.length > 4 ? '…' : ''}`);

    const dejaPrepares = git(['diff', '--cached', '--name-only', '-z']).out.split('\0').filter(Boolean).filter((f) => !estInterdit(f));
    const noms = [...new Set([...aEnvoyer.map((x) => x.f), ...dejaPrepares])];
    const msg = (message || '').trim() || messageAuto(noms);

    if (essai) {
      say(`\n🧪 Fichiers qui seraient envoyés (${noms.length}) :`);
      noms.slice(0, 20).forEach((f) => say(`   ${aEnvoyer.find((x) => x.f === f)?.code.trim() || 'M'}  ${f}`));
      if (noms.length > 20) say(`   … et ${noms.length - 20} autre(s)`);
      say(`\n📝 Message : ${msg}`);
      return { statut: noms.length ? 'essai' : 'rien', message: msg, fichiers: noms };
    }

    // Commits pas encore envoyés (d'un essai précédent qui avait échoué à pousser) ?
    const enAvance = git(['rev-list', '--count', '@{u}..HEAD'], { ok: true });
    const nbAvance = enAvance.code === 0 ? +enAvance.out.trim() || 0 : 0;

    if (!noms.length && !nbAvance) {
      say('✅ Rien à envoyer : tout est déjà sur GitHub.');
      return { statut: 'rien', message: '', fichiers: [] };
    }

    let fait = false;
    if (noms.length) {
      git(['add', '-A', '--', ...noms]);
      if (cleDetectee()) {
        git(['reset', '-q'], { ok: true });
        throw new Explique('STOP : une clé API a été trouvée dans les fichiers à envoyer.', ['Je n’ai rien enregistré ni envoyé. Retire la clé du fichier (elle doit rester dans .env.local), puis relance.', 'Si tu l’as collée par erreur quelque part, supprime-la.']);
      }
      const gros = noms.filter((f) => { try { return execFileSync('git', ['cat-file', '-s', `:${f}`], { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }) > 90 * 1024 * 1024; } catch { return false; } });
      if (gros.length) {
        git(['reset', '-q'], { ok: true });
        throw new Explique('Un fichier dépasse 90 Mo : GitHub le refuserait.', [...gros.map((f) => `  • ${f}`), 'Réduis-le ou retire-le du projet, puis relance.']);
      }
      // 3. commit
      say(`💾 Enregistrement (git commit) : ${msg}`);
      const c = git(['commit', '-q', '-m', msg], { ok: true });
      if (c.code !== 0) {
        if (/nothing to commit|rien à valider/i.test(c.out)) { /* déjà rien */ } else { const ex = expliquerGit(c.out); throw ex || new Explique('git commit a échoué.', c.out.trim().split('\n').slice(0, 6)); }
      } else fait = true;
    }
    if (!fait && !nbAvance) {
      say('✅ Rien à envoyer : tout est déjà sur GitHub.');
      return { statut: 'rien', message: '', fichiers: [] };
    }

    // 4. git push (avec quelques essais si la connexion est mauvaise)
    say('⬆️  Envoi sur GitHub (git push)…');
    let essaisPush = 0; let p; let retiré = false;
    for (;;) {
      p = git(['push', 'origin', BRANCHE], { ok: true });
      if (p.code === 0) break;
      const reseau = /Could not resolve host|unable to access|Failed to connect|Connection (timed out|refused|reset)|early EOF|RPC failed|SSL|timed out/i.test(p.out);
      const retard = /non-fast-forward|fetch first|Updates were rejected/i.test(p.out);
      if (retard && !retiré) { // GitHub a avancé entre-temps : un nouveau pull, puis un dernier essai
        retiré = true; say('   GitHub a changé entre-temps : nouveau git pull…');
        const r2 = git(['pull', '--no-rebase', '--no-edit'], { ok: true });
        if (r2.code !== 0) {
          git(['merge', '--abort'], { ok: true });
          throw new Explique('Conflit au moment de l’envoi : GitHub a reçu des changements sur les mêmes fichiers.', ['Je n’ai rien forcé. Ouvre Claude Code dans ce dossier et écris :', '  « Conflit git au moment du push. Aide-moi à fusionner sans rien perdre. »']);
        }
        continue;
      }
      if (reseau && ++essaisPush <= 3) { say(`   📡 Connexion difficile, nouvel essai ${essaisPush}/3 dans ${2 * 2 ** essaisPush} s…`); await dormir(2000 * 2 ** essaisPush); continue; }
      throw expliquerGit(p.out) || new Explique('git push a échoué.', p.out.trim().split('\n').slice(0, 6));
    }

    const hash = git(['rev-parse', '--short', 'HEAD']).out.trim();
    const sujet = git(['log', '-1', '--format=%s']).out.trim();
    say(`\n✅ Envoyé sur GitHub : ${sujet}  (${hash}${noms.length ? `, ${noms.length} fichier${noms.length > 1 ? 's' : ''}` : ''})`);
    if (noms.length) { noms.slice(0, 8).forEach((f) => say(`   • ${f}`)); if (noms.length > 8) say(`   … et ${noms.length - 8} autre(s)`); }
    say('🌐 Le site se met à jour tout seul dans 3 à 4 minutes (GitHub Actions).');
    return { statut: 'envoye', message: sujet, fichiers: noms, hash };
  } catch (e) {
    const ex = e instanceof Explique ? e : (expliquerGit(e.git?.out || e.message) || new Explique('Erreur inattendue pendant l’envoi.', String(e.message).trim().split('\n').slice(0, 5)));
    console.log(`\n❌ ${ex.message}`);
    ex.conseils.filter(Boolean).forEach((c) => console.log(c.startsWith('  ') ? c : `   ${c}`));
    if (silencieux) { /* l'appelant décide */ }
    const err = new Error(ex.message); err.explique = true; throw err;
  }
}

// ---------------------------------------------------------------------
// Ligne de commande
// ---------------------------------------------------------------------
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const essai = args.includes('--essai');
  const message = args.filter((a) => !a.startsWith('--')).join(' ').trim();
  try {
    const r = await publier({ message, essai });
    process.exit(r.statut === 'rien' || r.statut === 'essai' || r.statut === 'envoye' ? 0 : 1);
  } catch { process.exit(1); }
}
