// =====================================================================
// views/collection.js — LE CLASSEUR DE CARTES (Sora)
// ---------------------------------------------------------------------
// #/collection          : classeur par matière + progression
// #/collection/ouvrir   : ouverture du paquet (nouvelles cartes / raretés)
// Aucun appel à l'IA : les cartes viennent de tes fiches.
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play } from '../ui/character.js';
import { esc, line, mascot, modal, subjectEmoji, toast } from '../ui/ui.js';
import { sound, vibrate, confetti, onomatopoeia } from '../ui/fx.js';
import { loadCollection, markRevealed, RARITIES } from '../core/collection.js';
import { cardHTML, cardPng } from '../ui/card.js';
import { shareImage, fileName } from '../ui/share.js';
import { plain } from '../core/collection.js';

export async function render(el, [mode]) {
  const col = await loadCollection();
  if (mode === 'ouvrir' && col.pending.length) return openPack(el, col.pending);
  const sora = CHARACTERS.sora;

  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/profil">←</a><h1>🃏 Ma collection</h1></div>
    <div class="tile neon" style="--c:${sora.color};margin-bottom:12px">
      ${mascot('sora', { situation: col.pending.length ? 'carte_paquet' : 'carte_intro', expression: col.pending.length ? 'celebration' : 'clin', size: 80 })}
      <div class="row between" style="margin-top:10px"><strong>${col.owned} / ${col.total} cartes</strong>
        <span class="tiny dim">${RARITIES.map((r) => `<span style="color:${r.color}">${'★'.repeat(r.stars)}</span> ${r.name}`).join(' · ')}</span></div>
      <div class="bar" style="margin-top:6px"><div style="width:${col.total ? (100 * col.owned) / col.total : 0}%;background:${sora.color}"></div></div>
      ${col.pending.length ? `<a class="btn pink block pack-btn" href="#/collection/ouvrir" style="margin-top:12px">🎁 Ouvrir mon paquet (${col.pending.length} carte${col.pending.length > 1 ? 's' : ''})</a>` : ''}
    </div>
    ${col.subjects.length ? col.subjects.map((s) => `
      <section class="binder" style="--c:${s.color}">
        <div class="row between nowrap"><h2 style="margin:0">${subjectEmoji(s.subject)} ${esc(s.subject)}</h2><span class="tiny dim">${s.owned}/${s.total}</span></div>
        <div class="bar" style="margin:6px 0 10px"><div style="width:${(100 * s.owned) / s.total}%;background:var(--c)"></div></div>
        <div class="binder-grid">${s.cards.map((it) => `<button class="binder-slot" data-id="${it.card.id}" aria-label="${esc(it.rarity ? plain(it.card.question, 60) : 'Carte non obtenue')}">${cardHTML(it)}</button>`).join('')}</div>
      </section>`).join('') : `<div class="tile">${mascot('sora', { text: 'Pas encore de fiches… Ajoute un cours, révise tes fiches, et les cartes arrivent !', size: 70 })}</div>`}
    <p class="tiny muted center" style="margin:16px 0">Une carte s'obtient en réussissant sa fiche. Plus tu la maîtrises (répétition espacée), plus elle devient rare.</p>`;

  const all = col.subjects.flatMap((s) => s.cards);
  el.querySelectorAll('.binder-slot').forEach((b) => {
    b.onclick = () => {
      const it = all.find((x) => x.card.id === b.dataset.id);
      if (!it.rarity) { toast('🔒 Réussis cette fiche en révision pour obtenir la carte !'); play(b, 'shake'); return; }
      showCard(it);
    };
  });
}

/** Grande carte + partage en image. */
function showCard(it) {
  const m = modal(`
    <div class="center">
      <div class="card-big">${cardHTML(it, 'big')}</div>
      <p class="small muted" style="margin:10px 0">${esc(it.rarity.name)} · ${esc(CHARACTERS[it.char].name)} · ${esc(it.course.title)}</p>
      <button class="btn block" id="share">📤 Partager la carte</button>
      <button class="btn ghost block" data-close style="margin-top:8px">Fermer</button>
    </div>`);
  sound('flip');
  tilt(m.el.querySelector('.tcg'));
  m.el.querySelector('#share').onclick = async () => {
    try {
      await shareImage(await cardPng(it), fileName('carte', plain(it.card.question, 40)), `🃏 Carte ${it.rarity.name} obtenue sur Révision IA !`);
    } catch (e) { console.error(e); toast('Impossible de créer l’image.', 'error'); }
  };
}

/** Effet 3D : la carte suit le doigt (léger, désactivé si "réduire les animations"). */
function tilt(card) {
  if (!card || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const move = (e) => {
    const p = e.touches ? e.touches[0] : e;
    const r = card.getBoundingClientRect();
    const dx = (p.clientX - r.left) / r.width - 0.5;
    const dy = (p.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${dx * 18}deg) rotateX(${-dy * 18}deg)`;
    card.style.setProperty('--hx', `${(dx + 0.5) * 100}%`);
  };
  card.addEventListener('pointermove', move);
  card.addEventListener('touchmove', move, { passive: true });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
}

/** Ouverture du paquet : chaque carte se retourne avec un flash. */
function openPack(el, pending) {
  const list = pending.sort((a, b) => a.rarity.stars - b.rarity.stars); // la plus rare à la fin
  let i = 0;
  const sora = CHARACTERS.sora;
  el.innerHTML = `
    <div class="fs pack-screen" style="--c:${sora.color}">
      <div class="fs-top"><a class="fs-close" href="#/collection" style="display:grid;place-items:center;text-decoration:none">✕</a>
        <span class="grow tiny dim center" id="cnt"></span></div>
      <div class="fs-body" style="justify-content:center;align-items:center;text-align:center">
        <div class="pack-stage" id="stage"></div>
        <div class="mascot" style="max-width:380px;margin:10px auto 0">${characterHTML('sora', { expression: 'celebration', size: 60 })}
          <div class="bubble"><span class="who">Sora</span><span class="say" id="say">${esc(line('sora', 'carte_paquet'))}</span></div></div>
        <button class="btn pink block" id="next" style="max-width:340px;margin:12px auto 0">👆 Retourner la carte</button>
      </div>
    </div>`;
  const stage = el.querySelector('#stage');
  const btn = el.querySelector('#next');
  let flipped = false;

  const showBack = () => {
    const it = list[i];
    el.querySelector('#cnt').textContent = `${i + 1} / ${list.length}`;
    stage.innerHTML = `<div class="flip-card" style="--rc:${it.rarity.color}"><div class="flip-inner">
      <div class="flip-front"><div class="tcg-back big"><span>✦</span></div></div>
      <div class="flip-back">${cardHTML(it, 'big')}</div></div></div>`;
    flipped = false;
    btn.textContent = '👆 Retourner la carte';
    stage.querySelector('.flip-card').onclick = reveal;
    sound('teleport');
  };
  const reveal = async () => {
    if (flipped) return;
    flipped = true;
    const it = list[i];
    const card = stage.querySelector('.flip-card');
    card.classList.add('flipped');
    sound('flip');
    vibrate([15, 30, 15]);
    setTimeout(() => {
      // Flash + effets selon la rareté
      const flash = document.createElement('div');
      flash.className = 'pack-flash';
      flash.style.setProperty('--rc', it.rarity.color);
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 900);
      if (it.rarity.stars >= 3) { confetti(it.rarity.stars === 4 ? 180 : 90); sound('badge'); onomatopoeia(it.rarity.stars === 4 ? 'LÉGENDAIRE!' : 'ÉPIQUE!'); }
      else sound('sparkle');
      el.querySelector('#say').textContent = line('sora', it.rarity.stars >= 3 ? 'carte_rare' : 'carte_obtenue');
      play(el.querySelector('.mascot .ch'), it.rarity.stars >= 3 ? 'jump' : 'bounce');
      tilt(stage.querySelector('.tcg'));
    }, 450);
    await markRevealed([it]);
    btn.textContent = i < list.length - 1 ? 'Carte suivante →' : '📚 Voir mon classeur';
  };
  btn.onclick = () => {
    if (!flipped) return reveal();
    if (i < list.length - 1) { i++; showBack(); } else location.hash = '#/collection';
  };
  showBack();
}
