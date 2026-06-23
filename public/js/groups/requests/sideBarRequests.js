"use strict";

// DOM
const acceptBtn = document.getElementsByClassName("reqCard__btn--accept")[0];
const rejectBtn = document.getElementsByClassName("reqCard__btn--reject")[0];
const cancelBtn = document.getElementsByClassName("reqCard__btn--cancel")[0];

const request = function (btn, reqName) {
  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    const cl_length = acceptBtn.classList.length;
    const userID = acceptBtn.classList[cl_length - 2].split("_")[1];
    const groupID = acceptBtn.classList[cl_length - 1].split("_")[1];

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      user: userID,
    });

    const requestOptions = {
      method: "PATCH",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      credentials: "same-origin",
    };
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/groups/request/${reqName}/${groupID}`,
      requestOptions
    );

    const result = await response.json();

    if (result.status === "success") location.reload();
    else window.alert(result);
  });
};

if (acceptBtn !== undefined) {
  request(acceptBtn, "acceptGroupRequest");
}

if (rejectBtn !== undefined) {
  request(rejectBtn, "rejectGroupRequest");
}

if (cancelBtn !== undefined) {
  request(cancelBtn, "cancelGroupRequest");
}
