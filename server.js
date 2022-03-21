require("dotenv").config();
const express = require("express");
const cookieparser = require("cookie-parser");
const passport = require("./server/config/passport.config");

const fileUpload = require('express-fileupload');

const userRouter = require("./server/routes/user.routes")
const videoRouter = require("./server/routes/video.routes")
const uploadRouter = require("./server/routes/upload.routes")

const app = express();
const SERVER_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(__dirname + "/build"));
app.use(cookieparser());
app.use(passport.initialize());
// Todo maybe change it to use temp file instead of memory
// app.use(fileUpload({
//   useTempFiles : true,
//   tempFileDir : __dirname + '/tmp/'
// }));
app.use(fileUpload());

app.use("/api/user", userRouter)
app.use("/api/video", videoRouter)
//app.use("/api/upload", uploadRouter)


app.get("*", (req, res) => {
  return res.sendFile("/build/index.html", { root: __dirname + "/" });
});

app.listen(SERVER_PORT, () => {
  console.log(`Example app listening on port ${SERVER_PORT}!`);
});
