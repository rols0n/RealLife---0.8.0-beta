const membCardsLeft = document.getElementsByClassName(
  "main__memberCards--left"
)[0];

const membCardsRight = document.getElementsByClassName(
  "main__memberCards--right"
)[0];

const membCards = document.getElementsByClassName("main__memberCard left");
let membCardBTNS;

membCardBTNS = document.getElementsByClassName("memberCard__btn");

let id = 0;
export class Manager {
  constructor(type, where) {
    this.type = type;
    this.cardID_index = id;
    this.IDsOfAllCards = [];
    this.where = where;

    this.classes = ``;
    this.moveToRightSide = true;

    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");
    this.requestOptions = {
      method: "DELETE",
      headers: this.myHeaders,
      body: "",
      redirect: "follow",
      credentials: "same-origin",
    };
  }

  validation = function (btn) {
    if (btn.classList[1] === "right") {
      this.classes = `left userID_${this.userID} ${this.type}Num_${
        membCards.length + 1
      }`;
      if (this.cardID_index > 0) this.cardID_index--;

      let place = -1;
      Array.prototype.forEach.call(this.IDsOfAllCards, (id) => {
        place++;
        if (`${id}` === `${this.userID}`) {
          this.IDsOfAllCards.splice(place, 1);
        }
      });
      this.moveToRightSide = false;
    }
    if (btn.classList[1] === "left") {
      this.cardID_index++;

      this.classes = `right userID_${this.userID} ${this.type}Num_${this.cardID_index}`;
      let canPush = true;
      Array.prototype.forEach.call(this.IDsOfAllCards, (id) => {
        if (`${id}` === `${this.userID}`) {
          canPush = false;
        }
      });
      if (canPush === true) this.IDsOfAllCards.push(this.userID);
    }
  };

  attachClickListener = function () {
    Array.prototype.forEach.call(membCardBTNS, (btn) => {
      btn.addEventListener("click", (event) => {
        this.userID = btn.classList[2].split("_")[1];

        this.validation(btn);
        this.name = document.getElementsByClassName(
          `manager__name ${btn.classList[2]}`
        )[0].textContent;

        document
          .getElementsByClassName(`manager__card userID_${this.userID}`)[0]
          .remove();

        this.cardTemplate = `<div class="manager__card manager__card--${this.classes}"><img class="manager__btn ${this.classes}" src="/imgs/icons/x-circle-red.png" alt=""><a class="manager__container ${this.classes}" target="_tab"  href="/userPage/${this.userID}"><div class="manager__details ${this.classes}"><img class="manager__avatar" src="/imgs/users/${this.userID}/profilePicture/profile-picture-${this.userID}.jpeg"><h3 class="manager__name ${this.classes}">${this.name}</h3></div></a></div>`;

        console.log(this.moveToRightSide);
        if (this.moveToRightSide === true)
          membCardsRight.insertAdjacentHTML("beforeend", this.cardTemplate);
        else membCardsLeft.insertAdjacentHTML("beforeend", this.cardTemplate);

        // Generate another addEventListener for created element and repeat the process on it
        this.attachClickListener();
      });
    });
  };

  generateLINK = function () {
    this.LINK;
    this.LINK_ID;
    this.RAW;

    this.LINK_2;

    if (this.where === "group") {
      this.LINK_ID = document
        .getElementsByClassName("group")[0]
        .classList[1].split("_")[1];

      if (this.type === "admin") {
        this.LINK = `http://127.0.0.1:3000/api/v1/groups/${this.LINK_ID}/administrators`;
        this.LINK_2 = `http://127.0.0.1:3000/group/${groupID}/settings/manage_administration`;
      }
      if (this.type === "mod") {
        this.LINK = `http://127.0.0.1:3000/api/v1/groups/${this.LINK_ID}/moderators`;
        this.LINK_2 = `http://127.0.0.1:3000/group/${groupID}/settings/manage_administration`;
      }

      if (this.type === "memb") {
        this.LINK = `http://127.0.0.1:3000/api/v1/groups/removeMember/${this.LINK_ID}`;
        this.LINK_2 = `http://127.0.0.1:3000/group/${groupID}/settings/manage_administration`;
      }

      return;
    }

    if (this.where === "userPage") {
      if (this.type === "friend") {
        this.LINK = `http://127.0.0.1:3000/api/v1/users/deleteFriend/`;
      }
    }
  };

  sendRequests = async function (raw, id) {
    generateLINK();

    //
    if (id) {
      this.LINK += `${id}`;
      this.LINK_2 = `http://127.0.0.1:3000/userPage/${groupID}/informations`;
    }
    this.requestOptions.body = raw;

    const response = await fetch(this.LINK, this.requestOptions);
    const result = await response.json();

    if (result.status === "success") {
      window.alert("DONE");
      location.replace(this.LINK_2);
    } else {
      window.alert("Something went wrong");
      location.replace(this.LINK_2);
    }
  };
}
