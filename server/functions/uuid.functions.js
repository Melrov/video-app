const query = require("../config/mysql.config");

async function checkUuidAvailability(uuid) {
  const [user] = await query("SELECT id from users WHERE users.id = ?", [uuid]);
  if (user) return false;
  const [content] = await query("SELECT id from content WHERE content.id = ?", [uuid]);
  if (content) return false;
  return true;
}

module.exports = {
    checkUuidAvailability
}