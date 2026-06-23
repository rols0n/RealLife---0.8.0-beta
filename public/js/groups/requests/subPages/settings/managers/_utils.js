// exports.request = async (ENDPOINT) => {
//   const myHeaders = new Headers();
//   myHeaders.append("Content-Type", "application/json");

//   const raw = JSON.stringify({
//     user: id,
//   });

//   const requestOptions = {
//     method: "DELETE",
//     headers: myHeaders,
//     body: raw,
//     redirect: "follow",
//     credetnials: "same-origin",
//   };

//   const groupID = document
//     .getElementsByClassName("group")[0]
//     .classList[1].split("_")[1];

//   const response = await fetch(
//     `http://127.0.0.1:3000/api/v1/groups/${groupID}/${ENDPOINT}`,
//     requestOptions
//   );

//   const result = await response.json();

//   if (result.status === "success") {
//     window.alert("Done");
//     location.replace(
//       `http://127.0.0.1:3000/group/${groupID}/settings/manage_administration`
//     );
//   } else {
//     window.alert("Something went wrong. Sorry.");
//     location.replace(
//       `http://127.0.0.1:3000/group/${groupID}/settings/manage_administration`
//     );
//   }
// };

export async function btnListener(userRank) {
  const userID = btn.classList[2].split("_")[1];
  // 2) Copy whole card
  let classes = ``;
  let moveToRightSide = true;
  // 3) Check if it's currently on left side, if so then copy the userID to the array
  if (btn.classList[1] === "right") {
    classes = `left userID_${userID} ${userRank}Num_${membCards.length + 1}`;
    if (num > 0) num--;

    let place = -1;
    Array.prototype.forEach.call(IDs, (id) => {
      place++;
      if (`${id}` === `${userID}`) {
        IDs.splice(place, 1);
      }
    });
    moveToRightSide = false;
  }

  if (btn.classList[1] === "left") {
    num++;
    classes = `right userID_${userID} ${userRank}Num_${num}`;

    // 1) Checking if the IDs doesnt already contain userID
    let canPush = true;
    Array.prototype.forEach.call(IDs, (id) => {
      if (`${id}` === `${userID}`) {
        canPush = false;
      }
    });
    if (canPush === true) IDs.push(userID);
  }

  const name = document.getElementsByClassName(
    `details__name ${btn.classList[2]}`
  )[0].textContent;
  const data = `<div class="main__memberCard ${classes}"><img class="memberCard__btn ${classes}" src="/imgs/icons/x-circle-red.png" alt=""><a class="memberCard__details-container ${classes}" target="_tab"  href="/userPage/${userID}"><div class="memberCard__details ${classes}"><img class="details__avatar" src="/imgs/users/${userID}/profilePicture/profile-picture-${userID}.jpeg"><h3 class="details__name ${classes}">${name}</h3></div></a></div>`;

  // 4) Hide card
  document
    .getElementsByClassName(`main__memberCard userID_${userID}`)[0]
    .remove();

  // 5) Display card on opposite side

  if (moveToRightSide === true)
    membCardsRight.insertAdjacentHTML("beforeend", data);
  else membCardsLeft.insertAdjacentHTML("beforeend", data);

  // 1) Generate another addEventListener for created element and repeat the process on it
  attachClickListener();
}
