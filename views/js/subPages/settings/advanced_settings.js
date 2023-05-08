"use strict";

import { basicRequest } from "../../utils/_basicRequest.js";

const ALLSETTINGS = [
  "Feed",
  "Friends",
  "Informations Tab",
  "Photos Tab",
  "Movies Tab",
];
const submit = document.getElementsByClassName(`confirmation__btn--submit`)[0];
const cancel = document.getElementsByClassName("confirmation__btn--cancel")[0];

const userID = document
  .getElementsByClassName("body")[0]
  .classList[1].split("_")[1];
const LINK = `http://127.0.0.1:3000/api/v1/users/${userID}`;

class AdvancedSetting {
  constructor(settings) {
    this.values = [];

    for (let x = 0; x < settings.length; x++) {
      const setting = settings[x];
      console.log(setting);
      const value = document.getElementsByClassName(
        `content__select--${setting.replace(" ", "-").toLowerCase()}_visibility`
      )[0].value;

      this.values[x] = value;
    }

    this.LINK = LINK;

    this.raw = {
      privacySettings: {
        visibilityOfFeed: this.values[0],
        visibilityOfFriends: this.values[1],
        visibilityOfInformationsTab: this.values[2],
        visibilityOfPhotosTab: this.values[3],
        visibilityOfMoviesTab: this.values[4],
      },
    };

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

  async updateUser() {
    const raw = JSON.stringify(this.raw);
    this.requestOptions.body = raw;

    return await basicRequest(raw, LINK, this.requestOptions);
  }
}

submit.addEventListener("click", async (event) => {
  event.preventDefault();

  const privacySettingsObj = new AdvancedSetting(ALLSETTINGS);
  const result = await privacySettingsObj.updateUser();
  console.log(result);
});

cancel.addEventListener("click", (event) => {
  event.preventDefault();
  location.replace(`http://127.0.0.1:3000/userPage/${userID}`);
});
