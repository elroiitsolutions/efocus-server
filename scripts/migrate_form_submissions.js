const { pool } = require('../src/config/database');

async function migrateFormSubmissions() {
  console.log('--- Migrating form_submissions Table ---');
  
  const createTableSql = `
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
    console.log('1. Creating or verifying `form_submissions` table...');
    await pool.query(createTableSql);
    console.log('SUCCESS: `form_submissions` table is created/ready.');

    console.log('2. Inspecting table columns...');
    const [columns] = await pool.query('DESCRIBE form_submissions;');
    console.table(columns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Key: c.Key, Default: c.Default })));

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateFormSubmissions();
