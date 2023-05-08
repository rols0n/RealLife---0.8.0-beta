"use strict";

import { basicRequest } from "../../utils/_basicRequest.js";

// DOMS
const firstName = document.getElementsByClassName(
  "content__input--first_name"
)[0];
const lastName = document.getElementsByClassName(
  `content__input--last_name`
)[0];

const cityHome = document.getElementsByClassName(
  "content__input--city_home"
)[0];

const submit = document.getElementsByClassName("confirmation__btn--submit")[0];
const cancel = document.getElementsByClassName("confirmation__btn--cancel")[0];
const userID = document
  .getElementsByClassName("body")[0]
  .classList[1].split("_")[1];

//   ===========================
// CODE
const LINK = `http://127.0.0.1:3000/api/v1/users/${userID}`;

class reqObjClass {
  constructor(fname, lname, chome, LINK) {
    this.LINK = LINK;

    this.firstName = fname;
    this.lastName = lname;
    this.cityHome = chome;

    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");
    this.requestOptions = {
      method: "PATCH",
      headers: this.myHeaders,
      body: "",
      redirect: "follow",
      credentials: "same-origin",
    };
  }
  async changeUsersName() {
    const raw = JSON.stringify({
      firstName: this.firstName,
      lastName: this.lastName,
    });
    return await basicRequest(raw, this.LINK, this.requestOptions);
  }
  async changeUsersChome() {
    const raw = JSON.stringify({
      cityHome: this.cityHome,
    });

    return await basicRequest(raw, this.LINK, this.requestOptions);
  }
}

submit.addEventListener("click", async (event) => {
  event.preventDefault();
  const reqObj = new reqObjClass(
    firstName.value,
    lastName.value,
    cityHome.value,
    LINK
  );

  if (firstName.value !== "" && lastName.value !== "") {
    const changeName = await reqObj.changeUsersName();

    if (changeName.status !== "success") {
      window.alert("Something went wrong with changing the Name");
    }
  }

  if (cityHome.value !== "") {
    const changeChome = await reqObj.changeUsersChome();

    if (changeChome.status !== "success") {
      window.alert("Something went wrong changing the cityHome");
    }
  }
  if (
    firstName.value === "" &&
    lastName.value === "" &&
    cityHome.value === ""
  ) {
    window.alert(`Nothing was done, cause you didn't provide any changes`);
  } else location.replace(`http://127.0.0.1:3000/userPage/${userID}`);
});

cancel.addEventListener("click", (event) => {
  event.preventDefault();
  location.replace(`http://127.0.0.1:3000/userPage/${userID}`);
});
