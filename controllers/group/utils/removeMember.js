const Group = require("../../../models/groupModel");
const User = require("../../../models/userModel");

const decodingToken = require("../../../utils/decodingToken");


module.exports.removeMember = async (req, res, User, Group, role) => {
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
