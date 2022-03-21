const query = require("../config/mysql.config");
const authenticate = require("../middleware/authenticate.middleware");
const { filterUserVideos } = require("../functions/video.functions");

async function videoById(res, contentId, requesterId) {
  try {
    const [video] = await query("SELECT * FROM content JOIN video ON content.video_id = video.id WHERE content.id = ?", [contentId]);
    if (!video) {
      return res.send({ success: true, data: null, error: "Video not found" });
    }
    if (video.type === "series") {
      const episodes = await query(
        "SELECT * FROM series_episode JOIN video ON series_episode.video_id = video.id WHERE series_episode.content_id = ?",
        [contentId]
      );
      return res.send({ success: true, data: Object.assign(video, { episodes }), error: null });
    } else {
      return res.send({ success: true, data: video, error: null });
    }
  } catch (error) {
    return res.send({ success: false, data: null, error: "Something went wrong please try again later" });
  }
}
