// ===
// FUNCTION belowe checks if the provided USERS are friends.
// * That lets the USER to use the functionality of sending/rejecting/canceling FRIEND REQUESTS.
async function friends(User, loggedUserID, secondUserID) {
  const areFriends = (await User.findOne({
    _id: loggedUserID,
    friends: secondUserID,
  }))
    ? true
    : false;

  if (areFriends === true) {
    return "delete friend";
  }
  if (areFriends === false) {
    // Check if loggedUser got friends request from browsing user
    const isReceivedRequest = (await User.findOne({
      _id: loggedUserID,
      receivedRequests: secondUserID,
    }))
      ? true
      : false;

    const isSentRequest = (await User.findOne({
      _id: loggedUserID,
      sentRequests: secondUserID,
    }))
      ? true
      : false;

    if (isReceivedRequest === true) {
      return "accept/reject request";
    }

    if (isSentRequest === true) {
      return "cancel request";
    }

    if (isReceivedRequest === false && isSentRequest === false) {
      return "addFriend";
    }
  }
}

async function groups(Group, loggedUserID, groupID) {
  const isMember = (await Group.findOne({
    _id: groupID,
    "members._id": loggedUserID,
  }))
    ? true
    : false;

  if (isMember === true) {
    return "delete friend";
  }
  if (isMember === false) {
    // Check if loggedUser got groups request from browsing group
    const isReceivedRequest = (await Group.findOne({
      _id: loggedUserID,
      "requests.received.user": loggedUserID,
    }))
      ? true
      : false;

    const isSentRequest = (await Group.findOne({
      _id: loggedUserID,
      "requests.sent.user": loggedUserID,
    }))
      ? true
      : false;

    if (isReceivedRequest === true) {
      return "accept/reject request";
    }

    if (isSentRequest === true) {
      return "cancel request";
    }

    if (isReceivedRequest === false && isSentRequest === false) {
      return "joinGroup";
    }
  }
}

module.exports = async function (
  User,
  Group,
  loggedUserID,
  secondUserID,
  GroupID,
  type
) {
  if (type === "friends") return friends(User, loggedUserID, secondUserID);

  if (type === "groups") return groups(Group, loggedUserID, GroupID);
};
