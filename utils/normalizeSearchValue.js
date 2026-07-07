module.exports = (value = "") => {
  return String(value).replace(/\s+/g, "").toLowerCase();
};