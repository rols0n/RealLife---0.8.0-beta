"use strict";

// DOM elements
const email = document.getElementById("email");
const password = document.getElementById("password");
const form = document.getElementById("loginForm");

// Buttons
const submitButton = document.getElementById("submit");
const signupButton = document.getElementById("signupButton");

// Event listeners
form.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const data = {
      email: email.value,
      password: password.value,
    };

    const response = await fetch("http://127.0.0.1:3000/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const respond = await response.json();
    console.log(respond);

    if (respond.status === "fail") {
      firstName.value = "";
      lastName.value = "";
      birthDate.value = "";
      email.value = "";
      password.value = "";
    }

    if (respond.status === "success") {
      window.location.replace("http://127.0.0.1:3000");
    }
  },
  false
);

signupButton.addEventListener("click", (event) => {
  window.location.replace("http://127.0.0.1:3000/signup");
});
