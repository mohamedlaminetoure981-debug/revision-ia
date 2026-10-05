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
//   2. ajoute une ligne dans ROUTES : { load: () => import('./views/mon-ecran.js') }
//   3. (optionnel) ajoute un lien dans la barre du bas (index.html)
// =====================================================================

import './styles/main.css';
import * as db from './core/db.js';
import { loadProfile } from './core/game.js';
import { loadCreator, isCreator } from './core/creator.js';
import { loadFxPrefs } from './ui/fx.js';
import { playSfx } from './ui/sfx.js';
import { samsungTip } from './ui/samsung-tip.js';
import { esc, showError, preloadMath } from './ui/ui.js';
import { initInstall, onRoute } from './ui/install.js';
import { trackDrafts, setDraftRoute, restoreDrafts, clearDrafts } from './ui/drafts.js';
// L'accueil est chargé tout de suite (c'est le premier écran) ; les autres écrans
// sont téléchargés/lus SEULEMENT quand on les ouvre : démarrage bien plus rapide.
import * as home from './views/home.js';

// Nom de la route (1er mot après #/) → écran.
// fullscreen : cache la barre du bas (stories, révision, quiz en cours…).
const ROUTES = {
  '': { load: () => home }, //                          #/
  bienvenue: { load: () => import('./views/welcome.js'), fullscreen: true }, // #/bienvenue
  cours: { load: () => import('./views/courses.js') }, //                    #/cours
  course: { load: () => import('./views/course.js') }, //                    #/course/ID/onglet
  ajouter: { load: () => import('./views/add.js') }, //                      #/ajouter
  stories: { load: () => import('./views/stories.js'), fullscreen: true }, // #/stories/ID
  review: { load: () => import('./views/review.js'), fullscreen: true }, //  #/review[/ID]
  quiz: { load: () => import('./views/quiz-hub.js') }, //                     #/quiz
  play: { load: () => import('./views/quiz-play.js'), fullscreen: true }, //  #/play/ID_QUIZ
  profil: { load: () => import('./views/profile.js') }, //                   #/profil
  reglages: { load: () => import('./views/settings.js') }, //                #/reglages
  exo: { load: () => import('./views/exercise.js') }, //                     #/exo/ID_EXERCICE
  exam: { load: () => import('./views/exam.js') }, //                        #/exam[/ID_EXAMEN]
  stats: { load: () => import('./views/stats.js') }, //                      #/stats
  createur: { load: () => import('./views/creator-panel.js') }, //            #/createur (Mode Créateur seulement)
  manga: { load: () => import('./views/manga.js'), fullscreen: true }, //    #/manga/ID_COURS/N°_NOTION
  histoire: { load: () => import('./views/story.js'), fullscreen: (args) => !!args[0] }, // #/histoire[/N°_CHAPITRE]
  boss: { load: () => import('./views/boss.js'), fullscreen: true }, //      #/boss/MATIÈRE
  duel: { load: () => import('./views/duel.js'), fullscreen: true }, //      #/duel/QUIZ_COMPRESSÉ (marche même sans profil)
  collection: { load: () => import('./views/collection.js'), fullscreen: (args) => args[0] === 'ouvrir' }, // #/collection[/ouvrir]
  dojo: { load: () => import('./views/dojo.js'), fullscreen: true }, //      #/dojo (mode Focus)
  feynman: { load: () => import('./views/feynman.js'), fullscreen: (args) => !!args[0] }, // #/feynman[/ID_COURS/N°_NOTION]
  veille: { load: () => import('./views/veille.js'), fullscreen: true }, //  #/veille (veille d'examen)
};

const app = document.getElementById('app');
const nav = document.getElementById('nav');
let lastRoute = null; // écran précédent (les brouillons de saisie sont gardés tant qu'on y reste)

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
  nav.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.route === name || (name === 'course' && a.dataset.route === 'cours') || (['reglages', 'stats', 'createur', 'collection'].includes(name) && a.dataset.route === 'profil') || (['exo', 'exam', 'feynman', 'veille'].includes(name) && a.dataset.route === 'quiz')));
  app.innerHTML = '<div class="spinner"></div>';
  try {
    const box = document.createElement('div');
    // Petite animation d'entrée (sauf plein écran : l'animation "transform"
    // empêcherait les écrans plein écran d'occuper tout l'écran).
    if (!fullscreen) box.className = 'view-enter';
    const view = await r.load();
    // Brouillons de saisie : on quitte un écran → effacés ; page rechargée sur le même
    // écran → les champs vides retrouvent ce qui avait été tapé.
    const firstLoad = lastRoute === null;
    if (!firstLoad && lastRoute !== name) clearDrafts();
    lastRoute = name;
    setDraftRoute(name);
    await view.render(box, args);
    if (firstLoad) restoreDrafts(box, name);
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
// RÈGLE : la page n'est JAMAIS rechargée toute seule.
//  - 1re visite : le service worker s'installe puis prend la main (controllerchange) ;
//    on ne fait RIEN (le site est déjà à jour), surtout pas de rechargement : il effacerait
//    le prénom que l'élève est en train de taper.
//  - Mise à jour : le bandeau « Mettre à jour » apparaît ; la page ne se recharge que si
//    l'élève appuie dessus. Pendant l'écran de bienvenue, le bandeau attend la fin.
const onWelcome = () => /^#\/bienvenue/.test(location.hash);

/** Affiche le bandeau (en attendant, si l'élève est sur l'écran de bienvenue). */
function showUpdateBar(label, onClick) {
  if (document.querySelector('.update-bar')) return;
  const show = () => {
    if (document.querySelector('.update-bar')) return;
    const bar = document.createElement('div');
    bar.className = 'update-bar tile neon';
    bar.innerHTML = `<div class="row nowrap"><span class="grow"><strong>✨ Nouvelle version dispo !</strong></span>
      <button class="btn small green">${label}</button></div>`;
    bar.querySelector('button').onclick = onClick;
    document.body.appendChild(bar);
  };
  if (!onWelcome()) { show(); return; }
  const wait = () => { if (!onWelcome()) { window.removeEventListener('hashchange', wait); show(); } };
  window.addEventListener('hashchange', wait);
}

function registerSW() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  let controlled = !!navigator.serviceWorker.controller; // la page est-elle déjà gérée par un service worker ?
  let updateRequested = false; // l'élève a-t-il appuyé sur « Mettre à jour » ?
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((reg) => {
    const offer = (worker) => showUpdateBar('Mettre à jour', () => {
      updateRequested = true;
      worker.postMessage('skipWaiting');
    });
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
      });
    });
  }).catch((e) => console.warn('Service worker :', e));
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controlled) { controlled = true; return; } // 1re installation : pas de rechargement
    if (updateRequested) { updateRequested = false; location.reload(); return; } // demandé par l'élève
    // Mise à jour activée ailleurs (autre onglet) : on propose de recharger, sans l'imposer.
    showUpdateBar('Recharger', () => location.reload());
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
  trackDrafts();
  await route();
  setTimeout(samsungTip, 1500); // plan de secours Samsung Internet (une seule fois)
  db.requestPersistence();
  // La vérification de mise à jour (service worker) ne retarde JAMAIS l'affichage :
  // elle se fait quand l'appli est au repos, en arrière-plan.
  const idle = (f, timeout) => ('requestIdleCallback' in window ? window.requestIdleCallback(() => f(), { timeout }) : setTimeout(f, 1500));
  idle(registerSW, 4000);
  idle(preloadMath, 8000); // formules prêtes avant d'ouvrir un cours
})();
