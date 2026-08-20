const FamilyService = require('../services/family.service');
const { sendSuccess } = require('../utils/response');

class FamilyController {
  static async getAllFamilies(req, res, next) {
    try {
      const families = await FamilyService.getAllFamilies();
      return sendSuccess(res, families);
    } catch (error) {
      next(error);
    }
  }

  static async getFamilyById(req, res, next) {
    try {
      const family = await FamilyService.getFamilyById(req.params.id);
      return sendSuccess(res, family);
    } catch (error) {
      next(error);
    }
  }

  static async createFamily(req, res, next) {
    try {
      const family = await FamilyService.createFamily(req.body);
      return sendSuccess(res, family, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateFamily(req, res, next) {
    try {
      const family = await FamilyService.updateFamily(req.params.id, req.body);
      return sendSuccess(res, family);
    } catch (error) {
      next(error);
    }
  }

  static async deleteFamily(req, res, next) {
    try {
      await FamilyService.deleteFamily(req.params.id);
      return sendSuccess(res, { message: 'Product family deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FamilyController;
