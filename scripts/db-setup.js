const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

async function runSqlFile(connection, filePath) {
  console.log(`Executing SQL file: ${path.basename(filePath)}`);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    await connection.query(sql);
    console.log(`SQL file ${path.basename(filePath)} executed successfully.`);
  } catch (err) {
    console.error(`CRITICAL: Error executing SQL file ${path.basename(filePath)}:`);
    console.error(err.message);
    throw err;
  }
}

async function setup() {
  console.log('Database Setup Utility starting...');
  console.log(`Connecting to MySQL host: ${env.db.host}:${env.db.port} as ${env.db.user}...`);

  let connection;
  try {
    // Connect without database first, enabling multiple statements support
    connection = await mysql.createConnection({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      multipleStatements: true
    });
    console.log('Connected to MySQL server.');

    // 1. Create Database
    console.log(`Creating database '${env.db.database}' if not exists...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log('Database verification successful.');

    // 2. Select Database
    await connection.query(`USE \`${env.db.database}\``);

    // 3. Run Schema SQL
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    await runSqlFile(connection, schemaPath);

    // 4. Run Seed SQL
    const seedPath = path.join(__dirname, '../database/seed.sql');
    await runSqlFile(connection, seedPath);

    console.log('--------------------------------------------------');
    console.log('Database initialization completed successfully!');
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('CRITICAL: Database setup failed.');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

setup().catch(console.error);
