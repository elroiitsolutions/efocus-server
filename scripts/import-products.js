const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

// Standard config load
const env = require('../src/config/env');

async function main() {
  const args = process.argv.slice(2);
  const excelPath = args[0] || path.join(__dirname, '../data/products.xlsx');

  console.log(`Excel Importer started. Target path: ${excelPath}`);

  if (!fs.existsSync(excelPath)) {
    console.error(`ERROR: File not found at '${excelPath}'.`);
    console.log(`Usage: node scripts/import-products.js [path-to-excel-file]`);
    console.log(`Please make sure to create the excel file with the following sheets:`);
    console.log(` 1. "Category Summary" (columns: Category No, Category Name, Priority, Description)`);
    console.log(` 2. "Product Family Config" (columns: Product Family, Filter Name, Filter Type, Option Values)`);
    console.log(` 3. "Product Master" (columns: Category, Sub-Category, Product Family, SKU, Catalog Number, Product Name, Brand, Short Description, Key Spec 1, Key Spec 2, Key Spec 3, Image Status, RFQ Eligible)`);
    process.exit(1);
  }

  // Initialize DB Connection
  let connection;
  try {
    connection = await mysql.createConnection({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database
    });
    console.log('Successfully connected to the database.');
  } catch (err) {
    console.error('CRITICAL: Database connection failed. Cannot proceed with import.');
    console.error(err.message);
    process.exit(1);
  }

  try {
    const workbook = xlsx.readFile(excelPath);
    console.log('Loaded Excel workbook sheets:', workbook.SheetNames);

    // 1. Process Category Summary Sheet
    const categoryMetadata = {};
    if (workbook.SheetNames.includes('Category Summary')) {
      const sheet = workbook.Sheets['Category Summary'];
      const rows = xlsx.utils.sheet_to_json(sheet, { range: 2 });
      console.log(`Processing ${rows.length} rows from "Category Summary"...`);
      for (const row of rows) {
        const catNo = (row['Category No'] || row['Category number'] || row['category_no'] || row['Cat No'] || row['Cat. No'] || '').toString().trim();
        const name = (row['Category Name'] || row['name'] || row['Category'] || '').toString().trim();
        
        let priority = 0;
        const priorityRaw = (row['Priority'] || row['priority'] || '').toString().trim().toLowerCase();
        if (priorityRaw === 'high') priority = 3;
        else if (priorityRaw === 'medium') priority = 2;
        else if (priorityRaw === 'low') priority = 1;
        else priority = parseInt(priorityRaw, 10) || 0;

        const description = (row['Description'] || row['description'] || row['Category Metadata'] || '').toString().trim();
        
        if (name) {
          categoryMetadata[name.toLowerCase()] = { catNo, priority, description };
        }
      }
    } else {
      console.warn('WARNING: "Category Summary" sheet not found in Excel workbook. Proceeding with defaults.');
    }

    // 2. Process Product Master - SCAN and build Category -> Subcategory -> Family Hierarchy
    if (!workbook.SheetNames.includes('Product Master')) {
      throw new Error('"Product Master" sheet is required but was not found.');
    }

    const masterSheet = workbook.Sheets['Product Master'];
    const masterRows = xlsx.utils.sheet_to_json(masterSheet, { range: 1 });
    console.log(`Scanning ${masterRows.length} rows from "Product Master" to build hierarchy...`);

    // Memory caches to map text names to IDs
    const categoryCache = {}; // name.toLowerCase() -> id
    const subcategoryCache = {}; // "catId:subName.toLowerCase()" -> id
    const familyCache = {}; // "subId:familyName.toLowerCase()" -> id

    // Load existing hierarchy from database to avoid duplicates
    const [existingCategories] = await connection.query('SELECT * FROM categories');
    for (const cat of existingCategories) {
      categoryCache[cat.name.toLowerCase()] = cat.id;
    }

    const [existingSubcategories] = await connection.query('SELECT * FROM subcategories');
    for (const sub of existingSubcategories) {
      subcategoryCache[`${sub.category_id}:${sub.name.toLowerCase()}`] = sub.id;
    }

    const [existingFamilies] = await connection.query('SELECT * FROM product_families');
    for (const fam of existingFamilies) {
      familyCache[`${fam.subcategory_id}:${fam.name.toLowerCase()}`] = fam.id;
    }

    // Begin building missing nodes
    for (const row of masterRows) {
      const catName = (row['Category'] || '').toString().trim();
      const subName = (row['Sub-Category'] || row['Sub Category'] || '').toString().trim();
      const familyName = (row['Product Family'] || '').toString().trim();

      if (!catName || !subName || !familyName) {
        continue; // Skip invalid hierarchy row
      }

      const catLower = catName.toLowerCase();
      const subLower = subName.toLowerCase();
      const famLower = familyName.toLowerCase();

      // 1. Get or create Category
      let catId = categoryCache[catLower];
      if (!catId) {
        const catNoVal = (row['Cat No'] || row['Category No'] || `CAT-${Object.keys(categoryCache).length + 1}`).toString().trim();
        const meta = categoryMetadata[catLower] || {
          catNo: catNoVal,
          priority: 0,
          description: null
        };
        const finalCatNo = meta.catNo || catNoVal;
        const [res] = await connection.query(
          'INSERT INTO categories (category_no, name, priority, description) VALUES (?, ?, ?, ?)',
          [finalCatNo, catName, meta.priority, meta.description]
        );
        catId = res.insertId;
        categoryCache[catLower] = catId;
        console.log(`Created category: ${catName} (${finalCatNo})`);
      }

      // 2. Get or create Subcategory
      const subKey = `${catId}:${subLower}`;
      let subId = subcategoryCache[subKey];
      if (!subId) {
        const [res] = await connection.query(
          'INSERT INTO subcategories (category_id, name) VALUES (?, ?)',
          [catId, subName]
        );
        subId = res.insertId;
        subcategoryCache[subKey] = subId;
        console.log(`Created subcategory: ${subName} under ${catName}`);
      }

      // 3. Get or create Product Family
      const famKey = `${subId}:${famLower}`;
      let famId = familyCache[famKey];
      if (!famId) {
        const [res] = await connection.query(
          'INSERT INTO product_families (subcategory_id, name) VALUES (?, ?)',
          [subId, familyName]
        );
        famId = res.insertId;
        familyCache[famKey] = famId;
        console.log(`Created product family: ${familyName} under ${subName}`);
      }
    }

    // 3. Process Product Family Config (Filter Configuration)
    // Map of filter definitions: "familyId:filterName.toLowerCase()" -> filterId
    const filterCache = {};
    const [existingFilters] = await connection.query('SELECT * FROM product_filters');
    for (const filter of existingFilters) {
      filterCache[`${filter.family_id}:${filter.filter_name.toLowerCase()}`] = filter.id;
    }

    // Map of filter options: "filterId:optionValue.toLowerCase()" -> optionId
    const optionCache = {};
    const [existingOptions] = await connection.query('SELECT * FROM filter_options');
    for (const opt of existingOptions) {
      optionCache[`${opt.filter_id}:${opt.option_value.toLowerCase()}`] = opt.id;
    }

    if (workbook.SheetNames.includes('Product Family Config')) {
      const configSheet = workbook.Sheets['Product Family Config'];
      const configRows = xlsx.utils.sheet_to_json(configSheet, { range: 2 });
      console.log(`Processing ${configRows.length} rows from "Product Family Config"...`);

      for (const row of configRows) {
        const famName = (row['Product Family'] || row['product_family'] || '').toString().trim();
        if (!famName) continue;

        // Resolve family ID across all subcategory boundaries (match family name)
        let resolvedFamilyId = null;
        for (const [key, value] of Object.entries(familyCache)) {
          if (key.endsWith(`:${famName.toLowerCase()}`)) {
            resolvedFamilyId = value;
            break;
          }
        }

        if (!resolvedFamilyId) {
          console.warn(`WARNING: Product family '${famName}' referenced in filters sheet not found in products master.`);
          continue;
        }

        // Loop through the three potential filter definition columns
        for (let i = 1; i <= 3; i++) {
          const filterColKey = `Filter ${i} (Label | Options)`;
          const filterRawVal = row[filterColKey] || row[`Filter ${i}`] || '';
          if (!filterRawVal) continue;

          // Split by pipe '|' to get filter label and option choices
          const parts = filterRawVal.toString().split('|');
          const filterName = parts[0].trim();
          if (!filterName) continue;

          const optionsStr = parts[1] || '';
          const filterType = 'select';

          // Get or Create Filter definition
          const filterKey = `${resolvedFamilyId}:${filterName.toLowerCase()}`;
          let filterId = filterCache[filterKey];
          if (!filterId) {
            const [res] = await connection.query(
              'INSERT INTO product_filters (family_id, filter_name, filter_type) VALUES (?, ?, ?)',
              [resolvedFamilyId, filterName, filterType]
            );
            filterId = res.insertId;
            filterCache[filterKey] = filterId;
            console.log(`Created filter: '${filterName}' for product family '${famName}'`);
          }

          // Parse options separated by middle dots '·', bullet points, or commas
          if (optionsStr) {
            const optionsArray = optionsStr
              .split(/[\u00b7\u2022,\u2027]/)
              .map(s => s.trim())
              .filter(Boolean);

            for (const optVal of optionsArray) {
              const optKey = `${filterId}:${optVal.toLowerCase()}`;
              if (!optionCache[optKey]) {
                const [res] = await connection.query(
                  'INSERT INTO filter_options (filter_id, option_value) VALUES (?, ?)',
                  [filterId, optVal]
                );
                optionCache[optKey] = res.insertId;
                console.log(`Created option choice: '${optVal}' for filter '${filterName}'`);
              }
            }
          }
        }
      }
    } else {
      console.warn('WARNING: "Product Family Config" sheet not found. No dynamic filters will be seeded.');
    }

    // 4. Process and Save Products
    console.log(`Inserting/Updating products from "Product Master"...`);
    let productsInserted = 0;
    let productsUpdated = 0;

    for (const row of masterRows) {
      const catName = (row['Category'] || '').toString().trim();
      const subName = (row['Sub-Category'] || row['Sub Category'] || '').toString().trim();
      const familyName = (row['Product Family'] || '').toString().trim();

      const sku = (row['SKU'] || row['SKU / Part No'] || row['SKU/Part No'] || '').toString().trim();
      const catalogNo = (row['Catalog Number'] || row['Catalog No'] || row['Model Number'] || row['Model No'] || '').toString().trim() || null;
      const productName = (row['Product Name'] || '').toString().trim();
      const brand = (row['Brand'] || '').toString().trim();
      const shortDesc = row['Short Description (web)'] || row['Short Description'] || row['Description / Model'] || row['Description/Model'] || null;
      
      const keySpec1 = row['Key Spec 1'] || null;
      const keySpec2 = row['Key Spec 2'] || null;
      const keySpec3 = row['Key Spec 3'] || null;
      const imageStatus = row['Image Status'] || null;
      
      const rfqRaw = row['RFQ Eligible'] || row['RFQ eligible'];
      const rfqEligible = (rfqRaw === 'Yes' || rfqRaw === 'YES' || rfqRaw === 1 || rfqRaw === true || rfqRaw === 'true');

      if (!sku || !productName || !brand || !catName || !subName || !familyName) {
        console.warn(`WARNING: Skipping product row due to missing required attributes: SKU='${sku}', Name='${productName}', Brand='${brand}'`);
        continue;
      }

      // Resolve relational IDs
      const catId = categoryCache[catName.toLowerCase()];
      const subId = subcategoryCache[`${catId}:${subName.toLowerCase()}`];
      const famId = familyCache[`${subId}:${familyName.toLowerCase()}`];

      // Check if product SKU already exists
      const [existingProds] = await connection.query('SELECT id FROM products WHERE sku = ?', [sku]);
      let productId;
      
      if (existingProds.length > 0) {
        productId = existingProds[0].id;
        await connection.query(
          `UPDATE products SET 
             category_id = ?, subcategory_id = ?, family_id = ?,
             catalog_number = ?, product_name = ?, brand = ?,
             short_description = ?, key_spec_1 = ?, key_spec_2 = ?, key_spec_3 = ?,
             image_status = ?, rfq_eligible = ?
           WHERE id = ?`,
          [
            catId, subId, famId,
            catalogNo, productName, brand,
            shortDesc, keySpec1, keySpec2, keySpec3,
            imageStatus, rfqEligible ? 1 : 0,
            productId
          ]
        );
        productsUpdated++;
      } else {
        const [res] = await connection.query(
          `INSERT INTO products 
             (category_id, subcategory_id, family_id, sku, catalog_number, product_name, brand,
              short_description, key_spec_1, key_spec_2, key_spec_3, image_status, rfq_eligible)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            catId, subId, famId, sku, catalogNo, productName, brand,
            shortDesc, keySpec1, keySpec2, keySpec3, imageStatus, rfqEligible ? 1 : 0
          ]
        );
        productId = res.insertId;
        productsInserted++;
      }

      // 5. Parse dynamic filter specifications for this product
      // We check all columns in the excel row to see if they match any filter defined for this family
      const [familyFilters] = await connection.query('SELECT * FROM product_filters WHERE family_id = ?', [famId]);
      
      // Clear existing specs for this product to prevent duplicate conflicts
      await connection.query('DELETE FROM product_filter_values WHERE product_id = ?', [productId]);

      for (const filter of familyFilters) {
        const filterName = filter.filter_name;
        // Check if row has a column with this filter name
        let val = row[filterName] || row[filterName.toLowerCase()] || row[filterName.replace(/\s+/g, '')];
        
        // If not found in columns, try to extract it from Key Specs
        if (val === undefined) {
          const specArr = [keySpec1, keySpec2, keySpec3].filter(Boolean);
          for (const spec of specArr) {
            const parts = spec.split(':');
            if (parts.length >= 2) {
              const specKey = parts[0].trim().toLowerCase();
              const specVal = parts.slice(1).join(':').trim();
              const cleanFilterName = filterName.toLowerCase();
              
              // Flexibly match similar or containing names (e.g. Lead-Free matching Lead-Free Compatible)
              if (cleanFilterName.includes(specKey) || specKey.includes(cleanFilterName)) {
                val = specVal;
                break;
              }
            }
          }
        }

        if (val !== undefined && val !== null) {
          const valString = val.toString().trim();
          if (valString) {
            // Find option if filter is choice-based
            const optKey = `${filter.id}:${valString.toLowerCase()}`;
            let optionId = optionCache[optKey] || null;

            // If option does not exist yet for this filter, register it!
            if (!optionId && filter.filter_type === 'select') {
              const [res] = await connection.query(
                'INSERT INTO filter_options (filter_id, option_value) VALUES (?, ?)',
                [filter.id, valString]
              );
              optionId = res.insertId;
              optionCache[optKey] = optionId;
              console.log(`Created missing option choice: '${valString}' for filter '${filterName}' during product scanning.`);
            }

            // Save filter value relationship
            await connection.query(
              `INSERT INTO product_filter_values (product_id, filter_id, option_id, value)
               VALUES (?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE option_id = VALUES(option_id), value = VALUES(value)`,
              [productId, filter.id, optionId, filter.filter_type !== 'select' ? valString : null]
            );
          }
        }
      }
    }

    console.log('--------------------------------------------------');
    console.log('Excel Import Completed Successfully!');
    console.log(` - Categories indexed:    ${Object.keys(categoryCache).length}`);
    console.log(` - Subcategories indexed: ${Object.keys(subcategoryCache).length}`);
    console.log(` - Product Families:      ${Object.keys(familyCache).length}`);
    console.log(` - Products Created:      ${productsInserted}`);
    console.log(` - Products Updated:      ${productsUpdated}`);
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('CRITICAL: An error occurred during Excel import:');
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

main().catch(console.error);
