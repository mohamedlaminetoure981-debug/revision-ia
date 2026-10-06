// =====================================================================
// views/story.js — LE MODE HISTOIRE (Kaï)
// ---------------------------------------------------------------------
// #/histoire        : la saison (chapitres) + les arcs (une matière = un arc)
// #/histoire/N      : lecture du chapitre N (planches manga, page par page)
// Contenu 100 % fixe (data/story.js) : aucun appel à l'IA, marche hors ligne.
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { CHAPTERS, STORY_TITLE as STORY_TITLE_FR } from '../data/story.js';
import { play } from '../ui/character.js';
import { esc, line, mascot, displayName, subjectColor, subjectEmoji, say, modal } from '../ui/ui.js';
import { sound, vibrate, confetti, onomatopoeia, celebrate } from '../ui/fx.js';
import { stripSVG } from '../ui/manga.js';
import { storyOverview, newChaptersSinceLastVisit, markRead, BOSS_POINTS } from '../core/story.js';
import { addXp, XP_RULES } from '../core/game.js';
import { hasComic, loadComic } from '../data/comic/index.js';
import { t, getContent } from '../i18n/index.js';

// Titre de la saison (traduit s'il existe dans src/i18n/contenu/<langue>/histoire.json).
const STORY_TITLE = getContent('histoire')?.STORY_TITLE || STORY_TITLE_FR;

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
      <div class="grow"><div class="label">${t("Mode Histoire")}</div><h1 style="font-size:1.25rem">${esc(STORY_TITLE)}</h1></div>
    </div>
    <div class="tile neon" style="--c:${kai.color}">
      ${mascot('kai', { situation: fresh ? 'histoire_nouveau' : 'histoire_intro', expression: fresh ? 'celebration' : 'joie', size: 86 })}
      <div class="row between" style="margin-top:12px"><strong>⭐ ${o.total} ${t("points d'histoire")}</strong>
        <span class="tiny dim">${nextLocked ? `${t("Chapitre")} ${nextLocked.id} ${t('à')} ${nextLocked.needBoss && o.total >= nextLocked.need ? t('1 boss vaincu') : `${nextLocked.need} ${t("pts")}`}` : t('Saison complète !')}</span></div>
      <div class="bar" style="margin-top:6px"><div style="width:${pct}%;background:var(--grad-fire)"></div></div>
      <p class="tiny muted" style="margin:8px 0 0">${t("+1 fiche maîtrisée · +3 quiz ≥ 70 % · +3 exercice ≥ 10/20 · +10 boss vaincu")}</p>
    </div>

    <h2 style="margin:18px 0 8px">${t("📚 Chapitres")}</h2>
    <div class="chapter-list">
      ${o.chapters.map((c) => `
        <a class="chapter ${c.unlocked ? '' : 'locked'} ${c.read ? 'read' : ''}" href="${c.unlocked ? `#/histoire/${c.id}` : '#/histoire'}" data-id="${c.id}">
          <span class="ch-num">${c.unlocked ? c.emoji : '🔒'}</span>
          <span class="grow"><span class="tiny dim">${t("Chapitre")} ${c.id}${c.read ? ' · ✓ lu' : c.unlocked ? t(' · nouveau !') : ''}</span>
            <strong>${c.unlocked ? esc(c.title) : '???'}</strong>
            <span class="tiny muted">${c.unlocked ? esc(c.teaser) : c.needBoss && o.total >= c.need ? t('Bats un boss de fin d’arc pour le débloquer.') : `${t("Débloqué à")} ${c.need} ${t("points (encore")} ${Math.max(0, c.need - o.total)}).`}</span></span>
        </a>`).join('')}
    </div>

    <h2 style="margin:18px 0 8px">${t("⚔️ Les arcs (tes matières)")}</h2>
    ${o.arcs.length ? o.arcs.map((a) => `
      <div class="tile arc" style="--c:${subjectColor(a.subject)};margin-bottom:10px">
        <div class="row between nowrap"><strong>${subjectEmoji(a.subject)} ${t("Arc")} ${esc(a.subject)}</strong>
          <span class="tiny dim">${a.points} ${t("pts")}</span></div>
        <div class="bar" style="margin:8px 0"><div style="width:${Math.min(100, (100 * a.points) / BOSS_POINTS)}%;background:var(--c)"></div></div>
        ${a.defeated
          ? `<div class="row between"><span class="chip ok">${t("👊 Boss vaincu")}</span><a class="btn small ghost" href="#/boss/${encodeURIComponent(a.subject)}">${t("Revanche")}</a></div>`
          : a.ready
            ? `<a class="btn block boss-btn" href="#/boss/${encodeURIComponent(a.subject)}">${t("💀 Affronter le boss de l'arc")}</a>`
            : `<p class="tiny muted" style="margin:0">${t("Le boss apparaît à")} ${BOSS_POINTS} ${t("points dans cette matière.")}</p>`}
      </div>`).join('') : `<div class="tile">${mascot('mory', { text: t('Ajoute un cours : chaque matière devient un arc avec son boss !'), size: 70 })}<a class="btn block" href="#/ajouter" style="margin-top:10px">${t("➕ Ajouter un cours")}</a></div>`}
  `;
  // Chapitre verrouillé : Kaï réagit.
  el.querySelectorAll('.chapter.locked').forEach((a) => {
    a.onclick = (e) => { e.preventDefault(); say(el.querySelector('.mascot'), 'histoire_verrou', { expression: 'clin', anim: 'shake' }); play(a, 'shake'); };
  });
  if (fresh) { sound('unlock'); setTimeout(() => onomatopoeia(t('NOUVEAU CHAPITRE!')), 300); }
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
        <div class="grow" style="min-width:0"><div class="tiny dim">${t("Chapitre")} ${ch.id}/12</div>
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
          <h2 class="grad-text" style="margin:4px 0">${t("Fin du chapitre")} ${ch.id}</h2>
          <div class="row" style="gap:8px;justify-content:center;margin-top:8px">
            ${page > 0 ? `<button class="btn ghost" id="prev">${t("← Page")}</button>` : ''}
            ${next?.unlocked ? `<a class="btn" href="#/histoire/${next.id}">${t("Chapitre")} ${next.id} →</a>` : `<a class="btn" href="#/histoire">${t("📚 Chapitres")}</a>`}
          </div>
          ${next && !next.unlocked ? `<p class="tiny muted">${esc(line('kai', 'histoire_verrou'))}</p>` : ''}
        </div>`
      : `<div class="row" style="gap:8px">${page > 0 ? `<button class="btn ghost" id="prev">${t("← Page")}</button>` : ''}<button class="btn grow" id="nextp">${t("Page suivante →")}</button></div>`;
    after.querySelector('#nextp')?.addEventListener('click', () => { page++; show(); });
    after.querySelector('#prev')?.addEventListener('click', () => { page--; show(); });
    if (last && (await markRead(ch.id))) {
      confetti(60);
      onomatopoeia(ch.id === 12 ? t('FIN DE SAISON!') : `${t("CHAPITRE")} ${ch.id}!`);
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
  const [{ openReader, savedPage }, data] = await Promise.all([import('../comic/reader.js'), loadComic(ch.id)]);
  const { setComicVars } = await import('../comic/comic.js');
  setComicVars({ prenom: displayName() });
  const next = o.chapters.find((c) => c.id === ch.id + 1);
  // Chapitre commencé : reprendre là où l'élève s'était arrêté, ou recommencer.
  let startPage = savedPage(ch.id, data.pages.length);
  if (startPage) startPage = await resumeChoice(startPage);
  await openReader(el, data, ch, async () => {
    const box = document.createElement('div');
    box.className = 'bd-end';
    box.innerHTML = `<div class="bd-end-card">
        <div class="tiny dim">${t("Chapitre")} ${ch.id}</div>
        <h2 class="grad-text" style="margin:4px 0 10px">${esc(ch.title)} ${t("— fin")}</h2>
        <div class="row" style="gap:8px;justify-content:center">
          <button class="btn ghost" id="again">${t("↺ Relire")}</button>
          ${next?.unlocked ? `<a class="btn" href="#/histoire/${next.id}">${t("Chapitre")} ${next.id} →</a>` : `<a class="btn" href="#/histoire">${t("📚 Chapitres")}</a>`}
        </div>
        ${next && !next.unlocked ? `<p class="tiny muted" style="margin-top:10px">${esc(line('kai', 'histoire_verrou'))}</p>` : ''}
      </div>`;
    el.querySelector('.bd').appendChild(box);
    box.querySelector('#again').onclick = () => comicReader(el, ch, o);
    if (await markRead(ch.id)) {
      confetti(60);
      onomatopoeia(ch.id === 12 ? t('FIN DE SAISON!') : `${t("CHAPITRE")} ${ch.id}!`);
      if (ch.id === 12) sound('victory');
      celebrate(await addXp(XP_RULES.chapter, 'chapters'), box);
    } else sound('page');
  }, { startPage });
}

/** Propose « Reprendre page X » ou « Recommencer ». Renvoie la page d'ouverture (0 = début). */
function resumeChoice(page) {
  return new Promise((resolve) => {
    const m = modal(`<h3 style="margin-top:0">${t('📖 Chapitre commencé')}</h3>
      <p class="small muted">${t('Tu t’étais arrêté(e) à la page')} ${page + 1}.</p>
      <div class="row nowrap" style="gap:8px;margin-top:12px">
        <button class="btn ghost grow" id="rs-start">${t('↺ Recommencer')}</button>
        <button class="btn grow" id="rs-go">${t('▶️ Reprendre page')} ${page + 1}</button>
      </div>`, { locked: true });
    m.el.querySelector('#rs-go').onclick = () => { m.close(); resolve(page); };
    m.el.querySelector('#rs-start').onclick = () => { m.close(); resolve(0); };
  });
}
