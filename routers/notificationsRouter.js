const express = require("express");
const notificationController = require("../controllers/notificationController");
const router = express.Router();

router.route("/requests/upload").post(notificationController.upload);

router.route("/delete").delete(notificationController.delete);
router.route("/markAllAsSeen").patch(notificationController.markAllAsSeen);
router
  .route("/getUsersNotifications")
  .get(notificationController.getUsersNotifications);

module.exports = router;
