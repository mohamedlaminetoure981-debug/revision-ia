// =====================================================================
// samsung-tip.js — Plan de secours pour Samsung Internet (Tidiane)
// ---------------------------------------------------------------------
// Si l'appli est ouverte dans Samsung Internet avec le téléphone en mode
// sombre, le navigateur peut quand même appliquer son "mode sombre forcé"
// (menu ⋮ → "Site sombre"), qui délave les personnages. On affiche alors
// UNE SEULE FOIS un petit message discret de Tidiane. Le bouton "Compris"
// enregistre le choix dans la base (réglage "samsungTipSeen") : le message
// ne revient plus jamais.
// =====================================================================

import * as db from '../core/db.js';
import { characterHTML } from './character.js';
import { t } from '../i18n/index.js';

/** Samsung Internet + téléphone en mode sombre ? */
function concerned() {
  return /SamsungBrowser/i.test(navigator.userAgent) && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** À appeler au démarrage (après le premier écran). */
export async function samsungTip() {
  if (!concerned() || (await db.getSetting('samsungTipSeen'))) return;
  if (location.hash.startsWith('#/bienvenue')) return; // pas pendant l'écran de bienvenue
  const tip = document.createElement('div');
  tip.className = 'tile samsung-tip';
  tip.setAttribute('role', 'status');
  tip.innerHTML = `
    <div class="row nowrap">
      ${characterHTML('tidiane', { expression: 'clin', size: 46, enter: false })}
      <p class="grow small" style="margin:0"><strong>${t("Tidiane :")}</strong> ${t("Si les couleurs te semblent bizarres,\n        touche ⋮ puis « Site lumineux » 😉")}</p>
      <button class="btn small ghost" id="tip-ok">${t("Compris")}</button>
    </div>`;
  document.body.appendChild(tip);
  tip.querySelector('#tip-ok').onclick = async () => {
    await db.setSetting('samsungTipSeen', true); // ne plus jamais l'afficher
    tip.remove();
  };
}
