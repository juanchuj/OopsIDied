// Service worker: Chrome only offers "Install" for a page that has one with a fetch handler.
// Network first, so a fresh deploy always wins; the cache keeps the game usable offline.
const CACHE = 'oops-i-died-v2';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest',
  'art/splash.png', 'art/splash_es.jpg', 'art/fingers_es.jpg', 'art/fingers.jpg', 'art/death.png', 'art/icon-192.png', 'art/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
