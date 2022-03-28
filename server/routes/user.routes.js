const express = require("express");
const { login, signup, videosByUserId } = require("../models/user.model");
const { authenticate, requesterId } = require("../middleware/authenticate.middleware");
const { validateInput } = require("../middleware/user.middleware");
const router = express.Router();

router.post("/verify", [authenticate], (req, res) => {
  return res.send({ success: true, data: { username: req.user.username }, error: null });
});

router.get("/logout", (req, res) => {
  res.clearCookie("access_token");
  return res.send({ success: true, data: null, error: null });
});

router.post("/login", [validateInput], (req, res) => {
  login(res, req.body.username, req.body.password);
});

router.put("/signup", [validateInput], (req, res) => {
  signup(res, req.body.username, req.body.password);
});

router.get("/:userId", [requesterId], (req, res) => {
  videosByUserId(res, req.params.userId, req.user.id);
});

module.exports = router;
