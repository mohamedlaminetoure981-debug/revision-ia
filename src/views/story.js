// =====================================================================
// views/story.js — LE MODE HISTOIRE (Kaï)
// ---------------------------------------------------------------------
// #/histoire        : la saison (chapitres) + les arcs (une matière = un arc)
// #/histoire/N      : lecture du chapitre N (planches manga, page par page)
// Contenu 100 % fixe (data/story.js) : aucun appel à l'IA, marche hors ligne.
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { CHAPTERS, STORY_TITLE } from '../data/story.js';
import { play } from '../ui/character.js';
import { esc, line, mascot, displayName, subjectColor, subjectEmoji, say } from '../ui/ui.js';
import { sound, vibrate, confetti, onomatopoeia, celebrate } from '../ui/fx.js';
import { stripSVG } from '../ui/manga.js';
import { storyOverview, newChaptersSinceLastVisit, markRead, BOSS_POINTS } from '../core/story.js';
import { addXp, XP_RULES } from '../core/game.js';
import { hasComic, loadComic } from '../data/comic/index.js';

/** Remplace {prenom} dans les répliques d'une planche. */
function personal(strip) {
  const name = displayName();
  return { ...strip, panels: strip.panels.map((p) => ({ ...p, line: p.line.replace(/\{prenom\}/g, name) })) };
}

export async function render(el, [chapterId]) {
  if (chapterId) return reader(el, Number(chapterId));
  const { fresh, overview: o } = await newChaptersSinceLastVisit();
  const kai = CHARACTERS.kai;
  const nextLocked = o.chapters.find((c) => !c.unlocked);
  const prevNeed = nextLocked ? (o.chapters[nextLocked.id - 2]?.need || 0) : 0;
  const pct = nextLocked ? Math.min(100, (100 * (o.total - prevNeed)) / Math.max(1, nextLocked.need - prevNeed)) : 100;

  el.innerHTML = `
    <div class="screen-head">
      <a class="back-btn" href="#/">←</a>
      <div class="grow"><div class="label">Mode Histoire</div><h1 style="font-size:1.25rem">${esc(STORY_TITLE)}</h1></div>
    </div>
    <div class="tile neon" style="--c:${kai.color}">
      ${mascot('kai', { situation: fresh ? 'histoire_nouveau' : 'histoire_intro', expression: fresh ? 'celebration' : 'joie', size: 86 })}
      <div class="row between" style="margin-top:12px"><strong>⭐ ${o.total} points d'histoire</strong>
        <span class="tiny dim">${nextLocked ? `Chapitre ${nextLocked.id} à ${nextLocked.needBoss && o.total >= nextLocked.need ? '1 boss vaincu' : `${nextLocked.need} pts`}` : 'Saison complète !'}</span></div>
      <div class="bar" style="margin-top:6px"><div style="width:${pct}%;background:var(--grad-fire)"></div></div>
      <p class="tiny muted" style="margin:8px 0 0">+1 fiche maîtrisée · +3 quiz ≥ 70 % · +3 exercice ≥ 10/20 · +10 boss vaincu</p>
    </div>

    <h2 style="margin:18px 0 8px">📚 Chapitres</h2>
    <div class="chapter-list">
      ${o.chapters.map((c) => `
        <a class="chapter ${c.unlocked ? '' : 'locked'} ${c.read ? 'read' : ''}" href="${c.unlocked ? `#/histoire/${c.id}` : '#/histoire'}" data-id="${c.id}">
          <span class="ch-num">${c.unlocked ? c.emoji : '🔒'}</span>
          <span class="grow"><span class="tiny dim">Chapitre ${c.id}${c.read ? ' · ✓ lu' : c.unlocked ? ' · nouveau !' : ''}</span>
            <strong>${c.unlocked ? esc(c.title) : '???'}</strong>
            <span class="tiny muted">${c.unlocked ? esc(c.teaser) : c.needBoss && o.total >= c.need ? 'Bats un boss de fin d’arc pour le débloquer.' : `Débloqué à ${c.need} points (encore ${Math.max(0, c.need - o.total)}).`}</span></span>
        </a>`).join('')}
    </div>

    <h2 style="margin:18px 0 8px">⚔️ Les arcs (tes matières)</h2>
    ${o.arcs.length ? o.arcs.map((a) => `
      <div class="tile arc" style="--c:${subjectColor(a.subject)};margin-bottom:10px">
        <div class="row between nowrap"><strong>${subjectEmoji(a.subject)} Arc ${esc(a.subject)}</strong>
          <span class="tiny dim">${a.points} pts</span></div>
        <div class="bar" style="margin:8px 0"><div style="width:${Math.min(100, (100 * a.points) / BOSS_POINTS)}%;background:var(--c)"></div></div>
        ${a.defeated
          ? `<div class="row between"><span class="chip ok">👊 Boss vaincu</span><a class="btn small ghost" href="#/boss/${encodeURIComponent(a.subject)}">Revanche</a></div>`
          : a.ready
            ? `<a class="btn block boss-btn" href="#/boss/${encodeURIComponent(a.subject)}">💀 Affronter le boss de l'arc</a>`
            : `<p class="tiny muted" style="margin:0">Le boss apparaît à ${BOSS_POINTS} points dans cette matière.</p>`}
      </div>`).join('') : `<div class="tile">${mascot('mory', { text: 'Ajoute un cours : chaque matière devient un arc avec son boss !', size: 70 })}<a class="btn block" href="#/ajouter" style="margin-top:10px">➕ Ajouter un cours</a></div>`}
  `;
  // Chapitre verrouillé : Kaï réagit.
  el.querySelectorAll('.chapter.locked').forEach((a) => {
    a.onclick = (e) => { e.preventDefault(); say(el.querySelector('.mascot'), 'histoire_verrou', { expression: 'clin', anim: 'shake' }); play(a, 'shake'); };
  });
  if (fresh) { sound('unlock'); setTimeout(() => onomatopoeia('NOUVEAU CHAPITRE!'), 300); }
  // Préchargement discret du chapitre qu'on va probablement ouvrir (le premier non lu) :
  // le lecteur BD et les images de sa page 1 seront déjà là au moment du clic.
  const next = o.chapters.find((c) => c.unlocked && !c.read) || o.chapters.filter((c) => c.unlocked).at(-1);
  if (next && hasComic(next.id)) {
    setTimeout(async () => {
      const [{ pageBoxes, assetUrl }, { preloadPage }, data] = await Promise.all([import('../comic/comic.js'), import('../comic/story-images.js'), loadComic(next.id), import('../comic/reader.js')]);
      if (data?.pages?.[0]) preloadPage(next.id, data.pages[0], 0, pageBoxes(data.pages[0]), assetUrl, 'low');
    }, 400);
  }
}

// ---------------------------------------------------------------------
// Lecture d'un chapitre (page par page, avec bruit de page tournée)
// ---------------------------------------------------------------------
async function reader(el, id) {
  const o = await storyOverview();
  const ch = o.chapters.find((c) => c.id === id);
  if (!ch || !ch.unlocked) { location.hash = '#/histoire'; return; }
  // Chapitre disponible en BD (nouveau format) → lecteur de BD.
  if (hasComic(id)) return comicReader(el, ch, o);
  let page = 0;

  el.innerHTML = `
    <div class="fs manga-view" style="--c:${CHARACTERS.kai.color}">
      <div class="fs-top">
        <a class="fs-close" href="#/histoire" style="display:grid;place-items:center;text-decoration:none">✕</a>
        <div class="grow" style="min-width:0"><div class="tiny dim">Chapitre ${ch.id}/12</div>
          <div class="manga-notion">${ch.emoji} ${esc(ch.title)}</div></div>
        <span class="tiny dim" id="pg"></span>
      </div>
      <div class="manga-scroll" id="scroll"><div class="manga-frame" id="frame"></div><div id="after" style="margin-top:12px"></div></div>
    </div>`;
  const frame = el.querySelector('#frame');
  const after = el.querySelector('#after');

  async function show() {
    el.querySelector('#pg').textContent = `${page + 1}/${ch.strips.length}`;
    frame.classList.remove('turn');
    void frame.offsetWidth;
    frame.classList.add('turn');
    frame.innerHTML = stripSVG(personal(ch.strips[page]), { subtitle: STORY_TITLE.split(' — ')[0] });
    sound('page');
    vibrate(8);
    el.querySelector('#scroll').scrollTo(0, 0);
    const last = page === ch.strips.length - 1;
    const next = o.chapters.find((c) => c.id === id + 1);
    after.innerHTML = last
      ? `<div class="tile center" style="--c:${CHARACTERS.kai.color}">
          <h2 class="grad-text" style="margin:4px 0">Fin du chapitre ${ch.id}</h2>
          <div class="row" style="gap:8px;justify-content:center;margin-top:8px">
            ${page > 0 ? '<button class="btn ghost" id="prev">← Page</button>' : ''}
            ${next?.unlocked ? `<a class="btn" href="#/histoire/${next.id}">Chapitre ${next.id} →</a>` : '<a class="btn" href="#/histoire">📚 Chapitres</a>'}
          </div>
          ${next && !next.unlocked ? `<p class="tiny muted">${esc(line('kai', 'histoire_verrou'))}</p>` : ''}
        </div>`
      : `<div class="row" style="gap:8px">${page > 0 ? '<button class="btn ghost" id="prev">← Page</button>' : ''}<button class="btn grow" id="nextp">Page suivante →</button></div>`;
    after.querySelector('#nextp')?.addEventListener('click', () => { page++; show(); });
    after.querySelector('#prev')?.addEventListener('click', () => { page--; show(); });
    if (last && (await markRead(ch.id))) {
      confetti(60);
      onomatopoeia(ch.id === 12 ? 'FIN DE SAISON!' : `CHAPITRE ${ch.id}!`);
      if (ch.id === 12) sound('victory');
      celebrate(await addXp(XP_RULES.chapter, 'chapters'), after);
    }
  }
  show();
}


// ---------------------------------------------------------------------
// Lecture d'un chapitre en BANDE DESSINÉE (src/comic/)
// ---------------------------------------------------------------------
async function comicReader(el, ch, o) {
  el.innerHTML = '<div class="bd"><div class="spinner" style="margin:40vh auto"></div></div>';
  // Le moteur de BD et le chapitre ne sont téléchargés qu'à l'ouverture.
  const [{ openReader }, data] = await Promise.all([import('../comic/reader.js'), loadComic(ch.id)]);
  const { setComicVars } = await import('../comic/comic.js');
  setComicVars({ prenom: displayName() });
  const next = o.chapters.find((c) => c.id === ch.id + 1);
  await openReader(el, data, ch, async () => {
    const box = document.createElement('div');
    box.className = 'bd-end';
    box.innerHTML = `<div class="bd-end-card">
        <div class="tiny dim">Chapitre ${ch.id}</div>
        <h2 class="grad-text" style="margin:4px 0 10px">${esc(ch.title)} — fin</h2>
        <div class="row" style="gap:8px;justify-content:center">
          <button class="btn ghost" id="again">↺ Relire</button>
          ${next?.unlocked ? `<a class="btn" href="#/histoire/${next.id}">Chapitre ${next.id} →</a>` : '<a class="btn" href="#/histoire">📚 Chapitres</a>'}
        </div>
        ${next && !next.unlocked ? `<p class="tiny muted" style="margin-top:10px">${esc(line('kai', 'histoire_verrou'))}</p>` : ''}
      </div>`;
    el.querySelector('.bd').appendChild(box);
    box.querySelector('#again').onclick = () => comicReader(el, ch, o);
    if (await markRead(ch.id)) {
      confetti(60);
      onomatopoeia(ch.id === 12 ? 'FIN DE SAISON!' : `CHAPITRE ${ch.id}!`);
      if (ch.id === 12) sound('victory');
      celebrate(await addXp(XP_RULES.chapter, 'chapters'), box);
    } else sound('page');
  });
}
