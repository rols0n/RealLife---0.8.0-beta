import _basicHelpers from "../../../utils/post/helpers/_basicHelpers.js";
import _chatHelpers from "./_chatHelpers.js";
import calcTimePassed from "../../../utils/post/utils/calcTimePassed.js";

class contentHelpers {
  constructor(socket) {
    this._basicHelpers = new _basicHelpers();
    this.genElem = this._basicHelpers.genElem;
    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");
    this.genShortCut = new _chatHelpers().genShortCut;
    this.loggedUserID = document
      .getElementsByTagName("body")[0]
      .getAttribute("data-loggedUser-id");

    this.socket = socket;
  }

  markAsSeen = async (usersSchemas, chatID) => {
    const LINK = "/api/v1/chats/content/markAsSeen";
    const raw = JSON.stringify({ chatID });
    const requestOptions = {
      method: "PATCH",
      headers: this.myHeaders,
      body: raw,
      redirect: "follow",
      credentials: "same-origin",
    };

    const response = await fetch(LINK, requestOptions);
    const result = await response.json();
    if (result.status !== "success") return;
    let lastDate = {};
    if (result.data.content[1]) {
      const date = new Date(result.data.content[1].sentAt);
      lastDate = {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        text: `${date}`.split("GMT")[0],
      };
    }

    this.socket.send(
      JSON.stringify({
        sentTo: usersSchemas[0]._id,

        author: this.loggedUserID,
        eventCategory: "markAsSeen",
      })
    );
  };

  genContentCard = (
    el,
    lastDate,
    conversation__content,
    usersSchemas,
    chatID
  ) => {
    const date = new Date(el.sentAt);
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
    if (lastDate === undefined || date.getDate() !== lastDate.day) {
      if (el.contentType === "seen") return;
      lastDate = {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        text: localtime,
      };

      const date__info = this.genElem("h3", ["date__info"]);
      date__info.textContent = lastDate.text;
      conversation__content.appendChild(date__info);
    }

    const popup = this.genElem("h4", [
      "chat__popup",
      "hidden",
      "animate__animated",
      "animate__fadeIn",
    ]);

    if (
      el.contentType === "seen" &&
      `${el.user._id}` !== `${this.loggedUserID}`
    ) {
      const container = this.genElem("div", ["chatPopupContainer"]);

      const conversation__seen = this.genElem(
        "img",
        ["conversation__seen"],
        [["src", el.user.profileImage]]
      );
      container.appendChild(popup);
      popup.setAttribute("data-msg-card", "left");
      container.appendChild(conversation__seen);
      popup.textContent = `Seen at ${localtime}`;
      conversation__content.appendChild(container);

      container.addEventListener("mouseover", (event) => {
        popup.classList.remove("hidden");
      });

      container.addEventListener("mouseout", (event) => {
        popup.classList.add("hidden");
      });
    }

    if (el.contentType === "message") {
      const side =
        `${el.user._id}` === `${this.loggedUserID}` ? "right" : "left";

      popup.setAttribute("data-msg-card", side);

      const message__card = this.genElem(
        "div",
        ["message__card", "chatPopupContainer"],
        [["data-msg-card", side]]
      );
      conversation__content.appendChild(message__card);

      popup.textContent = `Sent at ${localtime}`;

      const card__text = this.genElem(
        "h3",
        ["card__text"],
        [["data-card-type", "message"]]
      );
      card__text.textContent = el.text;

      const message__avatar = this.genElem(
        "img",
        ["message__avatar"],
        [["src", el.user.profileImage]]
      );

      if (side === "right") {
        message__card.appendChild(card__text);
        message__card.appendChild(message__avatar);
        message__card.appendChild(popup);
        // card__text.setAttribute("id", "card__text");
        // console.log(card__text);
        // card__text.clientWidth();
        const card__textWidth = card__text.getBoundingClientRect().width;
        // Fixing the margin of popup
        //
        const marginLeft = card__textWidth - 178;
        popup.style = `margin-left: ${marginLeft}`;
        // console.log(card__text, marginLeft);s
      }

      if (side === "left") {
        message__card.appendChild(popup);
        message__card.appendChild(message__avatar);
        message__card.appendChild(card__text);
      }

      message__card.addEventListener("mouseover", (event) => {
        message__card.classList.add("message__card--active");
        popup.classList.remove("hidden");
        card__text.style = "background-color: var(--redchat10tint)";
      });

      message__card.addEventListener("mouseout", (event) => {
        message__card.classList.remove("message__card--active");
        popup.classList.add("hidden");
        card__text.style = "background-color: var(--redchat)";
      });
    }

    conversation__content.scrollTop = conversation__content.scrollHeight;

    this.genShortCut(chatID, false, chatID, false);

    return lastDate;
  };

  genChatNavbar = (usersSchemas) => {
    const convNavbar = document.querySelectorAll(`.conversation__navbar`)[0];
    document.querySelectorAll(`.navbar__card`)[0].remove();

    const navbar__card = this.genElem("div", ["navbar__card"]);
    convNavbar.appendChild(navbar__card);

    const { activityStatus, profileImage, _id, firstName, lastName } =
      usersSchemas[0];
    let status;
    if (!activityStatus) status = "offline";
    else status = activityStatus.status;

    const card__avatar = this.genElem(
      "div",
      ["card__avatar"],
      [
        ["data-status", status],
        ["data-user-id", _id],
      ]
    );
    navbar__card.appendChild(card__avatar);

    const card__img = this.genElem(
      "img",
      ["card__img"],
      [["src", profileImage]]
    );
    card__avatar.appendChild(card__img);

    const card__details = this.genElem("div", ["card__details"]);
    navbar__card.appendChild(card__details);

    const card__name = this.genElem(
      "a",
      ["card__name"],
      [["href", `/userPage/${_id}`]]
    );
    card__name.textContent = firstName + " " + lastName;
    card__details.appendChild(card__name);
    console.log(activityStatus);

    const card__time = this.genElem(
      "h3",
      ["card__time"],
      [
        ["data-user-id", _id],
        ["data-status", status],
      ]
    );

    const { string, hour, shortString, shouldDisplayOnlyHour } = calcTimePassed(
      "",
      new Date(activityStatus.lastTimeOnline)
    );

    let timePassed = shortString;
    card__time.textContent = `${timePassed}`;

    if (status === "online") card__time.textContent = "online";

    card__details.appendChild(card__time);
  };
}

export default contentHelpers;
