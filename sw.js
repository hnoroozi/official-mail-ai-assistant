
const CACHE_NAME = 'explain-letter-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn-icons-png.flaticon.com/512/5204/5204758.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
