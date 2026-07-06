const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const decodingToken = require("../utils/decodingToken");

const { asyncHandler } = require("../middlewares/utils/asyncHandler");
const AppError = require("../middlewares/utils/AppError");

const USER_SELECT =
  "firstName lastName profileImage bannerImage activityStatus";

const populateChatContent = {
  path: "content",
  populate: {
    path: "user",
    select: USER_SELECT,
  },
};

const getLoggedUser = async (req) => {
  const decoded = await decodingToken(req);

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError(
      "You need to be logged in.",
      401,
      "USER_NOT_LOGGED_IN"
    );
  }

  return user;
};

const normalizeChatUsers = (users, loggedUserID) => {
  if (!Array.isArray(users)) {
    throw new AppError(
      `"users" field is required and must be an array.`,
      400,
      "USERS_FIELD_REQUIRED"
    );
  }

  return [
    ...new Set([...users.map((user) => user.toString()), loggedUserID.toString()]),
  ];
};

const validateChatUsersCount = (users) => {
  if (users.length < 2) {
    throw new AppError(
      "Chat requires at least 2 users.",
      400,
      "NOT_ENOUGH_CHAT_USERS"
    );
  }
};

const findChatByUsers = async (users) => {
  return Chat.findOne({
    users: {
      $all: users,
      $size: users.length,
    },
  });
};

const addChatToUsers = async (users, chatID) => {
  await User.updateMany(
    {
      _id: { $in: users },
    },
    {
      $push: {
        chats: {
          $each: [chatID],
          $position: 0,
        },
      },
    }
  );
};

const createChat = async (users) => {
  const chat = await Chat.create({ users });

  await addChatToUsers(users, chat._id);

  return chat;
};

const getChatForUser = async (chatID, userID) => {
  const chat = await Chat.findOne({
    _id: chatID,
    users: userID,
  });

  if (!chat) {
    throw new AppError(
      "User can't manage chats that he's not in.",
      403,
      "USER_NOT_IN_CHAT"
    );
  }

  return chat;
};

const moveChatToTop = async (users, chatID) => {
  await User.updateMany(
    {
      _id: { $in: users },
    },
    {
      $pull: {
        chats: chatID,
      },
    }
  );

  await User.updateMany(
    {
      _id: { $in: users },
    },
    {
      $push: {
        chats: {
          $each: [chatID],
          $position: 0,
        },
      },
    }
  );
};

module.exports.create = asyncHandler(async (req, res) => {
  const loggedUser = await getLoggedUser(req);

  const users = normalizeChatUsers(req.body.users, loggedUser._id);

  validateChatUsersCount(users);

  const existingChat = await findChatByUsers(users);

  if (existingChat) {
    throw new AppError(
      "Chat for those users already exists.",
      409,
      "CHAT_ALREADY_EXISTS"
    );
  }

  const chat = await createChat(users);

  res.status(201).json({
    status: "success",
    data: chat,
  });
});

module.exports.uploadMessage = asyncHandler(async (req, res) => {
  const loggedUser = await getLoggedUser(req);

  const { text, chatID, sentAt } = req.body;

  if (!text || !chatID) {
    throw new AppError(
      `Fields "text" and "chatID" are required.`,
      400,
      "MESSAGE_FIELDS_REQUIRED"
    );
  }

  if (!text.trim()) {
    throw new AppError(
      "Message can't be empty.",
      400,
      "MESSAGE_EMPTY"
    );
  }

  const chat = await getChatForUser(chatID, loggedUser._id);

  const message = {
    user: loggedUser._id,
    text,
    contentType: "message",
  };

  if (sentAt) {
    message.sentAt = sentAt;
  }

  await Chat.updateOne(
    {
      _id: chatID,
    },
    {
      $push: {
        content: {
          $each: [message],
          $position: 0,
        },
      },
    }
  );

  await moveChatToTop(chat.users, chat._id);

  const updatedChat = await Chat.findById(chat._id).populate(
    populateChatContent
  );

  res.status(200).json({
    status: "success",
    data: updatedChat,
  });
});

module.exports.findChat = asyncHandler(async (req, res) => {
  const loggedUser = await getLoggedUser(req);

  const users = normalizeChatUsers(req.body.users, loggedUser._id);

  validateChatUsersCount(users);

  let chat = await findChatByUsers(users);

  if (!chat) {
    chat = await createChat(users);
  }

  await chat.populate(populateChatContent);

  res.status(200).json({
    status: "success",
    chat,
  });
});

module.exports.getChatByID = asyncHandler(async (req, res) => {
  const loggedUser = await getLoggedUser(req);

  const chat = await Chat.findOne({
    _id: req.params.id,
    users: loggedUser._id,
  })
    .populate({
      path: "users",
      select: USER_SELECT,
    })
    .populate(populateChatContent);

  if (!chat) {
    throw new AppError(
      "User can't manage chats that he's not in.",
      403,
      "USER_NOT_IN_CHAT"
    );
  }

  res.status(200).json({
    status: "success",
    data: chat,
  });
});

module.exports.deleteChat = asyncHandler(async (req, res) => {
  const loggedUser = await getLoggedUser(req);

  const chat = await getChatForUser(req.params.id, loggedUser._id);

  await User.updateMany(
    {
      _id: { $in: chat.users },
    },
    {
      $pull: {
        chats: chat._id,
      },
    }
  );

  await Chat.deleteOne({
    _id: chat._id,
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports.getAll = asyncHandler(async (req, res) => {
  const chats = await Chat.find();

  res.status(200).json({
    status: "success",
    data: chats,
  });
});

module.exports.markAsSeen = asyncHandler(async (req, res) => {
  const loggedUser = await getLoggedUser(req);

  const { chatID } = req.body;

  if (!chatID) {
    throw new AppError(
      `Missing field: "chatID".`,
      400,
      "CHAT_ID_REQUIRED"
    );
  }

  await getChatForUser(chatID, loggedUser._id);

  await Chat.updateOne(
    {
      _id: chatID,
    },
    {
      $pull: {
        content: {
          contentType: "seen",
          user: loggedUser._id,
        },
      },
    }
  );

  const chat = await Chat.findOneAndUpdate(
    {
      _id: chatID,
    },
    {
      $push: {
        content: {
          $each: [
            {
              contentType: "seen",
              user: loggedUser._id,
            },
          ],
          $position: 0,
        },
      },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: chat,
  });
});