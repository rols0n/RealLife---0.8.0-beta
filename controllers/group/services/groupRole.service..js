const Group = require("../../../models/groupModel");
const User = require("../../../models/userModel");

const decodingToken = require("../../../utils/decodingToken");
const roleValidation = require("../../../utils/roleValidation");

const AppError = require("../../../middlewares/utils/AppError");

const allowedRolesMap = {
  admin: ["admin"],
  moderator: ["admin"],
  user: ["admin", "moderator"],
};

const validateMemberAction = async ({ req, role }) => {
  const decoded = await decodingToken(req);

  const groupId = req.params.id;
  const targetUserId = req.body.user;

  const allowedRoles = allowedRolesMap[role];

  if (!allowedRoles) {
    throw new AppError("Invalid role", 400, "INVALID_ROLE");
  }

  const isAllowed = await roleValidation(decoded.id, groupId, allowedRoles);

  if (isAllowed !== true) {
    throw new AppError("Unauthorized user", 401, "UNAUTHORIZED_USER");
  }

  const [group, user] = await Promise.all([
    Group.findById(groupId),
    User.findById(targetUserId),
  ]);

  if (!group) {
    throw new AppError("Group with provided ID does not exist", 404, "GROUP_NOT_FOUND");
  }

  if (!user) {
    throw new AppError("User with provided ID does not exist", 404, "USER_NOT_FOUND");
  }

  return { group, user, groupId, targetUserId };
};

const addRegularMember = async ({ groupId, targetUserId }) => {
  const isAlreadyMember = await Group.findOne({
    _id: groupId,
    "members._id": targetUserId,
  });

  if (isAlreadyMember) {
    throw new AppError("This user is already a member", 409, "USER_ALREADY_MEMBER");
  }

  await Promise.all([
    Group.updateOne(
      { _id: groupId },
      {
        $addToSet: {
          members: {
            role: "user",
            _id: targetUserId,
          },
        },
      }
    ),

    User.updateOne(
      { _id: targetUserId },
      {
        $addToSet: {
          "groups.currentlyIn": {
            role: "user",
            _id: groupId,
          },
        },
      }
    ),
  ]);
};

const changeMemberRole = async ({ group, groupId, targetUserId, role }) => {
  const roleField = `administration.${role}s._id`;

  const alreadyHasRole = await Group.findOne({
    _id: groupId,
    [roleField]: targetUserId,
  });

  if (alreadyHasRole) {
    throw new AppError(`This user is ${role} already`, 409, "USER_ROLE_CONFLICT");
  }

  const isMember = group.members.some(
    (member) => member._id.toString() === targetUserId.toString()
  );

  if (!isMember) {
    throw new AppError("This user is not a group member", 404, "MEMBER_NOT_FOUND");
  }

  if (role === "moderator") {
    const isAdmin = group.administration.admins.some(
      (admin) => admin._id.toString() === targetUserId.toString()
    );

    const isLastAdmin = group.administration.admins.length === 1;

    if (isAdmin && isLastAdmin) {
      throw new AppError(
        "You cannot downgrade this user to moderator, because group needs at least 1 administrator",
        422,
        "LAST_ADMINISTRATOR"
      );
    }
  }

  await Promise.all([
    User.updateOne(
      { _id: targetUserId, "groups.currentlyIn._id": groupId },
      {
        $set: {
          "groups.currentlyIn.$.role": role,
        },
      }
    ),

    Group.updateOne(
      { _id: groupId, "members._id": targetUserId },
      {
        $set: {
          "members.$.role": role,
        },
      }
    ),

    Group.updateOne(
      { _id: groupId },
      role === "admin"
        ? {
            $pull: {
              "administration.moderators": { _id: targetUserId },
            },
            $addToSet: {
              "administration.admins": { _id: targetUserId },
            },
          }
        : {
            $pull: {
              "administration.admins": { _id: targetUserId },
            },
            $addToSet: {
              "administration.moderators": { _id: targetUserId },
            },
          }
    ),
  ]);
};

module.exports.addNewMember = async (req, role) => {
  const { group, groupId, targetUserId } = await validateMemberAction({
    req,
    role,
  });

  if (role === "user") {
    await addRegularMember({ groupId, targetUserId });
  } else {
    await changeMemberRole({
      group,
      groupId,
      targetUserId,
      role,
    });
  }

  const [updatedGroup, member] = await Promise.all([
    Group.findById(groupId),
    User.findById(targetUserId),
  ]);

  return {
    group: updatedGroup,
    member,
  };
};