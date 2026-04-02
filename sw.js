// Color Compare SW v7
const CACHE = 'color-compare-v7';

// Core assets — must succeed
const CORE = [
  './color-compare.html',
  './data.json'
];

// Best-effort assets (CDN / fonts — may fail offline install)
const OPTIONAL = [
  'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js',
  'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700;900&family=Noto+Sans+TC:wght@100;300;400;500;700;900&family=Noto+Serif+TC:wght@200;300;400;500;600;700;900&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      await cache.addAll(CORE);
      await Promise.allSettled(OPTIONAL.map(url => cache.add(url)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache valid same-origin or CORS responses
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // Offline fallback: return app shell
        return caches.match('./color-compare.html');
      });
    })
  );
});
