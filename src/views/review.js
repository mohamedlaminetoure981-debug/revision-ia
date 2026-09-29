// =====================================================================
// views/review.js — Révision des fiches en mode SWIPE avec Sora
// ---------------------------------------------------------------------
//   Taper            = retourner la carte (animation 3D)
//   Swipe → droite   = "Je sais"    (Moyen, SM-2 q=4)
//   Swipe ← gauche   = "À revoir"   (Raté,  SM-2 q=1) → revient dans la séance
//   Swipe ↑ haut     = "Facile"     (SM-2 q=5)
//   Swipe ↓ bas      = "Difficile"  (SM-2 q=3)
// Des boutons font la même chose pour ceux qui ne swipent pas.
// Adresse : #/review (toutes les fiches du jour) ou #/review/ID_COURS
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play, setExpression } from '../ui/character.js';
import { esc, rich, sourceHtml, line } from '../ui/ui.js';
import { schedule, isDue, today } from '../core/srs.js';
import { addXp, XP_RULES } from '../core/game.js';
import { celebrate, vibrate, sound, confetti, onomatopoeia, hypeWord } from '../ui/fx.js';
import { reportCard } from './report.js';
import { power, suspendPowers, resumePowers } from '../ui/powers.js';

// Direction du swipe → note SM-2, texte du tampon, XP.
const DIRS = {
  right: { grade: 'moyen', stamp: 'JE SAIS', xp: XP_RULES.card, btn: '→ Je sais' },
  left: { grade: 'rate', stamp: 'À REVOIR', xp: XP_RULES.cardFail, btn: '← À revoir' },
  up: { grade: 'facile', stamp: 'FACILE', xp: XP_RULES.cardEasy, btn: '↑ Facile' },
  down: { grade: 'difficile', stamp: 'DIFFICILE', xp: XP_RULES.cardHard, btn: '↓ Difficile' },
};
const SWIPE_MIN = 90; // distance (px) pour valider un swipe

/** Mélange une liste. */
function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/** Texte "dans combien de temps" pour un intervalle en jours. */
function when(n) {
  return n === 0 ? 'auj.' : n === 1 ? 'demain' : `${n} j`;
}

export async function render(el, [courseId]) {
  const courses = Object.fromEntries((await db.getAll('courses')).map((c) => [c.id, c]));
  const all = courseId ? await db.getByIndex('cards', 'courseId', courseId) : await db.getAll('cards');
  const queue = shuffle(all.filter((c) => isDue(c) && courses[c.courseId]));
  const initial = queue.length;
  const counts = { rate: 0, difficile: 0, moyen: 0, facile: 0 };
  const back = courseId ? `#/course/${courseId}/fiches` : '#/';
  const sora = CHARACTERS.sora;
  let done = 0;
  let xpTotal = 0;
  let combo = 0;

  if (!queue.length) {
    el.innerHTML = `
      <div class="fs" style="--c:${sora.color};justify-content:center;text-align:center">
        ${characterHTML('sora', { expression: 'clin', size: 180 })}
        <h2>Rien à réviser pour l'instant !</h2>
        <p class="muted">${esc(line('sora', 'fin'))}</p>
        <a class="btn" href="${back}">Retour</a>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="fs" style="--c:${sora.color}">
      <div class="fs-top">
        <a class="fs-close" href="${back}" aria-label="Fermer" style="display:grid;place-items:center;text-decoration:none">✕</a>
        <div class="grow"><div class="bar"><div id="prog" style="width:0%"></div></div></div>
        <span class="tiny dim count" id="cnt">0/${initial}</span>
      </div>
      <div class="fs-body">
        <div class="mascot" id="sora" style="margin-top:10px">
          ${characterHTML('sora', { expression: 'joie', size: 70 })}
          <div class="bubble" style="margin-bottom:6px"><span class="who">Sora</span><span class="say">${esc(line('sora', 'arrivee'))}</span></div>
        </div>
        <div class="swipe-zone" id="zone"></div>
        <div id="actions"></div>
      </div>
    </div>`;

  const zone = el.querySelector('#zone');
  const actions = el.querySelector('#actions');
  const soraEl = el.querySelector('#sora .ch');
  const soraSay = el.querySelector('#sora .say');
  const talk = (situation, expression, anim = 'bounce') => {
    soraSay.textContent = line('sora', situation);
    setExpression(soraEl, expression);
    play(soraEl, anim);
  };

  // Pas de pouvoir pendant qu'on réfléchit aux fiches : on les garde pour la fin.
  suspendPowers();
  window.addEventListener('hashchange', resumePowers, { once: true });

  let flipped = false;

  /** Affiche la carte en tête de file (et la suivante, en dessous). */
  function showCard() {
    const card = queue[0];
    el.querySelector('#prog').style.width = `${(100 * done) / initial}%`;
    el.querySelector('#cnt').textContent = `${done}/${initial}`;
    if (!card) return finish();
    const course = courses[card.courseId];
    flipped = false;
    zone.innerHTML = `
      ${queue[1] ? '<div class="swipe-card behind"><div class="face recto"></div></div>' : ''}
      <div class="swipe-card" id="card">
        <span class="stamp right">JE SAIS</span><span class="stamp left">À REVOIR</span>
        <span class="stamp up">FACILE</span><span class="stamp down">DIFFICILE</span>
        <div class="flip" id="flip">
          <div class="face recto">
            <div class="part">${esc(course.title)} · ${esc(card.part || '')}</div>
            <div class="q rich">${rich(card.question)}</div>
            <div class="hint">👆 Tape pour retourner</div>
          </div>
          <div class="face verso">
            <div class="part">Réponse</div>
            <div class="rich" style="font-size:1.08rem;margin-top:6px">${rich(card.answer)}</div>
            ${sourceHtml(course, card.source)}
            <div class="center" style="margin-top:auto;padding-top:10px">
              <button class="linkbtn small" id="report">🚩 Signaler une erreur</button></div>
          </div>
        </div>
      </div>`;
    actions.innerHTML = '<button class="btn block green" id="flipbtn">👀 Retourner la carte</button>';
    actions.querySelector('#flipbtn').onclick = flip;
    zone.querySelector('#report').onclick = (e) => {
      e.stopPropagation();
      reportCard(card, course, (result) => {
        if (result === 'deleted' || card.flagged) { queue.shift(); done++; }
        showCard();
      });
    };
    enableDrag(zone.querySelector('#card'), card);
  }

  /** Retourne la carte et affiche les 4 boutons de réponse. */
  function flip() {
    if (flipped) return;
    flipped = true;
    // Animation : la carte tourne jusqu'à la tranche, change de face, puis revient.
    const f = zone.querySelector('#flip');
    f.classList.add('turn-out');
    setTimeout(() => {
      f.classList.remove('turn-out');
      f.classList.add('flipped', 'turn-in');
    }, 180);
    vibrate(10);
    sound('flip');
    const card = queue[0];
    actions.innerHTML = `
      <div class="grades">
        ${['left', 'down', 'right', 'up'].map((d) => `
          <button class="btn g-${DIRS[d].grade}" data-dir="${d}">${DIRS[d].btn}<small>${when(schedule(card, DIRS[d].grade).interval)}</small></button>`).join('')}
      </div>
      <p class="tiny dim center" style="margin:6px 0 0">ou swipe la carte dans une direction</p>`;
    actions.querySelectorAll('[data-dir]').forEach((b) => { b.onclick = () => answer(b.dataset.dir); });
  }

  /** Glisser la carte avec le doigt (ou la souris). */
  function enableDrag(cardEl, card) {
    let sx = 0; let sy = 0; let dx = 0; let dy = 0; let dragging = false; let moved = false;
    const stamps = {
      right: cardEl.querySelector('.stamp.right'), left: cardEl.querySelector('.stamp.left'),
      up: cardEl.querySelector('.stamp.up'), down: cardEl.querySelector('.stamp.down'),
    };
    const dirOf = () => (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));

    cardEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      dragging = true; moved = false; sx = e.clientX; sy = e.clientY; dx = dy = 0;
      cardEl.setPointerCapture(e.pointerId);
      cardEl.classList.add('dragging');
    });
    cardEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      if (Math.hypot(dx, dy) > 8) moved = true;
      if (!flipped) { dx *= 0.25; dy *= 0.25; } // avant de retourner : la carte résiste
      cardEl.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 14}deg)`;
      const d = dirOf();
      const power = Math.min(1, Math.hypot(dx, dy) / SWIPE_MIN);
      for (const [k, s] of Object.entries(stamps)) s.style.opacity = flipped && k === d ? power : 0;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      cardEl.classList.remove('dragging');
      if (!moved) { cardEl.style.transform = ''; flip(); return; } // simple tape = retourner
      if (flipped && Math.hypot(dx, dy) >= SWIPE_MIN) { answer(dirOf()); return; }
      if (!flipped && Math.hypot(dx, dy) > 20) {
        soraSay.textContent = 'Retourne d’abord la carte, petit malin 😉';
        play(soraEl, 'shake');
      }
      cardEl.style.transform = '';
      for (const s of Object.values(stamps)) s.style.opacity = 0;
    };
    cardEl.addEventListener('pointerup', end);
    cardEl.addEventListener('pointercancel', end);
    void card;
  }

  /** Enregistre la réponse (SM-2 + XP) et passe à la carte suivante. */
  async function answer(dir) {
    const card = queue[0];
    if (!card || !flipped) return;
    const { grade, xp } = DIRS[dir];
    const cardEl = zone.querySelector('#card');
    // La carte s'envole dans la direction du swipe.
    const fly = { right: 'translate(130%, 0) rotate(20deg)', left: 'translate(-130%, 0) rotate(-20deg)', up: 'translate(0, -130%)', down: 'translate(0, 130%)' }[dir];
    cardEl.style.transform = fly;
    cardEl.style.opacity = '0';
    actions.innerHTML = '';

    Object.assign(card, schedule(card, grade));
    card.lastReview = new Date().toISOString();
    await db.put('cards', card);
    await db.put('reviews', {
      id: db.newId(), cardId: card.id, courseId: card.courseId, subject: card.subject,
      day: today(), grade, at: card.lastReview, hour: new Date().getHours(),
    });
    counts[grade]++;
    xpTotal += xp;
    celebrate(await addXp(xp, 'cards'), soraEl);
    queue.shift();

    // Réaction de Sora à chaque swipe.
    if (grade === 'rate') {
      queue.push(card); // la fiche ratée revient en fin de séance
      combo = 0;
      talk('echec', 'encouragement', 'shake');
      vibrate([25, 30, 25]);
      sound('bad');
    } else {
      done++;
      combo++;
      if (combo > 0 && combo % 5 === 0) {
        onomatopoeia(`COMBO x${combo}!`);
        talk('reussite', 'celebration', 'jump');
      } else if (grade === 'facile') {
        talk('reussite', 'clin', 'signature');
      } else if (grade === 'difficile') {
        talk('encouragement', 'concentration', 'bounce');
      } else {
        talk('reussite', 'joie', 'bounce');
      }
      vibrate(12);
      sound('swipe');
    }
    setTimeout(showCard, 280);
  }

  function finish() {
    const good = counts.facile + counts.moyen;
    zone.innerHTML = `
      <div class="face" style="position:relative;inset:auto;height:100%;text-align:center;justify-content:center;align-items:center;gap:8px">
        ${characterHTML('sora', { expression: 'celebration', size: 150 })}
        <h2 class="grad-text" style="font-size:1.6rem;margin:0">Pile terminée !</h2>
        <div class="row" style="justify-content:center;gap:6px">
          <span class="chip" style="color:var(--neon-cyan)">↑ ${counts.facile}</span>
          <span class="chip ok">→ ${counts.moyen}</span>
          <span class="chip warn">↓ ${counts.difficile}</span>
          <span class="chip bad">← ${counts.rate}</span>
        </div>
        <div class="display" style="font-size:1.4rem;color:var(--neon-green)">+${xpTotal} XP</div>
      </div>`;
    actions.innerHTML = `<a class="btn block" href="${back}">Terminer</a>`;
    talk('fin', 'joie', 'signature');
    confetti();
    onomatopoeia(good >= initial * 0.8 ? 'SUGOI!' : hypeWord());
    sound('level');
    resumePowers();
    // Bonne série de fiches (80 % réussies ou plus) : aura légère de Sora.
    if (good >= initial * 0.8) power('sora', 'light', { target: zone.querySelector('.ch') });
  }

  showCard();
}
