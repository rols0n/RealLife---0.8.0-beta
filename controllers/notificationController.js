// ##############
// NOTIFICATIONS
const User = require("../models/userModel");
const Notifications = require("../models/notificationModel");
const decodingToken = require("../utils/decodingToken");

const manageNotiReceiverSchema = async (notification) => {
  await User.findOneAndUpdate(
    { _id: notification.sentTo },
    { $push: { notifications: { $each: [notification._id], $position: 0 } } }
  );
  // notiReceiver = notification receiver
  let notiReceiver = await User.findById(notification.sentTo)
    .select("notifications")
    .populate("notifications");

  if (notiReceiver.notifications.length >= 120) {
    let index = notiReceiver.notifications.length;
    for (let i = 85; i < index; i++) {
      index--;
      const notification = notiReceiver.notifications[index];
      const sentTo = notification.sentTo;
      await Notifications.deleteOne({ _id: notification._id });
      await User.findOneAndUpdate(
        { _id: sentTo },
        { $pull: { notifications: notification._id } }
      );
    }
  }
};

const uploadFriendNotification = async (req, res, decoded) => {
  req.body.author = decoded.id;

  const notification = await Notifications.create(req.body);
  if (!notification)
    throw `Something went wrong with creating the notification`;

  manageNotiReceiverSchema(notification);

  res.status(200).json({ status: "success", user: notification.sentTo });
};

const uploadGroupNotification = async (req, res, decoded, groupID) => {
  req.body.group = decoded.id;

  const notification = await Notifications.create(req.body);
  if (!notification)
    throw `Something went wrong with creating the notification`;

  manageNotiReceiverSchema(notification);

  res.status(200).json({ status: "success", user: notification.sentTo });
};

module.exports.upload = async (req, res) => {
  try {
    const { eventName, eventType, sentTo, isGroup } = req.body;
    if (!sentTo) throw `sentTo field is required for creating a  notification`;

    const decoded = await decodingToken(req);
    // if (!isGroup) {
    uploadFriendNotification(req, res, decoded);
    // } else {
    //   uploadGroupNotification(req, res, decoded);
    // }
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.delete = async (req, res) => {
  try {
    if (!req.body.notificationID) throw `You need to specify notificationID`;

    const notification = await Notifications.findById(req.body.notificationID);
    const sentTo = notification.sentTo;
    await Notifications.deleteOne({ _id: req.body.notificationID });
    await User.findOneAndUpdate(
      { _id: sentTo },
      { $pull: { notifications: req.body.notificationID } }
    );
    console.log(sentTo, req.body.notificationID);
    res.status(200).json({});
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.markAllAsSeen = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    let userID = decoded.id;
    if (req.body.user) {
      userID = req.body.user;
    }
    const seen = "seen";
    let user = await User.findById(`${userID}`).select("notifications");

    const notifications = Array.from(user.notifications);
    notifications.forEach(async (notificationID) => {
      await Notifications.findOneAndUpdate(
        { _id: notificationID },
        { notificationStatus: "seen" }
      );
    });

    res.status(200).json({ status: "success", message: "done" });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.getUsersNotifications = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    const user = await User.findById(decoded.id)
      .select("notifications")
      .populate({
        path: "notifications",
        populate: {
          path: "author",
          select: "firstName lastName profileImage",
        },
      });

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};
