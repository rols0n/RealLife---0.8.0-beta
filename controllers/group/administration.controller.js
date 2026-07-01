const Group = require("../../models/groupModel");
const User = require("../../models/userModel");

const addNewMember = require("./services/groupRole.service.")
const removeMember = require("./utils/removeMember")
const roleValidation = require("./utils/roleValidation")

const handlerController = require("../handlerController");
const authController = require("../authController");

const decodingToken = require("../../utils/decodingToken");
const {asyncHandler} = require("../../middlewares/utils/asyncHandler")

module.exports.addNewAdmin = asyncHandler( async (req, res, next) => {
 
    await authController.isAdminOrMod(req, "admin");

    const data = await addNewMember(req, "admin");

    res.status(200).json({
      status: "success",
      data,
    });
  
});

module.exports.removeAdmin = asyncHandler(async (req, res, next) => {
 
    await authController.isAdminOrMod(req, "admin");
    removeMember(req, res, User, Group, "admin");
  
});

module.exports.addNewModerator = asyncHandler( async (req, res, next) => {
  
    await authController.isAdminOrMod(req, "admin");
    const data = await addNewMember(req, "admin");

    res.status(200).json({
      status: "success",
      data,
    });
  
});

module.exports.deleteModerator = asyncHandler(async (req, res, next) => {
  
    await authController.isAdminOrMod(req, "admin");
    removeMember(req, res, User, Group, "moderator");
  
});

module.exports.removeUser = asyncHandler(async (req, res) => {
  
    await authController.isAdminOrMod(req);
    removeMember(req, res, User, Group, "user");
  
});
