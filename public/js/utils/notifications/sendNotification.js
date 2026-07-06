class sendNotification {
  constructor() {
    this.user = document.body.getAttribute("data-loggedUser-id");

    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");
  }

  isValidObjectId = (id) => {
    return /^[a-f\d]{24}$/i.test(String(id));
  };

  getPostAuthorId = (postID) => {
    const authorElement = document.querySelector(
      `.postCard__author[data-postID="${postID}"]`
    );

    if (!authorElement) {
      console.error(`Post author element not found for postID: ${postID}`);
      return null;
    }

    return authorElement.getAttribute("data-post-author-id");
  };

  sendPostNoti = async (
    postID,
    postAuthor,
    eventName,
    socket,
    replyData,
    groupID
  ) => {
    const receiverId = postAuthor || this.getPostAuthorId(postID);

    console.log("notification receiverId:", receiverId);

    if (!receiverId) return;

    if (!this.isValidObjectId(receiverId)) {
      console.error("Invalid notification receiver ID:", receiverId);
      return;
    }

    if (receiverId.toString() === this.user.toString()) return;

    const rawNotification = JSON.stringify({
      eventType: "post",
      sentTo: receiverId,
      eventName,
      notificationStatus: "new",
    });

    const requestOptions = {
      method: "POST",
      headers: this.myHeaders,
      body: rawNotification,
      redirect: "follow",
      credentials: "same-origin",
    };

    const response = await fetch(
      `/api/v1/notifications/requests/upload`,
      requestOptions
    );

    const result = await response.json();

    if (result.status !== "success") {
      console.error("Notification request failed:", result);
      return;
    }

    console.log(result)
    const socketPayload = {
      eventCategory: "notification",
      eventName,
      sentTo: receiverId,
      notificationData: result.user.notifications[0],
    };

    if (groupID) {
      socketPayload.group = groupID;
    } else {
      socketPayload.user = this.user;
    }

    if (replyData) {
      socketPayload.replyData = replyData;
    }

    socket.send(JSON.stringify(socketPayload));
  };
}

export default sendNotification;