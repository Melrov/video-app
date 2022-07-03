const mysql = require("mysql");
const util = require("util");
const test = process.env.TEST

const pool = mysql.createPool({
  connectionLimit: 10,
  host: test ? process.env.TEST_DB_HOST: process.env.DB_HOST,
  user: test ? process.env.TEST_DB_USER : process.env.DB_USER,
  password: test ? process.env.TEST_DB_PASSWORD : process.env.DB_PASSWORD,
  database: test ? process.env.TEST_DB_DATABASE : process.env.DB_DATABASE,
  port: test ? process.env.TEST_DB_PORT : process.env.DB_PORT,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log(err.code);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
  }

  if (connection) connection.release();
  return;
});

const query = util.promisify(pool.query).bind(pool);

module.exports = query;
