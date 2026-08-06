// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_SSL_CA
} = process.env;

const connectionConfig = {
  host: DB_HOST || 'localhost',
  port: DB_PORT ? Number(DB_PORT) : 3306,
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
  database: DB_NAME || 'restaurant_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// If Aiven requires SSL, DB_SSL_CA should contain the PEM text.
// Support either literal newlines or escaped "\n" sequences.
if (DB_SSL_CA) {
  connectionConfig.ssl = {
    ca: DB_SSL_CA.includes('\\n') ? DB_SSL_CA.replace(/\\n/g, '\n') : DB_SSL_CA
  };
}

const pool = mysql.createPool(connectionConfig);

// Export the pool with the same API your code expects (pool.query)
module.exports = pool;