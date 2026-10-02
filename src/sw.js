// =====================================================================
// sw.js — Service worker : permet à l'application de marcher HORS LIGNE
// ---------------------------------------------------------------------
// ⚠️ Ce fichier est un MODÈLE : au moment de "npm run build", Vite remplace
//    les repères PRECACHE et VERSION (entourés de deux tirets bas) par la
//    liste des fichiers du site et un numéro de version (voir vite.config.js).
//    Ne le modifie que si tu sais ce que tu fais.
//
// Fonctionnement :
//  1. Installation : tous les fichiers du site sont téléchargés en cache.
//  2. Ensuite, chaque fichier est servi depuis le cache (instantané, hors ligne).
//  3. Quand tu publies une nouvelle version, le téléphone la télécharge en
//     arrière-plan ; l'appli propose alors "Mettre à jour".
//  4. Les appels à l'IA (Gemini) ne passent jamais par le cache.
//  5. Les ILLUSTRATIONS (Mode Histoire, personnages) ont leur propre cache
//     permanent ("revision-ia-images") : téléchargées une fois, elles restent
//     instantanées et disponibles hors ligne, même après une mise à jour du site.
// =====================================================================

const CACHE = 'revision-ia-__VERSION__';
const IMAGES = 'revision-ia-images';
const isImage = (url) => /\/(story|characters)\//.test(url.pathname) && /\.(webp|png|jpe?g)$/i.test(url.pathname);
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

// L'appli demande d'activer la nouvelle version (bouton "Mettre à jour").
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

// Activation : suppression des anciennes versions du cache.
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('revision-ia-') && key !== CACHE && key !== IMAGES) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Gemini, etc. : pas de cache

  if (isImage(url)) { event.respondWith(image(req, url)); return; }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Page HTML : on sert toujours index.html depuis le cache (appli à page unique).
    if (req.mode === 'navigate') {
      return (await cache.match('./')) || (await cache.match('./index.html')) || fetch(req);
    }
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;
    // Pas en cache (ex. lecteur PDF) : on télécharge puis on garde une copie.
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      return new Response('Hors ligne', { status: 503, statusText: 'Hors ligne' });
    }
  })());
});

/**
 * Illustrations : d'abord le cache permanent ; sinon le réseau (et on garde une
 * copie, en retirant l'ancienne version du même fichier) ; hors ligne, une autre
 * taille de la même image déjà en cache (600 / 900 / 1200 px) fait l'affaire.
 */
async function image(req, url) {
  const cache = await caches.open(IMAGES);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) {
      for (const old of await cache.keys()) if (new URL(old.url).pathname === url.pathname) cache.delete(old);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const base = url.pathname.replace(/-(600|900)\.webp$/, '').replace(/\.webp$/, '');
    for (const old of await cache.keys()) {
      const p = new URL(old.url).pathname;
      if (p === `${base}.webp` || p === `${base}-900.webp` || p === `${base}-600.webp`) return cache.match(old);
    }
    return new Response('Hors ligne', { status: 503, statusText: 'Hors ligne' });
  }
}
