const User = require("../../models/userModel");
const Group = require("../../models/groupModel");

const decodingToken = require("../../utils/decodingToken");
const asyncHandler = require("../../middlewares/utils/asyncHandler");

const AppError = require("../../middlewares/utils/AppError");

const getData = async (req) => {
  const decoded = await decodingToken(req);

  const [user, group] = await Promise.all([
    User.findById(decoded.id),
    Group.findById(req.params.id),
  ]);

  if (!user) {
    throw new AppError(
      "User with provided id doesn't exist",
      404,
      "USER_NOT_FOUND"
    );
  }

  if (!group) {
    throw new AppError(
      "Group with provided id doesn't exist",
      404,
      "GROUP_NOT_FOUND"
    );
  }

  return { decoded, user, group };
};

const hasRequest = (requests, groupId) => {
  return requests.some(
    (request) => request.group.toString() === groupId.toString()
  );
};

const getFreshData = async (decoded, req) => {
  const [user, group] = await Promise.all([
    User.findById(decoded.id),
    Group.findById(req.params.id),
  ]);

  return { user, group };
};

module.exports.sendGroupsRequests = asyncHandler(async (req, res, next) => {
  const { decoded, user, group } = await getData(req);

  const didSend = hasRequest(user.groups.requests.sent, group._id);
  if (didSend) {
    return next(
      new AppError(
        "You've already sent the request, you can cancel it",
        400,
        "REQUEST_ALREADY_SENT"
      )
    );
  }

  const didReceive = hasRequest(user.groups.requests.received, group._id);
  if (didReceive) {
    return next(
      new AppError(
        "You've already received the invitation, you can accept it",
        400,
        "INVITATION_ALREADY_RECEIVED"
      )
    );
  }

  await Promise.all([
    Group.updateOne(
      { _id: req.params.id },
      {
        $addToSet: {
          "requests.received": { user: decoded.id },
        },
      }
    ),

    User.updateOne(
      { _id: decoded.id },
      {
        $addToSet: {
          "groups.requests.sent": { group: req.params.id },
        },
      }
    ),
  ]);

  const data = await getFreshData(decoded, req);

  res.status(200).json({ status: "success", data });
});

module.exports.cancelGroupsRequests = asyncHandler(async (req, res, next) => {
  const { decoded, user, group } = await getData(req);

  const didSend = hasRequest(user.groups.requests.sent, group._id);
  if (!didSend) {
    return next(
      new AppError(
        "You didn't send request, so you can't cancel it",
        400,
        "REQUEST_NOT_FOUND"
      )
    );
  }

  await Promise.all([
    Group.findOneAndUpdate(
      { _id: req.params.id },
      {
        $pull: {
          "requests.received": { user: decoded.id },
        },
      }
    ),

    User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $pull: {
          "groups.requests.sent": { group: req.params.id },
        },
      }
    ),
  ]);

  const data = await getFreshData(decoded, req);

  res.status(200).json({ status: "success", data });
});

module.exports.acceptGroupsRequests = asyncHandler(async (req, res, next) => {
  const { decoded, user, group } = await getData(req);

  const didReceive = hasRequest(user.groups.requests.received, group._id);
  if (!didReceive) {
    return next(
      new AppError(
        "User didn't receive invite from the group",
        400,
        "INVITATION_NOT_FOUND"
      )
    );
  }

  await Promise.all([
    Group.findOneAndUpdate(
      { _id: req.params.id },
      {
        $pull: {
          "requests.sent": { user: decoded.id },
        },

        $addToSet: {
          members: { _id: decoded.id, role: "user" },
        },
      }
    ),

    User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $pull: {
          "groups.requests.received": { group: req.params.id },
        },

        $addToSet: {
          "groups.currentlyIn": {
            _id: req.params.id,
            role: "user",
          },
        },
      }
    ),
  ]);

  const data = await getFreshData(decoded, req);

  res.status(200).json({ status: "success", data });
});

module.exports.rejectGroupsRequests = asyncHandler(async (req, res, next) => {
  const { decoded, user, group } = await getData(req);

  const didReceive = hasRequest(user.groups.requests.received, group._id);
  if (!didReceive) {
    return next(
      new AppError(
        "User didn't receive invite from the group",
        400,
        "INVITATION_NOT_FOUND"
      )
    );
  }

  await Promise.all([
    Group.findOneAndUpdate(
      { _id: req.params.id },
      {
        $pull: {
          "requests.sent": { user: decoded.id },
        },
      }
    ),

    User.findOneAndUpdate(
      { _id: decoded.id },
      {
        $pull: {
          "groups.requests.received": { group: req.params.id },
        },
      }
    ),
  ]);

  const data = await getFreshData(decoded, req);

  res.status(200).json({ status: "success", data });
});