import helpers from "./_basicHelpers.js";

// // ==========
// // Joining helpers to this obj
class genComments_helpers {
  constructor() {
    const { genElem, genBtn, genOpt } = new helpers();
    this.genElem = genElem;
    this.genBtn = genBtn;
    this.genOpt = genOpt;
    this.loggedUserID = document
      .querySelectorAll(`.navbar__profileIcon`)[0]
      .getAttribute("data-loggedUser-id");
  }

  // Helpers
  reactionsStatus = (reactionsObj, userID) => {
    let didLike = false;
    let didDisLike = false;

    // Likers = people who liked the comment;
    // disLikers = people who disLiked the comment
    const likers = Array.from(reactionsObj.likes.users);
    const disLikers = Array.from(reactionsObj.disLikes.users);

    likers.forEach((liker) => {
      if (`${liker}` === `${userID}`) didLike = true;
    });

    disLikers.forEach((disLiker) => {
      if (`${disLiker}` === `${userID}`) didDisLike = true;
    });

    return { didLike, didDisLike };
  };

  generateForm = (
    parent,
    post,
    treeID,
    dataLevel,
    canInteract,
    extraClasses,
    extraAttrs,
    textareaSize
  ) => {
    if (canInteract !== true) return;
    const attrs = [
      ["data-tree-id", treeID],
      ["data-postid", post._id],
      ["data-level", dataLevel],
      ...extraAttrs,
    ];

    const form = this.genElem(
      "form",
      ["comments__form", ...extraClasses],
      attrs
    );
    parent.appendChild(form);

    const form__profile = this.genElem("div", ["form__profile"], attrs);
    form.appendChild(form__profile);
    const loggedUserAvatar = document
      .querySelectorAll(".navbar__profileIcon")[0]
      .getAttribute("src");
    const form__avatar = this.genElem(
      "img",
      ["form__avatar"],
      [...attrs, ["src", loggedUserAvatar]]
    );
    form__profile.appendChild(form__avatar);

    // ----
    const form__content = this.genElem("div", ["form__content"], attrs);
    form.appendChild(form__content);
    const textarea = this.genElem(
      "textarea",
      ["form__textarea", textareaSize],
      [
        ...attrs,
        ["cols", 120],
        ["maxlength", 2000],
        ["placeholder", "Hey, whats going on?"],
      ]
    );
    form__content.appendChild(textarea);
    const content__container = this.genElem(
      "div",
      ["content__container", "content__container--margin"],
      attrs
    );
    form__content.appendChild(content__container);

    const form__tag = this.genElem("div", ["form__tag"], attrs);
    content__container.appendChild(form__tag);
    if (dataLevel !== "root") {
      const tag__text = this.genElem("h2", ["tag__text"], attrs);
      tag__text.textContent = "";
      form__tag.appendChild(tag__text);
    }

    const container__labels = this.genElem("div", ["container__labels"], attrs);
    content__container.appendChild(container__labels);
    const form__photos = this.genElem(
      "label",
      ["form__photos"],
      [...attrs, ["for", "hiddenInputs__photos"]]
    );
    container__labels.appendChild(form__photos);
    const f_p_image = this.genElem(
      "img",
      ["form__image"],
      [...attrs, ["src", "/imgs/icons/camera.png"], ["alt", "Choose file"]]
    );
    form__photos.appendChild(f_p_image);

    const form__submit = this.genElem(
      "label",
      ["form__submit"],
      [
        ...attrs,
        ["for", "hiddenInputs__submit"],
        ["role", "button"],
        ["tabindex", "0"],
      ]
    );
    container__labels.appendChild(form__submit);
    const f_s_image = this.genElem(
      "img",
      ["form__image"],
      [
        ...attrs,
        ["src", "/imgs/icons/send.png"],
        ["alt", "Choose file"],
        ["role", "button"],
        ["tabindex", "0"],
      ]
    );
    form__submit.appendChild(f_s_image);

    const hiddenInputs = this.genElem("div", ["form__hiddenInputs"], attrs);
    form.appendChild(hiddenInputs);
    const hddnInptPhotos = this.genElem(
      "input",
      ["hiddenInputs__photos"],
      [...attrs, ["type", "file"], ["id", "hiddenInputs__photos"]]
    );
    hiddenInputs.appendChild(hddnInptPhotos);

    const hddnInptSubmit = this.genElem(
      "input",
      ["hiddenInputs__submit"],
      [
        ...attrs,
        ["type", "submit"],
        ["id", "hiddenInputs__submit"],
        ["value", "Submit"],
      ]
    );
    hiddenInputs.appendChild(hddnInptSubmit);
  };
}

export default genComments_helpers;
