/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Open IDB Database
   */
  static openDatabase() {
    //check for browser support
    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
      return;
    }

    // create database name and version and callback
    return idb.open('restaurants', 2 , upgradeDB => {
        //create and returns a new object store or index
        switch (upgradeDB.oldVersion){
          case 0:
          const rest = upgradeDB.createObjectStore('restaurants', {
            keyPath: 'id'
          });
          case 1:
          const reviews = upgradeDB.createObjectStore('reviews', {
            keyPath: 'id'
          });
          reviews.createIndex('restaurant_id', 'restaurant_id', {
            unique: false
          });
        }
    });
  }

  /**
   *  Add reviews function
   */
   static addReviews(review) {
     //check for browser support
     if (!('indexedDB' in window)) {
       console.log('This browser doesn\'t support IndexedDB');
       return;
     }

     const dbPromise = idb.open('review-rest', 1 , function(upgradeDB) {
       const store = upgradeDB.createObjectStore('reviews', {
         keyPath: 'id'
       });
    });

    this._dbPromise.then(function (db) {
      if(!db) return;

      const tx = db.transaction('reviews', 'readwrite');
      const store = tx.objectStore('reviews');
      store.put(review);
      return tx.complete;
    }).then(function () {
      console.log('Review Added');
    }).catch(function () {
      tx.abort();
      throw ('Reviews were not added');
    });
   }

  /**
   * Show cached messages, by reading from the database opened above
   */
   //Got some assitance from my mentor Georgios writing this code
  static cacheRestaurants(restaurants) {
    return DBHelper.openDatabase().then(db => {
      if(!db) return;

      //create transaction to write to database
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');

      // add all the restaurants to indexDB
      return Promise.all(restaurants.map(restaurant =>
        store.put(restaurant))).then(() => {return restaurants})
      .catch (() => {
          tx.abort();
          throw ('Restaurants were not added to db');
        });
      });
    }

  /**
    * Read reviews from the database
    */
    static cacheReviews(reviews){
      return DBHelper.openDatabase().then(db =>{
        if(!db) return;

        //create transaction to write to database
        const tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');

        // add all the reviews to indexDB
        return Promise.all(reviews.map(review =>
          store.put(review))).then(() => {
            return reviews;
          })
        .catch (() => {
          tx.abort();
          throw ('Reviews were not added');
        });
      });
    }

  /**
   * Fetch all restaurants.
   */
   //Got some assitance from my mentor Georgios writing this code
  static fetchRestaurants(callback) {
    //get restaurants from server
    fetch(DBHelper.DATABASE_URL + '/restaurants/').then(response => response.json())
      //.then(restaurants => callback(null,restaurants))
      .then(restaurants =>
            //add the restaurants to the server
            DBHelper.cacheRestaurants(restaurants)
      ).then(restaurants =>
            //send the restaurants to callback to update the UI
            callback(null, restaurants)
      ).catch(err => {
        //catch any error
        callback(err,null);
      });
    //});
  }

  /**
   * Fetch all review
   */
   static fetchReviews(id, callback) {
     //get review from server
    fetch(DBHelper.DATABASE_URL + `/reviews/?restaurant_id=${id}`)
    .then(response => response.json())
      .then(reviews =>
            //add the review to the server
            DBHelper.cacheReviews(reviews)
      ).then(reviews =>
            //send the review to callback to update the UI
            callback(null, reviews)
      ).catch(err => {
        //catch any error
        callback(err,null);
        //console.log(err,null);
      });
    //});
   }


  //Got some assitance from my mentor Georgios writing this code
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants
   DBHelper.fetchRestaurants(function (error, restaurants) {
     if (error) {
       callback(error, null);
     } else {
       const restaurant = restaurants.find(function(rest) {
         return rest.id == id;
       });
       if (restaurant) {
         // Got the restaurant
         callback(null, restaurant);
       } else {
         // Restaurant not found in the database
         callback('Restaurant not found', null);
       }
     }
   });
 }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.webp`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
}
