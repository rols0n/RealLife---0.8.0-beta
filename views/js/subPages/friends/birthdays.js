"use strict";

// DOMS
const content = document.querySelectorAll(`.content__birthdays`)[0];
const userID = content.getAttribute("data-user-id");
const input = document.querySelectorAll(
  `.content__userPage__friends__navbar__top__input`
)[0];
const message = document.querySelectorAll(`.message`)[0];

// CODE
const hideElements = () => {
  const months = Array.from(document.querySelectorAll(`.birthdays__month`));
  const days = Array.from(document.querySelectorAll(`.month__day`));
  const cards = Array.from(document.querySelectorAll(`.birthdayCard`));
  months.forEach((month) => {
    month.classList.add("hidden");
  });
  days.forEach((day) => {
    day.classList.add("hidden");
  });
  cards.forEach((card) => {
    card.classList.add("hidden");
  });
};

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
  credentials: "same-origin",
};

const response = await fetch(
  `http://127.0.0.1:3000/api/v1/users/birthdays/${userID}`,
  requestOptions
);
const result = await response.json();

if (result.status !== "success") {
  window.alert("Something went wrong");
  location.replace(`/userPage/${userID}/friends`);
}

Array.from(result.bDates).forEach((month) => {
  if (month.data.length < 1) return;
  const data = Array.from(month.data);
  content.insertAdjacentHTML(
    "beforeend",
    `<div class="birthdays__month animate__animated animate__backInLeft" data-month="${month.name}" ></div>`
  );

  const monthEl = document.querySelectorAll(
    `.birthdays__month[data-month="${month.name}"]`
  )[0];
  monthEl.insertAdjacentHTML(
    "beforeend",
    `<h2 class="month__name">${month.name}</h2>`
  );
  let prevDay = 0;
  data.forEach((element) => {
    if (prevDay < element.day) {
      // Converting element.day to ordinal number String
      let elDayStr = `${element.day}th`;
      if (element.day === 31 || element.day === 21 || element.day === 1)
        elDayStr = `${element.day}st`;
      if (element.day === 22 || element.day === 2)
        elDayStr = `${element.day}nd`;

      // Creating month__day div
      monthEl.insertAdjacentHTML(
        "beforeend",
        `<div class="month__day" data-month="${month.name}" data-day-count="${element.day}">
            <h3 class="day__text ">${elDayStr}</h3>
        </div>`
      );
    }
    const monthDay = document.querySelectorAll(
      `.month__day[data-day-count="${element.day}"]`
    )[0];
    monthDay.insertAdjacentHTML(
      "beforeend",
      `<div class="birthdayCard " data-user-id="${element.user._id}" data-month="${month.name}" data-day-count="${element.day}">
        <img class="birthdayCard__img" src="${element.user.profileImage}">
        <div class="birthdayCard__details">
            <a class="birthdayCard__name" href="/userPage/${element.user._id}">${element.user.firstName} ${element.user.lastName}</a>
            <h4 class="birthdayCard__info">Will be ${element.willBeTheAgeOf}yo | x days left</h4>
        </div>
    </div>`
    );

    prevDay = element.day;
  });
});

// ###########
// searchBar

input.addEventListener("input", (event) => {
  event.preventDefault();
  const matched = [];
  const queryString = input.value.replace(/\s+/g, "").toLowerCase();
  message.classList.add("hidden");

  // Looking for user that starts with queryString
  Array.from(result.bDates).forEach((bDate) => {
    let month = bDate.name;
    let day, userID;
    Array.from(bDate.data).forEach((element) => {
      day = element.day;
      userID = element.user._id;
      const userName = `${element.user.firstName} ${element.user.lastName}`
        .replace(/\s+/g, "")
        .toLowerCase();

      if (userName.startsWith(queryString)) {
        matched.push({
          month,
          day,
          userID,
        });
      }
    });
  });

  // ####
  // Hiding all elements, so we could generate the ones that matched
  hideElements();
  if (matched.length < 1) {
    message.classList.remove("hidden");
    return;
  }

  setTimeout(() => {
    // Generating elements
    matched.forEach((element) => {
      document
        .querySelectorAll(`.birthdays__month[data-month="${element.month}"]`)[0]
        .classList.remove("hidden");

      document
        .querySelectorAll(
          `.month__day[data-month="${element.month}"][data-day-count="${element.day}"]`
        )[0]
        .classList.remove("hidden");

      Array.from(
        document.querySelectorAll(
          `.birthdayCard[data-user-id="${element.userID}"][data-month="${element.month}"][data-day-count="${element.day}"]`
        )
      ).forEach((el) => {
        console.log("c");
        el.classList.remove("hidden");
      });
    });
  }, 1);
});
