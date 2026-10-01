// =====================================================================
// main.js — Point d'entrée de l'application
// ---------------------------------------------------------------------
// - Affiche le bon écran selon l'adresse après le # (ex. #/course/123).
//   On utilise le "#" car GitHub Pages ne gère pas les autres routes.
// - Au premier lancement, affiche l'écran de bienvenue (Kaï + équipe).
// - Applique le thème, enregistre le service worker (hors ligne).
//
// ➕ Pour AJOUTER UN ÉCRAN :
//   1. crée src/views/mon-ecran.js avec `export async function render(el, args)`
//   2. importe-le ci-dessous et ajoute une ligne dans ROUTES
//   3. (optionnel) ajoute un lien dans la barre du bas (index.html)
// =====================================================================

import './styles/main.css';
import * as db from './core/db.js';
import { loadProfile } from './core/game.js';
import { loadCreator, isCreator } from './core/creator.js';
import { loadFxPrefs } from './ui/fx.js';
import { playSfx } from './ui/sfx.js';
import { samsungTip } from './ui/samsung-tip.js';
import { esc, showError } from './ui/ui.js';
import { initInstall, onRoute } from './ui/install.js';

import * as welcome from './views/welcome.js';
import * as home from './views/home.js';
import * as courses from './views/courses.js';
import * as course from './views/course.js';
import * as add from './views/add.js';
import * as stories from './views/stories.js';
import * as review from './views/review.js';
import * as quizHub from './views/quiz-hub.js';
import * as quizPlay from './views/quiz-play.js';
import * as profile from './views/profile.js';
import * as settings from './views/settings.js';
import * as exercise from './views/exercise.js';
import * as exam from './views/exam.js';
import * as stats from './views/stats.js';
import * as creatorPanel from './views/creator-panel.js';
import * as manga from './views/manga.js';
import * as story from './views/story.js';
import * as boss from './views/boss.js';
import * as duel from './views/duel.js';
import * as collection from './views/collection.js';
import * as dojo from './views/dojo.js';

// Nom de la route (1er mot après #/) → écran.
// fullscreen : cache la barre du bas (stories, révision, quiz en cours…).
const ROUTES = {
  '': { view: home }, //                          #/
  bienvenue: { view: welcome, fullscreen: true }, // #/bienvenue
  cours: { view: courses }, //                    #/cours
  course: { view: course }, //                    #/course/ID/onglet
  ajouter: { view: add }, //                      #/ajouter
  stories: { view: stories, fullscreen: true }, // #/stories/ID
  review: { view: review, fullscreen: true }, //  #/review[/ID]
  quiz: { view: quizHub }, //                     #/quiz
  play: { view: quizPlay, fullscreen: true }, //  #/play/ID_QUIZ
  profil: { view: profile }, //                   #/profil
  reglages: { view: settings }, //                #/reglages
  exo: { view: exercise }, //                     #/exo/ID_EXERCICE
  exam: { view: exam }, //                        #/exam[/ID_EXAMEN]
  stats: { view: stats }, //                      #/stats
  createur: { view: creatorPanel }, //            #/createur (Mode Créateur seulement)
  manga: { view: manga, fullscreen: true }, //    #/manga/ID_COURS/N°_NOTION
  histoire: { view: story, fullscreen: (args) => !!args[0] }, // #/histoire[/N°_CHAPITRE]
  boss: { view: boss, fullscreen: true }, //      #/boss/MATIÈRE
  duel: { view: duel, fullscreen: true }, //      #/duel/QUIZ_COMPRESSÉ (marche même sans profil)
  collection: { view: collection, fullscreen: (args) => args[0] === 'ouvrir' }, // #/collection[/ouvrir]
  dojo: { view: dojo, fullscreen: true }, //      #/dojo (mode Focus)
};

const app = document.getElementById('app');
const nav = document.getElementById('nav');

/** Lit l'adresse (#/course/123/fiches) → { name: 'course', args: ['123', 'fiches'] } */
function parseHash() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  return { name: parts[0] || '', args: parts.slice(1) };
}

/** Affiche l'écran correspondant à l'adresse actuelle. */
async function route() {
  let { name, args } = parseHash();
  // Première ouverture : écran de bienvenue obligatoire.
  const profile = await loadProfile();
  // Exception : un ami qui ouvre un lien de duel peut jouer tout de suite.
  if (!profile && name !== 'bienvenue' && name !== 'duel') {
    location.replace('#/bienvenue');
    return;
  }
  if (name === 'createur' && !isCreator()) name = 'profil'; // panneau réservé au créateur
  const r = ROUTES[name] || ROUTES[''];
  // fullscreen peut dépendre de l'adresse (ex. liste des chapitres vs lecture).
  const fullscreen = typeof r.fullscreen === 'function' ? r.fullscreen(args) : !!r.fullscreen;
  nav.hidden = fullscreen;
  document.getElementById('sound-toggle')?.toggleAttribute('hidden', fullscreen);
  onRoute(ROUTES[name] ? name : ''); // bandeau d'installation (caché sur certains écrans)
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.route === name || (name === 'course' && a.dataset.route === 'cours') || (['reglages', 'stats', 'createur', 'collection'].includes(name) && a.dataset.route === 'profil') || (['exo', 'exam'].includes(name) && a.dataset.route === 'quiz')));
  app.innerHTML = '<div class="spinner"></div>';
  try {
    const box = document.createElement('div');
    // Petite animation d'entrée (sauf plein écran : l'animation "transform"
    // empêcherait les écrans plein écran d'occuper tout l'écran).
    if (!fullscreen) box.className = 'view-enter';
    await r.view.render(box, args);
    app.innerHTML = '';
    app.appendChild(box);
    window.scrollTo(0, 0);
  } catch (e) {
    showError(e);
    app.innerHTML = `<div class="tile"><h2>Oups…</h2><p>${esc(e.message)}</p><a class="btn" href="#/">Retour à l'accueil</a></div>`;
  }
}

/** Permet aux écrans de se redessiner eux-mêmes (après une modification). */
export function refresh() {
  return route();
}

/** Bouton 🔊/🔇 toujours accessible (au-dessus de la barre du bas). */
async function soundToggle() {
  const b = document.createElement('button');
  b.id = 'sound-toggle';
  b.className = 'sound-toggle';
  const draw = async () => {
    const on = await db.getSetting('sounds');
    b.textContent = on ? '🔊' : '🔇';
    b.setAttribute('aria-label', on ? 'Couper le son' : 'Activer le son');
  };
  b.onclick = async () => {
    const on = !(await db.getSetting('sounds'));
    await db.setSetting('sounds', on);
    await loadFxPrefs();
    await draw();
    if (on) playSfx('sparkle');
  };
  await draw();
  document.body.appendChild(b);
}

/** Applique le thème sombre/clair. */
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name=theme-color]').content = theme === 'light' ? '#F6F3FF' : '#0B0A14';
  // Signal au navigateur : "cette appli gère déjà son thème, ne touche pas aux couleurs".
  document.querySelector('meta[name=color-scheme]').content = theme === 'light' ? 'only light' : 'dark';
  try { localStorage.setItem('theme', theme); } catch { /* navigation privée */ }
}

// Indicateur "Hors ligne".
function updateNet() {
  let pill = document.querySelector('.offline-pill');
  if (navigator.onLine) { pill?.remove(); return; }
  if (!pill) {
    pill = document.createElement('div');
    pill.className = 'offline-pill';
    pill.textContent = '📴 Hors ligne – révision OK';
    document.body.appendChild(pill);
  }
}

// ---------------------------------------------------------------------
// Service worker + "nouvelle version disponible"
// ---------------------------------------------------------------------
function registerSW() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((reg) => {
    const offer = (worker) => {
      const bar = document.createElement('div');
      bar.className = 'update-bar tile neon';
      bar.innerHTML = `<div class="row nowrap"><span class="grow"><strong>✨ Nouvelle version dispo !</strong></span>
        <button class="btn small green">Mettre à jour</button></div>`;
      bar.querySelector('button').onclick = () => worker.postMessage('skipWaiting');
      document.body.appendChild(bar);
    };
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
      });
    });
  }).catch((e) => console.warn('Service worker :', e));
  // Quand la nouvelle version prend la main, on recharge la page.
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloaded) { reloaded = true; location.reload(); }
  });
}

// ---------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------
// On écoute tout de suite l'événement d'installation (il peut arriver très tôt).
initInstall();

(async () => {
  applyTheme(await db.getSetting('theme'));
  await loadCreator();
  // Ancien modèle par défaut (plus lent) → nouveau modèle rapide, une seule fois.
  if (!(await db.getSetting('modelMigrated'))) {
    if ((await db.getSetting('model')) === 'gemini-3.8-flash') await db.setSetting('model', db.DEFAULT_SETTINGS.model);
    await db.setSetting('modelMigrated', true);
  }
  await loadFxPrefs();
  await soundToggle();
  window.addEventListener('online', updateNet);
  window.addEventListener('offline', updateNet);
  updateNet();
  window.addEventListener('hashchange', route);
  await route();
  setTimeout(samsungTip, 1500); // plan de secours Samsung Internet (une seule fois)
  db.requestPersistence();
  registerSW();
})();
