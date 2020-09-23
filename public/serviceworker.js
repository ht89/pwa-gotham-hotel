const CACHE_NAME = 'gih-cache';
const CACHED_URLS = [
  '/index-offline.html',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
  '/css/gih-offline.css',
  '/img/jumbo-background-sm.jpg',
  '/img/logo-header.png'
];

// 'install' event called after registering the service worker
self.addEventListener('install', (event) => {
  // wait until successfully caching the file before declaring SW installation a success & activating new SW
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHED_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  // The match is not verified since it must exist with SW
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
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