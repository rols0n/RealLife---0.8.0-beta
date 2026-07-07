"use strict";

import NotificationsController from "./utils/notifications/NotificationsController.js";

const SOCKET_URL = "ws://localhost:8080";
const ACTIVITY_ENDPOINT = "/api/v1/users/me/activity";

const body = document.body;

const loggedUserID = body.getAttribute("data-loggedUser-id");
const userPageID = body.getAttribute("data-user-id");

const isLoggedIn =
  loggedUserID &&
  loggedUserID !== "null" &&
  loggedUserID !== "undefined";

const notificationGenerator = new NotificationsController();

notificationGenerator.generateNotifications();


// ====================
// Helpers
// ====================

const getID = (value) => {
  if (!value) return null;

  return String(value._id ?? value);
};


// ====================
// WebSocket
// ====================

const socket = isLoggedIn
  ? new WebSocket(SOCKET_URL)
  : null;

const sendActivitySocketEvent = (status) => {
  if (
    !socket ||
    socket.readyState !== WebSocket.OPEN
  ) {
    return;
  }

  socket.send(
    JSON.stringify({
      eventCategory: "activityStatus",
      eventType: "activityStatus",
      status,
      author: loggedUserID,
    })
  );
};


// ====================
// Activity status
// ====================

const persistActivityStatus = async (
  status,
  { keepalive = false } = {}
) => {
  if (!isLoggedIn) return;

  try {
    await fetch(ACTIVITY_ENDPOINT, {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "same-origin",

      body: JSON.stringify({
        status,
      }),

      keepalive,
    });
  } catch (err) {
    // Request during page unload can fail silently
    if (!keepalive) {
      console.error(
        "Activity status update failed:",
        err
      );
    }
  }
};


// ====================
// Initialize activity
// ====================

if (isLoggedIn) {
  // Save online status in DB
  persistActivityStatus("online");

  // Send realtime online event when socket connects
  socket.addEventListener(
    "open",
    () => {
      sendActivitySocketEvent("online");
    },
    {
      once: true,
    }
  );

  // Save and broadcast offline status
  window.addEventListener("pagehide", () => {
    sendActivitySocketEvent("offline");

    persistActivityStatus("offline", {
      keepalive: true,
    });
  });
}


// ====================
// Logged user data
// ====================

const getLoggedUserData = async () => {
  if (!isLoggedIn) return null;

  try {
    const response = await fetch(
      `/api/v1/users/${loggedUserID}?populate=chats&populateType=string`,
      {
        method: "GET",
        credentials: "same-origin",
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error(
      "Failed to fetch logged user data:",
      err
    );

    return null;
  }
};

const loggedUserResult = await getLoggedUserData();


// ====================
// WebSocket events
// ====================

if (socket) {
  socket.addEventListener(
    "message",
    async (event) => {
      const data = JSON.parse(event.data);


      // ====================
      // Notifications
      // ====================

      if (data.eventType === "notification") {
        if (
          String(data.sentTo) !==
          String(loggedUserID)
        ) {
          return;
        }

        if (
          userPageID &&
          String(data.notificationData.author) ===
            String(userPageID)
        ) {
          location.reload();
          return;
        }

        if (
          loggedUserResult?.status !== "success"
        ) {
          return;
        }

        const author =
          loggedUserResult.data.data;

        data.notificationData.author = {
          profileImage: author.profileImage,
          firstName: author.firstName,
          lastName: author.lastName,
          _id: author._id,
        };

        notificationGenerator.generateCard(
          data.notificationData,
          "afterbegin"
        );

        notificationGenerator.correctNotiIcon(
          loggedUserID
        );

        notificationGenerator.correctTitle();

        return;
      }


      // ====================
      // Activity statuses
      // ====================

      if (
        data.eventType !== "activityStatus"
      ) {
        return;
      }

      if (!loggedUserResult?.data?.data) {
        return;
      }

      const loggedUser =
        loggedUserResult.data.data;

      const friends = loggedUser.friends || [];
      const chats = loggedUser.chats || [];

      const allowedUserIDs = new Set();

      friends.forEach((friend) => {
        const friendID = getID(friend);

        if (friendID) {
          allowedUserIDs.add(friendID);
        }
      });

      chats.forEach((chat) => {
        const chatUsers = chat.users || [];

        chatUsers.forEach((chatUser) => {
          const chatUserID = getID(chatUser);

          if (chatUserID) {
            allowedUserIDs.add(chatUserID);
          }
        });
      });

      const activityUserID =
        String(data.author);

      if (
        !allowedUserIDs.has(activityUserID)
      ) {
        return;
      }


      // ====================
      // Update activity cards
      // ====================

      const oppositeStatus =
        data.status === "online"
          ? "offline"
          : "online";

      const activityCards =
        document.querySelectorAll(
          `[data-status="${oppositeStatus}"][data-user-id="${activityUserID}"]`
        );

      activityCards.forEach((card) => {
        card.setAttribute(
          "data-status",
          data.status
        );
      });


      // ====================
      // Update activity text
      // ====================

      const activityTimes =
        document.querySelectorAll(
          `.card__time[data-user-id="${activityUserID}"]`
        );

      activityTimes.forEach((element) => {
        element.textContent = data.status;

        element.setAttribute(
          "data-status",
          data.status
        );
      });
    }
  );
}