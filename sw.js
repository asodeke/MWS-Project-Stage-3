self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open('my-site-cache-v1').then(function(cache) {
        console.log('Opened cache');
        return cache.addAll([
          '/',
          'js/main.js',
          'js/restaurant_info.js',
          'js/dbhelper.js',
          'index.html',
          'img/',
          'restaurant.html',
          'css/final.css',
          'css/styles.css'
        ]);
      })
  );
});

self.addEventListener('fetch', function(event) {
  //respond with an entry if one exist, if not fetch from network
  event.respondWith(
    caches.match(event.request).then(function(response) {
        if (response) return response;
        return fetch(event.request);
    })
  );
});
