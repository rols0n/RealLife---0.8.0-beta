const Comment = require("../../models/commentModel");

const generateReactionsObj = require("../../utils/generateReactionsObj.js");

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
  let comment;

  if (level === "root") {
    comment = await Comment.findById(treeID);
    let objHolder = comment.tree;

    let {
      likes: rawlikes,
      disLikes: rawDisLikes,
      order: rawOrder,
    } = objHolder.reactions;

    const { disLikes, likes, count } = generateReactionsObj(
      behaviour,
      rawDisLikes,
      rawlikes,
      userID,
      reactionType,
      rawOrder
    );

    objHolder.reactions.likes = likes;
    objHolder.reactions.disLikes = disLikes;
    objHolder.reactions.count = count;

    await Comment.updateOne(
      { _id: treeID },
      {
        $set: {
          [`tree.reactions`]: objHolder.reactions,
        },
      }
    );
  }

  if (level === "reply") {
    strLevel = [`tree`, `replies`];
    strLevel_ = "tree.replies";
  } else if (level === "subReply") {
    strLevel = [`tree`, `replies`, `subReplies`];
    strLevel_ = "tree.replies.subReplies";
  } else return;
  // ------
  // Getting commentObj that we will work on for subReplies/replies
  if (level === "subReply" || level === "reply") {
    // # strLevel_ is a path to the object in collection
    comment = await Comment.findOne({
      [`${strLevel_}.author`]: author,
      [`${strLevel_}._id`]: commentID,
      _id: treeID,
    });
  }
  // ---

  if (level === "reply") {
    let replyObj, indexOfReply;

    const replies = Array.from(comment.tree.replies);

    replies.forEach((reply) => {
      if (`${reply._id}` === `${commentID}`) {
        indexOfReply = replies.indexOf(reply);
        replyObj = reply;
      }
    });

    let {
      likes: rawlikes,
      disLikes: rawDisLikes,
      order: rawOrder,
    } = replyObj.reactions;

    const { disLikes, likes, count } = generateReactionsObj(
      behaviour,
      rawDisLikes,
      rawlikes,
      userID,
      reactionType,
      rawOrder
    );

    replyObj.reactions.likes = likes;
    replyObj.reactions.disLikes = disLikes;
    replyObj.reactions.count = count;

    await Comment.updateOne(
      { _id: treeID },
      {
        $set: {
          [`tree.replies.${indexOfReply}.reactions`]: replyObj.reactions,
        },
      }
    );
  }
  // ========
  // Managing subReply
  if (level === "subReply") {
    let subReplyObj, replyIndex, subReplyIndex;

    const replies = Array.from(comment.tree.replies);
    replies.forEach((reply) => {
      // Looping over replies, so we could loop over subReplies
      const subReplies = Array.from(reply.subReplies);
      subReplies.forEach((subReply) => {
        // Looping over subReplies to find subReply that interests us
        if (`${subReply._id}` === `${commentID}`) {
          subReplyObj = subReply;

          // Signing the index of reply and subReply so we could use them later for updating database
          replyIndex = replies.indexOf(reply);
          subReplyIndex = subReplies.indexOf(subReply);
        }
      });
    });

    let {
      likes: rawlikes,
      disLikes: rawDisLikes,
      order: rawOrder,
    } = subReplyObj.reactions;

    const { disLikes, likes, count } = generateReactionsObj(
      behaviour,
      rawDisLikes,
      rawlikes,
      userID,
      reactionType,
      rawOrder
    );

    subReplyObj.reactions.likes = likes;
    subReplyObj.reactions.disLikes = disLikes;
    subReplyObj.reactions.count = count;

    await Comment.updateOne(
      { _id: treeID },
      {
        $set: {
          [`tree.replies.${replyIndex}.subReplies.${subReplyIndex}`]:
            subReplyObj,
        },
      }
    );
  }
  // ===
};
