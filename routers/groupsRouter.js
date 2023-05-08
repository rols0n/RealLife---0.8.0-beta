const express = require("express");

const authController = require("../controllers/authController");
const groupsController = require("../controllers/groupController");
const router = express.Router();

router
  .route("/")
  .get(authController.protect, groupsController.getAllGroups)
  .post(authController.protect, groupsController.createGroup);

router
  .route("/:id")
  .get(authController.protect, groupsController.getGroupById)
  .delete(authController.protect, groupsController.deleteGroup)
  .patch(authController.protect, groupsController.updateGroup);

router
  .route("/:id/administrators")
  .post(authController.protect, groupsController.addNewAdmin)
  .delete(authController.protect, groupsController.removeAdmin);
router
  .route("/:id/moderators")
  .post(authController.protect, groupsController.addNewModerator)
  .delete(authController.protect, groupsController.deleteModerator);

router
  .route("/removeMember/:id")
  .delete(authController.protect, groupsController.removeUser);

router
  .route("/leaveGroup/:id")
  .patch(authController.protect, groupsController.leaveGroup);

router
  .route("/request/sendInvitation/:id")
  .post(authController.protect, groupsController.sendGroupInvitation);

router
  .route("/request/cancelInvitation/:id")
  .patch(authController.protect, groupsController.cancelGroupInvitation);

router
  .route("/request/acceptGroupRequest/:id")
  .patch(authController.protect, groupsController.acceptGroupRequest);

router
  .route("/request/rejectGroupRequest/:id")
  .patch(authController.protect, groupsController.rejectGroupRequest);

// IMAGES
router
  .route("/updateAvatarImage/:id")
  .patch(
    groupsController.uploadAvatarImage,
    groupsController.resizeAvatarImage,
    groupsController.updateAvatarImage
  );

router
  .route("/updateBannerImage/:id")
  .patch(
    groupsController.uploadBannerImage,
    groupsController.resizeBannerImage,
    groupsController.updateBannerImage
  );

module.exports = router;
