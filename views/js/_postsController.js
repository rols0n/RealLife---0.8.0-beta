"use strict";

// ##################################
// This file is a posts controller and it's functionalities are:
// - Showing the comments section
// - creating comments
// ##################################
const socket = new WebSocket("ws://localhost:8080");

import sendNotification from "./utils/notifications/sendNotification.js";
import commentReactions from "./commentReactions.js";
import postReactions from "./postReactions.js";

// ####
// DOM ELEMENTS

// ###
// code

class postController {
  constructor() {
    this.postsCount = document.getElementsByClassName("postCard");
    this.allPosts = Array.from(this.postsCount);

    this.allReplyBtns = Array.from(
      document.getElementsByClassName("interactions__reply")
    );

    this.loggedUser = document
      .getElementsByTagName("body")[0]
      .getAttribute("data-loggedUser-id");

    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");
  }
  generateCardTemplate = (fname, lname, avatar, side, postID, userID) => {
    const attributes = `data-postid="${postID}" data-card-side="${side}"  data-user-id="${userID}"`;
    return `
      <div class="ban-users__card animate__animated animate__fadeIn" ${attributes}>
        <button class="ban-users__btn" ${attributes}>
          <img src="/imgs/icons/x-circle-red.png" ${attributes}>
        </button>
        <div class="ban-users__content" ${attributes}>
          <img src="${avatar}" class="ban-users__img" ${attributes}>
          <h3 class="ban-users__name" ${attributes} >${fname} ${lname}</h3>
        </div>
      </div>
    `;
  };

  cursorFix = (text, btn) => {
    if (text.value === "") {
      btn.style = "cursor: not-allowed";
      return true;
    }
  };

  manageSubReply_ = (replyBtn) => {
    const postID = replyBtn.getAttribute("data-postid");
    const level = replyBtn.getAttribute("data-level");
    if (level !== "subReply_") return;
    const user = replyBtn.getAttribute("data-author-id");
    const repliesTo = replyBtn.getAttribute("data-replies-to-user");
    const commentID = replyBtn.getAttribute("data-comment-id");
    const treeID = replyBtn.getAttribute("data-tree-id");
    const name = document.querySelectorAll(
      `.subReply__name[data-postid="${postID}"][data-level="subReply_"][data-comment-id="${commentID}"][data-author-id="${user}"]`
    )[0];
    const attributes = `[data-postid="${postID}"][data-level="${level}"][data-tree-id="${treeID}"]`;

    const form = document.querySelectorAll(
      `.comments__form--subReply_${attributes}`
    )[0];
    const submitBtn = document.querySelectorAll(
      `.form__submit${attributes}`
    )[0];
    const textarea = document.querySelectorAll(
      `.form__textarea${attributes}`
    )[0];
    document.querySelectorAll(
      `.tag__text${attributes}`
    )[0].textContent = `@${name.textContent}`;

    form.classList.toggle("hidden");
    submitBtn.addEventListener("mouseover", (event) => {
      submitBtn.style = "cursor: pointer";
      if (textarea.value === "") {
        submitBtn.style = "cursor: not-allowed";
        return;
      }
    });

    submitBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      // console.log("clicked");
      submitBtn.style = "cursor: pointer";
      if (textarea.value === "") {
        submitBtn.style = "cursor: not-allowed";
        return;
      }

      const raw = JSON.stringify({
        tagsUser: user,
        repliesTo: repliesTo,
        text: textarea.value,
      });

      const requestOptions = {
        method: "POST",
        headers: this.myHeaders,
        body: raw,
        redirect: "follow",
        credentials: "same-origin",
      };

      const response = await fetch(
        `http://127.0.0.1:3000/api/v1/comments/updateLevelThreeRespond/${treeID}`,
        requestOptions
      );

      const result = await response.json();

      if (result.status !== "success") {
        return;
      }

      location.reload();
    });
  };

  showFrom = (postID) => {
    const replyBtns = Array.from(
      document.querySelectorAll(`.interactions__reply[data-postid="${postID}"]`)
    );

    replyBtns.forEach((replyBtn) => {
      replyBtn.addEventListener("click", async (event) => {
        const level = replyBtn.getAttribute("data-level");
        if (level === "subReply_") {
          this.manageSubReply_(replyBtn);
          return;
        }

        let commentID = replyBtn.getAttribute("data-comment-id");
        const userID = replyBtn.getAttribute("data-author-id");
        let levelBelow;
        if (level === "root") {
          levelBelow = "reply";
        }
        if (level === "reply" || level === "subReply") {
          levelBelow = "subReply";
        }
        this.level = levelBelow;
        this.userName = document.querySelectorAll(
          `.commentCard__name[data-level="${level}"][data-postid="${postID}"][data-author-id="${userID}"][data-comment-id="${commentID}"]`
        )[0];
        if (this.level === "subReply") {
          this.repliesToComment = replyBtn.getAttribute(
            "data-replies-to-comment"
          );
          this.attributes = `[data-postid="${postID}"][data-replies-to-comment="${this.repliesToComment}"]`;
        }
        this.attributes = `[data-postid="${postID}"][data-replies-to-comment="${commentID}"]`;

        const form = document.querySelectorAll(
          `.comments__form--${levelBelow}${this.attributes}`
        )[0];
        // console.log("\n\n\n", form);
        // console.log(`.comments__form--${levelBelow}${this.attributes}`);
        this.repliesToComment = form.getAttribute("data-replies-to-comment");
        this.attributes = `[data-postid="${postID}"][data-replies-to-comment="${this.repliesToComment}"]`;

        const formTag = document.querySelectorAll(
          `.form__tag${this.attributes}`
        )[0];
        const tagText = document.querySelectorAll(
          `.tag__text[data-level="${this.level}"]${this.attributes}`
        )[0];

        tagText.textContent = `@${this.userName.textContent}`;
        tagText.href = `/userPage/${userID}`;
        // console.log(`.comments__form--${levelBelow}${this.attributes}`);
        form.classList.toggle("hidden");

        await this.uploadComment(postID);
      });
    });
  };

  uploadComment = async (postID, link, raw, level) => {
    const attributes = `[data-postid="${postID}"][data-level="${this.level}"]`;

    const submitBtns = Array.from(
      document.querySelectorAll(`.form__submit${attributes}`)
    );

    submitBtns.forEach((submit) => {
      submit.addEventListener("click", async (event) => {
        event.preventDefault();
        console.log(this.level);
        console.log(submit);
        const repliesToUser = submit.getAttribute("data-replies-to-user");
        const repliesToComment = submit.getAttribute("data-replies-to-comment");
        this.textarea = document.querySelectorAll(
          `.form__textarea${attributes}`
        )[0];
        if (repliesToComment && repliesToUser) {
          this.textarea = document.querySelectorAll(
            `.form__textarea${attributes}[data-replies-to-user="${repliesToUser}"][data-replies-to-comment="${repliesToComment}"]`
          )[0];
        }
        this.repliesTo = submit.getAttribute("data-replies-to-user");
        this.treeID = submit.getAttribute("data-tree-id");

        if (this.textarea.value === "") {
          console.log("not-allowed");
          console.log(this.textarea);
          submit.style = "cursor: not-allowed";
          return;
        }
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        this.link = "http://127.0.0.1:3000/api/v1/comments";
        this.raw = JSON.stringify({
          post: [postID],
          tree: {
            text: this.textarea.value,
            author: "chuj",
            repliesToComment,
          },
        });

        if (this.level !== "root") {
          this.raw = JSON.stringify({
            repliesTo: this.repliesTo,
            text: this.textarea.value,
            repliesToComment: repliesToComment,
          });
        }

        if (this.level === "reply") {
          this.link = `http://127.0.0.1:3000/api/v1/comments/updateLevelTwoRespond/${this.treeID}`;
        }

        if (this.level === "subReply") {
          this.link = `http://127.0.0.1:3000/api/v1/comments/updateLevelThreeRespond/${this.treeID}`;
        }

        this.requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: this.raw,
          redirect: "follow",
          credentials: "same-origin",
        };

        const response = await fetch(this.link, this.requestOptions);
        this.result = await response.json();

        if (this.result.status !== "success") {
          window.alert("something went wrong");
          return;
        }

        // ======================================
        // Whenever new root comment is created, it needs the 2nd API call to sign it to the post
        if (this.level === "root") {
          const raw2 = JSON.stringify({
            commentID: this.result.data.data._id,
          });

          this.requestOptions.body = raw2;

          // console.log(dataPost);
          const responsePost = await fetch(
            `http://127.0.0.1:3000/api/v1/posts/uploadCommentID/${postID}`,
            this.requestOptions
          );

          this.result2 = await responsePost.json();
          if (this.result2.status !== "success")
            return window.alert("Something went wrong");
        }

        // ##########################
        // Sending notification

        if (
          `${this.loggedUser}` !== `${this.repliesTo}` &&
          this.repliesTo !== null
        ) {
          const replyData = {
            treeID: this.treeID,
            repliesToCommentID: repliesToComment,

            dataLevel: this.level,
          };
          const raw_noti = JSON.stringify({
            sentTo: this.repliesTo,
            eventType: "post",
            eventName: "commentReply",
            notificationStatus: "new",

            replyData,
          });

          const requestOptions_noti = this.requestOptions;
          requestOptions_noti.body = raw_noti;

          const response_noti = await fetch(
            `http://127.0.0.1:3000/api/v1/notifications/requests/upload`,
            requestOptions_noti
          );

          const result_noti = await response_noti.json();

          if (result_noti.status !== "success") {
            // window.alert("Something went wrong with sending notification!");
            // console.log(result_noti);
          }
          // const notificationSender = new sendNotification();

          const raw_socket = JSON.stringify({
            eventCategory: "notification",
            eventName: "commentReply",
            user: this.loggedUser,
            sentTo: this.repliesTo,

            notificationData: result_noti.user.notifications[0],
            replyData,
          });
          socket.send(raw_socket);
        }

        location.reload();

        this.script();
      });
    });
  };

  repliesBtns = async (postID) => {
    const allRepliesBtns = Array.from(
      document.querySelectorAll(
        `.interactions__replies[data-postid="${postID}"]`
      )
    );

    allRepliesBtns.forEach((repliesBtn) => {
      if (!repliesBtn) return;
      const level = repliesBtn.getAttribute("data-level");
      let levelBelow = "subReply";
      if (level === "root") {
        levelBelow = "reply";
      }
      if (level === "reply") {
        levelBelow = "subReply";
      }

      const commentID = repliesBtn.getAttribute("data-comment-id");
      const treeID = repliesBtn.getAttribute("data-tree-id");
      let sectionBelow = document.querySelectorAll(
        `.commentCard[data-level="${levelBelow}"][data-postid="${postID}"][data-tree-id="${treeID}"][data-replies-to-comment="${commentID}"]`
      );

      repliesBtn.addEventListener("click", (event) => {
        event.preventDefault();

        if (sectionBelow.length === 0 || sectionBelow === undefined) {
          sectionBelow = document.querySelectorAll(
            `.commentCard[data-level="${levelBelow}"][data-postid="${postID}"][data-tree-id="${treeID}"][data-comment-over="${commentID}"]`
          );
        }

        if (sectionBelow.length > 1) {
          Array.from(sectionBelow).forEach((section) =>
            section.classList.toggle("hidden")
          );
          return;
        } else {
          if (sectionBelow[0] === undefined || sectionBelow[0].length === 0)
            return;
          sectionBelow[0].classList.toggle("hidden");
        }
      });
    });
  };

  settingsReq = async (raw, postID, method) => {
    let requestOptions = {
      method: "PATCH",
      headers: this.myHeaders,
      body: raw,
      redirect: "follow",
      credentials: "same-origin",
    };
    if (method) {
      requestOptions = {
        method: method,
        headers: this.myHeaders,
        body: raw,
        redirect: "follow",
        credentials: "same-origin",
      };
    }

    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/posts/${postID}`,
      requestOptions
    );
    const result = await response.json();
    if (result.status !== "success") {
      window.alert("Something went wrong. Try again later");
    }

    const moveBack = document.querySelectorAll(
      `.postCard__setting--back[data-postid="${postID}"]`
    )[0];
    if (moveBack) moveBack.click();
  };
  xBtns = async (postID) => {
    let xBtns = Array.from(
      document.querySelectorAll(`.ban-users__btn[data-postid="${postID}"]`)
    );
    // console.log(xBtns);

    xBtns.forEach(async (xBtn) => {
      const side = xBtn.getAttribute("data-card-side");
      const userID = xBtn.getAttribute("data-user-id");
      const name = document
        .querySelectorAll(
          `.ban-users__name[data-postid="${postID}"][data-card-side="${side}"][data-user-id="${userID}"]`
        )[0]
        .textContent.split(" ");
      const avatar = document
        .querySelectorAll(
          `.ban-users__img[data-postid="${postID}"][data-card-side="${side}"][data-user-id="${userID}"]`
        )[0]
        .getAttribute("src");
      const card = document.querySelectorAll(
        `.ban-users__card[data-postid="${postID}"][data-card-side="${side}"][data-user-id="${userID}"]`
      )[0];
      let oppositeSide = "choosed";
      if (side === "choosed") oppositeSide = "choose";
      const cardsPlace = document.querySelectorAll(
        `.ban-users__cards[data-postid="${postID}"][data-card-side="${oppositeSide}"]`
      )[0];
      const newCard = this.generateCardTemplate(
        name[0],
        name[1],
        avatar,
        oppositeSide,
        postID,
        userID
      );
      xBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        card.remove();
        if (oppositeSide === "choosed") {
          // 2 cards are getting inserted make an if statement to block this behavior, basically check if the card with opposite class exists
          const isCard = document.querySelectorAll(
            `.ban-users__card[data-postid="${postID}"][data-card-side="choosed"][data-user-id="${userID}"]`
          )[0];
          if (!isCard) cardsPlace.insertAdjacentHTML("beforeend", newCard);
          // there should be
          await this.xBtns(postID);
        }
      });
      // this.banUser__submit(postID);
    });
  };

  banUser__submit = async (postID) => {
    const submitBtn = document.querySelectorAll(
      `.submit__btn[data-postid="${postID}"]`
    )[0];
    submitBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      // Get all the user ids and send the request
      const cards = Array.from(
        document.querySelectorAll(
          `.ban-users__card[data-postid="${postID}"][data-card-side="choosed"]`
        )
      );
      const userIDs = [];

      cards.forEach((card) => {
        userIDs.push(card.getAttribute("data-user-id"));
      });

      const raw = JSON.stringify({
        cantBeDisplayedBy: userIDs,
      });
      await this.settingsReq(raw, postID);
    });
  };

  banUser = async (postID) => {
    const input = document.querySelectorAll(
      `.ban-users__input[data-postid="${postID}"]`
    )[0];
    const topSide = document.querySelectorAll(
      `.ban-users__cards[data-postid="${postID}"][data-card-side="choose"]`
    )[0];

    const botSide = document.querySelectorAll(
      `.ban-users__cards[data-postid="${postID}"][data-card-side="choosed"]`
    )[0];

    input.addEventListener("input", async (event) => {
      event.preventDefault();
      input.classList.add("ban-users__input--active");
      // console.log(input.value);
      const raw = JSON.stringify({ searchValue: input.value });

      topSide.innerHTML = "";
      if (input.value.replace(/\s+/g, "") === "") return;

      const requestOptions = {
        method: "POST",
        headers: this.myHeaders,
        body: raw,
        redirect: "follow",
        credentials: "same-origin",
      };

      const response = await fetch(
        "http://127.0.0.1:3000/api/v1/searchEngine/searchAllUsers",
        requestOptions
      );
      const result = await response.json();
      console.log(result);
      if (result.status !== "success") {
        window.alert("Something went wrong.");
        return;
      }
      const users = Array.from(result.data.matched);
      let count = 0;
      users.forEach((user) => {
        // Checking if card is generated on the choosed side.
        if (
          document.querySelectorAll(
            `.ban-users__card[data-postid="${postID}"][data-card-side="choosed"][data-user-id="${user._id}"]`
          )[0]
        )
          return;

        const card = this.generateCardTemplate(
          user.firstName,
          user.lastName,
          user.profileImage,
          "choose",
          postID,
          user._id,
          count
        );
        count++;
        topSide.insertAdjacentHTML("beforeend", card);
      });

      await this.xBtns(postID);
    });
  };

  settings = async (postID, post) => {
    const togglePost = () => {
      openSettings.classList.toggle("hidden");
      postText.classList.toggle("hidden");
      interactions.classList.toggle("hidden");
      if (postCard__images) postCard__images.classList.toggle("hidden");
      if (comments.classList[1] !== "hidden")
        comments.classList.toggle("hidden");
      post.classList.toggle("postCard--active");
      moveBack.classList.toggle("hidden");
      settings.classList.toggle("hidden");
    };
    const openSettings = document.querySelectorAll(
      `.postCard__setting--open[data-postid="${postID}"]`
    )[0];
    const heading = document.querySelectorAll(
      `.settings__description[data-postid="${postID}"][data-type="heading"]`
    )[0];
    const moveBack = document.querySelectorAll(
      `.postCard__setting--back[data-postid="${postID}"]`
    )[0];
    const postText = document.querySelectorAll(
      `.postCard__postText[data-postid="${postID}"]`
    )[0];
    const postCard__images = document.querySelectorAll(
      `.postCard__images[data-postid="${postID}"]`
    )[0];
    const interactions = document.querySelectorAll(
      `.postCard__interactions[data-postid="${postID}"]`
    )[0];
    const comments = document.querySelectorAll(
      `.postCard__comments[data-postid="${postID}"]`
    )[0];
    const settings = document.querySelectorAll(
      `.postCard__settings[data-postid="${postID}"]`
    )[0];
    const menu = document.querySelectorAll(
      `.settings__menu[data-postid="${postID}"]`
    )[0];
    const menuOptions = Array.from(
      document.querySelectorAll(`.menu__option[data-postid="${postID}"]`)
    );
    const textarea = document.querySelectorAll(
      `.description__textarea[data-postid="${postID}"]`
    )[0];
    const descSubmit = document.querySelectorAll(
      `.description__submit[data-postid="${postID}"]`
    )[0];
    const vpSubmit = document.querySelectorAll(
      `.V-P__submit[data-postid="${postID}"]`
    )[0];
    if (!openSettings || !moveBack) return;

    textarea.addEventListener("input", function () {
      this.style.height = "";
      this.style.height = this.scrollHeight + "px";
    });

    openSettings.addEventListener("click", (event) => {
      event.preventDefault();

      moveBack.setAttribute("data-move-back-to", "post");
      togglePost();
    });

    moveBack.addEventListener("click", (event) => {
      event.preventDefault();
      const backTo = moveBack.getAttribute("data-move-back-to");
      const currentlyAt = moveBack.getAttribute("data-currently-at");
      heading.textContent = "Settings";
      heading.style = "color: var(--white80tint)";

      if (backTo === "post") {
        togglePost();
        return;
      }

      document
        .querySelectorAll(
          `.settings__${currentlyAt}[data-postid="${postID}"][data-type="section"]`
        )[0]
        .classList.add("hidden");
      menu.classList.remove("hidden");
      moveBack.setAttribute("data-move-back-to", "post");
    });

    menuOptions.forEach((menuOption) => {
      menuOption.addEventListener("click", async (event) => {
        event.preventDefault();
        const where = menuOption.getAttribute("data-open-menu");
        console.log(where);
        document
          .querySelectorAll(
            `.settings__${where}[data-postid="${postID}"][data-type="section"]`
          )[0]
          .classList.remove("hidden");
        menu.classList.add("hidden");

        moveBack.setAttribute("data-move-back-to", "menu");
        moveBack.setAttribute("data-currently-at", where);
        console.log("click");
        if (where === "description") {
          textarea.setAttribute("placeholder", postText.textContent);
          descSubmit.addEventListener("click", async (event) => {
            event.preventDefault();

            const raw = JSON.stringify({
              postText: textarea.value,
            });
            postText.textContent = textarea.value;
            textarea.value = "";

            this.settingsReq(raw, postID);
          });
        }
        if (where === "Visibility-Privacy") {
          vpSubmit.addEventListener("click", (event) => {
            event.preventDefault();
            const whoCanSeePost = document.querySelectorAll(
              `.V-P__select[data-postid="${postID}"][data-select-type="whoCanSeePost"]`
            )[0];
            const whoCanSeeComments = document.querySelectorAll(
              `.V-P__select[data-postid="${postID}"][data-select-type="whoCanSeeComments"]`
            )[0];
            const whoCanInteract = document.querySelectorAll(
              `.V-P__select[data-postid="${postID}"][data-select-type="whoCanInteract"]`
            )[0];
            const raw = JSON.stringify({
              whoCanSeePost: whoCanSeePost.value,
              whoCanInteract: whoCanInteract.value,
              whoCanSeeComments: whoCanSeeComments.value,
            });

            this.settingsReq(raw, postID);
          });
        }

        if (where === "ban-users") {
          this.banUser__submit(postID);
          await this.xBtns(postID);
          await this.banUser(postID);
        }

        if (where === "delete-post") {
          heading.textContent = "WARNING!";
          heading.style = "color: var(--white70tint)";
          const cancel = document.querySelectorAll(
            `.delete-post__cancel[data-postid="${postID}"]`
          )[0];
          const submit = document.querySelectorAll(
            `.delete-post__submit[data-postid="${postID}"]`
          )[0];

          cancel.addEventListener("click", (event) => {
            moveBack.click();
          });

          submit.addEventListener("click", (event) => {
            event.preventDefault();
            const raw = JSON.stringify({});
            this.settingsReq(raw, postID, "DELETE");
            document
              .querySelectorAll(`.postCard[data-postid="${postID}"]`)[0]
              .remove();
          });
        }
      });
    });
  };

  code = async (post) => {
    const postID = post.getAttribute("data-postid");
    this.level = "root";
    const attributes = `[data-postid="${postID}"]`;
    const commentsDisplayer = document.querySelectorAll(
      `.interactions__comments${attributes}`
    )[0];
    const commentsSection = document.querySelectorAll(
      `.postCard__comments${attributes}`
    )[0];

    commentsDisplayer.addEventListener("click", (event) => {
      event.preventDefault();
      commentsSection.classList.toggle("hidden");
    });

    // ##################
    // Comment's upload functionality
    await this.settings(postID, post);
    this.showFrom(postID);
    await this.repliesBtns(postID);
    await this.uploadComment(postID);
  };

  script = async () => {
    if (this.postsCount.length > 0) {
      this.allPosts.forEach(async (post) => {
        await this.code(post);
      });
    } else {
      setTimeout(async () => {
        this.allPosts = document.querySelectorAll(`.postCard`)[0];

        await this.code(this.allPosts);
        // console.log(this.allPosts);
      }, 500);
    }

    commentReactions();
    postReactions();
  };
}

// new postController().script();
export default postController;
