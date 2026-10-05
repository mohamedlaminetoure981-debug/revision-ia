// =====================================================================
// views/boss.js — BOSS DE FIN D'ARC : un examen blanc mis en scène (Ren)
// ---------------------------------------------------------------------
// Adresse : #/boss/MATIÈRE
// - Les questions viennent des quiz DÉJÀ créés pour cette matière
//   (aucun appel à l'IA). Seulement s'il y en a moins de 5, et si internet
//   + clé API sont là, Ren fait créer un quiz (une seule fois, il est gardé).
// - Boss "l'Oubli" : barre de vie. Chaque bonne réponse = un coup.
// - Toi : 3 cœurs. Mauvaise réponse = le boss attaque (−1 cœur).
// - 3 bonnes réponses d'affilée = aura forte de l'équipe.
// - Victoire : K.O., pouvoir ultime, confettis, XP, badge.
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS, TEAM } from '../data/characters.js';
import { characterHTML, play, setExpression } from '../ui/character.js';
import { esc, rich, line, sourceHtml, showError, subjectColor, progress } from '../ui/ui.js';
import { sound, vibrate, confetti, onomatopoeia, celebrate } from '../ui/fx.js';
import { power, suspendPowers, resumePowers } from '../ui/powers.js';
import { generateQuiz } from '../core/generate.js';
import { markBossDefeated } from '../core/story.js';
import { offerStatus } from '../ui/status.js';
import { addXp, XP_RULES, getProfileSync } from '../core/game.js';
import { t } from '../i18n/index.js';

const MAX_QUESTIONS = 10;
const MIN_QUESTIONS = 5;
const HEARTS = 3;

/** Le boss "l'Oubli" en SVG : une ombre aux yeux brillants (couleur de la matière). */
export function bossSVG(color) {
  return `<svg viewBox="0 0 200 200" class="boss-svg" aria-hidden="true">
    <defs><radialGradient id="bossg" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#3a2a5a"/><stop offset=".7" stop-color="#120c22"/><stop offset="1" stop-color="#05030a"/></radialGradient></defs>
    <g class="boss-body">
      <path d="M100,14 C150,14 182,52 178,104 C176,132 190,150 172,168 C160,180 150,166 140,182 C128,196 116,178 100,192 C84,178 72,196 60,182 C50,166 40,180 28,168 C10,150 24,132 22,104 C18,52 50,14 100,14 Z" fill="url(#bossg)" stroke="#000" stroke-width="4"/>
      <path d="M40,60 L22,30 L58,48 Z M160,60 L178,30 L142,48 Z" fill="#120c22" stroke="#000" stroke-width="3"/>
      <g class="boss-eyes">
        <path d="M58,88 L92,100 L60,108 Z" fill="${color}"/><path d="M142,88 L108,100 L140,108 Z" fill="${color}"/>
        <circle cx="72" cy="99" r="3" fill="#fff"/><circle cx="128" cy="99" r="3" fill="#fff"/>
      </g>
      <path class="boss-mouth" d="M62,134 L74,128 L84,138 L94,128 L106,138 L116,128 L126,138 L138,130" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round"/>
      <text x="100" y="72" text-anchor="middle" font-size="16" fill="${color}" opacity=".5" font-family="serif">∫ ∑ π √</text>
    </g>
  </svg>`;
}

/** Mélange une liste (Fisher-Yates). */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Questions disponibles pour une matière (quiz déjà créés). */
async function questionsFor(subject) {
  const courses = (await db.getAll('courses')).filter((c) => (c.subject || 'Autre') === subject);
  const byId = Object.fromEntries(courses.map((c) => [c.id, c]));
  const quizzes = (await db.getAll('quizzes')).filter((q) => byId[q.courseId]);
  const list = quizzes.flatMap((q) => q.questions.map((x) => ({ ...x, course: byId[q.courseId] })));
  return { courses, list };
}

// Boss de démonstration (Panneau créateur) : questions intégrées, rien n'est enregistré.
const DEMO = '__demo';
const DEMO_QUESTIONS = [
  { question: t('Combien font 7 × 8 ?'), choices: ['54', '56', '64', '48'], correctIndex: 1, explanation: '7 × 8 = 56.' },
  { question: t('Capitale de la Guinée ?'), choices: [t('Kankan'), t('Labé'), t('Conakry'), t('Kindia')], correctIndex: 2, explanation: t('Conakry est la capitale.') },
  { question: t('Dérivée de x² ?'), choices: ['2x', 'x', 'x²/2', '2'], correctIndex: 0, explanation: '(x²)′ = 2x.' },
  { question: t('H₂O, c’est…'), choices: [t('du sel'), t('de l’eau'), t('de l’oxygène'), t('du sucre')], correctIndex: 1, explanation: t('H₂O = l’eau.') },
  { question: '√81 = ?', choices: ['8', '9', '7', '81'], correctIndex: 1, explanation: '9 × 9 = 81.' },
  { question: t('Qui code l’appli à 3 h du matin ?'), choices: ['Ren', t('Le Créateur'), 'Sora', t('Personne')], correctIndex: 1, explanation: t('Le Créateur, évidemment.') },
];

export async function render(el, [subjectRaw]) {
  const demo = subjectRaw === DEMO;
  const subject = demo ? t('Démo') : subjectRaw || '';
  const color = subjectColor(subject);
  const ren = CHARACTERS.ren;
  let { courses, list } = demo
    ? { courses: [{ id: DEMO, subject, pages: [] }], list: DEMO_QUESTIONS.map((q) => ({ ...q })) }
    : await questionsFor(subject);
  if (!courses.length) { location.hash = '#/histoire'; return; }

  // Pas assez de questions : on en crée UNE fois (gardées ensuite pour toujours).
  if (list.length < MIN_QUESTIONS) {
    const canAI = navigator.onLine && (await db.getSetting('apiKey'));
    el.innerHTML = `
      <div class="fs center" style="--c:${ren.color};justify-content:center">
        <div class="fs-top" style="position:absolute;top:calc(10px + env(safe-area-inset-top));left:14px"><a class="fs-close" href="#/histoire" style="display:grid;place-items:center;text-decoration:none">✕</a></div>
        ${characterHTML('ren', { expression: 'reflexion', size: 150 })}
        <div class="bubble top" style="max-width:360px;margin:12px auto;text-align:left"><span class="who">Ren</span>
          ${canAI ? t('Pas assez de questions pour un vrai combat. Je fais préparer un quiz (une seule fois), et on y va ?') : t('Pas assez de questions pour ce boss. Fais d’abord un quiz dans cette matière (il faut internet pour le créer).')}</div>
        ${canAI ? `<button class="btn pink block" id="prep" style="max-width:360px;margin:0 auto">${t("⚡ Préparer le combat")}</button>` : `<a class="btn block" href="#/quiz" style="max-width:360px;margin:0 auto">${t("🎯 Aller aux quiz")}</a>`}
      </div>`;
    el.querySelector('#prep')?.addEventListener('click', async () => {
      const pg = progress(t('Ren prépare le boss'), 'ren');
      try {
        await generateQuiz(courses[0], MAX_QUESTIONS, pg.set);
        pg.done();
        render(el, [subjectRaw]);
      } catch (e) { pg.done(); showError(e); }
    });
    return;
  }

  const questions = shuffle(list).slice(0, MAX_QUESTIONS);
  // Il faut toucher le boss ~70 % des questions pour le vaincre.
  const maxHp = Math.max(3, Math.ceil(questions.length * 0.7));
  let hp = maxHp;
  let hearts = HEARTS;
  let i = 0;
  let good = 0;
  let combo = 0;
  const companion = getProfileSync()?.companion || 'kai';
  const allies = TEAM.filter((t) => t !== 'ren' && t !== companion);

  // --- Intro ---
  el.innerHTML = `
    <div class="fs boss-fight" style="--c:${color};justify-content:center;text-align:center">
      <div class="fs-top" style="position:absolute;top:calc(10px + env(safe-area-inset-top));left:14px"><a class="fs-close" href="#/histoire" style="display:grid;place-items:center;text-decoration:none">✕</a></div>
      <div class="boss-intro">${bossSVG(color)}</div>
      <h1 class="display boss-title">${t("L'OUBLI")}</h1>
      <p class="tiny" style="color:var(--c);font-weight:800;letter-spacing:.1em;text-transform:uppercase">${t("Boss de l'arc")} ${esc(subject)}</p>
      <div class="mascot" style="--c:${ren.color};max-width:380px;margin:10px auto">${characterHTML('ren', { expression: 'concentration', size: 80 })}
        <div class="bubble"><span class="who">Ren</span><span class="say">${esc(line('ren', 'boss_intro'))}</span></div></div>
      <p class="muted small">${questions.length} ${t("questions · ❤️×")}${HEARTS} ${t("· Barre de vie :")} ${maxHp} ${t("coups")}</p>
      <button class="btn pink block" id="go" style="max-width:360px;margin:6px auto 0">${t("⚔️ COMBATTRE")}</button>
    </div>`;
  sound('boss');
  vibrate([40, 60, 40]);
  el.querySelector('#go').onclick = () => { suspendPowers(); sound('energy', 1); turn(); };
  window.addEventListener('hashchange', () => resumePowers(), { once: true });

  // --- Un tour = une question ---
  function turn() {
    const q = questions[i];
    el.innerHTML = `
      <div class="fs boss-fight" style="--c:${color}">
        <div class="fs-top">
          <a class="fs-close" href="#/histoire" style="display:grid;place-items:center;text-decoration:none">✕</a>
          <div class="grow">
            <div class="row between nowrap tiny"><strong style="color:var(--c)">${t("L'OUBLI")}</strong><span id="hpn">${hp}/${maxHp}</span></div>
            <div class="boss-hp"><div id="hp" style="width:${(100 * hp) / maxHp}%"></div></div>
          </div>
          <span class="hearts" id="hearts">${'❤️'.repeat(hearts)}${'🖤'.repeat(HEARTS - hearts)}</span>
        </div>
        <div class="fs-body" style="overflow-y:auto">
          <div class="arena">
            <div class="arena-boss" id="boss">${bossSVG(color)}</div>
            <div class="arena-team">
              ${characterHTML(companion, { expression: 'concentration', size: 70, aura: combo >= 3 ? 2 : 0 })}
              <div class="bubble"><span class="who" id="who">${esc(CHARACTERS[companion].name)}</span><span class="say" id="say">${t("Question")} ${i + 1}/${questions.length}…</span></div>
            </div>
          </div>
          <div class="q-card"><div class="q rich">${rich(q.question)}</div></div>
          ${q.choices.map((c, k) => `<button class="choice" data-k="${k}"><span class="letter">${'ABCDEFGH'[k]}</span><span class="rich grow">${rich(c)}</span></button>`).join('')}
          <div id="after"></div>
        </div>
      </div>`;
    el.querySelectorAll('.choice').forEach((b) => { b.onclick = () => answer(Number(b.dataset.k)); });
  }

  function answer(k) {
    const q = questions[i];
    const ok = k === q.correctIndex;
    el.querySelectorAll('.choice').forEach((b, j) => {
      b.disabled = true;
      if (j === q.correctIndex) b.classList.add('good');
      else if (j === k) b.classList.add('wrong');
    });
    const bossEl = el.querySelector('#boss');
    const teamCh = el.querySelector('.arena-team .ch');
    const sayEl = el.querySelector('#say');
    const whoEl = el.querySelector('#who');
    if (ok) {
      good++; combo++; hp = Math.max(0, hp - 1);
      sound('hit'); vibrate([15, 20, 40]);
      bossEl.classList.remove('hit'); void bossEl.offsetWidth; bossEl.classList.add('hit');
      const dmg = document.createElement('div');
      dmg.className = 'dmg'; dmg.textContent = combo >= 3 ? t('CRITIQUE!') : [t('BAM!'), t('POW!'), t('DOOM!'), t('KRAK!')][i % 4];
      bossEl.appendChild(dmg);
      el.querySelector('#hp').style.width = `${(100 * hp) / maxHp}%`;
      el.querySelector('#hpn').textContent = `${hp}/${maxHp}`;
      // Un allié encourage (ou Ren).
      const who = combo % 2 ? allies[Math.floor(Math.random() * allies.length)] : 'ren';
      whoEl.textContent = CHARACTERS[who].name;
      sayEl.textContent = line(who, who === 'ren' ? 'boss_coup' : 'boss_soutien');
      setExpression(teamCh, 'celebration');
      play(teamCh, 'jump');
      if (combo === 3 || combo === 6) power(companion, 'strong', { target: teamCh });
      else power(companion, 'light', { target: teamCh });
    } else {
      combo = 0; hearts--;
      sound('boss'); vibrate([60, 40, 60]);
      el.querySelector('.boss-fight').classList.add('shake');
      setTimeout(() => el.querySelector('.boss-fight')?.classList.remove('shake'), 1100);
      bossEl.classList.add('attack');
      el.querySelector('#hearts').textContent = '❤️'.repeat(Math.max(0, hearts)) + '🖤'.repeat(HEARTS - Math.max(0, hearts));
      whoEl.textContent = 'Ren';
      sayEl.textContent = line('ren', 'boss_degat');
      setExpression(teamCh, 'surprise');
      play(teamCh, 'shake');
    }
    const end = hp === 0 || hearts <= 0 || i === questions.length - 1;
    el.querySelector('#after').innerHTML = `
      <div class="explain" style="border-color:${ok ? 'var(--neon-green)' : 'var(--neon-pink)'}">
        <div class="tag" style="color:${ok ? 'var(--neon-green)' : 'var(--neon-pink)'}">${ok ? t('✓ Coup porté !') : t('✗ Le boss contre-attaque')}</div>
        <div class="rich">${rich(q.explanation || '')}</div>
        ${q.source ? sourceHtml(q.course, q.source) : ''}
      </div>
      <button class="btn block" id="next" style="margin:6px 0 20px">${end ? (hp === 0 ? t('💥 Le coup final !') : t('🏁 Fin du combat')) : t('Question suivante →')}</button>`;
    el.querySelector('#next').onclick = () => { if (end) finish(); else { i++; turn(); } };
    el.querySelector('#after').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // --- Fin du combat ---
  async function finish() {
    const won = hp === 0;
    resumePowers();
    if (!demo) await db.put('results', {
      id: db.newId(), type: 'boss', subject, courseId: courses[0].id, won, hearts: Math.max(0, hearts),
      score: good, total: i + 1, date: new Date().toISOString(),
    });
    el.innerHTML = `
      <div class="fs boss-fight ${won ? 'victory' : 'defeat'}" style="--c:${color};justify-content:center;text-align:center">
        <div class="boss-end">${won ? '' : bossSVG(color)}</div>
        ${characterHTML(won ? companion : 'ren', { expression: won ? 'celebration' : 'encouragement', size: 170, aura: won ? 3 : 0 })}
        <h1 class="display ${won ? 'grad-text' : ''}" style="font-size:2.2rem;margin:8px 0">${won ? 'K.O. !' : t('DÉFAITE…')}</h1>
        <div class="bubble top" style="max-width:360px;margin:6px auto 12px;text-align:left"><span class="who">Ren</span>${esc(line('ren', won ? 'boss_victoire' : 'boss_defaite'))}</div>
        <p class="muted">${good} ${good > 1 ? t('coups portés') : t('coup porté')} · ${'❤️'.repeat(Math.max(0, hearts))}${'🖤'.repeat(HEARTS - Math.max(0, hearts))}</p>
        <div class="row" style="gap:8px;justify-content:center;margin-top:8px">
          <a class="btn ${won ? 'green' : 'pink'}" href="#/histoire">${t("📚 Retour à l'histoire")}</a>
          <button class="btn ghost" id="again">↺ ${won ? t('Rejouer') : t('Revanche')}</button>
        </div>
        ${won ? `<button class="btn block" id="status" style="max-width:360px;margin:10px auto 0">${t("📸 Statut WhatsApp")}</button>` : ''}
      </div>`;
    el.querySelector('#again').onclick = () => render(el, [subjectRaw]);
    el.querySelector('#status')?.addEventListener('click', () => offerStatus({
      charId: companion, kicker: t('Boss vaincu'), big: 'K.O. !', sub: `${t("Arc")} ${subject}`.slice(0, 40),
      lines: [`${good} ${t("coups portés ·")} ${'❤️'.repeat(Math.max(0, hearts))}`],
    }));
    if (won) {
      if (!demo) await markBossDefeated(subject);
      sound('victory');
      onomatopoeia('K.O.!');
      confetti(160);
      vibrate([30, 40, 30, 40, 80]);
      setTimeout(() => power(companion, 'ultimate', { sub: `${t("Boss de l'arc")} ${subject} ${t("vaincu !")}`, text: 'K.O.!' }), 900);
      if (!demo) celebrate(await addXp(XP_RULES.boss + 5 * good), el.querySelector('.ch'));
    } else {
      sound('bad');
    }
  }
}
