const Comment = require("../../models/commentModel");
const AppError = require("../../middlewares/utils/AppError");

const generateReactionsObj = require("../../utils/generateReactionsObj");

const getId = (value) => {
  return value?._id || value;
};

const isSameId = (firstId, secondId) => {
  return getId(firstId)?.toString() === getId(secondId)?.toString();
};

const updateReactions = (reactions, userID, reactionType, behaviour) => {
  const { likes, disLikes, count } = generateReactionsObj(
    behaviour,
    reactions.disLikes,
    reactions.likes,
    userID,
    reactionType,
    reactions.order
  );

  return {
    ...reactions,
    likes,
    disLikes,
    count,
  };
};

const matchesComment = (comment, commentID, author) => {
  if (!isSameId(comment._id, commentID)) return false;
  if (!author) return true;

  return isSameId(comment.author, author);
};

const getReactionTarget = (comment, level, commentID, author) => {
  if (level === "root") {
    return {
      target: comment.tree,
      updatePath: "tree.reactions",
    };
  }

  const replies = comment.tree.replies || [];

  if (level === "reply") {
    const replyIndex = replies.findIndex((reply) =>
      matchesComment(reply, commentID, author)
    );

    if (replyIndex === -1) {
      throw new AppError("Reply doesn't exist", 404, "REPLY_NOT_FOUND");
    }

    return {
      target: replies[replyIndex],
      updatePath: `tree.replies.${replyIndex}.reactions`,
    };
  }

  if (level === "subReply") {
    for (let replyIndex = 0; replyIndex < replies.length; replyIndex++) {
      const subReplies = replies[replyIndex].subReplies || [];

      const subReplyIndex = subReplies.findIndex((subReply) =>
        matchesComment(subReply, commentID, author)
      );

      if (subReplyIndex !== -1) {
        return {
          target: subReplies[subReplyIndex],
          updatePath: `tree.replies.${replyIndex}.subReplies.${subReplyIndex}.reactions`,
        };
      }
    }

    throw new AppError("Sub reply doesn't exist", 404, "SUB_REPLY_NOT_FOUND");
  }

  throw new AppError("Invalid comment level", 400, "INVALID_COMMENT_LEVEL");
};

module.exports = async (
  req,
  res,
  level,
  author,
  commentID,
  treeID,
  userID,
  reactionType,
  behaviour
) => {
  const comment = await Comment.findById(treeID);

  if (!comment) {
    throw new AppError("Comment tree doesn't exist", 404, "COMMENT_NOT_FOUND");
  }

  const { target, updatePath } = getReactionTarget(
    comment,
    level,
    commentID,
    author
  );

  const updatedReactions = updateReactions(
    target.reactions,
    userID,
    reactionType,
    behaviour
  );

  await Comment.updateOne(
    { _id: treeID },
    {
      $set: {
        [updatePath]: updatedReactions,
      },
    }
  );
};