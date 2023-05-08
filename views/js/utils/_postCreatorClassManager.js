"use strict";

// ---
// This code only changes classes of the postCreator element

// DOM
const postCreator = document.getElementsByClassName("postCreator")[0];

const pageName = document
  .getElementsByTagName("body")[0]
  .classList[0].split("--")[1];

postCreator.classList.add(`postCreator--${pageName}`);
