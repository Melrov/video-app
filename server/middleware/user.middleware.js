function validateInput(req, res, next) {
  const b = req.body;
  if (!b.username || !b.password) {
    return res.send({ success: false, data: null, error: "Invalid data provided" });
  }
  if (!b.username.length >= 2 || !b.username <= 25 || !b.password >= 4 || !b.password <= 512) {
    return res.send({ success: false, data: null, error: "Invalid data provided" });
  }
  return next()
}

module.exports = {
    validateInput
}