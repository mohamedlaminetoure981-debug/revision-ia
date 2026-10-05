// =====================================================================
// bubble.js — Bulle de dialogue des SCÈNES DE GROUPE
// ---------------------------------------------------------------------
// (conseil de correction, accueil du créateur…)
//  - UNE SEULE bulle visible à la fois dans la scène ;
//  - placée au-dessus du perso qui parle, puis RECALÉE pour rester
//    entièrement dans l'écran (bords gauche/droite, haut, bas) ;
//  - si elle ne tient pas au-dessus, elle passe en dessous du perso ;
//  - la pointe de la bulle vise toujours le perso qui parle.
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { esc } from './ui.js';
import { speak } from './character.js';
import { playSfx, voice } from './sfx.js';

const MARGIN = 10; // marge minimale avec les bords de l'écran (px)

/**
 * Affiche la bulle d'un perso dans une scène de groupe.
 * @param {HTMLElement} scene  la scène (position: fixed / absolute)
 * @param {HTMLElement} seat   l'élément du perso qui parle
 * @param {string} id          identifiant du perso
 * @param {string} text        réplique
 * @param {number} [minTop]    hauteur réservée en haut (titre de la scène)
 */
export function groupBubble(scene, seat, id, text, minTop = 70) {
  clearBubbles(scene);
  const b = document.createElement('div');
  b.className = 'bubble group-say';
  b.style.setProperty('--c', CHARACTERS[id]?.color || 'var(--neon-violet)');
  b.innerHTML = `<span class="who">${esc(CHARACTERS[id]?.name || '')}</span><span class="say"></span>`;
  // La bulle s'écrit mot par mot (sa taille finale est réservée tout de suite).
  speak(seat.querySelector('.ch'), b.querySelector('.say'), text);
  scene.appendChild(b);
  place(scene, seat, b, minTop);
  playSfx('bubble');
  setTimeout(() => voice(id), 60);
  return b;
}

/** Retire toutes les bulles de la scène. */
export function clearBubbles(scene) {
  scene.querySelectorAll('.group-say').forEach((x) => x.remove());
}

/** Calcule la position de la bulle pour qu'elle reste dans l'écran. */
function place(scene, seat, b, minTop) {
  const sc = scene.getBoundingClientRect();
  const target = (seat.querySelector('.ch') || seat).getBoundingClientRect();
  const w = b.offsetWidth;
  const h = b.offsetHeight;
  const cx = target.left + target.width / 2 - sc.left; // centre du perso
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const left = clamp(cx - w / 2, MARGIN, sc.width - w - MARGIN);
  let top = target.top - sc.top - h - 8; // au-dessus de la tête
  let below = false;
  if (top < minTop) { // pas la place au-dessus → en dessous du perso
    top = target.bottom - sc.top + 8;
    below = true;
  }
  top = clamp(top, MARGIN, sc.height - h - MARGIN);
  b.style.left = `${left}px`;
  b.style.top = `${top}px`;
  // La pointe vise le perso, même si la bulle a été décalée.
  b.style.setProperty('--tail', `${clamp(cx - left, 18, w - 18)}px`);
  b.classList.toggle('below', below);
}
