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
