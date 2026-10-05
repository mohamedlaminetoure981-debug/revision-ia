// =====================================================================
// views/welcome.js — Première ouverture (Kaï)
//   1. Kaï se présente et demande ton prénom
//   2. Il présente l'équipe (un perso par écran)
//   3. Tu choisis ton compagnon, affiché ensuite sur l'accueil
// Accessible aussi depuis Profil → "Revoir la présentation".
// =====================================================================

import { CHARACTERS, TEAM } from '../data/characters.js';
import { characterHTML, play } from '../ui/character.js';
import { esc, line } from '../ui/ui.js';
import { createProfile, getProfileSync, saveProfile } from '../core/game.js';
import { confetti, onomatopoeia, vibrate, sound } from '../ui/fx.js';

export async function render(el) {
  const existing = getProfileSync();
  let name = existing?.name || (() => { try { return localStorage.getItem('duelName') || ''; } catch { return ''; } })();
  let step = 0; // 0 = prénom, 1..n = équipe, n+1 = choix du compagnon
  let chosen = existing?.companion || null;
  const others = TEAM; // toute l'équipe, Kaï compris

  function draw() {
    if (step === 0) return drawIntro();
    if (step <= others.length) return drawMember(others[step - 1]);
    return drawPick();
  }

  // --- 1. Kaï se présente ---
  function drawIntro() {
    const kai = CHARACTERS.kai;
    el.innerHTML = `
      <div class="welcome" style="--c:${kai.color}">
        ${characterHTML('kai', { expression: 'joie', size: 190 })}
        <div class="bubble top" style="text-align:left"><span class="who">${kai.name}</span>
          Yo ! Moi c'est <strong>Kaï</strong>. Bienvenue dans la team !
          Ici on révise avec l'IA, en mode jeu. Comment on t'appelle ?</div>
        <input type="text" id="name" placeholder="Ton prénom" maxlength="24" value="${esc(name)}" autocomplete="given-name">
        <button class="btn block" id="go">C'est parti ! 🚀</button>
      </div>`;
    const ch = el.querySelector('.ch');
    setTimeout(() => play(ch, 'signature'), 500);
    const go = () => {
      name = el.querySelector('#name').value.trim();
      if (!name) { el.querySelector('#name').focus(); play(ch, 'shake', { expression: 'surprise' }); return; }
      vibrate();
      step = 1;
      draw();
    };
    el.querySelector('#go').onclick = go;
    el.querySelector('#name').onkeydown = (e) => { if (e.key === 'Enter') go(); };
  }

  // --- 2. Présentation d'un membre de l'équipe ---
  function drawMember(id) {
    const c = CHARACTERS[id];
    const intro = id === 'kai'
      ? `Moi, je suis ton guide : je t'accueille et je fixe tes objectifs du jour, ${name}.`
      : line(id, 'arrivee');
    el.innerHTML = `
      <div class="welcome team-slide" style="--c:${c.color}">
        <div class="dots-nav">${others.map((_, i) => `<i class="${i === step - 1 ? 'on' : ''}"></i>`).join('')}</div>
        ${characterHTML(id, { expression: 'joie', size: 200, aura: 1 })}
        <div>
          <p class="name">${esc(c.name)}</p>
          <div class="role">${esc(c.role)}</div>
        </div>
        <p class="muted">${esc(c.personality)}</p>
        <div class="bubble top" style="text-align:left"><span class="who">${esc(c.name)}</span>${esc(intro)}</div>
        <div class="row nowrap">
          <button class="btn ghost" id="skip">Passer</button>
          <button class="btn grow" id="next">${step < others.length ? 'Suivant →' : 'Choisir mon compagnon'}</button>
        </div>
      </div>`;
    const ch = el.querySelector('.ch');
    setTimeout(() => play(ch, 'signature'), 450);
    ch.onclick = () => play(ch, 'signature');
    el.querySelector('#next').onclick = () => { vibrate(); sound('tap'); step++; draw(); };
    el.querySelector('#skip').onclick = () => { step = others.length + 1; draw(); };
  }

  // --- 3. Choix du compagnon ---
  function drawPick() {
    el.innerHTML = `
      <div class="welcome">
        <h1>Choisis ton <span class="grad-text">compagnon</span></h1>
        <p class="muted">Il t'accompagnera sur l'accueil et son aura évoluera avec ta série de jours 🔥</p>
        <div class="pick-grid">
          ${others.map((id) => `
            <button class="pick ${chosen === id ? 'sel' : ''}" data-id="${id}" style="--c:${CHARACTERS[id].color}">
              ${characterHTML(id, { expression: chosen === id ? 'joie' : 'neutre', size: 84, enter: false })}
              <b>${esc(CHARACTERS[id].name)}</b><small>${esc(CHARACTERS[id].role)}</small>
            </button>`).join('')}
        </div>
        <div id="pick-say" class="bubble top" style="text-align:left;${chosen ? '' : 'visibility:hidden'}"></div>
        <button class="btn block green" id="done" ${chosen ? '' : 'disabled'}>C'est mon choix !</button>
      </div>`;
    el.querySelectorAll('.pick').forEach((b) => {
      b.onclick = () => {
        chosen = b.dataset.id;
        el.querySelectorAll('.pick').forEach((x) => x.classList.toggle('sel', x === b));
        play(b.querySelector('.ch'), 'signature');
        const c = CHARACTERS[chosen];
        const say = el.querySelector('#pick-say');
        say.style.visibility = 'visible';
        say.style.setProperty('--c', c.color);
        say.innerHTML = `<span class="who">${esc(c.name)}</span>${esc(line(chosen, 'reussite'))}`;
        el.querySelector('#done').disabled = false;
        vibrate();
      };
    });
    el.querySelector('#done').onclick = async () => {
      if (existing) {
        existing.name = name;
        existing.companion = chosen;
        await saveProfile(existing);
      } else {
        await createProfile(name, chosen);
      }
      confetti(150, { color: CHARACTERS[chosen].color });
      onomatopoeia("LET'S GO!", { color: CHARACTERS[chosen].color, big: true });
      vibrate([20, 40, 60]);
      sound('level');
      setTimeout(() => { location.hash = '#/'; }, 900);
    };
  }

  draw();
}
