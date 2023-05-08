"use strict";

import { basicRequest } from "./utils/_basicRequest.js";
import sendNotification from "./utils/notifications/sendNotification.js";
const socket = new WebSocket("ws://localhost:8080");

// DOMS

const LINK_REACT = `http://127.0.0.1:3000/api/v1/comments/reactToComment/`;
const LINK_REMOVE = `http://127.0.0.1:3000/api/v1/comments/removeReaction/`;
const headers = new Headers();
headers.append("Content-Type", "application/json");

export default () => {
  const allBtns = Array.from(document.querySelectorAll(`.interactions__card`));

  allBtns.forEach((btn) => {
    const commentID = btn.getAttribute("data-comment-id");
    const status = btn.getAttribute("data-interactions-status");
    const type = btn.getAttribute("data-interactions-type");
    const level = btn.getAttribute("data-level");
    const postID = btn.getAttribute("data-postid");
    const treeID = btn.getAttribute("data-tree-id");
    const authorID = btn.getAttribute("data-author-id");
    const repliesToUser = btn.getAttribute("data-replies-to-user");
    const repliesToComment = btn.getAttribute("data-replies-to-comment");
    let opposite = "like";
    let oppositeStatus = "not-active";
    let eventName = "commentDisLike";
    if (type === "like") {
      opposite = "disLike";
      eventName = `commentLike`;
    }
    if (status === "not-active") oppositeStatus = "active";

    const oppositeBtn = document.querySelectorAll(
      `.interactions__card[data-interactions-status="not-active"][data-comment-id="${commentID}"][data-interactions-type="${opposite}"][data-level="${level}"][data-postid="${postID}"][data-tree-id="${treeID}"]`
    );
    const oppositeBtnActive = document.querySelectorAll(
      `.interactions__card[data-interactions-status="active"][data-comment-id="${commentID}"][data-interactions-type="${opposite}"][data-level="${level}"][data-postid="${postID}"][data-tree-id="${treeID}"]`
    );
    const btnOppositeStatus = document.querySelectorAll(
      `.interactions__card[data-interactions-status="${oppositeStatus}"][data-comment-id="${commentID}"][data-interactions-type="${type}"][data-level="${level}"][data-postid="${postID}"][data-tree-id="${treeID}"]`
    )[0];
    const cardTexts = document.querySelectorAll(
      `.card__text[data-comment-id="${commentID}"][data-interactions-type="${type}"][data-level="${level}"][data-postid="${postID}"][data-tree-id="${treeID}"`
    );
    const oppositeCardTexts = document.querySelectorAll(
      `.card__text[data-comment-id="${commentID}"][data-interactions-type="${opposite}"][data-level="${level}"][data-postid="${postID}"][data-tree-id="${treeID}"`
    );

    const requestOptions = {
      method: "POST",
      headers: headers,
      redirect: "follow",
      credentials: "same-origin",
    };
    const requestOptionsDelete = {
      method: "DELETE",
      headers: headers,
      redirect: "follow",
      credentials: "same-origin",
    };
    const raw = JSON.stringify({
      level: level === "subReply_" ? "subReply" : level,
      author: authorID,
      reactionType: type,
      commentID: commentID,
      repliesToUser,
      repliesToComment,
    });

    const raw_opposite = JSON.stringify({
      level: level === "subReply_" ? "subReply" : level,
      author: authorID,
      reactionType: opposite,
      commentID: commentID,
      repliesToUser: repliesToUser,
      repliesToComment: repliesToComment,
    });

    btn.addEventListener("click", async (event) => {
      event.preventDefault();

      if (oppositeBtnActive[0].classList[3] !== "hidden") {
        const result = await basicRequest(
          raw_opposite,
          `${LINK_REMOVE}${treeID}`,
          requestOptionsDelete,
          "removing reacting to the comment",
          true,
          true
        );

        if (result.status === "success") {
          oppositeCardTexts[0].textContent--;
          if (oppositeCardTexts[0].textContent < 0) {
            oppositeCardTexts[0].textContent = 0;
          }

          oppositeCardTexts[1].textContent--;
          if (oppositeCardTexts[1].textContent < 0) {
            oppositeCardTexts[1].textContent = 0;
          }
        }
      }
      if (status === "not-active") {
        const result = await basicRequest(
          raw,
          `${LINK_REACT}${treeID}`,
          requestOptions,
          "reacting to the comment",
          true,
          true
        );

        if (result.status === "success") {
          cardTexts[0].textContent++;
          if (cardTexts[0].textContent < 0) {
            cardTexts[0].textContent = 0;
          }
          cardTexts[1].textContent++;
          if (cardTexts[1].textContent < 0) {
            cardTexts[1].textContent = 0;
          }
        }

        const notificationSender = new sendNotification();
        notificationSender.sendPostNoti(postID, authorID, eventName, socket);
      } else {
        const result = await basicRequest(
          raw,
          `${LINK_REMOVE}${treeID}`,
          requestOptionsDelete,
          "removing reacting to the comment",
          true,
          true
        );

        if (result.status === "success") {
          cardTexts[0].textContent--;
          if (cardTexts[0].textContent < 0) {
            cardTexts[0].textContent = 0;
          }
          cardTexts[1].textContent--;
          if (cardTexts[1].textContent < 0) {
            cardTexts[1].textContent = 0;
          }
        }
      }

      oppositeBtnActive[0].classList.add("hidden");
      oppositeBtn[0].classList.remove("hidden");
      btn.classList.add("hidden");
      btnOppositeStatus.classList.remove("hidden");
    });
  });
};
