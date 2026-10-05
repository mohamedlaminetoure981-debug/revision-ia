// =====================================================================
// views/stories.js — Résumé en "stories" verticales avec Nia
// ---------------------------------------------------------------------
// Une notion par écran. Taper à droite (ou swiper vers la gauche) = suivant,
// taper à gauche = précédent. Barre de progression en haut.
// Les explications ajoutées par l'IA ont leur propre écran, marqué
// "💡 Explication ajoutée".
//
// ⚡ MODE DIRECT : si le résumé n'existe pas encore, il est créé EN STREAMING.
// La 1re story s'affiche dès que la 1re partie arrive (quelques secondes) ;
// les suivantes se remplissent pendant que tu lis. Ensuite, les fiches et
// le quiz se préparent tout seuls en arrière-plan (core/generate.js → prepareCourse).
// Adresse : #/stories/ID_COURS
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play, setExpression } from '../ui/character.js';
import { esc, rich, line, showError, mathText } from '../ui/ui.js';
import { vibrate, sound, confetti, onomatopoeia } from '../ui/fx.js';
import { rewardSummary } from './course.js';
import { unitLabel, prepareCourse } from '../core/generate.js';
import { getJob, onJob } from '../core/jobs.js';
import { suspendPowers, resumePowers } from '../ui/powers.js';

// Dernière story lue par cours (retour depuis la "Version manga" → même endroit).
const lastIndex = {};
const MAX_SLIDE_CHARS = 650; // au-delà, un bloc est découpé en plusieurs écrans

/** Transforme les parties du résumé en liste d'écrans (slides). */
function buildSlides(sections) {
  const slides = [];
  sections.forEach((s, si) => {
    if (!s) return;
    for (const b of s.blocks || []) {
      // On découpe les longs blocs par paragraphes pour garder "une notion par écran".
      const paras = String(b.text || '').split(/\n{2,}/);
      let buf = '';
      const flush = () => { if (buf.trim()) slides.push({ section: s.title, si, pages: s.pages, kind: b.kind, text: buf.trim() }); buf = ''; };
      for (const p of paras) {
        if (buf && buf.length + p.length > MAX_SLIDE_CHARS) flush();
        buf += (buf ? '\n\n' : '') + p;
      }
      flush();
    }
  });
  return slides;
}

export async function render(el, [courseId]) {
  let course = await db.get('courses', courseId);
  if (!course) { location.hash = '#/cours'; return; }
  const nia = CHARACTERS.nia;

  // Résumé déjà prêt → lecture normale. Sinon → génération en direct.
  let live = !course.summary;
  let job = null;
  let sections = course.summary || [];
  if (live) {
    job = getJob(courseId, 'summary');
    if (!job || job.status === 'error' || job.status === 'idle') job = prepareCourse(course);
    sections = job.data.sections || [];
  }
  let slides = buildSlides(sections);
  let i = !live && lastIndex[courseId] < slides.length ? lastIndex[courseId] : 0;
  let rewarded = false;

  el.innerHTML = `
    <div class="fs" style="--c:${nia.color}">
      <div class="fs-top">
        <button class="fs-close" id="close" aria-label="Fermer">✕</button>
        <div class="story-bar-cont"><div></div></div>
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

  function bar() {
    const total = slides.length + (live ? 1 : 0);
    el.querySelector('.story-bar-cont > div').style.width = `${total ? (100 * Math.min(i + 1, total)) / (total + (live ? 0 : 1)) : 0}%`;
    el.querySelector('#cnt').textContent = i < slides.length ? `${i + 1}/${slides.length}${live ? '…' : ''}` : live ? '…' : '🏁';
  }

  function show(dir = 1) {
    lastIndex[courseId] = i;
    bar();
    if (i >= slides.length) return live ? showWaiting() : showEnd();
    const s = slides[i];
    const isExplain = s.kind === 'explication';
    stage.innerHTML = `
      <div class="story-card ${isExplain ? 'explain-card' : ''} ${dir < 0 ? 'rev' : ''}">
        <span class="sec">${mathText(s.section)}${s.pages?.length ? ` · ${label} ${s.pages.join(', ')}` : ''}</span>
        ${isExplain ? '<h2 style="color:var(--neon-pink)">💡 Explication ajoutée</h2>' : ''}
        <div class="rich">${rich(s.text)}</div>
      </div>
      <button class="story-nav prev" aria-label="Précédent"></button>
      <button class="story-nav next" aria-label="Suivant"></button>
      ${live ? '' : `<a class="story-manga" href="#/manga/${course.id}/${s.si}" aria-label="Version manga de cette notion">📖 Version manga</a>`}`;
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

  /** Écran d'attente (la suite est en train d'arriver). */
  function showWaiting() {
    stage.innerHTML = `
      <div class="story-card" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:10px">
        ${characterHTML('nia', { expression: 'concentration', size: 120, enter: false })}
        <h2>${slides.length ? 'Nia écrit la suite…' : 'Nia lit ton cours…'}</h2>
        <div class="dots-loader"><i></i><i></i><i></i></div>
        <p class="tiny muted" id="live-status">${esc(job?.data?.status || 'Connexion à l’IA…')}</p>
      </div>
      <button class="story-nav prev" aria-label="Précédent"></button>`;
    stage.querySelector('.prev').onclick = prev;
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
      confetti(110, { color: CHARACTERS.nia.color });
      onomatopoeia('YOSH!', { color: CHARACTERS.nia.color });
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

  // --- Mode direct : on écoute la génération en streaming ---
  let stop = null;
  if (live) {
    stop = onJob(courseId, 'summary', async (j) => {
      const waiting = i >= slides.length; // l'élève attend la suite
      if (j.data.sections) slides = buildSlides(j.data.sections);
      if (j.status === 'done') {
        course = await db.get('courses', courseId);
        slides = buildSlides(course.summary || []);
        live = false;
        if (waiting) show(); else bar();
      } else if (j.status === 'error') {
        live = false;
        bar();
        showError(j.error, () => { location.reload(); });
        if (waiting) show();
      } else if (waiting && i < slides.length) {
        show(); // la story attendue vient d'arriver
      } else if (waiting) {
        const st = el.querySelector('#live-status');
        if (st && j.data.status) st.textContent = j.data.status;
      } else {
        bar();
      }
    });
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
  window.addEventListener('hashchange', () => { document.removeEventListener('keydown', onKey); resumePowers(); stop?.(); }, { once: true });
  el.querySelector('#close').onclick = () => { location.hash = `#/course/${course.id}/resume`; };

  show();
  setTimeout(() => play(niaEl, 'signature'), 500);
}
