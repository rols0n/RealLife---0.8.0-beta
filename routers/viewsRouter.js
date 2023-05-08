const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const router = express.Router();

router.get("/", authController.protect, viewController.getMainPage);
router.get("/userPage", authController.protect, viewController.userPage);
router.get("/userPage/:id", authController.protect, viewController.userPage);

router.get(
  "/userPage/:id/informations",
  authController.protect,
  viewController.informations
);

router.get(
  "/userPage/:id/informations/advanced",
  authController.protect,
  viewController.advancedSettings
);

router.get(
  "/userPage/:id/informations/manage_friends",
  authController.protect,
  viewController.manage_friends
);

router.get(
  "/userPage/:id/informations/manage_friends/delete_friend",
  authController.protect,
  viewController.delete_friend
);

router.get(
  "/userPage/:id/informations/block_List",
  authController.protect,
  viewController.blockList
);

router.get(
  "/userPage/:id/informations/block_List/manage_list",
  authController.protect,
  viewController.bL_manage_list
);

router.get(
  "/userPage/:id/friends",
  authController.protect,
  viewController.friends
);
router.get(
  "/userPage/:id/friends/birthdays",
  authController.protect,
  viewController.friends_birthdays
);

router.get(
  "/userPage/:id/photos",
  authController.protect,
  viewController.photos
);
router.get(
  "/userPage/:id/movies",
  authController.protect,
  viewController.movies
);

router.get("/friends", authController.protect, viewController.friendsPage);

router.get(
  "/friends/received",
  authController.protect,
  viewController.friendsPage_received
);
router.get(
  "/friends/received/:id",
  authController.protect,
  viewController.friendsPage_received_preview
);

router.get(
  "/friends/sent/:id",
  authController.protect,
  viewController.friendsPage_sent_preview
);

router.get(
  "/friends/sent",
  authController.protect,
  viewController.friendsPage_sent
);

router.get(
  "/friends/people-you-may-know",
  authController.protect,
  viewController.friendsPage_pYmK
);
router.get(
  "/friends/people-you-may-know/:id",
  authController.protect,
  viewController.friendsPage_pYmK_preview
);

// GROUPS
router.get("/groups", authController.protect, viewController.groupsManager);
router.get(
  "/groups/:id",
  authController.protect,
  viewController.groupsManagerWithPreview
);

router.get(
  "/creators/create-group",
  authController.protect,
  viewController.createGroup
);

router.get("/group/:id", authController.protect, viewController.groupPage);

router.get(
  "/group/:id/manageRequests",
  authController.protect,
  viewController.groupPageRequestsMangaer
);

router.get(
  "/group/:id/about",
  authController.protect,
  viewController.aboutSubPage
);
router.get(
  "/group/:id/discussion",
  authController.protect,
  viewController.discussionSubPage
);

router.get(
  "/group/:id/members",
  authController.protect,
  viewController.membersSubPage
);

router.get(
  "/group/:id/members/administration",
  authController.protect,
  viewController.administration
);

router.get(
  "/group/:id/members/members_with_things_in_common",
  authController.protect,
  viewController.commonMembers
);

router.get(
  "/group/:id/members/new_to_the_group",
  authController.protect,
  viewController.newToGroup
);

// GROUP SETTINGS
router.get(
  "/group/:id/settings",
  authController.protect,
  viewController.groupSettings
);

router.get(
  "/group/:id/settings/manage_administration",
  authController.protect,
  viewController.manage_administration
);

router.get(
  "/group/:id/settings/manage_administration/admins",
  authController.protect,
  viewController.adminsManager
);

router.get(
  "/group/:id/settings/manage_administration/mods",
  authController.protect,
  viewController.modsManager
);

router.get(
  "/group/:id/settings/manage_members",
  authController.protect,
  viewController.manage_members
);

router.get(
  "/group/:id/settings/manage_members/remove_member",
  authController.protect,
  viewController.remove_member
);

router.get(
  "/group/:id/settings/advanced_settings",
  authController.protect,
  viewController.advanced_settings
);

router.get(
  "/group/:id/settings/rules",
  authController.protect,
  viewController.rules
);

router.get("/chats", authController.protect, viewController.chats);

// #############
// # post Notification previews

router.get("/notifications/post", viewController.notifications_post);

router.get("/login", viewController.loginPage);
router.get("/signup", viewController.signupPage);

module.exports = router;
