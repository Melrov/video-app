const express = require("express");
const { authenticate, requesterId } = require("../middleware/authenticate.middleware");
const { videoVisibilityCheck, uploadCheck } = require("../middleware/video.middleware");
const { videoById, createVideo, deleteVideo } = require("../models/video.model");
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

module.exports = router;
