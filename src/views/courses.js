// =====================================================================
// views/courses.js — Mes cours, rangés par matière (une couleur par matière)
// =====================================================================

import * as db from '../core/db.js';
import { esc, mascot, subjectColor, subjectEmoji } from '../ui/ui.js';
import { isDue } from '../core/srs.js';
import { isTranscribed } from '../core/importer.js';

export async function render(el) {
  const [courses, cards] = await Promise.all([db.getAll('courses'), db.getAll('cards')]);

  // Statistiques par cours.
  const stats = {};
  for (const c of cards) {
    const s = (stats[c.courseId] ||= { total: 0, due: 0, flagged: 0 });
    s.total++;
    if (isDue(c)) s.due++;
    if (c.flagged) s.flagged++;
  }

  const bySubject = {};
  for (const c of courses) (bySubject[c.subject] ||= []).push(c);
  const subjects = Object.keys(bySubject).sort((a, b) => a.localeCompare(b, 'fr'));

  el.innerHTML = `
    <div class="screen-head"><h1>📚 Mes cours</h1></div>
    ${courses.length === 0 ? `
      <div class="tile empty">
        ${mascot('mory', { situation: 'encouragement', expression: 'joie' })}
        <a class="btn block" href="#/ajouter" style="margin-top:14px">➕ Ajouter mon premier cours</a>
      </div>` : ''}
    ${subjects.map((subj) => `
      <div class="subject-head" style="--c:${subjectColor(subj)}">${esc(subj)} <span class="dim">· ${bySubject[subj].length}</span></div>
      <div class="bento">
        ${bySubject[subj].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((c) => {
          const s = stats[c.id] || { total: 0, due: 0, flagged: 0 };
          return `
          <a class="tile course-card" href="#/course/${c.id}" style="--c:${subjectColor(subj)}">
            <span class="deco">${subjectEmoji(subj)}</span>
            <h3>${esc(c.title)}</h3>
            <div class="tiny muted">${c.totalUnits} ${c.sourceType === 'photos' ? 'photo(s)' : 'page(s)'} · ${s.total} fiche(s)</div>
            <div class="row" style="margin-top:8px;gap:5px">
              ${!isTranscribed(c) ? '<span class="chip warn">À finir</span>' : ''}
              ${s.due ? `<span class="chip neon">${s.due} à réviser</span>` : ''}
              ${s.flagged ? `<span class="chip bad">🚩 ${s.flagged}</span>` : ''}
              ${c.summary ? '<span class="chip ok">📖</span>' : ''}
            </div>
          </a>`;
        }).join('')}
      </div>`).join('')}
  `;
}
