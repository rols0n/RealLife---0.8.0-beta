const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Group = require("../models/groupModel");

const decodingToken = require("../utils/decodingToken");

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

exports.signup = async (req, res) => {
  try {
    // 1) Creating new User
    const newUser = await User.create(req.body);

    // 2) Creating token
    const token = createJWTtoken(
      newUser._id,
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
        data: newUser,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      place: "authController | signup",
      err,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1)  Checking if EMAIL && PASSWORD exists
    if (!email || !password) {
      res.status(400).json({
        status: "error",
      });
    }
    // 2) Checking if USER exists && PASSWORD is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      res.status(404).json({
        status: "fail",
        message: "incorrect email or password",
      });
    }

    // 3) Creating token
    const token = createJWTtoken(
      user._id,
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRES_IN
    );

    // 4) Singing JWT token to the cookie
    const jwtExpiresIn = new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    );

    res.cookie("jwt", token, {
      expiresIn: jwtExpiresIn,
      httpOnly: true,
    });

    // 5) Sending the TOKEN to the CLIENT
    res.status(201).json({
      status: "success",
      token,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      token,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting JWT TOKEN from the User and checking, if the TOKEN is valid
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.cookie.split("=")[1]) {
      token = req.headers.cookie.split("=")[1];
    }

    if (!token) {
      res.status(401).json({
        status: "fail",
        message: "Unauthroized",
      });
    }

    // 2) Verifing the TOKEN
    const decoded = await decodingToken(req, token);

    // 3) Checking if USER still exists
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      throw `You are not logged in`;
    }

    next();
  } catch (err) {
    res.status(404).json({
      err,
    });
  }
};

exports.isAdminOrMod = async (req, role) => {
  // 1. get the user
  const decoded = await decodingToken(req);

  const isUser = (await User.findById(decoded.id)) ? true : false;
  if (isUser === false) {
    throw `User with provided ID doesnt exist`;
  }

  const isGroup = (await Group.findById(req.params.id)) ? true : false;
  if (isGroup === false) {
    throw `Group with provided ID doesnt exist`;
  }
  if (role) {
    const isRole = (await Group.findOne({
      _id: req.params.id,
      "members._id": decoded.id,
      "members.role": role,
    }))
      ? true
      : false;
    if (isRole === false) {
      throw `User needs to be ${role}, to perform this action`;
    }
  }

  if (!role) {
    const isModerator = (await Group.findOne({
      _id: req.params.id,
      "members._id": decoded.id,
      "members.role": "moderator",
    }))
      ? true
      : false;

    const isAdmin = (await Group.findOne({
      _id: req.params.id,
      "members._id": decoded.id,
      "members.role": "admin",
    }))
      ? true
      : false;

    if (isModerator === false && isAdmin === false) {
      throw `User needs to be at least moderator, to perform this action}`;
    }
  }
};
