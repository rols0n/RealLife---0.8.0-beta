const User = require("../models/userModel");
const Group = require("../models/groupModel");

const decodingToken = require("../utils/decodingToken");
const normalizeSearchValue = require(
  "../utils/normalizeSearchValue"
);

const {
  asyncHandler,
} = require("../middlewares/utils/asyncHandler");

const AppError = require("../middlewares/utils/AppError");


// ====================
// Helpers
// ====================

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const addIdsToSet = (set, array = []) => {
  array.forEach((element) => {
    const id = element?._id || element;

    if (id) {
      set.add(String(id));
    }
  });
};

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const getMutualFriendsCount = (user, candidate, friendsIds) => {
  if (!candidate.friends) return 0;

  return candidate.friends.filter((friend) => {
    const friendId = String(friend._id);

    return (
      friendId !== String(user._id) &&
      friendsIds.has(friendId)
    );
  }).length;
};

const buildUserPreview = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  profileImage: user.profileImage,
});


// ====================
// Search
// ====================

const searcher = async (
  req,
  allPlatform = false
) => {
  const { searchValue } = req.body;

  if (
    typeof searchValue !== "string" ||
    searchValue.trim().length === 0
  ) {
    throw new AppError(
      "Search value is required",
      400,
      "SEARCH_VALUE_REQUIRED"
    );
  }

  const normalizedSearchValue =
    normalizeSearchValue(searchValue);

  const searchRegex = new RegExp(
    `^${escapeRegex(normalizedSearchValue)}`
  );

  if (!allPlatform) {
    return await User.find({
      searchName: searchRegex,
    }).limit(20);
  }

  const [users, groups] = await Promise.all([
    User.find({
      searchName: searchRegex,
    }).limit(20),

    Group.find({
      searchName: searchRegex,
    }).limit(20),
  ]);

  return [...users, ...groups].slice(0, 20);
};


// ====================
// Search endpoints
// ====================

exports.searchAllUser = asyncHandler(async (req, res) => {
  const matched = await searcher(req);

  res.status(200).json({
    status: "success",
    data: {
      length: matched.length,
      matched,
    },
  });
});

exports.searchRealLife = asyncHandler(async (req, res) => {
  const matched = await searcher(req, true);

  res.status(200).json({
    status: "success",
    data: {
      length: matched.length,
      matched,
    },
  });
});


// ====================
// People you may know
// ====================

exports.peopleYouMayKnow = asyncHandler(async (req, res) => {
  const decoded = await decodingToken(req);

  const user = await User.findById(decoded.id)
    .populate({
      path: "friends",
      populate: {
        path: "friends",
      },
    })
    .populate({
      path: "groups.currentlyIn",
      populate: {
        path: "_id",
        populate: {
          path: "members",
          populate: {
            path: "_id",
          },
        },
      },
    });

  if (!user) {
    throw new AppError(
      "Logged user doesn't exist",
      404,
      "USER_NOT_FOUND"
    );
  }

  const friends = user.friends || [];
  const groups = user.groups?.currentlyIn || [];

  const matched = [];

  const notAllowed = new Set(
    (req.body.notAllowed || []).map(String)
  );

  // User can't be recommended to himself
  notAllowed.add(String(user._id));

  addIdsToSet(notAllowed, user.friends);
  addIdsToSet(notAllowed, user.sentRequests);
  addIdsToSet(notAllowed, user.receivedRequests);

  const friendsIds = new Set(
    friends.map((friend) => String(friend._id))
  );


  // ====================
  // 1. Mutual friends
  // ====================

  const mutualFriendsCandidates = new Map();

  friends.forEach((friend) => {
    const friendsOfFriend = friend.friends || [];

    friendsOfFriend.forEach((friendOfFriend) => {
      const candidateId = String(friendOfFriend._id);

      if (notAllowed.has(candidateId)) {
        return;
      }

      const mutualFriends = getMutualFriendsCount(
        user,
        friendOfFriend,
        friendsIds
      );

      if (mutualFriends === 0) {
        return;
      }

      const existingCandidate =
        mutualFriendsCandidates.get(candidateId);

      if (
        !existingCandidate ||
        mutualFriends > existingCandidate.mutualFriends
      ) {
        mutualFriendsCandidates.set(candidateId, {
          user: buildUserPreview(friendOfFriend),
          mutualFriends,
        });
      }
    });
  });

  const sortedMutualFriends = [
    ...mutualFriendsCandidates.values(),
  ].sort((a, b) => b.mutualFriends - a.mutualFriends);

  sortedMutualFriends.forEach((candidate) => {
    if (matched.length >= 7) return;

    matched.push(candidate);
    notAllowed.add(String(candidate.user._id));
  });


  // ====================
  // 2. Common groups
  // ====================

  if (matched.length < 7) {
    const groupCandidates = [];

    groups.forEach((groupEntry) => {
      const group = groupEntry?._id;

      if (!group?.members) {
        return;
      }

      group.members.forEach((member) => {
        const memberUser = member?._id;

        if (
          !memberUser?._id ||
          !memberUser.firstName
        ) {
          return;
        }

        groupCandidates.push({
          user: buildUserPreview(memberUser),
          groupName: group.name,
        });
      });
    });

    const randomizedCandidates =
      shuffleArray(groupCandidates);

    for (const candidate of randomizedCandidates) {
      if (matched.length >= 7) {
        break;
      }

      const candidateId = String(candidate.user._id);

      if (notAllowed.has(candidateId)) {
        continue;
      }

      matched.push(candidate);
      notAllowed.add(candidateId);
    }
  }


  res.status(200).json({
    status: "success",
    data: {
      length: matched.length,
      matched,
    },
  });
});