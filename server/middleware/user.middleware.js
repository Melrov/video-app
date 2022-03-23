function validateInput(req, res, next) {
  const b = req.body;
  if (!b.username || !b.password) {
    return res.send({ success: false, data: null, error: "Invalid data provided" });
  }
  if (!(b.username.length >= 2) || !(b.username.length <= 25) || !(b.password.length >= 4) || !(b.password.length <= 512)) {
    return res.send({ success: false, data: null, error: "Invalid data provided" });
  }
  return next()
}

module.exports = {
    validateInput
}