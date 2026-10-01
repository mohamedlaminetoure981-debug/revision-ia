// =====================================================================
// vite.config.js — Configuration de Vite (l'outil qui "construit" le site)
// ---------------------------------------------------------------------
// CHEMIN DE BASE (GitHub Pages) :
//   Sur GitHub Pages, le site est servi à l'adresse
//     https://TON-PSEUDO.github.io/NOM-DU-DEPOT/
//   Il faut donc dire à Vite que le site vit dans "/NOM-DU-DEPOT/".
//   Le fichier .github/workflows/deploy.yml fournit automatiquement cette
//   valeur via la variable BASE_PATH. En local (npm run dev), c'est "/".
//
// SERVICE WORKER (hors ligne) :
//   Le petit plugin "serviceWorker" ci-dessous crée le fichier sw.js au
//   moment de la construction, avec la liste de TOUS les fichiers du site
//   à garder en cache. Tu n'as rien à faire à la main.
// =====================================================================

import { defineConfig } from 'vite';
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const base = process.env.BASE_PATH || '/';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

/** Liste récursive des fichiers du dossier public/ (icônes, manifeste…). */
function listPublic(dir = 'public') {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? listPublic(p) : [relative('public', p).replace(/\\/g, '/')];
  });
}

/**
 * Fichiers à NE PAS pré-télécharger (pour économiser ta connexion) :
 *  - anciens formats de polices (.woff, .ttf) : les navigateurs récents utilisent .woff2 ;
 *  - polices cyrilliques / vietnamiennes / grecques (inutiles en français) ;
 *  - lecteur PDF (gros) : mis en cache seulement la première fois qu'on importe un PDF.
 */
const SKIP = /\.(woff|ttf|map)$|cyrillic|vietnamese|greek|latin-ext|pdf\.|pdf-|README/i;

function serviceWorker() {
  return {
    name: 'service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      // Les illustrations du Mode Histoire ne sont PAS pré-téléchargées : elles
      // sont mises en cache la première fois qu'on lit le chapitre.
      const files = [...Object.keys(bundle), ...listPublic()]
        .filter((f) => !SKIP.test(f) && f !== 'sw.js' && !f.startsWith('story/') && !f.endsWith('.gitkeep'));
      const list = ['./', ...files.map((f) => `./${f}`)];
      // Le nom du cache change à chaque nouvelle version du site.
      const version = createHash('md5').update(list.join()).digest('hex').slice(0, 8);
      const source = readFileSync('src/sw.js', 'utf8')
        .replace('__PRECACHE__', JSON.stringify(list, null, 1))
        .replace('__VERSION__', version);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

// ---------------------------------------------------------------------
// ILLUSTRATIONS DU MODE HISTOIRE (convention de nommage)
// ---------------------------------------------------------------------
// Un fichier public/story/chapitre-1/page-2-case-3.webp (ou .png / .jpg)
// remplace AUTOMATIQUEMENT le dessin SVG de la case 3 de la page 2 du
// chapitre 1. Ce plugin :
//   - cherche ces fichiers et donne leur liste à l'appli (module
//     "virtual:story-images", lu par src/comic/story-images.js) ;
//   - au build, les optimise : WebP, 1200 px maximum, moins de 200 Ko
//     (avec "sharp" ; s'il manque, l'image est publiée telle quelle).
// ---------------------------------------------------------------------
const STORY_DIR = 'public/story';
const STORY_FILE = /^page-(\d+)-case-(\d+)\.(webp|png|jpe?g)$/i;
const STORY_ID = 'virtual:story-images';
const STORY_MAX_PX = 1200;
const STORY_MAX_BYTES = 200 * 1024;

/** { 'chapitre-1/page-2-case-3': 'chapitre-1/Page-2-Case-3.PNG', … } (le .webp gagne s'il y a des doublons) */
function scanStory() {
  const found = {};
  if (!existsSync(STORY_DIR)) return found;
  const rank = (name) => ['webp', 'png', 'jpg', 'jpeg'].indexOf(name.split('.').pop().toLowerCase());
  for (const dir of readdirSync(STORY_DIR)) {
    if (!/^chapitre-\d+$/i.test(dir) || !statSync(join(STORY_DIR, dir)).isDirectory()) continue;
    for (const name of readdirSync(join(STORY_DIR, dir))) {
      const m = name.match(STORY_FILE);
      if (!m) continue;
      const key = `${dir.toLowerCase()}/page-${+m[1]}-case-${+m[2]}`;
      if (!found[key] || rank(name) < rank(found[key].split('/').pop())) found[key] = `${dir}/${name}`;
    }
  }
  return found;
}

async function loadSharp() {
  try { return (await import('sharp')).default; } catch { return null; }
}

/** WebP ≤ 1200 px ; qualité baissée (puis taille réduite) jusqu'à passer sous 200 Ko. */
async function optimize(sharp, input) {
  let px = STORY_MAX_PX;
  let out;
  for (let tries = 0; tries < 18; tries++) {
    const q = 82 - (tries % 6) * 8; // 82 → 42
    out = await sharp(input).rotate()
      .resize({ width: px, height: px, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: q, effort: 5 }).toBuffer();
    if (out.length <= STORY_MAX_BYTES) break;
    if (tries % 6 === 5) px = Math.round(px * 0.8);
  }
  return out;
}

function storyImages() {
  let isBuild = false;
  let outDir = 'dist';
  let sharp = null;
  const vid = `\0${STORY_ID}`;
  return {
    name: 'story-images',
    async configResolved(config) {
      isBuild = config.command === 'build';
      outDir = config.build.outDir;
      if (isBuild) sharp = await loadSharp();
    },
    resolveId(id) { return id === STORY_ID ? vid : null; },
    load(id) {
      if (id !== vid) return null;
      const map = {};
      for (const [key, file] of Object.entries(scanStory())) map[key] = `story/${isBuild && sharp ? `${key}.webp` : file}`;
      return `export default ${JSON.stringify(map)};`;
    },
    // En local (npm run dev) : une image ajoutée ou supprimée recharge la page.
    configureServer(server) {
      server.watcher.add(STORY_DIR);
      const refresh = (file) => {
        if (!file.replace(/\\/g, '/').includes('public/story/')) return;
        const mod = server.moduleGraph.getModuleById(vid);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', refresh);
      server.watcher.on('unlink', refresh);
    },
    async closeBundle() {
      if (!isBuild) return;
      const list = Object.entries(scanStory());
      if (!list.length) return;
      if (!sharp) {
        console.warn('⚠️ sharp absent : illustrations publiées sans optimisation.');
        return;
      }
      for (const [key, file] of list) {
        const buf = await optimize(sharp, readFileSync(join(STORY_DIR, file)));
        const dest = join(outDir, 'story', `${key}.webp`);
        mkdirSync(join(dest, '..'), { recursive: true });
        // Copie brute faite par Vite (dossier public/) : remplacée par la version optimisée.
        const copied = join(outDir, 'story', file);
        if (copied !== dest && existsSync(copied)) rmSync(copied);
        writeFileSync(dest, buf);
        console.log(`  🖼️  story/${key}.webp  ${Math.round(buf.length / 1024)} Ko`);
      }
    },
  };
}

export default defineConfig({
  base,
  plugins: [storyImages(), serviceWorker()],
  // Infos affichées dans le Panneau Créateur.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
  },
  build: {
    target: 'es2020', // compatible avec les téléphones Android un peu anciens
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
  },
});
