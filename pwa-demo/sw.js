const CACHE_NAME = 'quicknotes-v1';
const ASSETS = [
  '/pwa-demo/index.html',
  '/pwa-demo/style.css',
  '/pwa-demo/app.js',
  '/pwa-demo/manifest.json',
  '/pwa-demo/icons/icon-192.png',
  '/pwa-demo/icons/icon-512.png'
];

// Install: cache core assets
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        // Cache successful GET requests for offline use
        if (e.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Fallback for navigation requests
        if (e.request.mode === 'navigate') {
          return caches.match('/pwa-demo/index.html');
        }
      });
    })
  );
});
