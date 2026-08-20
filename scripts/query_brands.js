const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:/EFOCUS_ECOMMERCE/server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'efocus_ecommerce'
};

async function run() {
  console.log('Connecting to database with config:', dbConfig);
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected!');

    // Query 1: Get subcategory names and their distinct product brands
    const [rows] = await connection.query(`
      SELECT s.name AS subcategory_name, p.brand, COUNT(*) AS product_count
      FROM products p
      INNER JOIN subcategories s ON p.subcategory_id = s.id
      GROUP BY s.name, p.brand
      ORDER BY s.name, p.brand
    `);

    console.log('\n--- Distinct Brands by Subcategory ---');
    const mapping = {};
    for (const row of rows) {
      if (!mapping[row.subcategory_name]) {
        mapping[row.subcategory_name] = [];
      }
      mapping[row.subcategory_name].push(row.brand);
    }
    console.log(JSON.stringify(mapping, null, 2));

    // Query 2: Get all categories, subcategories and their brands to see if any are empty
    const [allSubs] = await connection.query(`
      SELECT c.name AS category_name, s.name AS subcategory_name
      FROM subcategories s
      INNER JOIN categories c ON s.category_id = c.id
      ORDER BY c.name, s.name
    `);
    
    console.log('\n--- All Subcategories ---');
    console.log(allSubs);

  } catch (err) {
    console.error('Error running script:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

run();
