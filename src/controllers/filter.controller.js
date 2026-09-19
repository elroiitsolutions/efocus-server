const FilterService = require('../services/filter.service');
const { sendSuccess } = require('../utils/response');

class FilterController {
  static async getAllFilters(req, res, next) {
    try {
      const filters = await FilterService.getAllFilters();
      return sendSuccess(res, filters);
    } catch (error) {
      next(error);
    }
  }

  static async getFiltersByContext(req, res, next) {
    try {
      const filters = await FilterService.getFiltersByContext(req.query);
      return sendSuccess(res, filters);
    } catch (error) {
      next(error);
    }
  }

  static async getFiltersByFamilyId(req, res, next) {
    try {
      const filters = await FilterService.getFiltersByFamilyId(req.params.familyId);
      return sendSuccess(res, filters);
    } catch (error) {
      next(error);
    }
  }

  static async createFilter(req, res, next) {
    try {
      const filter = await FilterService.createFilter(req.body);
      return sendSuccess(res, filter, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateFilter(req, res, next) {
    try {
      const filter = await FilterService.updateFilter(req.params.id, req.body);
      return sendSuccess(res, filter);
    } catch (error) {
      next(error);
    }
  }

  static async deleteFilter(req, res, next) {
    try {
      await FilterService.deleteFilter(req.params.id);
      return sendSuccess(res, { message: 'Filter deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FilterController;
