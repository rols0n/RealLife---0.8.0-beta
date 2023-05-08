import calcTimePassed from "../../utils/post/utils/calcTimePassed.js";
import _chatHelpers from "./utils/_chatHelpers.js";
import _basicHelpers from "../../utils/post/helpers/_basicHelpers.js";
import _contentHelpers from "./utils/_contentHelpers.js";

class chatsController {
  constructor(socket) {
    this.el = document.querySelectorAll(`.conversation__content`)[0];
    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");

    this._chatHelpers = new _chatHelpers();
    this.genShortCut = this._chatHelpers.genShortCut;
    this.txtareaOverflowFix = this._chatHelpers.txtareaOverflowFix;

    this._basicHelpers = new _basicHelpers();
    this.genElem = this._basicHelpers.genElem;
    this.loggedUserID = document
      .getElementsByTagName("body")[0]
      .getAttribute("data-loggedUser-id");

    this.socket = socket;

    this.contentHelpers = new _contentHelpers(this.socket);
    this.markAsSeen = this.contentHelpers.markAsSeen;
    this.genContentCard = this.contentHelpers.genContentCard;
    this.genChatNavbar = this.contentHelpers.genChatNavbar;
  }

  generateChat = async (chatObj, usersSchemas) => {
    this.genChatNavbar(usersSchemas);

    // Deleting conversation__content so we could have a space for generating chat
    document.querySelectorAll(`.conversation__content`)[0].remove();
    const conversation = document.querySelectorAll(".conversation")[0];

    const conversation__content = this.genElem("div", [
      "conversation__content",
    ]);
    conversation__content.scrollBy({
      top: 100, // change the value to adjust the scrolling distance
      behavior: "smooth",
    });

    conversation.appendChild(conversation__content);

    // Generating content of chat (messages, dateInfo, seenIcons)
    let lastDate = undefined;

    const { content } = chatObj;
    const contentArray = Array.from(content).reverse();
    contentArray.forEach((el) => {
      lastDate = this.genContentCard(el, lastDate, conversation__content);
    });
    conversation__content.scrollTop = conversation__content.scrollHeight;

    const attrs = [["data-chat-id", chatObj._id]];
    document.querySelectorAll(`.conversation__action`)[0].remove();
    const conversation__action = this.genElem(
      "div",
      ["conversation__action"],
      attrs
    );
    conversation.appendChild(conversation__action);
    const action__content = this.genElem("div", ["action__content"], attrs);
    conversation__action.appendChild(action__content);
    const textarea = this.genElem(
      "textarea",
      ["action__textarea"],
      [
        ["data-chat-id", chatObj._id],
        [
          "placeholder",
          `What you want to share with ${usersSchemas[0].firstName}?`,
        ],
      ]
    );
    action__content.appendChild(textarea);
    const submit = this.genElem(
      "img",
      ["action__submit"],
      [
        ["data-chat-id", chatObj._id],
        ["src", "/imgs/icons/send-fill-red.png"],
        ["role", "button"],
        ["tabindex", "0"],
        ["data-sentTo", usersSchemas[0]._id],
        ["data-chat-id", chatObj._id],
      ]
    );

    action__content.appendChild(submit);

    this.txtareaOverflowFix(conversation__content);
    this.manageSubmit(usersSchemas);

    // Marking conversation as seen:
    this.markAsSeen(usersSchemas, chatObj._id);
  };

  genShortCuts = async (user, param_chatID) => {
    this.shortcuts = document.querySelectorAll(`.shortcuts`)[0];

    const usrChats = user.chats;

    for (let i = 0; i < usrChats.length; i++) {
      const el = usrChats[i];

      await this.genShortCut(el, this.generateChat, param_chatID, true);
    }

    // managing input so the searcher would work
    const searcher = document.querySelectorAll(`.search__input`)[0];
    const search = document.querySelectorAll(`.search`)[0];
    searcher.addEventListener("input", function (event) {
      const allShortCuts = Array.from(document.querySelectorAll(`.shortcut`));
      if (this.value.length > 0) {
        let matchesCount = 0;

        allShortCuts.forEach((shortcut) => {
          const name = shortcut.lastChild.firstChild.textContent.toLowerCase();

          if (name.startsWith(this.value.toLowerCase())) {
            matchesCount++;
          } else {
            shortcut.classList.add("hidden");
          }
        });

        search.style = "box-shadow: 2px 4px 7px -5px var(--redchat20tint)";
        if (matchesCount > 0)
          search.style = "box-shadow: 2px 4px 7px -5px #15ff05";
      } else {
        search.style = "box-shadow: 2px 4px 4px -5px var(--white70tint)";
        allShortCuts.forEach((shortcut) => {
          shortcut.classList.remove("hidden");
        });
      }
    });
  };

  manageSubmit = (usersSchemas) => {
    const action__submit = document.querySelectorAll(`.action__submit`)[0];
    console.log(action__submit);
    const textarea = document.querySelectorAll(`.action__textarea`)[0];
    action__submit.addEventListener("mouseover", (event) => {
      if (textarea.value.length < 1)
        action__submit.style = "cursor: not-allowed";
      else action__submit.style = "cursor: pointer";
    });
    const chatID = action__submit.getAttribute("data-chat-id");

    action__submit.addEventListener("click", async (event) => {
      if (textarea.value.length < 1) return;

      const sentTo = action__submit.getAttribute("data-sentTo");

      const author = this.loggedUserID;
      const message = textarea.value;

      // Uploading the message to the DB:
      const LINK = "/api/v1/chats/messages/upload";
      const raw = JSON.stringify({ chatID, text: message });
      const requestOptions = {
        method: "POST",
        headers: this.myHeaders,
        body: raw,
        credentials: "same-origin",
        redirect: "follow",
      };
      const response = await fetch(LINK, requestOptions);
      const result = await response.json();
      if (result.status !== "success") return;

      const chatObj = result.data.content[0];

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

      textarea.value = "";
      this.genContentCard(
        chatObj,
        lastDate,
        document.querySelectorAll(`.conversation__content`)[0],
        usersSchemas,
        chatID
      );

      this.socket.send(
        JSON.stringify({
          sentTo,
          chatObj,
          lastDate,
          author,
          eventCategory: "message",
        })
      );
      // Marking conversation as seen:
      this.markAsSeen(usersSchemas, chatID);
    });

    const genContentCard = this.genContentCard;

    // Marking conversation as seen:
    const markAsSeen = this.markAsSeen;
    const genElem = this.genElem;
    this.socket.onmessage = async function (event) {
      this.loggedUserID = document
        .getElementsByTagName("body")[0]
        .getAttribute("data-loggedUser-id");
      const data = JSON.parse(event.data);
      if (data.eventCategory === "message") {
        if (`${data.sentTo}` === `${this.loggedUserID}`) {
          console.log(data);
          genContentCard(
            data.chatObj,
            data.lastDate,
            document.querySelectorAll(`.conversation__content`)[0],
            usersSchemas,
            chatID
          );
          markAsSeen(usersSchemas, chatID);
        }
      }

      if (data.eventCategory === "markAsSeen")
        if (`${data.sentTo}` === `${this.loggedUserID}`) {
          let conversationSeen =
            document.querySelectorAll(`.conversation__seen`)[0];
          const src = conversationSeen.getAttribute("src");
          conversationSeen.remove();

          const conversation__content = document.querySelectorAll(
            `.conversation__content`
          )[0];
          conversationSeen = genElem(
            "img",
            ["conversation__seen"],
            [["src", src]]
          );
          conversation__content.appendChild(conversationSeen);
        }
    };
  };

  generatePage = async (param_chatID) => {
    const user = (
      await (
        await fetch(`http://127.0.0.1:3000/api/v1/users/${this.loggedUserID}`, {
          method: "GET",
          redirect: "follow",
        })
      ).json()
    ).data.data;

    this.genShortCuts(user, param_chatID);
  };
}

export default chatsController;
