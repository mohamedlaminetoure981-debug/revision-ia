// =====================================================================
// views/stats.js — Statistiques & badges avec Binta
// ---------------------------------------------------------------------
// - chiffres clés (niveau, série, réussite…)
// - activité des 14 derniers jours (XP par jour)
// - progression par matière (fiches maîtrisées)
// - notions les plus ratées
// - badges (gagnés / à débloquer)
// - récap de la semaine façon "Wrapped"
// Adresse : #/stats
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play } from '../ui/character.js';
import { esc, mascot, line, subjectColor } from '../ui/ui.js';
import { getProfileSync, currentStreak, levelInfo } from '../core/game.js';
import { today, addDays } from '../core/srs.js';
import { BADGES } from '../core/badges.js';
import { confetti, onomatopoeia, vibrate } from '../ui/fx.js';
import { offerStatus } from '../ui/status.js';
import { latexToText } from '../core/mathfix.js';

const DAY_NAMES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export async function render(el) {
  const p = getProfileSync();
  const [courses, cards, reviews, results] = await Promise.all([
    db.getAll('courses'), db.getAll('cards'), db.getAll('reviews'), db.getAll('results'),
  ]);
  const lv = levelInfo(p.xp);
  const streak = currentStreak(p);
  const success = reviews.length ? Math.round((100 * reviews.filter((r) => r.grade !== 'rate').length) / reviews.length) : null;
  const avg = (type) => {
    const rs = results.filter((r) => r.type === type);
    return rs.length ? Math.round((20 * rs.reduce((s, r) => s + r.score / r.total, 0)) / rs.length * 10) / 10 : null;
  };

  // --- Activité : XP des 14 derniers jours ---
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(i - 13);
    return { day: d, xp: p.xpByDay?.[d] || 0, label: DAY_NAMES[new Date(`${d}T12:00`).getDay()] };
  });
  const maxXp = Math.max(1, ...days.map((d) => d.xp));
  const bestDay = days.reduce((a, b) => (b.xp > a.xp ? b : a), days[0]);

  // --- Progression par matière : % de fiches "maîtrisées" (réussies 2 fois d'affilée ou plus) ---
  const subjects = {};
  for (const c of cards) {
    const s = (subjects[c.subject] ||= { total: 0, mastered: 0 });
    s.total++;
    if (c.reps >= 2) s.mastered++;
  }
  const subjectRows = Object.entries(subjects)
    .map(([name, s]) => ({ name, pct: Math.round((100 * s.mastered) / s.total), ...s }))
    .sort((a, b) => b.pct - a.pct);

  // --- Notions les plus ratées (fiches les plus souvent "à revoir" + questions de quiz ratées) ---
  const failsByCard = {};
  for (const r of reviews) if (r.grade === 'rate') failsByCard[r.cardId] = (failsByCard[r.cardId] || 0) + 1;
  const missedCards = Object.entries(failsByCard)
    .map(([id, n]) => ({ card: cards.find((c) => c.id === id), n }))
    .filter((x) => x.card)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);
  const missedQuiz = {};
  for (const r of results) for (const q of r.missed || []) missedQuiz[q] = (missedQuiz[q] || 0) + 1;
  const topQuiz = Object.entries(missedQuiz).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const earned = BADGES.filter((b) => p.badges?.[b.id]);

  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/profil">←</a><h1>📊 Mes stats</h1></div>
    <div class="tile neon" style="--c:${CHARACTERS.binta.color};margin-bottom:12px">
      ${mascot('binta', { situation: reviews.length ? 'arrivee' : 'encouragement', expression: 'joie', size: 96 })}
      <button class="btn pink block" id="wrapped" style="margin-top:12px">✨ Mon récap de la semaine</button>
    </div>

    <div class="bento" style="margin-bottom:12px">
      <div class="tile grad"><div class="label">Niveau</div><div class="big">${lv.level}</div><div class="tiny">${p.xp} XP au total</div></div>
      <div class="tile"><div class="label">Série</div><div class="big">🔥 ${streak}</div><div class="tiny muted">record ${p.bestStreak || 0} j</div></div>
      <div class="tile"><div class="label">Fiches réussies</div><div class="big">${success === null ? '—' : `${success}%`}</div><div class="tiny muted">${reviews.length} révisions</div></div>
      <div class="tile"><div class="label">Moyennes /20</div>
        <div class="small" style="margin-top:6px">🎯 Quiz : <strong>${avg('quiz') ?? '—'}</strong><br>✍️ Exos : <strong>${avg('exercise') ?? '—'}</strong><br>📝 Examens : <strong>${avg('exam') ?? '—'}</strong></div></div>
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">Activité · 14 derniers jours</h2>
      <p class="tiny muted" id="bar-info">XP gagnés par jour. Touche une barre pour voir le détail.</p>
      <div class="xp-chart" role="img" aria-label="XP gagnés par jour sur les 14 derniers jours">
        ${days.map((d) => `
          <button class="xp-col ${d.day === today() ? 'today' : ''}" data-day="${d.day}" data-xp="${d.xp}" aria-label="${d.day} : ${d.xp} XP">
            ${d === bestDay && d.xp ? `<span class="xp-top">${d.xp}</span>` : ''}
            <span class="xp-bar" style="height:${d.xp ? Math.max(4, (100 * d.xp) / maxXp) : 0}%"></span>
            <span class="xp-day">${d.label}</span>
          </button>`).join('')}
      </div>
      <details style="margin-top:8px"><summary class="tiny muted">Voir les chiffres</summary>
        <table class="data-table"><thead><tr><th>Jour</th><th>XP</th></tr></thead>
        <tbody>${days.map((d) => `<tr><td>${d.day}</td><td>${d.xp}</td></tr>`).join('')}</tbody></table></details>
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">Progression par matière</h2>
      <p class="tiny muted">Part des fiches maîtrisées (réussies au moins 2 fois de suite).</p>
      ${subjectRows.length ? subjectRows.map((s) => `
        <div class="subj-row">
          <div class="row between small"><strong>${esc(s.name)}</strong><span class="muted">${s.pct} % · ${s.mastered}/${s.total}</span></div>
          <div class="bar"><div style="width:${s.pct}%;background:${subjectColor(s.name)}"></div></div>
        </div>`).join('') : '<p class="small muted">Révise des fiches pour voir ta progression ici.</p>'}
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">Notions les plus ratées</h2>
      ${missedCards.length || topQuiz.length ? `
        ${missedCards.map((x) => `
          <a class="missed" href="#/course/${x.card.courseId}/fiches">
            <span class="chip bad">✗ ${x.n}</span><span class="grow small">${esc(x.card.question.slice(0, 120))}</span></a>`).join('')}
        ${topQuiz.map(([q, n]) => `
          <div class="missed"><span class="chip warn">🎯 ${n}</span><span class="grow small">${esc(latexToText(q).slice(0, 120))}</span></div>`).join('')}`
      : '<p class="small muted">Rien pour l’instant. Soit t’es un génie, soit faut réviser 😏</p>'}
    </div>

    <div class="tile" id="badges" style="margin-bottom:12px">
      <div class="row between"><h2 style="margin:0">Badges</h2><span class="chip neon" style="--c:var(--neon-pink)">${earned.length}/${BADGES.length}</span></div>
      <div class="badge-grid">
        ${BADGES.map((b) => `
          <div class="badge ${p.badges?.[b.id] ? 'won' : ''}" title="${esc(b.desc)}">
            <span class="ico">${p.badges?.[b.id] ? b.icon : '🔒'}</span>
            <b>${esc(b.name)}</b><small>${esc(b.desc)}</small>
          </div>`).join('')}
      </div>
    </div>
  `;

  // Détail d'une barre au toucher (et au survol grâce à aria-label/title).
  const info = el.querySelector('#bar-info');
  el.querySelectorAll('.xp-col').forEach((b) => {
    b.title = `${b.dataset.day} : ${b.dataset.xp} XP`;
    b.onclick = () => {
      el.querySelectorAll('.xp-col').forEach((x) => x.classList.toggle('sel', x === b));
      info.textContent = `${new Date(`${b.dataset.day}T12:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} : ${b.dataset.xp} XP`;
    };
  });

  el.querySelector('#wrapped').onclick = () => weeklyWrapped(el, { p, cards, reviews, results, courses });
}

/** Récap de la semaine façon "Wrapped", présenté par Binta. */
function weeklyWrapped(el, { p, cards, reviews, results }) {
  const since = addDays(-6);
  const week = Array.from({ length: 7 }, (_, i) => addDays(i - 6));
  const xp = week.reduce((s, d) => s + (p.xpByDay?.[d] || 0), 0);
  const activeDays = week.filter((d) => (p.xpByDay?.[d] || 0) > 0).length;
  const rev = reviews.filter((r) => r.day >= since);
  const res = results.filter((r) => r.date.slice(0, 10) >= since);
  const bySubject = {};
  for (const r of rev) bySubject[r.subject] = (bySubject[r.subject] || 0) + 1;
  const topSubject = Object.entries(bySubject).sort((a, b) => b[1] - a[1])[0];
  const fails = {};
  for (const r of rev) if (r.grade === 'rate') fails[r.cardId] = (fails[r.cardId] || 0) + 1;
  const worstId = Object.entries(fails).sort((a, b) => b[1] - a[1])[0]?.[0];
  const worst = cards.find((c) => c.id === worstId);
  const badgesWeek = BADGES.filter((b) => p.badges?.[b.id] && p.badges[b.id].slice(0, 10) >= since);

  const slides = [
    { cls: 'w1', html: `<div class="kicker">Ta semaine en XP</div><div class="huge">${xp}</div><div class="mid">points gagnés en 7 jours</div>` },
    { cls: 'w2', html: `<div class="kicker">Jours actifs</div><div class="huge">${activeDays}/7</div><div class="mid">${activeDays >= 6 ? 'Machine de guerre 🔥' : activeDays >= 3 ? 'Belle régularité !' : 'On vise plus la semaine prochaine ?'}</div>` },
    { cls: 'w3', html: `<div class="kicker">Tes révisions</div><div class="huge">${rev.length}</div><div class="mid">fiches swipées · ${res.length} quiz/exos/examens</div>` },
    { cls: 'w4', html: topSubject
      ? `<div class="kicker">Ta matière star</div><div class="mid" style="font-size:2rem">${esc(topSubject[0])}</div><div class="small">${topSubject[1]} révisions cette semaine</div>`
      : '<div class="kicker">Ta matière star</div><div class="mid">Pas encore de révision cette semaine</div>' },
    { cls: 'w1', html: worst
      ? `<div class="kicker">La notion qui te résiste</div><div class="mid" style="font-size:1.15rem;max-width:420px">« ${esc(worst.question.slice(0, 140))} »</div><div class="small">On la bat la semaine prochaine 💪</div>`
      : '<div class="kicker">Notion qui te résiste</div><div class="huge">0</div><div class="mid">Aucune. Respect.</div>' },
    { cls: 'w5', html: `${characterHTML('binta', { expression: 'celebration', size: 160 })}
        <div class="bubble top" style="max-width:340px;margin:10px auto;text-align:left;--c:${CHARACTERS.binta.color}"><span class="who">Binta</span>${esc(line('binta', 'fin'))}</div>
        <div class="mid">${badgesWeek.length ? `${badgesWeek.map((b) => b.icon).join(' ')} ${badgesWeek.length} badge(s) cette semaine` : 'Prochain badge : la semaine prochaine ?'}</div>
        <button class="btn pink block" id="wstatus" style="max-width:320px;margin:10px auto 0">📸 Mon récap en statut WhatsApp</button>
        <button class="btn block" id="wclose" style="max-width:320px;margin:8px auto 0">Fermer</button>` },
  ];
  let s = 0;
  const layer = document.createElement('div');
  document.body.appendChild(layer);
  const draw = () => {
    layer.innerHTML = `<div class="wrapped ${slides[s].cls}">
      <div class="bars">${slides.map((_, k) => `<i class="${k <= s ? 'on' : ''}"></i>`).join('')}</div>
      ${slides[s].html}${s < slides.length - 1 ? '<div class="tap">Tape pour continuer →</div>' : ''}</div>`;
    const w = layer.querySelector('.wrapped');
    if (s < slides.length - 1) {
      w.onclick = () => { s++; vibrate(8); draw(); };
    } else {
      confetti();
      onomatopoeia('WRAPPED!');
      play(w.querySelector('.ch'), 'signature');
      w.querySelector('#wclose').onclick = () => layer.remove();
      w.querySelector('#wstatus').onclick = (e) => {
        e.stopPropagation();
        layer.remove();
        offerStatus({ charId: 'binta', kicker: 'Ma semaine', big: `${xp} XP`, sub: `${activeDays}/7 jours actifs`,
          lines: [`${rev.length} fiches révisées`, topSubject ? `Matière star : ${topSubject[0]}` : ''] });
      };
    }
  };
  draw();
}
