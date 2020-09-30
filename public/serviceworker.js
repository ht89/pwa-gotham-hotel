var CACHE_NAME = 'gih-cache-v4';
var CACHED_URLS = [
  '/index-offline.html',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
  '/css/gih-offline.css',
  '/img/jumbo-background-sm.jpg',
  '/img/logo-header.png',
];

// triggered after SW is registered
self.addEventListener('install', function (event) {
  // check 'The Service Worker Lifetime...' on page 73 for the need for 'waitUntil'
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHED_URLS))
  );
});

// triggered before SW becomes active & takes control of the app
self.addEventListener('activate', function (event) {
  event.waitUntil(
    // delete old caches
    caches.keys.then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (CACHE_NAME !== cacheName && cacheName.startsWith('gih-cache')) {
            caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// triggered when SW becomes active & takes control of the app
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        if (response) {
          return response;
        } else if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index-offline.html');
        }
      });
    })
  );
});
