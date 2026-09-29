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

export async function render(el) {
  const p = getProfileSync();
  const [courses, cards, reviews, results] = await Promise.all([
    db.getAll('courses'), db.getAll('cards'), db.getAll('reviews'), db.getAll('results'),
  ]);
  const comp = CHARACTERS[p.companion] || CHARACTERS.kai;
  const streak = currentStreak(p);
  const aura = auraLevel(streak);
  const lv = levelInfo(p.xp);
  const quizzes = results.filter((r) => r.type === 'quiz');
  const avg = quizzes.length ? Math.round(quizzes.reduce((s, r) => s + (100 * r.score) / r.total, 0) / quizzes.length) : null;
  const nextAura = AURA_STEPS.find((s) => streak < s);

  el.innerHTML = `
    <div class="screen-head"><h1>👤 Profil</h1><span class="grow"></span>
      <a class="icon-btn" href="#/reglages" title="Réglages" style="text-decoration:none">⚙️</a></div>

    <div class="tile speedlines center" style="--c:${comp.color};background:linear-gradient(160deg, color-mix(in srgb, ${comp.color} 35%, var(--surface)), var(--surface) 70%);margin-bottom:12px">
      <div id="comp" style="display:flex;justify-content:center">${isCreator() ? `<span class="creator-aura">${characterHTML(p.companion, { expression: 'joie', size: 170, aura })}</span>` : characterHTML(p.companion, { expression: 'joie', size: 170, aura })}</div>
      <h2 style="margin:6px 0 0">${esc(displayName())} ${isCreator() ? '<span class="chip" style="background:linear-gradient(135deg,#FFD23F,#A855F7);color:#1A1030;border:0">👑 Créateur</span>' : ''}</h2>
      <div class="small muted">avec ${esc(comp.name)}, ${esc(comp.role.toLowerCase())}</div>
      <div class="bar" style="margin:12px auto 4px;max-width:320px"><div style="width:${Math.round(lv.progress * 100)}%"></div></div>
      <div class="tiny muted">Niveau ${lv.level}${isCreator() ? ' · <span class="creator-title">Créateur</span>' : ''} · ${p.xp} / ${lv.to} XP</div>
      <div class="tiny dim" style="margin-top:6px">${nextAura ? `Aura suivante à ${nextAura} jours de série (encore ${nextAura - streak})` : 'Aura maximale atteinte 👑'}</div>
    </div>

    <div class="bento" style="margin-bottom:12px">
      <div class="tile ${streak ? 'grad' : ''}"><div class="label">Série</div><div class="big">🔥 ${streak}</div><div class="tiny">record : ${p.bestStreak || 0} j</div></div>
      <div class="tile"><div class="label">Niveau</div><div class="big grad-text">${lv.level}</div><div class="tiny muted">${p.xp} XP au total</div></div>
      <div class="tile"><div class="label">Cours</div><div class="big">${courses.length}</div></div>
      <div class="tile"><div class="label">Fiches</div><div class="big">${cards.length}</div><div class="tiny muted">${reviews.length} révisions</div></div>
      <div class="tile span-2"><div class="label">Quiz</div>
        <div class="row between"><div class="big">${quizzes.length}</div><div class="small muted">moyenne ${avg === null ? '—' : `${avg} %`}</div></div></div>
      <a class="tile span-2 neon speedlines" href="#/stats" style="--c:${CHARACTERS.binta.color}">
        <div class="row nowrap">${characterHTML('binta', { expression: 'joie', size: 64, enter: false })}
          <div class="grow"><div class="label">Avec Binta</div><h3 style="margin:2px 0">📊 Stats, badges & récap</h3>
          <div class="tiny muted">${Object.keys(p.badges || {}).length} badge(s) débloqué(s)</div></div></div></a>
    </div>

    <div class="stack">
      ${isCreator() ? '<a class="btn block" href="#/createur" style="background:linear-gradient(135deg,#FFD23F,#A855F7);color:#1A1030">👑 Panneau créateur</a>' : ''}
      <button class="btn block ghost" id="change">🔄 Changer de compagnon</button>
      <button class="btn block ghost" id="rename">✏️ Modifier mon prénom</button>
      <a class="btn block ghost" href="#/bienvenue">👋 Revoir la présentation de l'équipe</a>
      <a class="btn block" href="#/reglages">⚙️ Réglages (clé Gemini, thème, sauvegarde…)</a>
    </div>
  `;

  const compEl = el.querySelector('#comp .ch');
  compEl.onclick = () => { play(compEl, 'signature'); toast(`${comp.name} : ${line(p.companion, 'encouragement')}`); };

  el.querySelector('#rename').onclick = () => {
    const m = modal(`<h3>✏️ Ton prénom</h3><input id="nm" type="text" maxlength="24" value="${esc(p.name)}">
      <div class="row end" style="margin-top:14px"><button class="btn ghost small" data-close>Annuler</button><button class="btn small" id="ok">OK</button></div>`);
    m.el.querySelector('#ok').onclick = async () => {
      p.name = m.el.querySelector('#nm').value.trim() || p.name;
      await saveProfile(p);
      m.close();
      refresh();
    };
  };

  el.querySelector('#change').onclick = () => {
    const m = modal(`<h3>Choisis ton compagnon</h3>
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
