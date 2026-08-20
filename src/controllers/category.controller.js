const CategoryService = require('../services/category.service');
const { sendSuccess } = require('../utils/response');

class CategoryController {
  static async getAllCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories();
      return sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  static async getNavigationTree(req, res, next) {
    try {
      const tree = await CategoryService.getNavigationTree();
      return sendSuccess(res, tree);
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryById(req, res, next) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      return sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return sendSuccess(res, category, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      return sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      await CategoryService.deleteCategory(req.params.id);
      return sendSuccess(res, { message: 'Category deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
