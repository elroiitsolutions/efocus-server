const { pool } = require('../config/database');

class FamilyModel {
  static async findAll() {
    const query = `
      SELECT pf.*, s.name AS subcategory_name, c.name AS category_name, c.id AS category_id,
             COUNT(p.id) AS product_count
      FROM product_families pf
      INNER JOIN subcategories s ON pf.subcategory_id = s.id
      INNER JOIN categories c ON s.category_id = c.id
      LEFT JOIN products p ON p.family_id = pf.id
      GROUP BY pf.id
      ORDER BY c.priority DESC, c.category_no ASC, s.name ASC, pf.name ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT pf.*, s.name AS subcategory_name, c.name AS category_name, c.id AS category_id
      FROM product_families pf
      INNER JOIN subcategories s ON pf.subcategory_id = s.id
      INNER JOIN categories c ON s.category_id = c.id
      WHERE pf.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }

  static async findByNameAndSubcategory(name, subcategoryId) {
    const [rows] = await pool.query(
      'SELECT * FROM product_families WHERE name = ? AND subcategory_id = ?',
      [name, subcategoryId]
    );
    return rows[0] || null;
  }

  static async findBySubcategoryId(subcategoryId) {
    const [rows] = await pool.query(
      'SELECT * FROM product_families WHERE subcategory_id = ? ORDER BY name ASC',
      [subcategoryId]
    );
    return rows;
  }

  static async create(familyData) {
    const { subcategory_id, name, description = null } = familyData;
    const [result] = await pool.query(
      'INSERT INTO product_families (subcategory_id, name, description) VALUES (?, ?, ?)',
      [subcategory_id, name, description]
    );
    return result.insertId;
  }

  static async update(id, familyData) {
    const { subcategory_id, name, description } = familyData;
    await pool.query(
      'UPDATE product_families SET subcategory_id = ?, name = ?, description = ? WHERE id = ?',
      [subcategory_id, name, description, id]
    );
    return true;
  }

  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM product_families WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = FamilyModel;
