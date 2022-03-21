const query = require("../config/mysql.config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

/**
 *
 * @param {*} res
 * @param {*} username
 * @param {*} password
 * @returns
 */
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

/**
 *
 * @param {*} res
 * @param {*} username
 * @param {*} password
 * @returns
 */
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
    let uuid;
    let open = false;
    while (!open) {
      uuid = uuidv4();
      const [user] = query("SELECT * FROM users WHERE users.id = ?", [uuid]);
      if (!user) {
        open = true;
      }
    }
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
    const videos = await query("SELECT id, type, title, upload_data, views, duration FROM content WHERE content.uploader_id = ?", [userId]);
    if (videos.length === 0) {
      return res.send({ success: true, data: null, error: "No Videos found" });
    }
    const filteredVideos = await filterUserVideos(videos, requesterId);
    return res.send({ success: true, data: filteredVideos, error: null });
  } catch (error) {
    return res.send({ success: false, data: null, error: "Something went wrong please try again later" });
  }
}

module.exports = { login, signup, videosByUserId };
