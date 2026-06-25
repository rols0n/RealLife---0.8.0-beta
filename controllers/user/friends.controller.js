const User = require("../../models/userModel");
const decodingToken = require("../../utils/decodingToken");


const addFriends = async (User1, User2) => {
  const fixUser = async (user, user2Id) => {
    // 1) search in user.receivedRequests for the req.params.id
    await user.updateOne({
      // 2) Delete req.params.id from user.receivedRequests
      $pull: {
        receivedRequests: user2Id,
      },
    });

    await user.updateOne({
      // 2) Delete req.params.id from user.receivedRequests
      $pull: {
        sentRequests: user2Id,
      },
    });

    await user.updateOne({
      // 3) Add req.params.id to user.friends
      $push: {
        friends: user2Id,
      },
    });
  };

  await fixUser(User1, User2._id);
  await fixUser(User2, User1._id);
};


module.exports.sendFriendsRequest = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).json({
      status: "fail",
      message: "Something went wrong with sending friend request",
    });
  }
  const decoded = await decodingToken(req);
  const user = await User.findById(decoded.id);
  const reqReceiver = await User.findById(req.params.id);

  if (
    (await User.findOne({ _id: req.params.id, sentRequests: user._id })) ||
    (await User.findOne({ _id: req.params.id, receivedRequests: user._id }))
  ) {
    await addFriends(user, reqReceiver);

    return res.status(200).json({
      status: "success",
      message: "",
    });
  } else if (
    await User.findOne({
      _id: req.params.id,
      friends: user._id,
    })
  ) {
    return res
      .status(404)
      .json({ status: "fail", message: "These users are already friends" });
  } else {
    await reqReceiver.updateOne({
      $push: { receivedRequests: user._id },
    });
    await user.updateOne({ $push: { sentRequests: req.params.id } });
  }

  const freshUser = await User.findById(decoded.id);
  const freshReqReceiver = await User.findById(req.params.id);

  res.status(200).json({
    status: "success",
    data: {
      user: freshUser,
      reqReceiver: freshReqReceiver,
    },
  });
};

module.exports.acceptFriendsRequest = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).json({
      status: "fail",
      message: "Something went wrong with sending friend request",
    });
  }
  const decoded = await decodingToken(req);
  const user = await User.findById(decoded.id);
  const reqSender = await User.findById(req.params.id);

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
};

module.exports.rejectFriendsRequest = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).json({
      status: "fail",
      message: "You have to provide id via URL",
    });
  }
  const decoded = await decodingToken(req);
  const reqSender = await User.findById(req.params.id);
  const user = await User.findById(decoded.id);

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
};

module.exports.cancelFriendsRequest = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).json({
      status: "fail",
      message: "You have to provide id via URL",
    });
  }
  const decoded = await decodingToken(req);
  const reqReceiver = await User.findById(req.params.id);
  const user = await User.findById(decoded.id);

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
};

module.exports.deleteFriend = async (req, res) => {
  if (!req.params.id) {
    return res.status(404).json({
      status: "fail",
      message: "You have to provide id via URL",
    });
  }
  const decoded = await decodingToken(req);
  const friend = await User.findById(req.params.id);
  const user = await User.findById(decoded.id);

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
      reqSender: await User.findById(req.params.id),
    },
  });
};


// ###############
// Birthdays
const sortObj = (obj, path, value) => {
  obj.forEach((element) => {
    element[path].sort(function (a, b) {
      return a[value] - b[value];
    });
  });
};

module.exports.birthdays = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: "friends",
      })
      .sort({ "friends.birthDate": -1 });
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
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};
