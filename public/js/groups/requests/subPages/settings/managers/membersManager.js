"use strict";

// DOMS

const membCardsLeft = document.getElementsByClassName(
  "main__memberCards--left"
)[0];

const membCardsRight = document.getElementsByClassName(
  "main__memberCards--right"
)[0];

const membCards = document.getElementsByClassName("main__memberCard left");
let membCardBTNS;
const membCardContainer = document.getElementsByClassName(
  "memberCard__details-container"
)[0];
const membCardDetails = document.getElementsByClassName(
  "memberCard__details"
)[0];
const detailsAvatar = document.getElementsByClassName("details__avatar")[0];
const detailsName = document.getElementsByClassName("details__name");

const submitBTN = document.getElementsByClassName("submit__btn")[0];
// script ->

// 1) Whenever user clicks at the membCardBTN:

membCardBTNS = document.getElementsByClassName("memberCard__btn");

let num = 0;
let IDs = [];
const attachClickListener = () => {
  Array.prototype.forEach.call(membCardBTNS, (btn) => {
    btn.addEventListener("click", (event) => {
      const userID = btn.classList[2].split("_")[1];
      // 2) Copy whole card
      let classes = ``;
      let moveToRightSide = true;
      // 3) Check if it's currently on left side, if so then copy the userID to the array
      if (btn.classList[1] === "right") {
        classes = `left userID_${userID} membNum_${membCards.length + 1}`;
        if (num > 0) num--;

        let place = -1;
        Array.prototype.forEach.call(IDs, (id) => {
          place++;
          if (`${id}` === `${userID}`) {
            IDs.splice(place, 1);
          }
        });
        moveToRightSide = false;
      }

      if (btn.classList[1] === "left") {
        num++;
        classes = `right userID_${userID} membNum_${num}`;

        // 1) Checking if the IDs doesnt already contain userID
        let canPush = true;
        Array.prototype.forEach.call(IDs, (id) => {
          if (`${id}` === `${userID}`) {
            canPush = false;
          }
        });
        if (canPush === true) IDs.push(userID);
      }

      const name = document.getElementsByClassName(
        `details__name ${btn.classList[2]}`
      )[0].textContent;
      const data = `<div class="main__memberCard ${classes}"><img class="memberCard__btn ${classes}" src="/imgs/icons/x-circle-red.png" alt=""><a class="memberCard__details-container ${classes}" target="_tab"  href="/userPage/${userID}"><div class="memberCard__details ${classes}"><img class="details__avatar" src="/imgs/users/${userID}/profilePicture/profile-picture-${userID}.jpeg"><h3 class="details__name ${classes}">${name}</h3></div></a></div>`;

      // 4) Hide card
      document
        .getElementsByClassName(`main__memberCard userID_${userID}`)[0]
        .remove();

      // 5) Display card on opposite side

      if (moveToRightSide === true)
        membCardsRight.insertAdjacentHTML("beforeend", data);
      else membCardsLeft.insertAdjacentHTML("beforeend", data);

      // 1) Generate another addEventListener for created element and repeat the process on it
      attachClickListener();
    });
  });
};
attachClickListener();

// submit controlling

submitBTN.addEventListener("mouseover", (event) => {
  if (IDs.length <= 0) submitBTN.style = "cursor: not-allowed";
});
submitBTN.addEventListener("click", (event) => {
  event.preventDefault();
  if (IDs.length > 0)
    // Loop over the IDs and send the request
    Array.prototype.forEach.call(IDs, async (id) => {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        user: id,
      });

      const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
        credetnials: "same-origin",
      };

      const groupID = document
        .getElementsByClassName("group")[0]
        .classList[1].split("_")[1];

      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/groups/removeMember/${groupID}`,
        requestOptions
      );

      const result = await response.json();

      if (result.status === "success") {
        window.alert("Done");
        location.replace(
          `http://127.0.0.1:3000/group/${groupID}/settings/manage_administration`
        );
      } else {
        window.alert("Something went wrong. Sorry.");
        location.replace(
          `http://127.0.0.1:3000/group/${groupID}/settings/manage_administration`
        );
      }
    });
});
