// =====================================================================
// council.js — LE CONSEIL DE CORRECTION (phase 3)
// ---------------------------------------------------------------------
// Après un quiz, un exercice ou un examen blanc, AVANT d'afficher la note :
//  1. les persos arrivent un par un en se TÉLÉPORTANT (traînée de lignes de
//     vitesse, image rémanente, flash + particules) ;
//  2. ils se regroupent autour d'une table ronde lumineuse et se concertent
//     (bulles, hochements de tête, gouttes de sueur, suspense) :
//     2 à 4 persos PARLENT (jamais la même combinaison 2 fois de suite),
//     1 ou 2 autres réagissent en silence ;
//  3. un perso révèle la note, avec l'effet adapté au résultat
//     (explosion d'énergie si excellent, encouragement chaleureux si faible).
//
// La correction par l'IA se fait PENDANT la scène :
//  - si elle finit plus tôt, la scène va jusqu'au bout (3 à 5 s) ;
//  - si elle dure plus longtemps, les persos continuent de délibérer.
// Bouton "Passer" toujours visible. Réglage : complète / courte / désactivée.
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS, TEAM } from '../data/characters.js';
import { characterHTML, play, setExpression } from './character.js';
import { esc, progress } from './ui.js';
import { confetti, onomatopoeia, vibrate, sound } from './fx.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (l) => l.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const LEVEL_COLOR = { excellent: 'var(--neon-green)', bon: 'var(--neon-cyan)', moyen: 'var(--neon-yellow)', a_retravailler: 'var(--neon-pink)' };
const LEVEL_LABEL = { excellent: 'Excellent !', bon: 'Bon travail !', moyen: 'Ça se construit', a_retravailler: 'On progresse ensemble' };

/** Choisit les persos : 2 à 4 qui parlent + 1-2 muets, jamais le même groupe 2 fois de suite. */
function chooseCast(owner) {
  let last = '';
  try { last = localStorage.getItem('lastCouncil') || ''; } catch { /* ignoré */ }
  let speakers;
  for (let tries = 0; tries < 20; tries++) {
    const n = 2 + Math.floor(Math.random() * 3); // 2, 3 ou 4
    const others = shuffle(TEAM.filter((id) => id !== owner));
    speakers = [owner, ...others.slice(0, n - 1)];
    if (speakers.slice().sort().join() !== last) break;
  }
  try { localStorage.setItem('lastCouncil', speakers.slice().sort().join()); } catch { /* ignoré */ }
  const rest = shuffle(TEAM.filter((id) => !speakers.includes(id)));
  const silent = rest.slice(0, speakers.length >= 4 ? 1 : 2); // jamais toute l'équipe
  return { speakers, silent, revealer: owner };
}

/** Positions autour de la table (en % de l'écran), derrière puis devant. */
const SEATS = [[28, 56], [72, 56], [50, 51], [17, 80], [83, 80], [50, 88]];

/**
 * Lance une tâche (ex. correction par l'IA) avec la scène du conseil.
 * @param {object} o
 * @param {string} o.owner      perso responsable (révèle la note) : 'ren', 'awa'…
 * @param {string} o.title      titre (et titre de secours si la scène est désactivée)
 * @param {Function} o.task     (onStatus) => Promise<valeur>  — le travail (IA…)
 * @param {Function} o.toResult (valeur) => { level, label }   — niveau + note à afficher
 * @returns {Promise<valeur>}   le résultat de la tâche (erreur relancée si échec)
 */
export async function runWithCouncil({ owner, title, task, toResult }) {
  const mode = await db.getSetting('council');
  if (mode === 'off') {
    // Scène désactivée : simple chargement animé.
    const pg = progress(title, owner);
    try { const v = await task(pg.set); pg.done(); return v; } catch (e) { pg.done(); throw e; }
  }
  const short = mode === 'short' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- La tâche démarre tout de suite, en parallèle de la scène ---
  let value; let error; let finished = false;
  const el = document.createElement('div');
  const setStatus = (t) => { const s = el.querySelector('.council-status'); if (s) s.textContent = t; };
  const job = Promise.resolve().then(() => task(setStatus)).then((v) => { value = v; }, (e) => { error = e; }).finally(() => { finished = true; });

  // --- Mise en place de la scène ---
  const { speakers, silent, revealer } = chooseCast(owner);
  const cast = [...speakers, ...silent];
  el.className = 'council';
  el.innerHTML = `
    <div class="council-title">Le conseil délibère…<small>${esc(title)}</small></div>
    <button class="council-skip">Passer ⏭</button>
    <div class="council-table"></div>
    <div class="council-status"></div>`;
  document.body.appendChild(el);
  let skipped = false;
  el.querySelector('.council-skip').onclick = () => { skipped = true; el.querySelector('.council-skip').textContent = '⏳'; };

  const seats = {};
  const start = performance.now();
  const minDuration = short ? 1300 : 2500; // scène complète : ~4 s au total (5 s max si l'IA a fini)

  // 1. Arrivées en téléportation, une par une.
  for (let i = 0; i < cast.length; i++) {
    if (skipped) break;
    const id = cast[i];
    const [x, y] = SEATS[i % SEATS.length];
    const seat = document.createElement('div');
    seat.className = `seat ${y > 60 ? 'front' : ''} ${short ? '' : 'tp-in'}`;
    seat.style.cssText = `left:${x}%;top:${y}%;--c:${CHARACTERS[id].color}`;
    seat.innerHTML = `${short ? '' : '<div class="tp-streak"></div>'}
      ${characterHTML(id, { expression: 'reflexion', size: 104, enter: false })}
      ${short ? '' : `<div class="tp-ghost">${characterHTML(id, { expression: 'reflexion', size: 104, enter: false })}</div>
      <div class="tp-flash"></div>
      ${Array.from({ length: 6 }, (_, k) => { const a = (k / 6) * Math.PI * 2; return `<span class="tp-p" style="--dx:${Math.round(Math.cos(a) * 50)}px;--dy:${Math.round(Math.sin(a) * 50)}px"></span>`; }).join('')}`}`;
    el.appendChild(seat);
    seats[id] = seat;
    if (!short) { vibrate(8); await sleep(240); }
  }
  // nettoyage des effets d'arrivée
  setTimeout(() => el.querySelectorAll('.tp-streak,.tp-ghost,.tp-flash,.tp-p').forEach((n) => n.remove()), 700);

  // 2. Délibération : bulles, réactions muettes, suspense.
  let turn = 0;
  let spokeAfterResult = 0;
  const say = (id, text) => {
    el.querySelectorAll('.seat .say').forEach((b) => b.remove());
    const b = document.createElement('div');
    b.className = 'bubble say';
    b.style.setProperty('--c', CHARACTERS[id].color);
    b.innerHTML = `<span class="who">${esc(CHARACTERS[id].name)}</span>${esc(text)}`;
    seats[id]?.appendChild(b);
  };
  const react = (level) => { // les muets réagissent
    for (const id of silent) {
      const chEl = seats[id]?.querySelector('.ch');
      if (!chEl) continue;
      const r = Math.random();
      if (level === 'excellent' && r < 0.6) setExpression(chEl, 'celebration'); // yeux étoilés
      else if (!level && r < 0.35) setExpression(chEl, 'encouragement'); // goutte de sueur
      else if (id === 'ren' && r < 0.6) play(chEl, 'signature'); // bras croisés
      else seats[id].classList.add('nod'); // hochement de tête
      setTimeout(() => seats[id]?.classList.remove('nod'), 1000);
    }
  };

  while (!skipped) {
    const elapsed = performance.now() - start;
    const res = finished && !error ? toResult(value) : null;
    if (error) break;
    // On révèle quand : tâche finie + durée minimale atteinte + au moins une réplique "résultat".
    if (res && elapsed >= minDuration && (spokeAfterResult >= (short ? 0 : 1))) break;
    const id = speakers[turn % speakers.length];
    turn++;
    const pool = res ? CHARACTERS[id].council[res.level] : CHARACTERS[id].council.deliberation;
    say(id, pick(pool));
    if (res) spokeAfterResult++;
    const chEl = seats[id]?.querySelector('.ch');
    if (chEl) { setExpression(chEl, res ? (res.level === 'excellent' ? 'surprise' : res.level === 'a_retravailler' ? 'encouragement' : 'joie') : pick(['reflexion', 'concentration', 'surprise'])); play(chEl, 'bounce'); }
    react(res?.level);
    await Promise.race([sleep(short ? 600 : 850), job.then(() => sleep(short ? 300 : 450))]);
    if (performance.now() - start > 60000 && !finished) setStatus('La correction prend du temps… la connexion est lente, on patiente.');
  }

  await job; // on attend toujours le vrai résultat
  if (error) { el.remove(); throw error; }
  const res = toResult(value);

  // 3. Révélation de la note.
  if (!skipped) {
    el.querySelectorAll('.seat .say').forEach((b) => b.remove());
    const color = LEVEL_COLOR[res.level] || 'var(--neon-violet)';
    const revealSeat = seats[revealer];
    if (revealSeat) {
      const chEl = revealSeat.querySelector('.ch');
      setExpression(chEl, res.level === 'excellent' ? 'celebration' : res.level === 'a_retravailler' ? 'encouragement' : 'joie');
      play(chEl, 'signature');
    }
    // La réplique du perso qui annonce s'affiche sous la note (pas de chevauchement).
    const rc = CHARACTERS[revealer];
    const rv = document.createElement('div');
    rv.innerHTML = `
      ${res.level === 'excellent' ? `<div class="shockwave" style="--c:${color}"></div><div class="burst"></div>` : ''}
      ${res.level === 'a_retravailler' || res.level === 'moyen' ? '<div class="warm-glow"></div>' : ''}
      <div class="reveal" style="--c:${color}"><div class="note">${esc(res.label)}</div><div class="lbl">${LEVEL_LABEL[res.level]}</div>
        <div class="bubble" style="--c:${rc.color}"><span class="who">${esc(rc.name)}</span>${esc(pick(rc.council[res.level]))}</div></div>`;
    el.appendChild(rv);
    if (res.level === 'excellent') { // explosion d'énergie
      Object.values(seats).forEach((s) => setExpression(s.querySelector('.ch'), 'celebration'));
      confetti(140); onomatopoeia("LET'S GO!"); sound('level'); vibrate([30, 40, 60]);
    } else if (res.level === 'bon') {
      sound('good'); vibrate([20, 30]);
    } else { // encouragement chaleureux, jamais moqueur
      Object.values(seats).forEach((s) => setExpression(s.querySelector('.ch'), 'encouragement'));
      vibrate(20);
    }
    await Promise.race([sleep(short ? 900 : 1300), new Promise((r) => { el.onclick = r; })]);
  }
  el.remove();
  return value;
}
