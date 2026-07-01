const Group = require("../../models/groupModel");
const User = require("../../models/userModel");

const addNewMember = require("./services/groupRole.service.")
const removeMember = require("./utils/removeMember")
const roleValidation = require("./utils/roleValidation")

const handlerController = require("../handlerController");
const authController = require("../authController");

const {asyncHandler} = require("../../middlewares/utils/asyncHandler")
const AppError = require("../../middlewares/utils/AppError")

const decodingToken = require("../../utils/decodingToken");
const fs = require("fs");







module.exports.getAllGroups = asyncHandler(async (req, res,next) => {
  handlerController.getAll(req, res, Group);
});
module.exports.getGroupById = asyncHandler(async (req, res, next) => {
  handlerController.getById(req, res, Group);
});

module.exports.createGroup = asyncHandler(async (req, res, next) => {
 
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
    fs.mkdirSync(`./public/imgs/groups/${group._id}`);
    fs.mkdirSync(`./public/imgs/groups/${group._id}/avatars`);
    fs.mkdirSync(`./public/imgs/groups/${group._id}/banners`);

    res.status(200).json({
      status: "success",
      data: {
        group: freshGroup,
        user,
      },
    });
  
});

module.exports.leaveGroup = asyncHandler(async (req, res, next) => {
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
});

module.exports.deleteGroup = asyncHandler(async (req, res, next) => {
  
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

});


module.exports.updateGroup = asyncHandler(async (req, res, next) => {
  
    const decoded = await decodingToken(req);
    const data = await roleValidation(decoded.id, req.params.id, ["admin"]);
    if (data !== true)  next(new AppError(
  "User needs to be an admin to perform this action",
  403,
  "ADMIN_REQUIRED"
));

    if (req.body.name !== req.body.confirmName)
      next(new AppError(`Name and confirmName are not the same`, 400, "NAME_CONFIRMATION_MISMATCH"));

    const group = await Group.findById(req.params.id);

    await group.updateOne(req.body);

    const updatedGroup = await Group.findById(req.params.id);
    res.status(200).json({ status: "success", data: { group: updatedGroup } });
  
});






