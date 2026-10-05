// =====================================================================
// views/dojo.js — MODE FOCUS : LE DOJO D'AWA
// ---------------------------------------------------------------------
// Adresse : #/dojo   (100 % hors ligne, aucun appel à l'IA)
// - Minuteur travail / pause (25 / 5 par défaut, réglable).
// - Ton compagnon s'entraîne (petite animation en boucle) et son aura
//   grandit au fil des minutes.
// - Si tu QUITTES l'appli pendant le travail (visibilitychange), le perso
//   réagit à ton retour et la session rapporte moins d'XP (−25 % par sortie).
// - Ambiances sonores générées (pluie, nuit, dojo), optionnelles.
// - Chaque session est enregistrée (store 'focus') → stats dans Profil + badges.
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play, setExpression } from '../ui/character.js';
import { esc, line, toast } from '../ui/ui.js';
import { sound, vibrate, confetti, onomatopoeia, celebrate } from '../ui/fx.js';
import { power } from '../ui/powers.js';
import { startAmbient, stopAmbient, AMBIENT_LIST } from '../ui/sfx.js';
import { getProfileSync, addXp } from '../core/game.js';
import { today } from '../core/srs.js';
import { isCreator } from '../core/creator.js';
import { t } from '../i18n/index.js';

const DEFAULTS = { work: 25, rest: 5, ambient: 'aucun' };
const XP_PER_MIN = 2; // 25 min parfaites = 50 XP
const PENALTY = 0.25; // −25 % d'XP par sortie de l'appli
const AMBIENT_LABEL = { aucun: t('🔇 Silence'), pluie: t('🌧️ Pluie'), nuit: t('🌙 Nuit'), dojo: t('🎋 Dojo') };

/** Minutes de focus : aujourd'hui, 7 derniers jours, total. */
export async function focusStats() {
  const list = await db.getAll('focus');
  const d = today();
  const week = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
  const sum = (arr) => arr.reduce((s, x) => s + (x.minutes || 0), 0);
  return { today: sum(list.filter((x) => x.day === d)), week: sum(list.filter((x) => x.day >= week)), total: sum(list), sessions: list.length, pure: list.filter((x) => x.completed && !x.leaves).length };
}

export async function render(el, [mode]) {
  const prefs = { ...DEFAULTS, ...((await db.getSetting('focusPrefs')) || {}) };
  // Panneau créateur : session de test très courte (non enregistrée dans les réglages).
  if (mode === 'test' && isCreator()) { prefs.work = 1; prefs.rest = 1; }
  const comp = getProfileSync()?.companion || 'kai';
  const awa = CHARACTERS.awa;
  let home = '#/';
  try { if (sessionStorage.getItem('veilleReturn') === '1') home = '#/veille'; } catch { /* ignoré */ }
  const stats = await focusStats();
  let timer = null;
  let session = null; // { phase:'work'|'rest', endAt, total(ms), leaves, hiddenAt, aura }

  const cleanup = () => { clearInterval(timer); stopAmbient(); document.removeEventListener('visibilitychange', onVis); };
  window.addEventListener('hashchange', cleanup, { once: true });

  // --- Réglages de la session ---
  function setup() {
    el.innerHTML = `
      <div class="fs dojo" style="--c:${awa.color};overflow-y:auto">
        <div class="fs-top"><a class="fs-close" href="${home}" style="display:grid;place-items:center;text-decoration:none">✕</a>
          <div class="grow"><div class="label">${t("Mode Focus")}</div><strong>${t("🥋 Le dojo d'Awa")}</strong></div></div>
        <div style="max-width:440px;width:100%;margin:0 auto">
          <div class="mascot" style="--c:${awa.color};margin:10px 0">${characterHTML('awa', { expression: 'concentration', size: 84 })}
            <div class="bubble"><span class="who">Awa</span><span class="say">${esc(line('awa', 'focus_intro'))}</span></div></div>
          <div class="tile">
            ${stepper('work', t('⏱️ Travail'), prefs.work, 5, 90, 5)}
            ${stepper('rest', t('☕ Pause'), prefs.rest, 1, 30, 1)}
            <div class="label" style="margin-top:12px">${t("Ambiance (générée, rien à télécharger)")}</div>
            <div class="seg" id="amb">${['aucun', ...AMBIENT_LIST.filter((a) => AMBIENT_LABEL[a])].map((a) => `<button data-a="${a}" class="${prefs.ambient === a ? 'active' : ''}">${AMBIENT_LABEL[a]}</button>`).join('')}</div>
          </div>
          <button class="btn pink block" id="start" style="margin:14px 0">${t("🔔 Commencer l'entraînement")}</button>
          <div class="bento">
            <div class="tile"><div class="label">${t("Aujourd'hui")}</div><div class="big">${stats.today}<span class="small"> ${t("min")}</span></div></div>
            <div class="tile"><div class="label">${t("7 jours")}</div><div class="big">${stats.week}<span class="small"> ${t("min")}</span></div></div>
          </div>
          <p class="tiny muted center">${t("Quitter l'appli pendant le travail = moins d'XP (−25 % par sortie). Awa voit tout. 👀")}</p>
        </div>
      </div>`;
    el.querySelectorAll('[data-step]').forEach((b) => {
      b.onclick = async () => {
        const k = b.dataset.step;
        const s = STEP[k];
        prefs[k] = Math.max(s.min, Math.min(s.max, prefs[k] + Number(b.dataset.d) * s.inc));
        el.querySelector(`#v-${k}`).textContent = prefs[k];
        if (mode !== 'test') await db.setSetting('focusPrefs', prefs);
      };
    });
    el.querySelectorAll('#amb button').forEach((b) => {
      b.onclick = async () => {
        prefs.ambient = b.dataset.a;
        el.querySelectorAll('#amb button').forEach((x) => x.classList.toggle('active', x === b));
        await db.setSetting('focusPrefs', prefs);
        if (prefs.ambient === 'aucun') stopAmbient(); else startAmbient(prefs.ambient); // aperçu
      };
    });
    el.querySelector('#start').onclick = () => begin('work');
  }

  const STEP = { work: { min: 5, max: 90, inc: 5 }, rest: { min: 1, max: 30, inc: 1 } };
  function stepper(k, label, v) {
    return `<div class="row between" style="margin:6px 0"><span>${label}</span>
      <div class="row nowrap stepper"><button class="btn ghost small" data-step="${k}" data-d="-1">−</button>
      <b id="v-${k}" style="min-width:2.2em;text-align:center">${v}</b><span class="small muted">${t("min")}</span>
      <button class="btn ghost small" data-step="${k}" data-d="1">+</button></div></div>`;
  }

  // --- Session en cours ---
  function begin(phase) {
    const minutes = phase === 'work' ? prefs.work : prefs.rest;
    session = { phase, total: minutes * 6e4, endAt: Date.now() + minutes * 6e4, leaves: 0, hiddenAt: 0, aura: 0, minutes };
    if (prefs.ambient !== 'aucun' && phase === 'work') startAmbient(prefs.ambient);
    if (phase === 'rest') stopAmbient();
    const work = phase === 'work';
    el.innerHTML = `
      <div class="fs dojo ${work ? 'working' : 'resting'}" style="--c:${work ? awa.color : CHARACTERS.tidiane.color}">
        <div class="fs-top"><button class="fs-close" id="stop" aria-label="${t("Arrêter")}">✕</button>
          <div class="grow center"><strong>${work ? t('🥋 Entraînement') : t('☕ Pause')}</strong> <span class="tiny dim">${minutes} ${t("min")}</span></div>
          <span class="tiny" id="mult"></span></div>
        <div class="fs-body" style="justify-content:center;align-items:center;text-align:center">
          <div class="dojo-ring" id="ring">
            <svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" class="ring-bg"/><circle cx="100" cy="100" r="90" class="ring-fg" id="arc" pathLength="100"/></svg>
            <div class="dojo-char ${work ? 'dojo-train' : 'dojo-rest'}" id="char">${characterHTML(work ? comp : 'tidiane', { expression: work ? 'concentration' : 'neutre', size: 150, enter: false })}</div>
          </div>
          <div class="dojo-time" id="time"></div>
          <div class="mascot" style="--c:${awa.color};max-width:380px;margin:8px auto 0">${characterHTML(work ? 'awa' : 'tidiane', { expression: 'encouragement', size: 54, enter: false })}
            <div class="bubble"><span class="who">${work ? 'Awa' : 'Tidiane'}</span><span class="say" id="say">${esc(work ? line('awa', 'focus_debut') : line('tidiane', 'focus_pause'))}</span></div></div>
          ${work ? '' : `<button class="btn ghost" id="skip" style="margin-top:12px">${t("⏭️ Passer la pause")}</button>`}
        </div>
      </div>`;
    sound(work ? 'gong' : 'bubble');
    vibrate(30);
    el.querySelector('#stop').onclick = stop;
    el.querySelector('#skip')?.addEventListener('click', () => { clearInterval(timer); setup(); });
    clearInterval(timer);
    timer = setInterval(tick, 1000);
    tick();
  }

  let lastTalk = 0;
  function tick() {
    const left = Math.max(0, session.endAt - Date.now());
    const done = 1 - left / session.total;
    const mm = Math.floor(left / 6e4);
    const ss = Math.floor((left % 6e4) / 1000);
    const t = el.querySelector('#time');
    if (!t) return;
    t.textContent = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    el.querySelector('#arc').style.strokeDashoffset = String(100 - done * 100);
    if (session.phase === 'work') {
      el.querySelector('#mult').textContent = session.leaves ? `XP ×${multiplier().toFixed(2)}` : '';
      // L'aura grandit avec les minutes : 25 %, 50 %, 80 %.
      const aura = done >= 0.8 ? 3 : done >= 0.5 ? 2 : done >= 0.25 ? 1 : 0;
      if (aura !== session.aura) {
        session.aura = aura;
        el.querySelector('#char').innerHTML = characterHTML(comp, { expression: aura >= 2 ? 'celebration' : 'concentration', size: 150, aura, enter: false });
        if (aura) { sound('energy', Math.min(aura, 2)); el.querySelector('#say').textContent = line('awa', 'focus_aura'); }
      }
      // Encouragement d'Awa toutes les ~5 minutes.
      if (Date.now() - lastTalk > 3e5 && done > 0.05 && done < 0.95) { lastTalk = Date.now(); el.querySelector('#say').textContent = line('awa', 'focus_milieu'); }
    }
    if (left <= 0) { clearInterval(timer); session.phase === 'work' ? finish(true) : setup(); }
  }

  const multiplier = () => Math.max(0.25, 1 - PENALTY * session.leaves);

  // L'élève quitte / revient dans l'appli.
  function onVis() {
    if (!session || session.phase !== 'work' || !el.querySelector('#time')) return;
    if (document.hidden) { session.hiddenAt = Date.now(); return; }
    if (!session.hiddenAt) return;
    const away = Date.now() - session.hiddenAt;
    session.hiddenAt = 0;
    if (away < 3000) return; // un coup d'œil de 2 s, on pardonne
    session.leaves++;
    sound('oops');
    vibrate([40, 30, 40]);
    const ch = el.querySelector('#char .ch');
    setExpression(ch, session.leaves > 1 ? 'surprise' : 'clin');
    play(ch, 'shake');
    el.querySelector('#say').textContent = line('awa', 'focus_retour');
    tick();
  }
  document.addEventListener('visibilitychange', onVis);

  async function stop() {
    if (session?.phase !== 'work') { clearInterval(timer); setup(); return; }
    const spent = (Date.now() - (session.endAt - session.total)) / 6e4;
    clearInterval(timer);
    if (spent >= 5) return finish(false);
    stopAmbient();
    toast(line('awa', 'focus_abandon'));
    setup();
  }

  /** Fin du travail : enregistrement, XP, réaction. */
  async function finish(completed) {
    stopAmbient();
    const minutes = completed ? session.minutes : Math.floor((Date.now() - (session.endAt - session.total)) / 6e4);
    const mult = multiplier() * (completed ? 1 : 0.5);
    const xp = Math.max(1, Math.round(minutes * XP_PER_MIN * mult));
    await db.put('focus', { id: db.newId(), day: today(), date: new Date().toISOString(), minutes, leaves: session.leaves, completed, xp });
    const pure = completed && !session.leaves;
    el.innerHTML = `
      <div class="fs dojo" style="--c:${awa.color};justify-content:center;text-align:center">
        ${characterHTML(comp, { expression: pure ? 'celebration' : session.leaves ? 'clin' : 'joie', size: 170, aura: pure ? 3 : 1 })}
        <h1 class="display ${pure ? 'grad-text' : ''}" style="margin:8px 0">${completed ? (pure ? t('FOCUS PARFAIT !') : t('SESSION TERMINÉE')) : t('SESSION COUPÉE')}</h1>
        <p class="muted">${minutes} ${t("min ·")} ${session.leaves ? `${session.leaves} ${t("sortie")}${session.leaves > 1 ? 's' : ''} (XP ×${mult.toFixed(2)})` : t('aucune sortie 👏')}</p>
        <div class="display" style="font-size:1.5rem;color:var(--neon-green)">+${xp} XP</div>
        <div class="mascot" style="--c:${awa.color};max-width:380px;margin:10px auto">${characterHTML('awa', { expression: pure ? 'celebration' : 'encouragement', size: 60 })}
          <div class="bubble"><span class="who">Awa</span><span class="say">${esc(line('awa', pure ? 'focus_fin' : 'focus_fin_triche'))}</span></div></div>
        <div class="row" style="justify-content:center;gap:8px">
          <button class="btn" id="rest">${t("☕ Pause")} ${prefs.rest} ${t("min")}</button>
          <a class="btn ghost" href="${home}">${home === '#/veille' ? t('🌙 Retour au plan') : t('🏠 Accueil')}</a>
        </div>
      </div>`;
    sound(pure ? 'victory' : 'gong');
    if (pure) { confetti(); onomatopoeia(t('OSU!')); setTimeout(() => power(comp, 'strong', { target: el.querySelector('.ch') }), 500); }
    el.querySelector('#rest').onclick = () => begin('rest');
    celebrate(await addXp(xp, 'focus'), el.querySelector('.display'));
  }

  setup();
}
