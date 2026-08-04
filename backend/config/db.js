// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

function getEnvCert() {
  if (!process.env.AIVEN_CA) return null;
  return process.env.AIVEN_CA.replace(/\\n/g, '\n');
}

const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// SSL handling: prefer AIVEN_CA for secure connection
const caPem = getEnvCert();
if (caPem) {
  connectionConfig.ssl = {
    ca: caPem,
    rejectUnauthorized: true
  };
} else if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') {
  // explicit disable (not recommended)
} else {
  // fallback to non-strict ssl (previous behavior)
  connectionConfig.ssl = { rejectUnauthorized: false };
}

// Use a pool for robustness
const db = mysql.createPool(connectionConfig);

// quick connection test and log
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to DB');
    connection.release();
  }
});

module.exports = db;