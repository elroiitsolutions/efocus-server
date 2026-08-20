# eFocus E-Commerce Backend

This is a production-quality, high-performance Node.js & Express REST API backend for the **eFocus** e-commerce application. The backend is structured using clean MVC + Service architecture, connecting to a normalized MySQL database.

---

## 1. Technologies Used
* **Node.js** (v18+) & **Express.js** (REST API Router)
* **MySQL** (Relational Database)
* **mysql2/promise** (Database client with Promise/Async-Await support & Pool connections)
* **xlsx** (SheetJS - Excel parser for high-speed imports)
* **dotenv** (Configuration management via env files)
* **cors** (Cross-Origin Resource Sharing)
* **helmet** (HTTP Headers security)
* **express-rate-limit** (API DDoS / brute-force protection)

---

## 2. Project Folder Structure

```text
efocus-backend/
│
├── database/
│   ├── schema.sql              # Database schema definitions, constraints & indexes
│   └── seed.sql                # Representative sample seed data
│
├── scripts/
│   ├── db-setup.js             # Database creator & initializer script
│   ├── create-test-excel.js    # Generates mock data products.xlsx for testing
│   ├── import-products.js      # Main Excel data importer utility
│   └── test-api.js             # Integration verification test suite
│
├── src/
│   ├── config/
│   │   ├── database.js         # Connection pool instantiation
│   │   └── env.js              # Environment variable configurations mapping
│   │
│   ├── controllers/            # Controller layer (Extract requests and dispatch responses)
│   │   ├── category.controller.js
│   │   ├── subcategory.controller.js
│   │   ├── family.controller.js
│   │   ├── product.controller.js
│   │   └── filter.controller.js
│   │
│   ├── services/               # Business Logic layer (Validations, transaction handling)
│   │   ├── category.service.js
│   │   ├── subcategory.service.js
│   │   ├── family.service.js
│   │   ├── product.service.js
│   │   └── filter.service.js
│   │
│   ├── models/                 # Database Query mapping layer (Raw parameterized SQLs)
│   │   ├── category.model.js
│   │   ├── subcategory.model.js
│   │   ├── family.model.js
│   │   ├── product.model.js
│   │   └── filter.model.js
│   │
│   ├── routes/                 # Express REST endpoint maps
│   │   ├── category.routes.js
│   │   ├── subcategory.routes.js
│   │   ├── family.routes.js
│   │   ├── product.routes.js
│   │   └── filter.routes.js
│   │
│   ├── middleware/             # Middlewares (Central error catcher, parsing validators)
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   └── notFound.middleware.js
│   │
│   ├── utils/                  # Utility helpers (Pagination and response objects formatters)
│   │   ├── response.js
│   │   └── pagination.js
│   │
│   ├── app.js                  # App instantiation & security configuration
│   └── server.js               # Main bootstrapper
│
├── data/
│   └── products.xlsx           # Excel source spreadsheet location
│
├── uploads/
│   └── products/               # Product image upload storage
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Database Design & Relationships

The database is fully normalized to prevent redundant text entries in rows, structuring queries across relation tables:

```text
categories (CAT-001)
   │
   └── subcategories (Stencil Printers)
          │
          └── product_families (Manual Printers)
                 │
                 ├── products (SLD-STN-90W) ─── product_filter_values (e.g. 90W rating)
                 │
                 └── product_filters (Power Rating) ─── filter_options (80W, 90W)
```

Indexes are created on:
* Foreign Keys: `category_id`, `subcategory_id`, `family_id`
* Unique Constraints: `sku`
* Performance lookups: `catalog_number`, `brand`, `product_name`

---

## 4. Setup Instructions

### Prerequisites
Make sure **MySQL** is running locally (default port `3306`), either through a native installation, Docker, XAMPP, or WAMP.

### Step 1: Install Dependencies
Run from the root `efocus-backend` folder:
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=efocus_ecommerce
```

### Step 3: Run Database Setup
Execute the programmatic database setup script. This script automatically checks connectivity, creates the schema structure, and inserts the initial mock seed data:
```bash
npm run db:setup
```

---

## 5. Development & Execution

* **Start in Development Mode** (using `nodemon` live-reload):
  ```bash
  npm run dev
  ```
* **Start in Production Mode**:
  ```bash
  npm start
  ```

---

## 6. REST API Endpoint List

### 1. Health Check
* `GET /api/health` -> Validates API runtime status and active MySQL connection pool.

### 2. Categories
* `GET    /api/categories`
* `GET    /api/categories/:id`
* `POST   /api/categories`
* `PUT    /api/categories/:id`
* `DELETE /api/categories/:id`

### 3. Subcategories
* `GET    /api/subcategories`
* `GET    /api/subcategories/:id`
* `POST   /api/subcategories`
* `PUT    /api/subcategories/:id`
* `DELETE /api/subcategories/:id`

### 4. Product Families
* `GET    /api/families`
* `GET    /api/families/:id`
* `POST   /api/families`
* `PUT    /api/families/:id`
* `DELETE /api/families/:id`

### 5. Products (Catalog query, search & filtering)
* `GET    /api/products`
  * *Paging params*: `?page=1&limit=20` (default)
  * *Search param*: `?search=soldering` (searches name, SKU, catalog no, brand)
  * *Category filter*: `?category=SMT Equipment` or `?category=1`
  * *Family filter*: `?family=Lead-free Stations` or `?family=2`
  * *Brand filter*: `?brand=Quick`
* `GET    /api/products/:id` -> Retrieves nested list of dynamic filter specification matches.
* `POST   /api/products` -> Atomic product insert with validation checking.
* `PUT    /api/products/:id` -> Updates details and synced specifications.
* `DELETE /api/products/:id`

### 6. Product Filters (Dynamic specifications)
* `GET    /api/filters` -> Lists all filter keys globally.
* `GET    /api/filters/:familyId` -> Lists dynamic spec filters and their selection options for a product family.
* `POST   /api/filters` -> Adds filter with choice arrays.
* `PUT    /api/filters/:id` -> Re-assigns configuration details.
* `DELETE /api/filters/:id`

---

## 7. Excel Import Process

To import raw product catalog entries, we provide a CLI script:

```bash
npm run db:import [path-to-excel-file]
```
*(If no path argument is provided, the script looks for `data/products.xlsx` by default).*

### Sheet Mapping Requirements
To import successfully, ensure your Excel workbook contains the following sheet names and column headers:

1. **Category Summary**
   * Columns: `Category No`, `Category Name`, `Priority`, `Description`
2. **Product Family Config**
   * Columns: `Product Family`, `Filter Name`, `Filter Type`, `Option Values` *(comma-separated choices: e.g. "80W, 90W, 120W")*
3. **Product Master**
   * Columns: `Category`, `Sub-Category`, `Product Family`, `SKU`, `Catalog Number` (or `Cat No`), `Product Name`, `Brand`, `Short Description`, `Key Spec 1`, `Key Spec 2`, `Key Spec 3`, `Image Status`, `RFQ Eligible`

### How the importer processes data:
1. **Reads Category Summary**: Installs category-level priorities.
2. **Builds Nodes Hierarchy**: Scans the Category, Sub-Category, and Product Family text values in the *Product Master* sheet, generating database ids and building the relationship tree.
3. **Seeds Configurations**: Registers dynamic filters and available options defined in the *Product Family Config* sheet.
4. **Saves Products**: Inserts or updates products (indexed by SKU) to avoid duplicates.
5. **Populates Filters**: Matches product row column values and parses key specifications (e.g. `Power: 90W`), linking the product to its specific options.

To generate a sample mock Excel spreadsheet to test this pipeline:
```bash
node scripts/create-test-excel.js
npm run db:import
```

---

## 8. Sample JSON Payloads

### POST `/api/products` (Create Product)
```json
{
  "category_id": 2,
  "subcategory_id": 2,
  "family_id": 2,
  "sku": "SLD-NEW-99",
  "catalog_number": "QUICK-99-ESD",
  "product_name": "99W High-Frequency Soldering Station",
  "brand": "Quick",
  "short_description": "New industrial ESD-safe soldering station.",
  "key_spec_1": "Power: 99W",
  "key_spec_2": "Temp: 100-500C",
  "key_spec_3": "ESD: Yes",
  "rfq_eligible": true,
  "specs": [
    { "filter_id": 1, "option_id": 2 },
    { "filter_id": 3, "option_id": 7 }
  ]
}
```

### POST `/api/filters` (Create dynamic filter config)
```json
{
  "family_id": 2,
  "filter_name": "Thermal Control Type",
  "filter_type": "select",
  "options": ["PID Feedback Control", "Analog Dial Adjust"]
}
```

---

## 9. Verification & Automated Testing

To verify the endpoints, start the server (`npm run dev`) and run the test script:
```bash
node scripts/test-api.js
```
The test suite performs CRUD operations, test validations, searches, paginations, and verifies cascading cleanups, logging statuses to console.
