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
import { processSheets, sheetFiles, CHAR_DIR } from './scripts/planches.mjs';

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
        .filter((f) => !SKIP.test(f) && f !== 'sw.js' && !f.startsWith('story/') && !f.endsWith('.gitkeep'))
        // Personnages : portraits 300 px et calques (yeux fermés, bouche ouverte) pré-téléchargés
        // (affichage instantané, hors ligne) ; ni les planches d'origine, ni les variantes
        // déposées, ni les grands formats (720 px, chargés à la demande).
        .filter((f) => !f.startsWith('characters/') || /^characters\/[\w-]+\/([a-z]+|calque-[a-z]+)\.webp$/.test(f));
      const list = ['./', ...files.map((f) => `./${f}`)];
      // Le nom du cache change à chaque nouvelle version du site.
      const version = createHash('md5').update(list.join()).digest('hex').slice(0, 8);
      const source = readFileSync('src/sw.js', 'utf8')
        .replace('__PRECACHE__', JSON.stringify(list, null, 1))
        .replace('__VERSION__', version);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
    // Sécurité : si un fichier de la liste n'existe pas vraiment dans dist/ (fichier
    // supprimé par Vite après coup), l'installation du service worker échouerait
    // et l'appli ne marcherait plus hors ligne. On retire donc ces entrées.
    closeBundle() {
      const file = join(outDir, 'sw.js');
      if (!existsSync(file)) return;
      const src = readFileSync(file, 'utf8');
      const m = src.match(/const PRECACHE = (\[[\s\S]*?\]);/);
      if (!m) return;
      const list = JSON.parse(m[1]);
      const ok = list.filter((u) => u === './' || existsSync(join(outDir, u.slice(2))));
      if (ok.length !== list.length) {
        console.warn(`  ⚠️ service worker : ${list.length - ok.length} fichier(s) absent(s) retiré(s) de la liste`);
        writeFileSync(file, src.replace(m[1], JSON.stringify(ok, null, 1)));
      }
    },
    configResolved(config) { outDir = config.build.outDir; },
  };
}
let outDir = 'dist';

// ---------------------------------------------------------------------
// PERSONNAGES EN IMAGES (planches d'expressions sur fond vert)
// ---------------------------------------------------------------------
// public/characters/<id>/ : planches (+ planches.json facultatif) → 8 portraits détourés
// (scripts/planches.mjs), donnés à l'appli par le module "virtual:character-images"
// (lu par src/ui/character.js). Sans planche : le dessin SVG reste affiché.
const CHAR_ID = 'virtual:character-images';
function characterImages() {
  let sharp = null; let isBuild = false; let cache = null; let cacheKey = '';
  const vid = `\0${CHAR_ID}`;
  const stamp = () => JSON.stringify(sheetFiles().map((f) => [f, statSync(f).mtimeMs, statSync(f).size]));
  const get = async () => {
    const key = stamp();
    if (!cache || key !== cacheKey) {
      sharp ||= await loadSharp();
      cache = sharp ? await processSheets(sharp) : { files: {}, images: {}, report: {} };
      cacheKey = key;
      for (const [id, r] of Object.entries(cache.report)) console.log(`  🧑 ${id} : ${Object.entries(r).map(([e, v]) => `${e} ${v}`).join(' · ')}`);
    }
    return cache;
  };
  return {
    name: 'character-images',
    configResolved(config) { isBuild = config.command === 'build'; },
    resolveId(id) { return id === CHAR_ID ? vid : null; },
    async load(id) {
      if (id !== vid) return null;
      const { images } = await get();
      return `export default ${JSON.stringify(images)};`;
    },
    // En local : portraits servis depuis la mémoire ; une planche modifiée recharge la page.
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const m = (req.url || '').split('?')[0].match(/\/(characters\/[\w-]+\/[\w-]+\.webp)$/);
        if (!m) return next();
        const buf = (await get()).files[m[1]];
        if (!buf) return next();
        res.setHeader('Content-Type', 'image/webp');
        res.end(buf);
      });
      server.watcher.add(CHAR_DIR);
      const refresh = (file) => {
        if (!/public[\\/]characters[\\/]/i.test(file)) return;
        const mod = server.moduleGraph.getModuleById(vid);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      ['add', 'change', 'unlink'].forEach((ev) => server.watcher.on(ev, refresh));
    },
    async generateBundle() {
      if (!isBuild) return;
      for (const [fileName, source] of Object.entries((await get()).files)) this.emitFile({ type: 'asset', fileName, source });
    },
    // Les planches d'origine (lourdes) ne sont pas publiées : seuls les portraits découpés le sont.
    closeBundle() {
      if (!isBuild) return;
      for (const f of sheetFiles()) { const copied = join(outDir, relative('public', f)); if (existsSync(copied)) rmSync(copied); }
    },
  };
}

/**
 * Précharge les 2 polices principales (alphabet latin) dès la lecture de index.html :
 * elles sont prêtes AVANT le premier affichage, au lieu d'être découvertes en plein
 * rendu (ce qui obligeait le navigateur à refaire toute la mise en page).
 */
function preloadFonts() {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const fonts = Object.keys(ctx.bundle || {}).filter((f) => /(plus-jakarta-sans|unbounded)-latin-wght-normal-.*\.woff2$/.test(f));
        const tags = fonts.map((f) => ({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `${base}${f}`, crossorigin: '' }, injectTo: 'head' }));
        return { html, tags };
      },
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
//   - au build, les optimise en WebP, en 3 LARGEURS (600, 900 et 1200 px ;
//     la plus grande fait moins de 200 Ko) : l'appli choisit selon l'écran ;
//   - crée pour chaque image un APERÇU FLOU minuscule (≈ 300 octets) inclus
//     dans l'appli : la case s'affiche aussitôt, puis l'image nette arrive en fondu
//     (avec "sharp" ; s'il manque, l'image est publiée telle quelle) ;
//   - lit aussi public/story/chapitre-N/bulles-chapitre-N.json (positions
//     des bulles enregistrées avec l'éditeur du Panneau créateur).
// ---------------------------------------------------------------------
const STORY_DIR = 'public/story';
const STORY_FILE = /^page-(\d+)-case-(\d+)\.(webp|png|jpe?g)$/i;
const STORY_ID = 'virtual:story-images';
const STORY_WIDTHS = [600, 900, 1200]; // la plus grande garde le nom sans suffixe
const STORY_MAX_BYTES = { 600: 70 * 1024, 900: 130 * 1024, 1200: 200 * 1024 };
/** Nom publié d'une largeur : chapitre-1/page-1-case-1.webp (1200) ou …-600.webp */
const variantName = (key, w) => (w === 1200 ? `${key}.webp` : `${key}-${w}.webp`);

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

/** { 1: { "page-1-case-4": { bubbles: [...], captions: [...], sfx: [...] } }, … } */
function scanLayouts(ctx) {
  const out = {};
  if (!existsSync(STORY_DIR)) return out;
  for (const dir of readdirSync(STORY_DIR)) {
    const m = dir.match(/^chapitre-(\d+)$/i);
    if (!m) continue;
    const file = join(STORY_DIR, dir, `bulles-chapitre-${+m[1]}.json`);
    if (!existsSync(file)) continue;
    try {
      const data = JSON.parse(readFileSync(file, 'utf8'));
      out[+m[1]] = data.cases || {};
    } catch (e) {
      ctx.warn(`${file} ignoré (JSON invalide) : ${e.message}`);
    }
  }
  return out;
}

async function loadSharp() {
  try { return (await import('sharp')).default; } catch { return null; }
}

/** WebP de largeur max `width` ; qualité baissée (puis taille réduite) jusqu'à passer sous le plafond. */
async function optimize(sharp, input, width = 1200) {
  let px = width;
  let out;
  for (let tries = 0; tries < 18; tries++) {
    const q = 82 - (tries % 6) * 8; // 82 → 42
    out = await sharp(input).rotate()
      .resize({ width: px, height: px, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: q, effort: 5 }).toBuffer();
    if (out.length <= STORY_MAX_BYTES[width]) break;
    if (tries % 6 === 5) px = Math.round(px * 0.8);
  }
  return out;
}

/** Aperçu flou : image de 20 px de large, en data: URI (quelques centaines d'octets). */
async function lqip(sharp, file) {
  const buf = await sharp(file).rotate().resize({ width: 20 }).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

/** Largeurs à publier pour une image de largeur `w` (jamais d'agrandissement). */
const widthsFor = (w) => { const l = STORY_WIDTHS.filter((x) => x <= w); return l.length ? (l.includes(1200) ? l : [...l, 1200]) : [1200]; };

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
    async load(id) {
      if (id !== vid) return null;
      sharp ||= await loadSharp();
      // { clé: { src, w, h, lqip, srcs: { 600: …, 900: …, 1200: … } } }
      // w, h : dimensions (recadrage sur le point focal) ; lqip : aperçu flou ;
      // srcs : fichiers par largeur (l'appli choisit selon l'écran).
      const images = {};
      for (const [key, file] of Object.entries(scanStory())) {
        const path = join(STORY_DIR, file);
        const meta = sharp ? await sharp(path).metadata().catch(() => ({})) : {};
        const turned = (meta.orientation || 1) >= 5; // photo pivotée (EXIF)
        const w = (turned ? meta.height : meta.width) || 0;
        const optimized = isBuild && sharp;
        // ?v=empreinte du fichier : une image remplacée sur GitHub change d'adresse,
        // donc le cache (service worker) ne garde jamais une ancienne version.
        const v = `?v=${createHash('md5').update(readFileSync(path)).digest('hex').slice(0, 8)}`;
        const srcs = optimized ? Object.fromEntries(widthsFor(w).map((x) => [x, `story/${variantName(key, x)}${v}`])) : { [w || 1200]: `story/${file}${v}` };
        images[key] = {
          src: optimized ? `story/${variantName(key, 1200)}${v}` : `story/${file}${v}`,
          w,
          h: (turned ? meta.width : meta.height) || 0,
          lqip: sharp ? await lqip(sharp, path).catch(() => '') : '',
          srcs,
        };
      }
      return `export const IMAGES = ${JSON.stringify(images)};
export const LAYOUTS = ${JSON.stringify(scanLayouts(this))};`;
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
      server.watcher.on('change', (file) => { if (file.endsWith('.json')) refresh(file); });
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
        const input = readFileSync(join(STORY_DIR, file));
        const meta = await sharp(input).metadata();
        const w = (meta.orientation || 1) >= 5 ? meta.height : meta.width;
        const sizes = [];
        for (const width of widthsFor(w)) {
          const buf = await optimize(sharp, input, width);
          const dest = join(outDir, 'story', variantName(key, width));
          mkdirSync(join(dest, '..'), { recursive: true });
          writeFileSync(dest, buf);
          sizes.push(`${width} px ${Math.round(buf.length / 1024)} Ko`);
        }
        // Copie brute faite par Vite (dossier public/) : remplacée par les versions optimisées.
        const copied = join(outDir, 'story', file);
        if (!file.endsWith(`${key.split('/')[1]}.webp`) && existsSync(copied)) rmSync(copied);
        console.log(`  🖼️  story/${key}  ${sizes.join(' · ')}`);
      }
    },
  };
}

export default defineConfig({
  base,
  plugins: [storyImages(), characterImages(), serviceWorker(), preloadFonts()],
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
