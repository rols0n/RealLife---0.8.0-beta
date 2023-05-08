const express = require("express");
const searchController = require("../controllers/searchController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/searchAllUsers")
  .post(authController.protect, searchController.searchAllUser);

router
  .route("/searchRealLife")
  .post(authController.protect, searchController.searchRealLife);

router
  .route("/peopleYouMayKnow")
  .post(authController.protect, searchController.peopleYouMayKnow);

module.exports = router;
