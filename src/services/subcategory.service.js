const SubcategoryModel = require('../models/subcategory.model');
const CategoryModel = require('../models/category.model');

class SubcategoryService {
  static async getAllSubcategories() {
    return await SubcategoryModel.findAll();
  }

  static async getSubcategoryById(id) {
    const subcategory = await SubcategoryModel.findById(id);
    if (!subcategory) {
      const err = new Error(`Subcategory with ID ${id} not found.`);
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }
    return subcategory;
  }

  static async createSubcategory(subcategoryData) {
    const errors = {};
    if (!subcategoryData.category_id) errors.category_id = 'Category ID is required.';
    if (!subcategoryData.name) errors.name = 'Subcategory name is required.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    // Verify parent category exists
    const category = await CategoryModel.findById(subcategoryData.category_id);
    if (!category) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { category_id: `Category with ID ${subcategoryData.category_id} does not exist.` };
      throw err;
    }

    // Verify name is unique within this category
    const existingSub = await SubcategoryModel.findByNameAndCategory(subcategoryData.name, subcategoryData.category_id);
    if (existingSub) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { name: `Subcategory name '${subcategoryData.name}' already exists in this category.` };
      throw err;
    }

    const subcategoryId = await SubcategoryModel.create(subcategoryData);
    return await SubcategoryModel.findById(subcategoryId);
  }

  static async updateSubcategory(id, subcategoryData) {
    const currentSub = await this.getSubcategoryById(id);

    const errors = {};
    if (!subcategoryData.category_id) errors.category_id = 'Category ID is required.';
    if (!subcategoryData.name) errors.name = 'Subcategory name is required.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    // Verify category exists
    const category = await CategoryModel.findById(subcategoryData.category_id);
    if (!category) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { category_id: `Category with ID ${subcategoryData.category_id} does not exist.` };
      throw err;
    }

    // Verify unique subcategory name in the category
    if (subcategoryData.name !== currentSub.name || subcategoryData.category_id !== currentSub.category_id) {
      const existingSub = await SubcategoryModel.findByNameAndCategory(subcategoryData.name, subcategoryData.category_id);
      if (existingSub && existingSub.id !== id) {
        const err = new Error('Validation failed');
        err.name = 'ValidationError';
        err.errors = { name: `Subcategory name '${subcategoryData.name}' already exists in the selected category.` };
        throw err;
      }
    }

    await SubcategoryModel.update(id, {
      category_id: subcategoryData.category_id,
      name: subcategoryData.name,
      description: subcategoryData.description !== undefined ? subcategoryData.description : currentSub.description
    });

    return await SubcategoryModel.findById(id);
  }

  static async deleteSubcategory(id) {
    await this.getSubcategoryById(id);
    await SubcategoryModel.delete(id);
    return true;
  }
}

module.exports = SubcategoryService;
