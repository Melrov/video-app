const query = require("../config/mysql.config");

async function videoVisibilityCheck(req, res, next) {
  try {
    const [video] = await query("SELECT * FROM content WHERE content.id = ?", [req.params.contentId]);
    if (!video) {
      return res.send({ success: false, data: null, error: "Video not found" });
    }
    if (video.visibility === "private" && !req.user && req.user.id !== video.uploader_id) {
      return res.send({ success: false, data: null, error: "Video not found" });
    }
    return next();
  } catch (error) {
    return res.send({ success: false, data: null, error: "Video not found" });
  }
}

module.exports = {
  videoVisibilityCheck,
};
