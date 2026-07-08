const CACHE_NAME = 'catetin-v1';
const urlsToCache = [
  '/inc/',
  '/inc/index.html',
  '/inc/style.css',
  '/inc/js/app.js',
  '/inc/js/config.js',
  '/inc/js/auth.js',
  '/inc/js/db.js',
  '/inc/js/utils.js',
  '/inc/js/transactions.js',
  '/inc/js/wallets.js',
  '/inc/js/schedule.js',
  '/inc/js/goals.js',
  '/inc/js/insights.js',
  '/inc/js/ui.js',
  '/inc/js/assistant.js',
  '/inc/js/report.js',
  '/inc/js/personality.js',
  '/inc/icons/icon-192.png',
  '/inc/icons/icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('📦 Cache opened');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});