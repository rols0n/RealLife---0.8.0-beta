"use strict";

// DOMS

// const rightSide = document.querySelectorAll(`.rightSide`)[0];
// let sections = Array.from(document.querySelectorAll(`.rightSide__section`));
// const cardContainers = Array.from(
//   document.querySelectorAll(`.rightSide__cards`)
// );
// helper function
class Home {
  constructor() {
    this.rightSide = document.querySelectorAll(`.rightSide`)[0];
    this.sections = Array.from(
      document.querySelectorAll(`.rightSide__section`)
    );
    this.cardContainers = Array.from(
      document.querySelectorAll(`.rightSide__cards`)
    );
    this.headers = new Headers();
    this.headers.append("Content-Type", "application/json");
    this.requestOptions = {
      method: "POST",
      headers: this.headers,
      redirect: "follow",
      credentials: "same-origin",
    };
  }
  borderFix = () => {
    this.sections = Array.from(
      document.querySelectorAll(`.rightSide__section`)
    );
    switch (this.sections.length) {
      case 2: {
        this.cardContainers[0].style =
          "border-bottom: 1px solid var(--white40tint); padding-bottom: 20px; padding-left 10px; ";
        break;
      }
      case 3: {
        this.cardContainers[0].style =
          "border-bottom: 1px solid var(--white40tint); padding-bottom: 20px; padding-left 10px; ";
        this.cardContainers[1].style =
          "border-bottom: 1px solid var(--white40tint); padding-bottom: 20px; padding-left 10px; ";
        break;
      }
    }
  };

  getUsers = async (raw) => {
    this.requestOptions.body = raw;
    this.requestOptions.method = "POST";

    const response = await fetch(
      "http://127.0.0.1:3000/api/v1/searchEngine/peopleYouMayKnow",
      this.requestOptions
    );
    const result = await response.json();
    if (result.status !== "success")
      window.alert(`Something went wrong with generating People You May Know`);

    return result;
  };

  generateCards = async (section, atr) => {
    const result = await this.getUsers(JSON.stringify({ notAllowed: [] }));
    const users = Array.from(result.data.matched);
    for (let i = 0; i < 7; i++) {
      const userObj = users[i];
      if (!userObj) return;
      const user = userObj.user;
      const attributes = `${atr} data-user-id="${user._id}"`;
      let hint = "";
      let style = `style="font-size: 13px; margin-bottom: 24px"`;
      if (userObj.mutualFriends) {
        hint = `${userObj.mutualFriends} Mutual friends`;
      } else if (userObj.groupName) {
        hint = `Member at "${userObj.groupName}"`;
        console.log(hint.length, 2);
        if (hint.length > 25) {
          style = `style="font-size: 12px; margin-bottom: 37px"`;
        }
      } else {
        style = `style="color: transparent";`;
      }
      section.insertAdjacentHTML(
        "beforeend",
        `
           <div class="rightSide__card" ${attributes}>
               <a href="/friends/people-you-may-know/${user._id}">
                <img class="rightSide__avatar" src="${
                  user.profileImage
                }" ${attributes}>
                </a>
               <a href="/friends/people-you-may-know/${user._id}">
                <h4 class="rightSide__name" ${attributes}>${`${user.firstName} ${user.lastName}`}</h4>
               </a>
               <h4 class="rightSide__hint" ${style} ${attributes}>${hint}</h4>
               <button class="rightSide__btn" data-btn-type="confirm" ${attributes}>Add Friend</button>
               <button class="rightSide__btn" data-btn-type="remove" ${attributes}>Remove</button>
           </div>
               `
      );
    }
  };

  genPeopleYouMayKnow = async () => {
    const result = await this.getUsers(JSON.stringify({ notAllowed: [] }));
    console.log(result, 3);
    console.log(result.data.length, 4);
    if (result.data.length * 1 !== 0) {
      this.sectionType = `data-section-type="people-you-may-know"`;
      this.rightSide.insertAdjacentHTML(
        "beforeend",
        `<div class="rightSide__section" ${this.sectionType}></div>`
      );

      this.youMayKnowSection = document.querySelectorAll(
        `.rightSide__section[${this.sectionType}]`
      )[0];
      this.youMayKnowSection.insertAdjacentHTML(
        "beforeend",
        `<div class="section__heading" ${this.sectionType}>
        <h3 class="rightSide__header" ${this.sectionType}>People you may know</h3>
        <a class="rightSide__seeAll" href="/friends/people-you-may-know/" ${this.sectionType}>See All</a>
    </div>`
      );
      this.youMayKnowSection.insertAdjacentHTML(
        "beforeend",
        `<div class="rightSide__cards" ${this.sectionType}>

    </div>`
      );

      this.cardContainer = document.querySelectorAll(
        `.rightSide__cards[${this.sectionType}]`
      )[0];
      await this.generateCards(this.cardContainer, this.sectionType);
    }

    this.sections = Array.from(
      document.querySelectorAll(`.rightSide__section`)
    );
  };

  simpleReq = async () => {
    const response = await fetch(this.LINK, this.requestOptions);
    const result = await response.json();
    console.log(result, 1);
    if (result.status !== "success") {
      window.alert(
        "Something went wrong with canceling the request. Try again later"
      );
      location.replace("/");
    }
  };

  removeCard = () => {
    this.card.remove();
    if (this.cards.length < 1) {
      this.section.remove();
      this.borderFix();
    }
  };

  cancelController = async (btn) => {
    this.LINK = `http://127.0.0.1:3000/api/v1/users/cancelFriendsRequest/${this.userID}`;
    this.requestOptions.method = "PATCH";
    await this.simpleReq();
    this.removeCard();
  };

  removeController = async (btn) => {
    if (this.sectionType === "received") {
      this.LINK = `http://127.0.0.1:3000/api/v1/users/rejectFriendsRequest/${this.userID}`;
      this.requestOptions.method = "PATCH";
      await this.simpleReq();
      this.removeCard();
      console.log("chuj");
    }

    if (this.sectionType === "people-you-may-know") {
      //   this.LINK = `http://127.0.0.1:3000/api/v1/users/peopleYouMayKnow_alreadySeen/add`;
      //   this.requestOptions.method = "POST";
      //   this.requestOptions.body = JSON.stringify({ users: [`${this.userID}`] });
      //   console.log(this.requestOptions.body, 1);
      //   await this.simpleReq();
      this.removeCard();
    }
  };
  btnsController = async () => {
    this.allBtns = Array.from(document.querySelectorAll(`.rightSide__btn`));
    this.allBtns.forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        this.btnType = btn.getAttribute("data-btn-type");
        this.sectionType = btn.getAttribute("data-section-type");
        this.userID = btn.getAttribute("data-user-id");
        this.cardAttr = `[data-user-id="${this.userID}"][data-section-type="${this.sectionType}"]`;
        this.cards = document.querySelectorAll(
          `.rightSide__cards[data-section-type="${this.sectionType}"]`
        )[0];
        this.card = document.querySelectorAll(
          `.rightSide__card${this.cardAttr}`
        )[0];

        this.section = document.querySelectorAll(
          `.rightSide__section[data-section-type="${this.sectionType}"]`
        )[0];

        if (this.btnType === "cancel") {
          await this.cancelController(btn);
          //   console.log("click");
        }
        if (this.btnType === "remove") {
          await this.removeController(btn);
        }
      });
    });
  };
  script = async () => {
    // Generating People You May Know
    await this.genPeopleYouMayKnow();
    await this.btnsController();

    // Displaying bottom borders
    this.borderFix();
  };
}

await new Home().script();
