const User = require("../../models/userModel");
const handlerController = require("../../controllers/handlerController");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const decodingToken = require("../../utils/decodingToken");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callBack) => {
  if (file.mimetype.startsWith("image")) {
    callBack(null, true);
  } else {
    callBack("You can upload ONLY images", false);
  }
};


const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});


exports.uploadProfilePicture = upload.single("profileImage");
exports.resizeProfilePicture = async (req, res, next) => {
  if (!req.file) return next();

  const decoded = await decodingToken(req);

  // 3) Checking if USER still exists
  const user = await User.findById(decoded.id);

  req.file.filename = `profile-picture-${user._id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/imgs/users/${user._id}/profilePicture/${req.file.filename}`);

  next();
};
exports.updateProfilePicture = async (req, res, next) => {
  try {
    // const user = await User.findById(req.params.id);
    const decoded = await decodingToken(req);

    // 3) Checking if USER still exists
    const user = await User.findById(decoded.id);
    if (user) {
      if (!req.file) {
        res.status(404).json({
          status: "fail",
          message: "This route is only for changing user images",
        });
      }
      console.log(req.file);

      const imagePath = `/imgs/users/${user._id}/profilePicture/${req.file.filename}`;
      await User.findByIdAndUpdate(user._id, {
        profileImage: imagePath,
      });

      res.status(200).json({
        status: "success",
        data: { imagePath },
      });
    }
  } catch (err) {
    res.status(404).json({ status: "fail", error: err });
  }
};



exports.uploadBannerPicture = upload.single("bannerPicture");
exports.resizeBannerPicture = async (req, res, next) => {
  if (!req.file) return next();
  const decoded = await decodingToken(req);

  // 3) Checking if USER still exists
  const user = await User.findById(decoded.id);

  req.file.filename = `banner-picture-${user._id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(1200, 628)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/imgs/users/${user._id}/bannerPicture/${req.file.filename}`);

  next();
};
exports.updateBannerPicture = async (req, res, next) => {
  try {
    const decoded = await decodingToken(req);

    // 3) Checking if USER still exists
    const user = await User.findById(decoded.id);

    if (user) {
      if (!req.file) {
        res.status(404).json({
          status: "fail",
          message: "This route is only for changing user images",
        });
      }

      // console.log(req.file);
      const imagePath = `/imgs/users/${user._id}/bannerPicture/${req.file.filename}`;
      await User.findByIdAndUpdate(user._id, {
        bannerImage: imagePath,
      });

      res.status(200).json({
        status: "success",
        data: { imagePath },
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};


