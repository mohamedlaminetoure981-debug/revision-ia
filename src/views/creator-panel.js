// =====================================================================
// views/creator-panel.js — PANNEAU CRÉATEUR (visible seulement en Mode Créateur)
// ---------------------------------------------------------------------
//  - galerie de tous les persos avec toutes leurs expressions
//  - boutons de test : animations signature, pouvoirs (léger / fort /
//    ultime), conseil de correction (4 résultats), confettis, installation
//  - réinitialisation de l'appli + infos techniques
// Adresse : #/createur
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS, TEAM, EXPRESSIONS } from '../data/characters.js';
import { characterHTML, play } from '../ui/character.js';
import { esc, mascot, confirmBox, toast } from '../ui/ui.js';
import { power } from '../ui/powers.js';
import { runWithCouncil } from '../ui/council.js';
import { confetti, onomatopoeia } from '../ui/fx.js';
import { openInstall } from '../ui/install.js';
import { creatorWelcome } from '../ui/creator-scene.js';
import { creatorName } from '../core/creator.js';

const LEVELS = [
  { level: 'excellent', label: '19/20', name: '🏆 Excellent' },
  { level: 'bon', label: '14/20', name: '👍 Bon' },
  { level: 'moyen', label: '10/20', name: '💪 Moyen' },
  { level: 'a_retravailler', label: '5/20', name: '📚 Faible' },
];

export async function render(el) {
  const [courses, cards, model] = await Promise.all([db.getAll('courses'), db.getAll('cards'), db.getSetting('model')]);
  let expr = 'neutre';

  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/profil">←</a><h1>👑 Panneau créateur</h1></div>
    <div class="tile" style="margin-bottom:12px">${mascot('mory', { situation: 'arrivee', expression: 'joie', size: 80 })}</div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">🎨 Galerie des personnages</h2>
      <div class="seg" id="expr" style="flex-wrap:wrap">${EXPRESSIONS.map((e) => `<button data-e="${e}" class="${e === expr ? 'active' : ''}" style="flex:1 0 24%;font-size:.72rem">${e}</button>`).join('')}</div>
      <div id="gallery" class="pick-grid" style="margin-top:12px"></div>
      <label class="check"><span>Tout afficher (toutes les expressions)</span>
        <span class="switch"><input id="all" type="checkbox"><span></span></span></label>
      <div id="all-box"></div>
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">✨ Animations signature</h2>
      <div class="panel-grid">${TEAM.map((id) => `<button class="btn ghost" data-sig="${id}" style="color:${CHARACTERS[id].color}">${esc(CHARACTERS[id].name)}</button>`).join('')}</div>
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">⚡ Pouvoirs</h2>
      <p class="tiny muted">Le panneau ignore la limite « 1 ultime par session ». Le réglage « Scène de correction » s'applique toujours.</p>
      ${TEAM.map((id) => `
        <div class="row nowrap" style="margin:6px 0">
          <strong class="grow small" style="color:${CHARACTERS[id].color}">${esc(CHARACTERS[id].name)} · ${esc(CHARACTERS[id].power?.name || '')}</strong>
          <button class="btn ghost small" data-pw="${id}" data-l="light">Légère</button>
          <button class="btn ghost small" data-pw="${id}" data-l="strong">Forte</button>
          <button class="btn small" data-pw="${id}" data-l="ultimate">Ultime</button>
        </div>`).join('')}
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">🎬 Conseil de correction</h2>
      <div class="panel-grid">${LEVELS.map((l, i) => `<button class="btn ghost" data-council="${i}">${l.name}</button>`).join('')}</div>
      <h2>🎉 Divers</h2>
      <div class="panel-grid">
        <button class="btn ghost" id="t-confetti">Confettis</button>
        <button class="btn ghost" id="t-ono">Onomatopée</button>
        <button class="btn ghost" id="t-install">Installation</button>
        <button class="btn ghost" id="t-welcome">Accueil créateur</button>
      </div>
    </div>

    <div class="tile" style="margin-bottom:12px">
      <h2 style="margin-top:0">🛠️ Infos techniques</h2>
      <table class="data-table">
        <tr><td>Version</td><td><strong>${esc(__APP_VERSION__)}</strong> (construite le ${esc(__BUILD_DATE__)})</td></tr>
        <tr><td>Modèle Gemini</td><td>${esc(model)}</td></tr>
        <tr><td>Cours</td><td>${courses.length}</td></tr>
        <tr><td>Fiches</td><td>${cards.length}</td></tr>
        <tr><td>Créateur</td><td>${esc(creatorName())}</td></tr>
        <tr><td>Installée</td><td>${window.matchMedia('(display-mode: standalone)').matches ? 'oui' : 'non (navigateur)'}</td></tr>
      </table>
      <button class="btn danger block" id="reset" style="margin-top:12px">♻️ Réinitialiser l'appli</button>
      <p class="tiny muted">Efface cours, fiches, résultats et progression. La clé API et le Mode Créateur sont gardés.</p>
    </div>
  `;

  const $ = (s) => el.querySelector(s);

  // --- Galerie ---
  const drawGallery = () => {
    $('#gallery').innerHTML = TEAM.map((id) => `
      <button class="pick" data-g="${id}" style="--c:${CHARACTERS[id].color}">
        ${characterHTML(id, { expression: expr, size: 90, enter: false })}<b>${esc(CHARACTERS[id].name)}</b><small>${esc(expr)}</small></button>`).join('');
    el.querySelectorAll('[data-g]').forEach((b) => { b.onclick = () => play(b.querySelector('.ch'), 'signature'); });
  };
  drawGallery();
  el.querySelectorAll('[data-e]').forEach((b) => {
    b.onclick = () => {
      expr = b.dataset.e;
      el.querySelectorAll('[data-e]').forEach((x) => x.classList.toggle('active', x === b));
      drawGallery();
    };
  });
  // Toutes les expressions de tous les persos (pour comparer d'un coup d'œil).
  $('#all').onchange = (e) => {
    $('#all-box').innerHTML = e.target.checked ? TEAM.map((id) => `
      <h3 style="color:${CHARACTERS[id].color};margin:12px 0 4px">${esc(CHARACTERS[id].name)}</h3>
      <div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:4px">${EXPRESSIONS.map((x) => `
        <div class="center tiny dim">${characterHTML(id, { expression: x, size: 76, enter: false })}${x}</div>`).join('')}</div>`).join('') : '';
  };

  el.querySelectorAll('[data-sig]').forEach((b) => {
    b.onclick = () => {
      const target = el.querySelector(`#gallery [data-g="${b.dataset.sig}"] .ch`);
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); play(target, 'signature'); }
    };
  });

  el.querySelectorAll('[data-pw]').forEach((b) => {
    b.onclick = () => {
      try { sessionStorage.removeItem('ultimateUsed'); } catch { /* ignoré */ }
      const target = el.querySelector(`#gallery [data-g="${b.dataset.pw}"] .ch`);
      if (b.dataset.l !== 'ultimate') target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => power(b.dataset.pw, b.dataset.l, { target, sub: 'Test du panneau créateur' }), b.dataset.l === 'ultimate' ? 0 : 350);
    };
  });

  el.querySelectorAll('[data-council]').forEach((b) => {
    b.onclick = () => {
      const l = LEVELS[Number(b.dataset.council)];
      runWithCouncil({
        owner: 'ren', title: `Test : ${l.name}`,
        task: () => new Promise((r) => setTimeout(r, 600)),
        toResult: () => ({ level: l.level, label: l.label }),
      });
    };
  });

  $('#t-confetti').onclick = () => confetti(160);
  $('#t-ono').onclick = () => onomatopoeia('YOSH!');
  $('#t-install').onclick = () => openInstall();
  $('#t-welcome').onclick = () => creatorWelcome();

  $('#reset').onclick = async () => {
    if (!(await confirmBox('Réinitialiser l’appli ? Tous les cours, fiches, résultats et la progression seront effacés (clé API et Mode Créateur gardés).', 'Réinitialiser'))) return;
    for (const st of ['courses', 'images', 'cards', 'quizzes', 'results', 'reviews', 'exercises', 'exams']) await db.clear(st);
    await db.setSetting('profile', null);
    toast('Appli réinitialisée.');
    location.hash = '#/bienvenue';
    location.reload();
  };
}
