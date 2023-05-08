"use strict";

// DOMS

const submit = document.getElementsByClassName("btns__btn--submit")[0];
const cancel = document.getElementsByClassName("btns__btn--cancel")[0];

const privacy = document.getElementsByClassName("selector--privacy")[0];
const visibility = document.getElementsByClassName("selector--visibility")[0];
const requests = document.getElementsByClassName("selector--requests")[0];

const groupID = document
  .getElementsByClassName("mainContent__settings")[0]
  .classList[1].split("_")[1];

submit.addEventListener("click", async (event) => {
  event.preventDefault();

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    settings: {
      privacy: privacy.value,
      visibility: visibility.value,
      requests: requests.value,
    },
  });

  const requestOptions = {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
    credentials: "same-origin",
  };

  const response = await fetch(
    `http://127.0.0.1:3000/api/v1/groups/${groupID}`,
    requestOptions
  );

  const result = await response.json();
  console.log(result);
  if (result.status === "success") {
    window.alert("Done");

    location.replace(`http://127.0.0.1:3000/group/${groupID}/settings`);
  } else {
    window.alert("Some problem occured, sorry for problems try again later.");
    location.replace(`http://127.0.0.1:3000/group/${groupID}/settings`);
  }
});
