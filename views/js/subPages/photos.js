"use strict";

// DOM ELEMENTS
const navbarElements = document.getElementsByClassName(
  "userPage__topContent__navbar__element"
);

Array.prototype.forEach.call(navbarElements, (element) =>
  element.classList.remove("active")
);

navbarElements[3].classList.add("active");
