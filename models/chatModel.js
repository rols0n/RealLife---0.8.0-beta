const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.ObjectId, ref: "User" }],

  content: [
    {
      contentType: {
        type: String,
        enum: ["message", "date-info", "seen"],
      },

      text: { type: String },
      user: { type: mongoose.Schema.ObjectId, ref: "User" },

      sentAt: { type: Date, default: Date.now() },
    },
  ],
  createdAt: { type: Date, default: Date.now() },
});

const Chats = mongoose.model("Chats", chatSchema);
module.exports = Chats;
