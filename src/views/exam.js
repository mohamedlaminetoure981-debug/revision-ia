// =====================================================================
// views/exam.js — Examen blanc contre Ren
// ---------------------------------------------------------------------
//   #/exam        : choisir les cours + la durée, voir les anciens examens
//   #/exam/ID     : passer l'examen (chronométré) puis voir la correction
// Les réponses sont enregistrées au fur et à mesure (exam.session) :
// si l'appli se ferme ou si la connexion coupe, rien n'est perdu.
// Les QCM sont notés par l'appli, le reste par l'IA avec le barème.
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play } from '../ui/character.js';
import { esc, rich, sourceHtml, mascot, line, progress, showError, confirmBox, frDate, toast } from '../ui/ui.js';
import { isTranscribed } from '../core/importer.js';
import { generateExam, correctExam } from '../core/generate.js';
import { addXp, XP_RULES } from '../core/game.js';
import { celebrate, confetti, onomatopoeia, vibrate, sound } from '../ui/fx.js';
import { refresh } from '../main.js';
import { runWithCouncil } from '../ui/council.js';
import { power, suspendPowers, resumePowers } from '../ui/powers.js';
import { verdictOf } from '../core/generate.js';
import { offerStatus } from '../ui/status.js';

const KIND = { qcm: 'QCM', question: 'Question de cours', calcul: 'Calcul', exercice: 'Exercice' };
const VERDICT = { excellent: '🏆 Excellent', bon: '👍 Bon travail', moyen: '💪 Peut mieux faire', a_retravailler: '📚 À retravailler' };

export async function render(el, [examId]) {
  if (!examId) return renderSetup(el);
  const exam = await db.get('exams', examId);
  if (!exam) { location.hash = '#/exam'; return; }
  const courses = (await Promise.all(exam.courseIds.map((id) => db.get('courses', id)))).filter(Boolean);
  if (exam.session) return renderSession(el, exam, courses);
  if (exam.attempts?.length && !exam.showIntro) return renderResult(el, exam, courses, exam.attempts.at(-1));
  return renderIntro(el, exam);
}

// ---------------------------------------------------------------------
// Choix des cours et de la durée
// ---------------------------------------------------------------------
async function renderSetup(el) {
  const courses = (await db.getAll('courses')).filter(isTranscribed).sort((a, b) => a.subject.localeCompare(b.subject));
  const exams = (await db.getAll('exams')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/quiz">←</a><h1>📝 Examen blanc</h1></div>
    <div class="tile neon" style="--c:${CHARACTERS.ren.color};margin-bottom:12px">
      ${mascot('ren', { text: 'Un vrai sujet, un vrai chrono, un vrai barème. Tu te sens prêt(e) ?', expression: 'joie' })}
    </div>
    ${courses.length ? `
    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">1. Choisis le ou les cours</h2>
      ${courses.map((c) => `
        <label class="check" style="border-bottom:1px dashed var(--border)"><span>${esc(c.title)}<br><span class="tiny muted">${esc(c.subject)}</span></span>
          <span class="switch"><input type="checkbox" value="${c.id}"><span></span></span></label>`).join('')}
      <h2>2. Durée</h2>
      <div class="seg" id="dur"><button data-m="30">30 min</button><button data-m="60" class="active">1 h</button><button data-m="90">1 h 30</button><button data-m="120">2 h</button></div>
      <button class="btn pink block" id="gen" style="margin-top:14px">⚔️ Générer le sujet</button>
    </div>` : `<div class="tile">${mascot('mory', { text: 'Ajoute d’abord un cours, puis reviens défier Ren !', size: 70 })}<a class="btn block" href="#/ajouter" style="margin-top:10px">➕ Ajouter un cours</a></div>`}
    ${exams.length ? '<h2>Mes examens</h2>' : ''}
    ${exams.map((x) => {
      const best = x.attempts?.length ? Math.max(...x.attempts.map((a) => a.total)) : null;
      return `<a class="tile" href="#/exam/${x.id}" style="display:block;margin-bottom:8px;text-decoration:none;color:inherit">
        <div class="row nowrap"><div class="grow"><strong>${esc(x.title)}</strong>
          <div class="tiny muted">${frDate(x.createdAt)} · ${x.minutes} min · ${x.questions.length} questions</div></div>
          ${x.session ? '<span class="chip warn">en cours</span>' : best === null ? '<span class="chip">à faire</span>' : `<span class="chip ${best >= 10 ? 'ok' : 'bad'}">${best}/20</span>`}</div></a>`;
    }).join('')}`;

  let minutes = 60;
  el.querySelectorAll('#dur button').forEach((b) => {
    b.onclick = () => { minutes = Number(b.dataset.m); el.querySelectorAll('#dur button').forEach((x) => x.classList.toggle('active', x === b)); };
  });
  const genBtn = el.querySelector('#gen');
  if (genBtn) genBtn.onclick = async () => {
    const ids = [...el.querySelectorAll('input[type=checkbox]:checked')].map((i) => i.value);
    if (!ids.length) { toast('Choisis au moins un cours.', 'error'); return; }
    const chosen = courses.filter((c) => ids.includes(c.id));
    const pg = progress('Ren rédige ton sujet', 'ren');
    try {
      const exam = await generateExam(chosen, minutes, pg.set);
      pg.done();
      location.hash = `#/exam/${exam.id}`;
    } catch (e) {
      pg.done();
      showError(e, () => genBtn.click());
    }
  };
}

// ---------------------------------------------------------------------
// Avant de commencer
// ---------------------------------------------------------------------
function renderIntro(el, exam) {
  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/exam">←</a><h1 style="font-size:1.2rem">${esc(exam.title)}</h1></div>
    <div class="tile center" style="margin-bottom:12px">
      ${characterHTML('ren', { expression: 'concentration', size: 150 })}
      <div class="bubble top" style="text-align:left;margin:10px 0;--c:${CHARACTERS.ren.color}"><span class="who">Ren</span>${esc(line('ren', 'arrivee'))}</div>
      <div class="bento" style="margin:12px 0">
        <div class="tile"><div class="label">Durée</div><div class="big">${exam.minutes}<span style="font-size:1rem"> min</span></div></div>
        <div class="tile"><div class="label">Questions</div><div class="big">${exam.questions.length}</div></div>
      </div>
      <div class="rich small" style="text-align:left">${rich(exam.instructions)}</div>
      <p class="tiny muted">Tes réponses sont enregistrées automatiquement. Le chrono continue même si tu quittes l'écran.</p>
      <button class="btn pink block" id="start">⏱️ Commencer l'examen</button>
    </div>`;
  setTimeout(() => play(el.querySelector('.ch'), 'signature'), 400);
  el.querySelector('#start').onclick = async () => {
    exam.session = { startedAt: Date.now(), answers: {} };
    exam.showIntro = false;
    await db.put('exams', exam);
    vibrate([20, 40, 20]);
    refresh();
  };
}

// ---------------------------------------------------------------------
// Pendant l'examen (chronométré)
// ---------------------------------------------------------------------
function renderSession(el, exam, courses) {
  const s = exam.session;
  const endAt = s.startedAt + exam.minutes * 60000;
  el.innerHTML = `
    <div class="exam-timer tile glass" id="timer">
      <div class="row nowrap"><span class="grow"><strong>${esc(exam.title)}</strong></span><span class="display" id="clock">--:--</span></div>
      <div class="bar" style="margin-top:6px"><div id="tbar" style="width:100%;background:var(--grad-fire)"></div></div>
    </div>
    ${exam.questions.map((q, i) => `
      <div class="tile" style="margin-bottom:10px">
        <div class="row between tiny muted"><span>Question ${i + 1} · ${KIND[q.kind] || q.kind}</span><span class="chip neon" style="--c:${CHARACTERS.ren.color}">${q.points} pt${q.points > 1 ? 's' : ''}</span></div>
        <div class="rich" style="margin-top:6px">${rich(q.statement)}</div>
        ${q.kind === 'qcm'
          ? q.choices.map((c, k) => `<button class="choice ${s.answers[i] === k ? 'good' : ''}" data-q="${i}" data-k="${k}" style="animation:none"><span class="letter">${'ABCD'[k]}</span><span class="rich grow">${rich(c)}</span></button>`).join('')
          : `<textarea data-q="${i}" rows="${q.kind === 'exercice' ? 8 : 4}" placeholder="Ta réponse…">${esc(s.answers[i] || '')}</textarea>`}
      </div>`).join('')}
    <button class="btn pink block" id="submit" style="margin-bottom:20px">📤 Rendre ma copie</button>`;

  const save = () => db.put('exams', exam);
  el.querySelectorAll('button.choice').forEach((b) => {
    b.onclick = () => {
      const i = Number(b.dataset.q);
      s.answers[i] = Number(b.dataset.k);
      el.querySelectorAll(`button.choice[data-q="${i}"]`).forEach((x) => x.classList.toggle('good', x === b));
      vibrate(8);
      save();
    };
  });
  let t;
  el.querySelectorAll('textarea[data-q]').forEach((ta) => {
    ta.oninput = () => {
      s.answers[Number(ta.dataset.q)] = ta.value;
      clearTimeout(t);
      t = setTimeout(save, 700);
    };
  });

  // Chronomètre
  const clock = el.querySelector('#clock');
  const tbar = el.querySelector('#tbar');
  let done = false;
  const tick = () => {
    const left = Math.max(0, endAt - Date.now());
    const m = Math.floor(left / 60000);
    const sec = Math.floor((left % 60000) / 1000);
    clock.textContent = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    clock.style.color = left < 5 * 60000 ? 'var(--neon-pink)' : '';
    tbar.style.width = `${(100 * left) / (exam.minutes * 60000)}%`;
    if (left <= 0 && !done) { done = true; toast('⏱️ Temps écoulé ! Ren ramasse les copies.'); submit(); }
  };
  const timer = setInterval(tick, 1000);
  tick();
  suspendPowers(); // pas de pouvoir pendant l'examen
  window.addEventListener('hashchange', () => { clearInterval(timer); resumePowers(); }, { once: true });

  async function submit() {
    clearInterval(timer);
    await save();
    const answers = exam.questions.map((_, i) => s.answers[i] ?? null);
    // Était-ce le tout premier 20/20 à un examen blanc ? (pouvoir ultime)
    const allExams = await db.getAll('exams');
    const hadPerfect = allExams.some((x) => (x.attempts || []).some((a) => a.total >= 20));
    try {
      // La correction par l'IA se fait PENDANT la scène du conseil.
      const attempt = await runWithCouncil({
        owner: 'ren', title: 'Correction de ta copie',
        task: (onStatus) => correctExam(exam, courses, answers, onStatus),
        toResult: (a) => ({ level: verdictOf(a.total), label: `${a.total}/20` }),
      });
      exam.session = null;
      await db.put('exams', exam);
      resumePowers();
      // Récompense + résultat
      const res = await addXp(XP_RULES.exam + Math.round(attempt.total * 4));
      renderResult(el, exam, courses, attempt, res);
      if (attempt.total >= 20 && !hadPerfect) power('ren', 'ultimate', { sub: 'Premier examen blanc à 20/20 !', text: 'MAJOR!' });
      else if (attempt.total >= 10) power('ren', 'strong', { target: el.querySelector('.ch') });
    } catch (e) {
      // La copie reste enregistrée : on peut réessayer la correction.
      showError(new Error(`${e.message}\n\nTa copie est bien enregistrée : touche « Réessayer ».`), submit);
    }
  }
  el.querySelector('#submit').onclick = async () => {
    const empty = exam.questions.filter((_, i) => s.answers[i] === undefined || s.answers[i] === '').length;
    if (!(await confirmBox(empty ? `Il reste ${empty} question(s) sans réponse. Rendre quand même ?` : 'Rendre ta copie maintenant ?', 'Rendre'))) return;
    done = true;
    submit();
  };
}

// ---------------------------------------------------------------------
// Résultat et correction détaillée
// ---------------------------------------------------------------------
function renderResult(el, exam, courses, attempt, xpResult) {
  const total = attempt.total;
  const color = total >= 16 ? 'var(--neon-green)' : total >= 12 ? 'var(--neon-cyan)' : total >= 8 ? 'var(--neon-yellow)' : 'var(--neon-pink)';
  const courseOf = (q) => courses.find((c) => c.title === q.course) || courses[0];
  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/exam">←</a><h1 style="font-size:1.2rem">${esc(exam.title)}</h1></div>
    <div class="tile center speedlines" style="margin-bottom:12px;border-color:${color}">
      ${characterHTML('ren', { expression: total >= 14 ? 'surprise' : total >= 10 ? 'joie' : 'encouragement', size: 140 })}
      <div class="label">Ta note</div>
      <div class="big" style="font-size:3.6rem;color:${color}">${total}<span style="font-size:1.4rem">/20</span></div>
      <div class="display" style="margin:4px 0">${VERDICT[attempt.verdict] || ''}</div>
      <div class="bubble top" style="text-align:left;margin-top:10px;--c:${CHARACTERS.ren.color}"><span class="who">Ren</span>${esc(line('ren', total >= 10 ? 'reussite' : 'encouragement'))}</div>
      ${total >= 10 ? '<button class="btn pink block" id="status" style="margin-top:12px">📸 Partager en statut WhatsApp</button>' : ''}
    </div>
    <div class="tile neon" style="--c:${CHARACTERS.awa.color};margin-bottom:12px">
      <h3 style="margin-top:0">💡 Tes 3 priorités</h3>
      <ul class="small" style="padding-left:1.2em;margin:0">${attempt.advice.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
    </div>
    <h2>Correction détaillée</h2>
    ${exam.questions.map((q, i) => {
      const d = attempt.details[i];
      const a = attempt.answers[i];
      return `
      <div class="tile" style="margin-bottom:10px">
        <div class="row between tiny muted"><span>Question ${i + 1} · ${KIND[q.kind] || q.kind}</span>
          <span class="chip ${d.points >= q.points ? 'ok' : d.points > 0 ? 'warn' : 'bad'}">${d.points}/${q.points}</span></div>
        <div class="rich" style="margin-top:6px">${rich(q.statement)}</div>
        <div class="source"><strong>Ta réponse :</strong> ${q.kind === 'qcm' ? (a === null || a === undefined ? '—' : `${'ABCD'[a]}. ${esc(q.choices[a] || '')}`) : `<div class="rich">${rich(a || '—')}</div>`}</div>
        <div class="explain" style="border-color:var(--neon-cyan)"><div class="tag" style="color:var(--neon-cyan)">Correction</div><div class="rich">${rich(d.comment)}</div></div>
        <details><summary class="small" style="cursor:pointer">📋 Corrigé type</summary><div class="rich small">${rich(q.kind === 'qcm' ? `${'ABCD'[q.correctIndex]}. ${q.choices[q.correctIndex]}\n\n${q.expected}` : q.expected)}</div></details>
        ${courseOf(q) ? sourceHtml(courseOf(q), q.source) : ''}
      </div>`;
  el.querySelector('#status')?.addEventListener('click', () => offerStatus({
    kicker: 'Examen blanc', big: `${total}/20`, sub: exam.title.slice(0, 40), lines: [VERDICT[attempt.verdict] || 'Réussi !'],
  }));
    }).join('')}
    <button class="btn pink block" id="again" style="margin-bottom:20px">🔁 Repasser cet examen</button>`;
  el.querySelector('#again').onclick = async () => {
    exam.showIntro = true;
    await db.put('exams', exam);
    refresh();
  };
  window.scrollTo(0, 0);
  if (xpResult) {
    setTimeout(() => play(el.querySelector('.ch'), 'signature'), 400);
    if (total >= 16) { confetti(150); onomatopoeia('LÉGENDAIRE!'); sound('level'); } else if (total >= 10) { onomatopoeia('ADMIS!'); sound('good'); }
    vibrate([20, 40, 20]);
    celebrate(xpResult, el.querySelector('.big'));
  }
}
