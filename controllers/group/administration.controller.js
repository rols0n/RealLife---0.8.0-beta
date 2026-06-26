const Group = require("../../models/groupModel");
const User = require("../../models/userModel");

const addNewMember = require("utils/addNewMember")
const removeMember = require("utils/removeMember")
const roleValidation = require("utils/roleValidation")

const handlerController = require("../handlerController");
const authController = require("../authController");


module.exports.addNewAdmin = async (req, res) => {
  try {
    await authController.isAdminOrMod(req, "admin");

    addNewMember(req, res, User, Group, "admin");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.removeAdmin = async (req, res) => {
  try {
    await authController.isAdminOrMod(req, "admin");
    removeMember(req, res, User, Group, "admin");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

module.exports.addNewModerator = async (req, res) => {
  try {
    await authController.isAdminOrMod(req, "admin");
    addNewMember(req, res, User, Group, "moderator");
  } catch (error) {
    res.status(404).json({ status: "fail", error });
  }
};

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
