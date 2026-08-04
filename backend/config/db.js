// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// If you provide the Aiven CA certificate (PEM) in an env var, use it:
if (process.env.AIVEN_CA) {
  connectionConfig.ssl = {
    ca: process.env.AIVEN_CA,
    rejectUnauthorized: true
  };
} else if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') {
  // explicit disable (not recommended for production)
  // leave no ssl config
} else {
  // by default, allow non-strict SSL (matches previous behavior)
  connectionConfig.ssl = { rejectUnauthorized: false };
}

const db = mysql.createPool(connectionConfig);

// Quick connection test and log
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to DB');
    connection.release();
  }
});

module.exports = db;