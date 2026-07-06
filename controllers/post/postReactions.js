const Post = require("../../models/postModel");
const User = require("../../models/userModel");

const generateReactionsObj = require("../../utils/generateReactionsObj");
const decodingToken = require("../../utils/decodingToken");

const AppError = require("../../middlewares/utils/AppError");
const {
  asyncHandler,
} = require("../../middlewares/utils/asyncHandler");


const validateReaction = (reaction) => {
  if (reaction !== "like" && reaction !== "disLike") {
    throw new AppError(
      `Reaction can be either "like" or "disLike"`,
      400,
      "INVALID_REACTION"
    );
  }
};

const updateReaction = async (req, action) => {
  const decoded = await decodingToken(req);
  const reaction = req.body.reaction;

  validateReaction(reaction);

  const [userExists, post] = await Promise.all([
    User.exists({ _id: decoded.id }),
    Post.findById(req.params.postID).select("reactions"),
  ]);

  if (!userExists) {
    throw new AppError(
      "You need to be logged in",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  if (!post) {
    throw new AppError("Post doesn't exist", 404, "POST_NOT_FOUND");
  }

  const {
    likes: rawLikes,
    disLikes: rawDisLikes,
    order: rawOrder,
  } = post.reactions;

  const { disLikes, likes, count, order } = generateReactionsObj(
    action,
    rawDisLikes,
    rawLikes,
    decoded.id,
    reaction,
    rawOrder
  );

  return Post.findByIdAndUpdate(
    req.params.postID,
    {
      "reactions.count": count,
      "reactions.order": order,

      "reactions.likes.count": likes.count,
      "reactions.likes.users": likes.users,

      "reactions.disLikes.count": disLikes.count,
      "reactions.disLikes.users": disLikes.users,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("reactions");
};


exports.addPostsReaction = asyncHandler(async (req, res) => {
  const postReactions = await updateReaction(req, "add");

  res.status(200).json({
    status: "success",

    data: {
      postReactions,
    },
  });
});

exports.removePostsReaction = asyncHandler(async (req, res) => {
  const postFresh = await updateReaction(req, "remove");

  res.status(200).json({
    status: "success",

    data: {
      post: postFresh,
    },
  });
});