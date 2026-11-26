// Service worker de HEAT : garde l'app sur le téléphone pour qu'elle s'ouvre sans réseau.
// Ce fichier est un modèle : au build, vite.config.ts remplace VERSION et FILES
// (la liste de tous les fichiers de l'app) et publie le résultat sous /sw.js.
const VERSION = '__VERSION__'
const FILES = ['__FILES__']
const CACHE = `heat-${VERSION}`

// Installation : on télécharge tous les fichiers de cette version
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  )
})

// Activation : on supprime les fichiers des versions précédentes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('heat-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// Chaque fichier demandé par l'app : d'abord le cache, sinon le réseau.
// Les appels à Supabase (une autre adresse) ne passent pas par ici : l'app gère elle-même
// leur absence (copies sur le téléphone).
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  // Une adresse de l'app (/, /game/…) : c'est toujours index.html, React choisit l'écran
  const target = request.mode === 'navigate' ? '/index.html' : request
  event.respondWith(caches.match(target).then((cached) => cached ?? fetch(request)))
})
