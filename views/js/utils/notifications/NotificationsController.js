// import basicRequest from "../../utils/_basicRequest.js";
import calcTimePassed from "../post/utils/calcTimePassed.js";

class NotificationsController {
  constructor() {
    this.notificationsContainer = document.querySelectorAll(
      `.navbar__cards[data-root-parent-name="navbar__menu"]`
    )[0];
    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");
    this.newNotiCount = 0;

    this.notificationsIcon = document.querySelectorAll(
      `.navbar__notificationsIcon`
    )[0];
    this.hotNotificationIcon = document.querySelectorAll(
      `.navbar__hotNotifications`
    )[0];

    this.requestOptions = {
      method: "GET",
      headers: this.myHeaders,

      redirect: "follow",
      credentials: "same-origin",
    };
  }
  //###################
  // HELPERS

  getUserNotifications = async () => {
    this.LINK = `http://127.0.0.1:3000/api/v1/notifications/getUsersNotifications`;
    const response = await fetch(this.LINK, this.requestOptions);
    const result = await response.json();
    if (result.status !== "success") return "error";
    return result.data;
  };

  generateCardText = (notification) => {
    this.iconPath = `/imgs/icons/thumbsUp-filled-white.png`;
    switch (notification.eventName) {
      case "friendRequestSend": {
        this.cardText = "sent you a friend request";
        this.iconPath = `/imgs/icons/user-plus-white.png`;
        break;
      }

      case "friendRequestCanceled": {
        this.cardText = "canceled friend request.";
        this.iconPath = `/imgs/icons/user-minus-white.png`;
        break;
      }

      case "friendRequestRejected": {
        this.cardText = "rejected your friend request.";
        this.iconPath = `/imgs/icons/user-minus-white.png`;
        break;
      }

      case "friendRequestAccepted": {
        this.cardText = "accepted your friend request.";
        this.iconPath = `/imgs/icons/user-plus-white.png`;
        break;
      }

      case "friendDeleted": {
        this.cardText = "deleted you from friend list.";
        this.iconPath = `/imgs/icons/user-minus-white.png`;
        break;
      }

      case "postLike": {
        this.cardText = "liked your post.";
        break;
      }

      case "postDisLike": {
        this.cardText = "disLiked your post.";
        this.iconPath = `/imgs/icons/thumbs-down-filled-white.png`;
        break;
      }

      case "mention": {
        this.cardText = "mentioned you in a comment.";
        break;
      }

      case "commentLike": {
        this.cardText = "liked your commment.";
        break;
      }
      case "commentDisLike": {
        this.cardText = "disLiked your commment.";
        this.iconPath = `/imgs/icons/thumbs-down-filled-white.png`;
        break;
      }

      case "commentReply": {
        this.cardText = "Replied to your commment.";
        this.iconPath = `/imgs/icons/thumbs-down-filled-white.png`;
        break;
      }

      case "groupRequestSent": {
        this.cardText = "asked you for joining them.";
        this.iconPath = `/imgs/icons/users-three-fill.png`;
        break;
      }

      case "groupRequestCanceled": {
        this.cardText = "canceled their request.";
        this.iconPath = `/imgs/icons/users-three-fill.png`;
        break;
      }

      case "groupRequestRejected": {
        this.cardText = "rejected your request.";
        this.iconPath = `/imgs/icons/users-three-fill.png`;
        break;
      }

      case "groupRequestAccepted": {
        this.cardText = "accepted your request.";
        this.iconPath = `/imgs/icons/users-three-fill.png`;
        break;
      }
    }
  };

  correctTitle = () => {
    let count = this.newNotiCount;
    if (count === 0) {
      count = "";
    }

    document.querySelectorAll(`.hotNotifications__count`)[0].textContent =
      count;

    count = `(${count})` === "()" ? "" : `(${count})`;
    const title = `${count} Real Life | ${
      document.title.split("Real Life |")[1]
    }`;
    document.title = title;
  };

  correctNotiIcon = async (id) => {
    if (this.newNotiCount > 0) {
      this.notificationsIcon.classList.add("hidden");
      this.hotNotificationIcon.classList.remove("hidden");
      this.LINK = `http://127.0.0.1:3000/api/v1/notifications/markAllAsSeen`;
      const raw = JSON.stringify({ user: id });
      const requestOptions = this.requestOptions;
      (requestOptions.method = "PATCH"), (requestOptions.body = raw);
      const response = await fetch(this.LINK, requestOptions);
      const result = await response.json();
      if (result.status !== "success") return "error";
      this.newNotiCountl;
      document.querySelectorAll(`.hotNotifications__count`)[0].textContent =
        this.newNotiCount;

      const title = `Real Life | ${document.title.split("Real Life |")[1]}`;
      document.title = title;
      // return result.data;
    }
  };
  // #####################

  generateCard = (notification, place) => {
    this.generateCardText(notification);

    const author = notification.author;

    if (notification.notificationStatus === "new") this.newNotiCount++;

    const timePassed = calcTimePassed(
      "",
      new Date(notification.lastActivity)
    ).shortString;

    const htmlELEM = `
      <a href="/x">
        
        <div class="menu__card" data-card-type="notification">
          <div class="card__left">
            <img class="card__avatar" src="${author.profileImage}">
          </div>
          <img class="card__icon"  data-card-type="notification" src="${
            this.iconPath
          }">
          <div class="card__right">
            <h3 class="card__text" data-card-type="notification">
            <span class="card__user" data-card-type="notification">${
              author.firstName + " " + author.lastName
            }</span> ${this.cardText} | ${timePassed}
            </h3>
          </div>

          </div>
      </a>
      `;

    // const htmlELEM = "";

    if (!place) {
      place = "beforeend";
    }
    this.notificationsContainer.insertAdjacentHTML(place, htmlELEM);
  };

  generateNotifications = async () => {
    this.allNotifications = await this.getUserNotifications();
    if (this.allNotifications === "error") {
      // window.alert(`Something went wrong with generating notifications.`);
      return;
    }
    const notifications = Array.from(this.allNotifications.notifications);

    notifications.forEach((notification) => {
      if (notification !== undefined) {
        this.generateCard(notification);
      }
    });

    // this.notificationsContainer.style = "flex-direction: column-reverse";
    this.correctNotiIcon(this.allNotifications._id);
    this.correctTitle();
  };
}

export default NotificationsController;
