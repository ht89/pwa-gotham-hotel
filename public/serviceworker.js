const CACHE_NAME = 'gih-cache-v4';

const immutableRequests = [
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
  '/img/jumbo-background-sm.jpg',
  '/img/logo-header.png',
];

const mutableRequests = ['/index-offline.html', '/css/gih-offline.css'];

// triggered after SW is registered
self.addEventListener('install', function (event) {
  // check 'The Service Worker Lifetime...' on page 73 for the need for 'waitUntil'
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // copy existing data to the new cache & cache new data
      const newImmutableRequests = [];

      return Promise.all(
        immutableRequests.map((url) => {
          return caches.match(url).then((response) => {
            if (response) {
              return cache.put(url, response);
            } else {
              newImmutableRequests.push(url);

              return Promise.resolve();
            }
          });
        })
      ).then(() => cache.addAll(newImmutableRequests.concat(mutableRequests)));
    })
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
            // implicity return a Promise
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
