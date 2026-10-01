// =====================================================================
// reader.js — LECTEUR DE BD (Mode Histoire)
// ---------------------------------------------------------------------
// Deux façons de lire (bouton en haut à droite, choix mémorisé) :
//   🔍 CASE PAR CASE : zoom guidé sur chaque case, transitions douces,
//                     le reste de la page est assombri. Tape = case suivante,
//                     tape à gauche = case précédente.
//   📄 PAGE ENTIÈRE  : la page complète, on fait défiler.
// Sons : ambiance de la page (mer, ville, nuit…) + effet de chaque case.
// Une seule page est dessinée à la fois (fluide sur petit Android).
// =====================================================================

import { renderPage, PAGE_W, PAGE_H } from './comic.js';
import { playSfx, startAmbient, stopAmbient } from '../ui/sfx.js';
import { vibrate } from '../ui/fx.js';
import * as db from '../core/db.js';

const MODE_KEY = 'bdMode';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

/**
 * Ouvre le lecteur dans `el`.
 * @param {object} chapter  données du chapitre (data/comic/chapitres/chNN.js)
 * @param {object} meta     { id, title, emoji } (liste des chapitres)
 * @param {Function} onEnd  appelée après la dernière case (écran de fin)
 */
export async function openReader(el, chapter, meta, onEnd) {
  let mode = 'case';
  try { mode = localStorage.getItem(MODE_KEY) || 'case'; } catch { /* navigation privée */ }
  const soundOn = await db.getSetting('sounds');
  let pageIdx = 0;
  let panelIdx = 0;
  let current = null; // { svg, panels }
  let ambient = null;

  el.innerHTML = `
    <div class="bd">
      <div class="bd-top">
        <a class="fs-close" href="#/histoire" aria-label="Fermer" style="display:grid;place-items:center;text-decoration:none">✕</a>
        <div class="grow" style="min-width:0"><div class="tiny dim">Chapitre ${meta.id}/12 · <span id="bd-pg"></span></div>
          <div class="bd-title">${esc(meta.emoji || '')} ${esc(chapter.title || meta.title)}</div></div>
        <button class="icon-btn" id="bd-mode" aria-label="Changer de mode de lecture"></button>
      </div>
      <div class="bd-view" id="bd-view"><div class="bd-page" id="bd-page"></div></div>
      <div class="bd-nav" id="bd-nav">
        <button class="btn ghost small" id="bd-prev">←</button>
        <div class="bd-dots" id="bd-dots"></div>
        <button class="btn small" id="bd-next">→</button>
      </div>
    </div>`;
  const view = el.querySelector('#bd-view');
  const holder = el.querySelector('#bd-page');
  const $ = (s) => el.querySelector(s);

  const total = chapter.pages.length;

  function drawPage(dir = 1) {
    const page = chapter.pages[pageIdx];
    current = renderPage(page, pageIdx, chapter.id ?? meta.id);
    holder.innerHTML = current.svg;
    const svg = holder.querySelector('svg');
    // Voile qui assombrit tout sauf la case en cours (mode case par case)
    svg.insertAdjacentHTML('beforeend', `<path id="bd-veil" fill="#05030a" fill-rule="evenodd" opacity="0" d=""/>`);
    holder.classList.remove('bd-turn', 'bd-turn-back');
    void holder.offsetWidth;
    holder.classList.add(dir > 0 ? 'bd-turn' : 'bd-turn-back');
    $('#bd-pg').textContent = `page ${pageIdx + 1}/${total}`;
    // Ambiance sonore de la page
    if (soundOn && page.ambient !== ambient) {
      ambient = page.ambient;
      if (ambient) startAmbient(ambient); else stopAmbient();
    }
    playSfx('page');
    vibrate(6);
  }

  /** Mode case par case : cadre la case `panelIdx` (zoom + translation animés). */
  function focusPanel(animate = true) {
    const svg = holder.querySelector('svg');
    if (!svg || !current) return;
    const p = current.panels[panelIdx];
    if (!p) return;
    const vw = view.clientWidth; const vh = view.clientHeight;
    // L'écran n'est pas encore affiché (taille 0) : on réessaie à l'image suivante.
    if (!vw || !vh) { requestAnimationFrame(() => focusPanel(false)); return; }
    const pad = 10;
    const k = Math.min((vw - pad * 2) / p.box.w, (vh - pad * 2) / p.box.h);
    const cx = p.box.x + p.box.w / 2; const cy = p.box.y + p.box.h / 2;
    // La page est dessinée à sa taille "naturelle" (PAGE_W px de large), puis transformée.
    holder.style.width = `${PAGE_W}px`;
    holder.style.height = `${PAGE_H}px`;
    holder.style.transition = animate ? 'transform .55s cubic-bezier(.3,.9,.3,1)' : 'none';
    holder.style.transform = `translate(${vw / 2 - cx * k}px, ${vh / 2 - cy * k}px) scale(${k})`;
    const poly = p.poly.map((q) => `${q[0]},${q[1]}`).join(' L');
    const veil = svg.querySelector('#bd-veil');
    veil.setAttribute('d', `M-50,-50 H${PAGE_W + 50} V${PAGE_H + 50} H-50 Z M${poly} Z`);
    veil.setAttribute('opacity', '0.82');
    dots();
    const panelData = chapter.pages[pageIdx].panels[panelIdx];
    if (soundOn && panelData?.sound) setTimeout(() => playSfx(panelData.sound), animate ? 260 : 0);
  }

  function pageMode() {
    holder.style.transition = 'none';
    holder.style.transform = 'none';
    holder.style.width = '100%';
    holder.style.height = 'auto';
    const veil = holder.querySelector('#bd-veil');
    if (veil) veil.setAttribute('opacity', '0');
    view.scrollTo(0, 0);
    dots();
  }

  function dots() {
    const n = mode === 'case' ? current.panels.length : total;
    const at = mode === 'case' ? panelIdx : pageIdx;
    $('#bd-dots').innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i === at ? 'on' : i < at ? 'done' : ''}"></i>`).join('');
  }

  function applyMode() {
    view.classList.toggle('case', mode === 'case');
    $('#bd-mode').textContent = mode === 'case' ? '📄' : '🔍';
    $('#bd-mode').title = mode === 'case' ? 'Lire la page entière' : 'Lire case par case';
    if (mode === 'case') focusPanel(false); else pageMode();
  }

  function next() {
    if (mode === 'case' && panelIdx < current.panels.length - 1) { panelIdx++; focusPanel(); playSfx('tap'); return; }
    if (pageIdx < total - 1) {
      pageIdx++; panelIdx = 0; drawPage(1);
      if (mode === 'case') focusPanel(false); else pageMode();
      return;
    }
    finish();
  }
  function prev() {
    if (mode === 'case' && panelIdx > 0) { panelIdx--; focusPanel(); return; }
    if (pageIdx > 0) {
      pageIdx--; drawPage(-1);
      panelIdx = mode === 'case' ? current.panels.length - 1 : 0;
      if (mode === 'case') focusPanel(false); else pageMode();
    }
  }
  function finish() {
    stopAmbient();
    ambient = null;
    onEnd?.();
  }

  // --- Contrôles : tape (gauche = retour), glissé, clavier, boutons ---
  let x0 = null; let y0 = null; let moved = false;
  view.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; moved = false; });
  view.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0; const dy = e.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { (dx < 0 ? next : prev)(); return; }
    if (mode === 'page' || Math.abs(dy) > 12) return; // en mode page, on laisse défiler
    const r = view.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.28) prev(); else next();
  });
  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') prev();
  };
  document.addEventListener('keydown', onKey);
  const onResize = () => { if (mode === 'case') focusPanel(false); };
  window.addEventListener('resize', onResize);
  window.addEventListener('hashchange', () => {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    stopAmbient();
  }, { once: true });
  $('#bd-next').onclick = next;
  $('#bd-prev').onclick = prev;
  $('#bd-mode').onclick = () => {
    mode = mode === 'case' ? 'page' : 'case';
    try { localStorage.setItem(MODE_KEY, mode); } catch { /* ignoré */ }
    applyMode();
  };

  drawPage(1);
  applyMode();
}
