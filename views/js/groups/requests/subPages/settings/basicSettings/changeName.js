"use strict";

// DOM elements
const groupBackground = document.getElementsByClassName("group")[0];
const navbar = document.getElementsByClassName("navbar")[0];
const sideBar = document.getElementsByClassName("sideBar")[0];
const background = [groupBackground, navbar, sideBar];
//

const avatarFileInput = document.getElementById("settings_fileInput--avatar");
const bannerFileInput = document.getElementById("settings_fileInput--banner");

// text inputs
const firstInputHeading = document.getElementsByClassName(
  "section__subHeading"
)[0];

const firstInputContainer = document.getElementsByClassName(
  "settings__inputContainer"
)[0];
const firstInputSubmit = document.getElementsByClassName("settings__submit")[0];

const fakeInput = document.getElementsByClassName("settings__fakeInput")[0];
const fakeInputText = document.getElementsByClassName("input__text")[0];
const fakeInputBtn = document.getElementsByClassName("fakeInput__button")[0];

const input = document.getElementsByClassName("settings__input")[0];

// Popup
const nameChangeConfirmationWindow =
  document.getElementsByClassName("confirmText")[0];
const hideBtn = document.getElementsByClassName("confirmText__hideBtn")[0];
const description = document.getElementsByClassName("confirmText_dsc")[0];
const secondInputSubmit = document.getElementsByClassName(
  "inputContainer__submit"
)[0];

const popupInput = document.getElementsByClassName("inputContainer__text")[0];

fakeInputBtn.addEventListener("click", (event) => {
  firstInputHeading.textContent =
    "You are currently changing, the group's name:";

  // 1) hiding fakeInput
  fakeInput.classList.toggle("hidden");

  // 2) Making input visible
  firstInputContainer.classList.toggle("hidden");
});

firstInputSubmit.addEventListener("mouseover", (event) => {
  if (input.value === "") {
    firstInputSubmit.style.cursor = "not-allowed";
  } else {
    firstInputSubmit.style.cursor = "pointer";
  }
});

firstInputSubmit.addEventListener("click", (event) => {
  event.preventDefault();

  if (input.value === "") {
    firstInputSubmit.style.cursor = "not-allowed";
  }

  if (input.value !== "") {
    const desc = description.textContent.replace("newNAME", input.value);
    description.textContent = desc;
    // 1. if input is not empty, Show confirmation window
    nameChangeConfirmationWindow.classList.toggle("hidden");
    // 2. Blur the background and listen for click events
    window.scrollTo({
      top: 0,
    });
    background.forEach((bg) => {
      bg.style.filter = "blur(12px)";
    });
    window.scrollTo(nameChangeConfirmationWindow);
    document.getElementsByClassName("bodyGroupPage")[0].style =
      "overflow-y: hidden";
  }
});

secondInputSubmit.addEventListener("mouseover", (event) => {
  if (popupInput.value === "") {
    secondInputSubmit.style.cursor = "not-allowed";
  } else {
    if (popupInput.value === input.value) {
      secondInputSubmit.style.cursor = "pointer";
    } else {
      secondInputSubmit.style.cursor = "not-allowed";
    }
  }
});

secondInputSubmit.addEventListener("click", async (event) => {
  event.preventDefault();

  if (popupInput.value === "") {
    secondInputSubmit.style.cursor = "not-allowed";
  } else {
    // 1. Chekc if confirmation string is the same as the provided name
    if (popupInput.value === input.value) {
      secondInputSubmit.style.cursor = "pointer";

      const name = input.value;
      const confirmName = popupInput.value;
      const groupID = groupBackground.classList[1].split("_")[1];

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      // Sending request to the API (changing the name of the group)
      const raw = JSON.stringify({
        name: `${name}`,
        confirmName: `${confirmName}`,
      });

      console.log(raw);

      const requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const URL = `http://127.0.0.1:3000/api/v1/groups/${groupID}`;

      const response = await fetch(URL, requestOptions);
      const result = await response.json();

      if (result.status !== "success") {
        window.alert("Something went wrong, try again later");
      } else {
        location.reload();
      }
    } else {
      secondInputSubmit.style.cursor = "not-allowed";
    }
  }
});

hideBtn.addEventListener("click", (event) => {
  event.preventDefault();
  // 1. if input is not empty, Show confirmation window
  nameChangeConfirmationWindow.classList.toggle("hidden");
  // 2. Blur the background and listen for click events
  background.forEach((bg) => {
    bg.style.filter = "blur(0px)";
  });
  window.scrollTo(nameChangeConfirmationWindow);
  document.getElementsByClassName("bodyGroupPage")[0].style =
    "overflow-y: scroll";
});
