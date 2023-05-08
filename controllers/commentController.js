const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const handlerController = require("../controllers/handlerController");

const decodingToken = require("../utils/decodingToken");
const commentReaction = require("./utils/commentReaction.js");

exports.getAllComments = async (req, res) => {
  handlerController.getAll(req, res, Comment);
};

exports.createComment = async (req, res) => {
  try {
    const decoded = await decodingToken(req);

    // 3) Checking if USER still exists
    const user = await User.findById(decoded.id);

    req.body.tree.author = user._id;

    const comment = await Comment.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        data: comment,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};

exports.updateComment = async (req, res) => {
  handlerController.update(req, res, Comment);
};

exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        data: comment,
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

exports.deleteComment = async (req, res) => {
  handlerController.delete(req, res, Comment);
};

exports.updateLevelTwoRespond = async (req, res) => {
  const decoded = await decodingToken(req);

  // 3) Checking if USER still exists
  const user = await User.findById(decoded.id);

  req.body.author = user._id;
  await Comment.findByIdAndUpdate(req.params.id, {
    $push: {
      "tree.replies": req.body,
    },
  });

  const comment = await Comment.findById(req.params.id);
  res.status(200).json({ status: "success", data: comment });
};

exports.updateLevelThreeRespond = async (req, res) => {
  try {
    const decoded = await decodingToken(req);

    // 3) Checking if USER still exists
    const user = await User.findById(decoded.id);

    req.body.author = user._id;

    await Comment.findOneAndUpdate(
      {
        "tree.replies": {
          $elemMatch: {
            author: req.body.repliesTo,
            _id: req.body.repliesToComment,
          },
        },
        _id: req.params.id,
      },
      {
        $push: {
          "tree.replies.$.subReplies": req.body,
        },
      }
    );

    const commentFresh = await Comment.findOne({ _id: req.params.id });

    res.status(200).json({ status: "success", data: commentFresh });
  } catch (err) {
    res.status(404).json({ status: "fail", err });
    console.log(err);
  }
};

// ==============

// Reactions
exports.reactToComment = async (req, res) => {
  try {
    const treeID = req.params.treeID;
    const decoded = await decodingToken(req);
    const loggedUser = await User.findById(decoded.id);

    const { level, author, reactionType, commentID } = req.body;
    let comment, reactionsCount, likesCount, disLikesCount;
    if (!level || !author || !reactionType)
      throw `Body misses data. Check if contains: "level", "author", "reactionType`;

    switch (reactionType) {
      case "like":
      case "disLike":
        break;
      default:
        throw `"reactionType" can be either 'like' or 'disLike'. Neither: ${reactionType}`;
    }

    commentReaction(
      req,
      res,
      level,
      author,
      commentID,
      treeID,
      decoded.id,
      reactionType,
      "add"
    );

    comment = await Comment.findById(treeID);
    if (!comment) throw `Comment does not exist`;
    res.status(200).json({
      status: "success",
      data: { comment, reactionsCount, likesCount, disLikesCount },
    });
  } catch (err) {
    res.status(404).json({ status: "fail", err });
  }
};

exports.removeReaction = async (req, res) => {
  try {
    const treeID = req.params.treeID;
    const decoded = await decodingToken(req);
    const loggedUser = await User.findById(decoded.id);

    const { level, author, reactionType, commentID } = req.body;
    let comment, reactionsCount, likesCount, disLikesCount;
    if (!level || !author || !reactionType)
      throw `Body misses data. Check if contains: "level", "author", "reactionType`;

    switch (reactionType) {
      case "like":
      case "disLike":
        break;
      default:
        throw `"reactionType" can be either 'like' or 'disLike'. Neither: ${reactionType}`;
    }
    commentReaction(
      req,
      res,
      level,
      author,
      commentID,
      treeID,
      decoded.id,
      reactionType,
      "remove"
    );

    comment = await Comment.findById(treeID);
    if (!comment) throw `Comment does not exist`;
    res.status(200).json({
      status: "success",
      data: { comment, reactionsCount, likesCount, disLikesCount },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};

// 637 | 513 | 194 | 185 | 205
