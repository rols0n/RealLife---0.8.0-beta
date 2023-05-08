import helpers from "../helpers/_basicHelpers.js";
import genComments_helpers from "../helpers/_genComsHelpers.js";

class genComments {
  constructor() {
    this.canInteract = true;

    // ==========
    // Joining helpers to this obj
    const { genElem, genBtn, genOpt } = new helpers();
    this.genElem = genElem;
    this.genBtn = genBtn;
    this.genOpt = genOpt;
    this.loggedUserID = document
      .querySelectorAll(`.navbar__profileIcon`)[0]
      .getAttribute("data-loggedUser-id");

    const { reactionsStatus, generateForm } = new genComments_helpers();
    this.reactionsStatus = reactionsStatus;
    this.generateForm = generateForm;
  }

  genInteractCard = (
    rawAttrs,
    interType,
    interStatus,
    classes,
    src,
    parent,
    count
  ) => {
    const classHtml = classes;
    const attrs = [
      ...rawAttrs,
      ["data-interactions-type", interType],
      ["data-interactions-status", interStatus],
    ];

    const card = this.genElem(
      "div",
      ["interactions__card", ...classes],
      [...attrs, ["role", "button"], ["tabindex", "0"]]
    );
    parent.appendChild(card);

    const img = this.genElem("img", ["card__icon"], [...attrs, ["src", src]]);
    card.appendChild(img);
    const text = this.genElem("h4", ["card__text"], attrs);
    text.textContent = count;
    card.appendChild(text);
  };
  genReactionBtns = (parent, obj, attrs, canInteract, repliesLength, level) => {
    const commentCard__interactions = this.genElem(
      "div",
      ["commentCard__interactions"],
      attrs
    );
    parent.appendChild(commentCard__interactions);

    if (!canInteract && level !== "subReply" && repliesLength !== 0) {
      const interactions__replies = this.genElem(
        "h1",
        ["interactions__replies"],
        [...attrs, ["role", "button"], ["tabindex", "0"]]
      );
      interactions__replies.textContent = `replies (${repliesLength})`;
      commentCard__interactions.appendChild(interactions__replies);
    } else {
      const interactions = this.genElem("div", ["interactions"], attrs);
      commentCard__interactions.appendChild(interactions);

      const { didLike, didDisLike } = this.reactionsStatus(
        obj,
        this.loggedUserID
      );

      // Generating like cards:

      // 1)
      this.genInteractCard(
        attrs,
        "like",
        "active",
        [
          "animate__animated",
          "animate__tada",
          `${didLike === false ? "hidden" : "x"}`,
        ],
        "/imgs/icons/thumbsUp-filled.png",
        interactions,
        obj.likes.count
      );

      // 2)
      this.genInteractCard(
        attrs,
        "like",
        "not-active",

        [
          "animate__animated",
          "animate__flipInX",
          `${didLike === false ? "x" : "hidden"}`,
        ],
        "/imgs/icons/thumbsUp.png",
        interactions,
        obj.likes.count
      );

      // Generating disLike cards:
      // 1)
      this.genInteractCard(
        attrs,
        "disLike",
        "active",
        [
          `animate__animated`,
          "animate__wobble",
          `${didDisLike === false ? "hidden" : "x"}`,
        ],
        "/imgs/icons/thumbs-down-filled.png",
        interactions,
        obj.disLikes.count
      );

      // 2)
      this.genInteractCard(
        attrs,
        "disLike",
        "not-active",
        [
          `animate__animated`,
          `animate__flipInX`,
          `${didDisLike === false ? "x" : "hidden"}`,
        ],
        "/imgs/icons/thumbs-down.png",
        interactions,
        obj.disLikes.count
      );

      // ----------
      if (level !== "subReply" && repliesLength !== 0) {
        const interactions__replies = this.genElem(
          "h1",
          ["interactions__replies"],
          [...attrs, ["role", "button"], ["tabindex", "0"]]
        );
        interactions__replies.textContent = `replies (${repliesLength})`;
        commentCard__interactions.appendChild(interactions__replies);
      }

      const interactions__reply = this.genElem(
        "h1",
        ["interactions__reply"],
        [...attrs, ["role", "button"], ["tabindex", "0"]]
      );
      interactions__reply.textContent = "reply";
      commentCard__interactions.appendChild(interactions__reply);
    }
  };

  genComCard = (
    obj,
    level,
    rawAttrs,
    parent,
    lvlBelow,
    treeID,
    post,
    hidden
  ) => {
    const { didLike, didDisLike } = this.reactionsStatus(
      obj.reactions,
      this.loggedUserID
    );
    const attrs = [
      ["data-level", level],
      ["data-author-id", obj.author._id],
      ...rawAttrs,
    ];
    const { author } = obj;

    const commentCard = this.genElem("div", ["commentCard", hidden], attrs);
    parent.appendChild(commentCard);

    const details = this.genElem("div", ["commentCard__details"], attrs);
    commentCard.appendChild(details);
    const ancherTag_avtr = this.genElem(
      "a",
      [],
      [...attrs, ["href", `/userPage/${author._id}`]]
    );

    const avatar = this.genElem(
      "img",
      ["commentCard__avatar"],
      [...attrs, ["src", author.profileImage]]
    );
    ancherTag_avtr.appendChild(avatar);
    details.appendChild(ancherTag_avtr);

    const content = this.genElem("div", ["commentCard__content"], attrs);
    details.appendChild(content);
    const name = this.genElem(
      "a",
      ["commentCard__name"],
      [...attrs, ["href", `/userPage/${author._id}`]]
    );
    name.textContent = author.firstName + " " + author.lastName;
    content.appendChild(name);
    const text = this.genElem("h3", ["commentCard__text"], attrs);
    text.textContent = obj.text;
    content.appendChild(text);

    let repliesLength = 0;
    if (level === "root") {
      repliesLength = obj.replies.length;
    }

    if (level === "reply") {
      repliesLength = obj.subReplies.length;
    }

    // Generating like and disLike btns
    this.genReactionBtns(
      commentCard,
      obj.reactions,
      attrs,
      true,
      repliesLength,
      level
    );

    const attrs2 = [["data-level", lvlBelow], ...rawAttrs];
    const nestedData = this.genElem(
      "div",
      ["commentCard__nested-data"],
      attrs2
    );
    commentCard.appendChild(nestedData);
    // console.log("\n", post);
    this.generateForm(
      nestedData,
      post,
      treeID,
      lvlBelow,
      true,
      ["comments__form--" + lvlBelow, "hidden"],
      [
        ["data-replies-to-user", obj.author._id],
        ["data-replies-to-comment", obj._id],
      ],
      "form__textarea--medium"
    );

    return { commentID: obj._id };
  };

  generateTree = async (comments, post, treeObj) => {
    // Generating root comment
    console.log(treeObj);
    if (!treeObj.tree) return;
    const { _id: rootID } = treeObj.tree;
    const attrs = [
      ["data-postID", post._id],

      ["data-tree-id", treeObj._id],
    ];
    const rootAttrs = [
      ...attrs,
      // ["data-level", "root"],
      ["data-comment-id", rootID],
    ];

    // Generating root comment
    const comments__tree = this.genElem(
      "div",
      ["comments__tree"],
      [...attrs, ["data-level", "thread"]]
    );
    comments.appendChild(comments__tree);

    await this.genComCard(
      treeObj.tree,
      "root",
      rootAttrs,
      comments__tree,
      "reply",
      treeObj._id,
      post
    );

    // Root Replies
    const replies = Array.from(treeObj.tree.replies);
    const nested_reply = document.querySelector(
      `.commentCard__nested-data[data-level="reply"][data-tree-id="${treeObj._id}"]`
    );

    replies.forEach(async (reply) => {
      const replyAtttrs = [
        ...attrs,
        // ["data-level", "reply"],
        ["data-comment-id", reply._id],
        ["data-comment-over", rootID],
      ];
      const { commentID } = await this.genComCard(
        reply,
        "reply",
        replyAtttrs,
        nested_reply,
        "subReply",
        treeObj._id,
        post,
        "hidden"
      );

      // Generating subReplies:

      const nested_subReply = document.querySelector(
        `.commentCard__nested-data[data-level="subReply"][data-tree-id="${treeObj._id}"][data-comment-id="${commentID}"]`
      );

      const subReplies = Array.from(reply.subReplies);
      subReplies.forEach(async (subReply) => {
        const subReplyAtttrs = [
          ...attrs,
          // ["data-level", "reply"],
          ["data-comment-id", subReply._id],
          ["data-comment-over", commentID],
          ["data-replies-to-comment", commentID],
          ["data-replies-to-user", reply.author._id],
        ];
        await this.genComCard(
          subReply,
          "subReply",
          subReplyAtttrs,
          nested_subReply,
          "subReply_",
          treeObj._id,
          post,
          "hidden"
        );
      });
    });
  };

  generateComments = (postCard, post) => {
    const comments = this.genElem(
      "div",
      ["postCard__comments", "hidden"],
      [["data-postid", post._id]]
    );
    postCard.appendChild(comments);
    // console.log(post);

    // Generating main form, that is used for uploading root comments
    this.generateForm(
      comments,
      post,
      null,
      "root",
      true,
      ["comments__form--main"],
      [],
      "form__textarea--medium"
    );

    // console.log(post.comments[0]);
    const trees = Array.from(post.comments);

    trees.forEach((tree) => {
      this.generateTree(comments, post, tree);
    });
  };
}

export default genComments;
