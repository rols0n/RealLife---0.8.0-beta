module.exports = async function (schema) {
  await schema
    .populate({
      path: "posts",
      populate: {
        path: "_id",
        populate: {
          path: "author comments cantBeDisplayedBy",
          populate: {
            path: "tree",
            populate: {
              path: "author replies",
              populate: {
                path: "author repliesTo subReplies",
                populate: { path: "author repliesTo" },
              },
            },
          },
        },
      },
    })
    .execPopulate();

  await schema
    .populate({
      path: "blockList",
      populate: {
        path: "schema",
      },
    })
    .execPopulate();

  // await schema
  //   .populate({
  //     path: "posts",
  //     populate: {
  //       path: "_id",
  //     },
  //   })
  //   .execPopulate();
};
