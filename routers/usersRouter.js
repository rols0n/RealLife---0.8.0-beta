const express = require("express");

const userController = require("../controllers/user/index");
const userProfileController = require("../controllers/user/profile.controller")
const userFriendsController = require("../controllers/user/friends.controller")
const userGroupsController = require("../controllers/user/groups.controller")
const userSearchEngineController = require("../controllers/user/searchEngine.controller")
const userFeedController = require("../controllers/user/feed.controller")

const authController = require("../controllers/authController");

const router = express.Router();

router.post("/login", authController.login);
router.post("/signup", userController.createUser);

router
  .route("/")
  .post(userController.createUser)
  .get(userController.getAllUsers);

router.route("/generateFeedPosts").get(userFeedController.generateFeedContent);

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
    userProfileController.uploadProfilePicture,
    userProfileController.resizeProfilePicture,
    userProfileController.updateProfilePicture
  );

router
  .route("/updateBannerPicture/:id")
  .patch(
    userProfileController.uploadBannerPicture,
    userProfileController.resizeBannerPicture,
    userProfileController.updateBannerPicture
  );

router
  .route("/sendFriendsRequest/:id")
  .patch(authController.protect, userFriendsController.sendFriendsRequest);

router
  .route("/acceptFriendsRequest/:id")
  .patch(authController.protect, userFriendsController.acceptFriendsRequest);

router
  .route("/rejectFriendsRequest/:id")
  .patch(authController.protect, userFriendsController.rejectFriendsRequest);

router
  .route("/cancelFriendsRequest/:id")
  .patch(authController.protect, userFriendsController.cancelFriendsRequest);

router
  .route("/deleteFriend/:id")
  .patch(authController.protect, userFriendsController.deleteFriend);


router
  .route("/birthdays/:id")
  .get(authController.protect, userFriendsController.birthdays);




router
  .route("/groups/sendRequest/:id")
  .post(authController.protect, userGroupsController.sendGroupsRequests);

router
  .route("/groups/cancelRequest/:id")
  .patch(authController.protect, userGroupsController.cancelGroupsRequests);

router
  .route("/groups/acceptRequest/:id")
  .patch(authController.protect, userGroupsController.acceptGroupsRequests);

router.route(
  "/groups/rejectRequest/:id",
  authController.protect,
  userGroupsController.rejectGroupsRequests
);

router
  .route("/:id/searchEngine/friends")
  .post(userSearchEngineController.searchEngine_friends);

  // ###########
  // People You May Know
  router
    .route("/peopleYouMayKnow_alreadySeen/add")
    .post(authController.protect, userSearchEngineController.pYmK_aS_ADD);



module.exports = router;
