const ProductModel = require('../models/product.model');
const CategoryModel = require('../models/category.model');
const SubcategoryModel = require('../models/subcategory.model');
const FamilyModel = require('../models/family.model');
const FilterModel = require('../models/filter.model');
const { pool } = require('../config/database');

class ProductService {
  static async getProducts(params) {
    const { rows, total } = await ProductModel.findAndCount(params);
    return { rows, total };
  }

  static async getProductById(id) {
    const product = await ProductModel.findById(id);
    if (!product) {
      const err = new Error(`Product with ID ${id} not found.`);
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    // Attach dynamic filter specifications
    const specs = await ProductModel.getProductSpecs(id);
    product.specs = specs;

    return product;
  }

  static async createProduct(productData) {
    // 1. Basic Fields Validation
    const errors = {};
    if (!productData.sku) errors.sku = 'SKU is required.';
    if (!productData.product_name) errors.product_name = 'Product name is required.';
    if (!productData.brand) errors.brand = 'Brand is required.';
    if (!productData.category_id) errors.category_id = 'Category ID is required.';
    if (!productData.subcategory_id) errors.subcategory_id = 'Subcategory ID is required.';
    if (!productData.family_id) errors.family_id = 'Product Family ID is required.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    // 2. Validate Relational Consistencies
    await this.validateHierarchy(
      productData.category_id,
      productData.subcategory_id,
      productData.family_id
    );

    // 3. Check SKU Unique constraint
    const existingSku = await ProductModel.findBySku(productData.sku);
    if (existingSku) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { sku: `SKU '${productData.sku}' is already in use.` };
      throw err;
    }

    // 4. Validate Specifications if present
    let validatedSpecs = [];
    if (productData.specs && Array.isArray(productData.specs)) {
      validatedSpecs = await this.validateAndFormatSpecs(productData.family_id, productData.specs);
    }

    // 5. Save with Transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const productId = await ProductModel.create(productData, connection);
      
      if (validatedSpecs.length > 0) {
        await ProductModel.saveFilterValues(productId, validatedSpecs, connection);
      }

      await connection.commit();
      return await this.getProductById(productId);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async updateProduct(id, productData) {
    const currentProduct = await this.getProductById(id);

    // 1. Basic Fields Validation
    const errors = {};
    if (!productData.sku) errors.sku = 'SKU is required.';
    if (!productData.product_name) errors.product_name = 'Product name is required.';
    if (!productData.brand) errors.brand = 'Brand is required.';
    if (!productData.category_id) errors.category_id = 'Category ID is required.';
    if (!productData.subcategory_id) errors.subcategory_id = 'Subcategory ID is required.';
    if (!productData.family_id) errors.family_id = 'Product Family ID is required.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    // 2. Validate Relational Consistencies
    await this.validateHierarchy(
      productData.category_id,
      productData.subcategory_id,
      productData.family_id
    );

    // 3. Check SKU uniqueness for other products
    if (productData.sku !== currentProduct.sku) {
      const existingSku = await ProductModel.findBySku(productData.sku);
      if (existingSku && existingSku.id !== id) {
        const err = new Error('Validation failed');
        err.name = 'ValidationError';
        err.errors = { sku: `SKU '${productData.sku}' is already in use by another product.` };
        throw err;
      }
    }

    // 4. Validate Specifications if present
    let validatedSpecs = [];
    if (productData.specs && Array.isArray(productData.specs)) {
      validatedSpecs = await this.validateAndFormatSpecs(productData.family_id, productData.specs);
    }

    // 5. Save with Transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await ProductModel.update(id, productData, connection);
      
      // If specs array is provided, sync it. Otherwise, keep existing specs.
      if (productData.specs && Array.isArray(productData.specs)) {
        await ProductModel.saveFilterValues(id, validatedSpecs, connection);
      }

      await connection.commit();
      return await this.getProductById(id);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async deleteProduct(id) {
    await this.getProductById(id);
    await ProductModel.delete(id);
    return true;
  }

  /**
   * Enforces consistency in category -> subcategory -> product family relationships.
   */
  static async validateHierarchy(categoryId, subcategoryId, familyId) {
    // 1. Verify category exists
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { category_id: `Category with ID ${categoryId} does not exist.` };
      throw err;
    }

    // 2. Verify subcategory exists and belongs to the category
    const subcategory = await SubcategoryModel.findById(subcategoryId);
    if (!subcategory) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { subcategory_id: `Subcategory with ID ${subcategoryId} does not exist.` };
      throw err;
    }
    if (subcategory.category_id !== categoryId) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { subcategory_id: `Subcategory '${subcategory.name}' belongs to category '${subcategory.category_name}', not the selected category '${category.name}'.` };
      throw err;
    }

    // 3. Verify family exists and belongs to the subcategory
    const family = await FamilyModel.findById(familyId);
    if (!family) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { family_id: `Product family with ID ${familyId} does not exist.` };
      throw err;
    }
    if (family.subcategory_id !== subcategoryId) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { family_id: `Product family '${family.name}' belongs to subcategory '${family.subcategory_name}', not the selected subcategory '${subcategory.name}'.` };
      throw err;
    }
  }

  /**
   * Validates dynamic specifications input against the product family filter configurations.
   */
  static async validateAndFormatSpecs(familyId, specs) {
    // Load defined filters for the family
    const familyFilters = await FilterModel.findFiltersByFamilyId(familyId);
    const filterMap = new Map(familyFilters.map(f => [f.id, f]));

    const formattedSpecs = [];
    const errors = {};

    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const { filter_id, option_id, value } = spec;

      if (!filter_id) {
        errors[`specs[${i}].filter_id`] = 'filter_id is required.';
        continue;
      }

      const definedFilter = filterMap.get(filter_id);
      if (!definedFilter) {
        errors[`specs[${i}].filter_id`] = `Filter ID ${filter_id} does not apply to this Product Family.`;
        continue;
      }

      if (option_id) {
        // Load defined options for this filter to verify
        const filterOptions = await FilterModel.findOptionsByFilterId(filter_id);
        const hasOption = filterOptions.some(opt => opt.id === option_id);
        if (!hasOption) {
          errors[`specs[${i}].option_id`] = `Option ID ${option_id} is not valid for filter '${definedFilter.filter_name}'.`;
          continue;
        }
      }

      formattedSpecs.push({
        filter_id,
        option_id: option_id || null,
        value: value || null
      });
    }

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    return formattedSpecs;
  }

  static async getBrands() {
    return await ProductModel.getBrands();
  }
}

module.exports = ProductService;
