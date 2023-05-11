const openModalBtn = document.getElementById("openModalBtn");
const modal = document.getElementById("modal");
const closeModalBtn = document.querySelector(".closeModalBtn");

openModalBtn.addEventListener("click", () => {
  modal.classList.add("modal-isOpen");
  modal.style.display = "block";
});

closeModalBtn.addEventListener("click", () => {
  modal.classList.remove("modal-isOpen");
  modal.style.display = "none";
});

// Get a reference to button 1
const debugBtn = document.getElementById("debugBtn");

// Add a click event listener to button 1
debugBtn.addEventListener("click", function () {
  // Toggle the value of the boolean variable
  debug = !debug;

  // Log the value of the boolean variable to the console
  console.log("Debug has been turned " + (isButton1On ? "on" : "off"));
});
