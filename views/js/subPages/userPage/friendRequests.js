const socket = new WebSocket("ws://localhost:8080");

class reqController {
  constructor() {
    this.user = document
      .querySelectorAll(`.body--userPage`)[0]
      .getAttribute("data-loggedUser-id");
    this.userPageID = document
      .querySelectorAll(`.body--userPage`)[0]
      .getAttribute("data-user-id");

    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");
  }

  friendsReq = async function (btn, reqName, socket, user, eventName) {
    const generate_sendBtn = () => {
      this.userDetails.insertAdjacentHTML(
        "beforeend",
        `
                  <div class="topContent__sendFriendRequest">
                      <h1 class="sendFriendRequest__description">Add friend</h1>
                      <img src="/imgs/icons/friends.png" class="topContent__image">
                  </div>
                `
      );
      this.sendFriendsReq = document.getElementsByClassName(
        "topContent__sendFriendRequest"
      );
      this.script();
    };

    if (btn[0]) {
      btn[0].addEventListener("click", async (event) => {
        event.preventDefault();
        const reqReceiverId = document
          .getElementsByClassName(
            "userPage__topContent__userDetails__detailed__name"
          )[0]
          .classList[1].split("_")[1];

        // ###########
        // Sending friend request (all types depending on the *reqName* param)
        let requestOptions = {
          method: "PATCH",
          headers: this.myHeaders,
          redirect: "follow",
          credentials: "same-origin",
        };

        let response = await fetch(
          `http://127.0.0.1:3000/api/v1/users/${reqName}/${reqReceiverId}`,
          requestOptions
        );

        let result = await response.json();
        // ##############

        // Sending notifications
        requestOptions.method = "POST";
        const raw = JSON.stringify({
          eventType: "requests",
          sentTo: this.userPageID,
          eventName: eventName,
          notificationStatus: "new",
        });
        requestOptions.body = raw;

        response = await fetch(
          `http://127.0.0.1:3000/api/v1/notifications/requests/upload`,
          requestOptions
        );
        result = await response.json();
        console.log(result);
        if (result.status !== "success") return;
        requestOptions = {
          method: "PATCH",
          redirect: "follow",
          credentials: "same-origin",
        };

        // ##############

        // ##################
        // Sending data to the client that receives notification
        socket.send(
          JSON.stringify({
            eventCategory: "notification",
            eventName: reqName,
            user,
            sentTo: reqReceiverId,

            notificationData: result.user.notifications[0],
          })
        );

        if (result.status === "success") {
          // ##########
          // Managing buttons
          if (reqName === "sendFriendsRequest") {
            btn[0].remove();
            this.userDetails.insertAdjacentHTML(
              "beforeend",
              `
                    <button class="topContent__cancelRequest btn-red">Cancel Friend Request</button>
                  `
            );

            this.cancelRequestBtn = document.getElementsByClassName(
              "topContent__cancelRequest"
            );

            this.script();
          }

          if (reqName === "acceptFriendsRequest") {
            btn[0].delete();
            this.userDetails.insertAdjacentHTML(
              "beforeend",
              `<button class="topContent__deleteFriend btn-red">Delete friend</button> `
            );
            deleteFriendBtn = document.getElementsByClassName(
              "topContent__deleteFriend"
            );
            // friendsReq(deleteFriendBtn, "deleteFriend", socket, user);
            this.script();
          }

          if (reqName === "rejectFriendsRequest") {
            document.querySelectorAll(`.topContent__buttons`)[0].remove();
            generate_sendBtn();
          }

          if (reqName === "cancelFriendsRequest") {
            btn[0].remove();
            generate_sendBtn();
          }

          if (reqName === "deleteFriend") {
            btn[0].remove();
            generate_sendBtn();
          }
        } else {
          //   console.log(result);
          location.reload();
        }
      });
    }
  };

  script = () => {
    this.sendFriendsReq = document.getElementsByClassName(
      "topContent__sendFriendRequest"
    );
    this.acceptFriendsReq = document.getElementsByClassName(
      "topContent__acceptRequest"
    );
    this.rejectFriendsReq = document.getElementsByClassName(
      "topContent__rejectRequest"
    );
    this.cancelRequestBtn = document.getElementsByClassName(
      "topContent__cancelRequest"
    );
    this.deleteFriendBtn = document.getElementsByClassName(
      "topContent__deleteFriend"
    );

    this.userDetails = document.querySelectorAll(
      `.userPage__topContent__userDetails`
    )[0];

    this.friendsReq(
      this.sendFriendsReq,
      "sendFriendsRequest",
      socket,
      this.user,
      "friendRequestSend"
    );

    // Accept Friends request
    this.friendsReq(
      this.acceptFriendsReq,
      "acceptFriendsRequest",
      socket,
      this.user,
      "friendRequestAccepted"
    );

    // Reject Friends request
    this.friendsReq(
      this.rejectFriendsReq,
      "rejectFriendsRequest",
      socket,
      this.user,

      "friendRequestRejected"
    );

    // Cancel friends request
    this.friendsReq(
      this.cancelRequestBtn,
      "cancelFriendsRequest",
      socket,
      this.user,
      "friendRequestCanceled"
    );

    // Delete friend
    this.friendsReq(
      this.deleteFriendBtn,
      "deleteFriend",
      socket,
      this.user,
      "friendDeleted"
    );
  };
}

// PROFILE PAGE

const requestController = new reqController();

socket.onopen = function () {
  if (document.querySelectorAll(`.body--userPage`)[0]) {
    requestController.script();
  }
};
