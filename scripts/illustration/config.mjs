// =====================================================================
// illustration/config.mjs — Clé, chemins, personnages et décors de l'outil d'illustration
// ---------------------------------------------------------------------
// La CLÉ API est lue dans .env.local (prioritaire) ou .env, à la racine du projet :
//   GEMINI_API_KEY=ta_clé
// Ces deux fichiers sont dans .gitignore. La clé n'est JAMAIS affichée, journalisée
// ni écrite ailleurs : seule la fonction masquer() la remplace par « *** » dans les
// messages d'erreur, au cas où un serveur la renverrait.
// =====================================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const STORY_DIR = path.join(ROOT, 'public', 'story');
export const REF_DIR = path.join(ROOT, 'references');
export const LOT_DIR = path.join(ROOT, 'docs', 'retouches');
/** Dossier Téléchargements (ILLUS_TELECHARGEMENTS dans .env.local pour en choisir un autre). */
export const dossierTelechargements = (env) => env.ILLUS_TELECHARGEMENTS || path.join(os.homedir(), 'Downloads');
export const IMG_EXT = /\.(png|jpe?g|webp)$/i;

/** Variables : process.env, puis .env, puis .env.local (le dernier gagne). */
export function readEnv() {
  const out = { ...process.env };
  for (const name of ['.env', '.env.local']) {
    try {
      for (const l of fs.readFileSync(path.join(ROOT, name), 'utf8').split(/\r?\n/)) {
        const m = l.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    } catch { /* fichier absent */ }
  }
  return out;
}

let SECRET = '';
/** Retient la clé pour pouvoir la masquer dans tous les messages. */
export function retenirSecret(k) { SECRET = k || ''; }
/** Remplace la clé (si elle apparaît) par *** dans un texte. */
export function masquer(txt) {
  let s = String(txt ?? '');
  if (SECRET && SECRET.length > 6) s = s.split(SECRET).join('***');
  return s.replace(/AIza[0-9A-Za-z_-]{20,}/g, '***');
}

// ---------------------------------------------------------------------
// Chapitres et cases
// ---------------------------------------------------------------------
export const chapDir = (n) => path.join(STORY_DIR, `chapitre-${n}`);
export const propDir = (n) => path.join(chapDir(n), '_propositions'); // jamais publié (sous-dossier), jamais commité
export const saveDir = (n) => path.join(chapDir(n), '_sauvegardes'); // anciennes images remplacées
export const caseName = (p, c) => `page-${p}-case-${c}`;

/** Données du chapitre (src/data/comic/chapitres/chNN.js). */
export async function loadChapter(n) {
  const file = path.join(ROOT, 'src', 'data', 'comic', 'chapitres', `ch${String(n).padStart(2, '0')}.js`);
  if (!fs.existsSync(file)) throw new Error(`Chapitre ${n} introuvable (${path.relative(ROOT, file)}).`);
  return (await import(pathToFileURL(file).href)).default;
}

/** Image existante d'une case (chemin complet) ou null. */
export function caseImage(n, p, c) {
  const dir = chapDir(n);
  if (!fs.existsSync(dir)) return null;
  const re = new RegExp(`^${caseName(p, c)}\\.(webp|png|jpe?g)$`, 'i');
  const f = fs.readdirSync(dir).find((x) => re.test(x));
  return f ? path.join(dir, f) : null;
}

/** Toutes les images déjà illustrées d'un chapitre : [{ p, c, file }]. */
export function chapterImages(n) {
  const dir = chapDir(n);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map((f) => {
    const m = f.match(/^page-(\d+)-case-(\d+)\.(webp|png|jpe?g)$/i);
    return m ? { p: +m[1], c: +m[2], file: path.join(dir, f) } : null;
  }).filter(Boolean).sort((a, b) => a.p - b.p || a.c - b.c);
}

/** Case dessinée par l'appli (écran de téléphone, croquis, cahier) : jamais d'illustration. */
export function isAppDrawn(panel) {
  const a = panel?.action || '';
  if (/\[ILLUSTRATION\]/.test(a)) return false;
  return /\[(ÉCRAN|ECRAN) APPLI\]|\[DESSIN APPLI\]/i.test(a) || ['ecran', 'cahier', 'croquis', 'graphe', 'carte'].includes(panel?.bg?.id);
}

// ---------------------------------------------------------------------
// Personnages : nom (détection dans la description), fichier de référence, verrou en anglais
// ---------------------------------------------------------------------
// Les verrous décrivent l'apparence ; l'âge et la taille sont dans HEIGHT/AGE LOCK (prompt.mjs).
export const PERSONNAGES = {
  kai: {
    nom: 'Kaï', re: /\bka[ïi](?![a-z])/i,
    court: 'a young man with short curly high-top hair, a purple hoodie and black headphones around his neck',
    lock: 'Kaï: young Black man about 20, short black curly high-top hair with faded sides, purple hoodie with white drawstrings, black over-ear headphones resting around his NECK (never on his ears), black joggers, white sneakers, small dark-grey backpack.',
  },
  'kai-bande': { // variante choisie automatiquement quand la description parle de bandage
    nom: 'Kaï (main bandée)', ref: 'kai-bande',
    court: 'a young man with short curly high-top hair, a purple hoodie and his RIGHT hand wrapped in a white bandage',
    lock: 'His RIGHT hand ONLY is wrapped in a white bandage; his LEFT hand is bare (never bandage both hands).',
  },
  mory: {
    nom: 'Mory', re: /\bmory\b/i,
    court: 'a young man with a big round afro, rectangular glasses and a navy jacket with glowing cyan lines',
    lock: 'Mory: young Black man about 20, big round black afro with subtle teal highlights, rectangular glasses with fully TRANSPARENT lenses (both eyes clearly visible, no opaque glare), navy high-collar zip jacket with glowing cyan lines, dark-grey cargo pants, black-and-cyan sneakers, black backpack.',
  },
  nia: {
    nom: 'Nia', re: /\bnia\b/i,
    court: 'a young woman with long black box braids with beads, gold hoop earrings and a plum cardigan over a pink top',
    lock: 'Nia: young Black woman about 20, long black box braids with small gold and pink beads, gold hoop earrings, plum/purple knit cardigan over a pink top, black jeans, grey sneakers; calm and confident.',
  },
  binta: {
    nom: 'Binta', re: /\bbinta\b/i,
    court: 'a young woman with a high spiky black ponytail, gold hoop earrings and a magenta zip jacket',
    lock: 'Binta: young Black woman about 20, high spiky black ponytail tied with a pink scrunchie, small pink hair clip, gold hoop earrings, magenta high-collar zip jacket; energetic.',
  },
  sora: {
    nom: 'Sora', re: /\bsora\b/i,
    court: 'a young woman with two round afro puffs with lime star clips and an olive-green hoodie',
    lock: 'Sora: young Black woman about 20, two round afro puffs with small lime-green star clips, olive-green hoodie with lime trims; playful.',
  },
  ren: {
    nom: 'Ren', re: /\bren\b/i,
    court: 'a young man with short dreadlocks and a dark red bomber jacket',
    lock: 'Ren: young Black man about 20, short dreadlocks, dark red bomber jacket with orange trims, thin chain necklace; rival attitude.',
  },
  awa: {
    nom: 'Awa', re: /\bawa\b/i,
    court: 'a young woman with a high bun in a mustard headwrap, a whistle around her neck and a mustard track jacket',
    lock: 'Awa: young Black woman about 20, hair in a high bun wrapped in a mustard headwrap, whistle on a cord around her neck, mustard and brown track jacket; coach attitude.',
  },
  tidiane: {
    nom: 'Tidiane', re: /\btidiane\b/i,
    court: 'a young man with short wavy hair, a short beard and a navy hoodie',
    lock: 'Tidiane: young Black man about 20, short wavy black hair, short beard, navy hoodie with light-blue trims, wireless earbuds; calm.',
  },
  // Figurants (pas de référence obligatoire : seulement si un fichier existe)
  bibliothecaire: { nom: 'la bibliothécaire', re: /biblioth[ée]caire/i, court: 'a woman of about 50 with reading glasses, a navy headscarf and a white blouse', lock: 'The librarian: woman about 50, reading glasses low on her nose, navy headscarf, white blouse.' },
  etudiante_hijab: { nom: 'l’étudiante au hijab', court: 'a young woman wearing a green hijab', lock: 'A female student about 20 wearing a hijab.' },
  etudiant_jaune: { nom: 'l’étudiant au t-shirt jaune', court: 'a young man in a yellow t-shirt', lock: 'A male student about 20 in a yellow t-shirt.' },
  etudiant: { nom: 'un étudiant', court: 'a young male student', lock: 'A male student about 20.' },
  etudiante: { nom: 'une étudiante', court: 'a young female student', lock: 'A female student about 20.' },
  oubli: { nom: 'l’Oubli', court: 'a huge shadow creature made of violet letters, with a glowing violet crystal core', lock: 'The Oblivion ("l’Oubli"): a huge shadow entity made of violet letters and pixels, with a glowing violet crystal core; NOT a human.' },
};
/** Lieu en quelques mots (légende d'une image jointe : « the empty … with no people »). */
export const DECORS_COURT = {
  bibliotheque: 'university library reading room (long wooden tables with green reading lamps, tall bookshelves)',
  rue: 'street / university campus of Conakry',
  classe: 'university lecture hall',
  marche: 'Madina market street in Conakry',
  corniche: 'Corniche seafront of Conakry (sea, rocks, sea wall, palm trees)',
  chambre: 'student bedroom',
  toit: 'rooftop terrace with a water tank',
};
export const HEROS = ['kai', 'mory', 'nia', 'binta', 'sora', 'ren', 'awa', 'tidiane'];

// ---------------------------------------------------------------------
// Décors : verrou en anglais (inventaire et orientation) par identifiant de décor (bg.id)
// ---------------------------------------------------------------------
export const DECORS = {
  bibliotheque: 'University library reading room: long wooden tables with green reading lamps, ceiling fans, tall windows with rain on the LEFT, tall bookshelves on the RIGHT, a round wall clock on the back wall ABOVE the central bookshelves. Grey rainy daylight. Rain stays OUTSIDE the windows, never indoors.',
  rue: 'Street or university campus of Conakry (Guinea): beige buildings with arcades, palm trees, puddles when it rains. All signs and billboards are blank.',
  classe: 'University lecture hall or building of Conakry. All signs are blank.',
  marche: 'Madina market in Conakry, morning sun, stalls, motorbike taxis. All signs are blank.',
  corniche: 'The Corniche of Conakry: sea, rocks and pirogues, low sea wall, road, palm trees, street lamps.',
  chambre: 'A student bedroom in Conakry at night: bed, desk with a computer, ceiling fan, window on the city.',
  toit: 'A rooftop terrace with a water tank above the market street of Conakry.',
};
/** Fonds « abstraits » (aplat, flash…) : on reprend le décor d'une case voisine. */
export const ABSTRAIT = ['aplat', 'flash', 'oubli'];
