const { pool } = require('../src/config/database');

async function main() {
  await pool.query("UPDATE products SET stock_status = 'in_stock' WHERE sku = 'HONEYWELL-XP1950'");
  await pool.query("UPDATE products SET stock_status = 'out_of_stock' WHERE sku = 'WEBSCAN-TRUCHECK'");
  console.log('Set WEBSCAN-TRUCHECK to out_of_stock and HONEYWELL-XP1950 to in_stock.');

  const [rows] = await pool.query(
    "SELECT id, sku, product_name, stock_status FROM products WHERE sku IN ('WEBSCAN-TRUCHECK', 'HONEYWELL-XP1950')"
  );
  console.log('Products:', rows);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
