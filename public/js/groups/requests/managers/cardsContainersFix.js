"use strict";

// DOMS
const allContainers = Array.from(
  document.querySelectorAll(`.rightSide__cards`)
);

allContainers.forEach((container) => {
  const cardsPerRow = Math.floor(container.offsetWidth / 185) - 1;
  container.style = `grid-template-columns: repeat(${cardsPerRow}, 185px); margin-left: 0; padding-left: 0; justify-content: center`;
});
