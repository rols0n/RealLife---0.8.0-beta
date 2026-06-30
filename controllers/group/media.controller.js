const Group = require("../../models/groupModel");
const User = require("../../models/userModel");

const addNewMember = require("./services/groupRole.service.")
const removeMember = require("./utils/removeMember")
const roleValidation = require("./utils/roleValidation")

const handlerController = require("../handlerController");
const authController = require("../authController");

const asyncHandler = require("../../middlewares/utils/asyncHandler")
const AppError = require("../../middlewares/utils/AppError")



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


const resizeImage = async (type, size, req,res,next) => {
  if(!req.file) next(new AppError("File not found", 404, "NOT_FOUND"));
  const group = await Group.findById(req.params.id);
  req.file.filename = `${type}-image-${group._id}.jpeg`;
  await sharp(req.file.buffer)
    .resize(size[0], size[1])
    .toFormat("jpeg")
    .jpeg({quality: 95})
    .toFile(`public/imgs/groups/${group._id}/${type}/${req.file.filename}`)
  next();
  }

const uploadImage = async (type, field, req,res,next) => {
 
    
    const group = await Group.findById(req.params.id);
    if (group) {
      if (!req.file) {
        next(new AppError("This route is only for changing group images", 400, "BAD_REQUEST"))
        
      }

      const imagePath = `/imgs/groups/${group._id}/${type}/${req.file.filename}`;
      await Group.findByIdAndUpdate(group._id, {
        field: imagePath,
      });

      res.status(200).json({
        status: "success",
        data: { imagePath },
      });
    }
  
}


exports.uploadAvatarImage = upload.single("avatarImage");
exports.resizeAvatarImage = async (req, res, next) => resizeImage("avatars", [500, 500], req,res,next);

exports.updateAvatarImage = asyncHandler(async (req, res, next) => {
  await uploadImage("avatars", avatarImage, req,res,next)
});

// Banner
exports.uploadBannerImage = upload.single("bannerImage");
exports.resizeBannerImage = async (req, res, next) => resizeImage("banners", [1250, 500], req,res,next);;

exports.updateBannerImage = asyncHandler(async (req, res, next) => {
  await uploadImage("banners", bannerImage, req,res,next)
});
