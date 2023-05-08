// ################################################
//  This file is a module for generating posts
//

import calcTimePassed from "./utils/calcTimePassed.js";
import genPostSettings from "./modules/_genPostSettings.js";
import genComments from "./modules/_genComments.js";
import helpers from "./helpers/_basicHelpers.js";
import comHelpers from "./helpers/_genComsHelpers.js";

class postGenerator {
  constructor() {
    this.server_IP = "http://127.0.0.1:3000";
    this.apiVersion = "api/v1";
    this.LINK_GET_POST = `${this.server_IP}/${this.apiVersion}/posts/`;
    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");

    this.container = document.querySelectorAll(`.posts`)[0];
    this.loggedUser = document
      .getElementsByTagName("body")[0]
      .getAttribute("data-loggedUser-id");

    this.requestOptions = {
      method: "GET",
      headers: this.myHeaders,
      credentials: "same-origin",
      redirect: "follow",
    };

    // ==========
    // Joining helpers to this obj
    const { genElem, genBtn, genOpt } = new helpers();
    this.genElem = genElem;
    this.genBtn = genBtn;
    this.genOpt = genOpt;

    // ==============
    // Joining postSettings generator (genPostSettings class)
    const {
      gen_VP_child,
      genSttgsMenu,
      genSttgsDsc,
      genSttgsVP,
      genBanUSRcard,
      genSttgsBanUSRS,
      genPostSttngs,
    } = new genPostSettings();

    this.gen_VP_child = gen_VP_child;
    this.genSttgsMenu = genSttgsMenu;
    this.genSttgsDsc = genSttgsDsc;
    this.genSttgsVP = genSttgsVP;
    this.genBanUSRcard = genBanUSRcard;
    this.genSttgsBanUSRS = genSttgsBanUSRS;
    this.genPostSttngs = genPostSttngs;

    // =========
    // Joining comments section generator
    const { generateComments } = new genComments();
    this.generateComments = generateComments;

    this.reactionsStatus = new comHelpers().reactionsStatus;
  }
  didUserLike = (reactionObj, user) => {
    let didLike = false;
    let didDisLike = false;
    console.log(reactionObj, user);
    return { didLike, didDIslike };
  };

  // ===
  genInterPostBtn = (
    didUserInteract,
    reactionType,
    status,
    count,
    post,
    imgSrc,
    parent,
    rawAttrs,
    color
  ) => {
    const attrs = [
      rawAttrs,
      ["data-reaction-type", reactionType],
      ["data-level", "thread"],
      ["data-status", status],
    ];
    const container = this.genElem(
      "div",
      [
        "interactions__reactions",
        `${didUserInteract === false ? null : "hidden"}`,
      ],
      [...attrs, ["role", "button"], ["tabindex", "0"]]
    );
    const img = this.genElem(
      "img",
      ["interactions__icon"],
      [...attrs, ["src", imgSrc]]
    );
    container.appendChild(img);

    const text = this.genElem(
      "h1",
      ["interactions__text", `interactions__text--${color}`],
      attrs
    );
    text.textContent = count;
    container.appendChild(text);
    parent.appendChild(container);
  };

  genInteractions = (post, postCard__details, attrs) => {
    // ===
    // Generating interactions

    const postCard__interactions = this.genElem(
      "div",
      ["postCard__interactions"],
      attrs
    );
    postCard__details.appendChild(postCard__interactions);
    // --
    // generating likes
    const likesCount = post.reactions.likes.count;

    let didLike = false;
    let didDisLike = false;

    const likes = post.reactions.likes.users;
    for (let i = 0; i < likes.length; i++) {
      if (`${likes[i]}` === `${this.loggedUser}`) {
        didLike = true;
      }
    }

    const disLikes = post.reactions.disLikes.users;
    for (let i = 0; i < disLikes.length; i++) {
      if (`${disLikes[i]}` === `${this.loggedUser}`) {
        didDisLike = true;
      }
    }

    this.genInterPostBtn(
      didLike === true ? true : false,
      "like",
      "not-active",
      likesCount,
      post,
      "/imgs/icons/thumbsUp.png",
      postCard__interactions,
      ["data-postID", post._id],
      "green"
    );

    this.genInterPostBtn(
      didLike === true ? false : true,
      "like",
      "active",
      likesCount,
      post,
      "/imgs/icons/thumbsUp-filled.png",
      postCard__interactions,
      ["data-postID", post._id],
      "green"
    );

    // -
    // Generating "comments" btn (this btn opens the comment section on click)
    const interactions__comments = this.genElem(
      "div",
      ["interactions__comments"],
      [...attrs, ["role", "button"], ["tabindex", "0"]]
    );
    const inter__com_img = this.genElem(
      "img",
      ["interactions__icon"],
      [...attrs, ["src", "/imgs/icons/messages.png"]]
    );
    interactions__comments.appendChild(inter__com_img);
    const inter__com_text = this.genElem("h1", ["interactions__text"], attrs);
    inter__com_text.textContent = "Comments";
    interactions__comments.appendChild(inter__com_text);

    postCard__interactions.appendChild(interactions__comments);

    // --
    // Generating disLikes
    const disLikesCount = post.reactions.disLikes.count;

    this.genInterPostBtn(
      didDisLike === true ? true : false,
      "dislike",
      "not-active",
      disLikesCount,
      post,
      "/imgs/icons/thumbs-down.png",
      postCard__interactions,
      ["data-postID", post._id],
      "red"
    );
    this.genInterPostBtn(
      didDisLike === true ? false : true,
      "dislike",
      "active",
      disLikesCount,
      post,
      "/imgs/icons/thumbs-down-filled.png",
      postCard__interactions,
      ["data-postID", post._id],
      "red"
    );
  };
  // ========
  genPostBody = (post, author) => {
    const attrs = [
      ["data-postID", post._id],
      ["data-post-author-id", author._id],
    ];

    const attr_query = `[data-postID="${post._id}"][data-post-author-id="${author._id}"]`;

    // #####
    // Gen post card
    const postCard = this.genElem("div", ["postCard"], attrs);
    const postCard__details = this.genElem("div", ["postCard__details"], attrs);
    postCard.appendChild(postCard__details);

    const postCard__author = this.genElem("div", ["postCard__author"], attrs);
    postCard__details.appendChild(postCard__author);

    // ==
    // postCard__author childs:
    const postCard__avatar = this.genElem(
      "img",
      ["postCard__avatar"],
      [...attrs, ["src", author.profileImage]]
    );
    postCard__author.appendChild(postCard__avatar);

    const postCard__authorDetails = this.genElem(
      "div",
      ["postCard__authorDetails"],
      attrs
    );

    // ==
    const postCard__name = this.genElem("h1", ["postCard__name"], attrs);
    postCard__name.textContent = author.firstName + " " + author.lastName;
    const postCard__createdAt = this.genElem(
      "h1",
      ["postCard__createdAt"],
      attrs
    );
    post.createdAt = new Date(post.createdAt);
    postCard__createdAt.textContent = `${
      calcTimePassed("Posted", post.createdAt).string
    }, at ${calcTimePassed("Posted", post.createdAt).hour}`;

    postCard__authorDetails.appendChild(postCard__name);
    postCard__authorDetails.appendChild(postCard__createdAt);

    postCard__author.appendChild(postCard__authorDetails);
    if (`${author._id}` === `${this.loggedUser}`) {
      this.genPostSttngs(
        post,
        author,
        attrs,
        postCard__author,
        postCard__details
      );
    }

    const postCard__postText = this.genElem(
      "h1",
      ["postCard__postText"],
      attrs
    );
    postCard__postText.textContent = post.postText;
    postCard__details.appendChild(postCard__postText);

    console.log(post);
    if (post.postImages)
      if (post.postImages[0]) {
        const postCard__images = this.genElem(
          "div",
          ["postCard__images"],
          [["data-images-count", 1], ...attrs]
        );
        const images__image = this.genElem(
          "img",
          ["postCard__image"],
          [["src", post.postImages[0]], ...attrs]
        );

        postCard__images.appendChild(images__image);
        postCard__details.appendChild(postCard__images);
      }

    this.genInteractions(post, postCard__details, attrs);

    // Generating comments section
    this.generateComments(postCard, post);

    this.container.appendChild(postCard);
  };

  //   =========
  generatePost = async (post_ID, queryDB, userPage) => {
    let post = post_ID;
    if (queryDB) {
      const LINK = this.LINK_GET_POST + post_ID;
      const response = await fetch(LINK, this.requestOptions);
      const result = await response.json();
      post = result.data.data;
    }

    if (!post) return;

    const author = post.author;

    if (userPage) {
      const userID = document
        .getElementsByClassName("body--userPage")[0]
        .getAttribute("data-user-id");

      if (`${author._id}` !== `${userID}`) return;
    }
    await this.genPostBody(post, author);
  };
}

export default postGenerator;
