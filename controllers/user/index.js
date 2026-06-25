const User = require("../../models/userModel");
const handlerController = require("../handlerController");


const fs = require("fs");
const jwt = require("jsonwebtoken");

const decodingToken = require("../../utils/decodingToken");
const Group = require("../../models/groupModel");
const { query } = require("express");


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
  fs.mkdirSync(`./public/imgs//users/${user._id}`);
  fs.mkdirSync(`./public/imgs/users/${user._id}/profilePicture`);
  fs.mkdirSync(`./public/imgs/users/${user._id}/bannerPicture`);

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
    const dir = `./public/imgs/users/${user._id}`;
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




module.exports.uploadRootCommentText = async (req, res) => {
  const user = await User.findById(req.params.id);
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





