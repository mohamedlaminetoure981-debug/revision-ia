// =====================================================================
// views/home.js — Accueil (Kaï + ton compagnon)
// Salut perso, série 🔥, XP/niveau, objectifs du jour, fiches du jour,
// bouton "Continuer".
// =====================================================================

import * as db from '../core/db.js';
import { storyOverview } from '../core/story.js';
import { pendingCount } from '../core/collection.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play } from '../ui/character.js';
import { esc, mascot, say, line, subjectColor, subjectEmoji, displayName } from '../ui/ui.js';
import { isCreator } from '../core/creator.js';
import { isDue, today } from '../core/srs.js';
import { getProfileSync, currentStreak, activeToday, levelInfo, goals, auraLevel } from '../core/game.js';

/** Fait défiler un nombre de 0 à sa valeur (compteur animé). */
function countUp(el, to, ms = 900) {
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    el.textContent = Math.round(to * (1 - (1 - t) ** 3));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export async function render(el) {
  const p = getProfileSync();
  const [courses, cards, apiKey, story] = await Promise.all([db.getAll('courses'), db.getAll('cards'), db.getSetting('apiKey'), storyOverview()]);
  const unlocked = story.chapters.filter((c) => c.unlocked);
  const unread = unlocked.filter((c) => !c.read).length;
  const bossReady = story.arcs.some((a) => a.ready && !a.defeated);
  const pending = await pendingCount();
  const due = cards.filter((c) => isDue(c)).length;
  const streak = currentStreak(p);
  const lv = levelInfo(p.xp);
  const gl = goals(p);
  const comp = CHARACTERS[p.companion] || CHARACTERS.kai;
  const aura = auraLevel(streak);
  const hour = new Date().getHours();
  const hello = hour < 5 ? 'Encore debout' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Salut' : 'Bonsoir';

  // Que propose le bouton "Continuer" ?
  const lastCourse = [...courses].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  let next;
  if (due) next = { href: '#/review', label: `🔁 Réviser ${due} fiche${due > 1 ? 's' : ''}` };
  else if (lastCourse && !lastCourse.summary) next = { href: `#/course/${lastCourse.id}/resume`, label: '📖 Continuer mon dernier cours' };
  else if (lastCourse && !gl.find((g) => g.id === 'quizzes').done) next = { href: '#/quiz', label: '🎯 Défier Ren au quiz' };
  else next = { href: '#/ajouter', label: '➕ Ajouter un cours' };

  el.innerHTML = `
    <div class="hello">
      ${mascot('kai', { text: `${hello} ${displayName()} ! ${line('kai', streak ? 'arrivee' : 'encouragement')}`, expression: 'joie', size: 96 })}
    </div>

    ${apiKey ? '' : `
      <a class="tile neon" href="#/reglages" style="--c:${CHARACTERS.tidiane.color};margin-bottom:12px">
        <div class="row nowrap">${characterHTML('tidiane', { expression: 'neutre', size: 56, enter: false })}
        <div class="grow"><strong>Colle ta clé Gemini pour activer l'IA</strong>
          <div class="small muted">Tranquille, ça prend 2 minutes. Touche ici →</div></div></div>
      </a>`}

    <div class="bento">
      <div class="tile span-2 speedlines companion-tile" style="--c:${comp.color};background:linear-gradient(135deg, color-mix(in srgb, ${comp.color} 30%, var(--surface)), var(--surface) 70%)">
        <div id="comp">${isCreator() ? `<span class="creator-aura">${characterHTML(p.companion, { expression: 'joie', size: 118, aura })}</span>` : characterHTML(p.companion, { expression: 'joie', size: 118, aura })}</div>
        <div class="grow">
          <div class="label">Niveau ${isCreator() ? '<span class="creator-title">👑 Créateur</span>' : ''}</div>
          <div class="big"><span class="count" id="lvl">${lv.level}</span></div>
          <div class="bar" style="margin:8px 0 4px"><div id="xpbar" style="width:0%"></div></div>
          <div class="tiny muted"><span class="count" id="xp">0</span> / ${lv.to} XP</div>
          <div class="tiny dim" style="margin-top:4px">${esc(comp.name)} · ${aura ? `aura niv. ${aura} ✨` : 'aura au jour 3 de série'}</div>
        </div>
      </div>

      <div class="tile ${streak ? 'grad' : ''}">
        <div class="label">Série</div>
        <div class="streak ${streak ? '' : 'cold'}">🔥 <span class="count" id="streak">${streak}</span></div>
        <div class="tiny">${activeToday(p) ? 'Validé aujourd’hui ✓' : streak ? 'Révise pour la garder !' : 'Lance ta série !'}</div>
      </div>

      <a class="tile ${due ? 'grad-green' : ''}" href="#/review">
        <div class="label">Fiches du jour</div>
        <div class="big"><span class="count" id="due">${due}</span></div>
        <div class="tiny">${due ? 'à swiper avec Sora' : 'Tout est à jour 🎉'}</div>
      </a>

      <div class="tile span-2">
        <div class="row between"><h2 style="margin:0">Objectifs du jour</h2>
          <span class="chip neon" style="--c:var(--neon-green)">+${p.daily?.day === today() ? p.daily.xp : 0} XP</span></div>
        ${gl.map((g) => `
          <div class="goal ${g.done ? 'done' : ''}">
            <span class="tick">${g.done ? '✓' : g.icon}</span>
            <span class="txt grow">${esc(g.label)}</span>
            <span class="small muted">${g.value}/${g.target}</span>
          </div>`).join('')}
      </div>

      <a class="btn block span-2 pulse" href="${next.href}">${next.label}</a>

      <a class="tile dojo-tile" href="#/dojo" style="--c:${CHARACTERS.awa.color}">
        <div class="label">Mode Focus</div><div class="big">🥋</div><div class="tiny">Dojo d'Awa</div></a>
      <a class="tile" href="#/collection" style="--c:${CHARACTERS.sora.color};position:relative">
        <div class="label">Collection</div><div class="big">🃏</div><div class="tiny">${pending ? `🎁 ${pending} à ouvrir` : 'Mes cartes'}</div>
        ${pending ? '<span class="dot-new" style="position:absolute;top:10px;right:10px"></span>' : ''}</a>

      <a class="tile span-2 story-tile" href="#/histoire">
        <div class="row nowrap">${characterHTML('kai', { expression: unread ? 'celebration' : 'clin', size: 60, enter: false })}
          <div class="grow"><div class="label">Mode Histoire · ${unlocked.length}/12</div>
            <strong>${unread ? `📖 ${unread} chapitre${unread > 1 ? 's' : ''} à lire !` : bossReady ? '💀 Un boss t’attend…' : 'La Jeunesse contre l’Oubli'}</strong>
            <div class="tiny muted">Révise pour débloquer la suite de l’histoire.</div></div>
          ${unread || bossReady ? '<span class="dot-new"></span>' : ''}</div>
      </a>

      ${lastCourse ? `
        <a class="tile span-2 course-card" href="#/course/${lastCourse.id}" style="--c:${subjectColor(lastCourse.subject)}">
          <span class="deco">${subjectEmoji(lastCourse.subject)}</span>
          <div class="label">Dernier cours · ${esc(lastCourse.subject)}</div>
          <h3 style="margin:4px 0 0">${esc(lastCourse.title)}</h3>
        </a>` : ''}
    </div>
  `;

  // Animations : compteurs qui défilent + barre d'XP.
  countUp(el.querySelector('#xp'), p.xp);
  requestAnimationFrame(() => { el.querySelector('#xpbar').style.width = `${Math.round(lv.progress * 100)}%`; });

  // Toucher le compagnon : il réagit avec sa réplique.
  const compEl = el.querySelector('#comp .ch');
  compEl.onclick = () => {
    play(compEl, 'signature');
    say(el.querySelector('.hello'), null, { text: `${comp.name} : « ${line(p.companion, 'encouragement')} »`, anim: null });
  };
  setTimeout(() => play(compEl, 'signature'), 700);
}
