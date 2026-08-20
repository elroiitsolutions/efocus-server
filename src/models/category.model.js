const { pool } = require('../config/database');

class CategoryModel {
  static async findAll() {
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(p.id) AS product_count 
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.priority ASC, c.name ASC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByCategoryNo(categoryNo) {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE category_no = ?',
      [categoryNo]
    );
    return rows[0] || null;
  }

  static async create(categoryData) {
    const { category_no, name, priority = 0, description = null } = categoryData;
    const [result] = await pool.query(
      'INSERT INTO categories (category_no, name, priority, description) VALUES (?, ?, ?, ?)',
      [category_no, name, priority, description]
    );
    return result.insertId;
  }

  static async update(id, categoryData) {
    const { category_no, name, priority, description } = categoryData;
    await pool.query(
      'UPDATE categories SET category_no = ?, name = ?, priority = ?, description = ? WHERE id = ?',
      [category_no, name, priority, description, id]
    );
    return true;
  }

  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
  /**
   * Returns the full navigation tree for the mega-menu:
   * categories → subcategories, plus a few featured products per category.
   * All in two efficient queries instead of N+1.
   */
  static async getNavigationTree() {
    // 1. Get all categories with their subcategories
    const categoriesQuery = `
      SELECT c.id AS category_id, c.category_no, c.name AS category_name,
             c.description AS category_description, c.priority,
             s.id AS subcategory_id, s.name AS subcategory_name, s.description AS subcategory_description
      FROM categories c
      LEFT JOIN subcategories s ON s.category_id = c.id
      ORDER BY c.priority ASC, c.name ASC, s.name ASC
    `;
    const [catRows] = await pool.query(categoriesQuery);

    // 2. Get up to 3 featured products per category (latest ones)
    const productsQuery = `
      SELECT p.id, p.sku, p.product_name, p.brand, p.category_id,
             c.name AS category_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id IN (
        SELECT id FROM (
          SELECT id, category_id,
                 ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY id DESC) AS rn
          FROM products
        ) ranked
        WHERE rn <= 20
      )
      ORDER BY p.category_id ASC, p.id DESC
    `;
    const [prodRows] = await pool.query(productsQuery);

    // 3. Get up to 3 featured products per subcategory (latest ones)
    const subcategoryProductsQuery = `
      SELECT p.id, p.sku, p.product_name, p.brand, p.subcategory_id
      FROM products p
      WHERE p.id IN (
        SELECT id FROM (
          SELECT id, subcategory_id,
                 ROW_NUMBER() OVER (PARTITION BY subcategory_id ORDER BY id DESC) AS rn
          FROM products
        ) ranked
        WHERE rn <= 20
      )
      ORDER BY p.subcategory_id ASC, p.id DESC
    `;
    const [subProdRows] = await pool.query(subcategoryProductsQuery);

    // 4. Assemble the tree
    const categoriesMap = new Map();

    for (const row of catRows) {
      if (!categoriesMap.has(row.category_id)) {
        categoriesMap.set(row.category_id, {
          id: row.category_id,
          category_no: row.category_no,
          name: row.category_name,
          description: row.category_description,
          priority: row.priority,
          subcategories: [],
          featured_products: []
        });
      }

      if (row.subcategory_id) {
        const cat = categoriesMap.get(row.category_id);
        // Avoid duplicate subcategories
        if (!cat.subcategories.find(s => s.id === row.subcategory_id)) {
          cat.subcategories.push({
            id: row.subcategory_id,
            name: row.subcategory_name,
            description: row.subcategory_description,
            featured_products: []
          });
        }
      }
    }

    // Add category-level featured products
    for (const prod of prodRows) {
      const cat = categoriesMap.get(prod.category_id);
      if (cat) {
        cat.featured_products.push({
          id: prod.id,
          sku: prod.sku,
          product_name: prod.product_name,
          brand: prod.brand
        });
      }
    }

    // Map subcategories for easy access
    const subcategoriesMap = new Map();
    for (const cat of categoriesMap.values()) {
      for (const sub of cat.subcategories) {
        subcategoriesMap.set(sub.id, sub);
      }
    }

    // Add subcategory-level featured products
    for (const prod of subProdRows) {
      const sub = subcategoriesMap.get(prod.subcategory_id);
      if (sub) {
        sub.featured_products.push({
          id: prod.id,
          sku: prod.sku,
          product_name: prod.product_name,
          brand: prod.brand
        });
      }
    }

    return Array.from(categoriesMap.values());
  }
}

module.exports = CategoryModel;
