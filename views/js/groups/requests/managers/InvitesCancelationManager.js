"use strict";
import Helpers from "./utils/helpers.js";
const socket = new WebSocket("ws://localhost:8080");
const { manageButtons } = new Helpers();

// DOMS
const allCancelBtns = Array.from(
  document.querySelectorAll(`.rightSide__btn[data-btn-type="cancel"`)
);

allCancelBtns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    manageButtons(
      btn,
      `/api/v1/groups/request/cancelInvitation`,
      "groupRequestCanceled",
      socket
    );
  });
});
