const User = require("../models/userModel");
const Group = require("../models/groupModel");
const decodingToken = require("../utils/decodingToken.js");

const searcher = async (req, res, allPlatform) => {
  const allUsers = Array.from(await User.find());
  const matched = [];
  const searchValue = req.body.searchValue.replace(/\s+/g, "").toLowerCase();
  // console.log(allUsers);
  allUsers.forEach((user) => {
    const userName = `${user.firstName}${user.lastName}`
      .replace(/\s+/g, "")
      .toLowerCase();
    // console.log(searchValue);
    if (userName.startsWith(searchValue)) matched.push(user);
  });
  if (allPlatform) {
    const allGroups = Array.from(await Group.find());
    allGroups.forEach((group) => {
      const groupName = group.name.replace(/\s+/g, "").toLowerCase();
      if (groupName.startsWith(searchValue)) matched.push(group);
    });
  }

  return matched;
};

const genMutualFriends = (user, friend, friends) => {
  const mutualFriends = [];

  const potMutualFriends = Array.from(friend.friends);
  potMutualFriends.forEach((potMutualFriend) => {
    friends.forEach((friend) => {
      if (
        `${friend._id}` === `${potMutualFriend._id}` &&
        `${potMutualFriend._id}` !== `${user._id}`
      ) {
        mutualFriends.push(potMutualFriend);
      }
    });
  });

  return mutualFriends;
};

exports.searchAllUser = async (req, res) => {
  try {
    const matched = await searcher(req, res);
    res
      .status(200)
      .json({ status: "success", data: { length: matched.length, matched } });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};

exports.searchRealLife = async (req, res) => {
  try {
    const matched = await searcher(req, res, true);
    res
      .status(200)
      .json({ status: "success", data: { length: matched.length, matched } });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};

exports.peopleYouMayKnow = async (req, res) => {
  try {
    // ####
    // 1. Mutual friends - sort them by amount of mutual friends
    // 2. Common groups
    // 3. All other users
    // Implement paging

    const notAllowedFix = (array) => {
      Array.from(array).forEach((el) => notAllowed.push(el._id));
    };
    const decoded = await decodingToken(req);
    // const users = Array.from(await User.find());
    const user = await User.findById(decoded.id)
      .populate({
        path: "friends",
        populate: {
          path: "friends",
        },
      })
      .populate({
        path: "groups.currentlyIn",
        populate: {
          path: "_id",
          populate: {
            path: "members",
            populate: { path: "_id" },
          },
        },
      });

    const friends = Array.from(user.friends);
    const groups = Array.from(user.groups.currentlyIn);
    const matched = [];
    const notAllowed = req.body.notAllowed;
    notAllowedFix(user.friends);
    notAllowedFix(user.sentRequests);
    notAllowedFix(user.receivedRequests);

    // if (user.peopleYouMayKnow__alreadySeen)
    //   notAllowed.push(...user.peopleYouMayKnow__alreadySeen);

    friends.forEach((friend) => {
      const friendsOfFriend = Array.from(friend.friends);
      // randomize
      friendsOfFriend.forEach((friendOfFriend) => {
        const mutualFriends = genMutualFriends(user, friendOfFriend, friends);
        if (mutualFriends.length > 0 && matched.length < 7) {
          let canContinue = true;
          notAllowed.forEach((el) => {
            if (`${el}` === `${friendOfFriend._id}`) canContinue = false;
          });
          notAllowed.push(friendOfFriend._id);
          if (canContinue)
            matched.push({
              user: {
                _id: friendOfFriend._id,
                firstName: friendOfFriend.firstName,
                lastName: friendOfFriend.lastName,
                profileImage: friendOfFriend.profileImage,
              },
              mutualFriends: mutualFriends.length,
            });
        }
      });
    });

    let count = 0;

    if (groups.length > 0 && matched.length < 7)
      for (let i = 0; i < 20; i++) {
        count++;
        if (matched.length < 7) {
          const randomGroup =
            groups[Math.floor(Math.random() * groups.length)]._id;
          // console.log(Math.floor(Math.random() * groups.length));
          if (!randomGroup) return;
          const groupName = randomGroup.name;
          const member =
            randomGroup.members[
              Math.floor(Math.random() * randomGroup.members.length)
            ];
          let canContinue = true;
          notAllowed.forEach((el) => {
            if (`${el}` === `${member._id._id}`) canContinue = false;
          });

          if (canContinue) {
            matched.push({
              user: {
                _id: member._id._id,
                firstName: member._id.firstName,
                lastName: member._id.lastName,
                profileImage: member._id.profileImage,
              },
              groupName,
            });
            // console.log(member);
            notAllowed.push(member._id._id);
          }
        }
      }

    // for (let i = 0; i < 10; i++) {
    //   if (matched.length < 8) {
    //     const randomNum = Math.floor(Math.random() * users.length);
    //     const randomUser = users[randomNum];
    //     let canContinue = true;
    //     const obj = {
    //       user: {
    //         _id: randomUser._id,
    //         firstName: randomUser.firstName,
    //         lastName: randomUser.firstName,
    //         profileImage: randomUser.profileImage,
    //       },
    //     };
    //     notAllowed.forEach((el) => {
    //       if (`${el}` === `${randomUser._id}`) canContinue = false;
    //     });
    //     if (canContinue && `${randomUser._id}` !== `${user._id}`) {
    //       if (randomUser.cityHome === user.cityHome) {
    //         matched.push(obj);
    //       } else if (randomUser.country === user.country) {
    //         matched.push(obj);
    //       }
    //     }
    //   }
    // }

    // console.log(count, u);
    res.status(200).json({
      status: "success",
      data: { length: matched.length, matched },
    });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};
