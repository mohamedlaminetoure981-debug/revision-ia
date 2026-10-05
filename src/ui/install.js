// =====================================================================
// install.js — Bandeau "Installe l'appli" (avec Kaï)
// ---------------------------------------------------------------------
// - Android / Chrome / Edge : le navigateur envoie l'événement
//   "beforeinstallprompt". On le garde de côté et on affiche NOTRE bandeau ;
//   le bouton "Installer" déclenche la vraie installation.
// - iPhone / iPad (Safari) : pas d'installation automatique possible →
//   petit guide illustré : "Touche Partager ⬆️ puis Sur l'écran d'accueil ➕".
// - Jamais si l'appli est déjà installée (mode "standalone"), ni pendant
//   l'écran de bienvenue, un quiz, un examen ou un écran plein écran.
// - "Plus tard" : on ne le remontre pas pendant 3 jours.
// - Profil → Réglages → "📲 Installer l'appli" : openInstall().
// =====================================================================

import { CHARACTERS } from '../data/characters.js';
import { characterHTML, play } from './character.js';
import { esc, modal, toast, line } from './ui.js';
import { vibrate, confetti } from './fx.js';
import { t } from '../i18n/index.js';

const SNOOZE_DAYS = 3;
const SNOOZE_KEY = 'installSnoozeUntil';
// Écrans où le bandeau ne doit jamais apparaître.
const BLOCKED_ROUTES = ['bienvenue', 'play', 'exam', 'review', 'stories', 'exo', 'duel', 'boss', 'manga'];

let deferredPrompt = null; // événement "beforeinstallprompt" gardé de côté
let banner = null;
let currentRoute = '';

/** L'appli est-elle déjà installée (ouverte depuis l'écran d'accueil) ? */
export function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

/** iPhone / iPad ? (les iPad récents se présentent comme un Mac tactile) */
export function isIOS() {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

function snoozed() {
  try { return Date.now() < Number(localStorage.getItem(SNOOZE_KEY) || 0); } catch { return false; }
}
function snooze() {
  try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86400000)); } catch { /* navigation privée */ }
}

/** À appeler au démarrage : écoute les événements d'installation. */
export function initInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // on remplace la mini-barre du navigateur par notre bandeau
    deferredPrompt = e;
    maybeShow();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hide();
    confetti();
    toast(`${CHARACTERS.kai.name} ${t(": appli installée ! Tu peux réviser même sans connexion 🎉")}`, 'ok', 5000);
  });
}

/** À appeler à chaque changement d'écran (main.js). */
export function onRoute(name) {
  currentRoute = name;
  if (BLOCKED_ROUTES.includes(name)) hide();
  else setTimeout(maybeShow, 1500); // petit délai : on laisse l'écran s'afficher
}

/** Affiche le bandeau si toutes les conditions sont réunies. */
function maybeShow() {
  if (banner || isInstalled() || snoozed() || BLOCKED_ROUTES.includes(currentRoute)) return;
  if (deferredPrompt) showBanner('android');
  else if (isIOS()) showBanner('ios');
}

function hide() {
  if (!banner) return;
  const b = banner;
  banner = null;
  b.classList.add('install-out');
  setTimeout(() => b.remove(), 300);
}

/** Petit guide illustré pour iPhone (boutons Partager et Sur l'écran d'accueil). */
function iosSteps() {
  const shareIcon = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  const addIcon = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  return `<div class="install-steps">
    <div class="step"><span class="num">1</span><span class="ico">${shareIcon}</span><span>${t("Touche")} <strong>${t("Partager")}</strong> ⬆️<br><small>${t("en bas de Safari")}</small></span></div>
    <div class="step"><span class="num">2</span><span class="ico">${addIcon}</span><span><strong>${t("Sur l'écran d'accueil")}</strong> ➕<br><small>${t("puis « Ajouter »")}</small></span></div>
  </div>`;
}

function showBanner(kind) {
  const kai = CHARACTERS.kai;
  banner = document.createElement('div');
  banner.className = 'install-banner tile neon';
  banner.style.setProperty('--c', kai.color);
  banner.setAttribute('role', 'dialog');
  banner.innerHTML = `
    <div class="row nowrap" style="align-items:flex-end">
      ${characterHTML('kai', { expression: 'joie', size: 64 })}
      <div class="grow">
        <div class="tiny" style="color:${kai.color};font-weight:800;text-transform:uppercase;letter-spacing:.06em">${esc(kai.name)}</div>
        <strong>${t("Installe l'appli pour réviser même sans connexion 📲")}</strong>
      </div>
    </div>
    ${kind === 'ios' ? iosSteps() : ''}
    <div class="row nowrap" style="margin-top:10px">
      <button class="btn ghost small grow" id="inst-later">${t("Plus tard")}</button>
      ${kind === 'android' ? `<button class="btn small grow" id="inst-go">${t("📲 Installer")}</button>` : `<button class="btn small grow" id="inst-ok">${t("Compris !")}</button>`}
    </div>`;
  document.body.appendChild(banner);
  const b = banner;
  setTimeout(() => play(b.querySelector('.ch'), 'signature'), 500);
  b.querySelector('#inst-later').onclick = () => { snooze(); hide(); };
  const ok = b.querySelector('#inst-ok');
  if (ok) ok.onclick = () => { snooze(); hide(); };
  const go = b.querySelector('#inst-go');
  if (go) go.onclick = () => promptInstall();
}

/** Déclenche la vraie installation (Android/Chrome/Edge). */
async function promptInstall() {
  if (!deferredPrompt) return false;
  vibrate();
  const e = deferredPrompt;
  deferredPrompt = null; // l'événement ne peut servir qu'une fois
  e.prompt();
  const { outcome } = await e.userChoice;
  hide();
  if (outcome !== 'accepted') {
    snooze();
    toast(`${CHARACTERS.kai.name} : ${line('kai', 'encouragement')}`);
  }
  return outcome === 'accepted';
}

/** Bouton "📲 Installer l'appli" des Réglages. */
export async function openInstall() {
  if (isInstalled()) {
    toast(t('✅ L’appli est déjà installée sur cet appareil.'), 'ok');
    return;
  }
  if (deferredPrompt) { await promptInstall(); return; }
  const kai = CHARACTERS.kai;
  const m = modal(`
    <div style="--c:${kai.color}">
      <div class="mascot">${characterHTML('kai', { expression: 'joie', size: 90 })}
        <div class="bubble"><span class="who">${esc(kai.name)}</span>${t("Installe l'appli pour réviser même sans connexion 📲")}</div></div>
      ${isIOS() ? iosSteps() : `
        <div class="install-steps">
          <div class="step"><span class="num">1</span><span class="ico" style="font-size:1.3rem">⋮</span><span>${t("Ouvre le")} <strong>${t("menu")}</strong> ${t("du navigateur")}<br><small>${t("(les 3 points en haut à droite)")}</small></span></div>
          <div class="step"><span class="num">2</span><span class="ico" style="font-size:1.3rem">📲</span><span><strong>${t("« Installer l'application »")}</strong><br><small>${t("ou « Ajouter à l'écran d'accueil »")}</small></span></div>
        </div>
        <p class="tiny muted">${t("Astuce : ça marche mieux avec Chrome. Si l'option n'apparaît pas, recharge la page puis réessaie.")}</p>`}
      <button class="btn block" data-close style="margin-top:12px">${t("Compris !")}</button>
    </div>`);
  setTimeout(() => play(m.el.querySelector('.ch'), 'signature'), 400);
}
