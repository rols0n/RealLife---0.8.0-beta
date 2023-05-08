const Post = require("../models/postModel");
const User = require("../models/userModel");
const Group = require("../models/groupModel");

const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const handlerController = require("../controllers/handlerController");

const generateReactionsObj = require("../utils/generateReactionsObj.js");

const decodingToken = require("../utils/decodingToken");
const { countDocuments } = require("../models/postModel");
const { decode } = require("punycode");

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
});

exports.uploadPostImage = upload.single("firstImage");
exports.resizePostImage = async (req, res, next) => {
  if (!req.file) return next();

  // 3) Checking if POST still exists
  const post = await Post.findById(req.params.id);

  req.file.filename = `profile-image-${post._id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 350)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`views/imgs/posts/${post._id}/first--${req.file.filename}`);

  next();
};

exports.updatePostImage = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    if (!req.file) {
      res.status(404).json({
        status: "fail",
        message: "This route is only for changing post images",
      });
    }

    const decoded = await decodingToken(req);

    const imagePath = `/imgs/posts/${post._id}/first--${req.file.filename}`;
    await Post.findByIdAndUpdate(post._id, {
      firstImage: imagePath,
      postImages: imagePath,
    });

    await User.findByIdAndUpdate(decoded.id, {
      $push: {
        images: imagePath,
      },
    });

    res.status(200).json({
      status: "success",
      data: { imagePath },
    });
  }
};

exports.getAllPosts = async (req, res) => {
  handlerController.getAll(req, res, Post);
};

exports.updatePost = async (req, res) => {
  handlerController.update(req, res, Post);
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("cantBeDisplayedBy", "firstName lastName _id profileImage")
      .populate("author", "_id firstName lastName profileImage bannerImage")
      .populate("comments")
      .populate({
        path: "comments",
        populate: {
          path: "tree",
          populate: {
            path: "author replies",
            populate: {
              path: "author subReplies",
              populate: { path: "author" },
              select: "firstName lastName profileImage _id",
            },
            select: "firstName lastName profileImage _id",
          },
        },
      });

    res.status(200).json({
      status: "success",
      data: {
        data: post,
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
exports.deletePost = async (req, res) => {
  try {
    const decoded = await decodingToken(req);

    // 1) Find post
    const post = await Post.findById(req.params.id).populate("author");

    const postId = post._id;

    if (`${post.author._id}` !== `${decoded.id}`)
      throw `User needs to be author of  post to delete the post.`;

    const dir = `./views/imgs/posts/${post._id}`;
    await fs.rm(dir, { recursive: true, force: true }, (err) => {
      if (err) {
        console.log("error");
      }
      console.log(`${dir} is deleted!`);
    });

    // 2) get the Author ID
    const postAuthorId = post.author._id;

    // 3) Get Author Friends ID and Make an array of these IDs
    const usersIDs = [...post.author.friends, postAuthorId];

    // 4) Loop over them, find the user with id,
    usersIDs.forEach(async (element) => {
      await User.findByIdAndUpdate(element, {
        // 5) delete from the USER'S posts ARRAY id of the post that you want to delete now
        $pull: {
          posts: {
            _id: postId,
          },
        },
      });
    });

    // await User.findById()
    Array.from(post.postImages).forEach(async (img) => {
      console.log(img);
      await User.updateOne({ _id: decoded.id }, { $pull: { images: img } });
    });

    await Post.findByIdAndRemove(req.params.id);
    res.status(200).json({ status: "success", data: {} });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err: {
        err,
      },
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    // While creating the post, it should send the id to the posts Array of all it's friends

    const decoded = await decodingToken(req);
    const user = await User.findById(decoded.id).select("friends");
    req.body.author = user._id;
    const post = await Post.create(req.body);
    fs.mkdirSync(`./views/imgs/posts/${post._id}`);

    if (req.body.place === "userPage") {
      await User.findByIdAndUpdate(decoded.id, {
        $push: {
          posts: {
            $each: [{ _id: post._id, place: req.body.place }],
            $position: 0,
          },
        },
      });

      console.log({ _id: post._id, place: req.body.place });
    }

    if (req.body.place === "groupPage") {
      await Group.findByIdAndUpdate(
        { _id: req.body.groupID },
        {
          $push: {
            $each: [{ _id: post._id, place: req.body.place }],
            $position: 0,
          },
        }
      );
    }
    res.status(200).json({
      status: "success",
      data: {
        data: post,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};

module.exports.uploadCommentID = async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, {
    $push: { comments: req.body.commentID },
  });

  console.log(post);
  res.status(200).json({
    status: "success",
    data: post,
  });
};

// reactions
module.exports.addPostsReaction = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postID);
    const reaction = req.body.reaction;
    const decoded = await decodingToken(req);
    const user = await User.findById(decoded.id);
    if (!user) throw `U need to be logged in`;
    let {
      likes: rawlikes,
      disLikes: rawDisLikes,

      order: rawOrder,
    } = post.reactions;
    if (reaction !== "like" && reaction !== "disLike") {
      throw `Reaction can be either: "like" or "disLike"`;
    }

    const { disLikes, likes, count, order } = generateReactionsObj(
      "add",
      rawDisLikes,
      rawlikes,
      decoded.id,
      reaction,
      rawOrder
    );

    await Post.findByIdAndUpdate(req.params.postID, {
      "reactions.count": count,
      "reactions.order": order,
      "reactions.likes.count": likes.count,
      "reactions.disLikes.count": disLikes.count,
      "reactions.likes.users": likes.users,
      "reactions.disLikes.users": disLikes.users,
    });

    const postReactions = await Post.findById(req.params.postID).select(
      "reactions"
    );
    res.status(200).json({
      status: "success",
      data: { postReactions },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};

module.exports.removePostsReaction = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    const user = await User.findById(decoded.id);
    if (!user) throw `U need to be logged in.`;
    const post = await Post.findById(req.params.postID).select("reactions");

    let {
      likes: rawlikes,
      disLikes: rawDisLikes,

      order: rawOrder,
    } = post.reactions;
    if (reaction !== "like" && reaction !== "disLike") {
      throw `Reaction can be either: "like" or "disLike"`;
    }

    const { disLikes, likes, count, order } = generateReactionsObj(
      "add",
      rawDisLikes,
      rawlikes,
      decoded.id,
      reaction,
      rawOrder
    );

    await Post.findByIdAndUpdate(req.params.postID, {
      "reactions.count": count,
      "reactions.order": order,
      "reactions.likes.count": likes.count,
      "reactions.likes.users": likes.users,
      "reactions.disLikes.count": disLikes.count,
      "reactions.disLikes.users": disLikes.users,
    });

    const postFresh = await Post.findById(req.params.postID).select(
      "reactions"
    );
    res.status(200).json({
      status: "success",
      data: { post: postFresh },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};

//
