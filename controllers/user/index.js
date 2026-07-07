const User = require("../../models/userModel");
const handlerController = require("../handlerController");

const fs = require("fs/promises");
const jwt = require("jsonwebtoken");

const decodingToken = require("../../utils/decodingToken");
const {asyncHandler} = require("../../middlewares/utils/asyncHandler");

const AppError = require("../../middlewares/utils/AppError");

const createJWTtoken = (userId, secret, expiresIn) => {
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

const defaultUserPopulate = {
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
};

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    userCount: users.length,
    data: {
      data: users,
    },
  });
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);

  await Promise.all([
    fs.mkdir(`./public/imgs/users/${user._id}/profilePicture`, {
      recursive: true,
    }),

    fs.mkdir(`./public/imgs/users/${user._id}/bannerPicture`, {
      recursive: true,
    }),
  ]);

  const token = createJWTtoken(
    user._id,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN
  );

  const jwtExpiresIn = new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  );

  res.cookie("jwt", token, {
    expires: jwtExpiresIn,
    httpOnly: true,
  });

  res.status(201).json({
    status: "success",
    token,
    data: {
      data: user,
    },
  });
});

exports.updateUser = (req, res) => {
  return handlerController.update(req, res, User);
};

exports.getUserById = asyncHandler(async (req, res, next) => {
  const { populate, populateType } = req.query;

  let query = User.findById(req.params.id);

  if (populate && populateType === "string") {
    query = query.populate(populate);
  } else {
    query = query.populate(defaultUserPopulate);
  }

  const user = await query;

  if (!user) {
    return next(new AppError("User doesn't exist", 404, "USER_NOT_FOUND"));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("User doesn't exist", 404, "USER_NOT_FOUND"));
  }

  await fs.rm(`./public/imgs/users/${user._id}`, {
    recursive: true,
    force: true,
  });

  res.status(200).json({
    status: "success",
    data: {},
  });
});

module.exports.uploadRootCommentText = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User doesn't exist", 404, "USER_NOT_FOUND"));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// BLOCK_LIST

exports.deleteUsersFromBlockList = asyncHandler(async (req, res) => {
  const decoded = await decodingToken(req);

  await User.findByIdAndUpdate(decoded.id, {
    $pull: {
      blockList: {
        schema: { $in: req.body.users || [] },
      },
    },
  });

  const user = await User.findById(decoded.id);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});



exports.updateActivityStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["online", "offline"].includes(status)) {
    throw new AppError(
      'Activity status must be either "online" or "offline"',
      400,
      "INVALID_ACTIVITY_STATUS"
    );
  }

  const decoded = await decodingToken(req);

  const user = await User.findByIdAndUpdate(
    decoded.id,
    {
      $set: {
        "activityStatus.status": status,
        "activityStatus.lastTimeOnline": Date.now(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw new AppError(
      "Logged user doesn't exist",
      404,
      "USER_NOT_FOUND"
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      activityStatus: user.activityStatus,
    },
  });
});