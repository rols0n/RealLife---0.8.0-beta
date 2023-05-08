import helpers from "../helpers/_basicHelpers.js";

class genPostSettings {
  constructor() {
    // ==========
    // Joining helpers to this obj
    const { genElem, genBtn, genOpt } = new helpers();
    this.genElem = genElem;
    this.genBtn = genBtn;
    this.genOpt = genOpt;
  }

  gen_VP_child = (
    attrs,
    sectionName,
    dsc,
    selectType,
    currSettValue,
    contParent
  ) => {
    const container = this.genElem("div", [`V-P__${sectionName}`], attrs);
    const dscElem = this.genElem("h4", ["V-P__dsc"], attrs);
    dscElem.textContent = dsc;
    container.appendChild(dscElem);
    const dataSelType = ["data-select-type", selectType];

    const selectAttrs = [...attrs, dataSelType];
    const select = this.genElem("select", ["V-P__select"], selectAttrs);

    switch (currSettValue) {
      case "everyone":
        // Gen "everyone" option in select
        this.genOpt("everyone", "everyone", selectAttrs, select);

        // Gen "Friends only" option in select
        this.genOpt("Friends only", "friends-only", selectAttrs, select);

        // Gen "Friends and their friends" option in select
        this.genOpt(
          "Friends and their friends",
          "friends-and-their-friends-only",
          selectAttrs,
          select
        );
        break;
      case "friends-only":
        // Gen "Friends only" option in select
        this.genOpt("Friends only", "friends-only", selectAttrs, select);

        // Gen "everyone" option in select
        this.genOpt("everyone", "everyone", selectAttrs, select);

        // Gen "Friends and their friends" option in select
        this.genOpt(
          "Friends and their friends",
          "friends-and-their-friends-only",
          selectAttrs,
          select
        );

        break;
      case "friends-and-their-friends-only":
        // Gen "Friends and their friends" option in select
        this.genOpt(
          "Friends and their friends",
          "friends-and-their-friends-only",
          selectAttrs,
          select
        );
        // Gen "Friends only" option in select
        this.genOpt("Friends only", "friends-only", selectAttrs, select);

        // Gen "everyone" option in select
        this.genOpt("everyone", "everyone", selectAttrs, select);

        break;
    }

    container.appendChild(select);
    contParent.appendChild(container);
  };

  genSttgsMenu = (attrs, parent) => {
    const settings__menu = this.genElem(
      "div",
      ["settings__menu", "animate__animated", "animate__fadeIn"],
      attrs
    );
    parent.appendChild(settings__menu);

    this.genBtn(
      ["menu__option"],
      attrs,
      ["data-open-menu", "description"],
      "Change description",
      settings__menu
    );

    this.genBtn(
      ["menu__option"],
      attrs,
      ["data-open-menu", "Visibility-Privacy"],
      "Visibility/Privacy settings",
      settings__menu
    );

    this.genBtn(
      ["menu__option"],
      attrs,
      ["data-open-menu", "ban-users"],
      "Ban users from seeing this Post",
      settings__menu
    );
    this.genBtn(
      ["menu__option"],
      attrs,
      ["data-open-menu", "delete-post"],
      "Delete this Post",
      settings__menu
    );
  };

  genSttgsDsc = (post, attrs, parent) => {
    const settings__description_div = this.genElem(
      "div",
      [
        "settings__description",
        "hidden",
        "animate__animated",
        "animate__fadeIn",
      ],
      [...attrs, ["data-type", "section"]]
    );

    const description__heading = this.genElem(
      "h3",
      ["description__heading"],
      attrs
    );
    description__heading.textContent = "Change the post's description: ";
    const description__textarea = this.genElem(
      "textarea",
      ["description__textarea"],
      [...attrs, ["placeholder", post.postText]]
    );
    const description__submit = this.genElem(
      "button",
      ["description__submit"],
      attrs
    );
    description__submit.textContent = "Submit";

    settings__description_div.appendChild(description__heading);
    settings__description_div.appendChild(description__textarea);
    settings__description_div.appendChild(description__submit);

    parent.appendChild(settings__description_div);
  };

  genSttgsVP = (post, attrs, parent) => {
    const stngs__Visibi_Priv = this.genElem(
      "div",
      [
        "settings__Visibility-Privacy",
        "hidden",
        "animate__animated",
        "animate__fadeIn",
      ],
      [...attrs, ["data-type", "section"]]
    );

    // Gen child "post"
    this.gen_VP_child(
      attrs,
      "post",
      "Who can see this post?",
      "whoCanSeePost",
      post.whoCanSeePost,
      stngs__Visibi_Priv
    );

    // Gen child "comments"
    this.gen_VP_child(
      attrs,
      "comments",
      "Who can see this post's comments?",
      "whoCanSeeComments",
      post.whoCanSeeComments,
      stngs__Visibi_Priv
    );

    // Gen child "interactions"
    this.gen_VP_child(
      attrs,
      "interactions",
      "Who can interact with this post?",
      "whoCanInteract",
      post.whoCanInteract,
      stngs__Visibi_Priv
    );

    const VP__submit = this.genElem("button", ["V-P__submit"], attrs);
    VP__submit.textContent = "Submit";
    stngs__Visibi_Priv.appendChild(VP__submit);

    parent.appendChild(stngs__Visibi_Priv);
  };

  genBanUSRcard = (user, rawAttrs, side, parent) => {
    const attrs = [
      rawAttrs,
      ["data-card-side", side],
      ["data-user-id", user._id],
    ];
    const card = this.genElem("div", ["ban-users__card"], attrs);
    const btn = this.genElem("button", ["ban-users__btn"], attrs);
    const btn__icon = this.genElem(
      "img",
      [],
      [...attrs, ["src", "/imgs/icons/x-circle-red.png"]]
    );

    btn.appendChild(btn__icon);
    card.appendChild(btn);
    const content = this.genElem("div", ["ban-users__content"], attrs);
    const content__img = this.genElem(
      "img",
      ["ban-users__img"],
      [...attrs, ["src", user.profileImage]]
    );
    content.appendChild(content__img);
    const name = this.genElem("h3", ["ban-users__name"], attrs);
    name.textContent = user.firstName + " " + user.lastName;
    content.appendChild(name);

    card.appendChild(content);

    parent.appendChild(card);
  };

  genSttgsBanUSRS = (post, attrs, parent) => {
    const sttgs__ban_users = this.genElem(
      "div",
      ["settings__ban-users", "hidden", "animate__animated", "animate__fadeIn"],
      [...attrs, ["data-type", "section"]]
    );

    const ban_users__top = this.genElem("div", ["ban-users__top"], attrs);
    const ban_users__header = this.genElem("h3", ["ban-users__headers"], attrs);
    ban_users__header.textContent = "Choose who can't see this post";
    ban_users__top.appendChild(ban_users__header);
    const ban_users__input = this.genElem(
      "input",
      ["ban-users__input"],
      [...attrs, ["placeholder", "Type user's name"]]
    );
    ban_users__top.appendChild(ban_users__input);
    const ban_users__cards_choose = this.genElem(
      "div",
      ["ban-users__cards"],
      [...attrs, ["data-card-side", "choose"]]
    );
    ban_users__top.appendChild(ban_users__cards_choose);

    sttgs__ban_users.appendChild(ban_users__top);
    //
    const ban_users__bottom = this.genElem("div", ["ban-users__bottom"], attrs);
    const ban_users__header_bottom = this.genElem(
      "h3",
      ["ban-users__header"],
      attrs
    );
    ban_users__header_bottom.textContent = "People who can't see this post: ";
    ban_users__bottom.appendChild(ban_users__header_bottom);
    const ban_users__cards_choosed = this.genElem(
      "div",
      ["ban-users__cards"],
      [...attrs, ["data-card-side", "choosed"]]
    );
    ban_users__bottom.appendChild(ban_users__cards_choosed);

    // ---
    // Generating cards of users that cant display post
    const users = Array.from(post.cantBeDisplayedBy);
    // console.log(users);
    users.forEach((user) => {
      // console.log(user);
      this.genBanUSRcard(
        user,
        ["data-postID", post._id],
        "choosed",
        ban_users__cards_choosed
      );
    });
    // Generating submit btn
    const ban_users__submit = this.genElem("div", ["ban-users__submit"], attrs);
    const submit__btn = this.genElem("button", ["submit__btn"], attrs);
    submit__btn.textContent = "Submit";
    ban_users__submit.appendChild(submit__btn);
    const submit__dsc = this.genElem("p", ["submit__dsc"], attrs);
    submit__dsc.textContent =
      "*As soon as you click submit, the users that you choosed, will not be able to see this post";
    ban_users__submit.appendChild(submit__dsc);

    sttgs__ban_users.appendChild(ban_users__bottom);
    sttgs__ban_users.appendChild(ban_users__submit);
    parent.appendChild(sttgs__ban_users);
  };

  // ===
  genPostSttngs = (
    post,
    author,
    attrs,
    postCard__author,
    postCard__details
  ) => {
    const postCard__settOpen = this.genElem(
      "img",
      ["postCard__setting--open"],
      [
        ...attrs,
        ["src", `/imgs/icons/settings.png`],
        ["role", "button"],
        ["tabindex", "0"],
      ]
    );
    const postCard__settBack = this.genElem(
      "img",
      ["postCard__setting--back", "hidden"],
      [
        ...attrs,
        ["src", `/imgs/icons/arrow-u-down-left.png`],
        ["data-move-back-to", "post"],
        ["data-currently-at", "menu"],
        ["role", "button"],
        ["tabindex", "0"],
      ]
    );

    postCard__author.appendChild(postCard__settOpen);
    postCard__author.appendChild(postCard__settBack);

    // ===
    // Generating post settings
    const postCard__settings = this.genElem(
      "div",
      ["postCard__settings", "hidden", "animate__animated", "animate__fadeIn"],
      attrs
    );

    postCard__details.appendChild(postCard__settings);

    const settings__description = this.genElem(
      "h2",
      ["settings__description"],
      [...attrs, ["data-type", "heading"]]
    );
    settings__description.textContent = "Settings";
    postCard__settings.appendChild(settings__description);

    // -- postCard__settings #1 div-child
    // Creatings settings__menu
    this.genSttgsMenu(attrs, postCard__settings);

    // -- postCard__settings #2 div-child
    // Creating settings__description
    this.genSttgsDsc(post, attrs, postCard__settings);

    // -- postCard__settings #3 div-child
    // Creating settings__Visibility_Privacy
    this.genSttgsVP(post, attrs, postCard__settings);

    // -- postCard__settings #4 div-child
    // Creating settings__ban-users
    this.genSttgsBanUSRS(post, attrs, postCard__settings);

    // -- postCard__settings #5 div-child
    // Creating delete-post MENU
    const sttgs_deletePost = this.genElem(
      "div",
      [
        "settings__delete-post",
        "hidden",
        "animate__animated",
        "animate__fadeIn",
      ],
      [...attrs, ["data-type", "section"]]
    );
    const deletePost_txt = this.genElem("h3", ["delete-post__text"], attrs);
    deletePost_txt.textContent = "Are you sure?";
    sttgs_deletePost.appendChild(deletePost_txt);

    const deletePost_btns = this.genElem("div", ["delete-post__btns"], attrs);
    const deletePost_cancel = this.genElem(
      "button",
      ["delete-post__cancel"],
      attrs
    );
    deletePost_cancel.textContent = "No, take me back.";
    deletePost_btns.appendChild(deletePost_cancel);

    const deletePost_submit = this.genElem(
      "button",
      ["delete-post__submit"],
      attrs
    );
    deletePost_submit.textContent = "Yes, delete this post.";
    deletePost_btns.appendChild(deletePost_submit);

    sttgs_deletePost.appendChild(deletePost_btns);
    postCard__settings.appendChild(sttgs_deletePost);
  };
}

export default genPostSettings;
