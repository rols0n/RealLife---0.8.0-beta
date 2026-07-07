const Comment = require("../models/commentModel");
const User = require("../models/userModel");

const handlerController = require("./handlerController");

const decodingToken = require("../utils/decodingToken");
const commentReaction = require("./utils/commentReaction");

const {
  asyncHandler,
} = require("../middlewares/utils/asyncHandler");
const AppError = require("../middlewares/utils/AppError");


// ====================
// Helpers
// ====================

const getLoggedUser = async (req) => {
  const decoded = await decodingToken(req);

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError(
      "Logged user doesn't exist",
      404,
      "USER_NOT_FOUND"
    );
  }

  return user;
};

const validateReactionData = ({ level, author, reactionType }) => {
  if (!level || !author || !reactionType) {
    throw new AppError(
      'Body misses required data: "level", "author", "reactionType"',
      400,
      "MISSING_REACTION_DATA"
    );
  }

  if (!["like", "disLike"].includes(reactionType)) {
    throw new AppError(
      '"reactionType" must be either "like" or "disLike"',
      400,
      "INVALID_REACTION_TYPE"
    );
  }
};

const handleCommentReaction = (action) =>
  asyncHandler(async (req, res) => {
    const treeID = req.params.treeID;
    const decoded = await decodingToken(req);

    const { level, author, reactionType, commentID } = req.body;

    validateReactionData({
      level,
      author,
      reactionType,
    });

    await commentReaction(
      req,
      res,
      level,
      author,
      commentID,
      treeID,
      decoded.id,
      reactionType,
      action
    );

    const comment = await Comment.findById(treeID);

    if (!comment) {
      throw new AppError(
        "Comment doesn't exist",
        404,
        "COMMENT_NOT_FOUND"
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        comment,
      },
    });
  });


// ====================
// Basic CRUD
// ====================

exports.getAllComments = async (req, res) => {
  return handlerController.getAll(req, res, Comment);
};

exports.createComment = asyncHandler(async (req, res) => {
  const user = await getLoggedUser(req);

  if (!req.body.tree) {
    throw new AppError(
      "Comment tree data is required",
      400,
      "COMMENT_TREE_REQUIRED"
    );
  }

  req.body.tree.author = user._id;

  const comment = await Comment.create(req.body);

  res.status(200).json({
    status: "success",
    data: {
      data: comment,
    },
  });
});

exports.updateComment = async (req, res) => {
  return handlerController.update(req, res, Comment);
};

exports.getCommentById = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new AppError(
      "Comment doesn't exist",
      404,
      "COMMENT_NOT_FOUND"
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      data: comment,
    },
  });
});

exports.deleteComment = async (req, res) => {
  return handlerController.delete(req, res, Comment);
};


// ====================
// Replies
// ====================

exports.updateLevelTwoRespond = asyncHandler(async (req, res) => {
  const user = await getLoggedUser(req);

  req.body.author = user._id;

  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        "tree.replies": req.body,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!comment) {
    throw new AppError(
      "Comment doesn't exist",
      404,
      "COMMENT_NOT_FOUND"
    );
  }

  res.status(200).json({
    status: "success",
    data: comment,
  });
});

exports.updateLevelThreeRespond = asyncHandler(async (req, res) => {
  const user = await getLoggedUser(req);

  req.body.author = user._id;

  const comment = await Comment.findOneAndUpdate(
    {
      _id: req.params.id,
      "tree.replies": {
        $elemMatch: {
          author: req.body.repliesTo,
          _id: req.body.repliesToComment,
        },
      },
    },
    {
      $push: {
        "tree.replies.$.subReplies": req.body,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!comment) {
    throw new AppError(
      "Comment or reply doesn't exist",
      404,
      "COMMENT_REPLY_NOT_FOUND"
    );
  }

  res.status(200).json({
    status: "success",
    data: comment,
  });
});


// ====================
// Reactions
// ====================

exports.reactToComment = handleCommentReaction("add");

exports.removeReaction = handleCommentReaction("remove");