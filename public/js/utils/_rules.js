"use strict";

// DOM
const headings = document.getElementsByClassName("ruleCard__heading");
const mainContent = document.getElementsByClassName("group__mainContent")[0];
const descriptions = document.getElementsByClassName("ruleCard__description");

Array.prototype.forEach.call(headings, (heading) => {
  heading.addEventListener("click", (event) => {
    event.preventDefault();
    const id = heading.classList[1].split("_")[1];
    const canMakeItSmaller = [];
    Array.prototype.forEach.call(descriptions, (description2) => {
      if (description2.classList[1].split("_")[1] === id) {
        return;
      }
      if (description2.classList[2]) {
        Array.prototype.push.call(canMakeItSmaller, true);
      }

      if (!description2.classList[2]) {
        Array.prototype.push.call(canMakeItSmaller, false);
      }
    });

    if (canMakeItSmaller.includes(false) === true) {
      mainContent.classList.toggle("mainContent--large");
    }

    const description = document.getElementsByClassName(
      `descriptionID_${id}`
    )[0];
    const image = document.getElementsByClassName(`imageID_${id}`)[0];
    image.classList.toggle("arrow-down");
    description.classList.toggle("hidden");
    mainContent.classList.toggle("mainContent--large");
  });
});
