const Group = require("../../models/groupModel");
const  asyncHandler  = require("../../middlewares/utils/asyncHandler");
const AppError = require("../../middlewares/utils/AppError");

const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callBack) => {
  if (file.mimetype.startsWith("image")) {
    callBack(null, true);
  } else {
    callBack(new AppError("You can upload ONLY images", 400, "ONLY_IMAGES_ALLOWED"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const resizeGroupImage = (type, size) =>
  asyncHandler(async (req, res, next) => {
    if (!req.file) return next();

    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(new AppError("Group not found", 404, "GROUP_NOT_FOUND"));
    }

    req.group = group;
    req.file.filename = `${type}-image-${group._id}.jpeg`;

    await sharp(req.file.buffer)
      .resize(size[0], size[1])
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`public/imgs/groups/${group._id}/${type}/${req.file.filename}`);

    next();
  });

const updateGroupImage = (type, field) =>
  asyncHandler(async (req, res, next) => {
    const group = req.group || await Group.findById(req.params.id);

    if (!group) {
      return next(new AppError("Group not found", 404, "GROUP_NOT_FOUND"));
    }

    if (!req.file) {
      return next(
        new AppError(
          "This route is only for changing group images",
          400,
          "GROUP_IMAGES_ONLY"
        )
      );
    }

    const imagePath = `/imgs/groups/${group._id}/${type}/${req.file.filename}`;

    await Group.findByIdAndUpdate(group._id, {
      [field]: imagePath,
    });

    res.status(200).json({
      status: "success",
      data: { imagePath },
    });
  });

exports.uploadAvatarImage = upload.single("avatarImage");
exports.resizeAvatarImage = resizeGroupImage("avatars", [500, 500]);
exports.updateAvatarImage = updateGroupImage("avatars", "avatarImage");

exports.uploadBannerImage = upload.single("bannerImage");
exports.resizeBannerImage = resizeGroupImage("banners", [1250, 500]);
exports.updateBannerImage = updateGroupImage("banners", "bannerImage");