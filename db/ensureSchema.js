const fs = require("node:fs");
const path = require("node:path");
const pool = require("./pool");

let finished = null;

// Creates the tables from schema.sql when they are missing.
// Safe to call many times, so a hosted server can run it on every start.
function ensureSchema() {
  if (!finished) {
    const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    finished = pool.query(sql).catch((err) => {
      finished = null;
      throw err;
    });
  }
  return finished;
}

module.exports = ensureSchema;
