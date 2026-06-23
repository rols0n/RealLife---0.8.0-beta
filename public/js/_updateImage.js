module.exports.getProfileImageAndUpdateUser = function () {
  const files = profileImage.files[0];
  if (files) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files);
    fileReader.addEventListener("load", function () {
      const element2 =
        '<img src="' +
        this.result +
        '" class="profileConfigMenu__container__profilePicture__image" />';

      profileImagePreview[0].innerHTML = element2;

      profileImageConfigFileForm[0].addEventListener(
        "submit",
        async (event) => {
          event.preventDefault();

          const formdata = new FormData();
          formdata.append("profileImage", profileImage.files[0]);

          const requestOptions = {
            method: "PATCH",
            // headers: myHeaders,
            body: formdata,
            redirect: "follow",
          };

          fetch(
            "http://127.0.0.1:3000/api/v1/users/updateProfilePicture/63551c87f4335a3f8414c436",
            requestOptions
          )
            .then((response) => response.json())
            .then((result) =>
              window.location.replace("http://127.0.0.1:3000/userPage")
            )
            .catch((error) => console.log("error", error));
        }
      );
    });
  }
};
