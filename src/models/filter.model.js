const { pool } = require('../config/database');

class FilterModel {
  static async findAll() {
    const query = `
      SELECT pf.*, fam.name AS family_name
      FROM product_filters pf
      INNER JOIN product_families fam ON pf.family_id = fam.id
      ORDER BY fam.name ASC, pf.filter_name ASC
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM product_filters WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findFiltersByFamilyId(familyId) {
    const [rows] = await pool.query(
      'SELECT * FROM product_filters WHERE family_id = ? ORDER BY filter_name ASC',
      [familyId]
    );
    return rows;
  }

  static async findFilterByFamilyAndName(familyId, filterName) {
    const [rows] = await pool.query(
      'SELECT * FROM product_filters WHERE family_id = ? AND filter_name = ?',
      [familyId, filterName]
    );
    return rows[0] || null;
  }

  static async findOptionsByFilterId(filterId) {
    const [rows] = await pool.query(
      'SELECT * FROM filter_options WHERE filter_id = ? ORDER BY option_value ASC',
      [filterId]
    );
    return rows;
  }

  static async findOptionByFilterAndValue(filterId, optionValue) {
    const [rows] = await pool.query(
      'SELECT * FROM filter_options WHERE filter_id = ? AND option_value = ?',
      [filterId, optionValue]
    );
    return rows[0] || null;
  }

  static async createFilter(filterData, connection = pool) {
    const { family_id, filter_name, filter_type = 'select' } = filterData;
    const [result] = await connection.query(
      'INSERT INTO product_filters (family_id, filter_name, filter_type) VALUES (?, ?, ?)',
      [family_id, filter_name, filter_type]
    );
    return result.insertId;
  }

  static async createOption(optionData, connection = pool) {
    const { filter_id, option_value } = optionData;
    const [result] = await connection.query(
      'INSERT INTO filter_options (filter_id, option_value) VALUES (?, ?)',
      [filter_id, option_value]
    );
    return result.insertId;
  }

  static async updateFilter(id, filterData) {
    const { family_id, filter_name, filter_type } = filterData;
    await pool.query(
      'UPDATE product_filters SET family_id = ?, filter_name = ?, filter_type = ? WHERE id = ?',
      [family_id, filter_name, filter_type, id]
    );
    return true;
  }

  static async deleteFilter(id) {
    const [result] = await pool.query(
      'DELETE FROM product_filters WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteOptionsByFilterId(filterId, connection = pool) {
    await connection.query(
      'DELETE FROM filter_options WHERE filter_id = ?',
      [filterId]
    );
  }
}

module.exports = FilterModel;
