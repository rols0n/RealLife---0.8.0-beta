const User = require("../../models/userModel");
const decodingToken = require("../../utils/decodingToken");

const { asyncHandler } = require("../../middlewares/utils/asyncHandler");
const AppError = require("../../middlewares/utils/AppError");

const hasId = (array = [], id) => {
  return array.some((element) => element.toString() === id.toString());
};

const sendFreshUsers = async (res, userId, targetId, targetKey) => {
  const [freshUser, freshTarget] = await Promise.all([
    User.findById(userId),
    User.findById(targetId),
  ]);

  return res.status(200).json({
    status: "success",
    data: {
      user: freshUser,
      [targetKey]: freshTarget,
    },
  });
};

const addFriends = async (user1, user2) => {
  await Promise.all([
    user1.updateOne({
      $pull: {
        receivedRequests: user2._id,
        sentRequests: user2._id,
      },
      $addToSet: {
        friends: user2._id,
      },
    }),

    user2.updateOne({
      $pull: {
        receivedRequests: user1._id,
        sentRequests: user1._id,
      },
      $addToSet: {
        friends: user1._id,
      },
    }),
  ]);
};

const removeFriendRequest = async (senderId, receiverId) => {
  await Promise.all([
    User.findByIdAndUpdate(senderId, {
      $pull: { sentRequests: receiverId },
    }),

    User.findByIdAndUpdate(receiverId, {
      $pull: { receivedRequests: senderId },
    }),
  ]);
};

const removeFriends = async (userId, friendId) => {
  await Promise.all([
    User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    }),

    User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    }),
  ]);
};

const authAndPullUsers = async (req) => {
  if (!req.params.id) {
    throw new AppError("Missing ID", 400, "WRONG_REQUEST");
  }

  const decoded = await decodingToken(req);

  if (decoded.id === req.params.id) {
    throw new AppError(
      "You can't perform this action on yourself",
      400,
      "SELF_ACTION"
    );
  }

  const [user, requestor] = await Promise.all([
    User.findById(decoded.id),
    User.findById(req.params.id),
  ]);

  if (!user) {
    throw new AppError("User doesn't exist", 404, "USER_NOT_FOUND");
  }

  if (!requestor) {
    throw new AppError("Provided user doesn't exist", 404, "USER_NOT_FOUND");
  }

  return { requestor, user, decoded };
};

module.exports.sendFriendsRequest = asyncHandler(async (req, res, next) => {
  const { requestor: reqReceiver, user, decoded } = await authAndPullUsers(req);

  if (hasId(reqReceiver.friends, user._id)) {
    return next(
      new AppError("These users are already friends", 400, "ALREADY_FRIENDS")
    );
  }

  if (hasId(reqReceiver.receivedRequests, user._id)) {
    return next(
      new AppError("Friend request already sent", 400, "REQUEST_ALREADY_SENT")
    );
  }

  if (hasId(reqReceiver.sentRequests, user._id)) {
    await addFriends(user, reqReceiver);
    return sendFreshUsers(res, decoded.id, req.params.id, "reqReceiver");
  }

  await Promise.all([
    reqReceiver.updateOne({
      $addToSet: { receivedRequests: user._id },
    }),

    user.updateOne({
      $addToSet: { sentRequests: req.params.id },
    }),
  ]);

  return sendFreshUsers(res, decoded.id, req.params.id, "reqReceiver");
});

module.exports.acceptFriendsRequest = asyncHandler(async (req, res, next) => {
  const { requestor: reqSender, user, decoded } = await authAndPullUsers(req);

  if (!hasId(user.receivedRequests, reqSender._id)) {
    return next(
      new AppError("Friend request doesn't exist", 400, "REQUEST_NOT_FOUND")
    );
  }

  await addFriends(user, reqSender);

  return sendFreshUsers(res, decoded.id, req.params.id, "reqSender");
});

module.exports.rejectFriendsRequest = asyncHandler(async (req, res, next) => {
  const { requestor: reqSender, user, decoded } = await authAndPullUsers(req);

  if (!hasId(user.receivedRequests, reqSender._id)) {
    return next(
      new AppError("Friend request doesn't exist", 400, "REQUEST_NOT_FOUND")
    );
  }

  await removeFriendRequest(reqSender._id, user._id);

  return sendFreshUsers(res, decoded.id, req.params.id, "reqSender");
});

module.exports.cancelFriendsRequest = asyncHandler(async (req, res, next) => {
  const { requestor: reqReceiver, user, decoded } = await authAndPullUsers(req);

  if (!hasId(user.sentRequests, reqReceiver._id)) {
    return next(
      new AppError("Friend request doesn't exist", 400, "REQUEST_NOT_FOUND")
    );
  }

  await removeFriendRequest(user._id, reqReceiver._id);

  return sendFreshUsers(res, decoded.id, req.params.id, "reqReceiver");
});

module.exports.deleteFriend = asyncHandler(async (req, res, next) => {
  const { requestor: friend, user, decoded } = await authAndPullUsers(req);

  if (!hasId(user.friends, friend._id)) {
    return next(new AppError("These users aren't friends", 400, "NOT_FRIENDS"));
  }

  await removeFriends(user._id, friend._id);

  return sendFreshUsers(res, decoded.id, req.params.id, "friend");
});

// ###############
// Birthdays

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

module.exports.birthdays = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate({
    path: "friends",
  });

  if (!user) {
    return next(new AppError("User doesn't exist", 404, "USER_NOT_FOUND"));
  }

  const curYear = new Date().getFullYear();

  const bDates = months.map((month) => ({
    name: month,
    data: [],
  }));

  user.friends.forEach((friend) => {
    if (!friend.birthDate) return;

    const [year, month, day] = friend.birthDate.split("-").map(Number);

    bDates[month - 1].data.push({
      user: friend,
      day,
      willBeTheAgeOf: curYear - year,
    });
  });

  bDates.forEach((month) => {
    month.data.sort((a, b) => {
      return a.day - b.day || a.willBeTheAgeOf - b.willBeTheAgeOf;
    });
  });

  res.status(200).json({
    status: "success",
    bDates,
  });
});