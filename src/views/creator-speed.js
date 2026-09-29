// =====================================================================
// views/creator-speed.js — Panneau créateur : VITESSE DE L'IA
// ---------------------------------------------------------------------
//  - temps des dernières générations (premier texte reçu, fin, modèle,
//    réessais, bascules) ;
//  - BANC D'ESSAI "avant / après" : le même résumé, sur le même cours,
//    avec l'ancienne méthode puis la nouvelle, et le gain en %.
// =====================================================================

import * as db from '../core/db.js';
import { esc, toast, showError } from '../ui/ui.js';
import { generateJSON, loadTimings, getTimings } from '../core/gemini.js';
import * as P from '../data/prompts.js';
import { chunks, unitLabel } from '../core/generate.js';

// Ancienne méthode (avant l'optimisation), gardée pour comparer :
// modèle Flash "classique", réflexion par défaut, pas de streaming,
// consignes longues.
const OLD_MODEL = 'gemini-3.8-flash';
const OLD_SYSTEM = `Tu es un professeur particulier expert et bienveillant qui aide un lycéen ou
un étudiant (15-25 ans, en Guinée / Afrique francophone) à réviser ses cours.
Règles absolues :
- Réponds toujours en français clair et simple, en tutoyant. Phrases courtes.
- Sérieux sur le fond : exactitude avant tout.
- Base-toi UNIQUEMENT sur le cours fourni. N'invente jamais un fait qui contredit le cours.
- Écris toutes les formules mathématiques en LaTeX entre $...$ (en ligne) ou $$...$$ (bloc).
- Tu peux utiliser du Markdown simple : **gras**, *italique*, listes "- ", titres "### ", \`code\`.
- Les citations ("quote") doivent être copiées MOT POUR MOT depuis le cours (10 à 30 mots maximum).`;
const oldSummaryPrompt = (text, unit) => `Fais un résumé structuré de ce morceau de cours, partie par partie, dans l'ordre du cours.
- N'oublie AUCUNE notion, définition, formule, propriété, exemple important ou méthode.
- Une "section" par partie du cours, avec son titre et les numéros de ${unit.toLowerCase()} concernés.
- Blocs de type "cours" : le contenu du cours, résumé fidèlement.
- Quand un passage du cours est peu expliqué (définition sèche, étape de calcul sautée,
  notion supposée connue), ajoute juste après un bloc de type "explication" qui le développe
  simplement, avec un exemple si utile. Ces blocs seront marqués "💡 Explication ajoutée".

COURS :
${text}`;

const sec = (ms) => (ms / 1000).toFixed(1).replace('.', ',') + ' s';

/** HTML de la section "Vitesse de l'IA". */
export async function speedSection() {
  await loadTimings();
  const courses = (await db.getAll('courses')).filter((c) => c.pages?.length);
  return `
    <div class="tile" style="margin-bottom:12px" id="speed">
      <h2 style="margin-top:0">⏱️ Vitesse de l'IA</h2>
      <p class="tiny muted">Dernières générations : « 1er texte » = temps avant de recevoir le début de la réponse.</p>
      <div id="timings"></div>
      <h3>Banc d'essai avant / après</h3>
      <p class="tiny muted">Même cours, même 1re partie du résumé : ancienne méthode (${OLD_MODEL}, réflexion par défaut, sans streaming, consignes longues)
        puis nouvelle méthode (modèle rapide, réflexion minimale, streaming, consignes courtes). Utilise 2 requêtes de ton quota.</p>
      ${courses.length ? `
        <select id="bench-course">${courses.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select>
        <button class="btn block" id="bench" style="margin-top:8px">⏱️ Mesurer avant / après</button>
        <div id="bench-out"></div>` : '<p class="small muted">Ajoute d’abord un cours pour lancer le banc d’essai.</p>'}
    </div>`;
}

/** Tableau des dernières mesures. */
function drawTimings(el) {
  const t = getTimings();
  el.querySelector('#timings').innerHTML = t.length ? `
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Étape</th><th>1er texte</th><th>Total</th><th>Modèle</th><th>Réessais</th></tr></thead>
      <tbody>${t.map((x) => `<tr><td>${esc(x.label)}${x.stream ? ' ⚡' : ''}</td><td>${sec(x.firstMs)}</td><td>${sec(x.totalMs)}</td>
        <td class="tiny">${esc(x.model)}</td><td>${x.retries}${x.switches?.length ? ` (bascule : ${x.switches.map(esc).join(', ')})` : ''}</td></tr>`).join('')}</tbody>
    </table></div><p class="tiny dim">⚡ = streaming</p>` : '<p class="small muted">Aucune génération mesurée pour l’instant.</p>';
}

/** Active les boutons de la section. */
export function bindSpeed(el) {
  if (!el.querySelector('#speed')) return;
  drawTimings(el);
  const btn = el.querySelector('#bench');
  if (!btn) return;
  btn.onclick = async () => {
    const course = await db.get('courses', el.querySelector('#bench-course').value);
    const pages = chunks(course)[0];
    const unit = unitLabel(course);
    const text = P.courseText(pages, unit);
    const out = el.querySelector('#bench-out');
    btn.disabled = true;
    try {
      out.innerHTML = '<p class="small">1/2 · Ancienne méthode en cours…</p>';
      const t0 = performance.now();
      await generateJSON({
        parts: [{ text: oldSummaryPrompt(text, unit) }], schema: P.SUMMARY_SCHEMA, system: OLD_SYSTEM,
        model: OLD_MODEL, thinking: 'default', label: 'banc : AVANT',
      });
      const before = { total: performance.now() - t0 };
      before.first = before.total; // sans streaming, rien n'arrive avant la fin

      out.innerHTML = '<p class="small">2/2 · Nouvelle méthode en cours…</p>';
      const t1 = performance.now();
      let first = 0;
      await generateJSON({
        parts: [{ text: P.summaryPrompt(text, unit) }], schema: P.SUMMARY_SCHEMA, system: P.SYSTEM,
        streamKey: 'sections', onItem: () => { if (!first) first = performance.now() - t1; }, label: 'banc : APRÈS',
      });
      const after = { total: performance.now() - t1, first: first || performance.now() - t1 };
      const gain = (a, b) => Math.round((1 - b / a) * 100);
      out.innerHTML = `
        <table class="data-table" style="margin-top:10px">
          <thead><tr><th></th><th>Avant</th><th>Après</th><th>Gain</th></tr></thead>
          <tbody>
            <tr><td>1re story visible</td><td>${sec(before.first)}</td><td><strong>${sec(after.first)}</strong></td><td><strong>${gain(before.first, after.first)} %</strong></td></tr>
            <tr><td>Résumé complet</td><td>${sec(before.total)}</td><td>${sec(after.total)}</td><td>${gain(before.total, after.total)} %</td></tr>
          </tbody></table>`;
      toast('Mesure terminée ✅', 'ok');
    } catch (e) {
      out.innerHTML = '';
      showError(e);
    } finally {
      btn.disabled = false;
      drawTimings(el);
    }
  };
}
