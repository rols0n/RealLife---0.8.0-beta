"use strict";

// ##################################
// This file is a posts controller and it's functionalities are:
// - Showing the comments section
// - creating comments
// ##################################

// ####
// DOM ELEMENTS
const allPosts = Array.from(document.getElementsByClassName("postCard"));

// ###
// code

class postController {
  constructor(allPosts) {
    this.allPosts = allPosts;
    this.allReplyBtns = Array.from(
      document.getElementsByClassName("interactions__reply")
    );

    this.myHeaders = new Headers();
    this.myHeaders.append("Content-Type", "application/json");
  }

  cursorFix = (text, btn) => {
    if (text.value === "") {
      btn.style = "cursor: not-allowed";
      return true;
    }
  };

  showFrom = (postID) => {
    const replyBtns = Array.from(
      document.querySelectorAll(`.interactions__reply[data-postid="${postID}"]`)
    );

    replyBtns.forEach((replyBtn) => {
      replyBtn.addEventListener("click", async (event) => {
        const level = replyBtn.getAttribute("data-level");

        const commentID = replyBtn.getAttribute("data-comment-id");
        const userID = replyBtn.getAttribute("data-author-id");
        let levelBelow;
        if (level === "root") {
          levelBelow = "reply";
        }
        if (level === "reply") {
          levelBelow = "subReply";
        }
        this.level = levelBelow;
        const attributes = `[data-postid="${postID}"][data-replies-to-comment="${commentID}"]`;
        const userName = document.querySelectorAll(
          `.${level}__name[data-level="${level}"][data-postid="${postID}"][data-author-id="${userID}"][data-comment-id="${commentID}"]`
        )[0];
        const form = document.querySelectorAll(
          `.comments__form--${levelBelow}${attributes}`
        )[0];
        const formTag = document.querySelectorAll(`.form__tag${attributes}`)[0];
        const tagText = document.querySelectorAll(`.tag__text${attributes}`)[0];

        // console.log(`\n===============`);
        // console.log(form, formTag, tagText, userName.textContent);
        tagText.textContent = `@${userName.textContent}`;
        tagText.href = `/userPage/${userID}`;
        form.classList.toggle("hidden");
        formTag.classList.toggle("hidden");

        await this.uploadComment(postID);
      });
    });
  };

  uploadComment = async (postID, link, raw, level) => {
    const attributes = `[data-postid="${postID}"][data-level="${this.level}"]`;
    this.text = document.querySelectorAll(`.form__textarea${attributes}`)[0];

    const forms = Array.from(document.querySelectorAll(`.comments__form`));

    forms.forEach((form) => {
      const formPOSTID = form.getAttribute("data-postid");
      const formLEVEL = form.getAttribute("data-level");
      if (formLEVEL !== this.level || formPOSTID !== postID) {
        return false;
      }

      this.repliesTo = form.getAttribute("data-replies-to-user");
      this.treeID = form.getAttribute("data-tree-id");

      let levelBelow;
      if (level) this.level = level;
      if (this.level === "root") {
        levelBelow = "reply";
      }
      if (this.level === "reply") {
        levelBelow = "subReply";
      }
      const submitBtn = false;
      if (submitBtn)
        submitBtn.addEventListener("mouseover", (event) => {
          this.cursorFix(this.text, submitBtn[0]);
        });

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.table(formPOSTID, postID);
        console.table(formLEVEL, this.level);
        console.log(form);
        return;
        if (submitBtn)
          if (this.cursorFix(this.text, submitBtn[0]) === true) {
            return;
          }
        if (this.level === "root") {
          link = "http://127.0.0.1:3000/api/v1/comments";
          raw = JSON.stringify({
            post: [postID],
            tree: {
              text: this.text.value,
            },
          });
        } else {
          raw = JSON.stringify({
            repliesTo: this.repliesTo,
            text: this.text.value,
          });
        }

        window.alert(this.treeID);

        if (this.level === "reply") {
          link = `http://127.0.0.1:3000/api/v1/comments/updateLevelTwoRespond/${this.treeID}`;
        }

        if (this.level === "subReply") {
          link = `http://127.0.0.1:3000/api/v1/comments/updateLevelThreeRespond/${this.treeID}`;
        }

        console.log("\n\n");
        console.log(this.treeID);
        this.requestOptions = {
          method: "POST",
          headers: this.myHeaders,
          body: raw,
          redirect: "follow",
          credentials: "same-origin",
        };

        const response = await fetch(link, this.requestOptions);
        console.log(raw);
        this.result = await response.json();
        if (this.result.status !== "success")
          window.alert("Something went wrong");

        // ======================================
        // Whenever new root comment is created, it needs the 2nd API call to sign it to the post
        if (this.level === "root") {
          const raw2 = JSON.stringify({
            commentID: this.result.data.data._id,
          });

          this.requestOptions.body = raw2;

          // console.log(dataPost);
          const responsePost = await fetch(
            `http://127.0.0.1:3000/api/v1/posts/uploadCommentID/${postID}`,
            this.requestOptions
          );

          this.result2 = await responsePost.json();
          if (this.result2.status !== "success")
            return window.alert("Something went wrong");
        }
        location.reload();
        this.script();
      });
    });
  };

  script = () => {
    this.allPosts.forEach(async (post) => {
      const postID = post.getAttribute("data-postid");
      this.level = "root";
      const attributes = `[data-postid="${postID}"]`;
      const commentsDisplayer = document.querySelectorAll(
        `.interactions__comments${attributes}`
      )[0];
      const commentsSection = document.querySelectorAll(
        `.postCard__comments${attributes}`
      )[0];

      commentsDisplayer.addEventListener("click", (event) => {
        event.preventDefault();
        commentsSection.classList.toggle("hidden");
      });

      // ##################
      // Comment's upload functionality

      this.showFrom(postID);
      await this.uploadComment(postID);
    });
  };
}

new postController(allPosts).script();

// ("use strict");

// // DOM ELEMENTS
// const allPosts = Array.from(document.getElementsByClassName("postCard"));
// const commentForm = document.getElementsByClassName("commentForm--main");
// const inputForm = document.getElementsByClassName(
//   "commentForm--main__top__leftSide__input"
// );
// const inputFile = document.getElementsByClassName(
//   "commentForm--main__bottom__moviesImagesLabel__input"
// );

// const commentSectionBtn = document.getElementsByClassName(
//   "postCard__interactions__button"
// );

// setTimeout(() => {
//   allPosts.forEach((post) => {
//     if (post.classList[1]) {
//       // 1.) Getting the postId
//       const postId = post.classList[1].split("postCard--")[1];

//       const commentTrees = document.getElementsByClassName(
//         `commentTree--${postId}`
//       );

//       // 1.3) Getting the Button that displays the comments section (after click)
//       const showCommentSectionBtn = document.getElementsByClassName(
//         `postCard__interactions__button--${postId}`
//       );
//       // 1.4) Getting the Form that creates rootComment
//       const mainCommentForm = document.getElementsByClassName(
//         `commentForm--${postId}`
//       );

//       // 2) Making the comment section visible/hidden after the click
//       Array.prototype.forEach.call(showCommentSectionBtn, (button) => {
//         button.addEventListener("click", (event) => {
//           // console.log("I cant open it");
//           mainCommentForm[0].classList.toggle("hidden");
//           Array.prototype.forEach.call(commentTrees, (commentTree) => {
//             if (!commentTree.classList[3]) {
//               commentTree.classList.add("hidden");
//               mainCommentForm[0].classList.add("hidden");
//             } else {
//               commentTree.classList.remove("hidden");
//               mainCommentForm[0].classList.remove("hidden");
//             }
//           });
//         });
//       });
//       //#############################################
//       // Controlling MAIN COMMENT FORM OF THE POST
//       //##########################################
//       // let one = 1;

//       //#############################################
//       // Controlling:
//       // - COMMENT TREES
//       //  - FORMS
//       //##########################################

//       Array.prototype.forEach.call(commentTrees, async (commentTree) => {
//         const commentTreeId =
//           commentTree.classList[2].split("commentTreeId--")[1];
//         // console.log(commentTreeId);
//         // 3.1) call the API with the commentTreeId
//         const requestOptions = {
//           method: "GET",
//           redirect: "follow",
//         };

//         const response = await fetch(
//           `http://127.0.0.1:3000/api/v1/comments/${commentTreeId}`,
//           requestOptions
//         );

//         const result = await response.json();

//         // needed elements of comment:
//         // 1) react button
//         const reactBtn = document.getElementsByClassName(
//           `commentTree__commentCard__container__interactions__react--idPath_${commentTreeId}-${result.data.data.commentTree._id}`
//         );

//         // 2) responds button
//         const respondsBtn = document.getElementsByClassName(
//           `commentTree__commentCard__container__interactions__respond--idPath_${commentTreeId}-${result.data.data.commentTree._id}`
//         );

//         // 3) respond button
//         const respondBtn = document.getElementsByClassName(
//           `span--idPath_${commentTreeId}-${result.data.data.commentTree._id}`
//         );

//         // 4) Container of the root comment's responds
//         const respondsOfRootComment = document.getElementsByClassName(
//           `commentTree__root__respondsContainer--idPath_${commentTreeId}-${result.data.data.commentTree._id}--container`
//         );

//         reactBtn[0].addEventListener("click", (event) => {
//           console.log("React BTN");
//         });

//         respondsBtn[0].addEventListener("click", (event) => {
//           // 1) Making responds visible after clicking on "respondsBtn"
//           if (respondsOfRootComment[0].classList[2] === "hidden") {
//             respondsOfRootComment[0].classList.remove("hidden");

//             // 2) Making responds hidden after clicking on "respondsBtn", if they are currently visible
//           } else {
//             respondsOfRootComment[0].classList.add("hidden");
//           }
//         });

//         respondBtn[0].addEventListener("click", (event) => {
//           // console.log("Respond BTN", respondBtn[0]);
//           const commentFormLevelTwo = document.getElementsByClassName(
//             `commentForm--levelTwo---${commentTreeId}`
//           );
//           const submiBtn = document.getElementsByClassName(
//             `commentForm--levelTwo__inputField__submit--label---${commentTreeId}`
//           );
//           const textarea = document.getElementsByClassName(
//             `commentForm--levelTwo__inputField__text--${commentTreeId}`
//           );

//           commentFormLevelTwo[0].classList.toggle("hidden");
//           submiBtn[0].addEventListener("click", async (event) => {
//             event.preventDefault();

//             if (textarea[0].value) {
//               const myHeaders = new Headers();
//               myHeaders.append("Content-Type", "application/json");

//               const data = JSON.stringify({ commentText: textarea[0].value });
//               textarea[0].value = "";
//               const requestOptions = {
//                 method: "POST",
//                 headers: myHeaders,
//                 body: data,
//                 redirect: "follow",
//                 credentials: "same-origin",
//               };

//               // console.log(text)
//               const response = await fetch(
//                 `http://127.0.0.1:3000/api/v1/comments/updateLevelTwoRespond/${commentTreeId}`,
//                 requestOptions
//               );
//               const result = await response.json();
//               console.log(result);
//               if (result.status === "success") {
//                 window.location.reload();
//               }
//             }
//           });
//           // Display and control comment form
//         });

//         //===========================
//         // Controling root responds

//         Array.prototype.forEach.call(
//           result.data.data.commentTree.responds,
//           (respond) => {
//             // needed elements of comment:
//             // 1) react button
//             const reactBtn2 = document.getElementsByClassName(
//               `commentTree__commentCard__container__interactions__react--idPath_${commentTreeId}-${result.data.data.commentTree._id}--${respond._id}`
//             );

//             // 2) responds button
//             const respondsBtn2 = document.getElementsByClassName(
//               `commentTree__commentCard__container__interactions__respond--idPath_${commentTreeId}-${result.data.data.commentTree._id}--${respond._id}`
//             );

//             // 3) respond button
//             const respondBtn2 = document.getElementsByClassName(
//               `span--idPath_${commentTreeId}-${result.data.data.commentTree._id}--${respond._id}`
//             );

//             // 4) Container of the root comment's responds
//             const respondsOfRespond = document.getElementsByClassName(
//               `commentTree__root__levelTwoRespondsContainer__levelTwoRespond__levelTwoRespondsContainer--idPath_${commentTreeId}-${result.data.data.commentTree._id}--${respond._id}---container`
//             );

//             reactBtn2[0].addEventListener("click", (event) => {
//               console.log("React BTN 2nd");
//             });

//             respondsBtn2[0].addEventListener("click", (event) => {
//               if (respondsOfRespond[0].classList[2] === "hidden") {
//                 respondsOfRespond[0].classList.remove("hidden");
//               } else {
//                 respondsOfRespond[0].classList.add("hidden");
//               }
//             });

//             respondBtn2[0].addEventListener("click", (event) => {
//               // console.log("Respond BTN", respondBtn[0]);

//               const commentFormLevelTwo = document.getElementsByClassName(
//                 `commentForm--levelThree---${commentTreeId}`
//               );
//               const submiBtn = document.getElementsByClassName(
//                 `commentForm--levelThree__inputField__submit--label---${commentTreeId}`
//               );
//               const textarea = document.getElementsByClassName(
//                 `commentForm--levelThree__inputField__text--${commentTreeId}`
//               );

//               console.log(respondBtn2[0].classList[2].split("-")[1]);
//               commentFormLevelTwo[0].classList.toggle("hidden");
//               submiBtn[0].addEventListener("click", async (event) => {
//                 event.preventDefault();

//                 if (textarea[0].value) {
//                   const myHeaders = new Headers();
//                   myHeaders.append("Content-Type", "application/json");

//                   const data = JSON.stringify({
//                     respondsToUser: respondBtn2[0].classList[2].split("-")[1],
//                     commentText: textarea[0].value,
//                   });
//                   textarea[0].value = "";
//                   const requestOptions = {
//                     method: "POST",
//                     headers: myHeaders,
//                     body: data,
//                     redirect: "follow",
//                     credentials: "same-origin",
//                   };

//                   // console.log(text)
//                   const response = await fetch(
//                     `http://127.0.0.1:3000/api/v1/comments/updateLevelThreeRespond/${commentTreeId}`,
//                     requestOptions
//                   );
//                   const result = await response.json();
//                   console.log(result);
//                   if (result.status === "success") {
//                     window.location.reload();
//                   }
//                 }
//               });
//               // Display and control comment form
//             });

//             //===========================
//             // Controling root responds

//             Array.prototype.forEach.call(respond.responds, (respond2) => {
//               // needed elements of comment:
//               // 1) react button
//               const reactBtn3 = document.getElementsByClassName(
//                 `commentTree__commentCard__container__interactions__react--idPath_${commentTreeId}-${result.data.data.commentTree._id}--${respond._id}---${respond2._id}`
//               );

//               // 2) respond button
//               const respondBtn3 = document.getElementsByClassName(
//                 `commentTree__commentCard__container__interactions__respond--idPath_${commentTreeId}-${result.data.data.commentTree._id}--${respond._id}---${respond2._id}`
//               );

//               reactBtn3[0].addEventListener("click", (event) => {
//                 console.log("React BTN");
//               });

//               respondBtn3[0].addEventListener("click", (event) => {
//                 console.log("Respond BTN last");
//                 // Display and control comment form
//                 console.log(respondBtn3.classList);
//               });
//             });
//           }
//         );
//       });
//     } else return;
//   });
// }, 500);

// const allMainCommentForms = document.getElementsByClassName("commentForm");

// Array.prototype.forEach.call(allMainCommentForms, (element) => {
//   if (element.classList[1] === "commentForm--levelTwo") return;
//   const postId = element.classList[2].split("--")[1];
//   const submit = document.getElementsByClassName(`
//   commentForm__inputField__submit--label---${postId}`);
//   // console.log(submit[0]);
//   // console.log(postId);
//   submit[0].addEventListener("click", async (event) => {
//     event.preventDefault();
//     const textarea = document.getElementsByClassName(
//       `commentForm__inputField__text--${postId}`
//     );
//     if (textarea[0].value) console.log("textarea value", textarea[0].value);
//     const dataCommentTree = JSON.stringify({
//       post: [postId],
//       commentTree: {
//         commentText: textarea[0].value,
//       },
//     });

//     textarea[0].value = "";

//     const myHeaders2 = new Headers();
//     myHeaders2.append("Content-Type", "application/json");
//     const requestOptionsCommentTree = {
//       method: "POST",
//       headers: myHeaders2,
//       body: dataCommentTree,
//       redirect: "follow",
//       credentials: "same-origin",
//     };

//     const responseCommentTree = await fetch(
//       "http://127.0.0.1:3000/api/v1/comments",
//       requestOptionsCommentTree
//     );
//     const resultCommentTree = await responseCommentTree.json();
//     // console.log(resultCommentTree);

//     // ======================================
//     // Singing the commentTree to the post
//     const dataPost = JSON.stringify({
//       commentID: resultCommentTree.data.data._id,
//     });

//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");

//     const requestOptionsPost = {
//       method: "POST",
//       headers: myHeaders,
//       body: dataPost,

//       redirect: "follow",
//       credentials: "same-origin",
//     };

//     // console.log(dataPost);
//     const responsePost = await fetch(
//       `http://127.0.0.1:3000/api/v1/posts/uploadCommentID/${postId}`,
//       requestOptionsPost
//     );
//     const resultPost = await responsePost.json();
//     // console.log(resultPost);

//     if (resultPost.status === "success") {
//       window.location.reload();
//     } else {
//       window.alert("something went wrong");
//     }
//   });
// });

// // // 377 lines before, extreamly hard to read
