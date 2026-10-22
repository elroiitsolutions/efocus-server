import { pool } from '../../src/config/database';
import { getProductPrimaryImage, getProductThumbnails } from '../../../client/src/features/products/utils/productImages';

async function migrateProductImages() {
  console.log('🚀 Starting Product Images Migration...');

  // 1. Ensure `primary_image` column exists on `products`
  const [columns]: any = await pool.query("SHOW COLUMNS FROM products LIKE 'primary_image'");
  if (columns.length === 0) {
    console.log('➕ Adding `primary_image` column to `products` table...');
    await pool.query("ALTER TABLE products ADD COLUMN primary_image VARCHAR(500) NULL AFTER image_status");
  } else {
    console.log('✔ `primary_image` column already exists in `products`.');
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
      CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Clear existing product_images to do a clean seed
  await pool.query('DELETE FROM product_images');

  // 3. Fetch all products with relational context needed by productImages matcher
  const [products]: any = await pool.query(`
    SELECT p.id, p.sku, p.catalog_number, p.product_name, p.brand,
           c.name AS category_name,
           s.name AS subcategory_name,
           pf.name AS family_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    LEFT JOIN product_families pf ON p.family_id = pf.id
  `);

  console.log(`📦 Found ${products.length} products to process.`);

  let updatedCount = 0;
  let galleryEntriesCount = 0;

  for (const prod of products) {
    const primaryImg = getProductPrimaryImage(prod);
    const thumbnails = getProductThumbnails(prod);

    // Update primary_image on products table
    await pool.query('UPDATE products SET primary_image = ? WHERE id = ?', [primaryImg, prod.id]);
    updatedCount++;

    // Insert primary image into product_images
    await pool.query(
      'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, TRUE, 0)',
      [prod.id, primaryImg]
    );
    galleryEntriesCount++;

    // Insert any additional thumbnail/gallery images
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

  console.log(`✅ Successfully updated ${updatedCount} products with primary images.`);
  console.log(`✅ Successfully created ${galleryEntriesCount} entries in product_images table.`);

  // Sample check
  const [sample]: any = await pool.query(`
    SELECT id, sku, product_name, primary_image FROM products LIMIT 5
  `);
  console.log('\n🔎 Sample Migrated Products:');
  console.table(sample);

  process.exit(0);
}

migrateProductImages().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
