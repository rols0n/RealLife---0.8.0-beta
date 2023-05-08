const User = require("../models/userModel");
const Group = require("../models/groupModel");

const decodingToken = require("../utils/decodingToken");
const calcTimePassed = require("./calcTimePassed.js");
const generateBtnName = require("./generateBtnName");
const removeDuplicates = require("./removeDuplicates");

const posted = require("./postedInLastTime.js");
const joinedLastWeek = require("./joinedLastWeek");
const thingsInCommon = require("./thingsInCommon.js");
const populatePosts = require("./populatePosts.js");
const populateGroup = require("./populateGroup.js");

const _ = null;

const userAndMainPage = async function (
  req,
  res,
  whichPage,
  pugUrl,
  decoded,
  loggedUser
) {
  if (whichPage === "userPage" || whichPage === "mainPage") {
    const loggedIn = req.params.id === decoded.id ? true : false;
    req.params.id ? req.params.id : (req.params.id = decoded.id);
    const user = await User.findById(req.params.id);
    await Promise.all([
      populatePosts(user),
      user
        .populate({
          path: "friends",
        })
        .execPopulate(),
    ]);

    await loggedUser
      .populate({ path: "notifications", populate: { path: "author users" } })
      .execPopulate();

    if (user === null) {
      throw `User with id ${req.params.id} does not exist`;
    }

    // let posts = [];
    // Array.prototype.forEach.call(user.posts, (post) => {
    //   if (post._id === null) return;
    //   if (post._id.place === "userPage") {
    //     return posts.push(post._id);
    //   } else {
    //     return;
    //   }
    // });

    // console.log("=============l");
    // console.log(posts);
    // console.log("=============l");

    // if (whichPage === "mainPage") {
    //   if (user.friends[0])
    //     for (friend of user.friends) {
    //       if (friend !== decoded.id) {
    //         const friendSchema = await User.findById(friend);
    //         populatePosts(friendSchema);
    //         const friendPosts = Array.prototype.map.call(
    //           friendSchema.posts,
    //           (post) => {
    //             if (post.place === "userPage") {
    //               return post;
    //             } else {
    //               return;
    //             }
    //           }
    //         );

    //         posts.push(...friendPosts);
    //       }
    //     }
    // }

    const whichBtnToDisplay = await generateBtnName(
      User,
      _,
      decoded.id,
      user._id,
      _,
      "friends"
    );

    return res.status(200).render(pugUrl, {
      loggedUser: loggedUser === undefined ? user : loggedUser,
      user,
      // posts: postsNoDuplicates,
      loggedIn,
      whichBtnToDisplay,
      calcTimePassed,
    });
  }
};

const groupPage = async function (
  req,
  res,
  whichPage,
  pugUrl,
  decoded,
  loggedUser
) {
  if (whichPage === "groupPage") {
    // 1) Get the group
    const groupID = req.params.id;
    // console.log(req.params.id);
    const group = await Group.findById(groupID);
    await populateGroup(group);

    const isGroup = group ? true : false;
    if (isGroup === false) throw `Group with provided ID doesn't exist`;

    // 2) if the user is not member of the group, show about page
    const isMember = (await Group.findOne({
      _id: groupID,
      "members._id": decoded.id,
    }))
      ? true
      : false;
    const hasUserReceivedRequest = (await Group.findOne({
      _id: groupID,
      "requests.sent.user": decoded.id,
    }))
      ? true
      : false;
    const hasUserSentRequest = (await Group.findOne({
      _id: groupID,
      "requests.received.user": decoded.id,
    }))
      ? true
      : false;

    // mO stands for memberObject
    let loggedUserRole;
    Array.prototype.map.call(group.members, (element) => {
      const elementID = JSON.stringify(element._id);
      const decodedID = JSON.stringify(decoded.id);

      if (elementID === decodedID) {
        loggedUserRole = element.role;
      }
    });

    // Getting group posts
    const posts = group.posts;
    const whichBtnToDisplay = await generateBtnName(
      _,
      Group,
      decoded.id,
      _,
      groupID,
      "groups"
    );

    const mutualGroupMembers = await thingsInCommon(group, loggedUser);

    // ============
    // Code belows checks if loggedIn user is friend with any of the group's members
    let isFriendsWithMember = false;
    Array.prototype.forEach.call(group.members, async (member) => {
      const schema = member._id;
      schema.friends.forEach((friend) => {
        if (`${decoded.id}` === `${friend}`) isFriendsWithMember = true;
      });
    });

    return res.status(200).render(pugUrl, {
      loggedUser,
      group,
      posts,
      isMember,
      loggedUserRole,
      calcTimePassed,
      hasUserReceivedRequest,
      hasUserSentRequest,
      whichBtnToDisplay,
      generateBtnName,
      User,
      // postedInLastMonth,
      // postedToday,
      // membersJoinedLastWeek,
      mutualGroupMembers,
    });
  }
};

module.exports = async function (req, res, whichPage, pugUrl) {
  try {
    const decoded = await decodingToken(req);
    const loggedUser = await User.findById(decoded.id);
    loggedUser.populate({ path: "receivedRequests" }).execPopulate();
    loggedUser.populate({ path: "sentRequests" }).execPopulate();
    loggedUser.populate({ path: "friends" }).execPopulate();

    if (whichPage === "groupPage")
      groupPage(req, res, whichPage, pugUrl, decoded, loggedUser);
    else userAndMainPage(req, res, whichPage, pugUrl, decoded, loggedUser);
  } catch (err) {
    const error = "500 internal server error";
    const description =
      "Something went wrong, wait a moment and refresh the page.";
    console.log(err);
    return res.status(404).render("pug/error.pug", { error, description });
  }
};
