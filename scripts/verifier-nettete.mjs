// =====================================================================
// verifier-nettete.mjs — CONTRÔLE DE LA NETTETÉ DES ILLUSTRATIONS À L'ÉCRAN
// ---------------------------------------------------------------------
//   npm run verifier-nettete            (chapitre 1)
//   npm run verifier-nettete -- 2       (chapitre 2)
//
// Pour chaque case illustrée et pour 3 écrans types (petit Android, téléphone haute densité,
// PC), le script calcule :
//   - la largeur RÉELLE de l'image à l'écran (case × recadrage × zoom du lecteur × densité) ;
//   - le fichier que l'appli charge (ancienne règle → règle actuelle) ;
//   - l'agrandissement subi : « ×1,00 » = net ; plus de ×1,16 = image agrandie, donc floue.
// Le zoom du lecteur est limité à ×1,15 la taille d'origine (src/comic/reader.js).
// Un ✗ signale une case encore floue avec la règle actuelle.
// =====================================================================

import { createServer } from 'vite';
import { widthsFor } from './story-widths.mjs';

const chapterId = +(process.argv[2] || 1);
const MAX_UPSCALE = 1.15; // identique à src/comic/reader.js
const PAGE_W = 1000;
const PROFILS = [
  { nom: 'petit Android', vw: 360, vh: 600, dpr: 2 },
  { nom: 'téléphone', vw: 393, vh: 740, dpr: 2.75 },
  { nom: 'PC', vw: 1280, vh: 680, dpr: 1 },
];

const server = await createServer({ server: { middlewareMode: true }, logLevel: 'error', appType: 'custom' });
// Le premier chargement peut dépasser 60 s sur un petit PC (préparation des portraits) :
// on le fait d'abord ici, sans limite de temps.
await server.environments.ssr.transformRequest('virtual:character-images').catch(() => {});
const { layoutPage, panelInfo } = await server.ssrLoadModule('/src/comic/comic.js');
const { loadComic } = await server.ssrLoadModule('/src/data/comic/index.js');
const { storyImage, pickSrc, setDisplayWidth, coverFactor } = await server.ssrLoadModule('/src/comic/story-images.js');
const ch = await loadComic(chapterId);
if (!ch) { console.log(`Chapitre ${chapterId} introuvable.`); process.exit(1); }

/** Réglage du faux « navigateur » pour pickSrc (densité, largeur de l'écran). */
function ecran(p) {
  globalThis.window = { devicePixelRatio: p.dpr, innerWidth: p.vw, innerHeight: p.vh };
  setDisplayWidth((box) => {
    const zoomed = Math.min(p.vw - 20, (box.w * (p.vh - 20)) / box.h);
    const page = (box.w * Math.min(p.vw, 760)) / PAGE_W;
    return Math.max(zoomed, page);
  });
}

const fmt = (x) => `×${x.toFixed(2).replace('.', ',')}`;
let flou = 0;
let cases = 0;
const pires = [];
ch.pages.forEach((page, p) => {
  const grid = layoutPage(page);
  (page.panels || []).forEach((panel, c) => {
    const poly = panel.r ? [[panel.r[0], panel.r[1]], [panel.r[0] + panel.r[2], panel.r[1]], [panel.r[0] + panel.r[2], panel.r[1] + panel.r[3]], [panel.r[0], panel.r[1] + panel.r[3]]] : grid[c];
    const info = panelInfo(panel, poly, c, p, chapterId);
    const img = storyImage(chapterId, p, c);
    if (!info.src || !img?.w) return;
    cases++;
    const { box, crop } = info;
    const pub = widthsFor(img.w);
    const withSrcs = { ...img, srcs: Object.fromEntries(pub.map((w) => [w, w])) };
    const old = [600, 900, 1200].filter((w) => w <= img.w);
    const cols = [];
    let pire = 0;
    for (const pr of PROFILS) {
      ecran(pr);
      // Largeur réelle de l'image à l'écran (px physiques) : case par case (avec zoom limité) ou page entière.
      const kFit = Math.min((pr.vw - 20) / box.w, (pr.vh - 20) / box.h);
      const k = Math.min(kFit, Math.max((MAX_UPSCALE * img.w) / (crop.dw * pr.dpr), kFit * 0.6));
      const kOld = kFit;
      const pageScale = Math.min(pr.vw, 760) / PAGE_W;
      const realOld = Math.max(crop.dw * kOld, crop.dw * pageScale) * pr.dpr; // ce que l'ancien zoom demandait
      const real = Math.max(crop.dw * k, crop.dw * pageScale) * pr.dpr; // ce que le zoom actuel demande
      // Ancienne règle : largeur de la CASE seulement, densité plafonnée à 2, 3 largeurs publiées ≤ 1200.
      const needOld = Math.max(box.w * kOld, box.w * pageScale) * Math.min(2, pr.dpr);
      const wOld = (old.find((x) => x >= needOld * 0.9) ?? old.at(-1)) || 1200;
      const upOld = realOld / wOld;
      // Règle actuelle : le vrai pickSrc.
      const wNew = pickSrc(withSrcs, box, panel.illus?.zoom);
      const upNew = real / wNew;
      pire = Math.max(pire, upNew);
      cols.push(`${pr.nom} : ${wOld} px ${fmt(upOld)} → ${wNew} px ${fmt(upNew)}`);
    }
    const bad = pire > 1.16;
    if (bad) flou++;
    pires.push([`p${p + 1}c${c + 1}`, pire]);
    console.log(`${bad ? '✗' : '✓'} page ${p + 1}, case ${c + 1}  [source ${img.w} px, case ${Math.round(box.w)}×${Math.round(box.h)}, image ${fmt(coverFactor(img, box))} la case]`);
    for (const l of cols) console.log(`    ${l}`);
  });
});
delete globalThis.window;
console.log(`\n${cases} case(s) illustrée(s) contrôlée(s) — ${flou ? `${flou} encore floue(s) (agrandissement > ×1,16)` : 'toutes nettes (agrandissement ≤ ×1,16 sur les 3 écrans)'}.`);
await server.close();
process.exit(flou ? 1 : 0);
