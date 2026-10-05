// =====================================================================
// views/exercise.js — Un exercice avec Awa : énoncé, réponse (texte et/ou
// photo du brouillon), correction étape par étape, note et conseils.
// Adresse : #/exo/ID_EXERCICE
// =====================================================================

import * as db from '../core/db.js';
import { CHARACTERS } from '../data/characters.js';
import { play, speak } from '../ui/character.js';
import { esc, rich, sourceHtml, mascot, line, progress, showError, frDate, mathText } from '../ui/ui.js';
import { compressImage } from '../core/importer.js';
import { correctExercise, verdictOf } from '../core/generate.js';
import { addXp, XP_RULES } from '../core/game.js';
import { celebrate, confetti, onomatopoeia, vibrate, sound } from '../ui/fx.js';
import { runWithCouncil } from '../ui/council.js';
import { power } from '../ui/powers.js';

const STATUS = {
  juste: { icon: '✅', cls: 'ok', label: 'Juste' },
  partiel: { icon: '🟡', cls: 'warn', label: 'Partiel' },
  faux: { icon: '❌', cls: 'bad', label: 'Faux' },
  manquant: { icon: '⬜', cls: '', label: 'Manquant' },
};
const DIFF = { facile: '🟢 Facile', moyen: '🟡 Moyen', difficile: '🔴 Difficile' };

/** Affiche une correction (utilisé ici et après la scène de correction). */
export function correctionHtml(course, correction) {
  const g = Math.round(correction.grade * 2) / 2;
  const verdict = correction.verdict || verdictOf(g);
  const color = verdict === 'excellent' ? 'var(--neon-green)' : verdict === 'bon' ? 'var(--neon-cyan)' : verdict === 'moyen' ? 'var(--neon-yellow)' : 'var(--neon-pink)';
  return `
    <div class="tile center" style="margin-bottom:12px;border-color:${color}">
      <div class="label">Note d'Awa</div>
      <div class="big" style="font-size:3.2rem;color:${color}">${g}<span style="font-size:1.4rem">/20</span></div>
      ${correction.check === 'ok' ? '<span class="chip ok">🔍 correction vérifiée</span>' : ''}
      ${correction.check === 'corrige' ? `<span class="chip warn">🔍 correction rectifiée par la vérification</span><p class="tiny muted">${mathText(correction.checkComment || '')}</p>` : ''}
    </div>
    <h2>Étape par étape</h2>
    ${correction.steps.map((s) => `
      <div class="tile" style="margin-bottom:8px">
        <div class="row nowrap"><span>${STATUS[s.status]?.icon || '•'}</span><strong class="grow">${mathText(s.title)}</strong>
          <span class="chip ${STATUS[s.status]?.cls || ''}">${STATUS[s.status]?.label || esc(s.status)}</span></div>
        <div class="rich small" style="margin-top:6px">${rich(s.comment)}</div>
      </div>`).join('')}
    <h2>Corrigé</h2>
    <div class="tile rich" style="margin-bottom:12px">${rich(correction.solution)}</div>
    <div class="tile neon" style="--c:${CHARACTERS.awa.color};margin-bottom:12px">
      <h3 style="margin-top:0">💡 Les conseils d'Awa</h3>
      <ul class="small" style="padding-left:1.2em;margin:0">${correction.advice.map((a) => `<li>${rich(a).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul>
    </div>
    ${sourceHtml(course, correction.source)}`;
}

export async function render(el, [exoId]) {
  const exo = await db.get('exercises', exoId);
  const course = exo && (await db.get('courses', exo.courseId));
  if (!exo || !course) {
    el.innerHTML = `<div class="tile">${mascot('awa', { text: 'Cet exercice n’existe plus.' })}<a class="btn" href="#/quiz">Retour</a></div>`;
    return;
  }
  let photo = null; // photo compressée du brouillon
  const last = exo.attempts?.at(-1);

  el.innerHTML = `
    <div class="screen-head"><a class="back-btn" href="#/course/${course.id}/exercices">←</a>
      <div class="grow"><div class="tiny muted">${esc(course.title)} · ${DIFF[exo.difficulty] || ''}</div><h1 style="font-size:1.2rem">${mathText(exo.title)}</h1></div></div>

    <div class="tile" style="margin-bottom:12px">
      <div class="rich">${rich(exo.statement)}</div>
      <details style="margin-top:10px"><summary class="small" style="cursor:pointer;color:var(--neon-yellow)">💡 Voir l'indice d'Awa</summary>
        <div class="rich small" style="margin-top:6px">${rich(exo.hint)}</div></details>
      ${sourceHtml(course, exo.source)}
    </div>

    <div class="tile neon" style="--c:${CHARACTERS.awa.color};margin-bottom:12px">
      ${mascot('awa', { situation: last ? 'encouragement' : 'arrivee', expression: 'concentration', size: 80 })}
      <label class="field" for="ans">Ta réponse (écris toutes les étapes)</label>
      <textarea id="ans" rows="7" placeholder="Ex. : On applique la formule… donc x = …  (formules : $x^2$)">${esc(exo.draft || '')}</textarea>
      <div class="row" style="margin-top:8px">
        <span class="btn ghost small filepick grow">📷 Photo de mon brouillon<input id="photo" type="file" accept="image/*" capture="environment"></span>
      </div>
      <div id="photo-prev"></div>
      <button class="btn block" id="submit" style="margin-top:12px;background:${CHARACTERS.awa.color};color:var(--on-neon)">✍️ Faire corriger par Awa</button>
    </div>

    <div id="result">${last ? `<h2>Dernière correction · ${frDate(last.date)}</h2>${correctionHtml(course, last.correction)}` : ''}</div>
  `;

  const $ = (s) => el.querySelector(s);
  // Brouillon enregistré automatiquement (utile si la connexion coupe).
  let t;
  $('#ans').oninput = () => {
    clearTimeout(t);
    t = setTimeout(() => { exo.draft = $('#ans').value; db.put('exercises', exo); }, 600);
  };

  $('#photo').onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      photo = await compressImage(f);
      $('#photo-prev').innerHTML = `<div class="thumbs"><div class="thumb"><img src="${URL.createObjectURL(photo)}" alt="Brouillon"><button id="rm">✕</button></div></div>
        <p class="tiny muted">${(photo.size / 1024).toFixed(0)} Ko après compression</p>`;
      $('#rm').onclick = () => { photo = null; $('#photo-prev').innerHTML = ''; };
    } catch (err) { showError(err); }
  };

  $('#submit').onclick = async () => {
    const answer = $('#ans').value.trim();
    if (!answer && !photo) {
      play(el.querySelector('.mascot .ch'), 'shake', { expression: 'surprise' });
      speak(el.querySelector('.mascot .ch'), el.querySelector('.mascot .say'), 'Il me faut ta réponse (texte ou photo) pour corriger !');
      return;
    }
    let attempt;
    try {
      // La correction par l'IA se fait PENDANT la scène du conseil.
      attempt = await runWithCouncil({
        owner: 'awa', title: 'Correction de ton exercice',
        task: (onStatus) => correctExercise(course, exo, answer, photo, onStatus),
        toResult: (a) => ({ level: a.correction.verdict || verdictOf(a.correction.grade), label: `${Math.round(a.correction.grade * 2) / 2}/20` }),
      });
    } catch (e) {
      showError(e, () => $('#submit').click());
      return;
    }
    exo.draft = '';
    await db.put('exercises', exo);
    const grade = attempt.correction.grade;
    const reveal = async () => {
      $('#result').innerHTML = `<h2>Correction</h2>${correctionHtml(course, attempt.correction)}`;
      $('#result').scrollIntoView({ behavior: 'smooth' });
      const awa = el.querySelector('.mascot');
      speak(awa.querySelector('.ch'), awa.querySelector('.say'), line('awa', grade >= 10 ? 'reussite' : 'echec'));
      play(awa.querySelector('.ch'), grade >= 10 ? 'signature' : 'bounce', { expression: grade >= 14 ? 'celebration' : grade >= 10 ? 'joie' : 'encouragement' });
      if (grade >= 16) { confetti(); onomatopoeia('YOSH!'); sound('level'); } else { sound(grade >= 10 ? 'good' : 'bad'); }
      vibrate(grade >= 10 ? [20, 30, 20] : 30);
      celebrate(await addXp(XP_RULES.exercise + Math.round(grade * 2), 'exercises'), $('#result'));
      // Aura d'Awa : forte pour 20/20, légère pour une réussite.
      if (grade >= 20) power('awa', 'strong', { target: awa.querySelector('.ch') });
      else if (grade >= 10) power('awa', 'light', { target: awa.querySelector('.ch') });
    };
    await reveal();
  };
}
