"use strict";

// 1. Whenever user clicks at the upload image btn, display the

const fileInput = document.getElementsByClassName(
  "settings__fileInput--avatar"
)[0];

const confirmationWindow = document.getElementsByClassName("changeAvatar")[0];
const hideMenu = document.getElementsByClassName("changeAvatar__hideBtn")[0];

const preview = document.getElementsByClassName("element--second")[0];

const submit = document.getElementsByClassName("changeAvatar__submit")[0];

fileInput.onchange = async function (event) {
  const fileReader = new FileReader();
  fileReader.readAsDataURL(fileInput.files[0]);
  fileReader.addEventListener("load", function () {
    const previewImage = `
        <h1 class="element__header">New Avatar: </h1>
        <img src="${this.result}" class="element__image" />
    `;
    preview.innerHTML = previewImage;

    confirmationWindow.classList.toggle("hidden");
  });

  hideMenu.addEventListener("click", (e) => {
    confirmationWindow.classList.toggle("hidden");
  });

  submit.addEventListener("click", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("avatarImage", fileInput.files[0]);

    const requestOptions = {
      method: "PATCH",
      body: formData,
      redirect: "follow",
      credentials: "same-origin",
    };

    const groupID = document
      .getElementsByClassName(`bodyGroupPage`)[0]
      .getAttribute("data-group-id");
    const response = await fetch(
      `/api/v1/groups/updateAvatarImage/${groupID}`,
      requestOptions
    );

    const result = await response.json();

    if (result.status === "success") location.reload();
    else
      window.alert(
        "Something went wrong with uploading the image, reload the page and try later"
      );
  });
};
