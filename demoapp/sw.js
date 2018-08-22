importScripts('/js/idb.js');

const CACHE_NAME = 'my_site-cache-v2';
const urlsToCache  = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/js/dbhelper.js',
  '/js/idb.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/img/'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
    })
  );
});

//Cache and return request
/*
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});*/


self.addEventListener('fetch', event => {
  //respond with an entry if one exist, if not fetch from network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
           return response;
         }

         //Clone the request
         var fetchRequest =  event.request.clone();
         return fetch(fetchRequest)
         .then(response => {
             //Check if we received a valid response
             if(!response || response.status !== 200|| response.type !== 'basis') {
               return response;
             }

          var responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
      })
      .catch(error => {
        console.log('ServiceWorker' + error)
      })
    );
});


//Remove outdated caches
self.addEventListener('activate', event=> {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if(CACHE_NAME.indexOf(cacheName) === -1 ){
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


//open new idb database
var dbPromise = idb.open('review-db', 1, upgradeDb => {
  upgradeDb.createObjectStore('reviewSync', {
    keyPath: 'id'
  });
});

//open store transaction and post
function localChanges() {
  return dbPromise.then(db => {

    //create transaction to write to database
    const tx = db.transaction('backSync', 'readwrite')
    const store = tx.objectStore('backSync');

    // add all the reviews to indexDB
    return store.getAll()
      .then(reviews => {
        return Promise.all(
          reviews.map(review => {
            fetch('http://localhost:1337/reviews/', {
              method: 'POST',
              body: JSON.stringify(review),
              headers: {
                'Content-Type': 'application/json'
              }
            }).then (response => {
              store.delete(review.createAt);
              return tx.complete;
            })
          })
        )
      })
  }).catch(err => {
      console.log(err);
  })
}

//Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-reviews') {
    event.waitUntil(localChanges());
  }
});
