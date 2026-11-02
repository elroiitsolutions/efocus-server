const { pool } = require('./database');

/**
 * Automatically ensures that all required tables (including form_submissions)
 * exist with the latest columns whenever the server starts.
 * This guarantees zero manual migration needed on fresh deployments.
 */
async function ensureTables() {
  const sql = `
    CREATE TABLE IF NOT EXISTS \`form_submissions\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`reference_no\` VARCHAR(50) NOT NULL UNIQUE,
      \`form_name\` VARCHAR(150) NOT NULL,
      \`form_type\` VARCHAR(60) NOT NULL,
      \`category_group\` ENUM('procurement', 'industry', 'service', 'quote', 'general') DEFAULT 'procurement',
      \`name\` VARCHAR(255) NULL,
      \`company_name\` VARCHAR(255) NULL,
      \`email\` VARCHAR(255) NOT NULL,
      \`phone\` VARCHAR(50) NULL,
      \`subject\` VARCHAR(255) NULL,
      \`requirement_type\` VARCHAR(100) NULL,
      \`delivery_timeline\` VARCHAR(100) NULL,
      \`target_brands\` VARCHAR(255) NULL,
      \`part_numbers\` TEXT NULL,
      \`skus\` TEXT NULL,
      \`quantity\` VARCHAR(100) NULL,
      \`estimated_value\` VARCHAR(100) NULL,
      \`message\` TEXT NULL,
      \`attachment_url\` VARCHAR(500) NULL,
      \`attachment_name\` VARCHAR(255) NULL,
      \`attachment_size\` INT NULL,
      \`attachment_mime\` VARCHAR(100) NULL,
      \`form_data\` JSON NULL,
      \`status\` ENUM('new', 'under_review', 'quote_sent', 'won', 'lost', 'closed') DEFAULT 'new',
      \`priority\` ENUM('normal', 'high', 'urgent') DEFAULT 'normal',
      \`assigned_to\` VARCHAR(100) NULL,
      \`internal_notes\` TEXT NULL,
      \`ip_address\` VARCHAR(45) NULL,
      \`user_agent\` VARCHAR(255) NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_form_name\` (\`form_name\`),
      INDEX \`idx_form_type\` (\`form_type\`),
      INDEX \`idx_category_group\` (\`category_group\`),
      INDEX \`idx_status\` (\`status\`),
      INDEX \`idx_email\` (\`email\`),
      INDEX \`idx_company\` (\`company_name\`),
      INDEX \`idx_created_at\` (\`created_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(sql);
    console.log('[Auto-Init] Verified and ensured `form_submissions` table exists.');

    // Check if reference_no column exists in case an older table definition was present
    const [cols] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'form_submissions' 
        AND COLUMN_NAME = 'reference_no'
    `);

    if (cols.length === 0) {
      console.log('[Auto-Init] Older form_submissions table detected. Running safe schema upgrade...');
      await pool.query(`
        ALTER TABLE \`form_submissions\` 
        ADD COLUMN \`reference_no\` VARCHAR(50) NOT NULL UNIQUE AFTER \`id\`,
        ADD COLUMN \`category_group\` ENUM('procurement', 'industry', 'service', 'quote', 'general') DEFAULT 'procurement' AFTER \`form_type\`,
        ADD COLUMN \`requirement_type\` VARCHAR(100) NULL AFTER \`subject\`,
        ADD COLUMN \`delivery_timeline\` VARCHAR(100) NULL AFTER \`requirement_type\`,
        ADD COLUMN \`target_brands\` VARCHAR(255) NULL AFTER \`delivery_timeline\`,
        ADD COLUMN \`estimated_value\` VARCHAR(100) NULL AFTER \`quantity\`,
        ADD COLUMN \`attachment_size\` INT NULL AFTER \`attachment_name\`,
        ADD COLUMN \`attachment_mime\` VARCHAR(100) NULL AFTER \`attachment_size\`,
        ADD COLUMN \`priority\` ENUM('normal', 'high', 'urgent') DEFAULT 'normal' AFTER \`status\`,
        ADD COLUMN \`assigned_to\` VARCHAR(100) NULL AFTER \`priority\`,
        ADD COLUMN \`internal_notes\` TEXT NULL AFTER \`assigned_to\`,
        ADD COLUMN \`user_agent\` VARCHAR(255) NULL AFTER \`ip_address\`;
      `);
      console.log('[Auto-Init] Table upgraded with all extended columns successfully.');
    }

    // 2. Ensure product_images table exists
    await pool.query(`
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
    `);

    // 3. Ensure primary_image column exists on products
    const [pCols] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'primary_image'
    `);
    if (pCols.length === 0) {
      await pool.query('ALTER TABLE `products` ADD COLUMN `primary_image` VARCHAR(500) NULL AFTER `image_status`');
    }

    // 4. Seed product_images if table is empty
    const [[{ imgCount }]] = await pool.query('SELECT COUNT(*) as imgCount FROM `product_images`');
    if (imgCount === 0) {
      console.log('[Auto-Init] `product_images` table is empty. Automatically migrating authentic images...');
      const { migrateProductImages } = require('../../scripts/migrate_product_images');
      await migrateProductImages();
    }
  } catch (err) {
    console.error('[Auto-Init] Warning: Could not auto-initialize tables:', err.message);
  }
}

module.exports = { ensureTables };
