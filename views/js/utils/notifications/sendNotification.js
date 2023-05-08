class sendNotification {
  constructor() {
    this.user = document
      .getElementsByTagName(`body`)[0]
      .getAttribute("data-loggedUser-id");

    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");
  }

  sendPostNoti = async (
    postID,
    postAuthor,
    eventName,
    socket,
    replyData,
    groupID
  ) => {
    if (!postAuthor)
      postAuthor = document
        .querySelectorAll(`.postCard__author[data-postID="${postID}"]`)[0]
        .getAttribute("data-post-author-id");

    if (`${postAuthor}` === `${this.user}`) return;

    const raw_notification = JSON.stringify({
      eventType: "post",
      sentTo: postAuthor,
      eventName: eventName,
      notificationStatus: "new",
    });

    const requestOptions = {
      method: "POST",
      headers: this.myHeaders,
      body: raw_notification,
      redirect: "follow",
      credentials: "same-origin",
    };

    const response_notification = await fetch(
      `/api/v1/notifications/requests/upload`,
      requestOptions
    );
    const result_notification = await response_notification.json();
    console.log("done");
    if (result_notification.status !== "success") return;

    let raw = {
      eventCategory: "notification",
      eventName: eventName,
      user: this.user,
      sentTo: postAuthor,

      notificationData: result_notification.user.notifications[0],
    };

    if (groupID) {
      raw = {
        eventCategory: "notification",
        eventName: eventName,
        group: groupID,
        sentTo: postAuthor,

        notificationData: result_notification.user.notifications[0],
      };
    }
    if (replyData) {
      raw.replyData = replyData;
    }
    socket.send(JSON.stringify(raw));
  };
}

export default sendNotification;
