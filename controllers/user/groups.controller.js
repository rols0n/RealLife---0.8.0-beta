const User = require("../../models/userModel");
const decodingToken = require("../../utils/decodingToken");


module.exports.sendGroupsRequests = async (req, res) => {
  try {
    // 1. get the logged user
    const decoded = await decodingToken(req);
    const isUser = (await User.findById(decoded.id)) ? true : false;
    if (isUser === false) {
      throw `User wtih provided id doesnt exist`;
    }
    // 2. get the group by req.params.id and check if it exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Group with provided id doesnt exist`;
    }

    // IF user already sent request throw error
    const didSend = (await User.findOne({
      _id: decoded.id,
      "groups.requests.sent.group": req.params.id,
    }))
      ? true
      : false;
    if (didSend === true) {
      throw `You've already sent the request, you can cancel it"`;
    }

    // IF user, received request before, throw error
    const didReceive = (await User.findOne({
      _id: decoded.id,
      "groups.requests.received.group": req.params.id,
    }))
      ? true
      : false;
    if (didReceive === true) {
      throw `You've already received the invitation, you can accept it`;
    }

    // 3. findGroup with provied ID and push the userID to the requests.received
    await Group.updateOne(
      { _id: req.params.id },
      { $push: { "requests.received": { user: decoded.id } } }
    );

    // 4. update user's sent requests
    await User.updateOne(
      { _id: decoded.id },
      {
        $push: { "groups.requests.sent": { group: req.params.id } },
      }
    );

    const user = await User.findById(decoded.id);
    const group = await Group.findById(req.params.id);
    res.status(200).json({ status: "success", data: { user, group } });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};
module.exports.cancelGroupsRequests = async (req, res) => {
  try {
    // 1. get the logged user
    const decoded = await decodingToken(req);
    const isUser = (await User.findById(decoded.id)) ? true : false;
    if (isUser === false) {
      throw `User wtih provided id doesnt exist`;
    }
    // 2. get the group by req.params.id and check if it exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Group with provided id doesnt exist`;
    }

    // IF user already sent request throw error
    const didSend = (await User.findOne({
      _id: decoded.id,
      "groups.requests.sent.group": req.params.id,
    }))
      ? true
      : false;
    if (didSend === false) {
      throw `You didnt send request, so you cant cancel it"`;
    }

    // 3. findGroup with provied ID and push the userID to the requests.received
    await Group.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { "requests.received": { user: decoded.id } } }
    );

    // 4. update user's sent requests
    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $pull: { "groups.requests.sent": { group: req.params.id } },
      }
    );

    const user = await User.findById(decoded.id);
    const group = await Group.findById(req.params.id);
    res.status(200).json({ status: "success", data: { user, group } });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};
module.exports.acceptGroupsRequests = async (req, res) => {
  try {
    // 1. get the logged user
    const decoded = await decodingToken(req);
    const isUser = (await User.findById(decoded.id)) ? true : false;
    if (isUser === false) {
      throw `User wtih provided id doesnt exist`;
    }
    // 2. get the group by req.params.id and check if it exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Group with provided id doesnt exist`;
    }
    // 3. findGroup with provied ID and push the userID to the requests.received
    const didReceive = (await User.findOne({
      "groups.requests.received.group": req.params.id,
    }))
      ? true
      : false;
    if (didReceive === false) throw `User didn't receive invite from the group`;

    await Group.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { "requests.sent": { user: decoded.id } } }
    );

    // 4. update user's sent requests
    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $pull: { "groups.requests.received": { group: req.params.id } },
      }
    );

    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $push: { "groups.currentlyIn": { _id: req.params.id, role: "user" } },
      }
    );

    await Group.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { members: { _id: decoded.id, role: "user" } } }
    );
    const user = await User.findById(decoded.id);
    const group = await Group.findById(req.params.id);
    res.status(200).json({ status: "success", data: { user, group } });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};
module.exports.rejectGroupsRequests = async (req, res) => {
  try {
    // 1. get the logged user
    const decoded = await decodingToken(req);
    const isUser = (await User.findById(decoded.id)) ? true : false;
    if (isUser === false) {
      throw `User wtih provided id doesnt exist`;
    }
    // 2. get the group by req.params.id and check if it exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw `Group with provided id doesnt exist`;
    }
    // 3. findGroup with provied ID and push the userID to the requests.received
    const didReceive = (await User.findOne({
      "groups.requests.sent": { group: req.params.id },
    }))
      ? true
      : false;
    if (didReceive === false) throw `User didn't receive invite from the group`;
    await Group.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { "requests.sent": { user: decoded.id } } }
    );

    // 4. update user's sent requests
    await User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $pull: { "groups.requests.received": { group: req.params.id } },
      }
    );

    const user = await User.findById(decoded.id);
    const group = await Group.findById(req.params.id);
    res.status(200).json({ status: "success", data: { user, group } });
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};