const express = require("express");
const { authenticate, requesterId } = require("../middleware/authenticate.middleware");
const { videoVisibilityCheck, uploadCheck, editInputCheck } = require("../middleware/video.middleware");
const {
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
} = require("../models/video.model");
const router = express.Router();

//50 * 1024 * 1024 is 50 mb
router.put("/create", [authenticate, uploadCheck], (req, res) => {
  let video = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    visibility: req.body.visibility,
    uploader_id: req.user.id,
  };
  if (video.type === "series") {
    createSeries(res, video)
  } else {
    createVideo(res, req.files.videoFile, req.files.thumbnail, video);
  }
});

// season create for series
router.put("/season/create/:contentId", [authenticate], (req, res) => {
  if (!req.body.title || !req.body.description || !req.body.season || !req.params.contentId) {
    return res.send({ success: false, data: null, error: "Invalid data provided" });
  }
  const season = {
    title: req.body.title,
    description: req.body.description,
    season: req.body.season,
    content_id: req.params.contentId,
  };
  seriesSeasonCreate(res, season, req.user.id);
});

// episode create for season
router.put("/episode/create/:season/:contentId", [authenticate], (req, res) => {
  if (!req.body.title || !req.body.description) {
    return res.send({ success: false, data: null, error: "Invalid data provided" });
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.send({ success: false, data: null, error: "No files were uploaded" });
  }
  if(!req.files.videoFile){
    return res.send({ success: false, data: null, error: "Please upload a video" });
  }
  let episode = {
    title: req.body.title,
    description: req.body.description,
  };
  seriesEpisodeCreate(res, req.files.videoFile, req.params.contentId, req.params.season, episode, req.user.id);
});

// delete for the entire content including all episodes if series fix later
router.delete("/delete", [authenticate], (req, res) => {
  if (!req.body.contentId) {
  }
  deleteVideo(res, req.body.contentId, req.user.id);
});

router.patch("/editVideoInfo", [authenticate, editInputCheck], (req, res) => {
  let video = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    visibility: req.body.visibility,
  };
  editVideoInfo(res, req.body.contentId, video, req.user.id);
});

router.patch("/editEpisodeInfo", [authenticate, editInputCheck], (req, res) => {
  if (!req.body.episode) {
    return res.send({ success: false, data: null, error: null });
  }
  let episode = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    visibility: req.body.visibility,
    episode_number: req.body.episode,
  };
  editEpisodeInfo(res, req.body.contentId, episode, req.user.id);
});

router.get("/stream/:contentId", [requesterId], (req, res) => {
  streamVideo(res, req.params.contentId, req.user.id);
});

router.get("/stream/:contentId/:season/:episodeNum", [requesterId], (req, res) => {
  streamSeries(res, req.params.contentId, req.params.season, req.params.episodeNum, req.user.id);
});

router.get("/home", [requesterId], (req, res) => {
  homeVideos(res, req.user.id);
});

router.get("/thumbnail/:contentId", [requesterId], (req, res) => {
  thumbnail(res, req.params.contentId, req.user.id);
});

router.get("/:contentId", [requesterId, videoVisibilityCheck], (req, res) => {
  videoById(res, req.params.contentId, req.user.id);
});

module.exports = router;
