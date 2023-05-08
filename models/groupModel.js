const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "You have to provide group's name"],
    // unique: [true, "Group with this name already exists"],
  },

  avatarImage: { type: String, default: "/imgs/icons/home-white.png" },
  bannerImage: { type: String, default: "/imgs/icons/home-white.png" },
  settings: {
    privacy: {
      type: String,
      enum: ["private", "public-interactions-off", "public-interactions-on"],
      default: "private",
    },
    visibility: {
      type: String,
      enum: [
        "anyone-can-find",
        "members-only",
        "members-and-their-friends-only",
      ],
      default: "anyone-can-find",
    },
    requests: {
      type: String,
      enum: ["anyone-can-send", "only-friends-of-members-and-members"],

      default: "anyone-can-send",
    },
  },

  administration: {
    admins: [
      {
        _id: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        since: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    moderators: [
      {
        _id: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        since: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  members: [
    {
      _id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: ["admin", "moderator", "user"],
        default: "user",
      },
      since: {
        type: Date,
        default: Date.now(),
      },
    },
  ],

  rules: [
    {
      number: { type: Number },
      heading: { type: String },
      description: { type: String },
    },
  ],

  bannedUsers: [
    {
      _id: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
      at: { type: Date, default: Date.now() },
      till: { type: Date, required: [true, "You have to provide ban time"] },
      bannedBy: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    },
  ],

  groupType: {
    type: String,
    enum: ["private", "public", "semi-public"],
    default: "private",
  },

  requests: {
    received: [
      {
        date: { type: Date, default: Date.now() },
        user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
      },
    ],
    sent: [
      {
        date: { type: Date, default: Date.now() },
        user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
      },
    ],
  },

  posts: [
    {
      _id: {
        type: mongoose.Schema.ObjectId,
        ref: "Post",
      },

      privacy: {
        type: String,
        enum: [
          "private",
          "public-interactions-off",
          "public-interactions-on",
          "friends-only",
          "members-only",
          "except-choosed-users",
        ],

        default: "public-interactions-off",
      },

      // users that cant see the post
      cantBeDisplayedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    },
  ],

  images: {},
  description: { type: String },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Groups = mongoose.model("Groups", groupSchema);

module.exports = Groups;
