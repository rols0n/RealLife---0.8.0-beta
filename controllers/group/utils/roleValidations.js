const Group = require("../../../models/groupModel");


module.exports.roleValidation = async (userId, groupId, roles) => {
  if (roles.length === 1) {
    if (roles[0] === "admin") {
      return (await Group.findOne({
        _id: groupId,
        "administration.admins._id": userId,
      }))
        ? true
        : `User needs ${roles[0]} permission, to perform this action`;
    } else if (roles[0] === "moderator") {
      return (await Group.findOne({
        _id: groupId,
        "administration.moderators._id": userId,
      }))
        ? true
        : `User needs ${roles[0]} permission, to perform this action`;
    }
  } else {
    return (await Group.findOne({
      _id: groupId,
      "administration.admins._id": userId,
    })) ||
      (await Group.findOne({
        _id: groupId,
        "administration.moderators._id": userId,
      }))
      ? true
      : `User needs admin or moderator permission, to perform this action`;
  }
};