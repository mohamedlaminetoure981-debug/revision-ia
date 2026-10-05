// =====================================================================
// scripts/i18n-extraire.mjs — Liste de TOUS les textes de l'interface
// ---------------------------------------------------------------------
// Parcourt src/ et relève chaque t('Texte en français') ; écrit la liste
// dans src/i18n/fr.json ({ "texte": "texte" }), triée.
// Indique aussi, pour chaque autre langue (en.json…), les textes qui n'ont
// pas encore de traduction (ils s'affichent en français en attendant).
//
// Utilisation : npm run i18n:extraire
// =====================================================================

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SRC = path.join(ROOT, 'src');
const I18N = path.join(SRC, 'i18n');

/** Tous les fichiers .js de src/ (sauf src/i18n). */
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return p === I18N ? [] : files(p);
    return d.name.endsWith('.js') ? [p] : [];
  });
}

// t("…") ou t('…') : le texte est une chaîne simple (pas de ${…}).
const CALL = /(?<![\w$.])t\((["'])((?:\\.|(?!\1)[^\\])*)\1\)/g;
const keys = new Set();
for (const f of files(SRC)) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(CALL)) {
    const text = new Function(`return ${m[1]}${m[2]}${m[1]}`)(); // même lecture que JavaScript
    const k = text.replace(/\s+/g, ' ').trim(); // même repère que t()
    if (k) keys.add(k);
  }
}

const sorted = [...keys].sort((a, b) => a.localeCompare(b, 'fr'));
fs.writeFileSync(path.join(I18N, 'fr.json'), JSON.stringify(Object.fromEntries(sorted.map((k) => [k, k])), null, 1) + '\n');
console.log(`${sorted.length} textes d'interface → src/i18n/fr.json`);

for (const f of fs.readdirSync(I18N).filter((n) => n.endsWith('.json') && n !== 'fr.json')) {
  const dict = JSON.parse(fs.readFileSync(path.join(I18N, f), 'utf8'));
  const missing = sorted.filter((k) => !dict[k]);
  const unused = Object.keys(dict).filter((k) => !keys.has(k));
  console.log(`${f} : ${sorted.length - missing.length}/${sorted.length} traduits` +
    (missing.length ? ` — ${missing.length} manquants (npm run traduire -- ${f.replace('.json', '')} interface)` : '') +
    (unused.length ? ` — ${unused.length} plus utilisés` : ''));
}
