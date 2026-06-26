const Group = require("../../models/groupModel");
const User = require("../../models/userModel");

const addNewMember = require("./services/groupRole.service.")
const removeMember = require("./utils/removeMember")
const roleValidation = require("./utils/roleValidation")

const handlerController = require("../handlerController");
const authController = require("../authController");



const multer = require("multer");
const sharp = require("sharp");
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


exports.uploadAvatarImage = upload.single("avatarImage");
exports.resizeAvatarImage = async (req, res, next) => {
  if (!req.file) return next();

  const group = await Group.findById(req.params.id);

  req.file.filename = `avatar-image-${group._id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`public/imgs/groups/${group._id}/avatars/${req.file.filename}`);

  next();
};

exports.updateAvatarImage = async (req, res) => {
  try {
    // 3) Checking if GROUP still exists
    const group = await Group.findById(req.params.id);
    if (group) {
      if (!req.file) {
        res.status(404).json({
          status: "fail",
          message: "This route is only for changing user images",
        });
      }

      const imagePath = `/imgs/groups/${group._id}/avatars/${req.file.filename}`;
      await Group.findByIdAndUpdate(group._id, {
        avatarImage: imagePath,
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

// Banner
exports.uploadBannerImage = upload.single("bannerImage");
exports.resizeBannerImage = async (req, res, next) => {
  if (!req.file) return next();

  const group = await Group.findById(req.params.id);

  req.file.filename = `banners-image-${group._id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(1250, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`public/imgs/groups/${group._id}/banners/${req.file.filename}`);

  next();
};

exports.updateBannerImage = async (req, res) => {
  try {
    // 3) Checking if GROUP still exists
    const group = await Group.findById(req.params.id);
    if (group) {
      if (!req.file) {
        res.status(404).json({
          status: "fail",
          message: "This route is only for changing user images",
        });
      }

      const imagePath = `/imgs/groups/${group._id}/banners/${req.file.filename}`;
      await Group.findByIdAndUpdate(group._id, {
        bannerImage: imagePath,
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
