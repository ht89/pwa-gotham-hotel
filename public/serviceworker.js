/* Listen to all fetch events passing through the service worker */

// self is the service worker
self.addEventListener('fetch', (event) => {
  // if (event.request.url.includes('bootstrap.min.css')) {
  //   // a custom response on the fly
  //   event.respondWith(
  //     new Response(
  //       `
  //         .hotel-slogan {
  //           background-color: green !important;
  //         }

  //         nav {
  //           display: none;
  //         }
  //       `,
  //       {
  //         headers: {
  //           'Content-Type': 'text/css',
  //         },
  //       }
  //     )
  //   );
  // }

  // if (event.request.url.includes('/img/logo.png')) {
  //   event.respondWith(fetch('img/logo-flipped.png'));
  // }

  // fetch & return content that each request originally asked for
  // return a message when the user goes offline

  const responseContent = `
    <html>
      <body>
        <style>
          body {
            text-align: center;
            background-color: #333;
            color: #eee;
          }
        </style>

        <h1>Gotham Imperial Hotel</h1>

        <p>There seems to be a problem with your connection.</p>

        <p>Come visit us at 1 Imperial Plaza, Gotham City for free Wifi.</p>
      </body>
    </html>
  `;

  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(responseContent, {
          headers: {
            'Content-Type': 'text/html',
          },
        })
    )
  );
});
