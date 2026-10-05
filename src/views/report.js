// =====================================================================
// views/report.js — Fenêtre "Signaler une erreur"
// ---------------------------------------------------------------------
// Pour une fiche : corriger la question/réponse, la marquer comme fausse
// (elle ne sera plus proposée en révision tant qu'elle n'est pas corrigée)
// ou la supprimer.
// Pour une question de quiz : corriger la bonne réponse / l'explication,
// ou supprimer la question du quiz.
// =====================================================================

import * as db from '../core/db.js';
import { esc, modal, toast, sourceHtml } from '../ui/ui.js';
import { t } from '../i18n/index.js';

/**
 * Ouvre la fenêtre de signalement d'une fiche.
 * @param {object} card     la fiche
 * @param {object} course   le cours (pour afficher la source)
 * @param {Function} onDone appelée après modification (pour rafraîchir l'écran)
 */
export function reportCard(card, course, onDone) {
  const m = modal(`
    <h3>${t("🚩 Signaler une erreur")}</h3>
    <p class="small muted">${t("Compare avec le passage du cours, puis corrige la fiche, marque-la\n      comme fausse pour plus tard, ou supprime-la.")}</p>
    ${sourceHtml(course, card.source)}
    <label class="field" for="rq">${t("Question")}</label>
    <textarea id="rq">${esc(card.question)}</textarea>
    <label class="field" for="ra">${t("Réponse")}</label>
    <textarea id="ra">${esc(card.answer)}</textarea>
    <p class="small muted">${t("Astuce : formules entre $...$ (ex. $x^2$).")}</p>
    <div class="stack" style="margin-top:12px">
      <button class="btn block" id="r-save">${t("✅ Enregistrer la correction")}</button>
      <button class="btn ghost block" id="r-flag">${t("🚩 Marquer comme fausse (corriger plus tard)")}</button>
      <button class="btn danger block" id="r-del">${t("🗑️ Supprimer la fiche")}</button>
      <button class="btn ghost block" data-close>${t("Annuler")}</button>
    </div>`);
  const $ = (s) => m.el.querySelector(s);

  $('#r-save').onclick = async () => {
    card.question = $('#rq').value.trim();
    card.answer = $('#ra').value.trim();
    card.flagged = false;
    card.edited = true;
    await db.put('cards', card);
    m.close();
    toast(t('Fiche corrigée ✅'), 'ok');
    onDone?.();
  };
  $('#r-flag').onclick = async () => {
    card.flagged = true;
    await db.put('cards', card);
    m.close();
    toast(t('Fiche marquée comme fausse. Elle ne sera plus proposée en révision.'));
    onDone?.();
  };
  $('#r-del').onclick = async () => {
    await db.del('cards', card.id);
    m.close();
    toast(t('Fiche supprimée.'));
    onDone?.('deleted');
  };
}

/** Fenêtre de signalement d'une question de quiz. */
export function reportQuestion(quiz, index, course, onDone) {
  const q = quiz.questions[index];
  const m = modal(`
    <h3>${t("🚩 Signaler une erreur")}</h3>
    ${sourceHtml(course, q.source)}
    <label class="field" for="rq">${t("Question")}</label>
    <textarea id="rq">${esc(q.question)}</textarea>
    <label class="field">${t("Choix (coche la bonne réponse)")}</label>
    ${q.choices.map((c, i) => `
      <div class="row" style="margin:6px 0">
        <input type="radio" name="good" value="${i}" ${i === q.correctIndex ? 'checked' : ''} style="width:20px;height:20px">
        <input type="text" class="grow" data-choice="${i}" value="${esc(c)}" style="width:auto">
      </div>`).join('')}
    <label class="field" for="re">${t("Explication")}</label>
    <textarea id="re">${esc(q.explanation)}</textarea>
    <div class="stack" style="margin-top:12px">
      <button class="btn block" id="r-save">${t("✅ Enregistrer la correction")}</button>
      <button class="btn danger block" id="r-del">${t("🗑️ Supprimer cette question")}</button>
      <button class="btn ghost block" data-close>${t("Annuler")}</button>
    </div>`);
  const $ = (s) => m.el.querySelector(s);

  $('#r-save').onclick = async () => {
    q.question = $('#rq').value.trim();
    q.choices = [...m.el.querySelectorAll('[data-choice]')].map((i) => i.value.trim());
    q.correctIndex = Number(m.el.querySelector('input[name=good]:checked').value);
    q.explanation = $('#re').value.trim();
    q.edited = true;
    await db.put('quizzes', quiz);
    m.close();
    toast(t('Question corrigée ✅'), 'ok');
    onDone?.();
  };
  $('#r-del').onclick = async () => {
    quiz.questions.splice(index, 1);
    await db.put('quizzes', quiz);
    m.close();
    toast(t('Question supprimée.'));
    onDone?.('deleted');
  };
}
