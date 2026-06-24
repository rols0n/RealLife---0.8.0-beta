const express = require("express");
const postController = require("../controllers/postController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(postController.getAllPosts)
  .post(postController.createPost);

// router.post("/", (req, res) => {
//   console.log("CREATE POST ROUTE HIT");
//   res.json({ status: "ok" });
// });


router
  .route("/:id")
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost)
  .get(authController.protect, postController.getPostById);

router
  .route("/uploadImage/:id")
  .patch(
    postController.uploadPostImage,
    postController.resizePostImage,
    postController.updatePostImage
  );

router
  .route("/uploadCommentID/:id")
  .post(authController.protect, postController.uploadCommentID);
router
  .route("/addPostsReaction/:postID")
  .post(authController.protect, postController.addPostsReaction);
router
  .route("/removePostsReaction/:postID")
  .delete(authController.protect, postController.removePostsReaction);
module.exports = router;
