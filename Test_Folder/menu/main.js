const navbarToggle = document.querySelector(".navbar-toggle");
const sideMenu = document.querySelector(".side-menu");

navbarToggle.addEventListener("click", () => {
  navbarToggle.classList.toggle("active");
  sideMenu.classList.toggle("active");
});
