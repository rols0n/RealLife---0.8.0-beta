module.exports = (behaviour, disLikes, likes, userID, reaction, order) => {
  const userId = userID.toString();

  const likesUsers = [...new Set(
    likes.users
      .map((user) => user.toString())
      .filter((user) => user !== userId)
  )];

  const disLikesUsers = [...new Set(
    disLikes.users
      .map((user) => user.toString())
      .filter((user) => user !== userId)
  )];

  if (behaviour === "add") {
    if (reaction === "like") {
      likesUsers.push(userId);
    }

    if (reaction === "disLike") {
      disLikesUsers.push(userId);
    }
  }

  const updatedLikes = {
    ...likes,
    users: likesUsers,
    count: likesUsers.length,
  };

  const updatedDisLikes = {
    ...disLikes,
    users: disLikesUsers,
    count: disLikesUsers.length,
  };

  const count = updatedLikes.count + updatedDisLikes.count;

  const updatedOrder = order
    ? updatedLikes.count >= updatedDisLikes.count
      ? ["likes", "disLikes"]
      : ["disLikes", "likes"]
    : order;

  return {
    disLikes: updatedDisLikes,
    likes: updatedLikes,
    count,
    order: updatedOrder,
  };
};