require("dotenv").config();
const { Pool } = require("pg");

// A database on this computer needs no SSL. A hosted one usually does.
// Set DATABASE_SSL=true when the database lives online.
const useSsl = process.env.DATABASE_SSL === "true";

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});
