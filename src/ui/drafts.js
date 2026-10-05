// =====================================================================
// drafts.js — Brouillons de saisie : ce que l'élève tape n'est jamais perdu
// ---------------------------------------------------------------------
// Les champs marqués data-draft="nom" sont enregistrés à chaque frappe (dans
// sessionStorage, sur l'appareil seulement). Si la page se recharge quand même
// (navigateur qui recharge un onglet, coupure…), les champs VIDES retrouvent
// leur texte. Dès qu'on change d'écran, les brouillons sont effacés.
// ⚠️ Jamais sur un champ secret (clé API, code créateur) : pas de data-draft.
// =====================================================================

const KEY = 'drafts';
let current = ''; // écran affiché

function read() {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null') || { route: '', fields: {} }; } catch { return { route: '', fields: {} }; }
}
function write(d) {
  try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch { /* navigation privée : tant pis */ }
}

/** Enregistre chaque frappe dans un champ data-draft (un seul écouteur pour toute l'appli). */
export function trackDrafts() {
  document.addEventListener('input', (e) => {
    const el = e.target;
    const name = el?.dataset?.draft;
    if (!name || el.type === 'password') return;
    const d = read();
    if (d.route !== current) { d.route = current; d.fields = {}; }
    d.fields[name] = el.value;
    write(d);
  }, true);
}

/** Écran affiché (les brouillons appartiennent à un écran). */
export function setDraftRoute(name) {
  current = name;
}

/** Remet le texte tapé dans les champs vides de l'écran (après un rechargement). */
export function restoreDrafts(box, name) {
  const d = read();
  if (d.route !== name) return;
  box.querySelectorAll('[data-draft]').forEach((el) => {
    const v = d.fields[el.dataset.draft];
    if (v && !el.value && el.type !== 'password') el.value = v;
  });
}

/** Efface tous les brouillons (on a changé d'écran, ou le formulaire est envoyé). */
export function clearDrafts() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignoré */ }
}
