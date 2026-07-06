const Post = require("../../models/postModel");

const AppError = require("../../middlewares/utils/AppError");
const {
  asyncHandler,
} = require("../../middlewares/utils/asyncHandler");


exports.uploadCommentID = asyncHandler(async (req, res) => {
  if (!req.body.commentID) {
    throw new AppError(
      "Comment ID is required",
      400,
      "COMMENT_ID_REQUIRED"
    );
  }

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: {
        comments: req.body.commentID,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!post) {
    throw new AppError("Post doesn't exist", 404, "POST_NOT_FOUND");
  }

  res.status(200).json({
    status: "success",
    data: post,
  });
});

