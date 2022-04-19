const query = require("../config/mysql.config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { filterUserVideos } = require("../functions/video.functions");
const { generateUuid } = require("../functions/uuid.functions")

async function login(res, username, password) {
  try {
    const [user] = await query("SELECT * FROM users WHERE users.username = ?", [username]);
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
        return res
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .send({
            success: true,
            data: user.username,
            error: null,
          });
      } else {
        return res.send({
          success: false,
          data: null,
          error: "Invalid username or password",
        });
      }
    }
    return res.send({
      success: false,
      data: null,
      error: "Invalid username or password",
    });
  } catch (error) {
    console.log(error);
    return res.send({
      success: false,
      data: null,
      error: "Something went wrong please try again later.",
    });
  }
}

async function signup(res, username, password) {
  try {
    const [user] = await query("SELECT * FROM users WHERE users.username = ?", [username]);
    if (user) {
      return res.send({
        success: false,
        data: null,
        error: "Username already in use",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const uuid = generateUuid()
    
    await query("INSERT INTO users (id, username, password) VALUE (?, ?, ?)", [uuid, username, hash]);
    return res.send({ success: true, data: null, error: null });
  } catch (error) {
    console.log(error);
    return res.send({
      success: false,
      data: null,
      error: "Something went wrong please try again later.",
    });
  }
}

async function videosByUserId(res, userId, requesterId) {
  try {
      const [user] = await query("SELECT users.username FROM users WHERE users.id = ?", [userId])
      if(!user){
          return res.send({success: false, data: null, error: "No user found"})
      }
    const videos = await query(
      `SELECT content.id, content.type, content.title, content.upload_date, content.views,
       content.uploader_id, content.duration, content.visibility, content.thumbnail, users.username
       FROM content JOIN users ON content.uploader_id = users.id WHERE content.uploader_id = ?`,
      [userId]
    );
    const filteredVideos = await filterUserVideos(videos, requesterId);
    return res.send({ success: true, data: filteredVideos, error: null });
  } catch (error) {
    return res.send({ success: false, data: null, error: "Something went wrong please try again later" });
  }
}

module.exports = { login, signup, videosByUserId };
