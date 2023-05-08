"use strict";

// DOM elements

const navbarRightSideProfileBtn = document.getElementsByClassName(
  "navbar__rightSide__profile"
);

const searchBar = document.querySelectorAll(`.navbar__searchBar`)[0];
const searchMenu = document.querySelectorAll(`.navbar__searchActive`)[0];
const input = document.querySelectorAll(
  `.navbar__input[data-input-type="active"]`
)[0];
const couldntFind = document.querySelectorAll(`.couldntFind`)[0];
const info = document.querySelectorAll(".searchActive__info")[0];

const content = document.querySelectorAll(`.searchActive__content`)[0];
const navbarMenu = document.querySelectorAll(`.navbar__menu`)[0];
const notificationsIcon = document.querySelectorAll(
  `.navbar__notificationsIcon`
)[0];
const hotNotificationIcon = document.querySelectorAll(
  `.navbar__hotNotifications`
)[0];

// helpers
const fixNavbar = function (special) {
  const navbar = document.querySelectorAll(`.navbar`)[0];
  const leftSide = document.querySelectorAll(`.navbar__leftSide`)[0];
  const searcher = document.querySelectorAll(`.navbar__searchActive`)[0];

  const rightSide = document.querySelectorAll(`.navbar__rightSide`)[0];

  const widths = {
    navbar: navbar.offsetWidth,
    leftSide: leftSide.offsetWidth,
    searcher: searcher.offsetWidth,
    midContent: midContent.offsetWidth,
    rightSide: rightSide.offsetWidth,
  };
  const sumOfMargins = widths.navbar - widths.midContent;
  let leftMargin = sumOfMargins / 2;
  let rightMargin = sumOfMargins / 2;

  let containsHidden = false;

  searcher.classList.forEach((el) => {
    if (el === "hidden") containsHidden = true;
  });

  if (containsHidden) {
    leftMargin -= widths.leftSide;
  } else {
    leftMargin -= widths.midContent / 2;
    console.log(leftMargin);
  }

  if (widths.midContent < 175) {
    leftMargin -= 70;
  }

  rightMargin -= widths.rightSide;
  midContent.style = `margin-left: ${leftMargin}; margin-right: ${rightMargin}`;
};

// EVENT listeners

document.addEventListener("click", (event) => {
  if (!searchMenu.contains(event.target)) {
    searchBar.classList.remove("hidden");
    searchMenu.classList.add("hidden");
    fixNavbar();
  }

  if (searchBar.contains(event.target)) {
    searchBar.classList.add("hidden");
    searchMenu.classList.remove("hidden");
    input.focus();
    fixNavbar();
  }
});

let lastInput = input.value.replace(/\s+/g, "").toLowerCase();
input.addEventListener("input", async (event) => {
  event.preventDefault();
  couldntFind.classList.add("hidden");
  info.classList.add("hidden");

  if (lastInput === input.value.replace(/\s+/g, "").toLowerCase()) {
    lastInput = input.value.replace(/\s+/g, "").toLowerCase();
    return;
  }
  lastInput = input.value.replace(/\s+/g, "").toLowerCase();
  content.innerHTML = "";
  if (input.value.replace(/\s+/g, "").toLowerCase().length < 1) {
    info.classList.remove("hidden");
    return;
  }
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    searchValue: input.value,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(
    "http://127.0.0.1:3000/api/v1/searchEngine/searchRealLife",
    requestOptions
  );

  const result = await response.json();

  if (result.status !== "success") {
    return;
  }

  Array.from(result.data.matched).forEach((matched) => {
    let isGroup = false;
    let LINK = `/userPage/${matched._id}`;
    let name, image;
    let place = "User's Page";

    if (matched.name) {
      isGroup = true;
      LINK = `/group/${matched._id}`;
      image = matched.avatarImage;
      place = "Group's Page";
      name = matched.name;
    } else {
      name = `${matched.firstName} ${matched.lastName}`;
      image = matched.profileImage;
    }

    const element = `
    <div class="searchActive__card" data-id="${matched._id}">
      <a href="${LINK}">
      <img class="searchActive__avatar" src="${image}">
      </a>

      <div class="searchActive__details">
        <a class="searchActive__name" href="${LINK}">
          ${name}
        </a>
        <a class="searchActive__hint">
          ${place}
        </a>
      </div>
    </div>
    `;

    if (
      document.querySelectorAll(
        `.searchActive__card[data-id="${matched._id}"]`
      )[0]
    )
      document
        .querySelectorAll(`.searchActive__card[data-id="${matched._id}"]`)[0]
        .remove();

    content.insertAdjacentHTML("beforeend", element);
  });
  if (document.querySelectorAll(`.searchActive__card`)[0] === undefined) {
    couldntFind.classList.remove("hidden");
    document.querySelectorAll(
      `.couldntFind__text`
    )[0].textContent = ` Unfortunately we could not find anything that matches provided data.`;
  }

  // Generating cards
});

notificationsIcon.addEventListener("click", (event) => {
  event.preventDefault();
  const notiCount =
    document.querySelectorAll(`.hotNotifications__count`)[0].textContent * 1;
  if (notiCount !== 0) {
    notificationsIcon.classList.add("hidden");
    hotNotificationIcon.classList.remove("hidden");
  }
  navbarMenu.classList.toggle("hidden");
});

hotNotificationIcon.addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelectorAll(`.hotNotifications__count`)[0].textContent = 0;
  hotNotificationIcon.classList.add("hidden");
  notificationsIcon.classList.remove("hidden");
  navbarMenu.classList.toggle("hidden");
});

const midContent = document.querySelectorAll(`.navbar__navigations`)[0];
// Centering the element on the navbar

window.addEventListener("resize", () => {
  midContent.style = `margin-left: none; margin-right: none`;
  fixNavbar();
});

fixNavbar();
