const query = require("../config/mysql.config");
const { v4: uuidv4 } = require("uuid");

async function checkUuidAvailability(uuid) {
  const [user] = await query("SELECT id from users WHERE users.id = ?", [uuid]);
  if (user) return false;
  const [content] = await query("SELECT id from content WHERE content.id = ?", [uuid]);
  if (content) return false;
  return true;
}

function generateUuid() {
  let uuid;
  do {
    uuid = uuidv4();
  } while (!checkUuidAvailability(uuid));
  return uuid;
}

module.exports = {
  generateUuid,
};
