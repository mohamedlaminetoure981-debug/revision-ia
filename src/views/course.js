// =====================================================================
// views/course.js — Page d'un cours, avec des onglets :
//   Résumé (Nia) | Fiches (Sora) | Quiz (Ren) | Exercices (Awa) | Source
// Adresse : #/course/ID/onglet
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { esc, rich, toast, modal, progress, showError, confirmBox, sourceHtml, frDate, mascot, subjectColor, mathText } from '../ui/ui.js';
import { isDue } from '../core/srs.js';
import { isTranscribed, transcribeCourse } from '../core/importer.js';
import * as gen from '../core/generate.js';
import { addXp, XP_RULES } from '../core/game.js';
import { celebrate } from '../ui/fx.js';
import { reportCard } from './report.js';
import { refresh } from '../main.js';
import { isRunning, onJob, getJob } from '../core/jobs.js';
import { t } from '../i18n/index.js';

// Onglets : identifiant (dans l'adresse) → titre + personnage responsable.
// ➕ Pour ajouter un onglet : ajoute une ligne ici ET une fonction dans TAB_RENDERERS.
const TABS = {
  resume: { label: t('📖 Résumé'), char: 'nia' },
  fiches: { label: t('🗂️ Fiches'), char: 'sora' },
  quiz: { label: t('🎯 Quiz'), char: 'ren' },
  exercices: { label: t('✍️ Exercices'), char: 'awa' },
  source: { label: t('📄 Source'), char: 'mory' },
};

/**
 * Lance une opération d'IA avec le chargement animé du perso,
 * affiche l'erreur éventuelle (Tidiane), puis redessine l'écran.
 */
export async function runAI(title, charId, fn) {
  const startHash = location.hash;
  const pg = progress(title, charId);
  try {
    await fn(pg.set);
    pg.done();
    toast(`✅ ${CHARACTERS[charId].name} ${t(": c'est prêt !")}`, 'ok');
  } catch (e) {
    pg.done();
    showError(e, () => runAI(title, charId, fn));
  }
  // On redessine l'écran, sauf si l'opération nous a déjà emmenés ailleurs.
  if (location.hash === startHash) refresh();
}

export async function render(el, [id, tab = 'resume']) {
  const course = await db.get('courses', id);
  if (!course) {
    el.innerHTML = `<div class="tile empty">${mascot('tidiane', { text: t('Ce cours est introuvable… Il a peut-être été supprimé.') })}<a class="btn" href="#/cours">${t("Mes cours")}</a></div>`;
    return;
  }
  const ready = isTranscribed(course);
  if (!ready) tab = 'source';
  if (!TABS[tab]) tab = 'resume';
  const color = subjectColor(course.subject);
  const tabColor = CHARACTERS[TABS[tab].char].color;

  el.innerHTML = `
    <div class="screen-head">
      <a class="back-btn" href="#/cours">←</a>
      <div class="grow">
        <div class="tiny" style="color:${color};font-weight:800;text-transform:uppercase;letter-spacing:.06em">${esc(course.subject)} · ${frDate(course.createdAt)}</div>
        <h1 style="font-size:1.25rem">${esc(course.title)}</h1>
      </div>
      <button class="icon-btn" id="edit" title="${t("Modifier")}">✏️</button>
      <button class="icon-btn" id="delete" title="${t("Supprimer")}">🗑️</button>
    </div>
    ${ready ? '' : `
      <div class="tile neon" style="--c:${CHARACTERS.mory.color};margin-bottom:12px">
        ${mascot('mory', { text: `${t("Transcription pas finie :")} ${course.pages.length}/${course.totalUnits}${t(". On reprend ?")}`, expression: 'encouragement', size: 80 })}
        <button class="btn block" id="resume-tr" style="margin-top:10px">${t("▶️ Reprendre la transcription")}</button>
      </div>`}
    <nav class="tabs" style="--c:${tabColor}">
      ${Object.entries(TABS).map(([k, t]) => `
        <a href="#/course/${id}/${k}" class="${k === tab ? 'active' : ''} ${!ready && k !== 'source' ? 'disabled' : ''}">${t.label}</a>`).join('')}
    </nav>
    <div id="tab"></div>
  `;

  el.querySelector('#edit').onclick = () => editCourse(course);
  el.querySelector('#delete').onclick = () => deleteCourse(course);
  const resumeBtn = el.querySelector('#resume-tr');
  if (resumeBtn) resumeBtn.onclick = () => runAI(t('Mory scanne ton cours'), 'mory', (set) => transcribeCourse(course, set));

  await TAB_RENDERERS[tab](el.querySelector('#tab'), course);
}

// ---------------------------------------------------------------------
// Onglet Résumé (Nia)
// ---------------------------------------------------------------------
async function renderSummary(el, course) {
  const partial = gen.isPartial(course, 'summary');
  if (!course.summary) {
    el.innerHTML = `
      <div class="tile">
        ${mascot('nia', { text: partial ? t('Mon résumé a été interrompu. On le termine ?') : t('Je te prépare le résumé en stories, partie par partie, sans rien oublier ?'), expression: 'reflexion' })}
        <button class="btn block" id="gen" style="margin-top:14px">✨ ${partial ? t('Continuer le résumé') : t('Créer le résumé')}</button>
      </div>`;
    // Les stories s'affichent au fur et à mesure (streaming) : pas d'attente.
    el.querySelector('#gen').onclick = () => { location.hash = `#/stories/${course.id}`; };
    return;
  }
  const label = gen.unitLabel(course);
  el.innerHTML = `
    <a class="tile grad speedlines" href="#/stories/${course.id}" style="margin-bottom:12px;display:block">
      <div class="row nowrap">
        <div class="grow"><div class="label">${t("Présenté par Nia")}</div>
          <h2 style="margin:4px 0">${t("▶ Lire en stories")}</h2>
          <div class="small">${t("Une notion par écran. Tape pour avancer.")}</div></div>
        <span style="font-size:2.4rem">📱</span>
      </div>
    </a>
    <div class="row between" style="margin:14px 0 6px"><h2 style="margin:0">${t("Lecture complète")}</h2>
      <button class="linkbtn small" id="regen">${t("🔄 Refaire")}</button></div>
    <p class="tiny dim">${t("Les blocs")} <strong style="color:var(--neon-pink)">${t("💡 Explication ajoutée")}</strong> ${t("viennent de Nia, pas du cours original.")}</p>
    ${course.summary.map((s, si) => `
      <section class="tile" style="margin-bottom:10px">
        <div class="row between nowrap"><h2 style="margin:0">${mathText(s.title)}</h2>
          <span class="row nowrap" style="gap:6px"><a class="btn small ghost manga-btn" href="#/feynman/${course.id}/${si}" title="${t("Explique cette notion à Ren")}">🧠</a>
          <a class="btn small manga-btn" href="#/manga/${course.id}/${si}" title="${t("Version manga")}">${t("📖 Manga")}</a></span></div>
        ${s.pages?.length ? `<div class="tiny dim">${label}${s.pages.length > 1 ? 's' : ''} ${s.pages.join(', ')}</div>` : ''}
        ${s.blocks.map((b) => (b.kind === 'explication'
          ? `<div class="explain"><div class="tag">${t("💡 Explication ajoutée")}</div><div class="rich">${rich(b.text)}</div></div>`
          : `<div class="rich">${rich(b.text)}</div>`)).join('')}
      </section>`).join('')}
  `;
  el.querySelector('#regen').onclick = async () => {
    if (!(await confirmBox(t('Remplacer le résumé actuel par un nouveau ?'), t('Refaire')))) return;
    await gen.resetSummary(course);
    location.hash = `#/stories/${course.id}`;
  };
}

/**
 * Bandeau "préparation en arrière-plan" (fiches ou quiz en cours de création).
 * L'écran se met à jour tout seul quand la tâche avance ou se termine.
 */
function backgroundBanner(el, course, kind, charId, text) {
  if (!isRunning(course.id, kind)) return '';
  const tab = location.hash;
  const stop = onJob(course.id, kind, (j) => {
    if (location.hash !== tab) { stop(); return; } // on a quitté l'écran
    const st = el.querySelector(`#bg-${kind}`);
    if (st && j.data.status) st.textContent = j.data.status;
    if (j.status !== 'running') { stop(); refresh(); }
  });
  return `<div class="tile neon" style="--c:${CHARACTERS[charId].color};margin-bottom:12px">
    ${mascot(charId, { text, expression: 'concentration', size: 70 })}
    <div class="dots-loader" style="margin-left:82px"><i></i><i></i><i></i></div>
    <p class="tiny muted" id="bg-${kind}" style="margin:6px 0 0">${esc(getJob(course.id, kind)?.data?.status || t('En cours…'))}</p>
  </div>`;
}

/** Rang d'une partie dans le cours : « 3. Somme… » → 3 ; sinon section du résumé qui lui ressemble le plus. */
function partRank(name, summary, k) {
  const num = String(name || '').match(/^\s*(?:partie\s*)?(\d+)/i);
  if (num) return +num[1];
  const words = (x) => new Set(String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z]{4,}/g) || []);
  const w = words(name);
  let best = -1; let score = 0;
  (summary || []).forEach((sec, i) => {
    const sw = words(sec.title);
    const n = [...w].filter((x) => sw.has(x)).length;
    if (n > score) { score = n; best = i; }
  });
  return best >= 0 ? best + 1 + k / 1000 : 1000 + k;
}

// ---------------------------------------------------------------------
// Onglet Fiches (Sora)
// ---------------------------------------------------------------------
async function renderCards(el, course) {
  const cards = (await db.getByIndex('cards', 'courseId', course.id))
    .sort((a, b) => ((a.chunk ?? 0) - (b.chunk ?? 0)) || ((a.order ?? 0) - (b.order ?? 0)) || a.createdAt.localeCompare(b.createdAt));
  const partial = gen.isPartial(course, 'cards');
  const due = cards.filter((c) => isDue(c)).length;
  const flagged = cards.filter((c) => c.flagged);

  // Fiches en préparation automatique (après le résumé) ?
  const bg = backgroundBanner(el, course, 'cards', 'sora', t('Je prépare tes fiches en arrière-plan. Elles arrivent !'));
  if (bg && !cards.length) { el.innerHTML = bg; return; }

  if (!cards.length && !partial) {
    el.innerHTML = `
      <div class="tile">
        ${mascot('sora', { text: t('Je fabrique des fiches sur TOUTES les parties du cours ? Ensuite, on swipe !'), expression: 'joie' })}
        <button class="btn block green" id="gen" style="margin-top:14px">${t("✨ Créer les fiches")}</button>
      </div>`;
    el.querySelector('#gen').onclick = () => runAI(t('Sora prépare tes fiches'), 'sora', (set) => gen.generateCards(course, set));
    return;
  }

  // Regroupe les fiches par partie du cours.
  const parts = [];
  for (const c of cards.filter((x) => !x.flagged)) {
    let p = parts.find((x) => x.name === c.part);
    if (!p) parts.push((p = { name: c.part, cards: [] }));
    p.cards.push(c);
  }
  // Parties dans l'ordre du cours (fiches anciennes sans ordre enregistré : numéro de la partie,
  // sinon position de la partie la plus proche dans le résumé).
  parts.forEach((p, k) => { p.rank = partRank(p.name, course.summary, k); });
  parts.sort((a, b) => a.rank - b.rank);

  const cardHtml = (c) => `
    <details class="tile" style="margin-bottom:8px;${c.flagged ? 'border-color:var(--bad)' : ''}">
      <summary style="cursor:pointer;font-weight:700"><span class="rich" style="display:inline">${rich(c.question)}</span>
        ${c.flagged ? ` <span class="chip bad">${t("🚩 fausse")}</span>` : ''}${c.edited ? ` <span class="chip">${t("✏️ corrigée")}</span>` : ''}${c.check === 'ok' ? ` <span class="chip ok">${t("🔍 vérifiée")}</span>` : ''}${c.check === 'corrige' ? ` <span class="chip warn">${t("🔍 corrigée par la vérif")}</span>` : ''}</summary>
      ${c.checkComment && c.check !== 'ok' ? `<p class="tiny muted">🔍 ${mathText(c.checkComment)}</p>` : ''}
      <div class="rich" style="margin-top:8px">${rich(c.answer)}</div>
      ${sourceHtml(course, c.source)}
      <div class="row between tiny dim" style="margin-top:8px">
        <span>${t("Prochaine révision :")} ${c.flagged ? '—' : esc(c.due)}</span>
        <button class="btn ghost small" data-report="${c.id}">${t("🚩 Signaler une erreur")}</button>
      </div>
    </details>`;

  el.innerHTML = `
    ${bg}
    ${partial && !bg ? `<div class="tile neon" style="--c:var(--neon-yellow);margin-bottom:12px">${t("⚠️ Création des fiches interrompue.")}
      <button class="btn small" id="continue" style="margin-top:8px">${t("▶️ Continuer")}</button></div>` : ''}
    <div class="bento" style="margin-bottom:12px">
      <div class="tile"><div class="label">${t("Fiches")}</div><div class="big">${cards.length}</div></div>
      <div class="tile"><div class="label">${t("À réviser")}</div><div class="big" style="color:var(--neon-green)">${due}</div></div>
      ${due ? `<a class="btn block span-2 green pulse" href="#/review/${course.id}">${t("⚡ Swiper avec Sora")}</a>` : `<div class="tile span-2 center small">${t("Tout est à jour pour ce cours ✓")}</div>`}
    </div>
    ${flagged.length ? `<h2>${t("🚩 Fiches à corriger")}</h2>${flagged.map(cardHtml).join('')}` : ''}
    ${parts.map((p) => `<h2 style="margin-top:16px">${mathText(p.name)}</h2>${p.cards.map(cardHtml).join('')}`).join('')}
    <button class="btn ghost block" id="regen" style="margin-top:12px">${t("🔄 Refaire toutes les fiches")}</button>
  `;

  const cont = el.querySelector('#continue');
  if (cont) cont.onclick = () => runAI(t('Sora prépare tes fiches'), 'sora', (set) => gen.generateCards(course, set));
  el.querySelectorAll('[data-report]').forEach((b) => {
    b.onclick = (e) => {
      e.preventDefault();
      reportCard(cards.find((c) => c.id === b.dataset.report), course, refresh);
    };
  });
  el.querySelector('#regen').onclick = async () => {
    if (!(await confirmBox(t('Supprimer toutes les fiches de ce cours (et leur progression) pour en créer de nouvelles ?'), t('Refaire')))) return;
    await gen.resetCards(course);
    runAI(t('Sora prépare tes fiches'), 'sora', (set) => gen.generateCards(course, set));
  };
}

// ---------------------------------------------------------------------
// Onglet Quiz (Ren)
// ---------------------------------------------------------------------
async function renderQuizzes(el, course) {
  const quizzes = (await db.getByIndex('quizzes', 'courseId', course.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const results = (await db.getByIndex('results', 'courseId', course.id)).filter((r) => r.type === 'quiz');

  el.innerHTML = `
    ${backgroundBanner(el, course, 'quiz', 'ren', t('Je te prépare un quiz en arrière-plan. Échauffe-toi…'))}
    <div class="tile" style="margin-bottom:12px">
      ${mascot('ren', { situation: 'arrivee', expression: 'joie' })}
      <div class="seg" id="count" style="margin-top:14px">
        <button data-n="5">${t("5 questions")}</button><button data-n="10" class="active">10</button><button data-n="20">20</button>
      </div>
      <button class="btn block pink" id="gen" style="margin-top:10px">${t("⚔️ Nouveau quiz")}</button>
    </div>
    ${quizzes.map((q, i) => {
      const rs = results.filter((r) => r.quizId === q.id);
      const best = rs.length ? Math.max(...rs.map((r) => Math.round((100 * r.score) / r.total))) : null;
      return `
      <div class="tile row nowrap" style="margin-bottom:8px">
        <div class="grow"><strong>${t("Quiz")} ${quizzes.length - i}</strong> · ${q.questions.length} ${t("questions")}
          <div class="tiny dim">${frDate(q.createdAt)} · ${rs.length ? `${t("record")} ${best} %` : t('jamais tenté')}</div></div>
        <button class="icon-btn" data-del="${q.id}" title="${t("Supprimer")}">🗑️</button>
        <a class="btn small" href="#/play/${q.id}">${rs.length ? t('Revanche') : 'GO'}</a>
      </div>`;
    }).join('')}
  `;
  let count = 10;
  el.querySelectorAll('#count button').forEach((b) => {
    b.onclick = () => {
      count = Number(b.dataset.n);
      el.querySelectorAll('#count button').forEach((x) => x.classList.toggle('active', x === b));
    };
  });
  el.querySelector('#gen').onclick = () => runAI(t('Ren prépare son défi'), 'ren', async (set) => {
    const quiz = await gen.generateQuiz(course, count, set);
    location.hash = `#/play/${quiz.id}`;
  });
  el.querySelectorAll('[data-del]').forEach((b) => {
    b.onclick = async () => {
      if (!(await confirmBox(t('Supprimer ce quiz ?'), t('Supprimer')))) return;
      await db.del('quizzes', b.dataset.del);
      refresh();
    };
  });
}

// ---------------------------------------------------------------------
// Onglet Exercices (Awa)
// ---------------------------------------------------------------------
async function renderExercises(el, course) {
  const exos = (await db.getByIndex('exercises', 'courseId', course.id)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const DIFF = { facile: '🟢', moyen: '🟡', difficile: '🔴' };
  el.innerHTML = `
    <div class="tile" style="margin-bottom:12px">
      ${mascot('awa', { situation: exos.length ? 'encouragement' : 'arrivee', expression: 'concentration' })}
      <div class="seg" id="count" style="margin-top:14px">
        <button data-n="3" class="active">${t("3 exercices")}</button><button data-n="5">5</button>
      </div>
      <button class="btn block" id="gen" style="margin-top:10px;background:${CHARACTERS.awa.color};color:var(--on-neon)">${t("✍️ Nouveaux exercices")}</button>
    </div>
    ${exos.map((x) => {
      const best = x.attempts?.length ? Math.max(...x.attempts.map((a) => a.correction.grade)) : null;
      return `
      <a class="tile" href="#/exo/${x.id}" style="display:block;margin-bottom:8px;text-decoration:none;color:inherit">
        <div class="row nowrap"><span>${DIFF[x.difficulty] || '•'}</span><strong class="grow">${mathText(x.title)}</strong>
          ${best === null ? `<span class="chip">${t("à faire")}</span>` : `<span class="chip ${best >= 10 ? 'ok' : 'warn'}">${best}/20</span>`}</div>
      </a>`;
    }).join('')}`;
  let count = 3;
  el.querySelectorAll('#count button').forEach((b) => {
    b.onclick = () => { count = Number(b.dataset.n); el.querySelectorAll('#count button').forEach((x) => x.classList.toggle('active', x === b)); };
  });
  el.querySelector('#gen').onclick = () => runAI(t('Awa prépare tes exercices'), 'awa', (set) => gen.generateExercises(course, count, set));
}

// ---------------------------------------------------------------------
// Onglet Source (texte transcrit + photos)
// ---------------------------------------------------------------------
async function renderSource(el, course) {
  const images = await db.getByIndex('images', 'courseId', course.id);
  const label = gen.unitLabel(course);
  const nums = [...new Set([...course.pages.map((p) => p.n), ...images.map((i) => i.n)])].sort((a, b) => a - b);
  el.innerHTML = `
    <p class="small muted">${t("Le texte du cours utilisé par l'IA. Toutes les fiches et questions citent ce texte.")}</p>
    ${nums.map((n) => {
      const page = course.pages.find((p) => p.n === n);
      const img = images.find((i) => i.n === n);
      return `
      <div class="tile" style="margin-bottom:10px">
        <div class="row between"><h3 style="margin:0">${label} ${n}</h3>
          ${img ? `<button class="btn ghost small" data-img="${n}">${t("🖼️ Voir l'image")}</button>` : ''}</div>
        <div id="img-${n}"></div>
        ${page ? `<div class="rich">${rich(page.text)}</div>` : `<p class="dim">${t("⏳ Pas encore transcrit.")}</p>`}
      </div>`;
    }).join('')}
  `;
  el.querySelectorAll('[data-img]').forEach((b) => {
    b.onclick = () => {
      const n = Number(b.dataset.img);
      const box = el.querySelector(`#img-${n}`);
      if (box.innerHTML) { box.innerHTML = ''; return; }
      const url = URL.createObjectURL(images.find((i) => i.n === n).blob);
      box.innerHTML = `<img src="${url}" alt="${label} ${n}" style="width:100%;border-radius:14px;margin:8px 0">`;
    };
  });
}

const TAB_RENDERERS = {
  resume: renderSummary,
  fiches: renderCards,
  quiz: renderQuizzes,
  exercices: renderExercises,
  source: renderSource,
};

// ---------------------------------------------------------------------
// Modifier / supprimer le cours
// ---------------------------------------------------------------------
function editCourse(course) {
  const m = modal(`
    <h3>${t("✏️ Modifier le cours")}</h3>
    <label class="field" for="et">${t("Titre")}</label><input id="et" type="text" value="${esc(course.title)}">
    <label class="field" for="es">${t("Matière")}</label><input id="es" type="text" value="${esc(course.subject)}">
    <div class="row end" style="margin-top:14px">
      <button class="btn ghost small" data-close>${t("Annuler")}</button><button class="btn small" id="ok">${t("Enregistrer")}</button>
    </div>`);
  m.el.querySelector('#ok').onclick = async () => {
    course.title = m.el.querySelector('#et').value.trim() || course.title;
    course.subject = m.el.querySelector('#es').value.trim() || course.subject;
    await db.put('courses', course);
    // La matière est aussi copiée dans chaque fiche (pour les statistiques).
    const cards = await db.getByIndex('cards', 'courseId', course.id);
    cards.forEach((c) => { c.subject = course.subject; });
    await db.putMany('cards', cards);
    m.close();
    refresh();
  };
}

async function deleteCourse(course) {
  if (!(await confirmBox(`${t("Supprimer définitivement «")} ${course.title} ${t("» avec ses fiches, quiz et résultats ?")}`, t('Supprimer')))) return;
  for (const store of ['cards', 'quizzes', 'images', 'results', 'exercises']) {
    await db.delByIndex(store, 'courseId', course.id);
  }
  await db.del('courses', course.id);
  toast(t('Cours supprimé.'));
  location.hash = '#/cours';
}

/** XP pour un résumé lu en entier (appelé par les stories). */
export async function rewardSummary(fromEl) {
  celebrate(await addXp(XP_RULES.summaryDone, 'summaries'), fromEl);
}
