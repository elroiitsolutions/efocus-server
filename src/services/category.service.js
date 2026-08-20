const CategoryModel = require('../models/category.model');

class CategoryService {
  static async getAllCategories() {
    return await CategoryModel.findAll();
  }

  static async getNavigationTree() {
    return await CategoryModel.getNavigationTree();
  }

  static async getCategoryById(id) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      const err = new Error(`Category with ID ${id} not found.`);
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }
    return category;
  }

  static async createCategory(categoryData) {
    // Validate request data
    const errors = {};
    if (!categoryData.category_no) errors.category_no = 'Category number is required.';
    if (!categoryData.name) errors.name = 'Category name is required.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    // Check if category_no already exists
    const existingCategory = await CategoryModel.findByCategoryNo(categoryData.category_no);
    if (existingCategory) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { category_no: `Category number '${categoryData.category_no}' is already in use.` };
      throw err;
    }

    const categoryId = await CategoryModel.create(categoryData);
    return await CategoryModel.findById(categoryId);
  }

  static async updateCategory(id, categoryData) {
    // Check if category exists
    const currentCategory = await this.getCategoryById(id);

    // Validate request data
    const errors = {};
    if (!categoryData.category_no) errors.category_no = 'Category number is required.';
    if (!categoryData.name) errors.name = 'Category name is required.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    // Check if category_no already exists on another category
    if (categoryData.category_no !== currentCategory.category_no) {
      const existingCategory = await CategoryModel.findByCategoryNo(categoryData.category_no);
      if (existingCategory && existingCategory.id !== id) {
        const err = new Error('Validation failed');
        err.name = 'ValidationError';
        err.errors = { category_no: `Category number '${categoryData.category_no}' is already in use.` };
        throw err;
      }
    }

    await CategoryModel.update(id, {
      category_no: categoryData.category_no,
      name: categoryData.name,
      priority: categoryData.priority !== undefined ? categoryData.priority : currentCategory.priority,
      description: categoryData.description !== undefined ? categoryData.description : currentCategory.description
    });

    return await CategoryModel.findById(id);
  }

  static async deleteCategory(id) {
    // Verify existence
    await this.getCategoryById(id);
    await CategoryModel.delete(id);
    return true;
  }
}

module.exports = CategoryService;
