"use strict";

import postGenerator from "./utils/post/postGenerator.js";
import postController from "./_postsController.js";

class MainPage {
  constructor() {
    this.posts = document.querySelector(".posts");

    this.loggedUserID = document.body.getAttribute("data-loggedUser-id");

    this.getReqOpts = {
      method: "GET",
      redirect: "follow",
    };
  }

  request = async (link, requestOptions = this.getReqOpts) => {
  try {
    const response = await fetch(link, requestOptions);

    const result = await response.json();

    if (!response.ok) {
      console.error("Backend error:", result);

      throw new Error(
        result.message || `Request failed with status ${response.status}`
      );
    }

    if (result.status !== "success") {
      throw new Error(result.message || "Request was not successful");
    }

    return result;
  } catch (err) {
    console.error("Request error:", err);
    return null;
  }
};

  genPostsArray = async () => {
    const link = "/api/v1/users/generateFeedPosts";

    return await this.request(link);
  };

  displayPosts = async () => {
    const result = await this.genPostsArray();

    if (!result?.data) return;

    const posts = Array.from(result.data);
    const postGen = new postGenerator();

    for (const post of posts) {
      await postGen.generatePost(post, false);
    }

    new postController().script();
  };
}

new MainPage().displayPosts();