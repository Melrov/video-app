const query = require("../config/mysql.config");
const { checkUuidAvailability } = require("../functions/uuid.functions");
const { v4: uuidv4 } = require("uuid");

async function videoById(res, contentId) {
  try {
    const [video] = await query(
      "SELECT id, type, description, tags, upload_date, views, likes, dislikes, visibility, uploader_id FROM content WHERE content.id = ?",
      [contentId]
    );
    if (!video) {
      return res.send({ success: true, data: null, error: "Video not found" });
    }
    if (video.type === "series") {
      const episodes = await query(
        `SELECT se.title, se.description, se.episode_number, video.location,
         video.intro, video.outro, video.recap, video.next_preview
         FROM series_episode AS se JOIN video ON se.video_id = video.id WHERE se.content_id = ?`,
        [contentId]
      );
      return res.send({ success: true, data: Object.assign(video, { episodes }), error: null });
    } else {
      const video = await query(
        `SELECT content.id, content.type, content.title, content.description,content.tags,
         content.upload_date, content.views, content.likes, content.dislikes, content.uploader_id,
         content.visibility, video.location, video.intro, video.outro, video.recap, video.next_preview
         FROM content JOIN video ON content.video_id = video.id WHERE content.id = ?`,
        [contentId]
      );
      return res.send({ success: true, data: video, error: null });
    }
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong please try again later" });
  }
}

async function createVideo(res, files, video) {
  try {
    let uuid;
    do {
      uuid = uuidv4();
    } while (!checkUuidAvailability(uuid));
    // todo save file here with the uuid and if it is series put - 1 or - 2 for maybe not figure it out
    if(video.type === 'series'){
      sampleFile = req.files.sampleFile;
    uploadPath = __dirname + '/upload/' + sampleFile.name;
  
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function(err) {
      if (err)
        return res.status(500).send(err);
  
      res.send('File uploaded!');
    });
    } else {

    }
    const { insertId: videoId } = await query("INSERT INTO video (location) VALUES (?)", ["/aefe/ef.mp4"]);
    if (video.type === "series") {
    } else {
      video.video_id = videoId;
      video.id = uuid;
      const { insertId: contentId } = await query("INSERT INTO content SET ?", [video]);
      if (contentId) {
        return res.send({ success: true, data: contentId, error: null });
      }
      return res.send({ success: false, data: null, error: "Something went wrong" });
    }
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong" });
  }
}

async function deleteVideo(res, contentId, requesterId) {
  try {
    // todo make it not run the query if the video is already deleted
    const [video] = await query("SELECT type, uploader_id, deleted from content WHERE content.id = ?", [contentId]);
    if (video) {
      if (requesterId === video.uploader_id) {
        await query(
          `UPDATE content JOIN videos ON content.video_id = video.id
                 SET content.deleted = true, video.deleted = true WHERE content.id = ?`,
          [contentId]
        );
        if (video.type === "series") {
          await query(
            `UPDATE series_episode JOIN video ON series_episode.video_id = video.id
                 SET series_episode.deleted = true, video.deleted = true WHERE series_episode.content_id = ?`,
            [contentId]
          );
        }
      } else {
        return res.send({ success: false, data: null, error: "You are not authorized to delete this content" });
      }
    }
    return res.send({ success: true, data: null, error: null });
  } catch (error) {
    return res.send({ success: false, data: null, error: "Something went wrong please try again." });
  }
}

async function editVideoInfo(res, contendId, video, requesterId) {
  try {
    const [content] = await query("SELECT uploader_id FROM content WHERE content.id = ?");
    if (!content || content.uploader_id !== requesterId) {
      return res.send({ success: false, data: null, error: "You don't have permission to edit this video" });
    }
    await query("UPDATE content SET ? WHERE content.id = ?", [video, contendId]);
    return res.send({ success: true, data: null, error: null });
  } catch (error) {
    return res.send({ success: false, data: null, error: "Something went wrong please try again." });
  }
}

async function editEpisodeInfo(res, contendId, episode, requesterId) {
  try {
    const [content] = await query("SELECT * FROM content WHERE content.id = ?", [contendId]);
    if (!content || content.uploader_id !== requesterId) {
      return res.send({ success: false, data: null, error: "You don't have permission to edit this video" });
    }
    await query("UPDATE series_episode SET ? WHERE series_episode.episode_number = ? AND series_episode.content_id = ?", [
      episode,
      episode.episode_number,
      contendId,
    ]);
    return res.send({ success: true, data: null, error: null });
  } catch (error) {
    return res.send({ success: false, data: null, error: "Something went wrong please try again." });
  }
}

module.exports = { videoById, createVideo, deleteVideo, editVideoInfo, editEpisodeInfo };
