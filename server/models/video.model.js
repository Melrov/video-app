const query = require("../config/mysql.config");
const { generateUuid } = require("../functions/uuid.functions");
const path = require("path");
const { VIDEO_FOLDER_PATH } = require("../constants");
const fs = require("fs");
const { filterUserVideos } = require("../functions/video.functions");
const dateFns = require("date-fns");

/**
 *
 * @param {*} res
 * @param {*} contentId
 * @param {*} userId
 * @returns info about the video
 */
async function videoById(res, contentId, userId) {
  try {
    const video = await query(
      `SELECT content.id, content.title AS content_title, content.description AS content_description, content.tags, content.type,
       content.views, content.upload_date, content.likes, content.dislikes, content.visibility, content.thumbnail AS content_thumbnail,
       ss.title AS season_title, ss.description AS season_description, ss.season, se.title AS episode_title,
       se.description AS episode_description, se.episode_number, se.thumbnail, video.intro, video.outro,
       video.recap, video.next_preview, wt.time AS watchTime, users.username, IFNULL(content.duration, se.duration) AS duration
       FROM content JOIN users ON users.id = content.uploader_id
       LEFT OUTER JOIN series_season AS ss ON ss.content_id = content.id
       LEFT OUTER JOIN series_episode AS se ON se.season_id = ss.id
       LEFT OUTER JOIN video ON video.id = se.video_id OR content.video_id = video.id
       LEFT OUTER JOIN watch_time AS wt
       ON wt.user_id = ? AND wt.content_id = content.id AND (content.type != 'series' OR wt.season = ss.season)
       AND (content.type != 'series' OR wt.episode_num = se.episode_number)
       WHERE content.id = ? AND (content.visibility  != 'private' OR content.uploader_id = ?)
       ORDER BY content.id, season, se.episode_number`,
      [userId, contentId, userId]
    );
    if (video.length === 0) {
      return res.send({ success: true, data: null, error: "Video not found" });
    }
    let obj;
    if (video[0].type === "series") {
      obj = {
        id: video[0].id,
        type: video[0].type,
        title: video[0].content_title,
        description: video[0].content_description,
        tags: video[0].tags,
        uploadDate: dateFns.formatDistanceToNow(new Date(video[0].upload_date), { addSuffix: true }),
        views: video[0].views + 1,
        likes: video[0].likes,
        dislikes: video[0].dislikes,
        visibility: video[0].visibility,
        uploaderId: video[0].uploader_id,
        username: video[0].username,
        thumbnail: video[0].content_thumbnail,
        seasons: [],
      };
      video.forEach((entry) => {
        const season = obj.seasons.find((season) => season.season === entry.season);
        if (season) {
          if (entry.episode_number) {
            season.episodes.push({
              title: entry.episode_title,
              description: entry.episode_description,
              episodeNumber: entry.episode_number,
              intro: entry.intro,
              outro: entry.outro,
              recap: entry.recap,
              nextPreview: entry.next_preview,
              watchTime: entry.watchTime,
              duration: entry.duration,
            });
          }
        } else {
          if (entry.season) {
            if (entry.episode_number) {
              obj.seasons.push({
                season: entry.season,
                title: entry.season_title,
                description: entry.season_description,
                episodes: [
                  {
                    title: entry.episode_title,
                    description: entry.episode_description,
                    episodeNumber: entry.episode_number,
                    intro: entry.intro,
                    outro: entry.outro,
                    recap: entry.recap,
                    nextPreview: entry.next_preview,
                    watchTime: entry.watchTime,
                    duration: entry.duration,
                  },
                ],
              });
            } else {
              obj.seasons.push({
                season: entry.season,
                title: entry.season_title,
                description: entry.season_description,
                episodes: [],
              });
            }
          }
        }
      });
    } else {
      obj = {
        id: video[0].id,
        type: video[0].type,
        title: video[0].content_title,
        description: video[0].content_description,
        tags: video[0].tags,
        uploadDate: dateFns.formatDistanceToNow(new Date(video[0].upload_date), { addSuffix: true }),
        views: video[0].views + 1,
        likes: video[0].likes,
        dislikes: video[0].dislikes,
        visibility: video[0].visibility,
        uploaderId: video[0].uploader_id,
        username: video[0].username,
        thumbnail: video[0].content_thumbnail,
        intro: video[0].intro,
        outro: video[0].outro,
        recap: video[0].recap,
        nextPreview: video[0].next_preview,
        watchTime: video[0].watchTime,
        duration: video[0].duration,
      };
    }
    await query("UPDATE content SET views = views + 1 WHERE content.id = ?", [contentId]);
    return res.send({ success: true, data: obj, error: null });
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong please try again later" });
  }
}

async function createVideo(res, file, thumbnail, video) {
  try {
    // the video does not exist or in expected key
    if (!file) {
      return res.send({ success: false, data: null, error: "Could not upload video" });
    }
    const uuid = generateUuid("content");
    // video creation handling for all types other than series

    //if folder does not exist make it
    if (!fs.existsSync(VIDEO_FOLDER_PATH + uuid)) {
      fs.mkdirSync(VIDEO_FOLDER_PATH + uuid);
    }
    // if file exists then return error
    else if (fs.existsSync(VIDEO_FOLDER_PATH + uuid + `/${uuid}.mp4`)) {
      return res.send({ success: false, data: null, error: "Something went wrong." });
    }

    const uploadPath = VIDEO_FOLDER_PATH + uuid + `/${uuid}`;
    // saves file
    await file.mv(uploadPath + ".mp4");
    await thumbnail.mv(uploadPath + ".png");

    // adds video file to database
    const { insertId: videoId } = await query("INSERT INTO video (location) VALUES (?)", [`/${uuid}/${uuid}.mp4`]);
    //adds needed keys for database
    video.video_id = videoId;
    video.id = uuid;
    // adds video info to database
    await query("INSERT INTO content SET ?", [video]);
    return res.send({ success: true, data: { contentId: uuid }, error: null });
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong" });
  }
}

async function createSeries(res, series, thumbnail) {
  try {
    const uuid = generateUuid("content");
    //adds needed keys for database
    //should have some type of season create here
    series.video_id = null;
    series.id = uuid;
    await query("INSERT INTO content SET ?", [series]);

    //if folder does not exist make it
    if (!fs.existsSync(VIDEO_FOLDER_PATH + uuid)) {
      fs.mkdirSync(VIDEO_FOLDER_PATH + uuid);
    }
    // the video does not exist or in expected key
    if (!thumbnail) {
      return res.send({ success: false, data: null, error: "Could not upload thumbnail" });
    }
    const uploadPath = VIDEO_FOLDER_PATH + uuid + `/${uuid}`;
    // saves file
    await thumbnail.mv(uploadPath + ".png");

    return res.send({ success: true, data: uuid, error: null });
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong" });
  }
}

async function seriesSeasonCreate(res, season, requesterId) {
  try {
    const content = await query(
      `SELECT content.uploader_id, content.visibility FROM content
       JOIN series_season ON content.id = series_season.content_id WHERE content.id = ?`,
      [season.content_id]
    );
    if (content.length === 0) {
      return res.send({ success: false, data: null, error: "Content not found" });
    }
    if (content[0].uploader_id !== requesterId) {
      if (content[0].visibility === "private") {
        return res.send({ success: false, data: null, error: "Content not found" });
      }
      return res.send({ success: false, data: null, error: "Not authorized to add episodes" });
    }
    season.season = content.length + 1;
    await query("INSERT INTO series_season SET ?", [season]);
    return res.send({ success: true, data: { contentId: season.content_id, season: season.season }, error: null });
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong please try again." });
  }
}

async function seriesEpisodeCreate(res, file, contentId, seasonNum, episode, requesterId) {
  try {
    // the video does not exist or was not passed in right
    if (!file) {
      return res.send({ success: false, data: null, error: "No video uploaded" });
    }
    //this will return nothing if it is not a series or no seasons exist
    const content = await query(
      `SELECT content.uploader_id, content.visibility, series_season.season, series_season.id FROM content
      JOIN series_season ON content.id = series_season.content_id
      JOIN series_episode ON series_episode.season_id = series_season.id
      WHERE content.id = ? AND series_season.season = ?`,
      [contentId, seasonNum]
    );
    if (content.length === 0) {
      return res.send({ success: false, data: null, error: "Series not found" });
    }
    // makes sure the requester is authorized to create an episode on the series
    if (content[0].uploader_id !== requesterId) {
      if (content[0].visibility === "private") {
        return res.send({ success: false, data: null, error: "Content not found" });
      }
      return res.send({ success: false, data: null, error: "Not authorized to add episodes" });
    }

    //if folder does not exist make it
    if (!fs.existsSync(VIDEO_FOLDER_PATH + contentId)) {
      fs.mkdirSync(VIDEO_FOLDER_PATH + contentId);
    }
    //if folder does not exist make it
    if (!fs.existsSync(VIDEO_FOLDER_PATH + contentId + `/${seasonNum}`)) {
      fs.mkdirSync(VIDEO_FOLDER_PATH + contentId + `/${seasonNum}`);
    }
    // if file exists then return error
    else if (fs.existsSync(VIDEO_FOLDER_PATH + contentId + `/${seasonNum}/${contentId}-${content.length + 1}.mp4`)) {
      return res.send({ success: false, data: null, error: "Something went wrong." });
    }

    const uploadPath = VIDEO_FOLDER_PATH + contentId + `/${seasonNum}/${contentId}-${content.length + 1}.mp4`;
    // saves file
    await file.mv(uploadPath);

    // adds video file to database
    const { insertId: videoId } = await query("INSERT INTO video (location) VALUES (?)", [
      `/${contentId}//${seasonNum}/${contentId}-${content.length + 1}.mp4`,
    ]);
    //adds needed keys for database
    episode.video_id = videoId;
    episode.season_id = content[0].id;
    episode.episode_number = content.length + 1;
    episode.thumbnail = "";
    // adds video info to database
    await query("INSERT INTO series_episode SET ?", [episode]);
    return res.send({ success: true, data: { contentId, season: seasonNum, episode: episode.episode_number }, error: null });
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

async function editVideoInfo(res, contentId, video, requesterId) {
  try {
    const [content] = await query("SELECT uploader_id FROM content WHERE content.id = ?");
    if (!content || content.uploader_id !== requesterId) {
      return res.send({ success: false, data: null, error: "You don't have permission to edit this video" });
    }
    await query("UPDATE content SET ? WHERE content.id = ?", [video, contentId]);
    return res.send({ success: true, data: null, error: null });
  } catch (error) {
    return res.send({ success: false, data: null, error: "Something went wrong please try again." });
  }
}

async function editEpisodeInfo(res, contentId, episode, requesterId) {
  try {
    const [content] = await query("SELECT * FROM content WHERE content.id = ?", [contentId]);
    if (!content || content.uploader_id !== requesterId) {
      return res.send({ success: false, data: null, error: "You don't have permission to edit this video" });
    }
    await query("UPDATE series_episode SET ? WHERE series_episode.episode_number = ? AND series_episode.content_id = ?", [
      episode,
      episode.episode_number,
      contentId,
    ]);
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
    filtered.forEach(
      (content) =>
        (content.uploadDate = dateFns.formatDistanceToNow(new Date(content.uploadDate), { addSuffix: true }).replace("about", ""))
    );
    return res.send({ success: true, data: filtered, error: null });
  } catch (error) {
    return res.send({ success: false, data: null, error: "Something went wrong" });
  }
}

async function thumbnail(res, contentId, requesterId) {
  try {
    const [content] = await query("SELECT visibility, uploader_id from content WHERE content.id = ?", [contentId]);
    if (content.visibility === "private") {
      if (content.uploader_id !== requesterId) {
        const resolvedPath = path.resolve("./server/assets/404/404.PNG");
        if (!fs.existsSync(resolvedPath)) {
          return res.send({ success: false, data: null, error: "No image found" });
        }
        return res.sendFile(resolvedPath);
      }
    }
    const resolvedPath = path.resolve(`${VIDEO_FOLDER_PATH}/${contentId}/${contentId}.PNG`);
    if (fs.existsSync(resolvedPath)) {
      return res.sendFile(resolvedPath);
    }
    return res.sendFile(path.resolve("./server/assets/404/404.PNG"));
  } catch (error) {
    const resolvedPath = path.resolve("./server/assets/404/404.PNG");
    if (fs.existsSync(resolvedPath)) {
      return res.sendFile(resolvedPath);
    }
    return res.send({ success: false, data: null, error: "No image found" });
  }
}

async function seriesThumbnail(res, contentId, season, requesterId) {
  try {
    const [content] = await query("SELECT visibility, uploader_id from content WHERE content.id = ?", [contentId]);
    if (content.visibility === "private") {
      if (content.uploader_id !== requesterId) {
        const resolvedPath = path.resolve("./server/assets/404/404.PNG");
        if (!fs.existsSync(resolvedPath)) {
          return res.send({ success: false, data: null, error: "No image found" });
        }
        return res.sendFile(resolvedPath);
      }
    }
    const resolvedPath = path.resolve(`${VIDEO_FOLDER_PATH}/${contentId}/${season}/${contentId}.PNG`);
    if (fs.existsSync(resolvedPath)) {
      return res.sendFile(resolvedPath);
    }
    return res.sendFile(path.resolve("./server/assets/404/404.PNG"));
  } catch (error) {
    const resolvedPath = path.resolve("./server/assets/404/404.PNG");
    if (fs.existsSync(resolvedPath)) {
      return res.sendFile(resolvedPath);
    }
    return res.send({ success: false, data: null, error: "No image found" });
  }
}

async function seriesWatchTimeSubmit(res, contentId, season, episode, userId, time) {
  try {
    const [watchedItem] = await query(
      "SELECT wt.id FROM watch_time AS wt WHERE wt.content_id = ? AND wt.season = ? AND wt.episode_num = ? AND wt.user_id = ?",
      [contentId, season, episode, userId]
    );
    if (watchedItem) {
      await query("UPDATE watch_time AS wt SET time = ? WHERE wt.id = ?", [time, watchedItem.id]);
    } else {
      await query("INSERT INTO watch_time (user_id, content_id, season, episode_num, time) VALUES(?, ?, ?, ?, ?)", [
        userId,
        contentId,
        season,
        episode,
        time,
      ]);
    }
    return res.send({ success: true, data: time, error: null });
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong." });
  }
}

async function videoWatchTimeSubmit(res, contentId, userId, time) {
  try {
    const [watchedItem] = await query("SELECT wt.id FROM watch_time AS wt WHERE wt.content_id = ? AND wt.user_id = ?", [contentId, userId]);
    if (watchedItem) {
      await query("UPDATE watch_time AS wt SET time = ? WHERE wt.id = ?", [time, watchedItem.id]);
    } else {
      await query("INSERT INTO watch_time (user_id, content_id, time) VALUES(?, ?, ?)", [userId, contentId, time]);
    }
    return res.send({ success: true, data: time, error: null });
  } catch (error) {
    console.log(error);
    return res.send({ success: false, data: null, error: "Something went wrong." });
  }
}

module.exports = {
  videoById,
  createVideo,
  createSeries,
  deleteVideo,
  editVideoInfo,
  editEpisodeInfo,
  streamVideo,
  streamSeries,
  seriesSeasonCreate,
  seriesEpisodeCreate,
  homeVideos,
  thumbnail,
  seriesThumbnail,
  seriesWatchTimeSubmit,
  videoWatchTimeSubmit,
};
