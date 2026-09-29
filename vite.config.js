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
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const base = process.env.BASE_PATH || '/';

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
      const files = [...Object.keys(bundle), ...listPublic()].filter((f) => !SKIP.test(f) && f !== 'sw.js');
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

export default defineConfig({
  base,
  plugins: [serviceWorker()],
  build: {
    target: 'es2020', // compatible avec les téléphones Android un peu anciens
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
  },
});
