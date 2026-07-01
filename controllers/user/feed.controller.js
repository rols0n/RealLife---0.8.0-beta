const User = require("../../models/userModel");
const decodingToken = require("../../utils/decodingToken");

const {asyncHandler} = require("../../middlewares/utils/asyncHandler")




const postPopulate = {
  path: "_id",
  select:
    "createdAt author images cantBeDisplayedBy reactions postText comments postImages",
  populate: {
    path: "author comments",
    select: "firstName lastName profileImage bannerImage tree",
    populate: {
      path: "tree",
      populate: {
        path: "author replies",
        select:
          "firstName lastName profileImage bannerImage author repliesTo text createdAt reactions subReplies",
        populate: {
          path: "author subReplies",
          select:
            "firstName lastName profileImage bannerImage author repliesTo text createdAt reactions repliesToComment",
          populate: {
            path: "author",
            select: "firstName lastName profileImage bannerImage",
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

exports.generateFeedContent = asyncHandler(async (req, res, next) => {
  
    const isUserBannedFromPost = (post, userId) => {
      if (!post?.cantBeDisplayedBy) return false;

      return post.cantBeDisplayedBy.some(
        bannedUserId => bannedUserId.toString() === userId.toString()
      );
    };

    const canDisplayPost = (postWrapper, userId) => {
      if (!postWrapper) return false;
      if (postWrapper.place !== "userPage") return false;
      if (!postWrapper._id) return false;

      return !isUserBannedFromPost(postWrapper._id, userId);
    };

    const collectVisiblePosts = (postWrappers, userId) => {
      return postWrappers
        .filter(postWrapper => canDisplayPost(postWrapper, userId))
        .map(postWrapper => postWrapper._id);
    };



    const decoded = await decodingToken(req);

    const user = await User.findById(decoded.id)
      .select("posts _id friends")
      .populate(userPostsPopulate)
      .populate(friendsPostsPopulate);

    const posts = [];

    posts.push(...collectVisiblePosts(user.posts, user._id));

    for (const friend of user.friends) {
      posts.push(...collectVisiblePosts(friend.posts, user._id));
    }

    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      status: "success",
      data: posts,
    });
  
});