// =====================================================================
// bubble-editor.js — ÉDITEUR DE BULLES (Panneau créateur → BD)
// ---------------------------------------------------------------------
// On choisit un chapitre et une case, puis, à la souris ou au doigt :
//   - on DÉPLACE une bulle, un cartouche ou une onomatopée (glisser) ;
//   - on l'AGRANDIT ou la RÉTRÉCIT (poignée carrée en bas à droite) ;
//   - on ORIENTE LA POINTE d'une bulle (poignée ronde au bout de la pointe) ;
//   - on change la TAILLE DU TEXTE (boutons A− / A+), l'angle d'une onomatopée.
// "💾 Enregistrer" télécharge bulles-chapitre-N.json. Déposé dans
// public/story/chapitre-N/ sur GitHub, ce fichier remplace automatiquement
// les positions écrites dans le code (voir story-images.js → applyLayout).
// Le travail en cours est gardé sur l'appareil (brouillon) entre deux visites.
// Seules les POSITIONS et TAILLES sont enregistrées : les textes restent
// dans src/data/comic/chapitres/chNN.js.
// =====================================================================

import { hasComic, loadComic } from '../data/comic/index.js';
import { renderPage, revealImages, bubbleGeom, captionGeom, sfxGeom, setMathRenderer } from '../comic/comic.js';
import { caseKey, layoutFileName, LAYOUT_PROPS, applyLayout } from '../comic/story-images.js';
import { esc, toast, confirmBox, mathInline } from '../ui/ui.js';

setMathRenderer(mathInline); // formules écrites à la main sur certaines cases

const DRAFT = (id) => `bdBulles-${id}`;
const r3 = (n) => Math.round(n * 1000) / 1000;
const KIND_NAME = { bubbles: 'Bulle', captions: 'Cartouche', sfx: 'Onomatopée' };

/** Positions de tout le chapitre, au format de bulles-chapitre-N.json. */
function exportLayout(ch) {
  const cases = {};
  ch.pages.forEach((page, p) => (page.panels || []).forEach((panel, c) => {
    const one = {};
    for (const [list, props] of Object.entries(LAYOUT_PROPS)) {
      if (!panel[list]?.length) continue;
      one[list] = panel[list].map((item) => {
        const o = {};
        // null = valeur par défaut (taille automatique, pointe vers le perso…)
        for (const k of props) o[k] = item[k] === undefined ? null : Array.isArray(item[k]) ? item[k].map(r3) : typeof item[k] === 'number' ? r3(item[k]) : item[k];
        return o;
      });
    }
    if (Object.keys(one).length) cases[caseKey(p, c)] = one;
  }));
  return { chapitre: ch.id, info: 'Positions des bulles (éditeur du Panneau créateur). Les textes sont dans le code.', cases };
}

export async function openBubbleEditor() {
  const chapters = [];
  for (let id = 1; id <= 12; id++) if (hasComic(id)) chapters.push(id);
  const root = document.createElement('div');
  root.className = 'bd be';
  document.body.appendChild(root);
  let ch = null; let pageIdx = 0; let panelIdx = 0; let sel = null; let current = null;

  root.innerHTML = `
    <div class="bd-top">
      <button class="fs-close" id="be-close" aria-label="Fermer">✕</button>
      <div class="grow bd-title">✏️ Éditer les bulles</div>
      <button class="btn small" id="be-save">💾 Enregistrer</button>
    </div>
    <div class="be-pick">
      <select id="be-ch">${chapters.map((id) => `<option value="${id}">Chapitre ${id}</option>`).join('')}</select>
      <select id="be-case"></select>
    </div>
    <div class="be-stage" id="be-stage"></div>
    <div class="be-tools" id="be-tools"></div>`;
  const $ = (s) => root.querySelector(s);
  const stage = $('#be-stage');

  const panel = () => ch.pages[pageIdx].panels[panelIdx];
  const saveDraft = () => { try { localStorage.setItem(DRAFT(ch.id), JSON.stringify(exportLayout(ch))); } catch { /* stockage indisponible */ } };

  async function loadChapter(id) {
    ch = await loadComic(id);
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem(DRAFT(id)) || 'null'); } catch { /* ignoré */ }
    if (draft?.cases) { applyLayout(ch, draft.cases); toast('Brouillon restauré (modifications non encore publiées).'); }
    $('#be-case').innerHTML = ch.pages.flatMap((pg, p) => (pg.panels || []).map((pn, c) => {
      const n = (pn.bubbles?.length || 0) + (pn.captions?.length || 0) + (pn.sfx?.length || 0);
      return `<option value="${p}:${c}">Page ${p + 1}, case ${c + 1}${n ? ` · ${n} texte${n > 1 ? 's' : ''}` : ''}</option>`;
    })).join('');
    pageIdx = 0; panelIdx = 0; sel = null;
    draw();
  }

  /** Dessine la page, cadrée sur la case choisie, + poignées de l'élément sélectionné. */
  function draw() {
    current = renderPage(ch.pages[pageIdx], pageIdx, ch.id);
    const box = current.panels[panelIdx].box;
    const m = 30;
    stage.innerHTML = current.svg;
    revealImages(stage);
    const svg = stage.querySelector('svg');
    svg.setAttribute('viewBox', `${box.x - m} ${box.y - m} ${box.w + m * 2} ${box.h + m * 2}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    // Les autres cases sont assombries ; seuls les textes de la case choisie sont éditables.
    svg.querySelectorAll('[data-edit]').forEach((g) => { if (+g.dataset.edit.split(':')[0] !== panelIdx) g.remove(); else g.classList.add('be-item'); });
    const poly = current.panels[panelIdx].poly.map((q) => q.join(',')).join(' L');
    const textLayer = svg.querySelector('[data-edit]');
    const veil = `<path fill="#05030a" fill-rule="evenodd" opacity=".82" pointer-events="none" d="M-50,-50 H1050 V1550 H-50 Z M${poly} Z"/>`;
    if (textLayer) textLayer.insertAdjacentHTML('beforebegin', veil); else svg.insertAdjacentHTML('beforeend', veil);
    if (sel) handles(svg, box);
    tools();
  }

  /** Géométrie de l'élément sélectionné (en coordonnées de page). */
  function geomOf(kind, item, box) {
    if (kind === 'bubbles') { const g = bubbleGeom(item, box); return { x0: g.cx - g.rx, y0: g.cy - g.ry, x1: g.cx + g.rx, y1: g.cy + g.ry, size: g.size }; }
    if (kind === 'captions') { const g = captionGeom(item, box); return { x0: g.x, y0: g.y, x1: g.x + g.w, y1: g.y + g.h, size: g.size }; }
    const g = sfxGeom(item, box); const xs = g.corners.map((q) => q[0]); const ys = g.corners.map((q) => q[1]);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys), size: g.size };
  }

  function handles(svg, box) {
    const item = panel()[sel.kind]?.[sel.i];
    if (!item) { sel = null; return; }
    const g = geomOf(sel.kind, item, box);
    const r = Math.max(10, box.w * 0.022);
    let h = `<g class="be-handles"><rect x="${g.x0}" y="${g.y0}" width="${g.x1 - g.x0}" height="${g.y1 - g.y0}" fill="none" stroke="#22d3ee" stroke-width="${r * 0.3}" stroke-dasharray="${r} ${r * 0.6}"/>
      <rect data-h="resize" x="${g.x1 - r}" y="${g.y1 - r}" width="${r * 2}" height="${r * 2}" fill="#22d3ee" stroke="#0b0614" stroke-width="${r * 0.25}"/>`;
    if (sel.kind === 'bubbles' && item.tail !== false) {
      const p = current.panels[panelIdx];
      const t = Array.isArray(item.tail) ? [box.x + item.tail[0] * box.w, box.y + item.tail[1] * box.h]
        : item.who !== undefined && p.heads?.[item.who] ? [box.x + p.heads[item.who][0], box.y + p.heads[item.who][1]] : null;
      if (t) h += `<circle data-h="tail" cx="${t[0]}" cy="${t[1]}" r="${r}" fill="#f472b6" stroke="#0b0614" stroke-width="${r * 0.25}"/>`;
    }
    svg.insertAdjacentHTML('beforeend', `${h}</g>`);
  }

  function tools() {
    const t = $('#be-tools');
    if (!sel) {
      t.innerHTML = '<p class="tiny dim" style="margin:0">Touche une bulle, un cartouche ou une onomatopée pour la modifier. Glisse pour déplacer ; poignée carrée = taille ; poignée rose = pointe.</p>';
      return;
    }
    const item = panel()[sel.kind][sel.i];
    const box = current.panels[panelIdx].box;
    const size = Math.round(geomOf(sel.kind, item, box).size);
    t.innerHTML = `<div class="row" style="gap:6px;flex-wrap:wrap;align-items:center">
        <b class="small">${KIND_NAME[sel.kind]} ${sel.i + 1}</b>
        <span class="tiny dim" style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">« ${esc(item.text)} »</span>
      </div>
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">
        <button class="btn ghost small" data-a="size-">A−</button><span class="small">${size}</span><button class="btn ghost small" data-a="size+">A+</button>
        ${sel.kind !== 'sfx' && item.size ? '<button class="btn ghost small" data-a="size-auto">Taille auto</button>' : ''}
        ${sel.kind === 'sfx' ? '<button class="btn ghost small" data-a="rot-">↺</button><button class="btn ghost small" data-a="rot+">↻</button>' : ''}
        ${sel.kind === 'bubbles' ? `<button class="btn ghost small" data-a="tail">${item.tail === false ? 'Pointe : aucune' : Array.isArray(item.tail) ? 'Pointe : manuelle' : 'Pointe : auto'}</button>` : ''}
        <button class="btn ghost small" data-a="none">OK</button>
      </div>`;
    t.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => act(b.dataset.a, size); });
  }

  function act(a, size) {
    const item = panel()[sel.kind][sel.i];
    if (a === 'size-') item.size = Math.max(8, size - 1);
    if (a === 'size+') item.size = size + 1;
    if (a === 'size-auto') delete item.size;
    if (a === 'rot-') item.rot = (item.rot ?? -10) - 5;
    if (a === 'rot+') item.rot = (item.rot ?? -10) + 5;
    if (a === 'tail') {
      // auto (vers le perso) → aucune → auto
      if (item.tail === false) { delete item.tail; if (item.who === undefined) item.tail = [0.5, 0.9]; } else item.tail = false;
    }
    if (a === 'none') sel = null;
    saveDraft();
    draw();
  }

  // --- Glisser (souris + doigt) ---
  const toPage = (e) => {
    const svg = stage.querySelector('svg');
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  let drag = null; let raf = 0;
  stage.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest('[data-h]');
    const g = e.target.closest('.be-item');
    const box = current.panels[panelIdx].box;
    const p0 = toPage(e);
    if (handle && sel) {
      const item = panel()[sel.kind][sel.i];
      drag = { mode: handle.dataset.h, p0, start: JSON.parse(JSON.stringify(item)), box, size0: geomOf(sel.kind, item, box).size };
    } else if (g) {
      const [, kind, i] = g.dataset.edit.split(':');
      sel = { kind, i: +i };
      const item = panel()[kind][+i];
      // Cartouche aligné à droite : on le convertit en position "depuis la gauche" pour le déplacer.
      if (kind === 'captions' && item.right) { const cg = captionGeom(item, box); item.right = false; item.x = (cg.x - box.x) / box.w; }
      drag = { mode: 'move', p0, start: JSON.parse(JSON.stringify(item)), box };
      draw();
    } else {
      sel = null; draw(); return;
    }
    stage.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || !sel) return;
    const p = toPage(e);
    const { box, start } = drag;
    const dx = (p.x - drag.p0.x) / box.w; const dy = (p.y - drag.p0.y) / box.h;
    const item = panel()[sel.kind][sel.i];
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    if (drag.mode === 'move') {
      item.x = clamp((start.x ?? (sel.kind === 'captions' ? 0.03 : 0.5)) + dx, -0.1, 1.1);
      item.y = clamp((start.y ?? (sel.kind === 'bubbles' ? 0.2 : sel.kind === 'captions' ? 0.03 : 0.5)) + dy, -0.1, 1.1);
    } else if (drag.mode === 'resize') {
      if (sel.kind === 'sfx') item.size = Math.max(16, Math.round(drag.size0 * (1 + (dx * box.w) / 300)));
      else item.w = clamp((start.w ?? (sel.kind === 'captions' ? 0.6 : 0.5)) + dx * 2, 0.1, 1);
    } else if (drag.mode === 'tail') {
      item.tail = [clamp((p.x - box.x) / box.w, -0.05, 1.05), clamp((p.y - box.y) / box.h, -0.05, 1.05)];
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  });
  const end = () => { if (drag) { drag = null; saveDraft(); } };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  $('#be-ch').onchange = (e) => loadChapter(+e.target.value);
  $('#be-case').onchange = (e) => { [pageIdx, panelIdx] = e.target.value.split(':').map(Number); sel = null; draw(); };
  $('#be-close').onclick = () => { root.remove(); window.removeEventListener('resize', draw); };
  window.addEventListener('resize', draw);
  $('#be-save').onclick = async () => {
    const data = exportLayout(ch);
    const name = `bulles-chapitre-${ch.id}.json`;
    const url = URL.createObjectURL(new Blob([`${JSON.stringify(data, null, 1)}\n`], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(`${name} téléchargé. Dépose-le dans ${layoutFileName(ch.id).replace(/[^/]+$/, '')} sur GitHub.`, 'success', 6000);
    if (await confirmBox('Effacer le brouillon gardé sur cet appareil ? (À faire une fois le fichier déposé sur GitHub ; sinon, choisis Annuler.)', 'Effacer le brouillon')) {
      try { localStorage.removeItem(DRAFT(ch.id)); } catch { /* ignoré */ }
    }
  };

  await loadChapter(chapters[0]);
}
