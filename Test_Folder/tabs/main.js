/**
 * this file must be defered or placed at the end of the html body, after all elements have been created
 */

const tabItems = document.querySelectorAll(".tab-item");
const tabContentItems = document.querySelectorAll(".tab-content");

/**
 *
 * @param {*} e this is an event which designates which tab the user click on in the side menu
 */
function selectItem(e) {
  // reset view before showing user choice
  removeActiveClasses();
  // use the event (e) to reference the element the user clicked on, and set it as active
  this.classList.add("active");
  // use the html element ID to get the number of the tab / menu page
  const tabContentItem = document.querySelector(`.content_${this.id}`);
  // set the resulting tab / menu page item as active
  tabContentItem.classList.add("active");
}

/**
 * @name removeActiveClasses
 * @description
 * hides all the tab contents
 * also applies disbaled styling to all tab buttons
 */
function removeActiveClasses() {
  // hides all the tab contents
  tabItems.forEach((item) => item.classList.remove("active"));
  //applies disbaled styling to all tab buttons
  tabContentItems.forEach((item) => item.classList.remove("active"));
}
// add event listener to tab items
tabItems.forEach((item) => item.addEventListener("click", selectItem));

/**
 * add content id to all items
 */
let i = 0;
// hides all the tab contents
tabItems.forEach((item) => {
  //
  item.id = i;
  i++;
});

i = 0;
//applies disbaled styling to all tab buttons
tabContentItems.forEach((item) => {
  //
  item.classList.add("content_" + i);
  i++;
});
