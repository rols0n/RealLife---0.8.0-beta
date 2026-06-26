const Group = require("../../models/groupModel");
const User = require("../../models/userModel");

const addNewMember = require("./services/groupRole.service.")
const removeMember = require("./utils/removeMember")
const roleValidation = require("./utils/roleValidation")

const handlerController = require("../handlerController");
const authController = require("../authController");

const decodingToken = require("../../utils/decodingToken");

module.exports.addNewAdmin = asyncHandler( async (req, res, next) => {
 
    await authController.isAdminOrMod(req, "admin");

    const data = await addNewMember(req, "admin");

    res.status(200).json({
      status: "success",
      data,
    });
  
});

module.exports.removeAdmin = async (req, res) => {
  try {
    await authController.isAdminOrMod(req, "admin");
    removeMember(req, res, User, Group, "admin");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.addNewModerator = asyncHandler( async (req, res, next) => {
  
    await authController.isAdminOrMod(req, "admin");
    const data = await addNewMember(req, "admin");

    res.status(200).json({
      status: "success",
      data,
    });
  
});

module.exports.deleteModerator = async (req, res) => {
  try {
    await authController.isAdminOrMod(req, "admin");
    removeMember(req, res, User, Group, "moderator");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.removeUser = async (req, res) => {
  try {
    await authController.isAdminOrMod(req);
    removeMember(req, res, User, Group, "user");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};
