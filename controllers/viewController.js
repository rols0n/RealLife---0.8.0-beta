const Group = require("../models/groupModel");
const User = require("../models/userModel");

const decodingToken = require("../utils/decodingToken");
const generatePage = require("../utils/generatePage");

const { asyncHandler } = require("../middlewares/utils/asyncHandler");
const AppError = require("../middlewares/utils/AppError");

const renderGeneratedPage = (page, subPage) =>
  asyncHandler(async (req, res) => {
    await generatePage(req, res, page, subPage);
  });

const getLoggedUser = async (req) => {
  const decoded = await decodingToken(req);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("User doesn't exist", 404, "USER_NOT_FOUND");
  }

  return user;
};

const getFriendsManagerUser = async (req) => {
  const decoded = await decodingToken(req);

  const user = await User.findById(decoded.id)
    .populate({ path: "receivedRequests" })
    .populate({ path: "sentRequests" });

  if (!user) {
    throw new AppError("User doesn't exist", 404, "USER_NOT_FOUND");
  }

  return user;
};

const getGroupsManagerUser = async (req) => {
  const decoded = await decodingToken(req);

  const user = await User.findById(decoded.id)
    .populate({ path: "receivedRequests" })
    .populate({ path: "sentRequests" })
    .populate({
      path: "groups",
      populate: {
        path: "currentlyIn",
        populate: {
          path: "_id",
          ref: "Groups",
        },
      },
    })
    .populate({
      path: "groups",
      populate: {
        path: "requests.received",
        populate: {
          path: "group",
          ref: "Groups",
        },
      },
    })
    .populate({
      path: "groups",
      populate: {
        path: "requests.sent",
        populate: {
          path: "group",
          ref: "Groups",
        },
      },
    });

  if (!user) {
    throw new AppError("User doesn't exist", 404, "USER_NOT_FOUND");
  }

  return user;
};

const renderLoggedUserPage = (view) =>
  asyncHandler(async (req, res) => {
    const loggedUser = await getLoggedUser(req);

    res.status(200).render(view, { loggedUser });
  });

const renderFriendsManagerPage = (view) =>
  asyncHandler(async (req, res) => {
    const user = await getFriendsManagerUser(req);

    res.status(200).render(view, {
      loggedUser: user,
      user,
      preview: false,
    });
  });

// GENERAL PAGES

exports.getMainPage = renderGeneratedPage("mainPage", "mainPage");

exports.userPage = asyncHandler(async (req, res) => {
  if (!req.params.id || req.params.id === "undefined") {
    throw new AppError("Invalid user id", 400, "INVALID_USER_ID");
  }

  await generatePage(req, res, "userPage", "userPage");
});

exports.friends = renderGeneratedPage(
  "userPage",
  "subPages/friends.pug"
);

exports.friends_birthdays = renderGeneratedPage(
  "userPage",
  "subPages/userPage/friends/birthdays.pug"
);

exports.informations = renderGeneratedPage(
  "userPage",
  "subPages/informations"
);

exports.advancedSettings = renderGeneratedPage(
  "userPage",
  "subPages/userPage/informations/advanced_settings.pug"
);

exports.manage_friends = renderGeneratedPage(
  "userPage",
  "subPages/userPage/informations/manage_friends.pug"
);

exports.delete_friend = renderGeneratedPage(
  "userPage",
  "subPages/userPage/informations/friends/delete_friend.pug"
);

exports.blockList = renderGeneratedPage(
  "userPage",
  "subPages/userPage/informations/blockList/blockList.pug"
);

exports.bL_manage_list = renderGeneratedPage(
  "userPage",
  "subPages/userPage/informations/blockList/manage_list.pug"
);

exports.movies = renderGeneratedPage(
  "userPage",
  "subPages/movies"
);

exports.photos = renderGeneratedPage(
  "userPage",
  "subPages/photos"
);

// FRIENDS

exports.friendsPage = renderFriendsManagerPage("friends");

exports.friendsWithPreview = renderGeneratedPage(
  "userPage",
  "friendsCopy"
);

exports.friendsPage_sent = renderFriendsManagerPage(
  "managers/friends/sent"
);

exports.friendsPage_sent_preview = renderGeneratedPage(
  "userPage",
  "managers/friends/sent"
);

exports.friendsPage_received = renderFriendsManagerPage(
  "managers/friends/received"
);

exports.friendsPage_received_preview = renderGeneratedPage(
  "userPage",
  "managers/friends/received"
);

exports.friendsPage_pYmK = renderFriendsManagerPage(
  "managers/friends/peopleYouMayKnow"
);

exports.friendsPage_pYmK_preview = renderGeneratedPage(
  "userPage",
  "managers/friends/peopleYouMayKnow"
);

// AUTH PAGES

exports.loginPage = (req, res) => {
  res.status(200).render("loginPage");
};

exports.signupPage = (req, res) => {
  res.status(200).render("singupPage");
};

// GROUPS

exports.createGroup = renderLoggedUserPage(
  "creators/createGroup.pug"
);

exports.groupPage = renderGeneratedPage(
  "groupPage",
  "subPages/groups/discussion"
);

exports.groupPageRequestsMangaer = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/requests/manageRequests.pug"
);

exports.aboutSubPage = renderGeneratedPage(
  "groupPage",
  "subPages/groups/about"
);

exports.discussionSubPage = renderGeneratedPage(
  "groupPage",
  "subPages/groups/discussion"
);

exports.membersSubPage = renderGeneratedPage(
  "groupPage",
  "subPages/groups/members"
);

// GROUP SUBPAGES

exports.administration = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/administration"
);

exports.commonMembers = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/commonMembers"
);

exports.newToGroup = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/newToGroup"
);

exports.groupsManager = asyncHandler(async (req, res) => {
  const user = await getGroupsManagerUser(req);

  res.status(200).render("groupsManager", {
    loggedUser: user,
    user,
    preview: false,
    previewingGroup: "",
  });
});

exports.groupsManagerWithPreview = asyncHandler(async (req, res) => {
  const [user, previewingGroup] = await Promise.all([
    getGroupsManagerUser(req),
    Group.findById(req.params.id),
  ]);

  if (!previewingGroup) {
    throw new AppError(
      "Group doesn't exist",
      404,
      "GROUP_NOT_FOUND"
    );
  }

  res.status(200).render("groupsManager", {
    loggedUser: user,
    user,
    preview: false,
    previewingGroup,
  });
});

// GROUP SETTINGS

exports.groupSettings = renderGeneratedPage(
  "groupPage",
  "subPages/groups/settings"
);

exports.manage_administration = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/settings/manage_administration"
);

exports.adminsManager = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/settings/subPages/admins"
);

exports.modsManager = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/settings/subPages/mods"
);

exports.manage_members = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/settings/manage_members"
);

exports.remove_member = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/settings/subPages/remove_member"
);

exports.advanced_settings = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/settings/advanced_settings"
);

exports.rules = renderGeneratedPage(
  "groupPage",
  "subPages/groups/subPages/settings/rules"
);

// NOTIFICATIONS

exports.notifications_post = renderLoggedUserPage(
  "notifications/post/user's"
);

// CHAT

exports.chats = renderLoggedUserPage("chats/chats.pug");