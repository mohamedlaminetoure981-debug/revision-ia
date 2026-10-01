// =====================================================================
// views/manga.js — "📖 Version manga" d'une notion (Nia)
// ---------------------------------------------------------------------
// Adresse : #/manga/ID_COURS/N°_NOTION
// - Planche déjà créée → affichée tout de suite (même hors ligne).
// - Sinon : l'IA écrit les 4 cases, qui apparaissent une par une
//   (streaming), puis la planche est sauvegardée pour toujours.
// - Sous la planche : le passage du cours (pour vérifier).
// - Bouton "Partager" : image PNG (WhatsApp…).
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play, setExpression } from '../ui/character.js';
import { esc, line, sourceHtml, showError, toast } from '../ui/ui.js';
import { sound, vibrate, onomatopoeia, celebrate } from '../ui/fx.js';
import { stripSVG, stripToPng } from '../ui/manga.js';
import { shareImage, fileName } from '../ui/share.js';
import { getOrGenerateManga, cachedManga, notionOf } from '../core/manga.js';
import { addXp, XP_RULES } from '../core/game.js';

export async function render(el, [courseId, idx = '0']) {
  const course = await db.get('courses', courseId);
  const index = Number(idx) || 0;
  const notion = course && notionOf(course, index);
  if (!notion) { location.hash = course ? `#/course/${courseId}/resume` : '#/cours'; return; }
  const nia = CHARACTERS.nia;
  const total = course.summary.length;

  el.innerHTML = `
    <div class="fs manga-view" style="--c:${nia.color}">
      <div class="fs-top">
        <button class="fs-close" id="close" aria-label="Fermer">✕</button>
        <div class="grow" style="min-width:0">
          <div class="tiny dim">📖 Version manga · ${index + 1}/${total}</div>
          <div class="manga-notion">${esc(notion.title)}</div>
        </div>
      </div>
      <div class="manga-scroll">
        <div class="mascot small-mascot" style="--c:${nia.color}">
          ${characterHTML('nia', { expression: 'concentration', size: 64 })}
          <div class="bubble"><span class="who">Nia</span><span class="say" id="say">${esc(line('nia', 'manga_attente'))}</span></div>
        </div>
        <div class="manga-frame" id="frame"></div>
        <p class="tiny muted" id="status"></p>
        <div id="after"></div>
      </div>
    </div>`;

  const frame = el.querySelector('#frame');
  const say = el.querySelector('#say');
  const niaEl = el.querySelector('.mascot .ch');
  const status = el.querySelector('#status');
  el.querySelector('#close').onclick = () => (history.length > 1 ? history.back() : (location.hash = `#/course/${courseId}/resume`));

  // Planche "en cours" : les cases déjà reçues + des cases vides.
  const live = [];
  const drawLive = () => {
    const panels = [0, 1, 2, 3].map((k) => live[k] || { character: 'nia', expression: 'concentration', line: '…', narration: '', sfx: '', empty: true });
    frame.innerHTML = stripSVG({ title: notion.title, panels }, { subtitle: course.subject });
    frame.querySelectorAll('svg > g').forEach((g, k) => g.classList.toggle('pending', !live[k]));
  };

  let strip = await cachedManga(course, index);
  if (!strip) {
    if (!navigator.onLine) {
      frame.innerHTML = '';
      say.textContent = 'Pour dessiner une NOUVELLE planche, il me faut internet. Une fois créée, elle reste dispo hors ligne !';
      setExpression(niaEl, 'encouragement');
    }
    drawLive();
    try {
      strip = await getOrGenerateManga(course, index, (t) => { status.textContent = t; }, (p, k) => {
        live[k] = p;
        drawLive();
        frame.querySelectorAll('svg > g')[k]?.classList.add('ink-in');
        sound('ink');
        vibrate(6);
      });
    } catch (e) {
      status.textContent = '';
      showError(e, () => render(el, [courseId, idx]));
      say.textContent = 'Oups, ma plume a glissé… On réessaie ?';
      return;
    }
    status.textContent = '';
  }

  // --- Planche complète ---
  frame.innerHTML = stripSVG(strip, { subtitle: course.subject });
  frame.classList.add('done');
  sound('page');
  setExpression(niaEl, 'joie');
  play(niaEl, 'bounce');
  say.textContent = line('nia', 'manga_pret');

  // 1re lecture de cette planche → petite récompense.
  if (!strip.read) {
    strip.read = true;
    await db.put('mangas', strip);
    onomatopoeia('MANGA!');
    celebrate(await addXp(XP_RULES.manga, 'mangas'), frame);
  }

  const after = el.querySelector('#after');
  after.innerHTML = `
    ${strip.source ? sourceHtml(course, strip.source) : ''}
    <div class="row" style="gap:8px;margin-top:12px">
      <button class="btn grow" id="share">📤 Partager l'image</button>
    </div>
    <div class="row between" style="margin-top:10px">
      ${index > 0 ? `<a class="btn ghost small" href="#/manga/${courseId}/${index - 1}">← Notion précédente</a>` : '<span></span>'}
      ${index < total - 1 ? `<a class="btn ghost small" href="#/manga/${courseId}/${index + 1}">Notion suivante →</a>` : ''}
    </div>`;
  after.querySelector('#share').onclick = async (ev) => {
    const b = ev.currentTarget;
    b.disabled = true;
    b.textContent = '⏳ Image en préparation…';
    try {
      const png = await stripToPng(strip, { subtitle: course.subject });
      const r = await shareImage(png, fileName('manga', strip.title), `📖 ${strip.title} — révisé en manga avec Révision IA`);
      if (r === 'shared') say.textContent = line('nia', 'manga_partage');
    } catch (e) {
      toast('Impossible de créer l’image sur ce téléphone.', 'error');
      console.error(e);
    }
    b.disabled = false;
    b.textContent = "📤 Partager l'image";
  };
}
