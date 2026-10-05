// =====================================================================
// views/feynman.js — "EXPLIQUE-MOI COMME SI J'ÉTAIS NUL" (Ren)
// ---------------------------------------------------------------------
// #/feynman                 : choix du cours et de la notion
// #/feynman/ID_COURS/N      : Ren fait semblant de ne rien comprendre,
//   tu expliques par écrit → Ren pose 2-3 questions naïves (IA)
//   → note de compréhension, oublis, erreurs, correction, source.
// Expliquer = la meilleure façon de vérifier qu'on a compris.
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play, setExpression } from '../ui/character.js';
import { esc, rich, line, mascot, sourceHtml, showError, subjectColor } from '../ui/ui.js';
import { sound, vibrate, confetti, onomatopoeia, celebrate } from '../ui/fx.js';
import { power } from '../ui/powers.js';
import { runWithCouncil } from '../ui/council.js';
import { notionOf } from '../core/manga.js';
import { askQuestions, gradeExplanation } from '../core/feynman.js';
import { verdictOf } from '../core/generate.js';
import { addXp } from '../core/game.js';

const MIN_CHARS = 60; // explication trop courte = Ren refuse

export async function render(el, [courseId, idx]) {
  if (!courseId) return chooser(el);
  const course = await db.get('courses', courseId);
  const index = Number(idx) || 0;
  const notion = course && notionOf(course, index);
  if (!notion) { location.hash = '#/feynman'; return; }
  const ren = CHARACTERS.ren;
  let draft = '';
  try { draft = sessionStorage.getItem(`feynman:${courseId}:${index}`) || ''; } catch { /* ignoré */ }

  // --- Étape 1 : l'élève explique ---
  el.innerHTML = `
    <div class="fs feynman" style="--c:${ren.color};overflow-y:auto">
      <div class="fs-top"><a class="fs-close" href="#/feynman" style="display:grid;place-items:center;text-decoration:none">✕</a>
        <div class="grow" style="min-width:0"><div class="tiny dim">🧠 Explique-moi comme si j'étais nul</div><div class="manga-notion">${esc(notion.title)}</div></div></div>
      <div style="max-width:560px;width:100%;margin:0 auto">
        <div class="mascot" style="--c:${ren.color};margin:10px 0">${characterHTML('ren', { expression: 'surprise', size: 90 })}
          <div class="bubble"><span class="who">Ren</span><span class="say" id="say">${esc(line('ren', 'feynman_intro').replace('{notion}', notion.title))}</span></div></div>
        <div id="chat" class="feynman-chat"></div>
        <div id="zone">
          <textarea id="exp" rows="8" placeholder="Explique « ${esc(notion.title)} » avec tes mots, comme à un ami qui n'y connaît rien. Donne un exemple si tu peux.">${esc(draft)}</textarea>
          <div class="row between tiny muted" style="margin:4px 2px 10px"><span id="len"></span><span>Sans regarder le cours, c'est plus efficace 😉</span></div>
          <button class="btn pink block" id="send">📨 Envoyer à Ren</button>
        </div>
      </div>
    </div>`;
  const $ = (s) => el.querySelector(s);
  const renEl = $('.mascot .ch');
  const say = (t, expr, anim = 'bounce') => { $('#say').textContent = t; if (expr) setExpression(renEl, expr); play(renEl, anim); sound('bubble'); };
  const ta = $('#exp');
  const count = () => { $('#len').textContent = `${ta.value.trim().length} caractères${ta.value.trim().length < MIN_CHARS ? ` (min. ${MIN_CHARS})` : ''}`; };
  ta.oninput = () => { count(); try { sessionStorage.setItem(`feynman:${courseId}:${index}`, ta.value); } catch { /* ignoré */ } };
  count();

  $('#send').onclick = async () => {
    const explanation = ta.value.trim();
    if (explanation.length < MIN_CHARS) { say(line('ren', 'feynman_court'), 'clin', 'shake'); return; }
    $('#zone').innerHTML = '<div class="dots-loader" style="margin:16px auto"><i></i><i></i><i></i></div><p class="tiny muted center" id="st"></p>';
    $('#chat').innerHTML = `<div class="msg me">${rich(explanation)}</div>`;
    say(line('ren', 'feynman_attente'), 'reflexion');
    const shown = [];
    let res;
    try {
      res = await askQuestions(course, index, explanation, (t) => { const st = $('#st'); if (st) st.textContent = t; }, (q, i) => {
        if (shown[i]) return;
        shown[i] = true;
        if (i === 0) say('Hmm… attends, j’ai des questions.', 'surprise');
      });
    } catch (e) {
      $('#zone').innerHTML = '<button class="btn pink block" id="retry">🔁 Réessayer</button>';
      $('#retry').onclick = () => render(el, [courseId, idx]);
      showError(e);
      return;
    }
    answer(res, explanation);
  };

  // --- Étape 2 : Ren pose ses questions, l'élève répond une par une ---
  function answer(res, explanation) {
    const answers = [];
    say(res.reaction || line('ren', 'feynman_attente'), 'clin');
    const ask = (i) => {
      if (i >= res.questions.length) return grade(res.attempt, answers);
      $('#chat').insertAdjacentHTML('beforeend', `<div class="msg ren"><b>Ren :</b> ${esc(res.questions[i])}</div>`);
      sound('bubble');
      $('#zone').innerHTML = `
        <textarea id="ans" rows="4" placeholder="Ta réponse à Ren…"></textarea>
        <div class="row" style="gap:8px;margin-top:8px"><button class="btn ghost" id="idk">🤷 Je sais pas</button><button class="btn pink grow" id="ok">Répondre (${i + 1}/${res.questions.length})</button></div>`;
      const a = $('#ans');
      a.focus({ preventScroll: true });
      $('#zone').scrollIntoView({ behavior: 'smooth', block: 'end' });
      const reply = (txt) => {
        answers[i] = txt;
        $('#chat').insertAdjacentHTML('beforeend', `<div class="msg me">${txt ? esc(txt) : '<i>Je sais pas…</i>'}</div>`);
        say(i < res.questions.length - 1 ? line('ren', 'feynman_relance') : line('ren', 'feynman_attente'), i % 2 ? 'reflexion' : 'clin');
        ask(i + 1);
      };
      $('#ok').onclick = () => { if (!a.value.trim()) { a.focus(); return; } reply(a.value.trim()); };
      $('#idk').onclick = () => reply('');
    };
    ask(0);
  }

  // --- Étape 3 : la note (avec le conseil de correction) ---
  async function grade(attempt, answers) {
    $('#zone').innerHTML = '';
    let g;
    try {
      g = await runWithCouncil({
        owner: 'ren', title: 'Ren a-t-il compris ?',
        task: (set) => gradeExplanation(course, attempt, answers, set),
        toResult: (r) => ({ level: verdictOf(r.grade), label: `${r.grade}/20` }),
      });
    } catch (e) {
      $('#zone').innerHTML = '<button class="btn pink block" id="retry2">🔁 Relancer la note</button>';
      $('#retry2').onclick = () => grade(attempt, answers);
      showError(e);
      return;
    }
    try { sessionStorage.removeItem(`feynman:${courseId}:${index}`); } catch { /* ignoré */ }
    const good = g.grade >= 14;
    const mid = g.grade >= 10;
    const list = (title, items, cls) => (items?.length ? `<div class="fb ${cls}"><b>${title}</b><ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '');
    $('#zone').innerHTML = `
      <div class="tile center" style="border-color:${good ? 'var(--neon-green)' : mid ? 'var(--neon-yellow)' : 'var(--neon-pink)'};margin-top:10px">
        <div class="label">Compréhension</div>
        <div class="big" style="font-size:3.2rem">${g.grade}<span style="font-size:1.3rem">/20</span></div>
      </div>
      ${list('✅ Ce que tu as bien expliqué', g.understood, 'ok')}
      ${list('🕳️ Ce que tu as oublié', g.missed, 'warn')}
      ${list('❌ Ce qui était faux ou flou', g.wrong, 'bad')}
      <div class="explain" style="border-color:var(--neon-cyan)"><div class="tag" style="color:var(--neon-cyan)">📘 La bonne explication</div><div class="rich">${rich(g.correction)}</div></div>
      ${sourceHtml(course, g.source)}
      <div class="row" style="gap:8px;margin:12px 0 24px">
        <a class="btn ghost grow" href="#/manga/${courseId}/${index}">📖 Version manga</a>
        <button class="btn pink grow" id="again">🔁 Réexpliquer</button>
      </div>`;
    say(line('ren', good ? 'feynman_bonne' : mid ? 'feynman_moyenne' : 'feynman_faible'), good ? 'surprise' : mid ? 'clin' : 'encouragement', good ? 'shake' : 'bounce');
    $('#again').onclick = () => render(el, [courseId, idx]);
    if (good) { confetti(110, { color: CHARACTERS.ren.color }); onomatopoeia(g.grade >= 18 ? 'SUGOI!' : 'COMPRIS!', { color: CHARACTERS.ren.color }); power('ren', g.grade >= 18 ? 'strong' : 'light', { target: renEl }); }
    celebrate(await addXp(15 + g.grade, 'feynman'), $('#zone .big'));
  }
}

/** Choix du cours et de la notion. */
async function chooser(el) {
  const courses = (await db.getAll('courses')).filter((c) => c.summary?.length).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const done = (await db.getAll('results')).filter((r) => r.type === 'feynman' && r.grading);
  const bestOf = (cid, i) => Math.max(-1, ...done.filter((r) => r.courseId === cid && r.notionIndex === i).map((r) => r.score));
  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/quiz">←</a><h1 style="font-size:1.2rem">🧠 Explique-moi comme si j'étais nul</h1></div>
    <div class="tile neon" style="--c:${CHARACTERS.ren.color};margin-bottom:12px">
      ${mascot('ren', { situation: 'feynman_choix', expression: 'clin', size: 86 })}
      <p class="tiny muted" style="margin:10px 0 0">Si tu sais l'expliquer simplement, c'est que tu as compris. Ren va te poser des questions pièges.</p>
    </div>
    ${courses.length ? courses.map((c) => `
      <details class="tile notion-pick" style="--c:${subjectColor(c.subject)};margin-bottom:8px">
        <summary><strong>${esc(c.title)}</strong> <span class="tiny dim">· ${esc(c.subject)} · ${c.summary.length} notions</span></summary>
        ${c.summary.map((s, i) => {
          const b = bestOf(c.id, i);
          return `<a class="notion-row" href="#/feynman/${c.id}/${i}"><span class="grow">${esc(s.title)}</span>${b >= 0 ? `<span class="chip ${b >= 14 ? 'ok' : b >= 10 ? 'warn' : 'bad'}">${b}/20</span>` : '<span class="tiny dim">→</span>'}</a>`;
        }).join('')}
      </details>`).join('') : `<div class="tile">${mascot('nia', { text: 'Il faut d’abord un résumé de cours : ouvre un cours et crée son résumé avec moi !', size: 70 })}</div>`}`;
  const first = el.querySelector('details');
  if (first) first.open = true;
}

