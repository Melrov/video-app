const passport = require("passport");
const { Strategy } = require("passport-jwt");
const query = require("./mysql.config");

const cookieJWTExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.access_token;
  }
  return null;
};

const opts = {
  jwtFromRequest: cookieJWTExtractor,
  secretOrKey: process.env.SECRET_KEY,
};

passport.use(
  "jwt",
  new Strategy(opts, async function (jwt_payload, done) {
    try {
      if (!jwt_payload || !jwt_payload.uuid) {
        return done(null, false, "Invalid Credentials");
      }
      const [user] = await query("SELECT * from users WHERE user.uuid = ?", [jwt_payload.uuid]);
      if (!user) {
        return done(null, false, "Invalid Credentials");
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

module.exports = passport;
