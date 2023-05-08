module.exports = function (array) {
  const seen = {};
  const returnArray = [];
  for (let i = 0; i < array.length; i++) {
    if (!(array[i] in seen)) {
      returnArray.push(array[i]);
      seen[array[i]] = true;
    }
  }
  return returnArray;
};
