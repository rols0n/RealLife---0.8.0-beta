"use strict";

// DOM ELEMENTS
const communityHome = document.getElementsByClassName("sideBar__communityHome");
const settings = document.getElementsByClassName("sidedBar__settings");
const showReqManager = document.getElementsByClassName(
  "sB__icon--showReqManager"
);
const reqManager = document.getElementsByClassName("sideBar__reqManager");

const showReceivedReq = document.getElementsByClassName(
  "sB__icon--showReceivedReq"
);
const receivedReqs = document.getElementsByClassName("reqCard--received");

const showSentReq = document.getElementsByClassName("sB__icon--showSentReq");
const sentReqs = document.getElementsByClassName("reqCard--sent");

showReqManager[0].addEventListener("click", (event) => {
  event.preventDefault();
  showReqManager[0].classList.toggle("arrow-down");
  reqManager[0].classList.toggle("hidden");
});

showReceivedReq[0].addEventListener("click", (event) => {
  showReceivedReq[0].classList.toggle("arrow-down");
  Array.prototype.forEach.call(receivedReqs, (receivedReq) =>
    receivedReq.classList.toggle("hidden")
  );
});

showSentReq[0].addEventListener("click", (event) => {
  showSentReq[0].classList.toggle("arrow-down");
  Array.prototype.forEach.call(sentReqs, (sentReq) =>
    sentReq.classList.toggle("hidden")
  );
});
