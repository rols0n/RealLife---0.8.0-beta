const Group = require("../models/groupModel");
const User = require("../models/userModel");

const handlerController = require("./handlerController");
const authController = require("./authController");

const decodingToken = require("../utils/decodingToken");
const fs = require("fs");

const multer = require("multer");
const sharp = require("sharp");
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callBack) => {
  if (file.mimetype.startsWith("image")) {
    callBack(null, true);
  } else {
    callBack("You can upload ONLY images", false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const roleValidation = async (userId, groupId, roles) => {
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

const addNewMember = async (req, res, User, Group, role) => {
  try {
    if (!(await Group.findById(req.params.id))) {
      throw "Group with provided ID doesnt exist";
    }
    const decoded = await decodingToken(req);

    if (role === "admin") {
      const isAllowed = await roleValidation(decoded.id, req.params.id, [
        "admin",
      ]);

      if (isAllowed !== true) {
        throw isAllowed;
      }

      const isPossible = (await Group.findOne({
        _id: req.params.id,
        "administration.admins._id": req.body.user,
      }))
        ? false
        : true;

      if (isPossible === false) {
        throw `This user is ${role} already`;
      }

      const isUser = (await User.findById(req.body.user)) ? true : false;
      if (isUser === false) {
        throw "User with provided id doesnt exist";
      }

      await User.updateOne(
        { _id: req.body.user, "groups.currentlyIn._id": req.params.id },
        {
          $set: {
            "groups.currentlyIn.$.role": "admin",
          },
        }
      );

      await Group.updateOne(
        { _id: req.params.id, "members._id": req.body.user },
        {
          $set: {
            "members.$.role": "admin",
          },
        }
      );

      await Group.updateOne(
        { _id: req.params.id },
        {
          $pull: {
            "administration.moderators": { _id: req.body.user },
          },
        }
      );

      await Group.updateOne(
        { _id: req.params.id },
        {
          $push: {
            "administration.admins": { _id: req.body.user },
          },
        }
      );
    } else if (role === "moderator") {
      const isAllowed = await roleValidation(decoded.id, req.params.id, [
        "admin",
      ]);

      if (isAllowed !== true) {
        throw isAllowed;
      }

      const isPossible = (await Group.findOne({
        _id: req.params.id,
        "administration.moderators._id": req.body.user,
      }))
        ? false
        : true;
      if (isPossible === false) {
        throw `This user is ${role} already`;
      }

      const isUser = (await User.findById(req.body.user)) ? true : false;
      if (isUser === false) {
        throw "User with provided id doesnt exist";
      }

      await User.updateOne(
        { _id: req.body.user, "groups.currentlyIn._id": req.params.id },
        {
          $set: {
            "groups.currentlyIn.$.role": "moderator",
          },
        }
      );

      await Group.updateOne(
        { _id: req.params.id, "members._id": req.body.user },
        {
          $set: {
            "members.$.role": "moderator",
          },
        }
      );

      if (
        await Group.findOne({
          _id: req.params.id,
          "administration.admins._id": req.body.user,
        })
      ) {
        const group = await Group.findById(req.params.id);
        const canRemove =
          group.administration.admins.length === 1 ? false : true;
        if (canRemove === false) {
          throw `You cannot downgrade this user to moderator, because you need at least 1 administrator`;
        }
      }

      await Group.updateOne(
        { _id: req.params.id },
        {
          $push: {
            "administration.moderators": { _id: req.body.user },
          },
        }
      );
    } else if (role === "user") {
      const isAllowed = await roleValidation(decoded.id, req.body.params, [
        "admin",
        "moderator",
      ]);

      if (isAllowed !== true) {
        throw isAllowed;
      }
      const isPossible = (await Group.findOne({
        _id: req.params.id,
        "users._id": req.body.user,
      }))
        ? false
        : true;

      if (isPossible === false) {
        throw `This user is ${role} already`;
      }

      const isUser = (await User.findById(req.body.user)) ? true : false;
      if (isUser === false) {
        throw "User with provided id doesnt exist";
      }

      await Group.updateOne(
        { _id: req.params.id },
        {
          $push: {
            members: {
              role: "user",
              _id: req.body.user,
            },
          },
        }
      );

      await User.updateOne(
        { _id: req.body.admin },
        {
          $push: {
            "groups.currentlyIn": {
              role: "user",
              _id: req.params.id,
            },
          },
        }
      );

      const group = await Group.findById(req.params.id);
      const member = await User.findById(req.body.user);

      res.status(200).json({ status: "success", data: { group, member } });
    }

    const member = await User.findById(req.body.user);
    const group = await Group.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: { member, group },
    });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

const removeMember = async (req, res, User, Group, role) => {
  try {
    if (!(await Group.findById(req.params.id))) {
      throw "Group with provided id doesnt exist";
    }

    if (!(await User.findById(req.body.user))) {
      throw "User with provided ID doesnt exist";
    }

    const isMember = (await Group.findOne({
      _id: req.params.id,
      "members._id": req.body.user,
    }))
      ? true
      : false;

    if (isMember === false) {
      throw `User is not member of this group`;
    }

    if (role === "moderator") {
      await authController.isAdminOrMod(req, "admin");

      await Group.updateOne(
        { _id: req.params.id },
        {
          $pull: {
            "administration.moderators": { _id: req.body.user },
          },
        }
      );

      await Group.updateOne(
        { _id: req.params.id },
        {
          $pull: {
            members: { _id: req.body.user },
          },
        }
      );

      await User.updateOne(
        { _id: req.body.user },
        {
          $pull: {
            "groups.currentlyIn": {
              _id: req.params.id,
            },
          },
        }
      );
    } else if (role === "admin") {
      await authController.isAdminOrMod(req, "admin");

      const group = await Group.findById(req.params.id);
      const canRemove = group.administration.admins.length === 1 ? false : true;
      if (canRemove === false) {
        throw `you cannot remove the last existing administrator, you can delete the group instead`;
      }

      // HERE THE BUG #1 occures
      await User.updateOne(
        { _id: req.body.user },
        {
          $pull: {
            "groups.currentlyIn": {
              role: "admin",
              _id: req.params.id,
            },
          },
        }
      );

      await User.updateOne(
        { _id: req.body.user },
        {
          $push: {
            "groups.currentlyIn": {
              role: "user",
              _id: req.params.id,
            },
          },
        }
      );

      await Group.updateOne(
        { _id: req.params.id },
        {
          $pull: {
            "administration.admins": { _id: req.body.user },
          },
        }
      );

      await Group.updateOne(
        { _id: req.params.id },
        {
          $pull: {
            members: { _id: req.body.user },
          },
        }
      );

      await Group.updateOne(
        { _id: req.params.id },
        {
          $push: {
            members: {
              role: "user",
              _id: req.body.user,
            },
          },
        }
      );

      // and here it ends
      // ==========
    } else if (role === "user") {
      await User.updateOne(
        { _id: req.body.user },
        {
          $pull: {
            "groups.currentlyIn": {
              role: "user",
              _id: req.params.id,
            },
          },
        }
      );
      await Group.updateOne(
        { _id: req.params.id },
        {
          $pull: {
            users: { _id: req.body.user },
          },
        }
      );

      await Group.updateOne(
        { _id: req.params.id },
        {
          $pull: {
            members: { _id: req.body.user },
          },
        }
      );
    }

    const member = await User.findById(req.body.user);
    const group = await Group.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: { member, group },
    });
  } catch (error) {
    res.status(200).json({ status: "fail", error });
  }
};

module.exports.getAllGroups = async (req, res) => {
  handlerController.getAll(req, res, Group);
};
module.exports.getGroupById = async (req, res) => {
  handlerController.getById(req, res, Group);
};

module.exports.createGroup = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    if (req.body.users) {
      Array.prototype.forEach.call(req.body.users, async (userId) => {
        await User.updateOne(
          { _id: userId },
          {
            $push: {
              "groups.currentlyIn": {
                role: "user",
                _id: group.id,
              },
            },
          }
        );
      });
    }

    const group = await Group.create(req.body);

    await User.updateOne(
      { _id: decoded.id },
      {
        $push: {
          "groups.currentlyIn": {
            role: "admin",
            _id: group.id,
          },
        },
      }
    );
    await Group.updateOne(
      { _id: group._id },
      {
        $push: {
          "administration.admins": { _id: decoded.id },
        },
      }
    );
    await Group.updateOne(
      { _id: group.id },
      {
        $push: {
          members: {
            role: "admin",
            _id: decoded.id,
          },
        },
      }
    );

    const user = await User.findById(decoded.id);

    const freshGroup = await Group.findOne({ _id: group._id });
    fs.mkdirSync(`./views/imgs/groups/${group._id}`);
    fs.mkdirSync(`./views/imgs/groups/${group._id}/avatars`);
    fs.mkdirSync(`./views/imgs/groups/${group._id}/banners`);

    res.status(200).json({
      status: "success",
      data: {
        group: freshGroup,
        user,
      },
    });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.leaveGroup = async (req, res) => {
  const decoded = await decodingToken(req);
  req.body.user = decoded.id;

  const isAdmin = await roleValidation(decoded.id, req.params.id, ["admin"]);
  const isModerator = await roleValidation(decoded.id, req.params.id, [
    "moderator",
  ]);

  if (isAdmin === true) {
    removeMember(req, res, User, Group, "admin");
  }

  if (isModerator === true) {
    removeMember(req, res, User, Group, "moderator");
  }

  if (isAdmin !== true && isModerator !== true) {
    removeMember(req, res, User, Group, "user");
  }
};

module.exports.deleteGroup = async (req, res) => {
  try {
    await authController.isAdminOrMod(req, "admin");

    const clearUsersFields = async function (users) {
      Array.prototype.forEach.call(users, async (userId) => {
        await User.updateOne(
          { _id: userId._id },
          {
            $pull: {
              "groups.currentlyIn": { _id: group._id },
            },
          }
        );

        await User.updateOne(
          { _id: userId._id },
          {
            $pull: {
              "groups.requests.received": { group: group._id },
            },
          }
        );

        await User.updateOne(
          { _id: userId._id },
          {
            $pull: {
              "groups.requests.sent": { group: group._id },
            },
          }
        );
      });
    };

    // 1) find the group
    const decoded = await decodingToken(req);

    const group = await Group.findById(req.params.id);
    // 2) Loop over all the users, admins, moderators and delete this group from their collection
    await clearUsersFields(group.members);
    // 3) Delete group
    await Group.findByIdAndDelete(req.params.id);

    res.status(200).json({});
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.addNewAdmin = async (req, res) => {
  try {
    await authController.isAdminOrMod(req, "admin");

    addNewMember(req, res, User, Group, "admin");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.removeAdmin = async (req, res) => {
  try {
    await authController.isAdminOrMod(req, "admin");
    removeMember(req, res, User, Group, "admin");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.addNewModerator = async (req, res) => {
  try {
    await authController.isAdminOrMod(req, "admin");
    addNewMember(req, res, User, Group, "moderator");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.deleteModerator = async (req, res) => {
  try {
    await authController.isAdminOrMod(req, "admin");
    removeMember(req, res, User, Group, "moderator");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.removeUser = async (req, res) => {
  try {
    await authController.isAdminOrMod(req);
    removeMember(req, res, User, Group, "user");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

// REQUESTS

module.exports.sendGroupInvitation = async (req, res) => {
  try {
    await authController.isAdminOrMod(req);

    // 1. Check if request receiver exists
    const isUser = (await User.findById(req.body.user)) ? true : false;
    if (isUser === false) {
      throw `Provided user doesn't exist`;
    }

    // 2. Check if group exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Provided group doesn't exist`;
    }

    // 3. IF user, sent request to the group before, make him the member
    const didSend = (await User.findOne({
      _id: req.body.user,
      "groups.requests.sent.group": req.params.id,
    }))
      ? true
      : false;
    if (didSend === true) {
      throw `User already sent the request, you can accept it via "REQUESTS CONTROL PANEL"`;
    }
    // 4. IF user, received request before, throw error
    const didReceive = (await User.findOne({
      _id: req.body.user,
      "groups.requests.received.group": req.params.id,
    }))
      ? true
      : false;
    if (didReceive === true) {
      throw `User already received the request`;
    }

    // 5. IF user is member of the group, throw error
    const isMember = (await Group.findOne({
      _id: req.params.id,
      "members._id": req.body.user,
    }))
      ? true
      : false;
    if (isMember === true) {
      throw `This user is already member of the group`;
    }

    // 6. push to the userSchema.groups.requests.received {group: req.params.id}
    await User.updateOne(
      { _id: req.body.user },
      { $push: { "groups.requests.received": { group: req.params.id } } }
    );

    // 7. push to the groupSchema.requests.sent {user: req.body.user}
    await Group.updateOne(
      { _id: req.params.id },
      {
        $push: { "requests.sent": { user: req.body.user } },
      }
    );

    const group = await Group.findById(req.params.id);
    const user = await User.findById(req.body.user);

    res.status(200).json({
      status: "success",
      message: "Sent invitation",
      data: { group, user },
    });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.cancelGroupInvitation = async (req, res) => {
  try {
    await authController.isAdminOrMod(req);

    // 1. Check if user exists
    const isUser = (await User.findById(req.body.user)) ? true : false;
    if (isUser === false) {
      throw `Provided user doesn't exist`;
    }

    // 2. Check if group exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Provided group doesn't exist`;
    }

    // 3. IF user, received request before, throw error
    const didReceive = (await User.findOne({
      _id: req.body.user,
      "groups.requests.received.group": req.params.id,
    }))
      ? true
      : false;
    if (didReceive === false) {
      throw `User didn't receive request`;
    }

    // 3. IF user is member of the group, throw error
    const isMember = (await Group.findOne({
      _id: req.params.id,
      "members._id": req.body.user,
    }))
      ? true
      : false;
    if (isMember === true) {
      throw `This user is member of the group. You can delete him instead.`;
    }

    // 6. pull from the userSchema.groups.requests.received {group: req.params.id}
    await User.updateOne(
      { _id: req.body.user },
      { $pull: { "groups.requests.received": { group: req.params.id } } }
    );

    // 7. pull from the groupSchema.requests.sent {user: req.body.user}
    await Group.updateOne(
      { _id: req.params.id },
      {
        $pull: { "requests.sent": { user: req.body.user } },
      }
    );

    const group = await Group.findById(req.params.id);
    const user = await User.findById(req.body.user);

    res.status(200).json({
      status: "success",
      message: "Canceled invitation",
      data: { group, user },
    });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.acceptGroupRequest = async (req, res) => {
  try {
    await authController.isAdminOrMod(req);
    // 1. Check if user exists
    const isUser = (await User.findById(req.body.user)) ? true : false;
    if (isUser === false) {
      throw `Provided user doesn't exist`;
    }

    // 2. Check if group exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Provided group doesn't exist`;
    }

    // 3. IF user is member of the group, throw error
    const isMember = (await Group.findOne({
      _id: req.params.id,
      "members._id": req.body.user,
    }))
      ? true
      : false;
    if (isMember === true) {
      throw `This user is member of the group. You can delete him instead.`;
    }

    // 4. IF user, didnt send the request, throw error
    const didSend = (await User.findOne({
      _id: req.body.user,
      "groups.requests.sent.group": req.params.id,
    }))
      ? true
      : false;
    if (didSend === false) {
      throw `User didnt send the request.`;
    }

    // 6. pull from the userSchema.groups.requests.received {group: req.params.id}
    await User.updateOne(
      { _id: req.body.user },
      { $pull: { "groups.requests.sent": { group: req.params.id } } }
    );

    // 7. pull from the groupSchema.requests.sent {user: req.body.user}
    await Group.updateOne(
      { _id: req.params.id },
      {
        $pull: { "requests.received": { user: req.body.user } },
      }
    );

    await User.updateOne(
      { _id: req.body.user },
      { $push: { "groups.currentlyIn": { _id: req.params.id, role: "user" } } }
    );

    await Group.updateOne(
      { _id: req.params.id },
      {
        $push: { members: { _id: req.body.user, role: "user" } },
      }
    );
    const group = await Group.findById(req.params.id);
    const user = await User.findById(req.body.user);

    res.status(200).json({
      status: "success",
      message: "Accepted request",
      data: { group, user },
    });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.rejectGroupRequest = async (req, res) => {
  try {
    await authController.isAdminOrMod(req);
    // 1. Check if user exists
    const isUser = (await User.findById(req.body.user)) ? true : false;
    if (isUser === false) {
      throw `Provided user doesn't exist`;
    }

    // 2. Check if group exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Provided group doesn't exist`;
    }

    // 3. IF user is member of the group, throw error
    const isMember = (await Group.findOne({
      _id: req.params.id,
      "members._id": req.body.user,
    }))
      ? true
      : false;
    if (isMember === true) {
      throw `This user is member of the group. You can delete him instead.`;
    }

    // 4. IF user, didnt send the request, throw error
    const didSend = (await User.findOne({
      _id: req.body.user,
      "groups.requests.sent.group": req.params.id,
    }))
      ? true
      : false;
    if (didSend === false) {
      throw `User didnt send the request.`;
    }

    // 6. pull from the userSchema.groups.requests.received {group: req.params.id}
    await User.updateOne(
      { _id: req.body.user },
      { $pull: { "groups.requests.sent": { group: req.params.id } } }
    );

    // 7. pull from the groupSchema.requests.sent {user: req.body.user}
    await Group.updateOne(
      { _id: req.params.id },
      {
        $pull: { "requests.received": { user: req.body.user } },
      }
    );

    const group = await Group.findById(req.params.id);
    const user = await User.findById(req.body.user);

    res.status(200).json({
      status: "success",
      message: "Rejected request",
      data: { group, user },
    });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

// UPDATING

module.exports.updateGroup = async (req, res) => {
  try {
    const decoded = await decodingToken(req);
    const data = await roleValidation(decoded.id, req.params.id, ["admin"]);
    if (data !== true) throw `User needs to be an admin, to perfom this action`;

    if (req.body.name !== req.body.confirmName)
      throw `Name and confirmName are not the same`;

    const group = await Group.findById(req.params.id);

    await group.updateOne(req.body);

    const updatedGroup = await Group.findById(req.params.id);
    res.status(200).json({ status: "success", data: { group: updatedGroup } });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

// Avatar

exports.uploadAvatarImage = upload.single("avatarImage");
exports.resizeAvatarImage = async (req, res, next) => {
  if (!req.file) return next();

  const group = await Group.findById(req.params.id);

  req.file.filename = `avatar-image-${group._id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`views/imgs/groups/${group._id}/avatars/${req.file.filename}`);

  next();
};

exports.updateAvatarImage = async (req, res) => {
  try {
    // 3) Checking if GROUP still exists
    const group = await Group.findById(req.params.id);
    if (group) {
      if (!req.file) {
        res.status(404).json({
          status: "fail",
          message: "This route is only for changing user images",
        });
      }

      const imagePath = `/imgs/groups/${group._id}/avatars/${req.file.filename}`;
      await Group.findByIdAndUpdate(group._id, {
        avatarImage: imagePath,
      });

      res.status(200).json({
        status: "success",
        data: { imagePath },
      });
    }
  } catch (err) {
    res.status(404).json({ status: "fail", error: err });
  }
};

// Banner
exports.uploadBannerImage = upload.single("bannerImage");
exports.resizeBannerImage = async (req, res, next) => {
  if (!req.file) return next();

  const group = await Group.findById(req.params.id);

  req.file.filename = `banners-image-${group._id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(1250, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`views/imgs/groups/${group._id}/banners/${req.file.filename}`);

  next();
};

exports.updateBannerImage = async (req, res) => {
  try {
    // 3) Checking if GROUP still exists
    const group = await Group.findById(req.params.id);
    if (group) {
      if (!req.file) {
        res.status(404).json({
          status: "fail",
          message: "This route is only for changing user images",
        });
      }

      const imagePath = `/imgs/groups/${group._id}/banners/${req.file.filename}`;
      await Group.findByIdAndUpdate(group._id, {
        bannerImage: imagePath,
      });

      res.status(200).json({
        status: "success",
        data: { imagePath },
      });
    }
  } catch (err) {
    res.status(404).json({ status: "fail", error: err });
  }
};
