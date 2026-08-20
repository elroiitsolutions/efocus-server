const mysql = require('mysql2/promise');
const env = require('./env');

console.log('Initializing MySQL connection pool with config:', {
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  database: env.db.database,
  connectionLimit: env.db.connectionLimit
});

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionLimit: env.db.connectionLimit,
  waitForConnections: env.db.waitForConnections,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

/**
 * Verifies database connectivity.
 * Returns true if successful, false if failing.
 */
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the MySQL database.');
    connection.release();
    return true;
  } catch (err) {
    console.error('CRITICAL: Database connection failed.');
    console.error(`Message: ${err.message}`);
    console.error('Please verify your .env configurations and ensure MySQL is running.');
    return false;
  }
}

module.exports = {
  pool,
  checkConnection
};
