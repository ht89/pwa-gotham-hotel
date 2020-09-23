// 'install' event called after registering the service worker
self.addEventListener('install', (event) => {
  // wait until successfully caching the file before declaring SW installation a success & activating new SW
  event.waitUntil(
    caches.open('gih-cache').then((cache) => cache.add('/index-offline.html'))
  );
});

self.addEventListener('fetch', (event) => {
  // The match is not verified since it must exist with SW
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match('/index-offline.html'))
  );
});