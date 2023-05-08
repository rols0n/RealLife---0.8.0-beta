"use strict";

class createGroup {
  constructor() {}

  getDoms = () => {
    this.createdAt = document.querySelectorAll(
      `.midContent__description[data-dsc="createdAt"]`
    )[0];

    this.bannerInput = document.querySelectorAll(`#creator__fileInput`)[0];
    this.nameInput = document.querySelectorAll(
      `.creator__input[data-input-type="group's-name"]`
    )[0];
    this.dscInput = document.querySelectorAll(
      `.creator__input[data-input-type="group's-description"]`
    )[0];

    this.selectPrivacy = document.querySelectorAll(
      `.creator__select[data-select-type="privacy"]`
    )[0];
    this.selectVisibility = document.querySelectorAll(
      `.creator__select[data-select-type="visibility"]`
    )[0];
    this.selectRequests = document.querySelectorAll(
      `.creator__select[data-select-type="requests"]`
    )[0];

    this.submit = document.querySelectorAll(`.creator__submit`)[0];
  };

  createdAtFix = () => {
    const date = new Date(Date.now());
    const localtime = date
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .replaceAll(",", "");

    this.createdAt.textContent += localtime;
  };

  inputTextController = (el, className, rootText) => {
    const namePlaceholder = document.querySelectorAll(`${className}`)[0];
    el.style = "border-color: var(--white50tint)";
    namePlaceholder.style = "color: var(--white80tint)";

    if (el.value.replaceAll(" ", "").length <= 5) {
      namePlaceholder.textContent = el.value;
      el.style = "border-color: var(--red)";
      namePlaceholder.style = "color: var(--red)";
    } else {
      namePlaceholder.textContent = el.value;
    }
    if (el.value.replaceAll(" ", "").length === 0) {
      namePlaceholder.style = "color: var(--white80tint)";
      namePlaceholder.textContent = rootText;
    }

    const string = Array.from(el.value.split(" "));
    string.forEach((word, index) => {
      if (word.length > 33) {
        window.alert("Signle word can't be longer, than 30 characters.");
        string[index] = "";
        el.value = `${string.join(" ")}`;
        namePlaceholder.textContent = el.value;
      }
    });
  };

  managePrivacyIconsAndText = (src, text, dsc) => {
    const topIcon = document.querySelectorAll(`.topContent__icon `)[0];
    const topText = document.querySelectorAll(`.topContent__description `)[0];
    const bottomIcon = document.querySelectorAll(`.midContent__icon`)[0];
    const bottomText = document.querySelectorAll(`.midContent__header`)[0];
    const bottomDsc = document.querySelectorAll(`.midContent__description`)[0];

    topIcon.src = src;
    bottomIcon.src = src;
    topText.textContent = text;
    bottomText.textContent = text;
    bottomDsc.textContent = dsc;
  };

  submitController = () => {
    this.submit.addEventListener("click", async (event) => {
      event.preventDefault();

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow",
        credentials: "same-origin",
      };

      const LINK_1 = "/api/v1/groups";

      if (this.nameInput.value.replaceAll(" ", "").length < 6) {
        window.alert(
          "Group's name needs to be at least 5 characters long (no spaces included)."
        );
        return;
      }

      if (
        this.dscInput.value.replaceAll(" ", "").length > 1 &&
        this.dscInput.value.replaceAll(" ", "").length < 6
      ) {
        window.alert(
          "Group's description needs to be at least 5 characters long (no spaces included)."
        );
        return;
      }

      const raw = JSON.stringify({
        name: this.nameInput.value,
        settings: {
          privacy: this.selectPrivacy.value,
          visibility: this.selectVisibility.value,
          requests: this.selectRequests.value,
        },
      });
      requestOptions.body = raw;

      const response = await fetch(LINK_1, requestOptions);
      const result = await response.json();
      console.log(result);
      if (result.status !== "success") {
        window.alert(
          "Something went wrong with creating group. Try again later"
        );
        return;
      }
      const groupID = result.data.group._id;

      this.bannerInput = document.querySelectorAll(`#creator__fileInput`)[0];

      if (this.bannerInput.files[0]) {
        const Formdata = new FormData();
        Formdata.append("bannerImage", this.bannerInput.files[0]);

        const requestOptions = {
          method: "PATCH",
          body: Formdata,
          redirect: "follow",
          credentials: "same-origin",
        };

        const response = await fetch(
          `/api/v1/groups/updateBannerImage/${groupID}`,
          requestOptions
        );
        const result = await response.json();
      }

      location.replace(`/group/${groupID}`);
    });
  };

  formControler = () => {
    this.bannerInput.addEventListener("change", function (event) {
      const src = URL.createObjectURL(this.files[0]);

      document.querySelectorAll(`.group__backgroundImage`)[0].src = src;
    });

    this.nameInput.addEventListener("input", (event) => {
      this.inputTextController(
        this.nameInput,
        ".topContent__name",
        "Your group's name"
      );
    });

    this.dscInput.addEventListener("input", (event) => {
      this.inputTextController(
        this.dscInput,
        ".midContent__groupDescription",
        "This is description of the group."
      );
    });

    this.selectPrivacy.addEventListener("input", (event) => {
      switch (this.selectPrivacy.value) {
        case "private": {
          this.managePrivacyIconsAndText(
            "/imgs/icons/lock-fill-closed.png",
            "Private",
            "This group is private."
          );
          break;
        }
        case "public-interactions-off": {
          this.managePrivacyIconsAndText(
            "/imgs/icons/lock-duotone-open.png",
            "Public",
            "This group is public and interactions for strangers are turned off."
          );
          break;
        }
        case "public-interactions-on": {
          this.managePrivacyIconsAndText(
            "/imgs/icons/lock-duotone-open.png",
            "Public",
            "This group is public and interactions for strangers are turned on."
          );
          break;
        }
      }
    });
  };

  script = () => {
    this.getDoms();
    this.createdAtFix();

    this.formControler();
    this.submitController();
  };
}

new createGroup().script();
