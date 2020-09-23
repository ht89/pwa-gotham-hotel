const CACHE_NAME = 'gih-cache';
const CACHED_URLS = [
  '/index-offline.html',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
  '/css/gih-offline.css',
  '/img/jumbo-background-sm.jpg',
  '/img/logo-header.png'
];

// 'install' event called after registering the SW
self.addEventListener('install', (event) => {
  /*
  *   Wait until successfully caching the files before activating new SW.
  *   Also called 'install dependencies'
  * */
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHED_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // ignoreSearch: ignore query params
        return caches.match(event.request, { ignoreSearch: true })
          .then((response) => {
            if (response) {
              return response;
            } else if (event.request.headers.get('accept').includes('text/html')) {
              // the browser never explicitly asks for 'index-offline.html', hence the check here
              return caches.match('/index-offline.html');
            }
          });
      })
  );
});