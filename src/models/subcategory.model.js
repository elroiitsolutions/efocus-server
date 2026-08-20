const { pool } = require('../config/database');

class SubcategoryModel {
  static async findAll() {
    const query = `
      SELECT s.*, c.name AS category_name, c.category_no AS category_no
      FROM subcategories s
      INNER JOIN categories c ON s.category_id = c.id
      ORDER BY c.priority ASC, s.name ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT s.*, c.name AS category_name, c.category_no AS category_no
      FROM subcategories s
      INNER JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }

  static async findByNameAndCategory(name, categoryId) {
    const [rows] = await pool.query(
      'SELECT * FROM subcategories WHERE name = ? AND category_id = ?',
      [name, categoryId]
    );
    return rows[0] || null;
  }

  static async findByCategoryId(categoryId) {
    const [rows] = await pool.query(
      'SELECT * FROM subcategories WHERE category_id = ? ORDER BY name ASC',
      [categoryId]
    );
    return rows;
  }

  static async create(subcategoryData) {
    const { category_id, name, description = null } = subcategoryData;
    const [result] = await pool.query(
      'INSERT INTO subcategories (category_id, name, description) VALUES (?, ?, ?)',
      [category_id, name, description]
    );
    return result.insertId;
  }

  static async update(id, subcategoryData) {
    const { category_id, name, description } = subcategoryData;
    await pool.query(
      'UPDATE subcategories SET category_id = ?, name = ?, description = ? WHERE id = ?',
      [category_id, name, description, id]
    );
    return true;
  }

  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM subcategories WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = SubcategoryModel;
