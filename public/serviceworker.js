var CACHE_NAME = 'gih-cache-v4';
var CACHED_URLS = [
  // HTML
  '/index.html',
  // Stylesheets
  '/css/gih.css',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
  'https://fonts.googleapis.com/css?family=Lato:300,600,900',
  // Javascript
  'https://code.jquery.com/jquery-3.0.0.min.js',
  '/js/app.js',
  // Images
  '/img/logo.png',
  '/img/logo-header.png',
  '/img/event-calendar-link.jpg',
  '/img/switch.png',
  '/img/logo-top-background.png',
  '/img/jumbo-background.jpg',
  '/img/reservation-gih.jpg',
  '/img/about-hotel-spa.jpg',
  '/img/about-hotel-luxury.jpg',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CACHED_URLS);
    })
  );
});

self.addEventListener('fetch', function (event) {
  const requestURL = new URL(event.request.url);

  if (requestURL.pathname === '/' || requestURL.pathname === '/index.html') {
    // cache, falling back to network w frequent updates
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match('/index.html').then((cachedResponse) => {
          // fetch & cache the latest version whether ore not index.html is found
          const fetchPromise = fetch('/index.html').then((networkResponse) => {
            cache.put('/index.html', networkResponse.clone());

            return networkResponse;
          });

          return cachedResponse || fetchPromise;
        });
      })
    );
  } else if (
    CACHED_URLS.includes(requestURL.href) ||
    CACHED_URLS.includes(requestURL.pathname)
  ) {
    // cache, falling back to network
    event.respondWith(
      caches
        .open(CACHE_NAME)
        .then((cache) =>
          cache
            .match(event.request)
            .then((response) => response || fetch(event.request))
        )
    );
  }
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (CACHE_NAME !== cacheName && cacheName.startsWith('gih-cache')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
