// =====================================================================
// views/quiz-play.js — Duel de quiz contre Ren
// ---------------------------------------------------------------------
// Une question par écran, minuteur visuel optionnel (Réglages ou onglet
// Quiz), réaction animée de Ren à chaque réponse, puis récap final façon
// "Wrapped" (plusieurs écrans colorés) et correction détaillée.
// Adresse : #/play/ID_QUIZ
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play, setExpression } from '../ui/character.js';
import { esc, rich, sourceHtml, line, toast } from '../ui/ui.js';
import { addXp, XP_RULES, getProfileSync } from '../core/game.js';
import { makeDuel, shareDuel } from '../core/duel.js';
import { isCreator, creatorName } from '../core/creator.js';
import { celebrate, vibrate, sound, confetti, onomatopoeia } from '../ui/fx.js';
import { reportQuestion } from './report.js';
import { runWithCouncil } from '../ui/council.js';
import { power, suspendPowers, resumePowers } from '../ui/powers.js';
import { verdictOf } from '../core/generate.js';

const SECONDS_PER_QUESTION = 30; // durée du minuteur

export async function render(el, [quizId]) {
  const quiz = await db.get('quizzes', quizId);
  const course = quiz && (await db.get('courses', quiz.courseId));
  const ren = CHARACTERS.ren;
  if (!quiz || !course || !quiz.questions.length) {
    el.innerHTML = `<div class="fs" style="justify-content:center;text-align:center">${characterHTML('ren', { expression: 'surprise', size: 150 })}
      <p>Ce quiz n'existe plus.</p><a class="btn" href="#/quiz">Retour</a></div>`;
    return;
  }
  // Lancé depuis le plan de veille d'examen → on y retourne.
  let fromVeille = false;
  try { fromVeille = sessionStorage.getItem('veilleReturn') === '1'; } catch { /* ignoré */ }
  const back = fromVeille ? '#/veille' : `#/course/${course.id}/quiz`;
  const useTimer = await db.getSetting('quizTimer');
  const previous = (await db.getByIndex('results', 'courseId', course.id)).filter((r) => r.quizId === quiz.id);
  const record = previous.length ? Math.max(...previous.map((r) => r.score)) : null;

  let answers = []; // indice choisi (-1 = temps écoulé)
  let times = []; // secondes passées par question
  let i = 0;
  let timerId = null;
  let startedAt = 0;

  // --- Écran d'intro : le défi de Ren ---
  function intro() {
    el.innerHTML = `
      <div class="fs" style="--c:${ren.color};justify-content:center;text-align:center">
        <div class="fs-top" style="position:absolute;top:calc(10px + env(safe-area-inset-top));left:14px"><a class="fs-close" href="${back}" style="display:grid;place-items:center;text-decoration:none">✕</a></div>
        ${characterHTML('ren', { expression: 'joie', size: 200 })}
        <div class="bubble top" style="max-width:360px;margin:12px auto;text-align:left"><span class="who">Ren</span>${esc(record === null ? line('ren', 'arrivee') : `Ton record ici : ${record}/${quiz.questions.length}. Tu crois pouvoir le battre ?`)}</div>
        <h1 class="display">${quiz.questions.length} questions</h1>
        <p class="muted small">${esc(course.title)}${useTimer ? ` · ⏱️ ${SECONDS_PER_QUESTION} s par question` : ''}</p>
        <button class="btn pink block" id="go" style="max-width:360px;margin:10px auto 0">⚔️ Défi accepté !</button>
      </div>`;
    const renEl = el.querySelector('.ch');
    setTimeout(() => play(renEl, 'signature'), 500);
    el.querySelector('#go').onclick = () => {
      vibrate(20); sound('tap'); answers = []; times = []; i = 0;
      suspendPowers(); // pas de pouvoir pendant les questions
      question();
    };
  }

  // --- Une question ---
  function question() {
    const q = quiz.questions[i];
    el.innerHTML = `
      <div class="fs" style="--c:${ren.color}">
        <div class="fs-top">
          <a class="fs-close" href="${back}" style="display:grid;place-items:center;text-decoration:none">✕</a>
          <div class="grow"><div class="bar"><div style="width:${(100 * i) / quiz.questions.length}%;background:var(--grad-fire)"></div></div></div>
          <span class="tiny dim">${i + 1}/${quiz.questions.length}</span>
        </div>
        <div class="fs-body" style="overflow-y:auto">
          <div class="versus" style="margin-top:8px">
            <div class="mascot" style="flex:1">${characterHTML('ren', { expression: 'neutre', size: 64 })}
              <div class="bubble" style="margin-bottom:4px"><span class="who">Ren</span><span class="say">${esc(i === 0 ? 'Première question. Pas de pression… 😏' : line('ren', 'encouragement'))}</span></div></div>
          </div>
          ${useTimer ? '<div class="timer"><div id="tbar"></div></div>' : ''}
          <div class="q-card"><div class="q rich">${rich(q.question)}</div></div>
          ${q.choices.map((c, k) => `
            <button class="choice" data-k="${k}"><span class="letter">${'ABCDEFGH'[k]}</span><span class="rich grow">${rich(c)}</span></button>`).join('')}
          <div id="after"></div>
        </div>
      </div>`;
    el.querySelectorAll('.choice').forEach((b) => { b.onclick = () => choose(Number(b.dataset.k)); });
    startedAt = performance.now();
    if (useTimer) startTimer();
  }

  function startTimer() {
    const bar = el.querySelector('#tbar');
    const total = SECONDS_PER_QUESTION * 1000;
    clearInterval(timerId);
    timerId = setInterval(() => {
      const left = total - (performance.now() - startedAt);
      bar.style.transform = `scaleX(${Math.max(0, left / total)})`;
      if (left <= 0) { clearInterval(timerId); choose(-1); }
    }, 100);
  }

  // --- Réponse choisie : correction immédiate + réaction de Ren ---
  function choose(k) {
    if (answers[i] !== undefined) return;
    clearInterval(timerId);
    const q = quiz.questions[i];
    answers[i] = k;
    times[i] = (performance.now() - startedAt) / 1000;
    const good = k === q.correctIndex;
    el.querySelectorAll('.choice').forEach((b, j) => {
      b.disabled = true;
      if (j === q.correctIndex) b.classList.add('good');
      else if (j === k) b.classList.add('wrong');
    });
    const renEl = el.querySelector('.versus .ch');
    const sayEl = el.querySelector('.versus .say');
    if (good) {
      // Tu as juste : Ren est vexé (mais beau joueur).
      sayEl.textContent = line('ren', 'reussite');
      setExpression(renEl, 'surprise');
      play(renEl, 'shake');
      vibrate(15);
      sound('good');
    } else {
      // Tu t'es trompé : Ren te taquine.
      sayEl.textContent = k === -1 ? 'Temps écoulé ! Trop lent(e) 😏' : line('ren', 'echec');
      setExpression(renEl, 'joie');
      play(renEl, 'signature');
      vibrate([30, 40, 30]);
      sound('bad');
    }
    const last = i === quiz.questions.length - 1;
    el.querySelector('#after').innerHTML = `
      <div class="explain" style="border-color:${good ? 'var(--neon-green)' : 'var(--neon-pink)'}">
        <div class="tag" style="color:${good ? 'var(--neon-green)' : 'var(--neon-pink)'}">${good ? '✓ Bonne réponse' : '✗ Raté'}</div>
        <div class="rich">${rich(q.explanation)}</div>
        ${sourceHtml(course, q.source)}
      </div>
      <button class="btn block" id="next" style="margin:6px 0 20px">${last ? '🏁 Voir mon récap' : 'Question suivante →'}</button>`;
    el.querySelector('#next').onclick = () => { if (last) finish(); else { i++; question(); } };
    el.querySelector('#after').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // --- Fin : sauvegarde + XP + récap Wrapped ---
  async function finish() {
    const total = quiz.questions.length;
    const score = quiz.questions.filter((q, k) => answers[k] === q.correctIndex).length;
    const missed = quiz.questions.filter((q, k) => answers[k] !== q.correctIndex);
    // Meilleure série de bonnes réponses d'affilée.
    let bestRun = 0; let run = 0;
    quiz.questions.forEach((q, k) => { run = answers[k] === q.correctIndex ? run + 1 : 0; bestRun = Math.max(bestRun, run); });
    const avg = times.reduce((s, t) => s + t, 0) / times.length;

    await db.put('results', {
      id: db.newId(), type: 'quiz', courseId: course.id, subject: course.subject, quizId: quiz.id,
      score, total, date: new Date().toISOString(), avgTime: avg,
      missed: missed.map((q) => q.question), // notions ratées (statistiques)
    });
    // Le conseil de correction délibère avant d'annoncer la note.
    await runWithCouncil({
      owner: 'ren', title: 'Résultat du quiz', task: async () => null,
      toResult: () => ({ level: verdictOf((20 * score) / total), label: `${score}/${total}` }),
    });
    const xp = score * XP_RULES.quizGood + XP_RULES.quizDone + (score === total ? XP_RULES.quizPerfect : 0);
    const xpResult = await addXp(xp, 'quizzes');
    wrapped({ score, total, bestRun, avg, missed, xp, xpResult, beatRecord: record !== null && score > record });
  }

  /** Récap en plusieurs écrans colorés (on tape pour passer). */
  function wrapped(r) {
    const pct = Math.round((100 * r.score) / r.total);
    const slides = [
      { cls: 'w1', html: `<div class="kicker">Ton score contre Ren</div><div class="huge">${r.score}/${r.total}</div><div class="mid">${pct} %${r.beatRecord ? ' · NOUVEAU RECORD 🏆' : ''}</div>` },
      { cls: 'w2', html: `<div class="kicker">Ta meilleure série</div><div class="huge">🔥 ${r.bestRun}</div><div class="mid">bonne${r.bestRun > 1 ? 's' : ''} réponse${r.bestRun > 1 ? 's' : ''} d'affilée</div>` },
      { cls: 'w3', html: `<div class="kicker">Temps moyen par question</div><div class="huge">${Math.round(r.avg)} s</div><div class="mid">${r.avg < 10 ? 'Rapide comme l’éclair ⚡' : r.avg < 25 ? 'Réfléchi(e) et efficace' : 'Tu prends ton temps. Respect.'}</div>` },
      { cls: 'w4', html: r.missed.length
        ? `<div class="kicker">La notion à revoir</div><div class="mid" style="font-size:1.2rem;max-width:420px">« ${esc(r.missed[0].question.slice(0, 140))} »</div><div class="small">+ ${r.missed.length - 1} autre(s) dans la correction</div>`
        : '<div class="kicker">Notions à revoir</div><div class="huge">0</div><div class="mid">Ren est vexé. Parfait.</div>' },
      { cls: 'w5', html: `${characterHTML('ren', { expression: pct >= 70 ? 'surprise' : 'joie', size: 170 })}
          <div class="bubble top" style="max-width:340px;margin:12px auto;text-align:left;--c:${ren.color}"><span class="who">Ren</span>${esc(line('ren', 'fin'))}</div>
          <div class="display" style="font-size:1.6rem;color:var(--neon-green);margin:8px 0">+${r.xp} XP</div>
          <div class="row" style="justify-content:center">
            <button class="btn ghost" id="corr">📋 Correction</button>
            <button class="btn pink" id="again">⚔️ Revanche</button>
          </div>
          <button class="btn block" id="duel" style="max-width:340px;margin:10px auto 0">🤝 Défier un ami</button>
          <a class="linkbtn" href="${back}" style="display:inline-block;margin-top:10px">Retour au cours</a>` },
    ];
    let s = 0;
    const box = document.createElement('div');
    el.innerHTML = '';
    el.appendChild(box);
    const draw = () => {
      const sl = slides[s];
      box.innerHTML = `<div class="wrapped ${sl.cls}">
        <div class="bars">${slides.map((_, k) => `<i class="${k <= s ? 'on' : ''}"></i>`).join('')}</div>
        ${sl.html}
        ${s < slides.length - 1 ? '<div class="tap">Tape pour continuer →</div>' : ''}</div>`;
      const w = box.querySelector('.wrapped');
      if (s === 0 && pct >= 80) { confetti(); onomatopoeia(pct === 100 ? 'PARFAIT!' : 'YOSH!'); sound('level'); }
      if (s < slides.length - 1) {
        w.onclick = () => { s++; vibrate(8); draw(); };
      } else {
        play(w.querySelector('.ch'), 'signature');
        resumePowers();
        celebrate(r.xpResult, w.querySelector('.display'));
        // Aura : forte si 100 %, légère si 70 % ou plus.
        if (pct === 100) power('ren', 'strong', { target: w.querySelector('.ch') });
        else if (pct >= 70) power('ren', 'light', { target: w.querySelector('.ch') });
        w.querySelector('#corr').onclick = correction;
        w.querySelector('#again').onclick = intro;
        // Duel : tout le quiz voyage dans le lien (aucun serveur).
        w.querySelector('#duel').onclick = async (e) => {
          e.stopPropagation();
          const p = getProfileSync();
          const duel = makeDuel({ questions: quiz.questions, title: course.title, subject: course.subject, score: r.score,
            name: isCreator() ? creatorName() : p?.name, charId: p?.companion || 'kai' });
          const res = await shareDuel(duel);
          if (res !== 'cancelled') toast(line('ren', 'duel_envoi'), 'ok');
        };
      }
    };
    draw();
  }

  // --- Correction détaillée ---
  function correction() {
    const score = quiz.questions.filter((q, k) => answers[k] === q.correctIndex).length;
    el.innerHTML = `
      <div class="fs" style="--c:${ren.color};overflow-y:auto">
        <div class="fs-top"><a class="fs-close" href="${back}" style="display:grid;place-items:center;text-decoration:none">✕</a>
          <h2 style="margin:0" class="grow">Correction · ${score}/${quiz.questions.length}</h2></div>
        <div style="max-width:560px;width:100%;margin:0 auto">
        ${quiz.questions.map((q, k) => `
          <div class="q-card">
            <div class="row between tiny dim"><span>Question ${k + 1}</span><span>${answers[k] === q.correctIndex ? '✅ Juste' : answers[k] === -1 ? '⏱️ Temps écoulé' : '❌ Faux'}</span></div>
            <div class="q rich">${rich(q.question)}</div>
            ${q.choices.map((c, j) => `
              <div class="choice ${j === q.correctIndex ? 'good' : j === answers[k] ? 'wrong' : ''}" style="cursor:default;animation:none">
                <span class="letter">${'ABCDEFGH'[j]}</span><span class="rich grow">${rich(c)}</span>${j === answers[k] ? '<em class="tiny">(toi)</em>' : ''}</div>`).join('')}
            <div class="explain" style="border-color:var(--neon-cyan)"><div class="rich">${rich(q.explanation)}</div></div>
            ${sourceHtml(course, q.source)}
            <div class="row end" style="margin-top:8px"><button class="btn ghost small" data-report="${k}">🚩 Signaler une erreur</button></div>
          </div>`).join('')}
          <button class="btn pink block" id="again" style="margin:10px 0 30px">⚔️ Revanche</button>
        </div>
      </div>`;
    el.querySelector('#again').onclick = intro;
    el.querySelectorAll('[data-report]').forEach((b) => {
      const k = Number(b.dataset.report);
      b.onclick = () => reportQuestion(quiz, k, course, (result) => {
        if (result === 'deleted') { answers.splice(k, 1); times.splice(k, 1); }
        correction();
      });
    });
  }

  // Arrête le minuteur si on quitte l'écran (et relâche la pause des pouvoirs).
  window.addEventListener('hashchange', () => { clearInterval(timerId); resumePowers(); }, { once: true });
  intro();
}
