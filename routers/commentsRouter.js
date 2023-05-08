const express = require("express");
const commentController = require("../controllers/commentController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(commentController.getAllComments)
  .post(commentController.createComment);

router
  .route("/:id")
  .patch(commentController.updateComment)
  .get(commentController.getCommentById)
  .delete(commentController.deleteComment);

router
  .route("/updateLevelTwoRespond/:id")
  .post(commentController.updateLevelTwoRespond);

router
  .route("/updateLevelThreeRespond/:id")
  .post(commentController.updateLevelThreeRespond);

router.route("/reactToComment/:treeID").post(commentController.reactToComment);
router
  .route("/removeReaction/:treeID")
  .delete(commentController.removeReaction);
module.exports = router;
