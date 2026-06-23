const Groups = require("../models/groupModel");
const User = require("../models/userModel");

const decodingToken = require("../utils/decodingToken");
const generatePage = require("../utils/generatePage");

exports.getMainPage = async (req, res, next) => {
  generatePage(req, res, "mainPage", "mainPage");
};

exports.userPage = async (req, res, next) => {
  try {
    if (req.params.id === "undefined" || undefined)
      throw "SOmething went wrong";
    generatePage(req, res, "userPage", "userPage");
  } catch (err) {
    const error = "500 internal server error";
    const description =
      "Something went wrong, wait a moment and refresh the page.";
    console.log(err);
    return res.status(404).render("error.pug", { error, description });
  }
};

exports.friends = async (req, res) => {
  generatePage(req, res, "userPage", "subPages/friends.pug");
};
exports.friends_birthdays = async (req, res) => [
  generatePage(
    req,
    res,
    "userPage",
    "subPages/userPage/friends/birthdays.pug"
  ),
];

exports.informations = async (req, res) => {
  generatePage(req, res, "userPage", "subPages/informations");
};

exports.advancedSettings = async (req, res) => {
  generatePage(
    req,
    res,
    "userPage",
    "subPages/userPage/informations/advanced_settings.pug"
  );
};

exports.manage_friends = async (req, res) => {
  generatePage(
    req,
    res,
    "userPage",
    "subPages/userPage/informations/manage_friends.pug"
  );
};

exports.delete_friend = async (req, res) => {
  generatePage(
    req,
    res,
    "userPage",
    "subPages/userPage/informations/friends/delete_friend.pug"
  );
};

exports.blockList = async (req, res) => {
  generatePage(
    req,
    res,
    "userPage",
    "subPages/userPage/informations/blockList/blockList.pug"
  );
};

exports.bL_manage_list = async (req, res) => {
  generatePage(
    req,
    res,
    "userPage",
    "subPages/userPage/informations/blockList/manage_list.pug"
  );
};

exports.movies = async (req, res) => {
  generatePage(req, res, "userPage", "subPages/movies");
};

exports.photos = async (req, res) => {
  generatePage(req, res, "userPage", "subPages/photos");
};

exports.friendsPage = async (req, res, next) => {
  const decoded = await decodingToken(req);
  const user = await User.findById(decoded.id)
    .populate({ path: "receivedRequests" })
    .populate({ path: "sentRequests" });
  res
    .status(200)
    .render("friends", { loggedUser: user, user, preview: false });
};

exports.friendsWithPreview = async (req, res, next) => {
  generatePage(req, res, "userPage", "friendsCopy");
};

exports.friendsPage_sent = async (req, res) => {
  const decoded = await decodingToken(req);
  const user = await User.findById(decoded.id)
    .populate({ path: "receivedRequests" })
    .populate({ path: "sentRequests" });
  res.status(200).render("managers/friends/sent", {
    loggedUser: user,
    user,
    preview: false,
  });
};
exports.friendsPage_sent_preview = async (req, res) => {
  try {
    generatePage(req, res, "userPage", "managers/friends/sent");
  } catch (err) {
    const error = "500 internal server error";
    const description =
      "Something went wrong, wait a moment and refresh the page.";
    console.log(err);
    return res.status(404).render("error.pug", { error, description });
  }
};

exports.friendsPage_received = async (req, res) => {
  const decoded = await decodingToken(req);
  const user = await User.findById(decoded.id)
    .populate({ path: "receivedRequests" })
    .populate({ path: "sentRequests" });
  res.status(200).render("managers/friends/received", {
    loggedUser: user,
    user,
    preview: false,
  });
};
exports.friendsPage_received_preview = async (req, res) => {
  generatePage(req, res, "userPage", "managers/friends/received");
};

exports.friendsPage_pYmK = async (req, res) => {
  const decoded = await decodingToken(req);
  const user = await User.findById(decoded.id)
    .populate({ path: "receivedRequests" })
    .populate({ path: "sentRequests" });
  res.status(200).render("managers/friends/peopleYouMayKnow", {
    loggedUser: user,
    user,
    preview: false,
  });
};
exports.friendsPage_pYmK_preview = async (req, res, next) => {
  generatePage(req, res, "userPage", "managers/friends/peopleYouMayKnow");
};

exports.loginPage = async (req, res, next) => {
  res.status(200).render("loginPage");
};

exports.signupPage = async (req, res, next) => {
  res.status(200).render("singupPage");
};

// GROUPS

exports.createGroup = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    const loggedUser = await User.findById(decoded.id);
    res.status(200).render("creators/createGroup.pug", { loggedUser });
  } catch (err) {
    const error = "500 internal server error";
    const description =
      "Something went wrong, wait a moment and refresh the page.";
    console.log(err);
    return res.status(404).render("error.pug", { error, description });
  }
};

exports.groupPage = async (req, res) => {
  generatePage(req, res, "groupPage", "subPages/groups/discussion");
  // try {
  // const group = await Groups.findById(req.params.id);
  // console.log(group);
  // res.status(200).render("subPages/groups/discussion", { group });
  // } catch (err) {
  //   const error = "500 internal server error";
  //   const description =
  //     "Something went wrong, wait a moment and refresh the page.";
  //   console.log(err);
  //   return res.status(404).render("error.pug", { error, description });
  // }
};

exports.groupPageRequestsMangaer = async (req, res) => {
  generatePage(
    req,
    res,
    "groupPage",
    "subPages/groups/subPages/requests/manageRequests.pug"
  );
};

exports.aboutSubPage = async (req, res) => {
  try {
    generatePage(req, res, "groupPage", "subPages/groups/about");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.discussionSubPage = async (req, res) => {
  try {
    generatePage(req, res, "groupPage", "subPages/groups/discussion");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.membersSubPage = async (req, res) => {
  try {
    generatePage(req, res, "groupPage", "subPages/groups/members");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

// SUB PAGES of the SUB PAGES
exports.administration = async (req, res) => {
  try {
    generatePage(
      req,
      res,
      "groupPage",
      "subPages/groups/subPages/administration"
    );
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.commonMembers = async (req, res) => {
  try {
    generatePage(
      req,
      res,
      "groupPage",
      "subPages/groups/subPages/commonMembers"
    );
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.newToGroup = async (req, res) => {
  try {
    generatePage(
      req,
      res,
      "groupPage",
      "subPages/groups/subPages/newToGroup"
    );
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.groupsManager = async (req, res) => {
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

  res.status(200).render("groupsManager", {
    loggedUser: user,
    user,
    preview: false,
    previewingGroup: "",
  });
};

exports.groupsManagerWithPreview = async (req, res) => {
  try {
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

    const previewingGroup = await Groups.findById(req.params.id);

    res.status(200).render("groupsManager", {
      loggedUser: user,
      user,
      preview: false,
      previewingGroup,
    });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.groupSettings = async (req, res) => {
  try {
    generatePage(req, res, "groupPage", "subPages/groups/settings");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.manage_administration = async (req, res) => {
  try {
    generatePage(
      req,
      res,
      "groupPage",
      "subPages/groups/subPages/settings/manage_administration"
    );
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.adminsManager = async (req, res) => {
  try {
    generatePage(
      req,
      res,
      "groupPage",
      "subPages/groups/subPages/settings/subPages/admins"
    );
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.modsManager = async (req, res) => {
  try {
    generatePage(
      req,
      res,
      "groupPage",
      "subPages/groups/subPages/settings/subPages/mods"
    );
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

// --

exports.manage_members = async (req, res) => {
  try {
    generatePage(
      req,
      res,
      "groupPage",
      "subPages/groups/subPages/settings/manage_members"
    );
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.remove_member = async (req, res) => {
  try {
    generatePage(
      req,
      res,
      "groupPage",
      "subPages/groups/subPages/settings/subPages/remove_member"
    );
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.advanced_settings = async (req, res) => {
  try {
    generatePage(
      req,
      res,
      "groupPage",
      "subPages/groups/subPages/settings/advanced_settings"
    );
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.rules = async (req, res) => {
  try {
    generatePage(
      req,
      res,
      "groupPage",
      "subPages/groups/subPages/settings/rules"
    );
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

exports.notifications_post = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    const loggedUser = await User.findById(decoded.id);
    res.status(200).render("notifications/post/user's", { loggedUser });
  } catch (err) {
    const error = "500 internal server error";
    const description =
      "Something went wrong, wait a moment and refresh the page.";
    console.log(err);
    return res.status(404).render("error.pug", { error, description });
  }
};

// CHAT
exports.chats = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    const loggedUser = await User.findById(decoded.id);
    res.status(200).render("chats/chats.pug", { loggedUser });
  } catch (err) {
    const error = "500 internal server error";
    const description =
      "Something went wrong, wait a moment and refresh the page.";
    console.log(err);
    return res.status(404).render("error.pug", { error, description });
  }
};
