const express = require("express");
const { authenticate, requesterId } = require("../middleware/authenticate.middleware");
const { videoVisibilityCheck, uploadCheck, editInputCheck } = require("../middleware/video.middleware");
const { videoById, createVideo, deleteVideo, editVideoInfo, editEpisodeInfo } = require("../models/video.model");
const router = express.Router();

router.get("/:contentId", [requesterId, videoVisibilityCheck], (req, res) => {
  videoById(res, req.params.contentId);
});

//50 * 1024 * 1024 is 50 mb
router.put("/create", [authenticate, uploadCheck], (req, res) => {
  let video = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    visibility: req.body.visibility,
    uploader_id: req.user.id,
  };
  createVideo(res, req.files, video);
});

router.delete("/delete", [authenticate], (req, res) => {
    if(!req.body.contentId){

    }
    deleteVideo(res, req.body.contentId, req.user.id)
});

router.patch("/editVideoInfo", [authenticate, editInputCheck], (req, res) => {
  let video = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    visibility: req.body.visibility
  };
  editVideoInfo(res, req.body.contentId, video, req.user.id)
})

router.patch("/editEpisodeInfo", [authenticate, editInputCheck], (req, res) => {
  if(!req.body.episode){
    return res.send({success: false, data: null, error: null})
  }
  let episode = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    visibility: req.body.visibility,
    episode_number: req.body.episode,
  };
  editEpisodeInfo(res, req.body.contentId, episode, req.user.id)
})

module.exports = router;
