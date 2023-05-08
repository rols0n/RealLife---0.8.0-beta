"use strict";
// DOMs

import _basicHelpers from "../../../..//utils/post/helpers/_basicHelpers.js";

class rulesCreator {
  constructor() {
    this.rulesContainer = document.querySelectorAll(`.section__main`)[0];

    this._basicHelpers = new _basicHelpers();
    this.genElem = this._basicHelpers.genElem;
  }

  manageCardBtns = (ruleNum, card) => {
    const submitBtn = document.querySelectorAll(
      `.confirmation__submit[data-rule-id="${ruleNum}"]`
    )[0];
    const cancelBtn = document.querySelectorAll(
      `.confirmation__cancel[data-rule-id="${ruleNum}"]`
    )[0];

    const allBtns = Array.from(
      document.querySelectorAll(`.buttons__btn[data-rule-id="${ruleNum}"]`)
    );
    allBtns.forEach((btn) => {
      console.log(btn.classList[1]);
      if (btn.classList[1] === "buttons__btn--edit") {
        btn.addEventListener("click", (event) => {
          console.log("cliked");
          this.changeActiveStatus(ruleNum, "add");
        });
      }
    });

    submitBtn.removeEventListener("click", () => {}, true);
    submitBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const input = document.querySelectorAll(
        `.mainContent__inputHeading[data-rule-id="${ruleNum}"]`
      )[0];
      const heading = document.querySelectorAll(
        `.mainContent__heading[data-rule-id="${ruleNum}"]`
      )[0];
      const textarea = document.querySelectorAll(
        `.description__inputDsc[data-rule-id="${ruleNum}"]`
      )[0];
      const description = document.querySelectorAll(
        `.description__p[data-rule-id="${ruleNum}"]`
      )[0];

      if (
        input.value.replace(" ", "").length < 5 ||
        textarea.value.replace(" ", "").length < 10
      ) {
        window.alert("Either Heading or Description are too short.");
        return;
      }
      heading.textContent = input.value;
      description.textContent = textarea.value;

      this.changeActiveStatus(ruleNum, "remove");
      // fixRuleNum();
    });

    cancelBtn.removeEventListener("click", () => {}, true);
    cancelBtn.addEventListener("click", (event) => {
      const allCards = document.querySelectorAll(`.main__ruleCard`);
      if (allCards.length > 1) {
        const input = document.querySelectorAll(
          `.mainContent__inputHeading[data-rule-id="${ruleNum}"]`
        )[0];
        const heading = document.querySelectorAll(
          `.mainContent__heading[data-rule-id="${ruleNum}"]`
        )[0];
        const textarea = document.querySelectorAll(
          `.description__inputDsc[data-rule-id="${ruleNum}"]`
        )[0];
        const description = document.querySelectorAll(
          `.description__p[data-rule-id="${ruleNum}"]`
        )[0];
        if (
          heading.textContent !== "Your rule's heading." &&
          heading.textContent.length > 5 &&
          description.textContent !== "Your rule's description." &&
          description.textContent.length > 8
        ) {
          this.changeActiveStatus(ruleNum, "remove");
        } else card.remove();
      } else {
        // window.alert("You cant remove the last existing template card.");
      }
    });

    const deleteBtn = document.querySelectorAll(
      `.ruleCard__delete[data-rule-id="${ruleNum}"]`
    )[0];
    deleteBtn.addEventListener("click", () => {
      card.remove();
    });
  };

  fixRuleNum = () => {
    const allCards = Array.from(document.querySelectorAll(`.main__ruleCard`));

    for (let i = 1; i <= allCards.length; i++) {
      if (!allCards[i - 1]) return;

      const cardIndex = allCards[i - 1].getAttribute("data-rule-id");
      const elements = Array.from(
        document.querySelectorAll(`[data-rule-id="${cardIndex}"]`)
      );
      elements.forEach((elemnt) => {
        elemnt.setAttribute("data-rule-id", i);
      });

      const allCardsFresh = Array.from(
        document.querySelectorAll(`.main__ruleCard`)
      );
      const ruleNum = allCardsFresh[i - 1].getAttribute("data-rule-id");
      this.manageCardBtns(ruleNum, allCardsFresh[i - 1], this.fixRuleNum);
    }
  };

  changeActiveStatus = (cardNumber, behaviour) => {
    const card = Array.from(
      document.querySelectorAll(`.main__ruleCard[data-rule-id="${cardNumber}"]`)
    )[0];
    const input = document.querySelectorAll(
      `.mainContent__inputHeading[data-rule-id="${cardNumber}"]`
    )[0];
    const heading = document.querySelectorAll(
      `.mainContent__heading[data-rule-id="${cardNumber}"]`
    )[0];
    const textarea = document.querySelectorAll(
      `.description__inputDsc[data-rule-id="${cardNumber}"]`
    )[0];
    const description = document.querySelectorAll(
      `.description__p[data-rule-id="${cardNumber}"]`
    )[0];

    const penBtn = document.querySelectorAll(
      `.buttons__btn[data-rule-id="${cardNumber}"]`
    )[0];
    const confirmBtns = document.querySelectorAll(
      `.ruleCard__confirmation[data-rule-id="${cardNumber}"]`
    )[0];

    heading.classList.toggle("hidden");
    input.classList.toggle("hidden");
    description.classList.toggle("hidden");
    textarea.classList.toggle("hidden");
    confirmBtns.classList.toggle("hidden");
    card.classList.remove("main__ruleCard--active");

    if (behaviour === "add") {
      penBtn.classList.remove("buttons__btn--edit");
      penBtn.classList.add("buttons__btn--edit-active");
      card.setAttribute("data-card-status", "active");

      card.classList.add("main__ruleCard--active");
    } else {
      penBtn.classList.add("buttons__btn--edit");
      penBtn.classList.remove("buttons__btn--edit-active");
      card.setAttribute("data-card-status", "not-active");
    }
  };

  generateCard = (heading, description, status) => {
    // const ruleNum = document.querySelectorAll(`.main__ruleCard`).length + 1;
    const ruleNum = Math.floor(Math.random() * 50000);
    const attrs = [["data-rule-id", ruleNum]];

    const ruleCard = this.genElem("div", ["main__ruleCard"], attrs);
    ruleCard.setAttribute("data-card-status", "not-active");
    this.rulesContainer.appendChild(ruleCard);
    const mainContent = this.genElem("div", ["ruleCard__mainContent"], attrs);
    ruleCard.appendChild(mainContent);

    // mC = mainContent
    const mC__number = this.genElem("h3", ["mainContent__number"], attrs);
    // mC__number.textContent = ruleNum;
    mainContent.appendChild(mC__number);
    const mC__heading = this.genElem("h3", ["mainContent__heading"], attrs);
    mC__heading.textContent = heading;
    mainContent.appendChild(mC__heading);

    //
    const mC__inputHeading = this.genElem(
      "input",
      ["mainContent__inputHeading", "hidden"],
      [...attrs, ["autofocus"], ["type", "text"], ["placeholder", heading]]
    );
    mainContent.appendChild(mC__inputHeading);

    //
    const ruleCard__buttons = this.genElem("div", ["ruleCard__buttons"], attrs);
    mainContent.appendChild(ruleCard__buttons);
    const btnEdit = this.genElem(
      "button",
      ["buttons__btn", "buttons__btn--edit"],
      attrs
    );
    ruleCard__buttons.appendChild(btnEdit);
    const editIcon = this.genElem(
      "img",
      [],
      [...attrs, ["src", "/imgs/icons/pencil-simple.png"]]
    );
    btnEdit.appendChild(editIcon);

    const arrowBtns = this.genElem("div", ["buttons__hierarchy"], attrs);
    ruleCard__buttons.appendChild(arrowBtns);
    arrowBtns.style = "opacity: 0;";

    const arrowUp = this.genElem(
      "button",
      ["hierarchy__btn", "hierarchy__btn--up"],
      [["disabled"]]
    );
    arrowBtns.appendChild(arrowUp);
    const upIcon = this.genElem(
      "img",
      [],
      [...attrs, ["src", "/imgs/icons/arrow-up.png"]]
    );
    arrowUp.appendChild(upIcon);

    const arrowdown = this.genElem(
      "button",
      ["hierarchy__btn", "hierarchy__btn--down"],
      [["disabled"]]
    );
    arrowBtns.appendChild(arrowdown);
    const downIcon = this.genElem(
      "img",
      [],
      [...attrs, ["src", "/imgs/icons/arrow-down.png"]]
    );
    arrowdown.appendChild(downIcon);

    const deleteBtn = this.genElem("button", ["ruleCard__delete"], attrs);
    ruleCard__buttons.appendChild(deleteBtn);
    const xIcon = this.genElem(
      "img",
      ["ruleCard__deleteIcon"],
      [...attrs, ["src", "/imgs/icons/x.png"]]
    );
    deleteBtn.appendChild(xIcon);
    //

    const ruleCard__dsc = this.genElem("div", ["ruleCard__description"], attrs);
    ruleCard.appendChild(ruleCard__dsc);
    const dscText = this.genElem("p", ["description__p"], attrs);
    dscText.textContent = description;
    ruleCard__dsc.appendChild(dscText);

    const dsc__input = this.genElem(
      "textarea",
      ["description__inputDsc", "hidden"],
      [...attrs, ["autofocus"], ["type", "text"], ["placeholder", description]]
    );
    ruleCard__dsc.appendChild(dsc__input);

    // Confirmation buttons:
    const confirmationBtns = this.genElem(
      "div",
      ["ruleCard__confirmation", "hidden"],
      attrs
    );
    ruleCard.appendChild(confirmationBtns);
    const cancel = this.genElem("button", ["confirmation__cancel"], attrs);
    confirmationBtns.appendChild(cancel);
    cancel.textContent = "Cancel";
    const submit = this.genElem("button", ["confirmation__submit"], attrs);
    submit.textContent = "Submit";
    confirmationBtns.appendChild(submit);

    if (status === "active") {
      this.changeActiveStatus(ruleNum, "add");
    }

    this.manageCardBtns(ruleNum, ruleCard);
  };

  submitRulesSet = (groupID) => {
    const submitBtn = document.querySelectorAll(`.submit__btn`)[0];
    submitBtn.addEventListener("click", async (event) => {
      const allCards = Array.from(
        document.querySelectorAll(`.main__ruleCard `)
      );

      const rules = [];

      let count = 1;
      for (let index = 0; index < allCards.length; index++) {
        const ruleID = allCards[index].getAttribute("data-rule-id");
        const header = document.querySelectorAll(
          `.mainContent__heading[data-rule-id="${ruleID}"]`
        )[0];
        const description = document.querySelectorAll(
          `.description__p[data-rule-id="${ruleID}"]`
        )[0];
        if (
          header.textContent !== "Your rule's heading." &&
          header.textContent.length > 5 &&
          description.textContent !== "Your rule's description." &&
          description.textContent.length > 10
        ) {
          rules.push({
            number: count,
            heading: header.textContent,
            description: description.textContent,
          });

          count++;
        }
      }

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: JSON.stringify({ rules }),
        redirect: "follow",
        credentials: "same-origin",
      };

      if (rules.length > 0) {
        await fetch(`/api/v1/groups/${groupID}`, requestOptions);

        location.replace(`/group/${groupID}/about`);
      }
    });
  };

  script = async () => {
    const groupID = document
      .getElementsByTagName("body")[0]
      .getAttribute("data-group-id");
    const LINK = `/api/v1/groups/${groupID}`;
    const requestOptions = {
      method: "GET",
      redirect: "follow",
      credentials: "same-origin",
    };

    const result = await (await fetch(LINK, requestOptions)).json();
    if (result.status !== "success") return;
    const groupSchema = result.data.data;
    if (groupSchema.rules.length > 0) {
      Array.from(groupSchema.rules).forEach((rule) => {
        this.generateCard(rule.heading, rule.description);
      });
    } else {
      this.generateCard(
        "Your rule's heading.",
        "Your rule's description.",
        "active"
      );
    }

    const generateTemplateBtn =
      document.querySelectorAll(`.main__newTemplate `)[0];

    generateTemplateBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const allActiveCards = Array.from(
        document.querySelectorAll(`.main__ruleCard[data-card-status="active"]`)
      );

      allActiveCards.forEach((card) => {
        const cardNumber = card.getAttribute("data-rule-id");
        const input = document.querySelectorAll(
          `.mainContent__inputHeading[data-rule-id="${cardNumber}"]`
        )[0];
        const textarea = document.querySelectorAll(
          `.description__inputDsc[data-rule-id="${cardNumber}"]`
        )[0];

        if (
          input.value.replace(" ", "").length === 0 &&
          textarea.value.replace(" ", "").length === 0
        ) {
          card.remove();
        }
      });

      this.generateCard(
        "Your rule's heading.",
        "Your rule's description.",
        "active"
      );
    });

    this.submitRulesSet(groupID);
  };
}

new rulesCreator().script();
// 556 - bugged as hell, and unreadable
