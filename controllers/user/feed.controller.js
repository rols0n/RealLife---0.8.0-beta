const User = require("../../models/userModel");
const decodingToken = require("../../utils/decodingToken");
const AppError = require("../../middlewares/utils/AppError");

const { asyncHandler } = require("../../middlewares/utils/asyncHandler");

// ---------------------------
// Populate configs
// ---------------------------

const POST_SELECT =
  "createdAt author images cantBeDisplayedBy reactions postText comments postImages";

const USER_PREVIEW_SELECT =
  "firstName lastName profileImage bannerImage tree";

const COMMENT_TREE_SELECT =
  "firstName lastName profileImage bannerImage author repliesTo text createdAt reactions subReplies";

const SUB_REPLY_SELECT =
  "firstName lastName profileImage bannerImage author repliesTo text createdAt reactions repliesToComment";

const AUTHOR_PREVIEW_SELECT =
  "firstName lastName profileImage bannerImage";

const postPopulate = {
  path: "_id",
  select: POST_SELECT,
  populate: {
    path: "author comments",
    select: USER_PREVIEW_SELECT,
    populate: {
      path: "tree",
      populate: {
        path: "author replies",
        select: COMMENT_TREE_SELECT,
        populate: {
          path: "author subReplies",
          select: SUB_REPLY_SELECT,
          populate: {
            path: "author",
            select: AUTHOR_PREVIEW_SELECT,
          },
        },
      },
    },
  },
};

const userPostsPopulate = {
  path: "posts",
  populate: postPopulate,
};

const friendsPostsPopulate = {
  path: "friends",
  select: "posts",
  populate: {
    path: "posts",
    populate: postPopulate,
  },
};

// ---------------------------
// Helpers
// ---------------------------

const toStringId = (id) => id?.toString();

const isSameId = (firstId, secondId) => {
  return toStringId(firstId) === toStringId(secondId);
};

const isUserBlockedFromPost = (post, userId) => {
  const blockedUsers = post?.cantBeDisplayedBy || [];

  return blockedUsers.some((blockedUserId) =>
    isSameId(blockedUserId, userId)
  );
};

const isUserPagePost = (postWrapper) => {
  return postWrapper?.place === "userPage";
};

const hasPopulatedPost = (postWrapper) => {
  return Boolean(postWrapper?._id);
};

const canDisplayPost = (postWrapper, userId) => {
  if (!postWrapper) return false;
  if (!isUserPagePost(postWrapper)) return false;
  if (!hasPopulatedPost(postWrapper)) return false;

  return !isUserBlockedFromPost(postWrapper._id, userId);
};

const collectVisiblePosts = (postWrappers = [], userId) => {
  return postWrappers
    .filter((postWrapper) => canDisplayPost(postWrapper, userId))
    .map((postWrapper) => postWrapper._id);
};

const collectFriendsVisiblePosts = (friends = [], userId) => {
  return friends.flatMap((friend) =>
    collectVisiblePosts(friend.posts, userId)
  );
};

const sortPostsByNewest = (posts) => {
  return posts.sort(
    (firstPost, secondPost) =>
      new Date(secondPost.createdAt) - new Date(firstPost.createdAt)
  );
};

// ---------------------------
// Controller
// ---------------------------

exports.generateFeedContent = asyncHandler(async (req, res, next) => {
  const decoded = await decodingToken(req);
  const userId = decoded.id;

  const user = await User.findById(userId)
    .select("posts friends")
    .populate(userPostsPopulate)
    .populate(friendsPostsPopulate)
    .lean();

  if (!user) {
    return next(new AppError("User not found", 404, "USER_NOT_FOUND"));
  }

  const userPosts = collectVisiblePosts(user.posts, userId);
  const friendsPosts = collectFriendsVisiblePosts(user.friends, userId);

  const feedPosts = sortPostsByNewest([...userPosts, ...friendsPosts]);

  res.status(200).json({
    status: "success",
    results: feedPosts.length,
    data: feedPosts,
  });
});