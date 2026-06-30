const Group = require("../../models/groupModel");
const User = require("../../models/userModel");


const authController = require("../authController");

const {asyncHandler} = require("../../middlewares/utils/asyncHandler")
const AppError = require("../../middlewares/utils/AppError")

const basicAuth = async(req,res,next) => {
    await authController.isAdminOrMod(req);

    // 1. Check if user exists
    const isUser = (await User.findById(req.body.user)) ? true : false;
    if (isUser === false) {
      throw new AppError(`Provided user doesn't exist`, 400, "USER_NOT_FOUND");
    }

    // 2. Check if group exists
    const isGroup = (await Group.findById(req.params.id)) ? true : false;
    if (isGroup === false) {
      throw new AppError(`Provided group doesn't exist`, 400, "GROUP_NOT_FOUND");
    }

}

const validateMembership = async(req,res,next) => {
    const isMember = (await Group.findOne({
      _id: req.params.id,
      "members._id": req.body.user,
    }))
      ? true
      : false;
    if (isMember === true) {
      throw new AppError(`This user is already member of the group`, 400, "BAD_REQUEST");
    }
}

// sent or  received
const validateRequestStatus  = async({ direction, expected, message }, req,res,next) => {
      const requestExists = (await User.findOne({
      _id: req.body.user,
      [`groups.requests.${direction}.group`]: req.params.id,
    }))
      ? true
      : false;
    if (requestExists === expected) {
      throw new AppError(message, 400, "BAD_REQUEST");
    }
}


const generateResponse = async(message, req,res) => {
  const group = await Group.findById(req.params.id);
  const user = await User.findById(req.body.user);

    res.status(200).json({
      status: "success",
      message: message,
      data: { group, user },
    });
}



module.exports.sendGroupInvitation = asyncHandler(async (req, res, next) => {

    await basicAuth(req,res,next)
    await validateMembership(req,res,next)
    await validateRequestStatus({
    direction: "sent",
    expected: true,
    message: "User already sent the request",
    }, req,res,next)

    await validateRequestStatus({
    direction: "received",
    expected: true,
    message: "User already received the request",
    }, req,res,next)

    


    
    await User.updateOne(
      { _id: req.body.user },
      { $push: { "groups.requests.received": { group: req.params.id } } }
    );

    
    await Group.updateOne(
      { _id: req.params.id },
      {
        $push: { "requests.sent": { user: req.body.user } },
      }
    );

    await generateResponse('sent invitation', req,res)
  
});

module.exports.cancelGroupInvitation = asyncHandler(async (req, res, next) => {
  
    await basicAuth(req,res,next)
    await validateMembership(req,res,next)

    await validateRequestStatus({
    direction: "received",
    expected: false,
    message: "User didn't receive request",
    }, req,res,next)  

    

    
    await User.updateOne(
      { _id: req.body.user },
      { $pull: { "groups.requests.received": { group: req.params.id } } }
    );

    
    await Group.updateOne(
      { _id: req.params.id },
      {
        $pull: { "requests.sent": { user: req.body.user } },
      }
    );

    await generateResponse("canceled group invitation",req,res)
  
});

module.exports.acceptGroupRequest = asyncHandler(async (req, res, next) => {
  
    await basicAuth(req,res,next);
    await validateMembership(req,res,next)
    
    await validateRequestStatus({
    direction: "sent",
    expected: false,
    message: "User didn't send the request",
    }, req,res,next)


    
    await User.updateOne(
      { _id: req.body.user },
      { $pull: { "groups.requests.sent": { group: req.params.id } } }
    );

    
    await Group.updateOne(
      { _id: req.params.id },
      {
        $pull: { "requests.received": { user: req.body.user } },
      }
    );

    await User.updateOne(
      { _id: req.body.user },
      { $push: { "groups.currentlyIn": { _id: req.params.id, role: "user" } } }
    );

    await Group.updateOne(
      { _id: req.params.id },
      {
        $push: { members: { _id: req.body.user, role: "user" } },
      }
    );


    await generateResponse('accepted request', req,res)
  
});

module.exports.rejectGroupRequest = asyncHandler(async (req, res, next) => {
  
    await basicAuth(req,res,next);
    await validateMembership(req,res,next)
    await validateRequestStatus({
    direction: "sent",
    expected: false,
    message: "User didn't send the request",
    }, req,res,next)
    
    


    
    await User.updateOne(
      { _id: req.body.user },
      { $pull: { "groups.requests.sent": { group: req.params.id } } }
    );

    
    await Group.updateOne(
      { _id: req.params.id },
      {
        $pull: { "requests.received": { user: req.body.user } },
      }
    );

    await generateResponse('rejected request', req,res)
 
});