"use strict";
import postGenerator from "./utils/post/postGenerator.js";
import postController from "./_postsController.js";

// DOM elements

class mainPage {
  constructor() {
    this.posts = document.querySelectorAll(`.posts`)[0];
    this.loggedUserID = document
      .getElementsByTagName("body")[0]
      .getAttribute("data-loggedUser-id");

    this.getReqOpts = {
      method: "GET",
      redirect: "follow",
    };
  }

  request = async (LINK, requestOptions) => {
    const response = await fetch(LINK, requestOptions);
    const result = await response.json();
    if (result.status !== "success") return;
    return result;
  };

  genPostsArray = async () => {
    const LINK = "http://127.0.0.1:3000/api/v1/users/generateFeedPosts";
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    return await this.request(LINK, requestOptions);
  };

  displayPosts = async () => {
    const posts = Array.from((await this.genPostsArray()).data);
    const postGen = new postGenerator();

    posts.forEach(async (post) => {
      await postGen.generatePost(post, false);
    });

    setTimeout(() => {
      new postController().script();
    }, 200);
  };
}

new mainPage().displayPosts();
