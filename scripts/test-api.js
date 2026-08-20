const BASE_URL = 'http://localhost:5000/api';

async function test(name, method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    console.log(`[TEST] ${name}`);
    console.log(` - URL: ${method} ${endpoint}`);
    console.log(` - Status: ${res.status}`);
    console.log(` - Success: ${data.success}`);
    if (!data.success) {
      console.log(` - Error Message: ${data.message}`);
      if (data.errors) console.log(` - Validation Errors:`, data.errors);
    } else {
      // Print snippet of data
      const dataStr = JSON.stringify(data.data || data);
      console.log(` - Response Snippet: ${dataStr.substring(0, 120)}${dataStr.length > 120 ? '...' : ''}`);
      if (data.pagination) {
        console.log(` - Pagination Metadata:`, data.pagination);
      }
    }
    console.log('--------------------------------------------------');
    return { status: res.status, data }; // returns { status: 200, data: { success: true, data: {...} } }
  } catch (error) {
    console.error(`[TEST FAILED] ${name} (${method} ${endpoint})`);
    console.error(error.message);
    console.log('--------------------------------------------------');
    return null;
  }
}

async function runTests() {
  console.log('Starting eFocus API Tests...');
  console.log('==================================================');

  // 1. Health Check
  await test('Health Check', 'GET', '/health');

  // 2. Categories CRUD
  console.log('>> TESTING CATEGORIES API...');
  await test('Get All Categories', 'GET', '/categories');
  
  // Create Category
  const newCat = await test('Create Category', 'POST', '/categories', {
    category_no: 'CAT-TEMP',
    name: 'Temporary Test Category',
    priority: 10,
    description: 'Temporary category for API verification'
  });
  
  let tempCatId = null;
  // newCat.data is the Express json response: { success: true, data: { id: 4, ... } }
  if (newCat && newCat.data && newCat.data.success && newCat.data.data) {
    tempCatId = newCat.data.data.id;
    
    // Get single Category
    await test(`Get Category by ID (${tempCatId})`, 'GET', `/categories/${tempCatId}`);
    
    // Update Category
    await test(`Update Category by ID (${tempCatId})`, 'PUT', `/categories/${tempCatId}`, {
      category_no: 'CAT-TEMP-UPDATED',
      name: 'Temporary Test Category Updated',
      priority: 12,
      description: 'Updated description'
    });
    
    // Check duplication check
    await test('Create Category with Duplicate category_no (Should Fail)', 'POST', '/categories', {
      category_no: 'CAT-TEMP-UPDATED',
      name: 'Duplicate Category'
    });
  }

  // 3. Subcategories API
  console.log('>> TESTING SUBCATEGORIES API...');
  await test('Get All Subcategories', 'GET', '/subcategories');
  await test('Get Subcategory by ID (1)', 'GET', '/subcategories/1');

  // 4. Families API
  console.log('>> TESTING PRODUCT FAMILIES API...');
  await test('Get All Families', 'GET', '/families');
  await test('Get Family by ID (2)', 'GET', '/families/2');

  // 5. Filters API
  console.log('>> TESTING FILTERS API...');
  await test('Get All Filters', 'GET', '/filters');
  await test('Get Filters by Family ID (2)', 'GET', '/filters/2');

  // 6. Products CRUD, Search, Filter & Paging
  console.log('>> TESTING PRODUCTS API...');
  await test('Get All Products', 'GET', '/products');
  await test('Get Products with Pagination (Page 1, Limit 2)', 'GET', '/products?page=1&limit=2');
  await test('Search Products (soldering)', 'GET', '/products?search=soldering');
  await test('Filter Products by Category (SMT Equipment)', 'GET', '/products?category=SMT%20Equipment');
  await test('Filter Products by Family ID (2 - Lead-free Stations)', 'GET', '/products?family=2');
  
  // Test hierarchical validation failure (e.g. Subcategory doesn't belong to Category)
  await test('Create Product with Mismatched Hierarchy (Should Fail)', 'POST', '/products', {
    category_id: 1, // SMT Equipment
    subcategory_id: 2, // Soldering Stations (belongs to Category 2, not 1)
    family_id: 2,
    sku: 'FAIL-SKU-1',
    product_name: 'Invalid Hierarchy Product',
    brand: 'Quick'
  });

  // Create Product with valid hierarchy and specifications
  const newProd = await test('Create Product with Specifications', 'POST', '/products', {
    category_id: 2,
    subcategory_id: 2,
    family_id: 2,
    sku: 'TEST-SKU-99',
    catalog_number: 'QUICK-API-TEST',
    product_name: 'API Test Soldering Station',
    brand: 'Quick',
    short_description: 'Seeded via REST API test script',
    key_spec_1: 'Power: 90W',
    key_spec_2: 'Temp Range: 100-500°C',
    key_spec_3: 'ESD Safe: Yes',
    rfq_eligible: true,
    specs: [
      { filter_id: 1, option_id: 2 }, // Power Rating (90W)
      { filter_id: 2, option_id: 5 }, // Heating Technology (High Frequency Induction)
      { filter_id: 3, option_id: 7 }  // ESD Safety (Yes)
    ]
  });

  let tempProductId = null;
  if (newProd && newProd.data && newProd.data.success && newProd.data.data) {
    tempProductId = newProd.data.data.id;
    
    // Get product details (Verify that specs are nested inside response)
    await test(`Get Product Detail by ID (${tempProductId})`, 'GET', `/products/${tempProductId}`);
    
    // Update product specs and brand
    await test(`Update Product specs and brand (${tempProductId})`, 'PUT', `/products/${tempProductId}`, {
      category_id: 2,
      subcategory_id: 2,
      family_id: 2,
      sku: 'TEST-SKU-99',
      catalog_number: 'QUICK-API-TEST-UPDATED',
      product_name: 'API Test Soldering Station Updated',
      brand: 'Quick-Updated',
      short_description: 'Updated description',
      key_spec_1: 'Power: 120W',
      key_spec_2: 'Temp Range: 200-480°C',
      key_spec_3: 'ESD Safe: Yes',
      rfq_eligible: false,
      specs: [
        { filter_id: 1, option_id: 3 }, // Power Rating (120W)
        { filter_id: 2, option_id: 5 }, // Heating Technology (High Frequency Induction)
        { filter_id: 3, option_id: 7 }  // ESD Safety (Yes)
      ]
    });

    // Verify detail updates
    await test(`Verify Updated Product details (${tempProductId})`, 'GET', `/products/${tempProductId}`);

    // Clean up test product
    await test(`Delete Product by ID (${tempProductId})`, 'DELETE', `/products/${tempProductId}`);
  }

  // Clean up category
  if (tempCatId) {
    await test(`Delete Category by ID (${tempCatId})`, 'DELETE', `/categories/${tempCatId}`);
  }

  console.log('==================================================');
  console.log('eFocus API Verification Completed.');
}

runTests().catch(console.error);
