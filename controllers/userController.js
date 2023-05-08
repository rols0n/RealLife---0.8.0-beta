const User = require("../models/userModel");
const handlerController = require("../controllers/handlerController");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const decodingToken = require("../utils/decodingToken");
const Group = require("../models/groupModel");
const { query } = require("express");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callBack) => {
  if (file.mimetype.startsWith("image")) {
    callBack(null, true);
  } else {
    callBack("You can upload ONLY images", false);
  }
};

const createJWTtoken = (userId, secret, expiresIn) => {
  return jwt.sign(
    {
      id: userId,
    },
    secret,
    {
      expiresIn,
    }
  );
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const checkUsersConnection = async (User1, User2, req, res) => {
  if (
    (await User.findOne({ _id: req.params.id, sentRequests: User1._id })) ||
    (await User.findOne({ _id: req.params.id, receivedRequests: User1._id }))
  ) {
    // 1) deleting the user._id from the sentRequests
    // and receivedRequests arrays of the reqReceiver
    await User2.updateOne({
      $pull: {
        sentRequests: User1._id,
      },
    });
    await User2.updateOne({
      $pull: {
        receivedRequests: User1._id,
      },
    });

    // 2) deleting the User1._id from the sentRequests
    // and receivedRequests arrays of the User2
    await User1.updateOne({
      $pull: {
        sentRequests: User2._id,
      },
    });
    await User1.updateOne({
      $pull: {
        receivedRequests: User2._id,
      },
    });

    // 3) Adding the User1._id to the friends array of the User2
    await User2.updateOne({
      $push: {
        friends: User1._id,
      },
    });

    // 4) Adding the User2._id to the friends array of the User1
    await User1.updateOne({
      $push: {
        friends: User2._id,
      },
    });

    res.status(200).json({
      status: "success",
      message: "",
    });
  } else if (
    await User.findOne({
      _id: req.params.id,
      friends: User1._id,
    })
  ) {
    return res
      .status(404)
      .json({ status: "fail", message: "These users are already friends" });
  }
};

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

exports.uploadProfilePicture = upload.single("profileImage");
exports.resizeProfilePicture = async (req, res, next) => {
  if (!req.file) return next();

  const decoded = await decodingToken(req);

  // 3) Checking if USER still exists
  const user = await User.findById(decoded.id);

  req.file.filename = `profile-picture-${user._id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`views/imgs/users/${user._id}/profilePicture/${req.file.filename}`);

  next();
};

exports.uploadBannerPicture = upload.single("bannerPicture");

exports.resizeBannerPicture = async (req, res, next) => {
  if (!req.file) return next();
  const decoded = await decodingToken(req);

  // 3) Checking if USER still exists
  const user = await User.findById(decoded.id);

  req.file.filename = `banner-picture-${user._id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(1200, 628)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`views/imgs/users/${user._id}/bannerPicture/${req.file.filename}`);

  next();
};

exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.find();

    res.status(200).json({
      status: "success",
      userCount: user.length,
      data: {
        data: user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err: {
        err,
      },
    });
  }
};

exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  fs.mkdirSync(`./views/imgs//users/${user._id}`);
  fs.mkdirSync(`./views/imgs/users/${user._id}/profilePicture`);
  fs.mkdirSync(`./views/imgs/users/${user._id}/bannerPicture`);

  // 2) Creating token
  const token = createJWTtoken(
    user._id,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN
  );

  const jwtExpiresIn = new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  );

  res.cookie("jwt", token, {
    expiresIn: jwtExpiresIn,
    httpOnly: true,
  });

  // 3) Sending the response
  res.status(201).json({
    status: "success",
    token,
    data: {
      data: user,
    },
  });
};

exports.updateUser = async (req, res) => {
  handlerController.update(req, res, User);
};

exports.getUserById = async (req, res) => {
  try {
    let user;

    const { populate, populateType } = req.query;
    if (!populate || populateType !== "string") {
      user = await User.findById(req.params.id).populate({
        path: "posts",
        populate: {
          path: "commentsTree",
          populate: {
            path: "commentTree",
            populate: {
              path: "author responds",
              populate: {
                path: "author respondsToUser responds",
                populate: { path: "author respondsToUser" },
              },
            },
          },
        },
      });
      return res.status(200).json({
        status: "success",
        data: {
          data: user,
        },
      });
    }

    switch (populateType) {
      case "string":
        user = await User.findById(req.params.id).populate(populate);
        break;
    }

    res.status(200).json({
      status: "success",
      data: {
        data: user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err: {
        err,
      },
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    await User.findByIdAndRemove(req.params.id);
    const dir = `./views/imgs/users/${user._id}`;
    await fs.rm(dir, { recursive: true, force: true }, (err) => {
      if (err) {
        console.log("error");
      }
      console.log(`${dir} is deleted!`);
    });

    res.status(200).json({ status: "success", data: {} });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err: {
        err,
      },
    });
  }
};

exports.updateProfilePicture = async (req, res, next) => {
  try {
    // const user = await User.findById(req.params.id);
    const decoded = await decodingToken(req);

    // 3) Checking if USER still exists
    const user = await User.findById(decoded.id);
    if (user) {
      if (!req.file) {
        res.status(404).json({
          status: "fail",
          message: "This route is only for changing user images",
        });
      }
      console.log(req.file);

      const imagePath = `/imgs/users/${user._id}/profilePicture/${req.file.filename}`;
      await User.findByIdAndUpdate(user._id, {
        profileImage: imagePath,
      });

      res.status(200).json({
        status: "success",
        data: { imagePath },
      });
    }
  } catch (err) {
    res.status(404).json({ status: "fail", error: err });
  }
};

exports.updateBannerPicture = async (req, res, next) => {
  try {
    const decoded = await decodingToken(req);

    // 3) Checking if USER still exists
    const user = await User.findById(decoded.id);

    if (user) {
      if (!req.file) {
        res.status(404).json({
          status: "fail",
          message: "This route is only for changing user images",
        });
      }

      // console.log(req.file);
      const imagePath = `/imgs/users/${user._id}/bannerPicture/${req.file.filename}`;
      await User.findByIdAndUpdate(user._id, {
        bannerImage: imagePath,
      });

      res.status(200).json({
        status: "success",
        data: { imagePath },
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};

module.exports.uploadRootCommentText = async (req, res) => {
  const user = await User.findById(req.params.id);
};

// FRIENDS

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

// GROUPS

module.exports.sendGroupsRequests = async (req, res) => {
  try {
    // 1. get the logged user
    const decoded = await decodingToken(req);
    const isUser = (await User.findById(decoded.id)) ? true : false;
    if (isUser === false) {
      throw `User wtih provided id doesnt exist`;
    }
    // 2. get the group by req.params.id and check if it exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Group with provided id doesnt exist`;
    }

    // IF user already sent request throw error
    const didSend = (await User.findOne({
      _id: decoded.id,
      "groups.requests.sent.group": req.params.id,
    }))
      ? true
      : false;
    if (didSend === true) {
      throw `You've already sent the request, you can cancel it"`;
    }

    // IF user, received request before, throw error
    const didReceive = (await User.findOne({
      _id: decoded.id,
      "groups.requests.received.group": req.params.id,
    }))
      ? true
      : false;
    if (didReceive === true) {
      throw `You've already received the invitation, you can accept it`;
    }

    // 3. findGroup with provied ID and push the userID to the requests.received
    await Group.updateOne(
      { _id: req.params.id },
      { $push: { "requests.received": { user: decoded.id } } }
    );

    // 4. update user's sent requests
    await User.updateOne(
      { _id: decoded.id },
      {
        $push: { "groups.requests.sent": { group: req.params.id } },
      }
    );

    const user = await User.findById(decoded.id);
    const group = await Group.findById(req.params.id);
    res.status(200).json({ status: "success", data: { user, group } });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};
module.exports.cancelGroupsRequests = async (req, res) => {
  try {
    // 1. get the logged user
    const decoded = await decodingToken(req);
    const isUser = (await User.findById(decoded.id)) ? true : false;
    if (isUser === false) {
      throw `User wtih provided id doesnt exist`;
    }
    // 2. get the group by req.params.id and check if it exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Group with provided id doesnt exist`;
    }

    // IF user already sent request throw error
    const didSend = (await User.findOne({
      _id: decoded.id,
      "groups.requests.sent.group": req.params.id,
    }))
      ? true
      : false;
    if (didSend === false) {
      throw `You didnt send request, so you cant cancel it"`;
    }

    // 3. findGroup with provied ID and push the userID to the requests.received
    await Group.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { "requests.received": { user: decoded.id } } }
    );

    // 4. update user's sent requests
    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $pull: { "groups.requests.sent": { group: req.params.id } },
      }
    );

    const user = await User.findById(decoded.id);
    const group = await Group.findById(req.params.id);
    res.status(200).json({ status: "success", data: { user, group } });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};
module.exports.acceptGroupsRequests = async (req, res) => {
  try {
    // 1. get the logged user
    const decoded = await decodingToken(req);
    const isUser = (await User.findById(decoded.id)) ? true : false;
    if (isUser === false) {
      throw `User wtih provided id doesnt exist`;
    }
    // 2. get the group by req.params.id and check if it exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Group with provided id doesnt exist`;
    }
    // 3. findGroup with provied ID and push the userID to the requests.received
    const didReceive = (await User.findOne({
      "groups.requests.received.group": req.params.id,
    }))
      ? true
      : false;
    if (didReceive === false) throw `User didn't receive invite from the group`;

    await Group.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { "requests.sent": { user: decoded.id } } }
    );

    // 4. update user's sent requests
    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $pull: { "groups.requests.received": { group: req.params.id } },
      }
    );

    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $push: { "groups.currentlyIn": { _id: req.params.id, role: "user" } },
      }
    );

    await Group.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { members: { _id: decoded.id, role: "user" } } }
    );
    const user = await User.findById(decoded.id);
    const group = await Group.findById(req.params.id);
    res.status(200).json({ status: "success", data: { user, group } });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};
module.exports.rejectGroupsRequests = async (req, res) => {
  try {
    // 1. get the logged user
    const decoded = await decodingToken(req);
    const isUser = (await User.findById(decoded.id)) ? true : false;
    if (isUser === false) {
      throw `User wtih provided id doesnt exist`;
    }
    // 2. get the group by req.params.id and check if it exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Group with provided id doesnt exist`;
    }
    // 3. findGroup with provied ID and push the userID to the requests.received
    const didReceive = (await User.findOne({
      "groups.requests.sent": { group: req.params.id },
    }))
      ? true
      : false;
    if (didReceive === false) throw `User didn't receive invite from the group`;
    await Group.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { "requests.sent": { user: decoded.id } } }
    );

    // 4. update user's sent requests
    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $pull: { "groups.requests.received": { group: req.params.id } },
      }
    );

    const user = await User.findById(decoded.id);
    const group = await Group.findById(req.params.id);
    res.status(200).json({ status: "success", data: { user, group } });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

// BLOCK_LIST

exports.deleteUsersFromBlockList = async (req, res) => {
  const decoded = await decodingToken(req);

  Array.prototype.forEach.call(req.body.users, async (user) => {
    console.log(user);
    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $pull: { blockList: { schema: user } },
      }
    );
  });

  res.status(200).json({
    status: "success",
    data: {
      user: await User.findById(decoded.id),
    },
  });
};

// ---------------------------
// SEARCH ENGINES
// How should engine work:
// 1) Based on the string, query the database for the someone with given name

exports.searchEngine_friends = async (req, res) => {
  const user = await User.findById(req.params.id);
  await user.populate({ path: "friends" }).execPopulate();
  const queryString = req.body.queryString.toLowerCase();

  const foundFriends = [];

  // 1. Loop over the friends of user
  const decoded = await decodingToken(req);
  const loggedUser = await User.findById(decoded.id);
  Array.prototype.forEach.call(user.friends, async (friend) => {
    const commonFriends = [];
    const friendsName = `${friend.firstName} ${friend.lastName}`.toLowerCase();
    if (friendsName.startsWith(queryString)) {
      loggedUser.friends.forEach((friendOfLoggedUser) => {
        friend.friends.forEach((friendOfFriend) => {
          if (`${friendOfFriend._id}` === `${friendOfLoggedUser._id}`) {
            commonFriends.push(friendOfFriend);
          }
        });
      });

      foundFriends.push({ friend, commonFriends });
    }
  });

  res.status(200).json({ status: "success", data: foundFriends });
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

// ##########
// People You May Know - SEEN
// pYmK_aS_ADD stands for peopleYoumayKnow_alreadySeen_ADD
module.exports.pYmK_aS_ADD = async (req, res) => {
  try {
    if (!req.body.users) throw `No data at req.body.users`;
    const decoded = await decodingToken(req);
    const user = await User.findById(decoded.id);

    const matched = [];
    const users = Array.from(req.body.users);
    const pYmK = Array.from(user.peopleYouMayKnow__alreadySeen);

    if (pYmK.length !== 0)
      users.forEach((el) => {
        pYmK.forEach((elem) => {
          console.log(el, elem);
          if (`${el}` === `${elem}` && el !== "") return;
          matched.push(el);
          matched.push(elem);
          console.log("c");
        });
      });
    else {
      matched.push(...users);
    }

    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        peopleYouMayKnow__alreadySeen: matched,
      }
    );
    console.log(matched);

    res.status(200).json({ status: "success", data: { matched } });
  } catch (err) {
    res.status(404).json({ status: "fail", err });
  }
};

// ##################
// NOTIFICATIONS

exports.generateFeedContent = async (req, res) => {
  try {
    const decoded = await decodingToken(req);

    const user = await User.findById(decoded.id)
      .select("posts _id friends")
      .populate({
        path: "posts",
        populate: {
          path: "_id",
          select:
            "createdAt author images cantBeDisplayedBy reactions postText comments postImages",
          populate: {
            path: "author comments",
            select: "firstName lastName profileImage bannerImage tree ",
            populate: {
              path: "tree",
              populate: {
                path: "author replies",
                select:
                  "firstName lastName profileImage bannerImage author repliesTo text createdAt reactions subReplies",

                populate: {
                  path: "author subReplies",
                  select:
                    "firstName lastName profileImage bannerImage author repliesTo text createdAt reactions repliesToComment",
                  populate: {
                    path: "author",
                    select: "firstName lastName profileImage bannerImage",
                  },
                },
              },
            },
          },
        },
      })

      .populate({
        path: "friends",
        select: "posts",
        populate: {
          path: "posts",
          populate: {
            path: "_id",
            select:
              "createdAt author images cantBeDisplayedBy postText reactions comments postImages",
            populate: {
              path: "author comments",
              select: "firstName lastName profileImage bannerImage tree ",
              populate: {
                path: "tree",
                populate: {
                  path: "author replies",
                  select:
                    "firstName lastName profileImage bannerImage author repliesTo text createdAt reactions subReplies",

                  populate: {
                    path: "author subReplies",
                    select:
                      "firstName lastName profileImage bannerImage author repliesTo text createdAt reactions repliesToComment",
                    populate: {
                      path: "author",
                      select: "firstName lastName profileImage bannerImage",
                    },
                  },
                },
              },
            },
          },
        },
      });

    const posts = [];
    for (const el of user.posts) {
      if (el.place === "userPage") {
        if (el._id !== null) {
          el.createdAt = new Date(el.createdAt).toUTCString();
          posts.push(el._id);
        }
      }
    }

    for (const friend of user.friends) {
      for (const post of friend.posts) {
        if (post.place === "userPage") {
          if (post._id !== null) {
            post.createdAt = new Date(post.createdAt).toUTCString();
            posts.push(post._id);
          }
        }
      }
    }

    posts.sort((a, b) => b.createdAt - a.createdAt);

    console.log(posts);
    res.status(200).json({ status: "success", data: posts });
  } catch (err) {
    res.status(404).json({ status: "fail" });
  }
};
