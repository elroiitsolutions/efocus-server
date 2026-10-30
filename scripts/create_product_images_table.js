const { pool } = require('../src/config/database');

async function createAndSyncProductImages() {
  try {
    // 1. Ensure primary_image column exists on products table
    const [cols] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'primary_image'
    `);

    if (cols.length === 0) {
      await pool.query('ALTER TABLE `products` ADD COLUMN `primary_image` VARCHAR(500) NULL AFTER `image_status`');
      console.log('[Migration] Added missing `primary_image` column to `products` table.');
    } else {
      console.log('[Migration] Column `primary_image` already exists on `products`.');
    }

    // 2. Ensure product_images table exists
    const tableSql = `
      CREATE TABLE IF NOT EXISTS \`product_images\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`product_id\` INT NOT NULL,
        \`image_url\` VARCHAR(500) NOT NULL,
        \`is_primary\` BOOLEAN DEFAULT FALSE,
        \`sort_order\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_product_images_product_id\` (\`product_id\`),
        CONSTRAINT \`fk_product_images_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(tableSql);
    console.log('[Migration] Ensured `product_images` table exists in MySQL.');

    // 3. Check count of product_images
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM product_images');
    console.log(`[Migration] product_images table currently has ${count} records.`);

  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    process.exit(0);
  }
}

createAndSyncProductImages();
