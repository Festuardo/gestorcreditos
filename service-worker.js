const CACHE_NAME = 'gestor-creditos-v2';
const APP_SHELL = [
  './',
  './index.html',
  './login.html',
  './gestor.html',
  './css/portal.css',
  './css/app.css',
  './js/login.js',
  './js/gestor.js',
  './js/pwa.js',
  './images/logo.png',
  './images/icon-192.png',
  './images/icon-512.png',
  './manifest.webmanifest',
  './offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request).then(response => response || caches.match('./offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
