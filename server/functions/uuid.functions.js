const query = require("../config/mysql.config");
const { v4: uuidv4 } = require("uuid");

async function checkUuidAvailability(uuid, type) {
  try {
    if (type === "user") {
      const [user] = await query("SELECT id from users WHERE users.id = ?", [uuid]);
      if (user) return false;
    } else if (type === "content") {
      const [content] = await query("SELECT id from content WHERE content.id = ?", [uuid]);
      if (content) return false;
    }
    return true;
  } catch (error) {
    return true;
  }
}

/**
 *
 * @param {string} type either "user" or "content"
 * @returns
 */
function generateUuid(type) {
  let uuid;
  do {
    uuid = uuidv4();
  } while (!checkUuidAvailability(uuid, type));
  return uuid;
}

module.exports = {
  generateUuid,
};
