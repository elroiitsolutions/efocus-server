const { pool } = require('../src/config/database');

async function createFormSubmissionsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS \`form_submissions\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`form_name\` VARCHAR(100) NOT NULL,
      \`form_type\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(255) NULL,
      \`email\` VARCHAR(255) NOT NULL,
      \`company_name\` VARCHAR(255) NULL,
      \`phone\` VARCHAR(50) NULL,
      \`subject\` VARCHAR(255) NULL,
      \`message\` TEXT NULL,
      \`part_numbers\` TEXT NULL,
      \`skus\` TEXT NULL,
      \`quantity\` VARCHAR(100) NULL,
      \`attachment_url\` VARCHAR(500) NULL,
      \`attachment_name\` VARCHAR(255) NULL,
      \`form_data\` JSON NULL,
      \`status\` ENUM('new', 'contacted', 'quoted', 'closed') DEFAULT 'new',
      \`ip_address\` VARCHAR(45) NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_form_name\` (\`form_name\`),
      INDEX \`idx_form_type\` (\`form_type\`),
      INDEX \`idx_email\` (\`email\`),
      INDEX \`idx_created_at\` (\`created_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    console.log('Running CREATE TABLE IF NOT EXISTS for form_submissions...');
    await pool.query(sql);
    console.log('SUCCESS: `form_submissions` table is ready.');

    const [desc] = await pool.query('DESCRIBE form_submissions;');
    console.log('Table structure:');
    console.table(desc.map(d => ({ Field: d.Field, Type: d.Type, Null: d.Null, Key: d.Key })));

    process.exit(0);
  } catch (error) {
    console.error('FAILED to create form_submissions table:', error);
    process.exit(1);
  }
}

createFormSubmissionsTable();
