"use strict";

// DOM Elements
const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const birthDate = document.getElementById("birthdate");
const email = document.getElementById("email");
const password = document.getElementById("password");
const form = document.getElementById("loginForm");
const warning = document.getElementById("loginForm__warning");

// buttons
const signupButton = document.getElementById("submit");
const loginButton = document.getElementById("loginButton");

// Event listener
form.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const data = {
      firstName: firstName.value,
      lastName: lastName.value,
      birthDate: birthDate.value,
      email: email.value,
      password: password.value,
    };

    const response = await fetch("http://127.0.0.1:3000/api/v1/users/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const respond = await response.json();

    if (respond.status === "fail") {
      warning.style.color = "#d64045";
      firstName.value = "";
      lastName.value = "";
      birthDate.value = "";
      email.value = "";
      password.value = "";
    }

    if (respond.status === "success") {
      warning.style.color = "white";
      window.location.replace("http://127.0.0.1:3000/login");
      window.alert("Your account was created, you have to log in now");
    }
  },
  false
);

loginButton.addEventListener("click", (event) => {
  window.location.replace("http://127.0.0.1:3000/login");
});
