var CACHE_NAME = 'gih-cache-v5';
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
  '/js/offline-map.js',
  // Images
  '/img/logo.png',
  '/img/logo-header.png',
  '/img/event-calendar-link.jpg',
  '/img/switch.png',
  '/img/logo-top-background.png',
  '/img/jumbo-background-sm.jpg',
  '/img/jumbo-background.jpg',
  '/img/reservation-gih.jpg',
  '/img/about-hotel-spa.jpg',
  '/img/about-hotel-luxury.jpg',
  '/img/event-default.jpg',
  '/img/map-offline.jpg',
  // JSON
  '/events.json',
];

var googleMapAPIJS =
  'https://maps.googleapis.com/maps/api/js?key=AIzaSyDm9jndhfbcWByQnrivoaWAEQA8jy3COdE&callback=initMap';

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
          // fetch & cache the latest version whether or not index.html is found
          const fetchPromise = fetch('/index.html').then((networkResponse) => {
            cache.put('/index.html', networkResponse.clone());

            return networkResponse;
          });

          return cachedResponse || fetchPromise;
        });
      })
    );
  } else if (requestURL.href === googleMapAPIJS) {
    // network, falling back to cache
    event.respondWith(
      fetch(`${googleMapAPIJS}&${Date.now()}`, {
        mode: 'no-cors',
        cache: 'no-store',
      }).catch(() => caches.match('/js/offline-map.js'))
    );
  } else if (requestURL.pathname === '/events.json') {
    // network, falling back to cache with frequent updates
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());

            return networkResponse;
          })
          .catch(() => caches.match(event.request));
      })
    );
  } else if (requestURL.pathname.startsWith('/img/event-')) {
    // cache, falling back to network w frequent updates
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          return (
            cachedResponse ||
            fetch(event.request)
              .then((networkResponse) => {
                cache.put(event.request, networkResponse.clone());

                return networkResponse;
              })
              .catch(() => cache.match('/img/event-default.jpg'))
          );
        });
      })
    );
  } else if (requestURL.host === 'www.google-analytics.com') {
    event.respondWith(fetch(event.request));
  } else if (
    CACHED_URLS.includes(requestURL.href) ||
    CACHED_URLS.includes(requestURL.pathname)
  ) {
    // handle requests for files cached during installation
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
