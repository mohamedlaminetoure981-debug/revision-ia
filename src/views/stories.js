// =====================================================================
// views/stories.js — Résumé en "stories" verticales avec Nia
// ---------------------------------------------------------------------
// Une notion par écran. Taper à droite (ou swiper vers la gauche) = suivant,
// taper à gauche = précédent. Barre de progression en haut.
// Les explications ajoutées par l'IA ont leur propre écran, marqué
// "💡 Explication ajoutée".
// Adresse : #/stories/ID_COURS
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play, setExpression } from '../ui/character.js';
import { esc, rich, line } from '../ui/ui.js';
import { vibrate, sound, confetti, onomatopoeia } from '../ui/fx.js';
import { rewardSummary } from './course.js';
import { unitLabel } from '../core/generate.js';
import { suspendPowers, resumePowers } from '../ui/powers.js';

const MAX_SLIDE_CHARS = 650; // au-delà, un bloc est découpé en plusieurs écrans

/** Transforme le résumé en liste d'écrans (slides). */
function buildSlides(course) {
  const slides = [];
  for (const s of course.summary) {
    for (const b of s.blocks) {
      // On découpe les longs blocs par paragraphes pour garder "une notion par écran".
      const paras = b.text.split(/\n{2,}/);
      let buf = '';
      const flush = () => { if (buf.trim()) slides.push({ section: s.title, pages: s.pages, kind: b.kind, text: buf.trim() }); buf = ''; };
      for (const p of paras) {
        if (buf && buf.length + p.length > MAX_SLIDE_CHARS) flush();
        buf += (buf ? '\n\n' : '') + p;
      }
      flush();
    }
  }
  return slides;
}

export async function render(el, [courseId]) {
  const course = await db.get('courses', courseId);
  if (!course?.summary) { location.hash = `#/course/${courseId}/resume`; return; }
  const slides = buildSlides(course);
  const nia = CHARACTERS.nia;
  let i = 0;
  let rewarded = false;

  el.innerHTML = `
    <div class="fs" style="--c:${nia.color}">
      <div class="fs-top">
        <button class="fs-close" id="close" aria-label="Fermer">✕</button>
        ${slides.length <= 30
          ? `<div class="story-bars">${slides.map(() => '<i></i>').join('')}</div>`
          : '<div class="story-bar-cont"><div></div></div>'}
        <span class="tiny dim" id="cnt"></span>
      </div>
      <div class="fs-body">
        <div class="story-stage" id="stage"></div>
        <div class="story-foot">
          ${characterHTML('nia', { expression: 'neutre', size: 64 })}
          <div class="bubble"><span class="who">Nia</span><span class="say">${esc(line('nia', 'arrivee'))}</span></div>
        </div>
      </div>
    </div>`;

  const stage = el.querySelector('#stage');
  const niaEl = el.querySelector('.story-foot .ch');
  const bubble = el.querySelector('.story-foot .say');
  const label = unitLabel(course);

  function show(dir = 1) {
    // Barre de progression
    el.querySelectorAll('.story-bars i').forEach((b, k) => { b.className = k < i ? 'done' : k === i ? 'now' : ''; });
    const cont = el.querySelector('.story-bar-cont > div');
    if (cont) cont.style.width = `${(100 * (i + 1)) / (slides.length + 1)}%`;
    el.querySelector('#cnt').textContent = i < slides.length ? `${i + 1}/${slides.length}` : '🏁';

    if (i >= slides.length) return showEnd();
    const s = slides[i];
    const isExplain = s.kind === 'explication';
    stage.innerHTML = `
      <div class="story-card ${isExplain ? 'explain-card' : ''} ${dir < 0 ? 'rev' : ''}">
        <span class="sec">${esc(s.section)}${s.pages?.length ? ` · ${label} ${s.pages.join(', ')}` : ''}</span>
        ${isExplain ? '<h2 style="color:var(--neon-pink)">💡 Explication ajoutée</h2>' : ''}
        <div class="rich">${rich(s.text)}</div>
      </div>
      <button class="story-nav prev" aria-label="Précédent"></button>
      <button class="story-nav next" aria-label="Suivant"></button>`;
    stage.querySelector('.prev').onclick = prev;
    stage.querySelector('.next').onclick = next;

    // Nia réagit : elle "explique" sur les écrans 💡, sinon parfois une réplique.
    if (isExplain) {
      setExpression(niaEl, 'reflexion');
      bubble.textContent = 'Ce passage était peu expliqué dans le cours, alors je t’ai ajouté ça.';
    } else if (i % 4 === 0 && i > 0) {
      setExpression(niaEl, 'joie');
      bubble.textContent = line('nia', 'encouragement');
    } else {
      setExpression(niaEl, 'neutre');
    }
  }

  async function showEnd() {
    stage.innerHTML = `
      <div class="story-card" style="text-align:center;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px">
        ${characterHTML('nia', { expression: 'celebration', size: 170 })}
        <h2 class="grad-text" style="font-size:1.6rem">Résumé terminé !</h2>
        <p class="muted">${esc(line('nia', 'reussite'))}</p>
        <a class="btn green block" href="#/course/${course.id}/fiches">🗂️ Passer aux fiches avec Sora</a>
        <a class="btn ghost block" href="#/course/${course.id}/resume">📄 Lecture complète</a>
        <button class="linkbtn" id="again">↺ Revoir depuis le début</button>
      </div>`;
    stage.querySelector('#again').onclick = () => { i = 0; show(); };
    bubble.textContent = line('nia', 'fin');
    setExpression(niaEl, 'joie');
    if (!rewarded) {
      rewarded = true;
      confetti();
      onomatopoeia('YOSH!');
      sound('level');
      vibrate([20, 40, 20]);
      await rewardSummary(stage.querySelector('.ch'));
    }
  }

  function next() {
    if (i >= slides.length) return;
    i++;
    vibrate(8);
    sound('tap');
    show(1);
  }
  function prev() {
    if (i === 0) { play(niaEl, 'shake'); return; }
    i--;
    show(-1);
  }

  // Swipe horizontal (doigt) + flèches du clavier.
  let x0 = null;
  stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 60) { e.preventDefault(); dx < 0 ? next() : prev(); }
    x0 = null;
  });
  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') next();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'Escape') location.hash = `#/course/${course.id}/resume`;
  };
  document.addEventListener('keydown', onKey);
  // Jamais de pouvoir pendant la lecture d'un résumé : ils attendent qu'on quitte l'écran.
  suspendPowers();
  window.addEventListener('hashchange', () => { document.removeEventListener('keydown', onKey); resumePowers(); }, { once: true });
  el.querySelector('#close').onclick = () => { location.hash = `#/course/${course.id}/resume`; };

  show();
  setTimeout(() => play(niaEl, 'signature'), 500);
}
