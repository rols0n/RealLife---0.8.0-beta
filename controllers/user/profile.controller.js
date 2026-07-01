const User = require("../../models/userModel");

const multer = require("multer");
const sharp = require("sharp");

const decodingToken = require("../../utils/decodingToken");
const {asyncHandler} = require("../../middlewares/utils/asyncHandler");

const AppError = require("../../middlewares/utils/AppError");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callBack) => {
  if (file.mimetype.startsWith("image")) {
    return callBack(null, true);
  }

  callBack(new AppError("You can upload ONLY images", 400, "WRONG_FILE_TYPE"), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const getLoggedUser = async (req) => {
  if (req.user) return req.user;

  const decoded = await decodingToken(req);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("User doesn't exist", 404, "USER_NOT_FOUND");
  }

  req.user = user;
  return user;
};

const resizeUserImage = (folder, fileName, width, height) =>
  asyncHandler(async (req, res, next) => {
    if (!req.file) return next();

    const user = await getLoggedUser(req);

    req.file.filename = `${fileName}-${user._id}.jpeg`;

    await sharp(req.file.buffer)
      .resize(width, height)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/imgs/users/${user._id}/${folder}/${req.file.filename}`);

    next();
  });

const updateUserImage = (field, folder) =>
  asyncHandler(async (req, res, next) => {
    const user = await getLoggedUser(req);

    if (!req.file) {
      return next(
        new AppError(
          "This route is only for changing user images",
          400,
          "IMAGE_NOT_FOUND"
        )
      );
    }

    const imagePath = `/imgs/users/${user._id}/${folder}/${req.file.filename}`;

    await User.findByIdAndUpdate(user._id, {
      [field]: imagePath,
    });

    res.status(200).json({
      status: "success",
      data: { imagePath },
    });
  });

exports.uploadProfilePicture = upload.single("profileImage");

exports.resizeProfilePicture = resizeUserImage(
  "profilePicture",
  "profile-picture",
  500,
  500
);

exports.updateProfilePicture = updateUserImage("profileImage", "profilePicture");

exports.uploadBannerPicture = upload.single("bannerPicture");

exports.resizeBannerPicture = resizeUserImage(
  "bannerPicture",
  "banner-picture",
  1200,
  628
);

exports.updateBannerPicture = updateUserImage("bannerImage", "bannerPicture");