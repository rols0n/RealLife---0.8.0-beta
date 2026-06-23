// DOM
const toggleReceivedReqs = document.getElementsByClassName(
  "leftSide__toggle--receivedRequests"
);

const toggleSentReqs = document.getElementsByClassName(
  "leftSide__toggle--sentRequests"
);

const allReceivedReqCards = document.getElementsByClassName(
  "leftSide__receivedRequest"
);

const allSentReqCards = document.getElementsByClassName(
  "leftSide__sentRequest"
);

const allAcceptBtns = document.getElementsByClassName("leftSide__accept");
const allRejectBtns = document.getElementsByClassName("leftSide__reject");
const allCancelBtns = document.getElementsByClassName("leftSide__cancel");
const allBtns = [allAcceptBtns, allRejectBtns, allCancelBtns];

// FUNCTIONS

const renderPreview = function (cards) {
  return Array.prototype.forEach.call(cards, (card) => {
    const userId = card.classList[1].split("_")[1];
    const type = card.getAttribute("data-card-type");

    card.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.replace(
        `http://127.0.0.1:3000/friends/${type}/${userId}`
      );
      card.style = "background-color: #e9e9eb";
    });
  });
};

const friendsReq = async function (reqName, id) {
  const requestOptions = {
    method: "PATCH",
    redirect: "follow",
    credentials: "same-origin",
  };

  const response = await fetch(
    `http://127.0.0.1:3000/api/v1/users/${reqName}/${id}`,
    requestOptions
  );

  const result = await response.json();

  if (result.status === "success") {
    window.location.reload();
  } else {
    console.log(result);
  }
};

renderPreview(allReceivedReqCards);
renderPreview(allSentReqCards);

Array.prototype.forEach.call(allBtns, (btns) => {
  Array.prototype.forEach.call(btns, (btn) => {
    btn.addEventListener("click", async (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (btn.classList[0].split("__")[1] === "accept") {
        // Accept friend request
        await friendsReq(
          "acceptFriendsRequest",
          btn.classList[1].split("_")[1]
        );
      }

      if (btn.classList[0].split("__")[1] === "reject") {
        // Reject friend request
        await friendsReq(
          "rejectFriendsRequest",
          btn.classList[1].split("_")[1]
        );
      }

      if (btn.classList[0].split("__")[1] === "cancel") {
        // Cancel friend request
        await friendsReq(
          "cancelFriendsRequest",
          btn.classList[1].split("_")[1]
        );
      }
    });
  });
});

// user page
