// =====================================================================
// views/quiz-hub.js — Onglet Quiz (Ren) : quiz, exercices, examen blanc
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { esc, mascot, subjectColor } from '../ui/ui.js';
import { isTranscribed } from '../core/importer.js';
import * as gen from '../core/generate.js';
import { runAI } from './course.js';

export async function render(el) {
  const [courses, quizzes, results, timer] = await Promise.all([
    db.getAll('courses'), db.getAll('quizzes'), db.getAll('results'), db.getSetting('quizTimer'),
  ]);
  const ready = courses.filter(isTranscribed).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const quizResults = results.filter((r) => r.type === 'quiz');
  const best = quizResults.length ? Math.max(...quizResults.map((r) => Math.round((100 * r.score) / r.total))) : null;
  const ren = CHARACTERS.ren;

  el.innerHTML = `
    <div class="screen-head"><h1>🎯 Quiz</h1></div>
    <div class="tile neon" style="--c:${ren.color};margin-bottom:12px">
      ${mascot('ren', { situation: quizResults.length ? 'encouragement' : 'arrivee', expression: 'joie', size: 100 })}
      <div class="row between" style="margin-top:10px">
        <span class="small muted">Ton record : <strong style="color:var(--text)">${best === null ? '—' : `${best} %`}</strong> · ${quizResults.length} duel(s)</span>
        <label class="check" style="padding:0;gap:8px"><span class="small">⏱️ Minuteur</span>
          <span class="switch"><input id="timer" type="checkbox" ${timer ? 'checked' : ''}><span></span></span></label>
      </div>
    </div>

    <div class="bento" style="margin-bottom:12px">
      <div class="tile" style="opacity:.75"><div class="label">Awa</div><h3 style="margin:4px 0">✍️ Exercices</h3><div class="tiny muted">Bientôt</div></div>
      <div class="tile" style="opacity:.75"><div class="label">Ren</div><h3 style="margin:4px 0">📝 Examen blanc</h3><div class="tiny muted">Bientôt</div></div>
    </div>

    <h2>⚔️ Choisis ton terrain</h2>
    ${ready.length ? '' : `<div class="tile">${mascot('ren', { text: 'Pas de cours, pas de duel. Ajoute un cours d’abord !', expression: 'surprise', size: 80 })}
      <a class="btn block" href="#/ajouter" style="margin-top:10px">➕ Ajouter un cours</a></div>`}
    ${ready.map((c) => {
      const qs = quizzes.filter((q) => q.courseId === c.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const rs = quizResults.filter((r) => r.courseId === c.id);
      const rec = rs.length ? Math.max(...rs.map((r) => Math.round((100 * r.score) / r.total))) : null;
      return `
      <div class="tile course-card" style="--c:${subjectColor(c.subject)};margin-bottom:10px">
        <div class="tiny" style="color:${subjectColor(c.subject)};font-weight:800">${esc(c.subject)}</div>
        <h3>${esc(c.title)}</h3>
        <div class="tiny muted">${qs.length} quiz · record ${rec === null ? '—' : `${rec} %`}</div>
        <div class="row" style="margin-top:10px">
          <button class="btn small pink grow" data-new="${c.id}">⚡ Nouveau quiz (10)</button>
          ${qs.length ? `<a class="btn small ghost grow" href="#/play/${qs[0].id}">🔁 Revanche</a>` : ''}
        </div>
      </div>`;
    }).join('')}
  `;

  el.querySelector('#timer').onchange = (e) => db.setSetting('quizTimer', e.target.checked);
  el.querySelectorAll('[data-new]').forEach((b) => {
    b.onclick = async () => {
      const course = await db.get('courses', b.dataset.new);
      runAI('Ren prépare son défi', 'ren', async (set) => {
        const quiz = await gen.generateQuiz(course, 10, set);
        location.hash = `#/play/${quiz.id}`;
      });
    };
  });
}
