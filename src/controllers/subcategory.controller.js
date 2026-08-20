const SubcategoryService = require('../services/subcategory.service');
const { sendSuccess } = require('../utils/response');

class SubcategoryController {
  static async getAllSubcategories(req, res, next) {
    try {
      const subcategories = await SubcategoryService.getAllSubcategories();
      return sendSuccess(res, subcategories);
    } catch (error) {
      next(error);
    }
  }

  static async getSubcategoryById(req, res, next) {
    try {
      const subcategory = await SubcategoryService.getSubcategoryById(req.params.id);
      return sendSuccess(res, subcategory);
    } catch (error) {
      next(error);
    }
  }

  static async createSubcategory(req, res, next) {
    try {
      const subcategory = await SubcategoryService.createSubcategory(req.body);
      return sendSuccess(res, subcategory, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateSubcategory(req, res, next) {
    try {
      const subcategory = await SubcategoryService.updateSubcategory(req.params.id, req.body);
      return sendSuccess(res, subcategory);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubcategory(req, res, next) {
    try {
      await SubcategoryService.deleteSubcategory(req.params.id);
      return sendSuccess(res, { message: 'Subcategory deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SubcategoryController;
