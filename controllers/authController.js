const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const Group = require("../models/groupModel");

const decodingToken = require("../utils/decodingToken");

const {
  asyncHandler,
} = require("../middlewares/utils/asyncHandler");

const AppError = require("../middlewares/utils/AppError");


// ####################
// TOKEN UTILS
// ####################

const createJWTToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};


const setJWTCookie = (res, token) => {
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
};


const getTokenFromRequest = (req) => {
  // 1. Authorization header
  const authorization = req.headers.authorization;

  if (
    authorization &&
    authorization.startsWith("Bearer ")
  ) {
    return authorization.split(" ")[1];
  }

  // 2. Cookie header
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const jwtCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("jwt="));

  if (!jwtCookie) {
    return null;
  }

  return jwtCookie.slice("jwt=".length);
};


const sendToken = (user, statusCode, res, data) => {
  const token = createJWTToken(user._id);

  setJWTCookie(res, token);

  res.status(statusCode).json({
    status: "success",
    token,
    ...(data && {
      data,
    }),
  });
};


// ####################
// SIGNUP
// ####################

exports.signup = asyncHandler(async (req, res) => {
  const newUser = await User.create(req.body);

  newUser.password = undefined;

  sendToken(newUser, 201, res, {
    data: newUser,
  });
});


// ####################
// LOGIN
// ####################

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Check if email and password were provided
  if (!email || !password) {
    throw new AppError(
      "Please provide email and password",
      400,
      "MISSING_CREDENTIALS"
    );
  }

  // 2. Find user and explicitly select password
  const user = await User.findOne({
    email,
  }).select("+password");

  // 3. Validate user and password
  const isPasswordCorrect =
    user &&
    (await user.correctPassword(
      password,
      user.password
    ));

  if (!isPasswordCorrect) {
    throw new AppError(
      "Incorrect email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  // 4. Send token
  sendToken(user, 200, res);
});


// ####################
// PROTECT
// ####################

exports.protect = asyncHandler(
  async (req, res, next) => {
    // 1. Get token
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new AppError(
        "Unauthorized",
        401,
        "UNAUTHORIZED"
      );
    }

    // 2. Decode and verify token
    const decoded = await decodingToken(req, token);

    // 3. Check if user still exists
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      throw new AppError(
        "User belonging to this token no longer exists",
        401,
        "USER_NOT_FOUND"
      );
    }

    next();
  }
);


// ####################
// GROUP AUTHORIZATION
// ####################

exports.isAdminOrMod = async (req, role) => {
  // 1. Decode logged user
  const decoded = await decodingToken(req);

  // 2. Check if user exists
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

  // 3. Check if group exists
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

  // 4. Define allowed roles
  const allowedRoles = role
    ? [role]
    : ["admin", "moderator"];

  // 5. Check if user has required role
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