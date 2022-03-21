const express = require("express")
const { login, signup, videosByUserId } = require("../models/user.model")
const { authenticate, requesterId } = require("../middleware/authenticate.middleware");
const router = express.Router()

router.get("/verify",authenticate, (req, res) => {
    return res.send({success: true, data: {username: req.user.username}, error: null})
})

router.get("/logout", (req, res) => {
    res.clearCookie("access_token")
    return res.send({success: true, data: null, error: null})
})

router.post("/login", (req, res) => {
    if(!req.body.username || !req.body.password){
        return req.send({success: false, data: null, error: "Invalid data provided"})
    }
    login(res, req.body.username, req.body.password)
})

router.put("/signup", (req, res) => {
    console.log(req.body)
    if(!req.body.username || !req.body.password){
        return res.send({success: false, data: null, error: "Invalid data provided"})
    }
    signup(res, req.body.username, req.body.password)
})

router.get("/:userId", requesterId, (req, res) => {
    if(!req.params.userId){
        return res.send({success: false, data: null, error: null})
    }
    videosByUserId(res, req.params.userId, req.user.id)
})

module.exports = router