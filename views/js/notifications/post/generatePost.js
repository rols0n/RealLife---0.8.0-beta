"use strict";

import postGenerator from "../../utils/post/postGenerator.js";
import postController from "../../_postsController.js";

const postGen = new postGenerator();
// new postGenerator().generatePost();
const queryParams = new URLSearchParams(window.location.search);

const post_id = queryParams.get("post_id");
const tree_id = queryParams.get("tree_id");
const comment_id = queryParams.get("comment_id");

// CODE

if (post_id) {
  // Generate button elements here
  await postGen.generatePost(post_id, true);

  setTimeout(() => {
    new postController().script();
  }, 200);
}

setTimeout(() => {
  document.querySelectorAll(`.curtain`)[0].remove();
}, 1000);
