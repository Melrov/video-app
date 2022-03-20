require("dotenv").config();
const express = require("express");
const cookieparser = require("cookie-parser");
const passport = require("./server/config/passport.config");

//route imports

const app = express();
const SERVER_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(__dirname + "/build"));
app.use(cookieparser());
app.use(passport.initialize());

//use routes

app.get("*", (req, res) => {
  return res.sendFile("/build/index.html", { root: __dirname + "/" });
});

app.listen(SERVER_PORT, () => {
  console.log(`Example app listening on port ${SERVER_PORT}!`);
});
