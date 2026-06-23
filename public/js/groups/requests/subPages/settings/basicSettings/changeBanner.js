"use strict";

// DOMs
const menu = document.getElementsByClassName("changeBanner")[0];
const fileInput__banner = document.getElementsByClassName(
  "settings_fileInput--banner"
)[0];
const bannerPreview = document.getElementsByClassName(
  "banner__element--second"
)[0];
const closeMenu = document.getElementsByClassName("changeBanner__hideBtn")[0];
const submit__banner = document.getElementsByClassName(
  "changeBanner__submit"
)[0];

fileInput__banner.onchange = async function (event) {
  const fileReader = new FileReader();
  fileReader.readAsDataURL(fileInput__banner.files[0]);
  fileReader.addEventListener("load", function () {
    const previewImage = `
          <h1 class="element__header">New Banner: </h1>
          <img src="${this.result}" class="element__banner" />
      `;
    bannerPreview.innerHTML = previewImage;

    menu.classList.toggle("hidden");
  });

  closeMenu.addEventListener("click", (e) => {
    menu.classList.toggle("hidden");
  });

  submit__banner.addEventListener("click", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("bannerImage", fileInput__banner.files[0]);

    const requestOptions = {
      method: "PATCH",
      body: formData,
      redirect: "follow",
      credentials: "same-origin",
    };

    const groupID = document
      .getElementsByClassName(`bodyGroupPage`)[0]
      .getAttribute("data-group-id");
    console.log(groupID);

    const response = await fetch(
      `/api/v1/groups/updateBannerImage/${groupID}`,
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
