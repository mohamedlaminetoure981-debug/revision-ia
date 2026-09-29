// =====================================================================
// views/add.js — Ajouter un cours avec Mory (photos ou PDF)
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { esc, toast, progress, showError, mascot, say } from '../ui/ui.js';
import { compressImage, readPdf, createCourse, transcribeCourse, MAX_IMAGES, MAX_PDF_MB } from '../core/importer.js';
import { addXp, XP_RULES } from '../core/game.js';
import { celebrate, vibrate, sound } from '../ui/fx.js';

export async function render(el) {
  const courses = await db.getAll('courses');
  const subjects = [...new Set(courses.map((c) => c.subject))].sort();
  const color = CHARACTERS.mory.color;

  let photos = []; // photos déjà compressées : [{ blob, url }]
  let pdfFile = null;
  let mode = 'photos';

  el.innerHTML = `
    <div class="screen-head"><h1>➕ Ajouter un cours</h1></div>
    <div id="mory" style="margin-bottom:14px">${mascot('mory', { situation: 'arrivee', expression: 'joie' })}</div>

    <div class="tile" style="margin-bottom:12px">
      <label class="field" for="title" style="margin-top:0">Titre du cours</label>
      <input id="title" type="text" placeholder="Ex. : Chapitre 3 – Les graphes" maxlength="120">
      <label class="field" for="subject">Matière</label>
      <input id="subject" type="text" list="subjects" placeholder="Ex. : Algorithmique" maxlength="60">
      <datalist id="subjects">${subjects.map((s) => `<option value="${esc(s)}">`).join('')}</datalist>
    </div>

    <div class="tile neon" style="--c:${color};margin-bottom:14px">
      <div class="seg" style="margin-bottom:12px">
        <button data-mode="photos" class="active">📷 Photos</button>
        <button data-mode="pdf">📄 PDF</button>
      </div>

      <div id="photos-zone">
        <div class="bento">
          <span class="btn filepick cyan">📷 Photo
            <input id="cam" type="file" accept="image/*" capture="environment"></span>
          <span class="btn ghost filepick">🖼️ Galerie
            <input id="gal" type="file" accept="image/*" multiple></span>
        </div>
        <div id="thumbs" class="thumbs"></div>
        <p id="photo-info" class="tiny muted" style="margin-bottom:0"></p>
      </div>

      <div id="pdf-zone" hidden>
        <span class="btn ghost filepick block">📄 Choisir un PDF (max ${MAX_PDF_MB} Mo)
          <input id="pdf" type="file" accept="application/pdf,.pdf"></span>
        <p id="pdf-info" class="small muted"></p>
        <label class="check"><span>Analyse visuelle par l'IA<br><span class="tiny muted">Pour les PDF pleins de formules ou de schémas.
          Plus fiable mais plus lourd à envoyer. Un PDF scanné est toujours analysé visuellement.</span></span>
          <span class="switch"><input id="visual" type="checkbox"><span></span></span></label>
      </div>
    </div>

    <button id="go" class="btn block">⚡ Scanner le cours</button>
  `;

  const $ = (s) => el.querySelector(s);
  const moryBox = $('#mory');

  // --- Onglets Photos / PDF ---
  el.querySelectorAll('[data-mode]').forEach((b) => {
    b.onclick = () => {
      mode = b.dataset.mode;
      el.querySelectorAll('[data-mode]').forEach((x) => x.classList.toggle('active', x === b));
      $('#photos-zone').hidden = mode !== 'photos';
      $('#pdf-zone').hidden = mode !== 'pdf';
      say(moryBox, null, {
        text: mode === 'pdf' ? 'Un PDF avec du texte ? Je le lis directement, sans rien envoyer !' : 'Une page par photo, bien à plat, bien éclairée. Je compresse tout.',
        expression: 'concentration', anim: 'signature',
      });
    };
  });

  // --- Miniatures ---
  function drawThumbs() {
    $('#thumbs').innerHTML = photos.map((p, i) => `
      <div class="thumb"><img src="${p.url}" alt="Photo ${i + 1}"><span class="n">${i + 1}</span>
      <button data-del="${i}" aria-label="Retirer">✕</button></div>`).join('');
    const size = photos.reduce((s, p) => s + p.blob.size, 0);
    $('#photo-info').textContent = photos.length
      ? `${photos.length} photo(s) · ≈ ${(size / 1048576).toFixed(2)} Mo à envoyer après compression`
      : '';
    $('#thumbs').querySelectorAll('[data-del]').forEach((b) => {
      b.onclick = () => {
        const [removed] = photos.splice(Number(b.dataset.del), 1);
        URL.revokeObjectURL(removed.url);
        drawThumbs();
      };
    });
  }

  // --- Ajout de photos ---
  async function addPhotos(input) {
    const files = [...input.files];
    input.value = ''; // permet de reprendre une photo tout de suite
    if (!files.length) return;
    if (photos.length + files.length > MAX_IMAGES) {
      showError(new Error(`📦 Maximum ${MAX_IMAGES} photos par cours. Découpe ton cours en plusieurs parties.`));
      return;
    }
    const pg = progress('Mory compresse tes photos', 'mory');
    try {
      for (let i = 0; i < files.length; i++) {
        pg.set(`Photo ${i + 1}/${files.length}…`);
        const blob = await compressImage(files[i]);
        photos.push({ blob, url: URL.createObjectURL(blob) });
      }
      say(moryBox, null, { text: `${photos.length} page(s) prête(s). Encore une ou on lance le scan ?`, expression: 'joie', anim: 'bounce' });
      vibrate();
    } catch (e) {
      showError(e);
    } finally {
      pg.done();
      drawThumbs();
    }
  }
  $('#cam').onchange = (e) => addPhotos(e.target);
  $('#gal').onchange = (e) => addPhotos(e.target);

  $('#pdf').onchange = (e) => {
    pdfFile = e.target.files[0] || null;
    $('#pdf-info').textContent = pdfFile ? `${pdfFile.name} · ${(pdfFile.size / 1048576).toFixed(2)} Mo` : '';
    if (pdfFile && pdfFile.size > MAX_PDF_MB * 1048576) {
      showError(new Error(`📦 Fichier trop gros (${(pdfFile.size / 1048576).toFixed(1)} Mo). Maximum : ${MAX_PDF_MB} Mo.`));
      pdfFile = null;
    }
  };

  // --- Import ---
  $('#go').onclick = async () => {
    const title = $('#title').value.trim();
    const subject = $('#subject').value.trim();
    const moan = (text) => { say(moryBox, null, { text, expression: 'surprise', anim: 'shake' }); vibrate([30, 30, 30]); };
    if (!title) { moan('Il me faut un titre pour ranger le cours !'); $('#title').focus(); return; }
    if (mode === 'photos' && !photos.length) { moan('Aucune photo… Ajoute au moins une page !'); return; }
    if (mode === 'pdf' && !pdfFile) { moan('Choisis un fichier PDF d’abord.'); return; }

    const pg = progress('Mory scanne ton cours', 'mory');
    let course = null;
    try {
      if (mode === 'pdf') {
        const res = await readPdf(pdfFile, { visual: $('#visual').checked, onStatus: pg.set });
        if (res.mode === 'text') {
          // PDF avec texte : aucune transcription nécessaire, rien n'est envoyé !
          course = await createCourse({ title, subject, sourceType: 'pdf', pages: res.pages });
        } else {
          course = await createCourse({ title, subject, sourceType: 'pdf', images: res.images });
        }
      } else {
        course = await createCourse({ title, subject, sourceType: 'photos', images: photos.map((p) => p.blob) });
      }
      if (course.pages.length < course.totalUnits) await transcribeCourse(course, pg.set);
      pg.done();
      sound('good');
      toast('✅ Mory : cours scanné et rangé !', 'ok');
      celebrate(await addXp(XP_RULES.courseAdded));
      location.hash = `#/course/${course.id}/resume`;
    } catch (e) {
      pg.done();
      if (course) {
        // Le cours est enregistré : on pourra reprendre la transcription.
        showError(new Error(`${e.message}\n\nTon cours est enregistré : tu pourras reprendre depuis sa page.`));
        location.hash = `#/course/${course.id}`;
      } else {
        showError(e);
      }
    }
  };
}
