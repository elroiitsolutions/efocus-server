const { pool } = require('../config/database');

class ProductModel {
  static async findAndCount({ search, category, subcategory, family, brand, stock_status, filter_options, limit, offset }) {
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

    // Parse brand terms (supports clean slugs e.g. raspberry-pi or raw names e.g. Raspberry Pi)
    let brandList = [];
    if (brand) {
      const rawBrandTerms = brand.split(',').map(b => b.trim()).filter(Boolean);
      if (rawBrandTerms.length > 0) {
        const [dbBrands] = await pool.query('SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL');
        for (const term of rawBrandTerms) {
          const simplified = simplifyString(term);
          const matched = dbBrands.filter(b =>
            b.brand.toLowerCase() === term.toLowerCase() ||
            simplifyString(b.brand) === simplified
          );
          if (matched.length > 0) {
            matched.forEach(m => brandList.push(m.brand));
          } else {
            brandList.push(term);
          }
        }
        brandList = [...new Set(brandList)];
      }
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

    // Family filter: support family_id (int), name (string), clean slug (e.g. single-board-computers), or comma-separated list
    if (family) {
      const familyTerms = family.toString().split(',').map(f => f.trim()).filter(Boolean);
      if (familyTerms.length > 0) {
        const [families] = await pool.query('SELECT id, name FROM product_families');
        const familyIds = [];
        for (const term of familyTerms) {
          const fid = parseInt(term, 10);
          if (!isNaN(fid) && fid.toString() === term) {
            familyIds.push(fid);
          } else {
            const simplified = simplifyString(term);
            const matched = families.filter(f =>
              f.name.toLowerCase() === term.toLowerCase() ||
              simplifyString(f.name) === simplified
            );
            matched.forEach(m => familyIds.push(m.id));
          }
        }
        if (familyIds.length > 0) {
          const uniqueFamIds = [...new Set(familyIds)];
          whereClauses.push(`p.family_id IN (${uniqueFamIds.map(() => '?').join(', ')})`);
          queryParams.push(...uniqueFamIds);
        }
      }
    }

    // Common attribute filter: stock_status (in_stock, out_of_stock, on_backorder)
    if (stock_status) {
      const statuses = stock_status.toString().split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (statuses.length > 0) {
        whereClauses.push(`p.stock_status IN (${statuses.map(() => '?').join(', ')})`);
        queryParams.push(...statuses);
      }
    }

    // Dynamic Product Family Config filters: filter_options (comma-separated option IDs)
    if (filter_options) {
      const optIds = filter_options.toString().split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      if (optIds.length > 0) {
        // Group option IDs by filter_id
        const [optRecords] = await pool.query(
          `SELECT id, filter_id FROM filter_options WHERE id IN (${optIds.map(() => '?').join(', ')})`,
          optIds
        );
        const filterGroups = new Map();
        for (const r of optRecords) {
          if (!filterGroups.has(r.filter_id)) {
            filterGroups.set(r.filter_id, []);
          }
          filterGroups.get(r.filter_id).push(r.id);
        }

        // For each filter group (e.g., Power, Lead-Free), match products that have at least one chosen option
        for (const [filterId, groupOptIds] of filterGroups.entries()) {
          whereClauses.push(`
            p.id IN (
              SELECT pfv.product_id FROM product_filter_values pfv
              WHERE pfv.filter_id = ? AND pfv.option_id IN (${groupOptIds.map(() => '?').join(', ')})
            )
          `);
          queryParams.push(filterId, ...groupOptIds);
        }
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

  static async getBrands(filters = {}) {
    const { category, subcategory, family } = filters;
    let query = `
      SELECT DISTINCT p.brand 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      LEFT JOIN product_families f ON p.family_id = f.id
      WHERE p.brand IS NOT NULL AND p.brand != ''
    `;
    const params = [];

    const simplifyString = (str) => {
      return str
        .toString()
        .toLowerCase()
        .replace(/\band\b/g, '')
        .replace(/[^a-z0-9]/g, '');
    };

    if (family) {
      const familyList = family.split(',').map(f => f.trim()).filter(Boolean);
      if (familyList.length > 0) {
        const [families] = await pool.query('SELECT id, name FROM product_families');
        const familyIds = [];
        for (const famTerm of familyList) {
          const simplified = simplifyString(famTerm);
          const matched = families.filter(f => 
            f.name.toLowerCase() === famTerm.toLowerCase() ||
            simplifyString(f.name) === simplified ||
            f.id.toString() === famTerm
          );
          matched.forEach(m => familyIds.push(m.id));
        }

        if (familyIds.length > 0) {
          query += ` AND p.family_id IN (${familyIds.map(() => '?').join(', ')})`;
          params.push(...familyIds);
        } else {
          query += ` AND p.family_id IN (${familyList.map(() => '?').join(', ')})`;
          params.push(...familyList);
        }
      }
    }

    if (subcategory) {
      const subList = subcategory.split(',').map(s => s.trim()).filter(Boolean);
      if (subList.length > 0) {
        const [subcats] = await pool.query('SELECT id, name FROM subcategories');
        const subIds = [];
        for (const subTerm of subList) {
          const simplified = simplifyString(subTerm);
          const matched = subcats.filter(s =>
            s.name.toLowerCase() === subTerm.toLowerCase() ||
            simplifyString(s.name) === simplified ||
            s.id.toString() === subTerm
          );
          matched.forEach(m => subIds.push(m.id));
        }
        if (subIds.length > 0) {
          query += ` AND p.subcategory_id IN (${subIds.map(() => '?').join(', ')})`;
          params.push(...subIds);
        }
      }
    }

    if (category) {
      const catList = category.split(',').map(c => c.trim()).filter(Boolean);
      if (catList.length > 0) {
        const [cats] = await pool.query('SELECT id, name FROM categories');
        const catIds = [];
        for (const catTerm of catList) {
          const simplified = simplifyString(catTerm);
          const matched = cats.filter(c =>
            c.name.toLowerCase() === catTerm.toLowerCase() ||
            simplifyString(c.name) === simplified ||
            c.id.toString() === catTerm
          );
          matched.forEach(m => catIds.push(m.id));
        }
        if (catIds.length > 0) {
          query += ` AND p.category_id IN (${catIds.map(() => '?').join(', ')})`;
          params.push(...catIds);
        }
      }
    }

    query += ' ORDER BY p.brand ASC';

    const [rows] = await pool.query(query, params);
    return rows.map(r => r.brand).filter(Boolean);
  }
}

module.exports = ProductModel;
