const User = require("../../models/userModel");
const decodingToken = require("../../utils/decodingToken");

// ---------------------------
// SEARCH ENGINES
// How should engine work:
// 1) Based on the string, query the database for the someone with given name

exports.searchEngine_friends = async (req, res) => {
  const user = await User.findById(req.params.id);
  await user.populate({ path: "friends" }).execPopulate();
  const queryString = req.body.queryString.toLowerCase();

  const foundFriends = [];

  // 1. Loop over the friends of user
  const decoded = await decodingToken(req);
  const loggedUser = await User.findById(decoded.id);
  Array.prototype.forEach.call(user.friends, async (friend) => {
    const commonFriends = [];
    const friendsName = `${friend.firstName} ${friend.lastName}`.toLowerCase();
    if (friendsName.startsWith(queryString)) {
      loggedUser.friends.forEach((friendOfLoggedUser) => {
        friend.friends.forEach((friendOfFriend) => {
          if (`${friendOfFriend._id}` === `${friendOfLoggedUser._id}`) {
            commonFriends.push(friendOfFriend);
          }
        });
      });

      foundFriends.push({ friend, commonFriends });
    }
  });

  res.status(200).json({ status: "success", data: foundFriends });
};


// ##########
// People You May Know - SEEN
// pYmK_aS_ADD stands for peopleYoumayKnow_alreadySeen_ADD
module.exports.pYmK_aS_ADD = async (req, res) => {
  try {
    if (!req.body.users) throw `No data at req.body.users`;
    const decoded = await decodingToken(req);
    const user = await User.findById(decoded.id);

    const matched = [];
    const users = Array.from(req.body.users);
    const pYmK = Array.from(user.peopleYouMayKnow__alreadySeen);

    if (pYmK.length !== 0)
      users.forEach((el) => {
        pYmK.forEach((elem) => {
          console.log(el, elem);
          if (`${el}` === `${elem}` && el !== "") return;
          matched.push(el);
          matched.push(elem);
          console.log("c");
        });
      });
    else {
      matched.push(...users);
    }

    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        peopleYouMayKnow__alreadySeen: matched,
      }
    );
    console.log(matched);

    res.status(200).json({ status: "success", data: { matched } });
  } catch (err) {
    res.status(404).json({ status: "fail", err });
  }
};