// ##############
// NOTIFICATIONS

const User = require("../models/userModel");
const Notifications = require("../models/notificationModel");

const decodingToken = require("../utils/decodingToken");

const { asyncHandler } = require("../middlewares/utils/asyncHandler");
const AppError = require("../middlewares/utils/AppError");

const manageNotiReceiverSchema = async (notification) => {
  const notiReceiver = await User.findByIdAndUpdate(
    notification.sentTo,
    {
      $push: {
        notifications: {
          $each: [notification._id],
          $position: 0,
        },
      },
    },
    {
      new: true,
    }
  )
    .select("notifications")
    .populate("notifications");

  if (!notiReceiver) {
    throw new AppError(
      "Notification receiver doesn't exist",
      404,
      "NOTIFICATION_RECEIVER_NOT_FOUND"
    );
  }

  if (notiReceiver.notifications.length >= 120) {
    const notificationsToDelete = notiReceiver.notifications.slice(85);

    const notificationIds = notificationsToDelete.map(
      (notification) => notification._id
    );

    await Promise.all([
      Notifications.deleteMany({
        _id: { $in: notificationIds },
      }),

      User.updateOne(
        { _id: notiReceiver._id },
        {
          $pull: {
            notifications: {
              $in: notificationIds,
            },
          },
        }
      ),
    ]);

    notiReceiver.notifications = notiReceiver.notifications.slice(0, 85);
  }

  return notiReceiver;
};

const uploadFriendNotification = async (req, res, decoded) => {
  const notification = await Notifications.create({
    ...req.body,
    author: decoded.id,
  });

  const notiReceiver = await manageNotiReceiverSchema(notification);

  res.status(200).json({
    status: "success",
    user: notiReceiver,
  });
};

const uploadGroupNotification = async (
  req,
  res,
  decoded,
  groupID
) => {
  const notification = await Notifications.create({
    ...req.body,
    author: decoded.id,
    group: groupID,
  });

  const notiReceiver = await manageNotiReceiverSchema(notification);

  res.status(200).json({
    status: "success",
    user: notiReceiver,
  });
};

module.exports.upload = asyncHandler(async (req, res, next) => {
  if (!req.body.sentTo) {
    return next(
      new AppError(
        "sentTo field is required for creating a notification",
        400,
        "MISSING_NOTIFICATION_RECEIVER"
      )
    );
  }

  const decoded = await decodingToken(req);

  await uploadFriendNotification(req, res, decoded);
});

module.exports.delete = asyncHandler(async (req, res, next) => {
  if (!req.body.notificationID) {
    return next(
      new AppError(
        "You need to specify notificationID",
        400,
        "MISSING_NOTIFICATION_ID"
      )
    );
  }

  const decoded = await decodingToken(req);

  const notification = await Notifications.findById(
    req.body.notificationID
  );

  if (!notification) {
    return next(
      new AppError(
        "Notification doesn't exist",
        404,
        "NOTIFICATION_NOT_FOUND"
      )
    );
  }

  if (notification.sentTo.toString() !== decoded.id.toString()) {
    return next(
      new AppError(
        "You can't delete this notification",
        403,
        "UNAUTHORIZED_NOTIFICATION_ACTION"
      )
    );
  }

  await Promise.all([
    Notifications.deleteOne({
      _id: notification._id,
    }),

    User.updateOne(
      { _id: decoded.id },
      {
        $pull: {
          notifications: notification._id,
        },
      }
    ),
  ]);

  res.status(200).json({
    status: "success",
  });
});

module.exports.markAllAsSeen = asyncHandler(async (req, res, next) => {
  const decoded = await decodingToken(req);

  const user = await User.findById(decoded.id).select("notifications");

  if (!user) {
    return next(
      new AppError(
        "User doesn't exist",
        404,
        "USER_NOT_FOUND"
      )
    );
  }

  await Notifications.updateMany(
    {
      _id: { $in: user.notifications },
    },
    {
      $set: {
        notificationStatus: "seen",
      },
    }
  );

  res.status(200).json({
    status: "success",
    message: "done",
  });
});

module.exports.getUsersNotifications = asyncHandler(
  async (req, res, next) => {
    const decoded = await decodingToken(req);

    const user = await User.findById(decoded.id)
      .select("notifications")
      .populate({
        path: "notifications",
        populate: {
          path: "author",
          select: "firstName lastName profileImage",
        },
      });

    if (!user) {
      return next(
        new AppError(
          "User doesn't exist",
          404,
          "USER_NOT_FOUND"
        )
      );
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  }
);