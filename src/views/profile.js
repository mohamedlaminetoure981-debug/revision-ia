// =====================================================================
// views/profile.js — Profil : niveau, série, stats, compagnon, réglages
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS, TEAM } from '../data/characters.js';
import { characterHTML, play } from '../ui/character.js';
import { esc, modal, toast, line } from '../ui/ui.js';
import { getProfileSync, saveProfile, currentStreak, levelInfo, auraLevel, AURA_STEPS } from '../core/game.js';
import { vibrate } from '../ui/fx.js';
import { refresh } from '../main.js';
import { isCreator } from '../core/creator.js';
import { displayName } from '../ui/ui.js';
import { loadCollection } from '../core/collection.js';
import { focusStats } from './dojo.js';
import { t } from '../i18n/index.js';

export async function render(el) {
  const p = getProfileSync();
  const [courses, cards, reviews, results] = await Promise.all([
    db.getAll('courses'), db.getAll('cards'), db.getAll('reviews'), db.getAll('results'),
  ]);
  const [col, fstats] = await Promise.all([loadCollection(), focusStats()]);
  const comp = CHARACTERS[p.companion] || CHARACTERS.kai;
  const streak = currentStreak(p);
  const aura = auraLevel(streak);
  const lv = levelInfo(p.xp);
  const quizzes = results.filter((r) => r.type === 'quiz');
  const avg = quizzes.length ? Math.round(quizzes.reduce((s, r) => s + (100 * r.score) / r.total, 0) / quizzes.length) : null;
  const nextAura = AURA_STEPS.find((s) => streak < s);

  el.innerHTML = `
    <div class="screen-head"><h1>${t("👤 Profil")}</h1><span class="grow"></span>
      <a class="icon-btn" href="#/reglages" title="${t("Réglages")}" style="text-decoration:none">⚙️</a></div>

    <div class="tile speedlines center" style="--c:${comp.color};background:linear-gradient(160deg, color-mix(in srgb, ${comp.color} 35%, var(--surface)), var(--surface) 70%);margin-bottom:12px">
      <div id="comp" style="display:flex;justify-content:center">${isCreator() ? `<span class="creator-aura">${characterHTML(p.companion, { expression: 'joie', size: 170, aura })}</span>` : characterHTML(p.companion, { expression: 'joie', size: 170, aura })}</div>
      <h2 style="margin:6px 0 0">${esc(displayName())} ${isCreator() ? `<span class="chip" style="background:linear-gradient(135deg,#FFD23F,#A855F7);color:#1A1030;border:0">${t("👑 Créateur")}</span>` : ''}</h2>
      <div class="small muted">${t("avec")} ${esc(comp.name)}, ${esc(comp.role.toLowerCase())}</div>
      <div class="bar" style="margin:12px auto 4px;max-width:320px"><div style="width:${Math.round(lv.progress * 100)}%"></div></div>
      <div class="tiny muted">${t("Niveau")} ${lv.level}${isCreator() ? ` · <span class="creator-title">${t("Créateur")}</span>` : ''} · ${p.xp} / ${lv.to} XP</div>
      <div class="tiny dim" style="margin-top:6px">${nextAura ? `${t("Aura suivante à")} ${nextAura} ${t("jours de série (encore")} ${nextAura - streak})` : t('Aura maximale atteinte 👑')}</div>
    </div>

    <div class="bento" style="margin-bottom:12px">
      <div class="tile ${streak ? 'grad' : ''}"><div class="label">${t("Série")}</div><div class="big">🔥 ${streak}</div><div class="tiny">${t("record :")} ${p.bestStreak || 0} ${t('j')}</div></div>
      <div class="tile"><div class="label">${t("Niveau")}</div><div class="big grad-text">${lv.level}</div><div class="tiny muted">${p.xp} ${t("XP au total")}</div></div>
      <div class="tile"><div class="label">${t("Cours")}</div><div class="big">${courses.length}</div></div>
      <div class="tile"><div class="label">${t("Fiches")}</div><div class="big">${cards.length}</div><div class="tiny muted">${reviews.length} ${t("révisions")}</div></div>
      <div class="tile span-2"><div class="label">${t("Quiz")}</div>
        <div class="row between"><div class="big">${quizzes.length}</div><div class="small muted">${t("moyenne")} ${avg === null ? '—' : `${avg} %`}</div></div></div>
      <a class="tile span-2 neon" href="#/collection" style="--c:${CHARACTERS.sora.color}">
        <div class="row nowrap">${characterHTML('sora', { expression: col.pending.length ? 'celebration' : 'clin', size: 64, enter: false })}
          <div class="grow"><div class="label">${t("Avec Sora")}</div><h3 style="margin:2px 0">${t("🃏 Ma collection ·")} ${col.owned}/${col.total}</h3>
          <div class="tiny muted">${col.pending.length ? `🎁 ${col.pending.length} ${t("carte(s) à ouvrir !")}` : t('Réussis tes fiches pour gagner des cartes')}</div></div>
          ${col.pending.length ? '<span class="dot-new"></span>' : ''}</div></a>
      <a class="tile span-2 neon" href="#/dojo" style="--c:${CHARACTERS.awa.color}">
        <div class="row nowrap">${characterHTML('awa', { expression: 'concentration', size: 64, enter: false })}
          <div class="grow"><div class="label">${t("Avec Awa · Mode Focus")}</div><h3 style="margin:2px 0">${t("🥋 Dojo :")} ${fstats.today} ${t("min aujourd'hui")}</h3>
          <div class="tiny muted">${fstats.week} ${t("min sur 7 jours ·")} ${Math.round(fstats.total / 60 * 10) / 10} ${t("h au total ·")} ${fstats.pure} ${t("session(s) parfaite(s)")}</div></div></div></a>
      <a class="tile span-2 neon speedlines" href="#/stats" style="--c:${CHARACTERS.binta.color}">
        <div class="row nowrap">${characterHTML('binta', { expression: 'joie', size: 64, enter: false })}
          <div class="grow"><div class="label">${t("Avec Binta")}</div><h3 style="margin:2px 0">${t("📊 Stats, badges & récap")}</h3>
          <div class="tiny muted">${Object.keys(p.badges || {}).length} ${t("badge(s) débloqué(s)")}</div></div></div></a>
    </div>

    <div class="stack">
      ${isCreator() ? `<a class="btn block" href="#/createur" style="background:linear-gradient(135deg,#FFD23F,#A855F7);color:#1A1030">${t("👑 Panneau créateur")}</a>` : ''}
      <button class="btn block ghost" id="change">${t("🔄 Changer de compagnon")}</button>
      <button class="btn block ghost" id="rename">${t("✏️ Modifier mon prénom")}</button>
      <a class="btn block ghost" href="#/bienvenue">${t("👋 Revoir la présentation de l'équipe")}</a>
      <a class="btn block" href="#/reglages">${t("⚙️ Réglages (clé Gemini, thème, sauvegarde…)")}</a>
    </div>
  `;

  const compEl = el.querySelector('#comp .ch');
  compEl.onclick = () => { play(compEl, 'signature'); toast(`${comp.name} : ${line(p.companion, 'encouragement')}`); };

  el.querySelector('#rename').onclick = () => {
    const m = modal(`<h3>${t("✏️ Ton prénom")}</h3><input id="nm" type="text" maxlength="24" value="${esc(p.name)}">
      <div class="row end" style="margin-top:14px"><button class="btn ghost small" data-close>${t("Annuler")}</button><button class="btn small" id="ok">OK</button></div>`);
    m.el.querySelector('#ok').onclick = async () => {
      p.name = m.el.querySelector('#nm').value.trim() || p.name;
      await saveProfile(p);
      m.close();
      refresh();
    };
  };

  el.querySelector('#change').onclick = () => {
    const m = modal(`<h3>${t("Choisis ton compagnon")}</h3>
      <div class="pick-grid">${TEAM.map((id) => `
        <button class="pick ${id === p.companion ? 'sel' : ''}" data-id="${id}" style="--c:${CHARACTERS[id].color}">
          ${characterHTML(id, { expression: 'neutre', size: 76, enter: false })}
          <b>${esc(CHARACTERS[id].name)}</b><small>${esc(CHARACTERS[id].role)}</small></button>`).join('')}</div>`);
    m.el.querySelectorAll('.pick').forEach((b) => {
      b.onclick = async () => {
        p.companion = b.dataset.id;
        await saveProfile(p);
        vibrate();
        m.close();
        toast(`${CHARACTERS[p.companion].name} : ${line(p.companion, 'arrivee')}`, 'ok');
        refresh();
      };
    });
  };
}
