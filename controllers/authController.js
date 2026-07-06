const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const Group = require("../models/groupModel");

const decodingToken = require("../utils/decodingToken");

const { asyncHandler } = require("../middlewares/utils/asyncHandler");
const AppError = require("../middlewares/utils/AppError");

const createJWTToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const sendToken = (user, statusCode, res, data) => {
  const token = createJWTToken(user._id);

  const jwtExpiresIn = new Date(
    Date.now() +
      Number(process.env.JWT_COOKIE_EXPIRES_IN) *
        24 *
        60 *
        60 *
        1000
  );

  res.cookie("jwt", token, {
    expires: jwtExpiresIn,
    httpOnly: true,
  });

  res.status(statusCode).json({
    status: "success",
    token,
    ...(data && { data }),
  });
};

exports.signup = asyncHandler(async (req, res) => {
  const newUser = await User.create(req.body);

  sendToken(newUser, 201, res, {
    data: newUser,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(
      "Please provide email and password",
      400,
      "MISSING_CREDENTIALS"
    );
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError(
      "Incorrect email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  sendToken(user, 200, res);
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    throw new AppError(
      "Unauthorized",
      401,
      "UNAUTHORIZED"
    );
  }

  const decoded = await decodingToken(req, token);

  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    throw new AppError(
      "User belonging to this token no longer exists",
      401,
      "USER_NOT_FOUND"
    );
  }

  next();
});

exports.isAdminOrMod = async (req, role) => {
  const decoded = await decodingToken(req);

  const userExists = await User.exists({
    _id: decoded.id,
  });

  if (!userExists) {
    throw new AppError(
      "User with provided ID doesn't exist",
      404,
      "USER_NOT_FOUND"
    );
  }

  const groupExists = await Group.exists({
    _id: req.params.id,
  });

  if (!groupExists) {
    throw new AppError(
      "Group with provided ID doesn't exist",
      404,
      "GROUP_NOT_FOUND"
    );
  }

  const allowedRoles = role
    ? [role]
    : ["admin", "moderator"];

  const hasRequiredRole = await Group.exists({
    _id: req.params.id,
    members: {
      $elemMatch: {
        _id: decoded.id,
        role: {
          $in: allowedRoles,
        },
      },
    },
  });

  if (!hasRequiredRole) {
    throw new AppError(
      role
        ? `User needs to be ${role} to perform this action`
        : "User needs to be at least moderator to perform this action",
      403,
      "INSUFFICIENT_GROUP_ROLE"
    );
  }
};