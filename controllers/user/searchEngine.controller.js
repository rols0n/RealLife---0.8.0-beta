const User = require("../../models/userModel");
const decodingToken = require("../../utils/decodingToken");
const AppError = require("../../middlewares/utils/AppError");
const asyncHandler = require("../../middlewares/utils/asyncHandler")

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

exports.searchFriends = asyncHandler(async (req, res, next) => {
  
    const decoded = await decodingToken(req);

    const queryString = String(req.body.queryString || "").trim();

    if (queryString.length < 2) {
      return res.status(200).json({
        status: "success",
        results: 0,
        data: [],
      });
    }

    const loggedUser = await User.findById(decoded.id)
      .select("friends")
      .lean();

    if (!loggedUser) {
      return next(new AppError("User not found", 404, "USER_NOT_FOUND"));
    }

    const loggedUserFriendIds = loggedUser.friends.map((id) => String(id));
    const loggedUserFriendSet = new Set(loggedUserFriendIds);

    const regex = new RegExp(`^${escapeRegex(queryString)}`, "i");

    const friends = await User.find({
      _id: { $in: loggedUser.friends },
      $or: [
        { firstName: regex },
        { lastName: regex },
       
      ],
    })
      .select("firstName lastName avatar friends")
      .limit(10)
      .lean();

    const foundFriends = friends.map((friend) => {
      const commonFriends = friend.friends.filter((friendOfFriendId) =>
        loggedUserFriendSet.has(String(friendOfFriendId))
      );

      return {
        friend: {
          _id: friend._id,
          firstName: friend.firstName,
          lastName: friend.lastName,
          avatar: friend.avatar,
        },
        commonFriends,
        commonFriendsCount: commonFriends.length,
      };
    });

    res.status(200).json({
      status: "success",
      results: foundFriends.length,
      data: foundFriends,
    });
  
});


module.exports.addAlreadySeenPeopleYouMayKnow = asyncHandler(async (req, res, next) => {
 
    const decoded = await decodingToken(req);

    const users = Array.isArray(req.body.users)
      ? req.body.users.filter(Boolean)
      : [];

    if (users.length === 0) {
      return next(new AppError("No users provided", 400, "NO_DATA"));
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      {
        $addToSet: {
          peopleYouMayKnow__alreadySeen: {
            $each: users,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("peopleYouMayKnow__alreadySeen");

    res.status(200).json({
      status: "success",
      data: {
        alreadySeen: updatedUser.peopleYouMayKnow__alreadySeen,
      },
    });
 
});