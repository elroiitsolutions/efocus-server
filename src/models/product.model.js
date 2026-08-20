const { pool } = require('../config/database');

class ProductModel {
  static async findAndCount({ search, category, subcategory, family, brand, limit, offset }) {
    let selectSql = `
      SELECT p.*, 
             c.name AS category_name, c.category_no AS category_no,
             s.name AS subcategory_name,
             pf.name AS family_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN subcategories s ON p.subcategory_id = s.id
      INNER JOIN product_families pf ON p.family_id = pf.id
    `;

    let countSql = `
      SELECT COUNT(*) AS total
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN subcategories s ON p.subcategory_id = s.id
      INNER JOIN product_families pf ON p.family_id = pf.id
    `;

    const whereClauses = [];
    const queryParams = [];

    // Search against product_name, sku, catalog_number, and brand
    if (search) {
      whereClauses.push('(p.product_name LIKE ? OR p.sku LIKE ? OR p.catalog_number LIKE ? OR p.brand LIKE ?)');
      const term = `%${search}%`;
      queryParams.push(term, term, term, term);
    }

    const simplifyString = (str) => {
      return str
        .toString()
        .toLowerCase()
        .replace(/\band\b/g, '')
        .replace(/[^a-z0-9]/g, '');
    };

    // Category filter: support category IDs, names with commas (e.g. "SMT, Rework & Assembly"), slugs, or comma-separated lists
    // Fetch all subcategories first to resolve hierarchies
    const [subcats] = await pool.query('SELECT id, category_id, name FROM subcategories');

    let catIds = [];
    let subIdsFromCat = [];
    let subcatIds = [];
    let subcatNames = [];

    // Parse category terms
    if (category) {
      const [cats] = await pool.query('SELECT id, category_no, name FROM categories');

      const findMatchedCategoryIds = (term) => {
        const catIdInt = parseInt(term, 10);
        if (!isNaN(catIdInt) && catIdInt.toString() === term.trim()) {
          return { catIds: [catIdInt], subIds: [] };
        }

        const targetSimplified = simplifyString(term);

        // 1. Check main categories
        const matchedCats = cats.filter(c =>
          c.category_no === term ||
          c.name === term ||
          simplifyString(c.name) === targetSimplified
        );
        if (matchedCats.length > 0) {
          return { catIds: matchedCats.map(c => c.id), subIds: [] };
        }

        // 2. Check subcategories
        const matchedSubs = subcats.filter(s =>
          s.name === term ||
          simplifyString(s.name) === targetSimplified
        );
        if (matchedSubs.length > 0) {
          return { catIds: [], subIds: matchedSubs.map(s => s.id) };
        }

        return { catIds: [], subIds: [] };
      };

      let res = findMatchedCategoryIds(category);
      catIds = res.catIds;
      subIdsFromCat = res.subIds;

      if (catIds.length === 0 && subIdsFromCat.length === 0 && category.includes(',')) {
        const terms = category.split(',').map(t => t.trim()).filter(Boolean);
        for (const term of terms) {
          const r = findMatchedCategoryIds(term);
          catIds.push(...r.catIds);
          subIdsFromCat.push(...r.subIds);
        }
      }

      catIds = [...new Set(catIds)];
      subIdsFromCat = [...new Set(subIdsFromCat)];
    }

    // Parse subcategory terms
    if (subcategory) {
      const terms = subcategory.split(',').map(t => t.trim()).filter(Boolean);
      for (const term of terms) {
        const subcatId = parseInt(term, 10);
        if (!isNaN(subcatId) && subcatId.toString() === term) {
          subcatIds.push(subcatId);
        } else {
          const targetSimplified = simplifyString(term);
          const matchedSub = subcats.find(s => 
            s.name === term || 
            simplifyString(s.name) === targetSimplified
          );
          if (matchedSub) {
            subcatIds.push(matchedSub.id);
          } else {
            subcatNames.push(term);
          }
        }
      }
      subcatIds = [...new Set(subcatIds)];
      subcatNames = [...new Set(subcatNames)];
    }

    // Parse brand terms
    let brandList = [];
    if (brand) {
      brandList = brand.split(',').map(b => b.trim()).filter(Boolean);
    }

    // Assemble unified category/subcategory/brand WHERE conditions
    if (catIds.length > 0 || subIdsFromCat.length > 0 || subcatIds.length > 0 || subcatNames.length > 0) {
      const allSelectedCats = [...catIds];
      for (const subId of subIdsFromCat) {
        const sub = subcats.find(s => s.id === subId);
        if (sub) {
          allSelectedCats.push(sub.category_id);
        }
      }
      const uniqueSelectedCats = [...new Set(allSelectedCats)];

      // Fetch brand-subcategory mappings for the selected subcatIds
      let subcatBrands = [];
      if (subcatIds.length > 0) {
        const [rows] = await pool.query(
          `SELECT DISTINCT subcategory_id, brand FROM products WHERE subcategory_id IN (${subcatIds.map(() => '?').join(', ')}) AND brand IS NOT NULL`,
          subcatIds
        );
        subcatBrands = rows;
      }

      if (uniqueSelectedCats.length > 0) {
        const catConditions = [];

        for (const catId of uniqueSelectedCats) {
          // Find which of the selected subcategories belong to this category
          const subsForCat = subcatIds.filter(subId => {
            const sub = subcats.find(s => s.id === subId);
            return sub && sub.category_id === catId;
          });

          // Check for subcategory name matches under this category
          const subNamesForCat = subcatNames.filter(subName => {
            const sub = subcats.find(s => simplifyString(s.name) === simplifyString(subName));
            return sub && sub.category_id === catId;
          });

          if (subsForCat.length > 0 || subNamesForCat.length > 0) {
            const innerClauses = [];
            const innerParams = [];

            // For each subcategory ID under this category, filter by selected brands if any
            for (const subId of subsForCat) {
              const sub = subcats.find(s => s.id === subId);
              const subSlug = sub ? simplifyString(sub.name) : '';

              const matchedBrands = brandList.map(b => {
                if (b.includes(':')) {
                  const [scopeSlug, bName] = b.split(':');
                  if (simplifyString(scopeSlug) === subSlug) {
                    return bName;
                  }
                  return null;
                }
                if (subcatBrands.some(sb => sb.subcategory_id === subId && sb.brand.toLowerCase() === b.toLowerCase())) {
                  return b;
                }
                return null;
              }).filter(Boolean);

              if (matchedBrands.length > 0) {
                innerClauses.push(`(p.subcategory_id = ? AND p.brand IN (${matchedBrands.map(() => '?').join(', ')}))`);
                innerParams.push(subId, ...matchedBrands);
              } else {
                innerClauses.push(`p.subcategory_id = ?`);
                innerParams.push(subId);
              }
            }

            // For subcategory name fallbacks
            for (const subName of subNamesForCat) {
              const sub = subcats.find(s => simplifyString(s.name) === simplifyString(subName));
              const subId = sub ? sub.id : null;
              const subSlug = simplifyString(subName);

              const matchedBrands = brandList.map(b => {
                if (b.includes(':')) {
                  const [scopeSlug, bName] = b.split(':');
                  if (simplifyString(scopeSlug) === subSlug) {
                    return bName;
                  }
                  return null;
                }
                if (subId && subcatBrands.some(sb => sb.subcategory_id === subId && sb.brand.toLowerCase() === b.toLowerCase())) {
                  return b;
                }
                return null;
              }).filter(Boolean);
              
              if (matchedBrands.length > 0) {
                innerClauses.push(`(s.name = ? AND p.brand IN (${matchedBrands.map(() => '?').join(', ')}))`);
                innerParams.push(subName, ...matchedBrands);
              } else {
                innerClauses.push(`s.name = ?`);
                innerParams.push(subName);
              }
            }

            catConditions.push(`(p.category_id = ? AND (${innerClauses.join(' OR ')}))`);
            queryParams.push(catId, ...innerParams);
          } else {
            // Show all products under this category if no subcategories under it are selected
            catConditions.push(`p.category_id = ?`);
            queryParams.push(catId);
          }
        }

        // Handle orphan subcategories/subnames (not in selected cats)
        const orphanSubs = subcatIds.filter(subId => {
          const sub = subcats.find(s => s.id === subId);
          return !sub || !uniqueSelectedCats.includes(sub.category_id);
        });

        for (const subId of orphanSubs) {
          const sub = subcats.find(s => s.id === subId);
          const subSlug = sub ? simplifyString(sub.name) : '';

          const matchedBrands = brandList.map(b => {
            if (b.includes(':')) {
              const [scopeSlug, bName] = b.split(':');
              if (simplifyString(scopeSlug) === subSlug) {
                return bName;
              }
              return null;
            }
            if (subcatBrands.some(sb => sb.subcategory_id === subId && sb.brand.toLowerCase() === b.toLowerCase())) {
              return b;
            }
            return null;
          }).filter(Boolean);

          if (matchedBrands.length > 0) {
            catConditions.push(`(p.subcategory_id = ? AND p.brand IN (${matchedBrands.map(() => '?').join(', ')}))`);
            queryParams.push(subId, ...matchedBrands);
          } else {
            catConditions.push(`p.subcategory_id = ?`);
            queryParams.push(subId);
          }
        }

        whereClauses.push(`(${catConditions.join(' OR ')})`);
      } else {
        // No main categories selected, filter directly by subcategories
        const subcatClauses = [];
        for (const subId of subcatIds) {
          const sub = subcats.find(s => s.id === subId);
          const subSlug = sub ? simplifyString(sub.name) : '';

          const matchedBrands = brandList.map(b => {
            if (b.includes(':')) {
              const [scopeSlug, bName] = b.split(':');
              if (simplifyString(scopeSlug) === subSlug) {
                return bName;
              }
              return null;
            }
            if (subcatBrands.some(sb => sb.subcategory_id === subId && sb.brand.toLowerCase() === b.toLowerCase())) {
              return b;
            }
            return null;
          }).filter(Boolean);

          if (matchedBrands.length > 0) {
            subcatClauses.push(`(p.subcategory_id = ? AND p.brand IN (${matchedBrands.map(() => '?').join(', ')}))`);
            queryParams.push(subId, ...matchedBrands);
          } else {
            subcatClauses.push(`p.subcategory_id = ?`);
            queryParams.push(subId);
          }
        }
        if (subcatClauses.length > 0) {
          whereClauses.push(`(${subcatClauses.join(' OR ')})`);
        }
      }
    } else {
      // No category or subcategory filters, filter by brand globally if selected
      if (brandList.length > 0) {
        whereClauses.push(`p.brand IN (${brandList.map(() => '?').join(', ')})`);
        queryParams.push(...brandList);
      }
    }

    // Family filter: support family_id (int) or name (string)
    if (family) {
      const familyId = parseInt(family, 10);
      if (!isNaN(familyId)) {
        whereClauses.push('p.family_id = ?');
        queryParams.push(familyId);
      } else {
        whereClauses.push('pf.name = ?');
        queryParams.push(family);
      }
    }

    if (whereClauses.length > 0) {
      const whereSql = ' WHERE ' + whereClauses.join(' AND ');
      selectSql += whereSql;
      countSql += whereSql;
    }

    // Sort by id descending
    selectSql += ' ORDER BY p.id DESC LIMIT ? OFFSET ?';

    const countParams = [...queryParams];
    const selectParams = [...queryParams, limit, offset];

    const [[{ total }]] = await pool.query(countSql, countParams);
    const [rows] = await pool.query(selectSql, selectParams);

    return { rows, total };
  }

  static async findById(id) {
    const query = `
      SELECT p.*, 
             c.name AS category_name, c.category_no AS category_no,
             s.name AS subcategory_name,
             pf.name AS family_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      INNER JOIN subcategories s ON p.subcategory_id = s.id
      INNER JOIN product_families pf ON p.family_id = pf.id
      WHERE p.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }

  static async findBySku(sku) {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE sku = ?',
      [sku]
    );
    return rows[0] || null;
  }

  static async getProductSpecs(productId) {
    const query = `
      SELECT pfv.id AS value_id, pf.id AS filter_id, pf.filter_name, pf.filter_type,
             fo.id AS option_id, fo.option_value, pfv.value AS custom_value
      FROM product_filter_values pfv
      INNER JOIN product_filters pf ON pfv.filter_id = pf.id
      LEFT JOIN filter_options fo ON pfv.option_id = fo.id
      WHERE pfv.product_id = ?
    `;
    const [rows] = await pool.query(query, [productId]);
    return rows;
  }

  static async create(productData, connection = pool) {
    const {
      category_id, subcategory_id, family_id,
      sku, catalog_number = null, product_name, brand,
      short_description = null, key_spec_1 = null, key_spec_2 = null, key_spec_3 = null,
      image_status = null, rfq_eligible = true
    } = productData;

    const [result] = await connection.query(
      `INSERT INTO products 
       (category_id, subcategory_id, family_id, sku, catalog_number, product_name, brand, 
        short_description, key_spec_1, key_spec_2, key_spec_3, image_status, rfq_eligible) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id, subcategory_id, family_id,
        sku, catalog_number, product_name, brand,
        short_description, key_spec_1, key_spec_2, key_spec_3,
        image_status, rfq_eligible ? 1 : 0
      ]
    );
    return result.insertId;
  }

  static async update(id, productData, connection = pool) {
    const {
      category_id, subcategory_id, family_id,
      sku, catalog_number, product_name, brand,
      short_description, key_spec_1, key_spec_2, key_spec_3,
      image_status, rfq_eligible
    } = productData;

    await connection.query(
      `UPDATE products SET 
       category_id = ?, subcategory_id = ?, family_id = ?, 
       sku = ?, catalog_number = ?, product_name = ?, brand = ?, 
       short_description = ?, key_spec_1 = ?, key_spec_2 = ?, key_spec_3 = ?, 
       image_status = ?, rfq_eligible = ? 
       WHERE id = ?`,
      [
        category_id, subcategory_id, family_id,
        sku, catalog_number, product_name, brand,
        short_description, key_spec_1, key_spec_2, key_spec_3,
        image_status, rfq_eligible ? 1 : 0,
        id
      ]
    );
    return true;
  }

  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async saveFilterValues(productId, filterValues, connection = pool) {
    // Delete existing specs first
    await connection.query(
      'DELETE FROM product_filter_values WHERE product_id = ?',
      [productId]
    );

    if (!filterValues || filterValues.length === 0) return;

    // Bulk insert filter values
    const insertSql = `
      INSERT INTO product_filter_values (product_id, filter_id, option_id, value)
      VALUES ?
    `;
    const valuesData = filterValues.map(val => [
      productId,
      val.filter_id,
      val.option_id || null,
      val.value || null
    ]);

    await connection.query(insertSql, [valuesData]);
  }

  static async getBrands() {
    const [rows] = await pool.query(
      'SELECT DISTINCT brand FROM products ORDER BY brand ASC'
    );
    return rows.map(r => r.brand).filter(Boolean);
  }
}

module.exports = ProductModel;
