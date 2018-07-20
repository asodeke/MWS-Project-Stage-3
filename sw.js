self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open('my-site-cache-v2').then(function(cache) {
        console.log('Opened cache');
        return cache.addAll([
          '/',
          'js/dbhelper.js',
          'js/idb.js',
          'js/main.js',
          'js/modaljs.js',
          'js/postreview.js',
          'js/restaurant_info.js',
          'index.html',
          'restaurant.html',
          'img/',
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
