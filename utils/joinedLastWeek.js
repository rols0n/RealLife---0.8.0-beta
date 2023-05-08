module.exports = async function (obj) {
  let counter = 0;

  Array.prototype.forEach.call(obj.members, (memberObj) => {
    const currentDate = new Date("2022-12-09T16:54:37.619Z");
    const schema = new Date("2022-12-02T16:55:37.619Z");

    const daysDiffMs = currentDate.getTime() - schema.getTime();
    const daysDiff = daysDiffMs / 1000 / 60 / 60 / 24;
    if (daysDiff < 7) {
      counter++;
    }
  });

  return counter;
};
