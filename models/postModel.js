const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  postText: {
    type: String,
    required: [true, "You have to provide tweet text"],
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now() },

  firstImage: { type: String },
  secondImage: { type: String },
  thirdImage: { type: String },
  fourthImage: { type: String },

  anotherImages: [{ type: String }],

  postImages: [],
  comments: [
    // root
    { type: mongoose.Schema.ObjectId, ref: "Comments" },
  ],

  // place - sets if the post is frin  groupPage or userPage
  place: {
    type: String,
    enum: ["userPage", "groupPage"],
    default: "userPage",
  },
  reactions: {
    count: { type: Number, default: 0 },
    order: [{ type: String, default: ["likes", "disLikes"] }],
    likes: {
      count: { type: Number, default: 0 },
      users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    },

    disLikes: {
      count: { type: Number, default: 0 },
      users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    },
  },

  whoCanSeePost: {
    type: String,
    enum: ["everyone", "friends-only", "friends-and-their-friends-only"],

    default: "everyone",
  },

  whoCanSeeComments: {
    type: String,
    enum: ["everyone", "friends-only", "friends-and-their-friends-only"],

    default: "everyone",
  },

  whoCanInteract: {
    type: String,
    enum: ["everyone", "friends-only", "friends-and-their-friends-only"],

    default: "everyone",
  },

  // users that cant see the post
  cantBeDisplayedBy: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
});

// postSchema.pre("find", function () {
//   this.populate("posts");
// });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
