require("dotenv").config();
const { Pool } = require("pg");

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "loaded" : "MISSING");