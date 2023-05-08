module.exports.today = function (obj) {
  let counter = 0;
  const currentDate = new Date();

  Array.prototype.forEach.call(obj.posts, (postObj) => {
    const schema = postObj._id;
    const daysDiff = currentDate.getUTCDate() - schema.createdAt.getUTCDate();
    if (daysDiff === 0) {
      counter++;
    }
  });

  return counter;
};

module.exports.lastMonth = function (obj) {
  let counter = 0;

  Array.prototype.forEach.call(obj.posts, (postObj) => {
    const schema = postObj._id.createdAt;
    const currentDate = new Date();

    let monthsDiff = currentDate.getUTCMonth() - schema.getUTCMonth();

    if (monthsDiff === -11) {
      // date.getUTCMonth() (December) - date2.getUTCMonth() (January) = -11
      // date.getUTCMonth() (April) - date2.getUTCMonth() (March) = 1
      // Thats why monthsDiff needs to be assigned as 1, when the value is -11
      monthsDiff = 1;
      if (currentDate.getUTCDate() < schema.getUTCDate()) {
        monthsDiff--;
      }
    }

    if (monthsDiff === 1) {
      if (currentDate.getUTCDate() < schema.getUTCDate()) {
        monthsDiff--;
      }
    }

    if (monthsDiff <= 0) {
      counter++;
    }
  });

  return counter;
};
