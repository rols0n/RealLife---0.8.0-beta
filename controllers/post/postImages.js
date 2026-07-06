const path = require("path");
const fs = require("fs/promises");
const multer = require("multer");
const sharp = require("sharp");

const Post = require("../../models/postModel");
const User = require("../../models/userModel");

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

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image/")) {
    return callback(null, true);
  }

  callback(
    new AppError(
      "You can upload only images",
      400,
      "INVALID_IMAGE_FILE"
    ),
    false
  );
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});


exports.uploadPostImage = upload.single("firstImage");

// ############################################################
// POST IMAGES
// ############################################################

exports.resizePostImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const decoded = await decodingToken(req);

  const post = await Post.findById(req.params.id).select("_id author");

  if (!post) {
    throw new AppError("Post doesn't exist", 404, "POST_NOT_FOUND");
  }

  if (String(post.author) !== String(decoded.id)) {
    throw new AppError(
      "You need to be the author of the post to change its image",
      403,
      "POST_AUTHOR_REQUIRED"
    );
  }

  req.file.filename = `post-image-${post._id}.jpeg`;

  const directory = getPostImagesDirectory(post._id);

  await fs.mkdir(directory, {
    recursive: true,
  });

  await sharp(req.file.buffer)
    .resize(600, 350)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(
      path.join(directory, `first--${req.file.filename}`)
    );

  req.post = post;
  req.authenticatedUserId = decoded.id;

  next();
});

exports.updatePostImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError(
      "This route is only for changing post images",
      400,
      "POST_IMAGE_REQUIRED"
    );
  }

  const post =
    req.post ||
    (await Post.findById(req.params.id).select(
      "_id author firstImage postImages"
    ));

  if (!post) {
    throw new AppError("Post doesn't exist", 404, "POST_NOT_FOUND");
  }

  const userId =
    req.authenticatedUserId ||
    (await decodingToken(req)).id;

  if (String(post.author) !== String(userId)) {
    throw new AppError(
      "You need to be the author of the post to change its image",
      403,
      "POST_AUTHOR_REQUIRED"
    );
  }

  const imagePath = `/imgs/posts/${post._id}/first--${req.file.filename}`;

  await Promise.all([
    Post.findByIdAndUpdate(
      post._id,
      {
        $set: {
          firstImage: imagePath,
        },

        $addToSet: {
          postImages: imagePath,
        },
      },
      {
        runValidators: true,
      }
    ),

    User.findByIdAndUpdate(userId, {
      $addToSet: {
        images: imagePath,
      },
    }),
  ]);

  res.status(200).json({
    status: "success",

    data: {
      imagePath,
    },
  });
});