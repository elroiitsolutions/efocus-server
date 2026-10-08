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

  static async findFiltersByContext({ category, subcategory, family }) {
    let familyIds = [];

    if (family) {
      const famTerms = family.toString().split(',').map(f => f.trim()).filter(Boolean);
      const [famRows] = await pool.query('SELECT id, name FROM product_families');
      for (const term of famTerms) {
        const famIdInt = parseInt(term, 10);
        if (!isNaN(famIdInt) && famIdInt.toString() === term) {
          familyIds.push(famIdInt);
        } else {
          const simplified = term.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matched = famRows.filter(f =>
            f.name.toLowerCase() === term.toLowerCase() ||
            f.name.toLowerCase().replace(/[^a-z0-9]/g, '') === simplified
          );
          familyIds.push(...matched.map(r => r.id));
        }
      }
      familyIds = [...new Set(familyIds)];
    } else if (subcategory) {
      const subTerms = subcategory.split(',').map(s => s.trim()).filter(Boolean);
      const [subRows] = await pool.query('SELECT id, name FROM subcategories');
      const matchedSubIds = [];
      for (const t of subTerms) {
        const tId = parseInt(t, 10);
        if (!isNaN(tId)) {
          matchedSubIds.push(tId);
        } else {
          const targetSimplified = t.toLowerCase().replace(/[^a-z0-9]/g, '');
          const matched = subRows.filter(s => 
            s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === targetSimplified
          );
          matchedSubIds.push(...matched.map(m => m.id));
        }
      }
      if (matchedSubIds.length > 0) {
        const [famRows] = await pool.query(
          `SELECT id FROM product_families WHERE subcategory_id IN (${matchedSubIds.map(() => '?').join(', ')})`,
          matchedSubIds
        );
        familyIds = famRows.map(r => r.id);
      }
    } else if (category) {
      const [catRows] = await pool.query('SELECT id, name, category_no FROM categories');
      const matchedCatIds = [];

      const matchTerm = (t) => {
        const tId = parseInt(t, 10);
        if (!isNaN(tId) && tId.toString() === t.trim()) {
          return [tId];
        }
        const targetSimplified = t.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matched = catRows.filter(c => 
          c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === targetSimplified ||
          c.category_no.toLowerCase() === t.toLowerCase() ||
          c.name.toLowerCase() === t.toLowerCase()
        );
        return matched.map(m => m.id);
      };

      // Try whole string first (handles categories with commas like "SMT, Rework & Assembly")
      let res = matchTerm(category);
      if (res.length > 0) {
        matchedCatIds.push(...res);
      } else if (category.includes(',')) {
        const catTerms = category.split(',').map(c => c.trim()).filter(Boolean);
        for (const t of catTerms) {
          matchedCatIds.push(...matchTerm(t));
        }
      }

      if (matchedCatIds.length > 0) {
        const [famRows] = await pool.query(
          `SELECT pf.id FROM product_families pf
           JOIN subcategories s ON pf.subcategory_id = s.id
           WHERE s.category_id IN (${matchedCatIds.map(() => '?').join(', ')})`,
          matchedCatIds
        );
        familyIds = famRows.map(r => r.id);
      }
    }

    let filterQuery = '';
    const queryParams = [];

    if (familyIds.length > 0) {
      filterQuery = `
        SELECT pf.id AS filter_id, pf.family_id, pf.filter_name, pf.filter_type,
               fam.name AS family_name
        FROM product_filters pf
        JOIN product_families fam ON pf.family_id = fam.id
        WHERE pf.family_id IN (${familyIds.map(() => '?').join(', ')})
        ORDER BY pf.filter_name ASC
      `;
      queryParams.push(...familyIds);
    } else {
      // Default: fetch filters that have active products in product_filter_values
      filterQuery = `
        SELECT pf.id AS filter_id, pf.family_id, pf.filter_name, pf.filter_type,
               fam.name AS family_name
        FROM product_filters pf
        JOIN product_families fam ON pf.family_id = fam.id
        WHERE pf.id IN (SELECT DISTINCT filter_id FROM product_filter_values)
        ORDER BY pf.filter_name ASC
      `;
    }

    const [filterRows] = await pool.query(filterQuery, queryParams);

    if (filterRows.length === 0) return [];

    const filterIds = filterRows.map(f => f.filter_id);
    // Fetch options and counts
    const [optRows] = await pool.query(
      `SELECT fo.id AS option_id, fo.filter_id, fo.option_value,
              COUNT(DISTINCT pfv.product_id) AS product_count
       FROM filter_options fo
       LEFT JOIN product_filter_values pfv ON pfv.option_id = fo.id
       WHERE fo.filter_id IN (${filterIds.map(() => '?').join(', ')})
       GROUP BY fo.id
       ORDER BY fo.option_value ASC`,
      filterIds
    );

    // Group by filter_name so if multiple families share a filter (e.g. "Power"), options are unified
    const grouped = new Map();
    for (const f of filterRows) {
      // Exclude 'Brand' from product family specs since Brand is already in common Advanced Filter
      if (f.filter_name.trim().toLowerCase() === 'brand') continue;

      const key = f.filter_name.trim();
      if (!grouped.has(key)) {
        grouped.set(key, {
          filter_name: key,
          filter_type: f.filter_type,
          family_names: [f.family_name],
          options: []
        });
      } else {
        const existing = grouped.get(key);
        if (!existing.family_names.includes(f.family_name)) {
          existing.family_names.push(f.family_name);
        }
      }
    }

    for (const opt of optRows) {
      const filter = filterRows.find(f => f.filter_id === opt.filter_id);
      if (filter && filter.filter_name.trim().toLowerCase() !== 'brand') {
        const group = grouped.get(filter.filter_name.trim());
        if (group) {
          const existingOpt = group.options.find(o => o.option_value.toLowerCase() === opt.option_value.toLowerCase());
          if (!existingOpt) {
            group.options.push({
              id: opt.option_id,
              option_value: opt.option_value,
              count: opt.product_count
            });
          } else {
            existingOpt.count += opt.product_count;
          }
        }
      }
    }

    // Filter out groups with 0 options
    return Array.from(grouped.values()).filter(g => g.options.length > 0);
  }
}

module.exports = FilterModel;
