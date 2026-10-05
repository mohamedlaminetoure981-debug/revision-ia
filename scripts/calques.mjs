// =====================================================================
// calques.mjs — Clignement des yeux et bouche qui parle (portraits en images)
// ---------------------------------------------------------------------
// Dans public/characters/<perso>/, deux fichiers FACULTATIFS :
//   yeux-fermes.png     le portrait "neutre" avec les yeux fermés
//   bouche-ouverte.png  le portrait "neutre" avec la bouche ouverte
// (même image que le portrait neutre téléchargé depuis le Panneau créateur,
// retouchée par une IA : seuls les yeux ou la bouche changent ; fond vert uni).
//
// Au build, pour chaque variante :
//   1. détourage du fond (comme les planches) ;
//   2. RECALAGE sur le portrait neutre : agrandissement + décalage trouvés en
//      comparant le visage (de grossier à très fin, jusqu'au pixel) ;
//   3. on compare les deux images DANS la zone attendue (yeux ou bouche) : seuls
//      les pixels qui changent vraiment sont gardés (petites différences de
//      couleur de l'IA corrigées) ;
//   4. on en fait un petit calque (WebP transparent, bords adoucis) posé
//      au pixel près sur le portrait : characters/<perso>/calque-yeux.webp…
// L'appli l'affiche par-dessus le portrait neutre (clignement, bouche qui bouge).
// Sans variante : rien ne change.
// =====================================================================

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { detectKey, keyer, cutOut, measure, gray, shrink, bestMatch } from './planches.mjs';

// kind → fichier, nom du calque, zone attendue (en largeurs de tête, depuis le haut des cheveux)
// et zone de secours (fx, fy : en proportions du cadre)
export const LAYERS = {
  blink: { file: 'yeux-fermes', out: 'calque-yeux', label: 'clignement', y: [0.42, 1.05], x: 0.62, fx: [0.15, 0.85], fy: [0.35, 0.68] },
  mouth: { file: 'bouche-ouverte', out: 'calque-bouche', label: 'bouche', y: [0.9, 1.55], x: 0.45, fx: [0.25, 0.75], fy: [0.55, 0.88] },
};

/** Fichier de variante présent pour ce perso (png, jpg ou webp), ou null. */
export function variantFile(dir, name) {
  if (!existsSync(dir)) return null;
  const f = readdirSync(dir).find((n) => new RegExp(`^${name}\\.(png|jpe?g|webp)$`, 'i').test(n));
  return f ? join(dir, f) : null;
}

/** Toutes les variantes déposées (pour savoir quand refaire le build). */
export function variantFiles(charDir) {
  if (!existsSync(charDir)) return [];
  const out = [];
  for (const id of readdirSync(charDir)) {
    for (const L of Object.values(LAYERS)) {
      const f = variantFile(join(charDir, id), L.file);
      if (f) out.push(f);
    }
  }
  return out;
}

/**
 * Recalage précis : σ et (tx, ty) tels qu'un point p de la variante C tombe en
 * σ·p + t dans le portrait R. Le motif comparé = toute la tête de R (la petite
 * zone qui change ne gêne pas). Trois passes : grossière, fine, au pixel.
 */
async function align(sharp, R, C, head) {
  const gR = gray(R); const gC = gray(C);
  const fx0 = Math.max(0, head.cx - head.w * 0.55); const fx1 = Math.min(R.w, head.cx + head.w * 0.55);
  const fy0 = Math.max(0, head.top); const fy1 = Math.min(R.h, head.top + head.w * 1.45);
  const s0 = R.maxW / C.maxW;
  let est = null;
  for (const [target, span, step, win] of [[40, 0.25, 1.02, null], [100, 0.04, 1.006, 5], [fx1 - fx0, 0.012, 1.002, 4]]) {
    const f = Math.min(1, target / (fx1 - fx0));
    const Rs = await shrink(sharp, gR, R.w, R.h, f);
    const px0 = Math.round(fx0 * f); const py0 = Math.round(fy0 * f);
    const P = { w: Math.min(Rs.w - px0, Math.round((fx1 - fx0) * f)), h: Math.min(Rs.h - py0, Math.round((fy1 - fy0) * f)), d: null };
    P.d = Buffer.alloc(P.w * P.h);
    for (let j = 0; j < P.h; j++) Rs.d.copy(P.d, j * P.w, (py0 + j) * Rs.w + px0, (py0 + j) * Rs.w + px0 + P.w);
    const mid = est ? est.sigma : s0;
    let best = { e: Infinity };
    for (let s = mid * (1 - span); s <= mid * (1 + span); s *= step) {
      const Cs = await shrink(sharp, gC, C.w, C.h, f * s);
      if (Cs.w < P.w || Cs.h < P.h) continue;
      let w = null;
      if (est) {
        const ex = Math.round((px0 / f - est.tx) / est.sigma * s * f); const ey = Math.round((py0 / f - est.ty) / est.sigma * s * f);
        w = { x0: ex - win, x1: ex + win, y0: ey - win, y1: ey + win };
      }
      const m = bestMatch(Cs, P, w);
      if (m.e < best.e) best = { e: m.e, sigma: s, x: m.x, y: m.y, f };
    }
    if (!Number.isFinite(best.e)) break;
    // C réduit (x, y) ↔ R réduit (px0, py0) → R = σ·C + t (pleine résolution)
    est = { sigma: best.sigma, tx: (px0 - best.x) / f, ty: (py0 - best.y) / f, e: best.e };
  }
  return est;
}

/** Flou "boîte" séparable sur un tableau de nombres (w × h), rayon r. */
function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(w * h); const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    let s = 0;
    for (let x = -r; x <= r; x++) s += src[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = s / (2 * r + 1);
      s += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = s / (2 * r + 1);
      s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

/**
 * Fabrique les calques d'un perso.
 * @param {object} neutre { rgba (W×H×4), w, h } : le portrait neutre FINAL (cadre de l'appli)
 * @param {object} head   { cx, top, w } : tête dans ce cadre (centre, haut des cheveux, largeur)
 * @returns {Promise<{ files: {}, calques: {}, report: {} }>}
 */
export async function buildLayers(sharp, dir, id, neutre, head) {
  const files = {}; const calques = {}; const report = {};
  for (const [kind, L] of Object.entries(LAYERS)) {
    const file = variantFile(dir, L.file);
    if (!file) continue;
    try {
      // 1. Détourage de la variante
      const { data: px, info } = await sharp(file).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const kk = keyer(detectKey(px, info.width, info.height, 1));
      const rgba = cutOut(px, info.width, () => false, { x: 0, y: 0, w: info.width, h: info.height }, kk);
      const C = { rgba, w: info.width, h: info.height, ...measure(rgba, info.width, info.height) };
      const R = { ...neutre, ...measure(neutre.rgba, neutre.w, neutre.h) };
      // 2. Recalage
      const t = await align(sharp, R, C, head);
      if (!t || t.e > 0.35) { report[L.label] = `recalage impossible (${file.split('/').pop()} ne ressemble pas assez au portrait neutre)`; continue; }
      const rw = Math.round(C.w * t.sigma); const rh = Math.round(C.h * t.sigma);
      const big = await sharp(rgba, { raw: { width: C.w, height: C.h, channels: 4 } }).resize(rw, rh, { kernel: 'lanczos3' }).raw().toBuffer();
      const ox = Math.round(t.tx); const oy = Math.round(t.ty);
      const W = neutre.w; const H = neutre.h;
      const at = (x, y) => { const vx = x - ox; const vy = y - oy; return vx >= 0 && vy >= 0 && vx < rw && vy < rh ? (vy * rw + vx) * 4 : -1; };
      // 3. Zone attendue et différences (après correction de la teinte moyenne).
      // D'abord la zone calculée d'après la tête ; si rien n'y change (tête mal mesurée,
      // ex. chignon d'Awa), une zone plus large du visage, en proportions du cadre.
      const zones = [
        [Math.max(0, Math.round(head.cx - head.w * L.x)), Math.min(W, Math.round(head.cx + head.w * L.x)),
          Math.max(0, Math.round(head.top + head.w * L.y[0])), Math.min(H, Math.round(head.top + head.w * L.y[1]))],
        [Math.round(W * L.fx[0]), Math.round(W * L.fx[1]), Math.round(H * L.fy[0]), Math.round(H * L.fy[1])],
      ];
      let zx0; let zx1; let zy0; let zy1; let zw; let zh; let fix; let mask; let any = 0; let soft;
      let grow = 0;
      for (let zi = 0; zi < zones.length; zi++) {
        [zx0, zx1, zy0, zy1] = zones[zi];
        zw = zx1 - zx0; zh = zy1 - zy0;
        // Teinte : l'IA éclaircit ou assombrit parfois toute l'image → correction linéaire
        // par canal (gain + décalage) calculée sur la zone.
        const fit = [0, 1, 2].map(() => ({ sx: 0, sy: 0, sxx: 0, sxy: 0 })); let n = 0;
        for (let y = zy0; y < zy1; y += 2) for (let x = zx0; x < zx1; x += 2) {
          const i = (y * W + x) * 4; const j = at(x, y);
          if (j < 0 || neutre.rgba[i + 3] < 250 || big[j + 3] < 250) continue;
          for (let c = 0; c < 3; c++) { const X = big[j + c]; const Y = neutre.rgba[i + c]; const F = fit[c]; F.sx += X; F.sy += Y; F.sxx += X * X; F.sxy += X * Y; }
          n++;
        }
        const gain = fit.map((F) => { const d = n * F.sxx - F.sx * F.sx; return n > 50 && d > 0 ? Math.max(0.7, Math.min(1.4, (n * F.sxy - F.sx * F.sy) / d)) : 1; });
        const bias = fit.map((F, c) => (n ? (F.sy - gain[c] * F.sx) / n : 0));
        fix = (j, c) => big[j + c] * gain[c] + bias[c];
        // Différence TOLÉRANTE : chaque pixel de la variante est comparé aux pixels du
        // portrait à ±2 px ; un trait simplement décalé d'un pixel ne compte pas.
        const diff = new Float32Array(zw * zh);
        for (let y = 0; y < zh; y++) for (let x = 0; x < zw; x++) {
          const j = at(zx0 + x, zy0 + y);
          if (j < 0) continue;
          let best = Infinity;
          for (let dy = -2; dy <= 2 && best > 0; dy++) for (let dx = -2; dx <= 2; dx++) {
            const fx = zx0 + x + dx; const fy = zy0 + y + dy;
            if (fx < 0 || fy < 0 || fx >= W || fy >= H) continue;
            const i = (fy * W + fx) * 4;
            let d = Math.abs(big[j + 3] - neutre.rgba[i + 3]);
            for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(fix(j, c) - neutre.rgba[i + c]));
            if (d < best) best = d;
          }
          diff[y * zw + x] = best;
        }
        // Les vraies différences (yeux qui se ferment, bouche qui s'ouvre) forment des taches
        // nettes ; le léger "bruit" de l'IA (traits redessinés au pixel près) est effacé.
        soft = boxBlur(diff, zw, zh, 2);
        mask = new Float32Array(zw * zh);
        any = 0;
        for (let k = 0; k < zw * zh; k++) if (soft[k] > 34) { mask[k] = 1; any++; }
        // Traits fins du portrait qui DISPARAISSENT près de ce qui change (pli du sourire,
        // coin de l'œil) : la différence tolérante les ignore, ils resteraient en fantôme
        // sous le calque. On les ajoute en comparant pixel à pixel (trait sombre → clair).
        if (any >= 40) {
          for (let pass = 0; pass < 3; pass++) {
            const near = boxBlur(mask, zw, zh, 10);
            for (let y = 0; y < zh; y++) for (let x = 0; x < zw; x++) {
              const k = y * zw + x;
              if (mask[k] || near[k] <= 0.001) continue;
              const j = at(zx0 + x, zy0 + y);
              if (j < 0) continue;
              const i = ((zy0 + y) * W + zx0 + x) * 4;
              const lumN = neutre.rgba[i] + neutre.rgba[i + 1] + neutre.rgba[i + 2];
              const lumV = fix(j, 0) + fix(j, 1) + fix(j, 2);
              if (lumV - lumN > 150 && neutre.rgba[i + 3] > 200) { mask[k] = 1; any++; }
            }
          }
        }
        if (any >= 40) {
          // Ce qui change touche le haut ou le bas de la zone (ex. yeux coupés en deux) :
          // on agrandit la zone de ce côté et on recommence (4 fois au plus).
          let topN = 0; let botN = 0;
          for (let y = 0; y < 4; y++) for (let x = 0; x < zw; x++) { topN += mask[y * zw + x]; botN += mask[(zh - 1 - y) * zw + x]; }
          const add = Math.round(zh * 0.25);
          if (grow < 4 && ((botN >= 12 && zy1 < H) || (topN >= 12 && zy0 > 0))) {
            grow++;
            zones.splice(zi + 1, 0, [zx0, zx1, topN >= 12 ? Math.max(0, zy0 - add) : zy0, botN >= 12 ? Math.min(H, zy1 + add) : zy1]);
            continue;
          }
          break;
        }
      }
      if (any < 40) { report[L.label] = 'aucune différence trouvée avec le portrait neutre'; continue; }
      // Bords adoucis : masque élargi (≈ 6 px) puis flouté.
      const grown = boxBlur(mask, zw, zh, 4);
      for (let k = 0; k < zw * zh; k++) grown[k] = grown[k] > 0.02 ? 1 : 0;
      const feather = boxBlur(grown, zw, zh, 3);
      let bx0 = zw; let by0 = zh; let bx1 = -1; let by1 = -1;
      for (let y = 0; y < zh; y++) for (let x = 0; x < zw; x++) if (feather[y * zw + x] > 0.01) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
      const lw = bx1 - bx0 + 1; const lh = by1 - by0 + 1;
      const out = Buffer.alloc(lw * lh * 4);
      for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) {
        const fx = zx0 + bx0 + x; const fy = zy0 + by0 + y;
        const j = at(fx, fy); const o = (y * lw + x) * 4;
        if (j < 0) continue;
        for (let c = 0; c < 3; c++) out[o + c] = Math.max(0, Math.min(255, Math.round(fix(j, c))));
        out[o + 3] = Math.round(big[j + 3] * feather[(by0 + y) * zw + bx0 + x]);
      }
      // 4. Calque WebP + position (en % du cadre du portrait)
      const buf = await sharp(out, { raw: { width: lw, height: lh, channels: 4 } }).webp({ quality: 90, alphaQuality: 100, effort: 5 }).toBuffer();
      const v = createHash('md5').update(buf).digest('hex').slice(0, 8);
      const name = `characters/${id}/${L.out}.webp`;
      files[name] = buf;
      const pct = (a, b) => +((100 * a) / b).toFixed(3);
      calques[kind] = { src: `${name}?v=${v}`, x: pct(zx0 + bx0, W), y: pct(zy0 + by0, H), w: pct(lw, W), h: pct(lh, H) };
      report[L.label] = `✅ ${lw}×${lh} px, recalage ×${t.sigma.toFixed(3)} (${t.tx.toFixed(1)}, ${t.ty.toFixed(1)})`;
    } catch (e) {
      report[L.label] = `erreur : ${e.message}`;
    }
  }
  return { files, calques, report };
}
