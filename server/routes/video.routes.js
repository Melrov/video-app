const express = require("express")
const { authenticate, requesterId } = require("../middleware/authenticate.middleware")
const { videoVisibilityCheck } = require("../middleware/video.middleware")
const router = express.Router()

router.get("/:contentId", [requesterId, videoVisibilityCheck], (req, res) =>{
    if(!req.params.contentId){
        return res.send({success: false, data: null, error: "Video not found"})
    }
})