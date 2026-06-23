import sendNotification from "./../../../../../js/utils/notifications/sendNotification.js";

class Helpers {
  constructor() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    this.requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: "",
      redirect: "follow",
      credentials: "same-origin",
    };

    this.groupID = document
      .getElementsByTagName("body")[0]
      .getAttribute("data-group-id");
  }

  genElem = (elemName, classes, attrs) => {
    const elem = document.createElement(elemName);

    if (classes)
      classes.forEach((el) => {
        elem.classList.add(el);
      });
    if (attrs)
      attrs.forEach((attr) => {
        elem.setAttribute(attr[0], attr[1]);
      });

    return elem;
  };

  genUsrCard = async (user, container) => {
    // window.alert(container.offsetWidth);
    const cardsPerRow = Math.floor(container.offsetWidth / 185) - 1;

    container.style = `grid-template-columns: repeat(${cardsPerRow}, 185px); margin-left: 0; padding-left: 0; justify-content: center`;

    const attrs = [
      ["data-section-type", "invite"],
      ["data-user-id", user._id],
    ];

    const card = this.genElem("div", ["rightSide__card"], attrs);
    container.appendChild(card);
    const a1 = this.genElem(
      "a",
      [],
      [...attrs, ["href", `/userPage/${user._id}`]]
    );
    card.appendChild(a1);
    const avtr = this.genElem(
      "img",
      ["rightSide__avatar"],
      [...attrs, ["src", user.profileImage]]
    );
    a1.appendChild(avtr);

    const a2 = this.genElem(
      "a",
      [],
      [...attrs, ["href", `/userPage/${user._id}`]]
    );
    card.appendChild(a2);
    const name = this.genElem("h4", ["rightSide__name"], attrs);
    a2.appendChild(name);
    name.textContent = user.firstName + " " + user.lastName;

    const invtBtn = this.genElem(
      "button",
      ["rightSide__btn"],
      [...attrs, ["data-btn-type", "invite"]]
    );
    card.appendChild(invtBtn);
    invtBtn.textContent = "Invite";

    card.style =
      "transform: scale(0.80); background-color: transparent; height: auto; padding-bottom: 12px";
  };

  manageButtons = async (btn, link, eventName, socket) => {
    const userID = btn.getAttribute("data-user-id");
    const LINK = `${link}/${this.groupID}`;
    //- Sending request
    const requestOptions = this.requestOptions;
    requestOptions.method = "PATCH";
    requestOptions.body = JSON.stringify({ user: userID });

    const response = await fetch(LINK, requestOptions);
    const result = await response.json();
    // IF no error delete
    if (result.status !== "success") return;
    const card = document.querySelectorAll(
      `.rightSide__card[data-user-id="${userID}"]`
    )[0];

    const notificationSender = new sendNotification();

    console.log(eventName);
    notificationSender.sendPostNoti(
      null,
      userID,
      eventName,
      socket,
      null,
      this.groupID
    );
    console.log(eventName);
    if (card) {
      card.remove();
      const reqCount = document.querySelectorAll(`.requestsCount__count`)[0];
      if (reqCount.textContent * 1 > 0) reqCount.textContent--;
      else reqCount.textContent = "";
    }
  };
}

export default Helpers;
