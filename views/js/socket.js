"use strict";
const socket = new WebSocket("ws://localhost:8080");
import NotificationsController from "./utils/notifications/NotificationsController.js";
const notificationGenerator = new NotificationsController();
notificationGenerator.generateNotifications();

const user = document
  .getElementsByTagName("body")[0]
  .getAttribute("data-loggedUser-id");
const userPageID = document
  .getElementsByTagName("body")[0]
  .getAttribute("data-user-id");

const updateActivity = async (status, userID) => {
  socket.send(
    JSON.stringify({
      eventCategory: "activityStatus",
      eventType: "activityStatus",
      status: status,
      author: userID,
    })
  );
  const raw = JSON.stringify({
    activityStatus: {
      lastTimeOnline: Date.now(),
      status,
    },
  });
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const LINK = `/api/v1/users/${userID}`;
  fetch(LINK, requestOptions);
};

window.onload = () => {
  const userID = document
    .getElementsByTagName("body")[0]
    .getAttribute("data-loggedUser-id");

  // Updating userSchema in DB;
  updateActivity("online", userID);
};

window.addEventListener("beforeunload", (event) => {
  const userID = document
    .getElementsByTagName("body")[0]
    .getAttribute("data-loggedUser-id");

  // Updating userSchema in DB;
  updateActivity("offline", userID);
});

const requestOptions = {
  method: "GET",
  headers: new Headers(),
  redirect: "follow",
  credentials: "same-origin",
};
const response = await fetch(
  `/api/v1/users/${user}?populate=chats&populateType=string`,
  requestOptions
);
const result = await response.json();

socket.onmessage = async function (event) {
  //   console.log("received from server:", JSON.parse(event.data));

  const data = JSON.parse(event.data);

  // if (data.eventType !== "activityStatus") console.log(data);

  if (data.eventType === "notification") {
    if (`${data.sentTo}` === `${user}`) {
      if (`${data.notificationData.author}` === `${userPageID}`) {
        location.reload();
      }

      // Getting the user that send the notification:

      if (result.status !== "success") return;
      const author = result.data.data;
      data.notificationData.author = {
        profileImage: author.profileImage,
        firstName: author.firstName,
        lastName: author.lastName,
        _id: author._id,
      };
      notificationGenerator.generateCard(data.notificationData, "afterbegin");
      notificationGenerator.correctNotiIcon(user);
      notificationGenerator.correctTitle();
    }
  }

  // Managing statuses (online/offline)
  if (data.eventType === "activityStatus") {
    let canContinue = false;
    if (!result.data) return;
    const friends = Array.from(result.data.data.friends);
    const chats = Array.from(result.data.data.chats);

    // Getting IDs of all the users that need the activityStatus of currentlyLoggedUser
    chats.forEach((chat) => {
      friends.push(...chat.users);
    });

    // Removing duplicates
    const userIDs = Array.from(new Set(friends));

    // Looping over friendsNoDupl to check, if the data.author is in it.
    // So we could know, if the request should be managed by currentlyLoggedUser
    userIDs.forEach((userID) => {
      if (`${userID}` === `${data.author}`) canContinue = true;
    });
    if (canContinue === false) return;

    // Changing all the frontend elements with attribute: data-status="offline" to  data-status="online"
    let oppositeStatus = "offline";
    if (data.status === "offline") oppositeStatus = "online";
    const activityCards = Array.from(
      document.querySelectorAll(
        `[data-status="${oppositeStatus}"][data-user-id="${data.author}"]`
      )
    );
    // console.log(activityCards);
    console.log(data);
    activityCards.forEach((card) => {
      card.setAttribute("data-status", data.status);
    });

    // Checking if the card__time elements exists (it is a h3 tag, that shows time that passed f. e.  "8d", "online" or "offline")
    const card__time = document.querySelectorAll(
      `.card__time[data-user-id="${data.author}"]`
    )[0];
    card__time.textContent = data.status;
    card__time.setAttribute("data-status", data.status);
  }
};
