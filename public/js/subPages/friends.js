"use strict";

import { basicRequest } from "../utils/_basicRequest.js";
// basicRequest = require("../utils/_basicRequest.js");

// DOM ELEMENTS
const navbarElements = document.getElementsByClassName(
  "userPage__topContent__navbar__element"
);

const inputContainer = document.getElementsByClassName("input__container")[0];
const input = document.getElementsByClassName(
  "content__userPage__friends__navbar__top__input"
)[0];

const friendCards = document.getElementsByClassName("friendCards--all")[0];
const friendCardsQueried = document.getElementsByClassName(
  "friendCards--queried"
)[0];
const message = document.getElementsByClassName("message")[0];
const messageDsc = document.getElementsByClassName("message__dsc")[0];

Array.prototype.forEach.call(navbarElements, (element) =>
  element.classList.remove("active")
);

navbarElements[2].classList.add("active");

input.addEventListener("focus", (event) => {
  event.preventDefault();
  inputContainer.classList.remove("shrink100px");
  inputContainer.classList.add("input__container--big");
});

input.addEventListener("focusout", (event) => {
  event.preventDefault();
  input.value;
  if (input.value === undefined || input.value === "") {
    inputContainer.classList.remove("input__container--big");
    inputContainer.classList.add("shrink100px");

    friendCards.classList.remove("hidden");
    message.classList.add("hidden");
    friendCardsQueried.classList.add("hidden");
  }
});

input.addEventListener("input", async (event) => {
  event.preventDefault();

  const userID = document
    .getElementsByClassName("body")[0]
    .classList[1].split("_")[1];
  // 1) Send the request and get the data
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    queryString: input.value,
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const LINK = `http://127.0.0.1:3000/api/v1/users/${userID}/searchEngine/friends`;

  const result = await basicRequest(raw, LINK, requestOptions);
  if (result.status !== "success" || result.data.length === 0) {
    friendCards.classList.add("hidden");
    message.classList.remove("hidden");
    friendCardsQueried.classList.add("hidden");

    return;
  }
  friendCards.classList.add("hidden");
  message.classList.add("hidden");
  friendCardsQueried.classList.remove("hidden");
  const foundFriends = result.data;
  friendCardsQueried.innerHTML = "";

  Array.prototype.forEach.call(foundFriends, (foundFriend) => {
    const schema = foundFriend.friend;
    const commonFriends = foundFriend.commonFriends;
    const card = `
      <div class="friendCard__container animate__animated animate__jackInTheBox">
        <img src="${schema.profileImage}">
        <div class="friendCard__container__details">
          <a class="friendCard__container__details__userName" href="${`http://127.0.0.1:3000/userPage/${schema._id}`}">${
      schema.firstName
    } ${schema.lastName}</a>
          <h1 class="friendCard__container__details__info">${
            commonFriends.length
          } common friends</h1>
        </div>
      </div>
    `;

    friendCardsQueried.insertAdjacentHTML("beforeend", card);
  });
});
