const express = require("express");

const authController = require("../controllers/authController");
const groupController = require("../controllers/group/index");

const groupAdministrationController = require("../controllers/group/administration.controller");
const groupMembershipController = require("../controllers/group/membership.controller")
const groupMediaController = require("../controllers/group/media.controller")

const router = express.Router();

router
  .route("/")
  .get(authController.protect, groupController.getAllGroups)
  .post(authController.protect, groupController.createGroup);

router
  .route("/:id")
  .get(authController.protect, groupController.getGroupById)
  .delete(authController.protect, groupController.deleteGroup)
  .patch(authController.protect, groupController.updateGroup);

router
  .route("/leaveGroup/:id")
  .patch(authController.protect, groupController.leaveGroup);


// =====

router
  .route("/:id/administrators")
  .post(authController.protect, groupAdministrationController.addNewAdmin)
  .delete(authController.protect, groupAdministrationController.removeAdmin);
router
  .route("/:id/moderators")
  .post(authController.protect, groupAdministrationController.addNewModerator)
  .delete(authController.protect, groupAdministrationController.deleteModerator);

router
  .route("/removeMember/:id")
  .delete(authController.protect, groupAdministrationController.removeUser);


// ======================

router
  .route("/request/sendInvitation/:id")
  .post(authController.protect, groupMembershipController.sendGroupInvitation);

router
  .route("/request/cancelInvitation/:id")
  .patch(authController.protect, groupMembershipController.cancelGroupInvitation);

router
  .route("/request/acceptGroupRequest/:id")
  .patch(authController.protect, groupMembershipController.acceptGroupRequest);

router
  .route("/request/rejectGroupRequest/:id")
  .patch(authController.protect, groupMembershipController.rejectGroupRequest);



//==================================
router
  .route("/updateAvatarImage/:id")
  .patch(
    groupMediaController.uploadAvatarImage,
    groupMediaController.resizeAvatarImage,
    groupMediaController.updateAvatarImage
  );

router
  .route("/updateBannerImage/:id")
  .patch(
    groupMediaController.uploadBannerImage,
    groupMediaController.resizeBannerImage,
    groupMediaController.updateBannerImage
  );

module.exports = router;
