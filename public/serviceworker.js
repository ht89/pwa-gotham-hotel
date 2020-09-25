var CACHE_NAME = 'gih-cache';
var CACHED_URLS = [
  '/index-offline.html',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',
  '/css/gih-offline.css',
  '/img/jumbo-background-sm.jpg',
  '/img/logo-header.png',
];

// triggered after SW is registered
self.addEventListener('install', function (event) {
  console.log('install');
});

// triggered before SW becomes active & takes control of the app
self.addEventListener('activate', function (event) {
  console.log('activate');
});

// triggered when SW becomes active & takes control of the app
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('bootstrap.min.css')) {
    console.log('Fetch request for: ', event.request.url);

    event.respondWith(
      new Response(
        `
          .hotel-slogan {
            background-color: green !important;
          }

          nav {
            display: none;
          }
        `,
        {
          headers: {
            'Content-Type': 'text/css',
          },
        }
      )
    );
  }
});
