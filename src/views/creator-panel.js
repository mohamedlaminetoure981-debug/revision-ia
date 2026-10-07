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
import { playSfx, voice, VOICE_LIST, AMBIENT_LIST, startAmbient, stopAmbient } from '../ui/sfx.js';
import { cardHTML } from '../ui/card.js';
import { RARITIES } from '../core/collection.js';
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
        <button class="btn ghost" id="t-portraits">🧑 Personnages en images</button>
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
      <h3>🎞️ Bande dessinée (Mode Histoire)</h3>
      <div class="panel-grid">
        <select id="t-bd-char">${TEAM.map((id) => `<option value="${id}">${esc(CHARACTERS[id].name)}</option>`).join('')}<option value="etudiant">Figurant : étudiant</option><option value="vendeuse">Figurant : vendeuse</option><option value="oubli">L'Oubli</option></select>
        <button class="btn ghost" id="t-bd-poses">Galerie des poses</button>
        <button class="btn ghost" id="t-bd-decors">Galerie des décors</button>
        <button class="btn ghost" id="t-bd-images">🖼️ Illustrations des cases</button>
        <button class="btn ghost" id="t-bd-bubbles">✏️ Éditer les bulles</button>
      </div>
      <p class="tiny muted">Planches enregistrées : ${mangaCount}. Le boss démo n'enregistre rien.</p>
      <h3>⚔️ Duels & statut WhatsApp</h3>
      <div class="panel-grid">
        <button class="btn ghost" id="t-duel">Ouvrir un duel démo</button>
        <button class="btn ghost" id="t-duel-link">Longueur d'un lien (10 q.)</button>
        <button class="btn ghost" id="t-status">Statut démo</button>
        <button class="btn ghost" id="t-status-lv">Statut niveau</button>
      </div>
      <h3>🃏 Cartes & 🥋 Focus</h3>
      <div class="panel-grid">
        <a class="btn ghost" href="#/collection">Classeur</a>
        <button class="btn ghost" id="t-pack">Rouvrir toutes les cartes</button>
        <button class="btn ghost" id="t-legend">Carte légendaire démo</button>
        <a class="btn ghost" href="#/dojo/test">Dojo : session d'1 min</a>
        ${AMBIENT_LIST.map((a) => `<button class="btn ghost" data-amb="${a}">Ambiance ${a}</button>`).join('')}
        <button class="btn ghost" id="t-amb-stop">Couper l'ambiance</button>
      </div>
      <h3>🧠 Explique-moi & 🌙 Veille</h3>
      <div class="panel-grid">
        <a class="btn ghost" href="#/feynman">Explique-moi (choix)</a>
        <a class="btn ghost" href="#/veille/nouveau">Nouvelle veille</a>
        <button class="btn ghost" id="t-veille-done">Veille : tout cocher sauf l'examen</button>
        <button class="btn ghost" id="t-veille-reset">Effacer la veille</button>
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
  // Rangées qui passent à la ligne (jamais de défilement horizontal) et assez de marge
  // autour de chaque portrait pour la respiration et les petits mouvements.
  $('#all').onchange = (e) => {
    $('#all-box').innerHTML = e.target.checked ? TEAM.map((id) => `
      <h3 style="color:${CHARACTERS[id].color};margin:12px 0 4px">${esc(CHARACTERS[id].name)}</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:12px 6px;padding:6px 4px">${EXPRESSIONS.map((x) => `
        <div class="tiny dim" style="display:flex;flex-direction:column;align-items:center;gap:2px">${characterHTML(id, { expression: x, size: 76, enter: false })}${x}</div>`).join('')}</div>`).join('') : '';
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
  // --- Cartes & focus ---
  $('#t-pack').onclick = async () => { await db.setSetting('collection', {}); location.hash = '#/collection/ouvrir'; };
  $('#t-legend').onclick = () => {
    const it = { card: { id: 'demo-legende', question: 'Théorème de Pythagore', answer: 'Dans un triangle rectangle : a² + b² = c² (c = hypoténuse).' },
      course: { subject: 'Maths', title: 'Démo' }, rarity: RARITIES[3], char: 'binta', num: 99 };
    modal(`<div class="center"><div class="card-big">${cardHTML(it, 'big')}</div><button class="btn block" data-close style="margin-top:12px">Fermer</button></div>`);
    playSfx('badge');
  };
  el.querySelectorAll('[data-amb]').forEach((b) => { b.onclick = () => startAmbient(b.dataset.amb); });
  $('#t-amb-stop').onclick = () => stopAmbient();
  window.addEventListener('hashchange', stopAmbient, { once: true });
  // --- Veille ---
  $('#t-veille-done').onclick = async () => {
    const v = await db.getSetting('veille');
    if (!v) { toast('Crée d’abord une veille.'); return; }
    v.plan.forEach((b) => { if (b.type !== 'final') b.done = true; });
    delete v.finishedAt;
    await db.setSetting('veille', v);
    location.hash = '#/veille';
  };
  $('#t-veille-reset').onclick = async () => { await db.setSetting('veille', null); toast('Veille effacée.'); };
  // --- BD : galeries pour vérifier poses et décors ---
  $('#t-bd-poses').onclick = async () => {
    const id = $('#t-bd-char').value;
    const [{ bodySVG }, { POSE_NAMES }, { oubliSVG }] = await Promise.all([import('../comic/body.js'), import('../data/comic/poses.js'), import('../comic/entities.js')]);
    const list = id === 'oubli' ? ['flotte', 'attaque', 'recul', 'cri'] : POSE_NAMES;
    const cells = list.map((p) => {
      const r = id === 'oubli' ? oubliSVG(p) : bodySVG(id, p, { expr: 'neutre' });
      return `<figure class="bd-cell"><svg viewBox="-420 ${id === 'oubli' ? -1000 : -800} 840 ${id === 'oubli' ? 1060 : 860}">${r.svg}</svg><figcaption>${p}</figcaption></figure>`;
    }).join('');
    modal(`<h3>Poses · ${esc(id)}</h3><div class="bd-gallery">${cells}</div><button class="btn block" data-close style="margin-top:10px">Fermer</button>`);
  };
  $('#t-bd-decors').onclick = async () => {
    const { decorSVG, DECORS } = await import('../comic/decors.js');
    const times = ['aube', 'jour', 'couchant', 'nuit', 'pluie'];
    let cells = '';
    Object.keys(DECORS).forEach((d, i) => {
      const t = times[i % times.length];
      cells += `<figure class="bd-cell wide"><svg viewBox="0 0 600 400">${decorSVG(d, 600, 400, { time: t, seed: i + 1, text: 'Message de test', from: 'TEST' })}</svg><figcaption>${d} · ${t}</figcaption></figure>`;
    });
    modal(`<h3>Décors</h3><div class="bd-gallery">${cells}</div><button class="btn block" data-close style="margin-top:10px">Fermer</button>`);
  };
  // --- BD : quelles cases ont leur illustration (public/story/…) ---
  $('#t-bd-images').onclick = async () => {
    const [{ hasComic, loadComic }, { storyImage, storyFileName }] = await Promise.all([import('../data/comic/index.js'), import('../comic/story-images.js')]);
    let html = '';
    let done = 0;
    let total = 0;
    for (let id = 1; id <= 12; id++) {
      if (!hasComic(id)) continue;
      const ch = await loadComic(id);
      let rows = '';
      let n = 0;
      let screens = 0;
      ch.pages.forEach((page, p) => (page.panels || []).forEach((panel, c) => {
        // Écran de téléphone ou cahier dessiné par l'appli : aucune illustration à faire.
        const own = { ecran: '📱 écran de l\'appli', cahier: '📓 dessin de l\'appli (cahier)', graphe: '📓 dessin de l\'appli (graphe)' }[panel.bg?.id];
        if (own) {
          screens++;
          rows += `<li style="margin:6px 0">${own} (pas d'image) · <b>page ${p + 1}, case ${c + 1}</b>
            ${panel.action ? `<div class="tiny dim">${esc(panel.action)}</div>` : ''}</li>`;
          return;
        }
        const ok = !!storyImage(id, p, c);
        total++; if (ok) { done++; n++; }
        rows += `<li style="margin:6px 0">${ok ? '✅ illustrée' : '⬜ dessin SVG'} · <b>page ${p + 1}, case ${c + 1}</b><br>
          <code style="user-select:all;font-size:12px">${esc(storyFileName(id, p, c))}</code>
          ${panel.action ? `<div class="tiny dim">${esc(panel.action)}</div>` : ''}</li>`;
      }));
      const count = ch.pages.reduce((s, pg) => s + (pg.panels || []).length, 0);
      html += `<details style="margin:8px 0"><summary><b>Chapitre ${id} — ${esc(ch.title)}</b> · ${count} cases · ${n}/${count - screens} illustrées${screens ? ` · ${screens} dessinées par l'appli` : ''}</summary><ul style="list-style:none;padding:0">${rows}</ul></details>`;
    }
    modal(`<h3>🖼️ Illustrations des cases (${done}/${total})</h3>
      <p class="tiny muted">Dépose l'image sur github.com dans le dossier indiqué (.webp, .png ou .jpg), avec ce nom exact. Elle remplace le dessin au prochain déploiement. Voir le README.</p>
      ${html}<button class="btn block" data-close style="margin-top:10px">Fermer</button>`);
  };
  // --- Personnages en images : aperçu des expressions découpées des planches ---
  $('#t-portraits').onclick = async () => {
    const { characterImages } = await import('../ui/character.js');
    const SHEETS = { a: ['neutre', 'joie', 'reflexion', 'celebration'], b: ['encouragement', 'surprise', 'concentration', 'clin'] };
    const base = import.meta.env.BASE_URL;
    const rows = TEAM.map((id) => {
      const imgs = characterImages(id);
      const done = Object.values(SHEETS).flat().filter((e) => imgs[e]).length;
      const cells = Object.values(SHEETS).flat().map((e) => `<figure class="pt-cell">${imgs[e]
        ? `<img src="${base}${imgs[e].src}" alt="${e}" loading="lazy"><button class="btn ghost small" data-dl="${id}:${e}" style="margin-top:4px;padding:2px 6px;font-size:.7rem">⬇️ Télécharger</button>`
        : '<span class="tiny dim">dessin SVG</span>'}<figcaption>${e}</figcaption></figure>`).join('');
      const cal = imgs.calques || {};
      return `<h3 style="color:${CHARACTERS[id].color};margin:14px 0 4px">${esc(CHARACTERS[id].name)}</h3>
        <p class="tiny" style="margin:0 0 6px">${done === 8 ? '✅' : done ? '🟨' : '⬜'} ${done}/8 expressions en images ·
        <code style="user-select:all">public/characters/${id}/</code><br>
        😉 Clignement : ${cal.blink ? '✅ actif' : '⬜ <code>yeux-fermes.png</code> à déposer'} · 👄 Bouche : ${cal.mouth ? '✅ active' : '⬜ <code>bouche-ouverte.png</code> à déposer'}</p>
        <div class="pt-grid">${cells}</div>`;
    }).join('');
    const m = modal(`<h3>🧑 Personnages en images</h3>
      <p class="tiny muted">⬇️ <strong>Télécharger</strong> : le portrait découpé, en PNG sur fond vert uni (à donner à Gemini). Pour le clignement et la bouche : télécharge le portrait <strong>neutre</strong>, fais-le retoucher (yeux fermés / bouche ouverte, rien d'autre ne change), puis dépose <code>yeux-fermes.png</code> et <code>bouche-ouverte.png</code> dans le dossier du perso. Voir le README.</p>
      <p class="tiny muted">Par défaut : grille 2 × 2 (A : neutre, joie, réflexion, célébration · B : encouragement, surprise, concentration, clin). Autre grille, choix de cases, planches en plus (planche-c, planche-d…) ou planche à un seul portrait : fichier planches.json dans le dossier du perso. Fond uni (vert de préférence), détecté automatiquement. Le damier montre la transparence : aucun vert ne doit rester. Voir le README.</p>
      <div style="max-height:62vh;overflow-y:auto">${rows}</div>
      <button class="btn block" data-close style="margin-top:10px">Fermer</button>`);
    // Téléchargement : portrait grand format (720 × 835) posé sur un fond vert uni, en PNG.
    m.el.querySelectorAll('[data-dl]').forEach((b) => {
      b.onclick = async () => {
        const [id, e] = b.dataset.dl.split(':');
        const img = characterImages(id)[e];
        b.disabled = true;
        try {
          const blob = await (await fetch(`${base}${img.large || img.src}`)).blob();
          const bmp = await createImageBitmap(blob);
          const cv = document.createElement('canvas');
          cv.width = bmp.width; cv.height = bmp.height;
          const ctx = cv.getContext('2d');
          ctx.fillStyle = '#00FF00';
          ctx.fillRect(0, 0, cv.width, cv.height);
          ctx.drawImage(bmp, 0, 0);
          const png = await new Promise((r) => cv.toBlob(r, 'image/png'));
          const a = document.createElement('a');
          a.href = URL.createObjectURL(png);
          a.download = `${id}-${e}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 5000);
          toast(`⬇️ ${id}-${e}.png téléchargé`, 'ok');
        } catch (err) {
          toast(`Téléchargement impossible : ${err.message}`, 'error');
        } finally {
          b.disabled = false;
        }
      };
    });
  };
  $('#t-bd-bubbles').onclick = async () => {
    const { openBubbleEditor } = await import('./bubble-editor.js');
    openBubbleEditor();
  };
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
