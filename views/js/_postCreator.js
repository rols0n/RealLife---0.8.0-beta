"use strict";

// DOM ELEMENTS

// DOM universal
// 1) submit
const submit = document.getElementsByClassName("postCreator__submit");

// 2) postCreatoTextarea
const postCreatorTextarea = document.getElementById("postCreator__textarea");

// 3) displayPostCreatorBtn
const displayPostCreatorBtn = document.getElementsByClassName(
  "postCreatorDisplayer__topContent__container"
);

// 4) postCreatorForm
const postCreatorForm = document.getElementsByClassName("postCreator");

// 5) hideForm
const hideForm = document.getElementsByClassName("postCreator__quit");

// ---
// elements below are the background on the group page
const navbar = document.getElementsByClassName("navbar");
const contentUserPage = document.getElementsByClassName("content--userPage");
const profileTopContent = document.getElementsByClassName(
  "userPage__topContent"
);

const groupSideBar = document.getElementsByClassName("sideBar");
const groupContent = document.getElementsByClassName("group");

const mainPageContent = document.getElementsByClassName("content--mainPage");
const pageBackground = [
  contentUserPage,
  profileTopContent,
  groupSideBar,
  groupContent,
  mainPageContent,
  navbar,
];

// -----------------

const displayPostCreatorWithImagesCard = document.getElementsByClassName(
  "postCreatorDisplayer__bottomContent__moviesImages"
);

// FORM
const postCreatorBackground = document.getElementsByClassName(
  "postCreator--container"
);

const uploadImage = document.getElementsByClassName("postCreator__imageInput");

const userPageTopContentNavbar = document.getElementsByClassName(
  "userPage__topContent"
);

const userPageLeftContent = document.getElementsByClassName(
  "content__leftSide--userPage"
);

const userPageRightContent = document.getElementsByClassName(
  "content__userPage__rightContent"
);

// -----------------------------------

// function

const createPost = async () => {
  /// ----
  // Code below creates post, by sending the data to the API

  // Check if textarea is not empty
  if (postCreatorTextarea.value !== "") {
    // PROCESS OF CREATING THE POST

    // ===
    // 1) Creating the post with just the text
    // cp stands for CREATING POST
    const cp_Headers = new Headers();
    cp_Headers.append("Content-Type", "application/json");

    let cp_Raw = JSON.stringify({
      postText: `${postCreatorTextarea.value}`,
      place: "userPage",
    });

    if (
      document.getElementsByTagName("body")[0].classList[0].split("--")[1] ===
      "groupPage"
    ) {
      const groupID = document
        .getElementsByClassName("group")[0]
        .classList[1].split("_")[1];

      cp_Raw = JSON.stringify({
        postText: `${postCreatorTextarea.value}`,
        place: "groupPage",
        groupID,
      });
    }

    const cp_RequestOptions = {
      method: "POST",
      headers: cp_Headers,
      body: cp_Raw,
      redirect: "follow",
      credentials: "same-origin",
    };

    const cp_Response = await fetch(
      "http://127.0.0.1:3000/api/v1/posts",
      cp_RequestOptions
    );
    const cp_Result = await cp_Response.json();
    if (cp_Result.status === "success") {
      // ===
      // 2) Checking if the user provided any images, and updating POST with them
      const image = document.getElementById("postCreator__hiddenImageInput");

      if (image.files[0] !== undefined) {
        // ---
        // iu stands for Image Uploading
        const iu_Formdata = new FormData();
        iu_Formdata.append("firstImage", image.files[0]);

        const iu_RequestOptions = {
          method: "PATCH",
          body: iu_Formdata,
          redirect: "follow",
          credentials: "same-origin",
        };
        const postID = cp_Result.data.data._id;

        const iu_Response = await fetch(
          `http://127.0.0.1:3000/api/v1/posts/uploadImage/${postID}`,
          iu_RequestOptions
        );

        const iu_Result = await iu_Response.json();

        if (iu_Result.status === "success") {
          // Reloading the page (there was no error)
          location.reload();
        } else {
          window.alert("something went wrong (image)");
        }
      } else {
        location.reload();
      }
    } else {
      window.alert("Something went wrong with creating post");
    }
  }
};

// ---
// If the users hovers on submit button, and the textarea is empty, then the cursor is set to not-allowed
submit[0].addEventListener("mouseover", (event) => {
  event.preventDefault();
  if (postCreatorTextarea.value === "") {
    submit[0].style = "cursor: not-allowed";
  } else {
    submit[0].style = "cursor: pointer";
  }
});

// ----
//  Same as above, but this time logic is implemented on "click"
submit[0].addEventListener("click", async (event) => {
  event.preventDefault();
  if (postCreatorTextarea.value === "") {
    submit[0].style = "cursor: not-allowed";
    return;
  }

  await createPost();
});

// ----
// Code below displays POST CREATOR FORM
displayPostCreatorBtn[0].addEventListener("click", async (event) => {
  event.preventDefault();

  postCreatorForm[0].classList.remove("hidden");
  // let y = postCreatorForm[0].getBoundingClientRect().top + 550;

  // if (postCreatorForm[0].classList[2].split("--")[1] === "groupPage") {
  //   y = 950;
  // }
  window.scrollTo({ top: 0, behavior: "smooth" });

  // postCreatorForm[0].focus();
  document.getElementsByTagName("body")[0].style = "overflow: hidden";

  pageBackground.forEach((bg) => {
    if (!bg[0]) return;
    bg[0].style = "filter: blur(5px)";
  });
});

// ----
// Code below hides POST CREATOR FORM, whenever user clicks at the button
hideForm[0].addEventListener("click", (event) => {
  event.preventDefault();

  postCreatorForm[0].classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementsByTagName("body")[0].style = "overflow-y: scroll";
  pageBackground.forEach((bg2) => {
    if (!bg2[0]) return;
    bg2[0].style = "filter: blur(0px)";
  });
});

// Preview
const imageInput = document.querySelectorAll(
  `#postCreator__hiddenImageInput`
)[0];
const previewContainer = document.querySelectorAll(
  `.postCreator__imagesCard`
)[0];
const preview = document.querySelectorAll(`.postCreator__image`)[0];

imageInput.addEventListener("change", function (event) {
  console.log(this.files[0]);
  const imageUrl = URL.createObjectURL(this.files[0]);

  preview.src = imageUrl;
  previewContainer.classList.remove("hidden");
});
