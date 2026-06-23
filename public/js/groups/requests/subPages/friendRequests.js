"use strict";

// DOM ELEMENTS

const allBtns = document.getElementsByClassName("userCard__btn");

const LINK = `http://127.0.0.1:3000/api/v1/users`;

const simpleRequest = async (method, link, type, id, raw) => {
  let requestOptions = {
    method,
    redirect: "follow",
    credentials: "same-origin",
  };

  if (raw) {
    requestOptions = {
      method,
      redirect: "follow",
      body: raw,
      credentials: "same-origin",
    };
  }

  const response = await fetch(`${link}/${type}/${id}`, requestOptions);

  const result = await response.json();
  if (result.status === "success") {
    location.reload();
  } else {
    console.log(result);
  }
};

if (allBtns[0] !== undefined) {
  Array.prototype.forEach.call(allBtns, async (btn) => {
    btn.addEventListener("click", async (event) => {
      const type = btn.classList[1].split("--")[1];
      const userID = btn.classList[2].split("_")[1];
      if (type === "add") {
        await simpleRequest("PATCH", LINK, "sendFriendsRequest", userID);
      }

      if (type === "delete") {
        await simpleRequest("PATCH", LINK, "deleteFriend", userID);
      }

      if (type === "cancel") {
        await simpleRequest("PATCH", LINK, "cancelFriendsRequest", userID);
      }

      if (type === "accept") {
        await simpleRequest("PATCH", LINK, "acceptFriendsRequest", userID);
      }

      if (type === "reject") {
        await simpleRequest("PATCH", LINK, "rejectFriendsRequest", userID);
      }
    });
  });
}
