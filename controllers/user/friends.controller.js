const User = require("../../models/userModel");
const decodingToken = require("../../utils/decodingToken");

const asyncHandler = require("../../middlewares/utils/asyncHandler");

const AppError = require("../../middlewares/utils/AppError");

const isInArray = (array, id) => {
  return array.some((element) => element.toString() === id.toString());
};

const addFriends = async (User1, User2) => {
  const fixUser = async (user, user2Id) => {
    await user.updateOne({
      $pull: {
        receivedRequests: user2Id,
        sentRequests: user2Id,
      },

      $addToSet: {
        friends: user2Id,
      },
    });
  };

  await fixUser(User1, User2._id);
  await fixUser(User2, User1._id);
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

  const user = await User.findById(decoded.id);
  const requestor = await User.findById(req.params.id);

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

  if (isInArray(reqReceiver.friends, user._id)) {
    return next(
      new AppError("These users are already friends", 400, "ALREADY_FRIENDS")
    );
  }

  if (isInArray(reqReceiver.receivedRequests, user._id)) {
    return next(
      new AppError("Friend request already sent", 400, "REQUEST_ALREADY_SENT")
    );
  }

  if (isInArray(reqReceiver.sentRequests, user._id)) {
    await addFriends(user, reqReceiver);

    const freshUser = await User.findById(decoded.id);
    const freshReqReceiver = await User.findById(req.params.id);

    return res.status(200).json({
      status: "success",

      data: {
        user: freshUser,
        reqReceiver: freshReqReceiver,
      },
    });
  }

  await reqReceiver.updateOne({
    $addToSet: { receivedRequests: user._id },
  });

  await user.updateOne({
    $addToSet: { sentRequests: req.params.id },
  });

  const freshUser = await User.findById(decoded.id);
  const freshReqReceiver = await User.findById(req.params.id);

  res.status(200).json({
    status: "success",

    data: {
      user: freshUser,
      reqReceiver: freshReqReceiver,
    },
  });
});

module.exports.acceptFriendsRequest = asyncHandler(async (req, res, next) => {
  const { requestor: reqSender, user, decoded } = await authAndPullUsers(req);

  if (!isInArray(user.receivedRequests, reqSender._id)) {
    return next(
      new AppError("Friend request doesn't exist", 400, "REQUEST_NOT_FOUND")
    );
  }

  await addFriends(user, reqSender);

  const freshUser = await User.findById(decoded.id);
  const freshReqSender = await User.findById(req.params.id);

  res.status(200).json({
    status: "success",

    data: {
      user: freshUser,
      reqSender: freshReqSender,
    },
  });
});

module.exports.rejectFriendsRequest = asyncHandler(async (req, res, next) => {
  const { requestor: reqSender, user, decoded } = await authAndPullUsers(req);

  if (!isInArray(user.receivedRequests, reqSender._id)) {
    return next(
      new AppError("Friend request doesn't exist", 400, "REQUEST_NOT_FOUND")
    );
  }

  await User.findByIdAndUpdate(decoded.id, {
    $pull: { receivedRequests: reqSender._id },
  });

  await User.findByIdAndUpdate(req.params.id, {
    $pull: { sentRequests: user._id },
  });

  res.status(200).json({
    status: "success",

    data: {
      user: await User.findById(decoded.id),
      reqSender: await User.findById(req.params.id),
    },
  });
});

module.exports.cancelFriendsRequest = asyncHandler(async (req, res, next) => {
  const { requestor: reqReceiver, user, decoded } = await authAndPullUsers(req);

  if (!isInArray(user.sentRequests, reqReceiver._id)) {
    return next(
      new AppError("Friend request doesn't exist", 400, "REQUEST_NOT_FOUND")
    );
  }

  await User.findByIdAndUpdate(decoded.id, {
    $pull: { sentRequests: reqReceiver._id },
  });

  await User.findByIdAndUpdate(req.params.id, {
    $pull: { receivedRequests: user._id },
  });

  res.status(200).json({
    status: "success",

    data: {
      user: await User.findById(decoded.id),
      reqReceiver: await User.findById(req.params.id),
    },
  });
});

module.exports.deleteFriend = asyncHandler(async (req, res, next) => {
  const { requestor: friend, user, decoded } = await authAndPullUsers(req);

  if (!isInArray(user.friends, friend._id)) {
    return next(new AppError("These users aren't friends", 400, "NOT_FRIENDS"));
  }

  await User.findByIdAndUpdate(decoded.id, {
    $pull: { friends: friend._id },
  });

  await User.findByIdAndUpdate(req.params.id, {
    $pull: { friends: user._id },
  });

  res.status(200).json({
    status: "success",

    data: {
      user: await User.findById(decoded.id),
      friend: await User.findById(req.params.id),
    },
  });
});

// ###############

// Birthdays

const sortObj = (obj, path, value) => {
  obj.forEach((element) => {
    element[path].sort(function (a, b) {
      return a[value] - b[value];
    });
  });
};

module.exports.birthdays = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: "friends",
    })
    .sort({ "friends.birthDate": -1 });

  if (!user) {
    return next(new AppError("User doesn't exist", 404, "USER_NOT_FOUND"));
  }

  const friends = Array.from(user.friends);

  const bDates = [
    { name: "January", data: [] },
    { name: "February", data: [] },
    { name: "March", data: [] },
    { name: "April", data: [] },
    { name: "May", data: [] },
    { name: "June", data: [] },
    { name: "July", data: [] },
    { name: "August", data: [] },
    { name: "September", data: [] },
    { name: "October", data: [] },
    { name: "November", data: [] },
    { name: "December", data: [] },
  ];

  // Signing users to bDates obj based on their bDate
  friends.forEach((friend) => {
    if (!friend.birthDate) return;

    const year = friend.birthDate.split("-")[0] * 1;
    const curYear = new Date(Date.now()).getFullYear();

    const month = friend.birthDate.split("-")[1] * 1;
    const day = friend.birthDate.split("-")[2] * 1;

    const willBeTheAgeOf = curYear - year;

    bDates[month - 1].data.push({
      user: friend,
      day,
      willBeTheAgeOf,
    });
  });

  // Sorting the data objects

  // by the day
  sortObj(bDates, `data`, `day`);

  // by the age
  sortObj(bDates, `data`, `willBeTheAgeOf`);

  res.status(200).json({ status: "success", bDates });
});