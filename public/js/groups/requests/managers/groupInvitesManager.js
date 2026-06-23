"use strict";

import Helpers from "./utils/helpers.js";
import sendNotification from "./../../../../../js/utils/notifications/sendNotification.js";
import inviteBtnsController from "./utils/inviteBtnsController.js";
const socket = new WebSocket("ws://localhost:8080");
const { genElem, genUsrCard, requestOptions, manageButtons } = new Helpers();
const { manageInviteBtns } = new inviteBtnsController(socket, requestOptions);
// DOM
const input = document.querySelectorAll(
  `.rightSide__input[data-section-type="invite"]`
)[0];
const rightSideContent = document.querySelectorAll(`.rightSide__content`)[0];

const body = document.getElementsByTagName("body")[0];

// Getting attributes
const loggedUserID = body.getAttribute("data-loggedUser-id");
const groupID = body.getAttribute("data-group-id");
const LINK = `/api/v1/searchEngine/searchAllUsers`;

input.addEventListener("input", async function () {
  // Getting DOMs
  const container = document.querySelectorAll(
    `.rightSide__cards[data-section-type="invite"]`
  )[0];

  container.innerHTML = "";
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });

  //
  if (this.value.replaceAll(" ", "") === "") return;

  // Getting values&sending request
  const searchValue = this.value;
  requestOptions.body = JSON.stringify({ searchValue: searchValue });
  const response = await fetch(LINK, requestOptions);
  const result = await response.json();
  if (result.status !== "success") return;
  const users = Array.from(result.data.matched);

  // Generating cards
  users.forEach((user) => {
    let groups = Array.from(user.groups.currentlyIn);

    // =
    // Validating, whether the user had already received/sent request to group
    let canContinue = true;

    const allCards = Array.from(document.querySelectorAll(`.rightSide__card`));

    allCards.forEach((card) => {
      const cardUsrID = card.getAttribute("data-user-id");

      if (`${cardUsrID}` === `${user._id}`) canContinue = false;
    });
    console.log(canContinue);
    if (canContinue !== true) return;
    // --
    if (user.groups.requests.sent.length > 0)
      groups.push(...user.groups.requests.sent);
    if (user.groups.requests.received.length > 0)
      groups.push(...user.groups.requests.received);
    // =

    // Removing duplicates at groups Array:
    groups = Array.from(new Set(groups));

    groups.forEach((group) => {
      if (`${group._id}` === `${groupID}`) canContinue = false;
    });

    // --

    // Generating card
    genUsrCard(user, container);
  });

  manageInviteBtns(groupID);
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
});
