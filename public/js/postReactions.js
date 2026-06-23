"use strict";
const socket = new WebSocket("ws://localhost:8080");
import { basicRequest } from "./utils/_basicRequest.js";
import sendNotification from "./utils/notifications/sendNotification.js";
// DOMS

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
let requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: null,
  redirect: "follow",
  credentials: "same-origin",
};
let requestOptionsDelete = {
  method: "DELETE",
  headers: myHeaders,
  body: null,
  redirect: "follow",
  credentials: "same-origin",
};

const LINK_1 = `http://127.0.0.1:3000/api/v1/posts/addPostsReaction/`;
const LINK_2 = `http://127.0.0.1:3000/api/v1/posts/removePostsReaction/`;

const manageBtns = (btns) => {
  btns.forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      const postID = btn.getAttribute("data-postid");
      const reactionType = btn.getAttribute("data-reaction-type");
      const level = btn.getAttribute("data-level");
      const status = btn.getAttribute("data-status");
      let oppositeStatus = "not-active";
      if (status === "not-active") oppositeStatus = "active";

      let oppositeReaction = "dislike";
      if (reactionType === "dislike") oppositeReaction = "like";

      const counts = Array.from(
        document.querySelectorAll(
          `.interactions__text[data-postid="${postID}"][data-reaction-type="${reactionType}"]`
        )
      );
      const countsOppoiste = Array.from(
        document.querySelectorAll(
          `.interactions__text[data-postid="${postID}"][data-reaction-type="${oppositeReaction}"]`
        )
      );

      const btnOppStatus = document.querySelectorAll(
        `.interactions__reactions[data-postid="${postID}"][data-reaction-type="${reactionType}"][data-status="${oppositeStatus}"]`
      )[0];
      const oppositeBtn = document.querySelectorAll(
        `.interactions__reactions[data-postid="${postID}"][data-reaction-type="${oppositeReaction}"][data-status="not-active"]`
      )[0];
      const oppositeBtnActive = document.querySelectorAll(
        `.interactions__reactions[data-postid="${postID}"][data-reaction-type="${oppositeReaction}"][data-status="active"]`
      )[0];

      const raw = JSON.stringify({
        reaction: reactionType === "dislike" ? "disLike" : "like",
      });

      if (status === "not-active" && btn.classList[-1] !== "hidden") {
        const LINK = `${LINK_1}${postID}`;
        const result = await basicRequest(raw, LINK, requestOptions);

        if (result.status !== "success") {
          window.alert("Something went wrong, couldnt react to the post.");
          console.log(result);
          return;
        }

        const likesCount =
          result.data.postReactions.reactions.likes.users.length;
        const disLikesCount =
          result.data.postReactions.reactions.disLikes.users.length;

        console.log(likesCount, disLikesCount);

        counts.forEach((count) => {
          count.textContent++;
        });

        if (oppositeBtnActive.classList[-1] !== "hidden") {
          countsOppoiste.forEach((count) => {
            if (count.textContent * 1 > 0) {
              count.textContent--;
            }
          });
        }

        const notificationSender = new sendNotification();
        notificationSender.sendPostNoti(postID, false, "postLike", socket);
      }

      if (status === "active") {
        const LINK = `${LINK_2}${postID}`;
        const result = await basicRequest(raw, LINK, requestOptionsDelete);

        if (result.status !== "success") {
          window.alert("Something went wrong, couldnt react to the post.");
          console.log(result);
          return;
        }

        const likesCount = result.data.post.reactions.likes.users.length;
        const disLikesCount = result.data.post.reactions.disLikes.users.length;

        console.log(likesCount, disLikesCount);
        counts.forEach((count) => {
          if (count.textContent * 1 > 0) {
            count.textContent--;
          }
        });
      }
      btn.classList.add("hidden");
      oppositeBtn.classList.remove("hidden");
      oppositeBtnActive.classList.add("hidden");
      btnOppStatus.classList.remove("hidden");
    });
  });
};

const script = () => {
  const allLikeBtns = Array.from(
    document.querySelectorAll(
      `.interactions__reactions[data-reaction-type="like"]`
    )
  );
  const allDislikeBtns = Array.from(
    document.querySelectorAll(
      `.interactions__reactions[data-reaction-type="dislike"]`
    )
  );

  manageBtns(allLikeBtns);
  manageBtns(allDislikeBtns);
};

export default script;
const e2xport = () => {
  const allLikeBtn = Array.from(
    document.querySelectorAll(
      `.interactions__reactions[data-reaction-type="like"]`
    )
  );
  const allDislikeBtn = Array.from(
    document.querySelectorAll(
      `.interactions__reactions[data-reaction-type="dislike"]`
    )
  );

  allLikeBtn.forEach((likeBtn) => {
    likeBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log(likeBtn);
      const postID = likeBtn.getAttribute("data-postid");
      const reactionType = likeBtn.getAttribute("data-reaction-type");
      const level = likeBtn.getAttribute("data-level");
      let status = likeBtn.getAttribute("data-status");
      const disLikeBtn = document.querySelectorAll(
        `.interactions__reactions[data-postid="${postID}"][data-reaction-type="dislike"][data-status="not-active"]`
      )[0];
      const disLikeBtnActive = document.querySelectorAll(
        `.interactions__reactions[data-postid="${postID}"][data-reaction-type="dislike"][data-status="active"]`
      )[0];
      const likeBtnActive = document.querySelectorAll(
        `.interactions__reactions[data-postid="${postID}"][data-reaction-type="like"][data-status="active"]`
      )[0];
      const likeBtnNotActive = document.querySelectorAll(
        `.interactions__reactions[data-postid="${postID}"][data-reaction-type="like"][data-status="not-active"]`
      )[0];

      const raw = JSON.stringify({
        reaction: reactionType,
      });

      if (status === "not-active") {
        const LINK = `${LINK_1}${postID}`;

        const result = await basicRequest(raw, LINK, requestOptions);

        if (result.status !== "success") {
          window.alert("Something went wrong, couldnt react to the post.");
          return;
        }

        likeBtn.classList.add("hidden");
        disLikeBtn.classList.add("hidden");
        disLikeBtnActive.classList.remove("hidden");
        likeBtnActive.classList.remove("hidden");

        const notificationSender = new sendNotification();
        notificationSender.sendPostNoti(postID, false, "postLike", socket);
      }

      if (status === "active") {
        const LINK = `${LINK_2}${postID}`;
        requestOptionsDelete.body = raw;

        const result = await basicRequest(raw, LINK, requestOptionsDelete);

        if (result.status !== "success") {
          window.alert("Something went wrong, couldnt react to the post.");
          return;
        }

        likeBtn.classList.add("hidden");
        disLikeBtn.classList.add("hidden");
        disLikeBtnActive.classList.remove("hidden");
        likeBtnNotActive.classList.remove("hidden");
      }
    });
  });

  // allDislikeBtn.forEach((dislikeBtn) => {
  //   dislikeBtn.addEventListener("click", async (event) => {
  //     event.preventDefault();
  //     const postID = dislikeBtn.getAttribute("data-postid");
  //     let status = dislikeBtn.getAttribute("data-status");
  //     const reactionType = dislikeBtn.getAttribute("data-reaction-type");
  //     const likeBtn = document.querySelectorAll(
  //       `.interactions__reactions[data-postid="${postID}"][data-reaction-type="like"][data-status="not-active"]`
  //     )[0];
  //     const likeBtnActive = document.querySelectorAll(
  //       `.interactions__reactions[data-postid="${postID}"][data-reaction-type="like"][data-status="active"]`
  //     )[0];
  //     const disLikeBtnActive = document.querySelectorAll(
  //       `.interactions__reactions[data-postid="${postID}"][data-reaction-type="dislike"][data-status="active"]`
  //     )[0];
  //     const disLikeBtnNotActive = document.querySelectorAll(
  //       `.interactions__reactions[data-postid="${postID}"][data-reaction-type="dislike"][data-status="not-active"]`
  //     )[0];
  //     const raw = JSON.stringify({
  //       reaction: "disLike",
  //     });
  //     requestOptions.body = raw;
  //     requestOptionsDelete.body = raw;

  //     if (status === "active") {
  //       const LINK = `${LINK_2}${postID}`;
  //       const result = await basicRequest(raw, LINK, requestOptionsDelete);
  //       console.log(result);

  //       if (result.status !== "success") {
  //         window.alert("Something went wrong, couldnt react to the post.");
  //         return;
  //       }

  //       dislikeBtn.classList.add("hidden");
  //       likeBtnActive.classList.add("hidden");
  //       likeBtn.classList.remove("hidden");
  //       disLikeBtnNotActive.classList.remove("hidden");
  //     }

  //     if (status === "not-active") {
  //       dislikeBtn.classList.add("hidden");
  //       likeBtnActive.classList.add("hidden");
  //       likeBtn.classList.remove("hidden");
  //       disLikeBtnActive.classList.remove("hidden");

  //       const LINK = `${LINK_1}${postID}`;
  //       const result = await basicRequest(raw, LINK, requestOptions);

  //       if (result.status !== "success") {
  //         window.alert("Something went wrong, couldnt react to the post.");
  //         return;
  //       }
  //       const notificationSender = new sendNotification();
  //       notificationSender.sendPostNoti(postID, false, "postDisLike", socket);
  //     }
  //   });
  // });
};
