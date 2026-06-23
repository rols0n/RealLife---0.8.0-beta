// const socket = new WebSocket("ws://localhost:8080");
import postGenerator from "./utils/post/postGenerator.js";
import postController from "./_postsController.js";
import { basicRequest } from "./utils/_basicRequest.js";

//  DOM elements
const userPageSectionsSelectors = document.getElementsByClassName(
  "userPage__topContent__navbar__element"
);

// sections
const postsSection = document.getElementsByClassName(
  "content__leftSide--userPage"
);

const postsSection2 = document.getElementsByClassName(
  "content__userPage__rightContent"
);
const informationsSection = document.getElementsByClassName(
  "content__userPage__informations"
);
const friendsSection = document.getElementsByClassName(
  "content__userPage__friends"
);
const photosSection = document.getElementsByClassName(
  "content__userPage__images"
);
const moviesSection = document.getElementsByClassName(
  "content__userPage__movies"
);
const profileConfigMenuButton =
  document.getElementsByClassName("picturezindex2");
const body = document.getElementsByTagName("body");

const profileConfidMenuBackground =
  document.getElementsByClassName("profileConfigMenu");

const exitProfileConfigMenuButton =
  document.getElementsByClassName("topbar__btn--quit");

const editProfileInfoBtn = document.getElementsByClassName(
  "section__btn--move_to_settings"
);
const profilePicSettings = document.getElementsByClassName(
  "content__section--avatar"
);

const profilePicEditButton = document.getElementsByClassName(
  "section__btn--edit_avatar"
);

const profileImageConfigFileForm = document.getElementsByClassName(
  "section__form--avatar"
);

const profileImage = document.getElementById("label__inputFile--avatar");
const profileImagePreview = document.getElementsByClassName(
  "section__preview--avatar"
);

// Banner
const bannerSettings = document.getElementsByClassName("section--baner");

const profileBannedEditButton = document.getElementsByClassName(
  "section__btn--edit_banner"
);

const profileBannerConfigFileForm = document.getElementsByClassName(
  "section__form--banner"
);

const profileBanner = document.getElementById("label__inputFile--banner");
const bannerImagePreview = document.getElementsByClassName(
  "section__preview--banner"
);

function getProfileImageAndUpdateUser() {
  const files = profileImage.files[0];
  if (files) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files);
    fileReader.addEventListener("load", function () {
      const element2 =
        '<img src="' +
        this.result +
        '" class="preview__img preview__img--avatar" />';

      profileImagePreview[0].innerHTML = element2;

      profileImageConfigFileForm[0].addEventListener(
        "submit",
        async (event) => {
          event.preventDefault();

          const formdata = new FormData();
          formdata.append("profileImage", profileImage.files[0]);

          const requestOptions = {
            method: "PATCH",
            // headers: myHeaders,
            body: formdata,
            redirect: "follow",
            credentials: "same-origin",
          };

          fetch(
            "http://127.0.0.1:3000/api/v1/users/updateProfilePicture/update",
            requestOptions
          )
            .then((response) => response.json())
            .then(
              (result) => window.location.reload()
              // console.log(result)
            )
            .catch((error) => console.log("error", error));
        }
      );
    });
  }
}

function getBannerImageAndUpdateUser() {
  const files = profileBanner.files[0];
  if (files) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files);
    fileReader.addEventListener("load", function () {
      const element2 =
        '<img src="' +
        this.result +
        '" class="preview__img preview__img--banner" />';

      bannerImagePreview[0].innerHTML = element2;

      profileBannerConfigFileForm[0].addEventListener(
        "submit",
        async (event) => {
          event.preventDefault();

          const formdata = new FormData();
          formdata.append("bannerPicture", profileBanner.files[0]);

          const requestOptions = {
            method: "PATCH",
            // headers: myHeaders,
            body: formdata,
            redirect: "follow",
            credentials: "same-origin",
          };

          fetch(
            "http://127.0.0.1:3000/api/v1/users/updateBannerPicture/update",
            requestOptions
          )
            .then((response) => response.json())
            .then((result) => window.location.reload())
            .catch((error) => console.log("error", error));
        }
      );
    });
  }
}

userPageSectionsSelectors[0].addEventListener("click", (event) =>
  event.preventDefault()
);

// EVENT LISTENERS
if (profileConfigMenuButton[0]) {
  profileConfigMenuButton[0].addEventListener("click", (event) => {
    window.scrollTo(0, 0);
    body[0].classList.add("overflowHidden");
    profileConfidMenuBackground[0].classList.remove("hidden");

    exitProfileConfigMenuButton[0].addEventListener("click", (event) => {
      profileConfidMenuBackground[0].classList.add("hidden");
      body[0].classList.remove("overflowHidden");

      profileImage.files[0] = "";
      profileImageConfigFileForm[0].submit();
    });

    profilePicEditButton[0].addEventListener("click", (event) => {
      bannerSettings[0].classList.add("hidden");
      editProfileInfoBtn[0].classList.add("hidden");

      profileImageConfigFileForm[0].classList.remove("hidden");
    });

    profileBannedEditButton[0].addEventListener("click", (event) => {
      profilePicSettings[0].classList.add("hidden");
      editProfileInfoBtn[0].classList.add("hidden");

      profileBannerConfigFileForm[0].classList.remove("hidden");
    });
  });
}

if (profileBanner || profileImage) {
  profileImage.addEventListener("change", function () {
    getProfileImageAndUpdateUser();
  });

  profileBanner.addEventListener("change", function () {
    getBannerImageAndUpdateUser();
  });
}

// Generating posts
const postGen = new postGenerator();
const userID = document
  .getElementsByTagName("body")[0]
  .getAttribute("data-user-id");

const requestOptions = {
  method: "GET",

  redirect: "follow",
  credentials: "same-origin",
};
const response = await fetch(
  "http://127.0.0.1:3000/api/v1/users/generateFeedPosts",
  requestOptions
);
const result = await response.json();

if (result.status === "success") {
  const posts = result.data;
  const postGen = new postGenerator();
  console.log(posts.length);
  posts.forEach(async (post) => {
    await postGen.generatePost(post, false, true);
  });
}

setTimeout(() => {
  new postController().script();
}, 200);
