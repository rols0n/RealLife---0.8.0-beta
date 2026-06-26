const Group = require("../../../models/groupModel");
const User = require("../../../models/userModel");

const decodingToken = require("../../../utils/decodingToken");

module.exports.addNewMember = async (req, res, User, Group, role) => {
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
