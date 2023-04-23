const mapList = document.querySelector(".mapList");
const arrowLeft = document.querySelector("#goLeftBtn");
const arrowRight = document.querySelector("#goRightBtn");

let isDragging = false;

const arrowHandler = () => {
  let scrollPosition = Math.round(mapList.scrollLeft);
  let maxScrollPosition = mapList.scrollWidth - mapList.clientWidth;
  console.log(maxScrollPosition + " > " + scrollPosition);
  arrowLeft.style.display = scrollPosition > 0 ? "flex" : "none";
  arrowRight.style.display =
    maxScrollPosition > scrollPosition ? "flex" : "none";
};

arrowLeft.addEventListener("click", () => {
  //move the map list to the Left
  mapList.scrollLeft -= 300;
  setTimeout(() => arrowHandler(), 50);
});
arrowRight.addEventListener("click", () => {
  //move the map list to the Right
  mapList.scrollLeft += 300;
  setTimeout(() => arrowHandler(), 50);
});

const draggingStop = () => {
  mapList.classList.remove("dragged");
  isDragging = false;
};
const dragging = (e) => {
  if (!isDragging) return;
  mapList.classList.add("dragged");
  mapList.scrollLeft -= e.movementX;
  arrowHandler();
};

mapList.addEventListener("pointerdown", () => {
  isDragging = true;
});
document.addEventListener("pointerup", draggingStop);
mapList.addEventListener("pointermove", dragging);
