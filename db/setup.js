require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const pool = require("./pool");

// Creates the tables from schema.sql. Safe to run more than once.
(async () => {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("Database tables are ready.");
  await pool.end();
})().catch((err) => {
  console.error("Could not set up the database:", err.message);
  process.exit(1);
});
