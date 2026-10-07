// =====================================================================
// verifier-bulles.mjs — CONTRÔLE DU PLACEMENT DES BULLES (cases illustrées)
// ---------------------------------------------------------------------
//   npm run verifier-bulles            (chapitre 1)
//   npm run verifier-bulles -- 2       (chapitre 2)
//
// Pour chaque case qui a une illustration (public/story/…), vérifie :
//   ✗ une bulle, un cartouche ou une onomatopée couvre une zone protégée
//     (panel.illus.keep : visages, perso principal, action, objet clé) ;
//   ✗ une bulle couvre plus de 25 % de la case ;
//   ✗ un texte déborde de la case (textes en surimpression compris) ;
//   ✗ deux textes se touchent ;
//   ✗ une zone protégée est coupée par le recadrage (panel.illus.focus) ;
//   ⚠ l'ordre des bulles ne suit pas la lecture (haut → bas, gauche → droite).
// Les cases SANS illustration (dessin de l'appli) sont vérifiées aussi : les
// zones protégées sont alors les visages des persos dessinés (position de la
// tête calculée par l'appli, taille selon le plan : pied, buste, gros…).
// Les positions de bulles-chapitre-N.json (éditeur) sont prises en compte.
// =====================================================================

import { createServer } from 'vite';

const chapterId = +(process.argv[2] || 1);
const server = await createServer({ server: { middlewareMode: true }, logLevel: 'error', appType: 'custom' });
// Le premier chargement peut dépasser 60 s sur un petit PC (préparation des portraits) : on le fait
// d'abord ici, sans limite de temps ; l'appel suivant lit alors le résultat déjà prêt.
await server.environments.ssr.transformRequest('virtual:character-images').catch(() => {});
const load = (path) => server.ssrLoadModule(path);
const { layoutPage, panelInfo, bubbleGeom, captionGeom, sfxGeom, labelGeom, renderPage } = await load('/src/comic/comic.js');
const { loadComic } = await load('/src/data/comic/index.js');
const ch = await loadComic(chapterId);
if (!ch) { console.log(`Chapitre ${chapterId} introuvable.`); process.exit(1); }

/** Point dans un polygone (lancer de rayon). */
const inPoly = (pt, poly) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]; const [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const ellipse = (g, k = 1) => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [g.cx + Math.cos(a) * g.rx * k, g.cy + Math.sin(a) * g.ry * k]; });
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const pct = (v) => `${Math.round(v * 100)} %`;

// Taille d'un visage dessiné selon le plan (rayon, en part de la hauteur cadrée).
const FACE = { pied: 0.06, americain: 0.1, taille: 0.13, buste: 0.2, gros: 0.3 };
let problems = 0;
let checked = 0;
let drawn = 0;
ch.pages.forEach((page, p) => {
  const grid = layoutPage(page);
  const rendered = renderPage(page, p, chapterId).panels;
  (page.panels || []).forEach((panel, c) => {
    const poly = panel.r ? rect(...panel.r) : grid[c];
    const info = panelInfo(panel, poly, c, p, chapterId);
    const name = `page ${p + 1}, case ${c + 1}`;
    const out = [];
    const { box, crop, illus } = info;
    let keeps = [];
    let u0 = 0; let v0 = 0; let u1 = 1; let v1 = 1;
    if (info.src) {
      checked++;
      // Zone visible de l'image (fractions de l'image)
      u0 = -crop.x / crop.dw; v0 = -crop.y / crop.dh;
      u1 = u0 + box.w / crop.dw; v1 = v0 + box.h / crop.dh;
      const toPage = ([u, v]) => { const [x, y] = crop.toPanel([u, v]); return [box.x + x * box.w, box.y + y * box.h]; };
      keeps = (illus.keep || []).map(([a, b, cc, d, label]) => ({ label, poly: [toPage([a, b]), toPage([cc, b]), toPage([cc, d]), toPage([a, d])], raw: [a, b, cc, d] }));
      if (!illus.keep) out.push('⚠ aucune zone protégée notée (panel.illus.keep)');
    } else {
      // Dessin de l'appli : visages des persos dessinés.
      drawn++;
      const heads = rendered[c]?.heads || [];
      (panel.chars || []).forEach((ch0, i) => {
        const hd = heads[i];
        if (!hd || ch0.id === 'poing' || ch0.id === 'pieds' || ch0.light === 'contre' || ['course', 'saut', 'plongeon', 'esquive', 'chute', 'au_sol', 'genou', 'coup_de_pied'].includes(ch0.pose)) return;
        const label = `visage de ${ch0.id}`;
        if (ch0.shot === 'yeux') { keeps.push({ label, poly: rect(box.x + box.w * 0.12, box.y + box.h * ((ch0.y ?? 0.5) - 0.14), box.w * 0.76, box.h * 0.26) }); return; }
        const R = (FACE[ch0.shot] || 0.06) * (ch0.fill ?? 0.92) * box.h;
        keeps.push({ label, poly: ellipse({ cx: box.x + hd[0], cy: box.y + hd[1], rx: R * 0.85, ry: R }) });
      });
    }
    for (const k of keeps.filter((q) => q.raw)) {
      const [a, b, cc, d] = k.raw;
      const vis = (Math.max(0, Math.min(cc, u1) - Math.max(a, u0)) * Math.max(0, Math.min(d, v1) - Math.max(b, v0))) / ((cc - a) * (d - b));
      if (vis < 0.9) { out.push(`✗ « ${k.label} » coupé par le recadrage (visible à ${pct(vis)})`); problems++; }
    }
    // Formes des textes
    const items = [];
    (panel.bubbles || []).forEach((b, i) => { const g = bubbleGeom(b, box); items.push({ kind: `bulle ${i + 1} « ${String(b.text).slice(0, 22)} »`, shape: ellipse(g, g.type === 'cri' ? 1.21 : g.type === 'pensee' ? 1.16 : 1.03), cover: g.cover, size: g.size, center: [g.cx, g.cy], bubble: true }); });
    (panel.captions || []).forEach((cp, i) => { const g = captionGeom(cp, box); items.push({ kind: `cartouche ${i + 1}`, shape: rect(g.x, g.y, g.w, g.h), cover: g.cover, size: g.size }); });
    (panel.sfx || []).forEach((o, i) => { const g = sfxGeom(o, box); items.push({ kind: `onomatopée « ${o.text} »`, shape: g.corners, cover: g.cover, size: g.size }); });
    // Textes en surimpression : posés SUR l'image exprès (pas de contrôle des zones protégées).
    (panel.labels || []).forEach((l) => { const g = labelGeom(l, box); items.push({ kind: `texte sur l’image « ${l.text} »`, shape: rect(g.x0, g.y0, g.w, g.h), cover: g.cover, size: g.size, label: true }); });
    for (const it of items) {
      // Échantillonnage de la forme sur une grille fine
      const xs = it.shape.map((q) => q[0]); const ys = it.shape.map((q) => q[1]);
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      let n = 0; let outside = 0; const hits = new Map();
      for (let x = x0; x <= x1; x += 4) for (let y = y0; y <= y1; y += 4) {
        if (!inPoly([x, y], it.shape)) continue;
        n++;
        if (!inPoly([x, y], poly)) outside++;
        if (!it.label) for (const k of keeps) if (inPoly([x, y], k.poly)) hits.set(k.label, (hits.get(k.label) || 0) + 16);
      }
      for (const [label, a] of hits) {
        const kArea = Math.abs(k2area(keeps.find((k) => k.label === label).poly));
        if (a / kArea > 0.02) { out.push(`✗ ${it.kind} couvre « ${label} » (${pct(a / kArea)} de la zone)`); problems++; }
      }
      if (n && outside / n > 0.04) { out.push(`✗ ${it.kind} déborde de la case (${pct(outside / n)})`); problems++; }
      if (it.bubble && it.cover > 0.25) { out.push(`✗ ${it.kind} couvre ${pct(it.cover)} de la case (max 25 %)`); problems++; }
    }
    // Deux textes ne se chevauchent pas
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const A = items[i].shape; const B = items[j].shape;
      if (A.some((pt) => inPoly(pt, B)) || B.some((pt) => inPoly(pt, A))) { out.push(`✗ ${items[i].kind} touche ${items[j].kind}`); problems++; }
    }
    // Ordre de lecture des bulles : bandes horizontales, puis de gauche à droite
    const bubbles = items.filter((it) => it.bubble);
    for (let i = 1; i < bubbles.length; i++) {
      const [ax, ay] = bubbles[i - 1].center; const [bx, by] = bubbles[i].center;
      if (by < ay - box.h * 0.12 || (Math.abs(by - ay) <= box.h * 0.12 && bx < ax - box.w * 0.1)) out.push(`⚠ ordre de lecture : ${bubbles[i].kind} devrait venir avant ${bubbles[i - 1].kind}`);
    }
    const sizes = items.map((it) => `${it.kind.split(' ')[0]} ${Math.round(it.size)}`).join(', ');
    const where = info.src ? `image visible x ${u0.toFixed(2)}→${u1.toFixed(2)}, y ${v0.toFixed(2)}→${v1.toFixed(2)}` : 'dessin';
    console.log(`${out.some((l) => l.startsWith('✗')) ? '✗' : '✓'} ${name}  [case ${Math.round(box.w)}×${Math.round(box.h)}, ${where}]  ${sizes}`);
    for (const l of out) console.log(`    ${l}`);
  });
});
function k2area(poly) { return poly.reduce((s, q, i) => { const r = poly[(i + 1) % poly.length]; return s + q[0] * r[1] - r[0] * q[1]; }, 0) / 2; }
console.log(`\n${checked} case(s) illustrée(s) et ${drawn} case(s) dessinée(s) vérifiées — ${problems ? `${problems} problème(s)` : 'aucun problème'}.`);
await server.close();
process.exit(problems ? 1 : 0);
