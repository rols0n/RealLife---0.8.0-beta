const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ["group", "post", "requests"],
    required: [true, "eventType is missing data"],
  },
  eventName: {
    type: String,
    enum: [
      "friendRequestSend",
      "friendRequestCanceled",
      "friendRequestRejected",
      "friendRequestAccepted",
      "friendDeleted",
      "postLike",
      "postDisLike",
      "mentionation",
      "commentLike",
      "commentDisLike",
      "commentReply",
      "groupRequestSent",
      "groupRequestCanceled",
      "groupRequestRejected",
      "groupRequestAccepted",
    ],
    required: true,
  },
  author: { type: mongoose.Schema.ObjectId, ref: "User" },
  users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  lastActivity: {
    type: Date,
    // required: [true, "lastActivity field is required"],
    default: Date.now(),
  },
  notificationStatus: { type: String, enum: ["new", "seen"], required: true },

  // Schemas - depending on the eventType
  sentTo: {
    enum: [
      { type: mongoose.Schema.ObjectId, ref: "User" },
      { type: mongoose.Schema.ObjectId, ref: "Group" },
    ],
  },

  replyData: {
    treeID: { type: mongoose.Schema.ObjectId, ref: "Comments" },
    repliesToCommentID: { type: mongoose.Schema.Types.ObjectId },

    dataLevel: { type: String, enum: ["reply", "subReply"] },
  },
});

const Notifications = mongoose.model("Notifications", notificationSchema);
module.exports = Notifications;
