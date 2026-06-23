// DOM elements
"use strict";
// BTNS
const joinGroupBTN = document.getElementsByClassName("btnNAME_joinGroup")[0];
const leaveGroupBTN = document.getElementsByClassName("btnNAME_leaveGroup")[0];
const cancelRequestBTN = document.getElementsByClassName(
  "btnNAME_cancelRequest"
)[0];
const acceptRequestBTN = document.getElementsByClassName(
  "btnNAME_acceptRequest"
)[0];
const rejectRequestBTN = document.getElementsByClassName(
  "btnNAME_rejectRequest"
)[0];

const LINK_1 = `http://127.0.0.1:3000/api/v1/users/groups`;
const LINK_2 = `http://127.0.0.1:3000/api/v1/groups`;

const simpleRequst = async function (BTN, LINK, reqName, method) {
  BTN.addEventListener("click", async (event) => {
    event.preventDefault();
    const clLength = BTN.classList.length;
    const groupID = BTN.classList[clLength - 1].split("btnID_")[1];

    const requestOptions = {
      method: method,
      redirect: "follow",
    };

    const URL = `${LINK}/${reqName}/${groupID}`;

    const response = await fetch(URL, requestOptions);
    const result = await response.json();
    if (result.status === "success") {
      location.reload();
    }

    if (result.status === "fail") {
      window.alert(result.error);
    }
  });
};

if (joinGroupBTN !== undefined) {
  simpleRequst(joinGroupBTN, LINK_1, "sendRequest", "POST");
}

if (cancelRequestBTN !== undefined) {
  simpleRequst(cancelRequestBTN, LINK_1, "cancelRequest", "PATCH");
}

if (acceptRequestBTN !== undefined && rejectRequestBTN !== undefined) {
  simpleRequst(acceptRequestBTN, LINK_1, "acceptRequest", "PATCH");
  simpleRequst(rejectRequestBTN, LINK_1, "rejectRequest", "PATCH");
}

if (leaveGroupBTN !== undefined) {
  simpleRequst(leaveGroupBTN, LINK_2, "leaveGroup", "PATCH");
}
