const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.login);
router.post("/signup", userController.createUser);

router
  .route("/")
  .post(userController.createUser)
  .get(userController.getAllUsers);

router.route("/generateFeedPosts").get(userController.generateFeedContent);

router
  .route("/:id")
  .patch(userController.updateUser)
  .get(userController.getUserById)
  .delete(userController.deleteUser);

router
  .route("/:id/blockList/deleteUser")
  .patch(userController.deleteUsersFromBlockList);

router
  .route("/uploadRootCommentText/:id")
  .patch(userController.uploadRootCommentText);

router
  .route("/updateProfilePicture/:random")
  .patch(
    userController.uploadProfilePicture,
    userController.resizeProfilePicture,
    userController.updateProfilePicture
  );

router
  .route("/updateBannerPicture/:id")
  .patch(
    userController.uploadBannerPicture,
    userController.resizeBannerPicture,
    userController.updateBannerPicture
  );

router
  .route("/sendFriendsRequest/:id")
  .patch(authController.protect, userController.sendFriendsRequest);

router
  .route("/acceptFriendsRequest/:id")
  .patch(authController.protect, userController.acceptFriendsRequest);

router
  .route("/rejectFriendsRequest/:id")
  .patch(authController.protect, userController.rejectFriendsRequest);

router
  .route("/cancelFriendsRequest/:id")
  .patch(authController.protect, userController.cancelFriendsRequest);

router
  .route("/deleteFriend/:id")
  .patch(authController.protect, userController.deleteFriend);

router
  .route("/groups/sendRequest/:id")
  .post(authController.protect, userController.sendGroupsRequests);

router
  .route("/groups/cancelRequest/:id")
  .patch(authController.protect, userController.cancelGroupsRequests);

router
  .route("/groups/acceptRequest/:id")
  .patch(authController.protect, userController.acceptGroupsRequests);

router.route(
  "/groups/rejectRequest/:id",
  authController.protect,
  userController.rejectGroupsRequests
);

router
  .route("/:id/searchEngine/friends")
  .post(userController.searchEngine_friends);

router
  .route("/birthdays/:id")
  .get(authController.protect, userController.birthdays);

// ###########
// People You May Know
router
  .route("/peopleYouMayKnow_alreadySeen/add")
  .post(authController.protect, userController.pYmK_aS_ADD);

module.exports = router;
