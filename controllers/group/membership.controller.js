const Group = require("../../models/groupModel");
const User = require("../../models/userModel");

const addNewMember = require("./utils/addNewMember")
const removeMember = require("./utils/removeMember")
const roleValidation = require("./utils/roleValidation")

const handlerController = require("../handlerController");
const authController = require("../authController");


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