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
import { esc, mascot, confirmBox, toast, modal } from '../ui/ui.js';
import { power } from '../ui/powers.js';
import { runWithCouncil } from '../ui/council.js';
import { confetti, onomatopoeia } from '../ui/fx.js';
import { openInstall } from '../ui/install.js';
import { creatorWelcome } from '../ui/creator-scene.js';
import { creatorName } from '../core/creator.js';
import { speedSection, bindSpeed } from './creator-speed.js';
import { playSfx, voice, VOICE_LIST } from '../ui/sfx.js';
import { stripSVG, stripToPng } from '../ui/manga.js';
import { shareImage } from '../ui/share.js';
import { DEMO_STRIP } from '../core/manga.js';
import { storyState, saveStory } from '../core/story.js';
import { makeDuel, encodeDuel, duelLink } from '../core/duel.js';
import { offerStatus } from '../ui/status.js';

const LEVELS = [
  { level: 'excellent', label: '19/20', name: '🏆 Excellent' },
  { level: 'bon', label: '14/20', name: '👍 Bon' },
  { level: 'moyen', label: '10/20', name: '💪 Moyen' },
  { level: 'a_retravailler', label: '5/20', name: '📚 Faible' },
];

export async function render(el) {
  const [courses, cards, model, story, mangaCount] = await Promise.all([db.getAll('courses'), db.getAll('cards'), db.getSetting('model'), storyState(), db.getAll('mangas').then((m) => m.length)]);
  let expr = 'neutre';

  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/profil">←</a><h1>👑 Panneau créateur</h1></div>
    <div class="tile" style="margin-bottom:12px">${mascot('mory', { situation: 'arrivee', expression: 'joie', size: 80 })}</div>
    ${await speedSection()}

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
      <h2 style="margin-top:0">🔊 Sons</h2>
      <div class="panel-grid">
        ${[['click', 'Clic'], ['teleport', 'Téléport'], ['sparkle', 'Étoiles'], ['bubble', 'Bulle'],
          ['good', 'Juste'], ['bad', 'Faux'], ['flip', 'Retourner'], ['level', 'Niveau'],
          ['badge', 'Badge'], ['reveal', 'Note']].map(([n, l]) => `<button class="btn ghost" data-sfx="${n}">${l}</button>`).join('')}
        ${[1, 2, 3].map((l) => `<button class="btn ghost" data-sfx="energy" data-arg="${l}">Énergie ${l}</button>`).join('')}
        ${['right', 'left', 'up', 'down'].map((d) => `<button class="btn ghost" data-sfx="swipe" data-arg="${d}">Swipe ${{ right: '→', left: '←', up: '↑', down: '↓' }[d]}</button>`).join('')}
      </div>
      <h3>Voix des persos</h3>
      <div class="panel-grid">${VOICE_LIST.map((id) => `<button class="btn ghost" data-voice="${id}" style="color:${CHARACTERS[id].color}">${esc(CHARACTERS[id].name)}</button>`).join('')}</div>
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
      <h2 style="margin-top:0">🆕 Nouvelles fonctions</h2>
      <h3>📖 Cours en manga & Histoire</h3>
      <div class="panel-grid">
        <button class="btn ghost" id="t-manga">Planche démo</button>
        <button class="btn ghost" id="t-manga-png">Image de la planche</button>
        <button class="btn ghost" id="t-story-all">${story.unlockAll ? '🔓 Chapitres : tous ouverts' : '🔒 Chapitres : normal'}</button>
        <a class="btn ghost" href="#/histoire/1">Lire le chapitre 1</a>
        <a class="btn ghost" href="#/boss/__demo">Boss démo</a>
        <button class="btn ghost" id="t-story-reset">Remettre l'histoire à zéro</button>
      </div>
      <p class="tiny muted">Planches enregistrées : ${mangaCount}. Le boss démo n'enregistre rien.</p>
      <h3>⚔️ Duels & statut WhatsApp</h3>
      <div class="panel-grid">
        <button class="btn ghost" id="t-duel">Ouvrir un duel démo</button>
        <button class="btn ghost" id="t-duel-link">Longueur d'un lien (10 q.)</button>
        <button class="btn ghost" id="t-status">Statut démo</button>
        <button class="btn ghost" id="t-status-lv">Statut niveau</button>
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
  bindSpeed(el);

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

  el.querySelectorAll('[data-sfx]').forEach((b) => {
    b.onclick = () => { const a = b.dataset.arg; playSfx(b.dataset.sfx, a && /^\d$/.test(a) ? Number(a) : a); };
  });
  el.querySelectorAll('[data-voice]').forEach((b) => { b.onclick = () => voice(b.dataset.voice); });
  $('#t-confetti').onclick = () => confetti(160);
  $('#t-ono').onclick = () => onomatopoeia('YOSH!');
  $('#t-install').onclick = () => openInstall();
  $('#t-welcome').onclick = () => creatorWelcome();

  // --- Nouvelles fonctions : manga & histoire ---
  $('#t-manga').onclick = () => {
    modal(`<div class="manga-frame" style="--c:${CHARACTERS.nia.color}">${stripSVG(DEMO_STRIP, { subtitle: 'Démo' })}</div>
      <button class="btn block" data-close style="margin-top:10px">Fermer</button>`);
    playSfx('page');
  };
  $('#t-manga-png').onclick = async () => shareImage(await stripToPng(DEMO_STRIP, { subtitle: 'Démo' }), 'manga-demo.png', 'Planche démo');
  $('#t-story-all').onclick = async () => {
    await saveStory({ ...story, unlockAll: !story.unlockAll });
    toast(story.unlockAll ? 'Chapitres : déblocage normal.' : 'Tous les chapitres et boss sont ouverts (Mode Créateur).', 'ok');
    render(el);
  };
  // --- Duels & statut ---
  const demoDuel = (n) => makeDuel({
    questions: Array.from({ length: n }, (_, k) => ({ question: `Question démo ${k + 1} : combien font ${k + 2} × 3 ?`, choices: [String((k + 2) * 3), String((k + 2) * 3 + 1), String(k + 5), '0'], correctIndex: 0, explanation: `${k + 2} × 3 = ${(k + 2) * 3}. On multiplie simplement, rien de plus (explication de démonstration un peu longue pour tester le lien).` })),
    title: 'Tables de multiplication', subject: 'Maths', score: 7, name: 'Ren (démo)', charId: 'ren',
  });
  $('#t-duel').onclick = () => { location.hash = `#/duel/${encodeDuel(demoDuel(5))}`; };
  $('#t-duel-link').onclick = () => toast(`Lien de duel avec 10 questions : ${duelLink(demoDuel(10)).length} caractères (WhatsApp accepte très largement).`, 'ok', 6000);
  $('#t-status').onclick = () => offerStatus({ kicker: 'Examen blanc', big: '17/20', sub: 'Test du créateur', lines: ['Excellent !'] });
  $('#t-status-lv').onclick = () => offerStatus({ kicker: 'Nouveau niveau', big: 'NIV. 9', sub: 'Level up !' });
  $('#t-story-reset').onclick = async () => {
    await db.setSetting('story', null);
    toast('Histoire remise à zéro (chapitres lus, boss vaincus).');
    render(el);
  };

  $('#reset').onclick = async () => {
    if (!(await confirmBox('Réinitialiser l’appli ? Tous les cours, fiches, résultats et la progression seront effacés (clé API et Mode Créateur gardés).', 'Réinitialiser'))) return;
    for (const st of ['courses', 'images', 'cards', 'quizzes', 'results', 'reviews', 'exercises', 'exams', 'mangas', 'focus']) await db.clear(st);
    await db.setSetting('story', null);
    await db.setSetting('profile', null);
    toast('Appli réinitialisée.');
    location.hash = '#/bienvenue';
    location.reload();
  };
}
