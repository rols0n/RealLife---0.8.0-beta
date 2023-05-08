const mongoose = require("mongoose");
const crypto = require("crypto");

const commentSchema = new mongoose.Schema({
  tree: {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      // required: true,
      default: "lorem ipsum",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },

    reactions: {
      count: { type: Number, default: 0 },
      likes: {
        count: { type: Number, default: 0 },
        users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
      },
      disLikes: {
        count: { type: Number, default: 0 },
        users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
      },
    },

    // level two comments
    replies: [
      {
        author: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          default: "635fb017dac2ef148c0cf38c",
        },
        repliesTo: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          default: "635f93fbdfff1a38f4f31984",
        },
        text: {
          type: String,
          // required: true,
          default: "lorem ipsum",
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },

        reactions: {
          count: { type: Number, default: 0 },
          likes: {
            count: { type: Number, default: 0 },
            users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
          },
          disLikes: {
            count: { type: Number, default: 0 },
            users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
          },
        },
        // level three comments
        subReplies: [
          {
            author: {
              type: mongoose.Schema.ObjectId,
              ref: "User",
              default: "635fb017dac2ef148c0cf38c",
            },
            repliesTo: {
              type: mongoose.Schema.ObjectId,
              ref: "User",
              default: "635f93fbdfff1a38f4f31984",
            },

            repliesToComment: {
              type: mongoose.Schema.ObjectId,
            },

            text: {
              type: String,
              // required: true,
              default: "lorem ipsum",
            },
            createdAt: {
              type: Date,
              default: Date.now(),
            },

            tagsUser: {
              type: mongoose.Schema.ObjectId,
              ref: "User",
            },

            _id: {
              type: mongoose.Schema.Types.ObjectId,

              auto: true,
            },

            reactions: {
              count: { type: Number, default: 0 },
              likes: {
                count: { type: Number, default: 0 },
                users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
              },
              disLikes: {
                count: { type: Number, default: 0 },
                users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
              },
            },
          },
        ],
      },
    ],
  },
});

const Comment = mongoose.model("Comments", commentSchema);

module.exports = Comment;
