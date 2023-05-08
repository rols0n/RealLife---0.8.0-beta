const populatePosts = require("./populatePosts.js");

module.exports = async function (schema) {
  await populatePosts(schema);

  await schema
    .populate({
      path: "members",
      populate: {
        path: "_id",
        populate: {
          path: "friends",
        },
      },
    })
    .execPopulate();
  await schema
    .populate({
      path: "administration.admins",

      populate: { path: "_id" },
    })
    .execPopulate();

  await schema
    .populate({
      path: "administration.moderators",

      populate: { path: "_id" },
    })
    .execPopulate();

  await schema
    .populate({
      path: "requests.sent requests.received",
      populate: {
        path: "user",
      },
    })
    .execPopulate();
};
