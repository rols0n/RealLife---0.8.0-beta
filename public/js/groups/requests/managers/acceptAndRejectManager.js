"use strict";
import Helpers from "./utils/helpers.js";

const socket = new WebSocket("ws://localhost:8080");
const { manageButtons } = new Helpers();

// DOMS
const allAcceptBtns = Array.from(
  document.querySelectorAll(`.rightSide__btn[data-btn-type="confirm"]`)
);

const allRejectBtns = Array.from(
  document.querySelectorAll(`.rightSide__btn[data-btn-type="remove"]`)
);

// Managing Accept Btns
allAcceptBtns.forEach((acceptBtn) => [
  acceptBtn.addEventListener("click", (event) => {
    event.preventDefault();
    manageButtons(
      acceptBtn,
      `/api/v1/groups/request/acceptGroupRequest`,
      "groupRequestAccepted",
      socket
    );
  }),
]);

// Managing Reject Btns
allRejectBtns.forEach((rejectBtn) => {
  rejectBtn.addEventListener("click", (event) => {
    event.preventDefault();
    manageButtons(
      rejectBtn,
      `/api/v1/groups/request/rejectGroupRequest`,
      "groupRequestRejected",
      socket
    );
  });
});
