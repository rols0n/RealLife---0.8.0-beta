import _basicHelpers from "../../../utils/post/helpers/_basicHelpers.js";
import calcTimePassed from "../../../utils/post/utils/calcTimePassed.js";

class _chatHelpers {
  constructor() {
    this._basicHelpers = new _basicHelpers();
    this.genElem = this._basicHelpers.genElem;

    this.loggedUserID = document
      .getElementsByTagName("body")[0]
      .getAttribute("data-loggedUser-id");
  }

  genShortCut = async (chatID, generateChat, param_chatID, shouldGenChat) => {
    if (!chatID) return;
    const chatObj = (
      await (
        await fetch(
          `http://127.0.0.1:3000/api/v1/chats/getChatByID/${chatID}`,
          {
            method: "GET",
            redirect: "follow",
          }
        )
      ).json()
    ).data;

    const { users, content } = chatObj;
    const usersSchemas = [];

    // "users" has the this.loggedUserID's schema so we have to extract the "usersSchemas" that are not the schema of loggedUserID.
    Array.from(users).forEach((user) => {
      if (`${user._id}` !== `${this.loggedUserID}`) usersSchemas.push(user);
      console.log(`${user._id}`, `${this.loggedUserID}`);
    });

    // The code generates chat interface:

    if (`${chatID}` === `${param_chatID}`)
      if (shouldGenChat) generateChat(chatObj, usersSchemas);

    let lastMessage = null;

    if (content.length > 0) {
      lastMessage = content[0];
      if (lastMessage.contentType !== "message" && content[1])
        lastMessage = content[1];
      if (lastMessage.contentType !== "message" && content[2])
        lastMessage = content[2];
    } else {
      lastMessage = { user: { firstName: "" }, text: "" };
    }

    // taking the parent of the shortcut
    const shortcuts = document.querySelectorAll(`.shortcuts`)[0];

    // Removing existing shortcut, so the newly generated would apear on top of them
    const potentialShortcut = document.querySelectorAll(
      `.shortcut[data-chat-id="${chatID}"]`
    )[0];
    if (potentialShortcut) potentialShortcut.remove();

    const shortcut = this.genElem(
      "a",
      ["shortcut"],
      [
        ["href", `/chats?chat_id=${chatID}`],
        ["data-chat-id", chatID],
      ]
    );

    let status = "offline";

    if (usersSchemas[0].activityStatus)
      status = usersSchemas[0].activityStatus.status;

    shortcuts.appendChild(shortcut);
    const shortcut__avatar = this.genElem(
      "div",
      ["shortcut__avatar"],
      [
        ["data-status", status],
        ["data-user-id", usersSchemas[0]._id],
      ]
    );

    shortcut.appendChild(shortcut__avatar);
    const shortcut__img = this.genElem(
      "img",
      ["shortcut__img"],
      [["src", usersSchemas[0].profileImage]]
    );
    shortcut__avatar.appendChild(shortcut__img);

    const shortcut__content = this.genElem("div", ["shortcut__content"]);
    shortcut.appendChild(shortcut__content);

    const shortcut__name = this.genElem("h2", ["shortcut__name"]);
    shortcut__name.textContent = `${
      usersSchemas[0].firstName + " " + usersSchemas[0].lastName
    }`;
    shortcut__content.appendChild(shortcut__name);

    const shortcut__msg = this.genElem("h3", ["shortcut__msg"]);
    let message = lastMessage.text;
    let messageSender = lastMessage.user.firstName;
    if (message.length > 16) {
      message = message.substring(0, 16) + "...";
    }
    if (`${lastMessage.user._id}` === `${this.loggedUserID}`)
      messageSender = "You";

    const { string, hour, shortString, shouldDisplayOnlyHour } = calcTimePassed(
      "",
      new Date(lastMessage.sentAt)
    );

    let timePassed = shortString;
    if (shouldDisplayOnlyHour) timePassed = hour;

    let text = messageSender + ": " + `"${message}" | ${timePassed}`;
    if (lastMessage.text === "")
      text = `You can chat with ${usersSchemas[0].firstName}.`;
    shortcut__msg.textContent = text;
    shortcut__content.appendChild(shortcut__msg);
  };

  txtareaOverflowFix = (conversation__content) => {
    this.messageTextarea = document.querySelectorAll(`.action__textarea`)[0];
    this.messageTextarea.addEventListener("input", function () {
      const cvrstnContent = document.querySelectorAll(
        `.conversation__content`
      )[0];

      // Base height 82vh
      // 14 7 3.5 1.75 0.875

      if (this.scrollHeight > this.clientHeight && this.clientHeight < 175) {
        const clientHeight = this.clientHeight;
        const cntHeight = cvrstnContent.offsetHeight;
        cvrstnContent.style = `height: ${cntHeight - 53}px; `;
        this.style = `height: ${clientHeight + 30}px; `;
        // conversation__content.scrollTop = conversation__content.scrollHeight;
        conversation__content.scrollBy({
          top: 100, // change the value to adjust the scrolling distance
          behavior: "smooth",
        });
      }

      if (this.value.length < 50) {
        this.style = `height: 35px`;
        cvrstnContent.style = "height: calc(82vh - 24px)";
        conversation__content.scrollTop = conversation__content.scrollHeight;
      }
    });
  };
}

export default _chatHelpers;
