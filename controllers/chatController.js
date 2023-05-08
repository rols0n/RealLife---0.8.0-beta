const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const decodingToken = require("../utils/decodingToken");

module.exports.create = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    let loggedUser = await User.findById(decoded.id);
    let { users } = req.body;
    if (!loggedUser) throw `You need to be logged in.`;
    users.push(decoded.id);

    // Removing duplicates in users array
    users = Array.from(new Set(users));

    if (!users || users.length < 2)
      throw `Chat can't be created for only 1 user. It requires at least 2 users.`;

    if (await Chat.findOne({ users: { $all: users } })) {
      throw `Chat for those users already exists`;
    }

    // Creating chat schema
    let chat = await Chat.create({ users });

    // Looping over provided users in req.body
    Array.from(users).forEach(async (user) => {
      await User.findByIdAndUpdate(user, {
        $push: { chats: { $each: [chat._id], $position: 0 } },
      });
    });
    chat = await Chat.findOne({ _id: chat._id });

    res.status(200).json({ status: "success", data: chat });
  } catch (err) {
    res.status(404).json({ status: "fail", err });
  }
};

module.exports.uploadMessage = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    const loggedUser = await User.findById(decoded.id);
    if (!loggedUser) throw `You need to be logged in.`;
    const { text, chatID, sentAt } = req.body;
    if (!text || !chatID) throw `Fields: "text" and "chatID" are required.`;
    if (text.length < 1) {
      throw `Message cant be empty.`;
    }

    let chat = await Chat.findOne({
      _id: chatID,
      users: { $all: decoded.id },
    });
    if (!chat) throw "User can't manage chats that he's not in.";
    const queryObj = {
      user: loggedUser._id,
      text: text,
      contentType: "message",
    };
    if (sentAt) queryObj.sentAt = sentAt;

    chat = await Chat.findOneAndUpdate(
      { _id: chatID },
      {
        $push: {
          content: {
            $each: [queryObj],
            $position: 0,
          },
        },
      }
    );

    const { users } = chat;

    // Moving the chat._id to the user.chats[0],
    // cause it is the newest message
    Array.from(users).forEach(async (user) => {
      await User.updateOne({ _id: user }, { $pull: { chats: chat._id } });
      await User.updateOne(
        { _id: user },
        { $push: { chats: { $each: [chat._id], $position: 0 } } }
      );
    });

    chat = await Chat.findById(chat._id).populate({
      path: "content",
      populate: {
        path: "user",
        select: "firstName lastName profileImage bannerImage activityStatus ",
      },
    });
    res.status(200).json({ status: "success", data: chat });
  } catch (err) {
    res.status(404).json({ status: "fail", err });
  }
};

module.exports.findChat = async (req, res) => {
  try {
    // USECASE:
    // This module is used for finding the conversation (chat) based by query of provided userID's,
    // and if it doesnt find the converstation (chat), then it creates one and returns it
    const decoded = await decodingToken(req);
    const loggedUser = await User.findById(decoded.id);
    if (!loggedUser) throw `You need to be logged in.`;
    let { users } = req.body;

    if (!users) throw `"users" field is required.`;
    users.push(decoded.id);

    // Removing duplicates in users array
    users = Array.from(new Set(users));
    if (users.length < 2)
      throw `Chat can't be found for only 1 id in "users" field. It requires at least 2 users.`;
    let chat = await Chat.findOne({ users: { $all: users } }).populate({
      path: "content",
      populate: {
        path: "user",
        select: "firstName lastName profileImage bannerImage activityStatus ",
      },
    });

    if (!chat) {
      // Creating chat
      chat = await Chat.create({ users }).populate({
        path: "content",
        populate: {
          path: "user",
          select: "firstName lastName profileImage bannerImage  activityStatus",
        },
      });
    }

    res.status(200).json({ status: "success", chat });
  } catch (err) {
    res.status(404).json({ status: "fail", err });
  }
};

module.exports.getChatByID = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    let loggedUser = await User.findById(decoded.id);
    let chatID = req.params.id;
    if (!loggedUser) throw { code: 401, err: `You need to be logged in.` };
    const chat = await Chat.findOne({
      _id: chatID,
      users: { $all: decoded.id },
    })
      .populate({
        path: "users",
        select: "firstName lastName profileImage bannerImage activityStatus",
      })
      .populate({
        path: "content",
        populate: {
          path: "user",
          select: "firstName lastName profileImage bannerImage activityStatus",
        },
      });
    if (!chat)
      throw { code: 401, err: "User can't manage chats that he's not in." };

    res.status(200).json({ status: "success", data: chat });
  } catch ({ code, err }) {
    console.log(err);
    const codeValid = code !== undefined ? code : 400;
    res.status(codeValid).json({
      status: "fail",
      err: err === undefined ? "Not found." : err,
    });
  }
};

module.exports.deleteChat = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    const loggedUser = await User.findById(decoded.id);
    if (!loggedUser) throw `You need to be logged in.`;
    const chat = await Chat.findOne({
      _id: req.params.id,
      users: loggedUser._id,
    });

    if (!chat) throw `User is not a part of the conversation`;

    const { users } = chat;
    Array.from(users).forEach(async (user) => {
      await User.updateOne({ _id: user }, { $pull: { chats: chat._id } });
    });

    await Chat.deleteOne({ _id: chat._id });

    res.status(200).json({});
  } catch (err) {
    res.status(404).json({ status: "fail", err });
  }
};

module.exports.getAll = async (req, res) => {
  res.status(200).json({ status: "success", data: await Chat.find() });
};

module.exports.markAsSeen = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    let loggedUser = await User.findById(decoded.id);
    let { chatID } = req.body;
    if (!loggedUser) throw { code: 401, err: `You need to be logged in.` };

    if (!chatID) throw { code: 400, err: `Missing content: "chatID".` };
    let chat = await Chat.findOne({
      _id: chatID,
      users: { $all: decoded.id },
    });
    if (!chat)
      throw { code: 401, err: "User can't manage chats that he's not in." };

    await Chat.findOneAndUpdate(
      { _id: chatID },
      { $pull: { content: { contentType: "seen", user: decoded.id } } }
    );

    await Chat.findOneAndUpdate(
      { _id: chatID },
      {
        $push: {
          content: {
            $each: [{ contentType: "seen", user: decoded.id }],
            $position: 0,
          },
        },
      }
    );
    chat = await Chat.findById(chatID);

    res.status(200).json({ status: "success", data: chat });
  } catch ({ code, err }) {
    console.log(err);
    const codeValid = code !== undefined ? code : 400;
    res.status(codeValid).json({
      status: "fail",
      err: err === undefined ? "Not found." : err,
    });
  }
};
