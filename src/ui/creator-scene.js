// =====================================================================
// creator-scene.js — Scène de la TOUTE PREMIÈRE activation du Mode Créateur
// ---------------------------------------------------------------------
// Toute l'équipe se téléporte EN MÊME TEMPS autour de la table, chacun
// réagit ("C'est… LE créateur ?!"), puis confettis et couronne 👑.
// Les répliques viennent de la section "createur" (clé `accueil`) du
// fichier des personnages. Seuls 3 persos parlent (Kaï + 2 au hasard), avec
// le temps de lire chaque bulle (toucher l'écran = bulle suivante) ; les
// autres réagissent en silence.
// =====================================================================

import { CHARACTERS, TEAM } from '../data/characters.js';
import { characterHTML, play, setExpression } from './character.js';
import { esc } from './ui.js';
import { confetti, onomatopoeia, vibrate, sound } from './fx.js';
import { creatorName } from '../core/creator.js';
import { groupSay, clearBubbles } from './bubble.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Positions : deux rangées autour de la table (en % de l'écran).
const SEATS = [[20, 52], [40, 49], [60, 49], [80, 52], [14, 80], [38, 84], [62, 84], [86, 80]];

export function creatorWelcome() {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'council creator-scene';
    el.innerHTML = `
      <div class="council-title">Alerte générale…<small>Une présence inhabituelle est détectée</small></div>
      <button class="council-skip">Passer ⏭</button>
      <div class="council-table"></div>`;
    document.body.appendChild(el);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let done = false;
    const close = () => { if (!done) { done = true; el.remove(); resolve(); } };
    el.querySelector('.council-skip').onclick = close;

    // 1. Tout le monde se téléporte EN MÊME TEMPS.
    const seats = TEAM.map((id, i) => {
      const [x, y] = SEATS[i % SEATS.length];
      const seat = document.createElement('div');
      seat.className = `seat ${y > 60 ? 'front' : ''} ${reduced ? '' : 'tp-in'}`;
      seat.style.cssText = `left:${x}%;top:${y}%;--c:${CHARACTERS[id].color}`;
      seat.innerHTML = `${reduced ? '' : '<div class="tp-streak"></div><div class="tp-flash"></div>'}
        ${characterHTML(id, { expression: 'surprise', size: 84, enter: false })}`;
      el.appendChild(seat);
      return { id, seat };
    });
    vibrate([30, 30, 60]);
    sound('teleport');
    setTimeout(() => sound('teleport'), 90);

    (async () => {
      await sleep(600);
      if (done) return;
      el.querySelector('.council-title').innerHTML = `C’est… LE CRÉATEUR ?!<small>Bienvenue, ${esc(creatorName())} 👑</small>`;
      onomatopoeia('SENSEI?!');
      // 2. Trois persos parlent à tour de rôle (Kaï + 2 au hasard), avec le temps de
      //    lire chaque bulle ; les autres réagissent en silence, un par un.
      const others = seats.filter((s) => s.id !== 'kai').sort(() => Math.random() - 0.5);
      const speakers = [seats.find((s) => s.id === 'kai') || others.shift(), ...others.slice(0, 2)].filter(Boolean);
      seats.filter((s) => !speakers.includes(s)).forEach(({ seat }, k) => setTimeout(() => {
        if (done) return;
        const chEl = seat.querySelector('.ch');
        setExpression(chEl, 'joie');
        play(chEl, 'signature');
      }, 300 + k * 250));
      for (const { id, seat } of speakers) {
        if (done) return;
        const chEl = seat.querySelector('.ch');
        setExpression(chEl, 'joie');
        play(chEl, 'signature');
        // Une seule bulle à la fois, recalée pour rester dans l'écran.
        await groupSay(el, seat, id, CHARACTERS[id].createur?.accueil?.[0] || '…', 80);
      }
      if (done) return;
      // 3. Tout le monde fête l'arrivée du créateur.
      clearBubbles(el);
      seats.forEach(({ seat }) => setExpression(seat.querySelector('.ch'), 'celebration'));
      confetti(160, { color: '#FFD23F' });
      onomatopoeia('👑 CRÉATEUR!', { color: '#FFD23F' });
      const btn = document.createElement('button');
      btn.className = 'btn block creator-hello';
      btn.textContent = 'Salut la team 👑';
      btn.onclick = close;
      el.appendChild(btn);
    })();
  });
}
