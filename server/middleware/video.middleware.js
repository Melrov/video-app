const query = require("../config/mysql.config");

async function videoVisibilityCheck(req, res, next) {
  try {
    if (!req.params.contentId) {
      return res.send({ success: false, data: null, error: "Video not found" });
    }
    const [video] = await query("SELECT * FROM content WHERE content.id = ?", [req.params.contentId]);
    if (!video) {
      return res.send({ success: false, data: null, error: "Video not found" });
    }
    if (video.visibility === "private" && req.user.id !== video.uploader_id) {
      return res.send({ success: false, data: null, error: "Video not found" });
    }
    return next();
  } catch (error) {
    return res.send({ success: false, data: null, error: "Video not found" });
  }
}

async function uploadCheck(req, res, next) {
  // Todo maybe change it to use temp file instead of memory
  // console.log(req.files)
  // req.files.sampleFile.data = null
  // console.log(req.files)
  const b = req.body;
  if (!req.user.id) {
    return res.send({ success: false, data: null, error: "Please Sign in first" });
  }
  if (!b.type || !b.title || !b.description || !b.visibility) {
    return res.send({ success: false, data: null, error: "Invalid data provided" });
  }
  if (b.type === "movie" || b.type === "series" || b.type === "video") {
    return next();
  }
  if (b.type !== 'series'){
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.send({ success: false, data: null, error: "No files were uploaded" });
    }
    if(!req.files.videoFile || !req.files.thumbnail){
      return res.send({ success: false, data: null, error: "Invalid file input" });
    }
  }
  return res.send({ success: false, data: null, error: "Invalid data provided." });
}

function editInputCheck(req, res, next) {
  const b = req.body;
  if (!req.user.id) {
    return res.send({ success: false, data: null, error: "Please Sign in first" });
  }
  if (!b.type || !b.title || !b.description || !b.visibility) {
    return res.send({ success: false, data: null, error: "Invalid data provided" });
  }
  if (b.type === "movie" || b.type === "series" || b.type === "video") {
    return next();
  }
  return res.send({ success: false, data: null, error: "Invalid data provided." });
}

module.exports = {
  videoVisibilityCheck,
  uploadCheck,
  editInputCheck,
};
