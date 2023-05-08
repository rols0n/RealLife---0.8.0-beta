import sendNotification from "./../../../../../../js/utils/notifications/sendNotification.js";
import Helpers from "./helpers.js";
const { genElem, manageButtons } = new Helpers();

class inviteBtnsController {
  constructor(socket, requestOptions) {
    this.requestOptions2 = requestOptions;
    this.socket = socket;
  }
  convertInvBtnToCancel = (userID) => {
    // --
    // Changing card's button behaviour from invite button to cancel button
    const inviteBtn = document.querySelectorAll(
      `.rightSide__btn[data-btn-type="invite"][data-user-id="${userID}"]`
    )[0];
    inviteBtn.textContent = "Cancel";
    inviteBtn.setAttribute("data-btn-type", "cancel");
    const reqCount = document.querySelectorAll(`.requestsCount__count`)[0];
    if (reqCount.textContent * 1 > 0) reqCount.textContent++;
    else reqCount.textContent = "1";

    inviteBtn.addEventListener("click", (event) => {
      event.preventDefault();

      manageButtons(
        inviteBtn,
        `/api/v1/groups/request/cancelInvitation`,
        "groupRequestCanceled",
        this.socket
      );

      //   location.reload();
    });
  };

  manageInviteBtn = async function (btn, groupID) {
    const userID = btn.getAttribute("data-user-id");
    const card = document.querySelectorAll(
      `.rightSide__card[data-user-id="${userID}"]`
    )[0];

    const allCardElements = Array.from(
      document.querySelectorAll(`[data-user-id="${userID}"]`)
    );
    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      // Sending request
      const LINK_INVITE = `/api/v1/groups/request/sendInvitation/${groupID}`;
      const raw = JSON.stringify({ user: userID });

      this.requestOptions2.body = raw;
      const result = await (
        await fetch(LINK_INVITE, this.requestOptions2)
      ).json();
      if (result.status !== "success") console.log(result);

      // Changing data-section-type attribute from "invite" to "sent" on all card's elements
      allCardElements.forEach((el) => {
        const section = el.getAttribute("data-section-type");
        if (section === "invite") el.setAttribute("data-section-type", "sent");
      });

      // --
      // Generating card under "sent" section cards
      let cards = document.querySelectorAll(
        `.rightSide__cards[data-section-type="sent"]`
      )[0];

      if (!cards) {
        const attr = [["data-section-type", "sent"]];
        const sentSection = genElem("div", ["rightSide__section"], attr);
        rightSideContent.appendChild(sentSection);
        const headingContainer = genElem("div", ["section__heading"], attr);
        sentSection.appendChild(headingContainer);
        const header = genElem("h3", ["rightSide__header"], attr);
        headingContainer.appendChild(header);
        header.textContent = "People who received invites";
        cards = genElem("div", ["rightSide__cards"], attr);
        sentSection.appendChild(cards);
      }
      const cardsPerRow = Math.floor(cards.offsetWidth / 185) - 1;
      cards.style = `grid-template-columns: repeat(${cardsPerRow}, 185px); margin-left: 0; padding-left: 0; justify-content: center`;
      card.remove();
      cards.appendChild(card);

      // Sending notification
      const notificationSender = new sendNotification();

      notificationSender.sendPostNoti(
        null,
        userID,
        "groupRequestSent",
        this.socket,
        null,
        groupID
      );

      // --
      // Changing card's button behaviour from invite button to cancel button
      const inviteBtn = document.querySelectorAll(
        `.rightSide__btn[data-btn-type="invite"][data-user-id="${userID}"]`
      )[0];
      inviteBtn.textContent = "Cancel";
      inviteBtn.setAttribute("data-btn-type", "cancel");
      const reqCount = document.querySelectorAll(`.requestsCount__count`)[0];
      if (reqCount.textContent * 1 > 0) reqCount.textContent++;
      else reqCount.textContent = "1";

      inviteBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        await manageButtons(
          inviteBtn,
          `/api/v1/groups/request/cancelInvitation`,
          "groupRequestCanceled",
          this.socket
        );

        location.reload();
      });
    });
  };

  manageInviteBtns = async (groupID) => {
    const allInviteBtns = Array.from(
      document.querySelectorAll(`.rightSide__btn[data-btn-type="invite"]`)
    );

    allInviteBtns.forEach((btn) => {
      this.manageInviteBtn(btn, groupID);
    });
  };
}

export default inviteBtnsController;
