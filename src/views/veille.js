// =====================================================================
// views/veille.js — MODE "VEILLE D'EXAMEN" (Kaï + toute l'équipe)
// ---------------------------------------------------------------------
// Adresse : #/veille
// 1. Choix : matière, temps disponible (1 à 6 h), heure de l'examen.
// 2. Plan intensif construit avec TES stats (core/veille.js) :
//    focus (dojo), pauses, fiches les plus ratées, quiz, mini examen final.
// 3. Ambiance de nuit ; l'équipe se charge en puissance à chaque bloc fini.
// 4. Mini examen final réussi (≥ 70 %) → pouvoir ULTIME.
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS, TEAM } from '../data/characters.js';
import { characterHTML, play } from '../ui/character.js';
import { esc, rich, line, mascot, showError, progress, confirmBox, toast, mathText } from '../ui/ui.js';
import { sound, vibrate, confetti, onomatopoeia, celebrate } from '../ui/fx.js';
import { power, suspendPowers, resumePowers } from '../ui/powers.js';
import { startAmbient, stopAmbient } from '../ui/sfx.js';
import { buildPlan, finalQuestions, loadVeille, saveVeille, nextAt, bedtime } from '../core/veille.js';
import { generateQuiz } from '../core/generate.js';
import { getProfileSync, addXp } from '../core/game.js';
import { t, locale } from '../i18n/index.js';

const ICON = { focus: '🥋', pause: '☕', cards: '🗂️', quiz: '🎯', final: '🏁' };
const hm = (t) => new Date(t).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });

/** Vérifie automatiquement les blocs terminés (dojo, quiz) depuis leur lancement. */
async function autoComplete(v) {
  const [focus, results] = await Promise.all([db.getAll('focus'), db.getAll('results')]);
  let changed = false;
  for (const b of v.plan) {
    if (b.done || !b.startedAt) continue;
    if (b.type === 'focus' && focus.some((f) => f.date >= b.startedAt && f.minutes >= 5)) b.done = changed = true;
    if (b.type === 'quiz' && results.some((r) => r.type === 'quiz' && r.quizId === b.quizId && r.date >= b.startedAt)) b.done = changed = true;
  }
  if (changed) await saveVeille(v);
  return changed;
}

export async function render(el, [mode]) {
  let v = await loadVeille();
  if (mode === 'nouveau' || !v || v.finishedAt) return setup(el, v);
  await autoComplete(v);
  return planView(el, v);
}

// ---------------------------------------------------------------------
// 1. Réglages
// ---------------------------------------------------------------------
async function setup(el, old) {
  const courses = await db.getAll('courses');
  const subjects = [...new Set(courses.map((c) => c.subject || 'Autre'))];
  const kai = CHARACTERS.kai;
  let hours = old?.hours || 3;
  el.innerHTML = `
    <div class="fs veille-night" style="--c:${kai.color};overflow-y:auto">
      <div class="fs-top"><a class="fs-close" href="#/quiz" style="display:grid;place-items:center;text-decoration:none">✕</a>
        <div class="grow"><div class="label">${t("Mode veille d'examen")}</div><strong>${t("🌙 La nuit avant l'exam")}</strong></div></div>
      <div style="max-width:460px;width:100%;margin:0 auto">
        <div class="mascot" style="--c:${kai.color};margin:10px 0">${characterHTML('kai', { expression: 'concentration', size: 84 })}
          <div class="bubble"><span class="who">Kaï</span><span class="say">${esc(line('kai', 'veille_intro'))}</span></div></div>
        ${subjects.length ? `
        <div class="tile">
          <label class="label" for="subj">${t("Matière de l'examen")}</label>
          <select id="subj">${subjects.map((s) => `<option ${old?.subject === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
          <div class="row between" style="margin-top:14px"><span>${t("⏳ Temps disponible")}</span>
            <div class="row nowrap stepper"><button class="btn ghost small" id="hminus">−</button><b id="hv" style="min-width:2.5em;text-align:center">${hours} h</b><button class="btn ghost small" id="hplus">+</button></div></div>
          <label class="label" for="exam" style="margin-top:14px;display:block">${t("🕗 Heure de l'examen")}</label>
          <input type="time" id="exam" value="${esc(old?.examTime || '08:00')}">
          <p class="tiny muted" id="sleep" style="margin:8px 0 0"></p>
        </div>
        <button class="btn pink block" id="go" style="margin:14px 0">${t("⚡ Construire mon plan")}</button>` : `<div class="tile">${mascot('mory', { text: t('Ajoute d’abord un cours : le plan se construit avec tes fiches et tes quiz.'), size: 70 })}<a class="btn block" href="#/ajouter" style="margin-top:10px">${t("➕ Ajouter un cours")}</a></div>`}
      </div>
    </div>`;
  if (!subjects.length) return;
  const $ = (s) => el.querySelector(s);
  const sleepInfo = () => {
    const examAt = nextAt($('#exam').value);
    const bed = bedtime(examAt);
    const end = Date.now() + hours * 3600e3;
    $('#sleep').innerHTML = `${t("Examen")} ${new Date(examAt).getDate() === new Date().getDate() ? t("aujourd'hui") : t('demain')} ${t('à')} ${hm(examAt)} ${t("· fin du plan vers")} <b>${hm(end)}</b> ${t("· coucher conseillé avant")} <b>${hm(bed)}</b>${end > bed ? ` <span style="color:var(--neon-pink)">${t("⚠️ trop tard !")}</span>` : ' ✓'}`;
  };
  const setH = (d) => { hours = Math.max(1, Math.min(6, hours + d)); $('#hv').textContent = `${hours} h`; sleepInfo(); };
  $("#hminus").onclick = () => setH(-1);
  $("#hplus").onclick = () => setH(1);
  $('#exam').oninput = sleepInfo;
  sleepInfo();
  $('#go').onclick = async () => {
    const subject = $('#subj').value;
    const examTime = $('#exam').value || '08:00';
    const examAt = nextAt(examTime);
    // Tidiane veille sur ton sommeil.
    const maxH = Math.floor((bedtime(examAt) - Date.now()) / 3600e3);
    if (Date.now() + hours * 3600e3 > bedtime(examAt) && maxH >= 1 && maxH < hours) {
      const shorter = await confirmBox(`${t("Tidiane : «")} ${line('tidiane', 'veille_sommeil')} ${t("» On réduit le plan à")} ${maxH} ${t("h pour que tu dormes assez ?")}`, `${t("Oui,")} ${maxH} h`);
      if (shorter) hours = maxH;
    } else if (Date.now() + hours * 3600e3 > bedtime(examAt)) {
      toast(`${t("🍵 Tidiane :")} ${line('tidiane', 'veille_sommeil')}`, 'info', 6000); // l'heure du coucher est déjà passée
    }
    const built = await buildPlan(subject, hours);
    const v = { subject, hours, examTime, examAt, createdAt: new Date().toISOString(), plan: built.plan, minutes: built.minutes, ultimate: false };
    await saveVeille(v);
    sound('energy', 2);
    vibrate([20, 30, 20]);
    planView(el, v);
  };
}

// ---------------------------------------------------------------------
// 2. Le plan
// ---------------------------------------------------------------------
function planView(el, v) {
  const done = v.plan.filter((b) => b.done).length;
  const pct = done / v.plan.length;
  const aura = pct >= 0.85 ? 3 : pct >= 0.5 ? 2 : pct >= 0.2 ? 1 : 0;
  const comp = getProfileSync()?.companion || 'kai';
  const next = v.plan.find((b) => !b.done);
  let clock = Date.now();
  el.innerHTML = `
    <div class="fs veille-night" style="--c:${CHARACTERS.kai.color};overflow-y:auto">
      <div class="fs-top"><a class="fs-close" href="#/quiz" style="display:grid;place-items:center;text-decoration:none">✕</a>
        <div class="grow"><div class="label">${t("Veille ·")} ${esc(v.subject)}</div><strong>🌙 ${done}/${v.plan.length} ${t("blocs · examen à")} ${hm(v.examAt)}</strong></div>
        <button class="icon-btn" id="amb" title="${t("Ambiance de nuit")}">🦗</button></div>
      <div style="max-width:520px;width:100%;margin:0 auto">
        <div class="veille-team" data-aura="${aura}">${TEAM.map((id) => characterHTML(id, { expression: aura >= 2 ? 'celebration' : 'concentration', size: 46, aura, enter: false })).join('')}</div>
        <div class="bar" style="margin:8px 0"><div style="width:${pct * 100}%;background:linear-gradient(90deg,#8B5CF6,#22D3EE,#FFD23F)"></div></div>
        <div class="mascot" style="--c:${CHARACTERS[comp].color};margin:6px 0 12px">${characterHTML(comp, { expression: 'joie', size: 64, aura })}
          <div class="bubble"><span class="who">${esc(CHARACTERS[comp].name)}</span><span class="say">${esc(done ? line('kai', 'veille_bloc') : line('kai', 'veille_intro'))}</span></div></div>
        <div class="veille-plan">
          ${v.plan.map((b) => {
            const start = clock; if (!b.done) clock += b.minutes * 6e4;
            return `<div class="vblock ${b.done ? 'done' : ''} ${b === next ? 'next' : ''} t-${b.type}">
              <span class="vtime">${b.done ? '' : hm(start)}</span><span class="vicon">${b.done ? '✅' : ICON[b.type]}</span>
              <span class="grow"><b>${esc(label(b))}</b><span class="tiny muted">${b.minutes} ${t("min")}${b.notion && b.type === 'focus' ? ` · ${mathText(b.notion)}` : ''}</span></span>
              ${b.done ? '' : `<button class="btn small ${b === next ? 'pink' : 'ghost'}" data-go="${b.id}">${b.type === 'pause' ? 'OK' : '▶'}</button>`}
            </div>`;
          }).join('')}
        </div>
        <div class="row" style="gap:8px;margin:14px 0 24px">
          <button class="btn ghost grow" id="reset">${t("🔄 Nouveau plan")}</button>
        </div>
      </div>
    </div>`;
  const $ = (s) => el.querySelector(s);
  let ambOn = false;
  $('#amb').onclick = () => { ambOn = !ambOn; ambOn ? startAmbient('nuit') : stopAmbient(); $('#amb').textContent = ambOn ? '🔇' : '🦗'; };
  window.addEventListener('hashchange', stopAmbient, { once: true });
  $('#reset').onclick = async () => { if (await confirmBox(t('Recommencer un nouveau plan ?'), t('Nouveau plan'))) setup(el, v); };
  el.querySelectorAll('[data-go]').forEach((btn) => { btn.onclick = () => launch(el, v, v.plan.find((b) => b.id === btn.dataset.go)); });
  // L'équipe se charge : aura forte quand un palier vient d'être franchi.
  if (aura && aura > (v.lastAura || 0)) {
    v.lastAura = aura;
    saveVeille(v);
    sound('energy', Math.min(aura, 2));
    setTimeout(() => power(comp, 'strong', { target: el.querySelector('.mascot .ch') }), 400);
  }
}

function label(b) {
  return { focus: t('Focus au dojo'), pause: t('Pause'), cards: `${t("Fiches fragiles (")}${b.cardIds?.length || 0})`, quiz: t('Quiz'), final: t('Mini examen final') }[b.type];
}

/** Lance un bloc. */
async function launch(el, v, b) {
  const markDone = async () => { b.done = true; await saveVeille(v); sound('good'); planView(el, v); };
  b.startedAt = new Date().toISOString();
  await saveVeille(v);
  try { sessionStorage.setItem('veilleReturn', '1'); } catch { /* ignoré */ }
  if (b.type === 'pause') return markDone();
  if (b.type === 'focus') { location.hash = '#/dojo'; return; }
  if (b.type === 'cards') { location.hash = `#/review/veille/${b.id}`; return; }
  if (b.type === 'quiz') {
    if (!b.quizId) {
      // Aucun quiz pour cette matière : l'IA en crée UN (gardé ensuite).
      const course = await db.get('courses', b.courseId) || (await db.getAll('courses')).find((c) => (c.subject || 'Autre') === v.subject);
      const pg = progress(t('Ren prépare un quiz'), 'ren');
      try { const q = await generateQuiz(course, 10, pg.set); pg.done(); v.plan.filter((x) => x.type === 'quiz' && !x.quizId).forEach((x) => { x.quizId = q.id; }); await saveVeille(v); } catch (e) { pg.done(); showError(e); return; }
    }
    location.hash = `#/play/${b.quizId}`;
    return;
  }
  if (b.type === 'final') return finalExam(el, v, b);
}

// ---------------------------------------------------------------------
// 3. Mini examen final
// ---------------------------------------------------------------------
async function finalExam(el, v, b) {
  let qs = await finalQuestions(v.subject, 8);
  if (qs.length < 4) {
    const course = (await db.getAll('courses')).find((c) => (c.subject || 'Autre') === v.subject);
    const pg = progress(t('Ren prépare l’examen final'), 'ren');
    try { await generateQuiz(course, 10, pg.set); pg.done(); } catch (e) { pg.done(); showError(e); return; }
    qs = await finalQuestions(v.subject, 8);
  }
  suspendPowers();
  let i = 0;
  let good = 0;
  const ask = () => {
    const q = qs[i];
    el.innerHTML = `
      <div class="fs veille-night" style="--c:${CHARACTERS.ren.color}">
        <div class="fs-top"><span class="grow"><strong>${t("🏁 Examen final")}</strong> <span class="tiny dim">${i + 1}/${qs.length}</span></span></div>
        <div class="fs-body" style="overflow-y:auto">
          <div class="bar" style="margin:6px 0 10px"><div style="width:${(100 * i) / qs.length}%;background:var(--grad-fire)"></div></div>
          <div class="q-card"><div class="q rich">${rich(q.question)}</div></div>
          ${q.choices.map((c, k) => `<button class="choice" data-k="${k}"><span class="letter">${'ABCDEFGH'[k]}</span><span class="rich grow">${rich(c)}</span></button>`).join('')}
          <div id="after"></div>
        </div>
      </div>`;
    el.querySelectorAll('.choice').forEach((btn) => {
      btn.onclick = () => {
        const k = Number(btn.dataset.k);
        const ok = k === q.correctIndex;
        if (ok) good++;
        el.querySelectorAll('.choice').forEach((x, j) => { x.disabled = true; if (j === q.correctIndex) x.classList.add('good'); else if (j === k) x.classList.add('wrong'); });
        sound(ok ? 'good' : 'bad');
        const last = i === qs.length - 1;
        el.querySelector('#after').innerHTML = `<div class="explain"><div class="rich">${rich(q.explanation || '')}</div></div>
          <button class="btn block" id="nx" style="margin:6px 0 20px">${last ? t('🏁 Résultat') : t('Suivante →')}</button>`;
        el.querySelector('#nx').onclick = () => { if (last) result(); else { i++; ask(); } };
      };
    });
  };
  const result = async () => {
    resumePowers();
    const pct = good / qs.length;
    const passed = pct >= 0.7;
    b.done = true;
    v.final = { score: good, total: qs.length, passed };
    v.finishedAt = new Date().toISOString();
    await saveVeille(v);
    const comp = getProfileSync()?.companion || 'kai';
    el.innerHTML = `
      <div class="fs veille-night ${passed ? 'dawn' : ''}" style="--c:${CHARACTERS[comp].color};justify-content:center;text-align:center;overflow-y:auto">
        <div class="veille-team" data-aura="3">${TEAM.map((id) => characterHTML(id, { expression: passed ? 'celebration' : 'encouragement', size: 46, aura: passed ? 3 : 1, enter: false })).join('')}</div>
        ${characterHTML(comp, { expression: passed ? 'celebration' : 'encouragement', size: 160, aura: passed ? 3 : 0 })}
        <h1 class="display ${passed ? 'grad-text' : ''}" style="margin:8px 0">${passed ? t('PUISSANCE MAXIMALE !') : t('PLAN TERMINÉ')}</h1>
        <p class="big">${good}/${qs.length}</p>
        <div class="mascot" style="--c:${CHARACTERS.tidiane.color};max-width:400px;margin:8px auto">${characterHTML(passed ? 'kai' : 'tidiane', { expression: 'joie', size: 60 })}
          <div class="bubble"><span class="who">${passed ? 'Kaï' : 'Tidiane'}</span><span class="say">${esc(line(passed ? 'kai' : 'tidiane', passed ? 'veille_reussi' : 'veille_sommeil'))}</span></div></div>
        <p class="small muted">${t("😴 Au lit avant")} <b>${hm(bedtime(v.examAt))}</b> ${t("· examen à")} ${hm(v.examAt)}${t(". Bonne chance !")}</p>
        <a class="btn block" href="#/" style="max-width:340px;margin:10px auto 20px">${t("🏠 Accueil")}</a>
      </div>`;
    if (passed) {
      sound('victory'); confetti(200); onomatopoeia(t('ULTIME!')); vibrate([40, 40, 40, 40, 120]);
      try { sessionStorage.removeItem('ultimateUsed'); } catch { /* le moment le plus important de la nuit */ }
      setTimeout(() => power(comp, 'ultimate', { sub: t('Prêt(e) pour l’examen !'), text: t('ULTIME!') }), 900);
    } else { sound('gong'); }
    celebrate(await addXp(40 + good * 5, 'veille'), el.querySelector('.big'));
  };
  ask();
}
