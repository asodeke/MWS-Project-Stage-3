postReview = (restaurantId) => {
  const restaurantId = getParameterByName('id');
  const username = document.getElementById("username").value;
  const rating = document.getElementById("ratings").value;
  const comment = document.getElementById("comment").value;

const review = {
  "restaurant_id": "restaurantId",
  "name": "username",
  "rating": "rating",
  "comments": "comment",
}

fetch('http://localhost:1337/reviews/?restaurant_id=<restaurant_id>', {
  method: 'POST',
  body: JSON.stringify(review),
  headers: {
      'content-type': 'application/json'
    }
  }).then(response => response.json())
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error);
  });
}