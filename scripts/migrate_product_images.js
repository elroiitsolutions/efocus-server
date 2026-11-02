const { pool } = require('../src/config/database');
const { getProductPrimaryImage, getProductThumbnails } = require('./productImageMatcher');

async function migrateProductImages() {
  console.log('==================================================');
  console.log('🚀 Starting Product Images Migration to Database...');
  console.log('==================================================');

  // 1. Ensure `primary_image` column exists on `products`
  const [columns] = await pool.query("SHOW COLUMNS FROM products LIKE 'primary_image'");
  if (columns.length === 0) {
    console.log('➕ Adding `primary_image` column to `products` table...');
    await pool.query("ALTER TABLE products ADD COLUMN primary_image VARCHAR(500) NULL AFTER image_status");
  } else {
    console.log('✔ `primary_image` column verified in `products`.');
  }

  // 2. Ensure `product_images` table exists
  console.log('✔ Ensuring `product_images` table exists...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      is_primary BOOLEAN DEFAULT FALSE,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_product_images_product_id (product_id),
      CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. Clear existing product_images to perform a clean and accurate seed
  await pool.query('DELETE FROM product_images');
  console.log('✔ Cleaned existing product_images table.');

  // 4. Fetch all products with relational hierarchy
  const [products] = await pool.query(`
    SELECT p.id, p.sku, p.catalog_number, p.product_name, p.brand,
           c.name AS category_name,
           s.name AS subcategory_name,
           pf.name AS family_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN product_families pf ON p.family_id = pf.id
    ORDER BY p.id ASC
  `);

  console.log(`📦 Found ${products.length} products to process.`);

  let updatedProductsCount = 0;
  let galleryEntriesCount = 0;

  for (const prod of products) {
    const primaryImg = getProductPrimaryImage(prod);
    const thumbnails = getProductThumbnails(prod);

    // Update primary_image on products table
    await pool.query('UPDATE products SET primary_image = ? WHERE id = ?', [primaryImg, prod.id]);
    updatedProductsCount++;

    // Insert primary image into product_images
    await pool.query(
      'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, TRUE, 0)',
      [prod.id, primaryImg]
    );
    galleryEntriesCount++;

    // Insert additional thumbnail / gallery images
    let sortOrder = 1;
    for (const thumb of thumbnails) {
      if (thumb && thumb !== primaryImg) {
        await pool.query(
          'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, FALSE, ?)',
          [prod.id, thumb, sortOrder]
        );
        galleryEntriesCount++;
        sortOrder++;
      }
    }
  }

  console.log('--------------------------------------------------');
  console.log(`✅ Successfully updated ${updatedProductsCount} products with primary_image in MySQL.`);
  console.log(`✅ Successfully created ${galleryEntriesCount} entries in product_images table in MySQL.`);
  console.log('--------------------------------------------------');

  // Sample check
  const [sample] = await pool.query(`
    SELECT p.id, p.sku, p.product_name, p.primary_image,
           (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.id) as total_gallery_images
    FROM products p
    LIMIT 6
  `);
  console.log('\n🔎 Sample Migrated Products:');
  console.table(sample);

  return { updatedProductsCount, galleryEntriesCount };
}

if (require.main === module) {
  migrateProductImages()
    .then(() => {
      console.log('🎉 Product images migration finished successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { migrateProductImages };
