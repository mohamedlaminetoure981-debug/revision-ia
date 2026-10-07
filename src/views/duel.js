// =====================================================================
// views/duel.js — DUEL ENTRE AMIS (Ren arbitre)
// ---------------------------------------------------------------------
// Adresse : #/duel/<quiz compressé>  (voir core/duel.js)
// - Marche SANS clé Gemini et sans compte : tout est dans le lien.
// - Si l'ami n'a jamais ouvert l'appli : petit accueil, pseudo, duel,
//   puis proposition d'installer l'appli et de créer son profil.
// - Fin : les deux persos face à face, les deux scores, le gagnant,
//   et "Renvoyer le défi" (WhatsApp).
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS, TEAM } from '../data/characters.js';
import { characterHTML, play } from '../ui/character.js';
import { esc, rich, line, mascot, toast, mathText } from '../ui/ui.js';
import { sound, vibrate, confetti, onomatopoeia, celebrate } from '../ui/fx.js';
import { power, suspendPowers, resumePowers } from '../ui/powers.js';
import { decodeDuel, makeDuel, shareDuel } from '../core/duel.js';
import { getProfileSync, addXp, XP_RULES } from '../core/game.js';
import { openInstall, isInstalled } from '../ui/install.js';
import { isCreator, creatorName } from '../core/creator.js';
import { t } from '../i18n/index.js';

/** Pseudo du joueur (profil, sinon pseudo saisi pour le duel). */
function myName() {
  if (isCreator()) return creatorName();
  const p = getProfileSync();
  if (p?.name) return p.name;
  try { return localStorage.getItem('duelName') || ''; } catch { return ''; }
}

export async function render(el, [code]) {
  const d = decodeDuel(code || '');
  const ren = CHARACTERS.ren;
  if (!d) {
    el.innerHTML = `<div class="fs center" style="justify-content:center">${mascot('tidiane', { text: t('Ce lien de duel est abîmé ou incomplet. Demande à ton ami de le renvoyer en entier.'), expression: 'encouragement' })}
      <a class="btn block" href="#/" style="max-width:340px;margin:16px auto">${t("Aller à l'accueil")}</a></div>`;
    return;
  }
  const profile = getProfileSync();
  const rival = CHARACTERS[d.c] ? d.c : 'ren';
  let mine = profile?.companion || (rival === 'kai' ? 'sora' : 'kai');
  const total = d.questions.length;

  // --- Réponse à MON défi : j'affiche d'abord le résultat reçu ---
  const sent = ((await db.getSetting('duelsSent')) || {})[d.i];
  if (d.r && sent && !el.dataset.replay) {
    return result(d.r.score, d.s, true); // moi = mon score d'origine, lui = sa réponse
  }

  // --- Accueil (avec pseudo si pas de profil) ---
  function welcome() {
    const name = myName();
    el.innerHTML = `
      <div class="fs duel-screen" style="--c:${ren.color};overflow-y:auto">
        ${profile ? '<div class="fs-top"><a class="fs-close" href="#/" style="display:grid;place-items:center;text-decoration:none">✕</a></div>' : ''}
        <div class="duel-face">
          <div class="side">${characterHTML(rival, { expression: 'clin', size: 120 })}<b>${esc(d.n || t('Ton ami'))}</b><span class="score-pill">${d.s}/${total}</span></div>
          <div class="vs">VS</div>
          <div class="side">${characterHTML(mine, { expression: 'concentration', size: 120 })}<b>${esc(name || t('Toi'))}</b><span class="score-pill dim">?/${total}</span></div>
        </div>
        <h1 class="display center" style="font-size:1.5rem;margin:12px 0 4px">⚔️ ${esc(d.n || t('Ton ami'))} ${t("te défie !")}</h1>
        <p class="center muted small" style="margin:0">${mathText(d.ti || d.su || t('Quiz'))} · ${total} ${t("questions")}</p>
        <div class="mascot" style="--c:${ren.color};max-width:420px;margin:14px auto">${characterHTML('ren', { expression: 'joie', size: 70 })}
          <div class="bubble"><span class="who">Ren</span><span class="say">${esc(line('ren', 'duel_intro'))}</span></div></div>
        ${profile ? '' : `
          <div class="tile" style="max-width:420px;margin:0 auto 12px">
            <strong>${t("Bienvenue sur Révision IA 👋")}</strong>
            <p class="small muted" style="margin:6px 0 10px">${t("L'appli de révision avec une équipe anime : résumés, fiches, quiz, exercices… Fais d'abord ce duel, c'est gratuit et sans compte.")}</p>
            <div class="team-row">${TEAM.map((id) => characterHTML(id, { expression: 'joie', size: 42, enter: false })).join('')}</div>
            <label class="small" for="pseudo" style="display:block;margin-top:10px">${t("Ton pseudo")}</label>
            <input type="text" id="pseudo" maxlength="20" placeholder="${t("Ex. Fanta")}" value="${esc(name)}">
          </div>`}
        <button class="btn pink block" id="go" style="max-width:420px;margin:0 auto 20px">${t("⚔️ J'accepte le défi")}</button>
      </div>`;
    sound('teleport');
    el.querySelector('#go').onclick = () => {
      const p = el.querySelector('#pseudo');
      if (p) {
        const v = p.value.trim();
        if (!v) { p.focus(); toast(t('Choisis un pseudo pour le duel 😉')); return; }
        try { localStorage.setItem('duelName', v.slice(0, 20)); } catch { /* navigation privée */ }
      }
      suspendPowers();
      vibrate(20);
      sound('energy', 1);
      ask(0, []);
    };
  }

  // --- Questions (aucun appel à l'IA) ---
  function ask(i, answers) {
    const q = d.questions[i];
    el.innerHTML = `
      <div class="fs" style="--c:${ren.color}">
        <div class="fs-top">
          <a class="fs-close" href="#/" style="display:grid;place-items:center;text-decoration:none">✕</a>
          <div class="grow"><div class="bar"><div style="width:${(100 * i) / total}%;background:var(--grad-fire)"></div></div></div>
          <span class="tiny dim">${i + 1}/${total}</span>
        </div>
        <div class="fs-body" style="overflow-y:auto">
          <div class="row nowrap tiny dim" style="margin:6px 0">${characterHTML(rival, { expression: 'clin', size: 34, enter: false })}<span>${esc(d.n)} ${t("a fait")} <b>${d.s}/${total}</b></span></div>
          <div class="q-card"><div class="q rich">${rich(q.question)}</div></div>
          ${q.choices.map((c, k) => `<button class="choice" data-k="${k}"><span class="letter">${'ABCDEFGH'[k]}</span><span class="rich grow">${rich(c)}</span></button>`).join('')}
          <div id="after"></div>
        </div>
      </div>`;
    el.querySelectorAll('.choice').forEach((b) => {
      b.onclick = () => {
        const k = Number(b.dataset.k);
        answers[i] = k;
        const ok = k === q.correctIndex;
        el.querySelectorAll('.choice').forEach((x, j) => {
          x.disabled = true;
          if (j === q.correctIndex) x.classList.add('good');
          else if (j === k) x.classList.add('wrong');
        });
        sound(ok ? 'good' : 'bad');
        vibrate(ok ? 15 : [30, 40, 30]);
        const last = i === total - 1;
        el.querySelector('#after').innerHTML = `
          <div class="explain" style="border-color:${ok ? 'var(--neon-green)' : 'var(--neon-pink)'}">
            <div class="tag" style="color:${ok ? 'var(--neon-green)' : 'var(--neon-pink)'}">${ok ? t('✓ Bonne réponse') : t('✗ Raté')}</div>
            <div class="rich">${rich(q.explanation || '')}</div></div>
          <button class="btn block" id="next" style="margin:6px 0 20px">${last ? t('🏁 Résultat du duel') : t('Question suivante →')}</button>`;
        el.querySelector('#next').onclick = () => {
          if (!last) return ask(i + 1, answers);
          const score = d.questions.filter((x, j) => answers[j] === x.correctIndex).length;
          finish(score, answers);
        };
        el.querySelector('#after').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
    });
  }

  async function finish(score, answers) {
    resumePowers();
    const hist = (await db.getSetting('duels')) || [];
    hist.unshift({ id: d.i, rival: d.n, rivalScore: d.s, score, total, title: d.ti, date: new Date().toISOString() });
    await db.setSetting('duels', hist.slice(0, 50));
    let xpResult = null;
    if (profile) xpResult = await addXp(score * XP_RULES.quizGood + XP_RULES.quizDone, 'quizzes');
    result(score, d.s, false, xpResult, answers);
  }

  /**
   * Écran de duel final : deux persos face à face.
   * @param {number} me  mon score   @param {number} them  score de l'autre
   * @param {boolean} received  true = c'est la réponse à MON défi
   */
  function result(me, them, received, xpResult, answers) {
    const win = me > them;
    const draw = me === them;
    const meName = myName() || t('Toi');
    const themName = d.n || t('Ton ami');
    const meChar = mine;
    const themChar = rival;
    el.innerHTML = `
      <div class="fs duel-screen ${win ? 'win' : draw ? 'draw' : 'lose'}" style="--c:${ren.color};overflow-y:auto">
        <div class="fs-top"><a class="fs-close" href="#/" style="display:grid;place-items:center;text-decoration:none">✕</a></div>
        ${received ? `<p class="center small muted" style="margin:0">📩 ${esc(themName)} ${t("a répondu à ton défi «")} ${mathText(d.ti || 'quiz')} »</p>` : ''}
        <div class="duel-face final">
          <div class="side ${win ? 'winner' : ''}">${characterHTML(meChar, { expression: win ? 'celebration' : draw ? 'clin' : 'surprise', size: 130, aura: win ? 3 : 0 })}<b>${esc(meName)}</b><span class="score-pill big">${me}/${total}</span></div>
          <div class="vs">VS</div>
          <div class="side ${!win && !draw ? 'winner' : ''}">${characterHTML(themChar, { expression: !win && !draw ? 'celebration' : draw ? 'clin' : 'surprise', size: 130, aura: !win && !draw ? 3 : 0 })}<b>${esc(themName)}</b><span class="score-pill big">${them}/${total}</span></div>
        </div>
        <h1 class="display center ${win ? 'grad-text' : ''}" style="font-size:2rem;margin:10px 0">${win ? t('VICTOIRE !') : draw ? t('ÉGALITÉ !') : t('DÉFAITE…')}</h1>
        <div class="mascot" style="--c:${ren.color};max-width:420px;margin:0 auto 12px">${characterHTML('ren', { expression: win ? 'surprise' : 'joie', size: 70 })}
          <div class="bubble"><span class="who">Ren</span><span class="say">${esc(line('ren', win ? 'duel_gagne' : draw ? 'duel_egalite' : 'duel_perdu'))}</span></div></div>
        <div style="max-width:420px;margin:0 auto;display:flex;flex-direction:column;gap:8px">
          ${received
            ? `<button class="btn pink block" id="replay">${t("⚔️ Rejouer pour la revanche")}</button>`
            : `<button class="btn pink block" id="back">${t("↩️ Renvoyer le défi")}</button>`}
          ${answers ? `<button class="btn ghost block" id="corr">${t("📋 Correction")}</button>` : ''}
          ${profile ? `<a class="btn ghost block" href="#/">${t("🏠 Accueil")}</a>` : `
            <div class="tile" style="margin-top:6px">${mascot('kai', { text: t('T’as aimé ? Toute l’équipe t’attend : résumés, fiches, quiz… gratuit, même hors ligne.'), expression: 'joie', size: 70 })}
              ${isInstalled() ? '' : `<button class="btn block" id="install" style="margin-top:10px">${t("📲 Installer l’appli")}</button>`}
              <a class="btn green block" href="#/bienvenue" style="margin-top:8px">${t("✨ Créer mon profil")}</a></div>`}
        </div>
      </div>`;
    const sides = el.querySelectorAll('.duel-face .ch');
    if (win) { sound('victory'); confetti(140, { color: CHARACTERS[meChar].color }); onomatopoeia(t('VICTOIRE!'), { color: CHARACTERS[meChar].color }); vibrate([30, 40, 30, 40, 80]); setTimeout(() => power(meChar, 'strong', { target: sides[0] }), 700); }
    else if (draw) { sound('good'); onomatopoeia(t('ÉGALITÉ!')); }
    else { sound('boss'); onomatopoeia(t('ARGH!'), { color: '#FF5A3D', big: false }); play(sides[0], 'shake'); }
    if (xpResult) celebrate(xpResult, el.querySelector('h1'));
    el.querySelector('#back')?.addEventListener('click', async () => {
      const r = await shareDuel(makeDuel({
        id: d.i, questions: d.questions, title: d.ti, subject: d.su, score: me,
        name: meName, charId: meChar, reply: { name: d.n, score: d.s },
      }));
      if (r !== 'cancelled') toast(line('ren', 'duel_envoi'), 'ok');
    });
    el.querySelector('#replay')?.addEventListener('click', () => { el.dataset.replay = '1'; welcome(); });
    el.querySelector('#install')?.addEventListener('click', () => openInstall());
    el.querySelector('#corr')?.addEventListener('click', () => correction(answers, () => result(me, them, received, null, answers)));
  }

  /** Correction : toutes les questions avec la bonne réponse. */
  function correction(answers, back) {
    el.innerHTML = `
      <div class="fs" style="--c:${ren.color};overflow-y:auto">
        <div class="fs-top"><button class="fs-close" id="cb">←</button><h2 class="grow" style="margin:0">${t("Correction")}</h2></div>
        <div style="max-width:560px;width:100%;margin:0 auto">
        ${d.questions.map((q, k) => `
          <div class="q-card"><div class="tiny dim">${t("Question")} ${k + 1} · ${answers[k] === q.correctIndex ? '✅' : '❌'}</div>
            <div class="q rich">${rich(q.question)}</div>
            ${q.choices.map((c, j) => `<div class="choice ${j === q.correctIndex ? 'good' : j === answers[k] ? 'wrong' : ''}" style="cursor:default;animation:none"><span class="letter">${'ABCDEFGH'[j]}</span><span class="rich grow">${rich(c)}</span></div>`).join('')}
            <div class="explain"><div class="rich">${rich(q.explanation || '')}</div></div></div>`).join('')}
        </div></div>`;
    el.querySelector('#cb').onclick = back;
  }

  welcome();
}
