const path = require("path");
const fs = require("fs/promises");

const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Group = require("../../models/groupModel");

const handlerController = require("../handlerController");

const decodingToken = require("../../utils/decodingToken");

const AppError = require("../../middlewares/utils/AppError");
const {
  asyncHandler,
} = require("../../middlewares/utils/asyncHandler");

const POSTS_IMAGES_DIRECTORY = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "imgs",
  "posts"
);

const getPostImagesDirectory = (postId) =>
  path.join(POSTS_IMAGES_DIRECTORY, String(postId));



// ############################################################
// BASIC POST CRUD
// ############################################################

exports.getAllPosts = asyncHandler(async (req, res) => {
  return handlerController.getAll(req, res, Post);
});

exports.updatePost = asyncHandler(async (req, res) => {
  return handlerController.update(req, res, Post);
});

exports.getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate(
      "cantBeDisplayedBy",
      "firstName lastName _id profileImage"
    )
    .populate(
      "author",
      "_id firstName lastName profileImage bannerImage"
    )
    .populate({
      path: "comments",

      populate: {
        path: "tree",

        populate: {
          path: "author replies",

          populate: {
            path: "author subReplies",

            populate: {
              path: "author",
            },

            select: "firstName lastName profileImage _id",
          },

          select: "firstName lastName profileImage _id",
        },
      },
    });

  if (!post) {
    throw new AppError("Post doesn't exist", 404, "POST_NOT_FOUND");
  }

  res.status(200).json({
    status: "success",

    data: {
      data: post,
    },
  });
});

// ############################################################
// CREATE POST
// ############################################################

exports.createPost = asyncHandler(async (req, res) => {
  const decoded = await decodingToken(req);

  const user = await User.findById(decoded.id).select("_id");

  if (!user) {
    throw new AppError(
      "You need to be logged in to create a post",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  if (req.body.place === "groupPage") {
    if (!req.body.groupID) {
      throw new AppError(
        "Group ID is required",
        400,
        "GROUP_ID_REQUIRED"
      );
    }

    const groupExists = await Group.exists({
      _id: req.body.groupID,
    });

    if (!groupExists) {
      throw new AppError(
        "Group doesn't exist",
        404,
        "GROUP_NOT_FOUND"
      );
    }
  }

  const post = await Post.create({
    ...req.body,
    author: user._id,
  });

  const postDirectory = getPostImagesDirectory(post._id);

  try {
    await fs.mkdir(postDirectory, {
      recursive: true,
    });

    if (req.body.place === "userPage") {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $push: {
            posts: {
              $each: [
                {
                  _id: post._id,
                  place: req.body.place,
                },
              ],

              $position: 0,
            },
          },
        }
      );

      if (!updatedUser) {
        throw new AppError(
          "Post author doesn't exist",
          404,
          "POST_AUTHOR_NOT_FOUND"
        );
      }
    }

    if (req.body.place === "groupPage") {
      const updatedGroup = await Group.findByIdAndUpdate(
        req.body.groupID,
        {
          $push: {
            posts: {
              $each: [
                {
                  _id: post._id,
                  place: req.body.place,
                },
              ],

              $position: 0,
            },
          },
        }
      );

      if (!updatedGroup) {
        throw new AppError(
          "Group doesn't exist",
          404,
          "GROUP_NOT_FOUND"
        );
      }
    }
  } catch (err) {
    await Promise.allSettled([
      Post.findByIdAndDelete(post._id),

      fs.rm(postDirectory, {
        recursive: true,
        force: true,
      }),
    ]);

    throw err;
  }

  res.status(200).json({
    status: "success",

    data: {
      data: post,
    },
  });
});

// ############################################################
// DELETE POST
// ############################################################

exports.deletePost = asyncHandler(async (req, res) => {
  const decoded = await decodingToken(req);

  const post = await Post.findById(req.params.id).populate(
    "author",
    "_id friends"
  );

  if (!post) {
    throw new AppError("Post doesn't exist", 404, "POST_NOT_FOUND");
  }

  if (!post.author) {
    throw new AppError(
      "Post author doesn't exist",
      404,
      "POST_AUTHOR_NOT_FOUND"
    );
  }

  if (String(post.author._id) !== String(decoded.id)) {
    throw new AppError(
      "You need to be the author of the post to delete it",
      403,
      "POST_AUTHOR_REQUIRED"
    );
  }

  const postId = post._id;
  const postDirectory = getPostImagesDirectory(postId);

  const friendsIds = post.author.friends || [];

  const usersIds = [
    ...new Set([
      ...friendsIds.map((id) => String(id)),
      String(post.author._id),
    ]),
  ];

  const postImages = post.postImages || [];

  const cleanupOperations = [
    User.updateMany(
      {
        _id: {
          $in: usersIds,
        },
      },
      {
        $pull: {
          posts: {
            _id: postId,
          },
        },
      }
    ),

    Group.updateMany(
      {
        "posts._id": postId,
      },
      {
        $pull: {
          posts: {
            _id: postId,
          },
        },
      }
    ),

    fs.rm(postDirectory, {
      recursive: true,
      force: true,
    }),
  ];

  if (postImages.length > 0) {
    cleanupOperations.push(
      User.findByIdAndUpdate(decoded.id, {
        $pull: {
          images: {
            $in: postImages,
          },
        },
      })
    );
  }

  await Promise.all(cleanupOperations);

  await Post.findByIdAndDelete(postId);

  res.status(200).json({
    status: "success",
    data: {},
  });
});