const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const failedRequest = function (token) {
  if (!token) {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

module.exports = function (req, token) {
  if (!token) {
    const token = req.headers.cookie.split("=")[1];
    failedRequest(token);

    return promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } else {
    failedRequest(token);
    return promisify(jwt.verify)(token, process.env.JWT_SECRET);
  }
};
