const express = require("express");
const chatController = require("../controllers/chatController.js");
const authController = require("../controllers/authController.js");
const router = express.Router();

router.route("/getAll").get(authController.protect, chatController.getAll);
router
  .route("/getChatByID/:id")
  .get(authController.protect, chatController.getChatByID);

router.route("/create").post(authController.protect, chatController.create);
router.route("/find").post(authController.protect, chatController.findChat);
router
  .route("/delete/:id")
  .delete(authController.protect, chatController.deleteChat);

router
  .route("/messages/upload")
  .post(authController.protect, chatController.uploadMessage);

router
  .route("/content/markAsSeen")
  .patch(authController.protect, chatController.markAsSeen);

module.exports = router;
