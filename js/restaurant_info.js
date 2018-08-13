let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchReviews((error, reviews) => {
      self.reviews = reviews.filter(review => review.restaurant_id == id);
    });
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute("data-src", `/img/${restaurant.photograph}.webp`);
  image.setAttribute("alt", "Restaurant Picture");

  const favimage = document.getElementById('favorite-img');

  function getImagePath(){
    if(restaurant.is_favorite == false) {
      return (`/img/favicon/unfavorite.webp`);
    } else if (restaurant.is_favorite == true) {
      return (`/img/favicon/favoriteon.webp`);
    }
  }


  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  //Add click EventListener to toggle favorite
  //let favorite;
  //console.log(self.restaurant.is_favorite);
  favimage.addEventListener("click", function(){
    if (self.restaurant.is_favorite == true) {
      favimage.src = "/img/favicon/unfavorite.webp";
      self.restaurant.is_favorite = false;
      fetch(`http://localhost:1337/restaurants/${self.restaurant.id}/?is_favorite=${self.restaurant.is_favorite}`,
        {
          method: 'PUT'
        });
        console.log(self.restaurant.is_favorite);
    } else {
      favimage.src = "/img/favicon/favoriteon.webp"
      self.restaurant.is_favorite = true;
      fetch(`http://localhost:1337/restaurants/${self.restaurant.id}/?is_favorite=${self.restaurant.is_favorite}`,
        {
          method: 'PUT'
        });
        console.log(self.restaurant.is_favorite);
    }
/*
    fetch(`http://localhost:1337/restaurants/${self.restaurant.id}/?is_favorite=${favorite}`,
      {
        method: 'PUT'
      });*/
  });

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  //fillReviewsHTML();
  //DBHelper.fetchReviewsByRestaurantId(self.restaurant.id, (error, reviews)=> {
    //self.reviews=reviews;
    fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
 function getParameterByName (name, url) {
   if (!url)
     url = window.location.href;
   name = name.replace(/[\[\]]/g, '\\$&');
   const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
     results = regex.exec(url);
   if (!results)
     return null;
   if (!results[2])
     return '';
   return decodeURIComponent(results[2].replace(/\+/g, ' '));
 }

/**
  * Post Review
  */
  function Review() {
    const id = getParameterByName('id'); //document.getElementById("restaurant_id");//getParameterByName('id');
    const username = document.getElementById("username").value;
    const rating = document.getElementById("ratings").value;
    const comment = document.getElementById("comment").value;

  const review = {
    "restaurant_id": id,
    "name": username,
    "rating": rating,
    "comments": comment
  }
  console.log(review);
  //debugger;

  fetch(DBHelper.DATABASE_URL+'/reviews', {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json; charset=utf-8",
    },
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: JSON.stringify(review), // body data type must match "Content-Type" header
  }).then(function(response) {
      console.log(response.json);
      //return response.json();
      return DBHelper.urlForRestaurant(restaurant);
  })
  .then(function (json){
      console.log(json);
  })
  .catch(error => console.error(`Fetch Error =\n`, error));
  //debugger;
  }

/**
  * Add functionality to make review form popup
  */

  // Get the body Element
  var body = document.getElementsByTagName("BODY")[0];

  // Get the modal
  var modal = document.getElementById('myModal');

  // Get the button that opens the modal
  var btn = document.getElementById("popUp");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on the button, open the modal and stop page from scrolling
  btn.onclick = function() {
    modal.style.display = "block";
    body.style.overflow = "hidden";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
    body.style.overflow = "scroll";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        body.style.overflow = "scroll";
    }
  }
