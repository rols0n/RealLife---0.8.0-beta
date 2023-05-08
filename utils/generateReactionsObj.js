module.exports = (behaviour, disLikes, likes, userID, reaction, order) => {
  const disLikesUsrs = [];
  disLikes.users.forEach((user) => {
    if (`${user}` !== `${userID}`) disLikesUsrs.push(`${user}`);
  });
  const likesUsrs = [];
  likes.users.forEach((user) => {
    if (`${user}` !== `${userID}`) likesUsrs.push(`${user}`);
  });

  likes.users = Array.from(new Set(likesUsrs));
  disLikes.users = Array.from(new Set(disLikesUsrs));

  if (behaviour === "add") {
    if (reaction === "like") likes.users.push(`${userID}`);

    if (reaction === "disLike") disLikes.users.push(`${userID}`);
  }

  likes.count = likes.users.length;
  disLikes.count = disLikes.users.length;

  if (order)
    if (likes.count < disLikes.count) {
      order = ["disLikes", "likes"];
    }

  count = likes.count + disLikes.count;

  return { disLikes, likes, count, order };
};
