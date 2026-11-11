require("dotenv").config();
const ensureSchema = require("./ensureSchema");
const pool = require("./pool");

// Creates the tables. Run it by hand with: npm run setup
// The app also runs this on every start, so this is only for a manual check.
(async () => {
  await ensureSchema();
  console.log("Database tables are ready.");
  await pool.end();
})().catch((err) => {
  console.error("Could not set up the database:", err.message);
  process.exit(1);
});
