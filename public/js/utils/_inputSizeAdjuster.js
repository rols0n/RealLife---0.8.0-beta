// DOMS
"use strict";
const allTextareas = Array.from(
  document.getElementsByClassName("form__textarea")
);

allTextareas.forEach((textarea) => {
  textarea.addEventListener("input", (event) => {
    if (textarea.value.length >= 35) {
      textarea.classList.add("form__textarea--wide");
      const postID = textarea.getAttribute("data-postid");
      const level = textarea.getAttribute("data-level");
      const treeID = textarea.getAttribute("data-tree-id");

      const formContent = document.querySelectorAll(
        `.form__content[data-postid="${postID}"][data-level="${level}"][data-tree-id="${treeID}"]`
      );

      //   console.log(pos)
      console.log("TreeID", formContent);
      console.log(treeID);
    }
  });
});
