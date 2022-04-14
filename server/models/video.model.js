const query = require("../config/mysql.config");
const { checkUuidAvailability } = require("../functions/uuid.functions");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { VIDEO_FOLDER_PATH } = require("../constants");
const fs = require("fs");
const { filterUserVideos } = require("../functions/video.functions");

/**
 * 
 * @param {*} res 
 * @param {*} contentId 
 * @returns info about the video
 */
async function videoById(res, contentId) {
  try {
    const [video] = await query(
      `SELECT content.id, type, title,description, tags, upload_date as uploadDate, views,
       likes, dislikes, visibility, uploader_id as uploaderId, users.username
       FROM content JOIN users On users.id = content.uploader_id WHERE content.id = ?`,
      [contentId]
    );
    if (!video) {
      return res.send({ success: true, data: null, error: "Video not found" });
    }
    await query("UPDATE content SET `views`=? WHERE content.id = ?", [video.views + 1, contentId])
    if (video.type === "series") {
      const seasons = await query (`SELECT id, title, description, season FROM series_season WHERE series_season.content_id = ?`, [contentId])
      let editedSeasons = []
      for(let i = 0; i< seasons.length; i++){
        const episodes = await query(
          `SELECT se.title, se.description, se.episode_number as episodeNumber,
           video.intro, video.outro, video.recap, video.next_preview as nextPreview
           FROM series_episode AS se JOIN video ON se.video_id = video.id WHERE se.season_id = ?`,
          [seasons[i].id]
        );
        editedSeasons.push({
          season: seasons[i].season,
          title: seasons[i].title,
          description: seasons[i].description,
          episodes: episodes
        })
      }
      return res.send({ success: true, data: Object.assign(video, { seasons: editedSeasons }), error: null });
    } else {
      const [video] = await query(
        `SELECT content.id, content.type, content.title, content.description,content.tags,
         content.upload_date AS uploadDate, content.views, content.likes, content.dislikes, content.uploader_id AS uploaderId,
         content.visibility, video.intro, video.outro, video.recap, video.next_preview, users.username
         FROM content JOIN video ON content.video_id = video.id JOIN users ON users.id = content.uploader_id WHERE content.id = ?`,
        [contentId]
      );
      return res.send({ success: true, data: video, error: null });
    }
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong please try again later" });
  }
}

async function createVideo(res, file, thumbnail, video) {
  try {
    let uuid;
    do {
      uuid = uuidv4();
    } while (!checkUuidAvailability(uuid));
    //video creation handling for series type no file handling
    if (video.type === "series") {
      //adds needed keys for database
      video.video_id = null;
      video.id = uuid;
      await query("INSERT INTO content SET ?", [video]);
      return res.send({ success: true, data: uuid, error: null });
    }
    // video creation handling for all types other than series
    else {
      //if folder does not exist make it
      if (!fs.existsSync(VIDEO_FOLDER_PATH + uuid)) {
        fs.mkdirSync(VIDEO_FOLDER_PATH + uuid);
      }
      // if file exists then return error
      else if (fs.existsSync(VIDEO_FOLDER_PATH + uuid + `/${uuid}.mp4`)) {
        return res.send({ success: false, data: null, error: "Something went wrong." });
      }
      // the video does not exist or in expected key
      if (!file) {
        return res.send({ success: false, data: null, error: "Could not upload video" });
      }
      const uploadPath = VIDEO_FOLDER_PATH + uuid + `/${uuid}`;
      // saves file
      await file.mv(uploadPath + '.mp4');
      await thumbnail.mv(uploadPath + '.png');

      // adds video file to database
      const { insertId: videoId } = await query("INSERT INTO video (location) VALUES (?)", [`/${uuid}/${uuid}.mp4`]);
      //adds needed keys for database
      video.video_id = videoId;
      video.id = uuid;
      // adds video info to database
      await query("INSERT INTO content SET ?", [video]);
      return res.send({ success: true, data: uuid, error: null });
    }
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong" });
  }
}

async function seriesEpisodeCreate(res, file, contentId, episode, requesterId) {
  try {
    // the video does not exist or was not passed in right
    if (!file) {
      return res.send({ success: false, data: null, error: "No video uploaded" });
    }
    //check if content exists
    const [content] = await query("SELECT type, uploader_id FROM content WHERE content.id = ?", [contentId]);
    if (!content || content.type !== "series") {
      return res.send({ success: false, data: null, error: "Series not found" });
    }
    // makes sure the requester is authorized to create an episode on the series
    if (content.uploader_id !== requesterId) {
      return res.send({ success: false, data: null, error: "Not authorized to add episodes" });
    }

    //gets the highest episode number for series
    const episodes = await query("SELECT * from series_episode WHERE series_episode.content_id = ?", [contentId]);
    let maxEpisodeNum = 0;
    episodes.forEach((episode) => {
      if (episode.episode_number > maxEpisodeNum) {
        maxEpisodeNum = episode.episode_number;
      }
    });

    //if folder does not exist make it
    if (!fs.existsSync(VIDEO_FOLDER_PATH + contentId)) {
      fs.mkdirSync(VIDEO_FOLDER_PATH + contentId);
    }
    // if file exists then return error
    else if (fs.existsSync(VIDEO_FOLDER_PATH + contentId + `/${contentId}-${maxEpisodeNum + 1}.mp4`)) {
      return res.send({ success: false, data: null, error: "Something went wrong." });
    }

    const uploadPath = VIDEO_FOLDER_PATH + contentId + `/${contentId}-${maxEpisodeNum + 1}.mp4`;
    // saves file
    await file.mv(uploadPath);

    // adds video file to database
    const { insertId: videoId } = await query("INSERT INTO video (location) VALUES (?)", [
      `/${contentId}/${contentId}-${maxEpisodeNum + 1}.mp4`,
    ]);
    //adds needed keys for database
    episode.video_id = videoId;
    episode.content_id = contentId;
    episode.episode_number = maxEpisodeNum + 1;
    episode.thumbnail = "";
    // adds video info to database
    await query("INSERT INTO series_episode SET ?", [episode]);
    return res.send({ success: true, data: contentId, error: null });
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong please try again." });
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
    await query(
      "UPDATE series_episode SET ? WHERE series_episode.episode_number = ? AND series_episode.content_id = ?",
      [episode, episode.episode_number, contendId]
    );
    return res.send({ success: true, data: null, error: null });
  } catch (error) {
    return res.send({ success: false, data: null, error: "Something went wrong please try again." });
  }
}

async function streamVideo(res, contentId, requesterId) {
  const [content] = await query("SELECT * FROM content WHERE content.id = ?", [contentId]);
  if (!content || (content.visibility === "private" && content.uploader_id !== requesterId)) {
    return res.send({ success: false, data: null, error: "Video not found" });
  }
  if (content.type === "series") {
    //this should probably not be here
    return res.redirect(`/api/video/stream/${contentId}/1`);
  }
  const resolvedPath = path.resolve(VIDEO_FOLDER_PATH + contentId + "/" + contentId + ".mp4");
  if (fs.existsSync(resolvedPath)) {
    return res.sendFile(resolvedPath);
  } else {
    return res.send({ success: false, data: null, error: "No video found" });
  }
}

async function streamSeries(res, contentId, season, episodeNum, requesterId) {
  try {
    const [content] = await query("SELECT type, visibility, uploader_id FROM content WHERE content.id = ?", [contentId]);
    if (!content || (content.visibility === "private" && content.uploader_id !== requesterId)) {
      return res.send({ success: false, data: null, error: "Video not found" });
    }
    if (content.type !== "series") {
      //this should probably not be here
      return res.redirect(`/api/video/stream/${contentId}`);
    }
    const resolvedPath = path.resolve(`${VIDEO_FOLDER_PATH}${contentId}/${season}/${contentId}-${episodeNum}.mp4`);
    if (!fs.existsSync(resolvedPath)) {
      return res.send({ success: false, data: null, error: "No video found" });
    }
    return res.sendFile(resolvedPath);
  } catch (error) {
    return res.send({ success: false, data: null, error: "No video found" });
  }
}

async function homeVideos(res, requesterId) {
  try {
    const content = await query(`SELECT c.id, c.type, c.title, c.description, c.tags, c.upload_date AS uploadDate,
    c.views, c.likes, c.dislikes, c.uploader_id AS uploaderId, c.duration, c.visibility, c.thumbnail, users.username
    FROM content AS c JOIN users ON c.uploader_id = users.id WHERE 1`);
    const filtered = await filterUserVideos(content, requesterId);
    return res.send({ success: true, data: filtered, error: null });
  } catch (error) {
    return res.send({ success: false, data: null, error: "Something went wrong" });
  }
}

async function thumbnail(res, contentId, requesterId) {
  try {
    const [content] = await query("SELECT * from content WHERE content.id = ?", [contentId]);
    if (content.visibility !== "public") {
      if (content.uploader_id !== requesterId) {
        const resolvedPath = path.resolve("./server/assets/404/404.PNG");
        if (!fs.existsSync(resolvedPath)) {
          return res.send({ success: false, data: null, error: "No image found" });
        }
        return res.sendFile(resolvedPath);
      }
    }
    const resolvedPath = path.resolve(`${VIDEO_FOLDER_PATH}/${contentId}/${contentId}.PNG`);
    if (!fs.existsSync(resolvedPath)) {
      return res.sendFile(path.resolve("./server/assets/404/404.PNG"));
    }
    return res.sendFile(resolvedPath);
  } catch (error) {
    const resolvedPath = path.resolve("./server/assets/404/404.PNG");
    if (!fs.existsSync(resolvedPath)) {
      return res.send({ success: false, data: null, error: "No image found" });
    }
    return res.sendFile(resolvedPath);
  }
}

module.exports = {
  videoById,
  createVideo,
  deleteVideo,
  editVideoInfo,
  editEpisodeInfo,
  streamVideo,
  streamSeries,
  seriesEpisodeCreate,
  homeVideos,
  thumbnail,
};
