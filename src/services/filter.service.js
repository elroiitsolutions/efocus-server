const FilterModel = require('../models/filter.model');
const FamilyModel = require('../models/family.model');
const { pool } = require('../config/database');

class FilterService {
  static async getAllFilters() {
    return await FilterModel.findAll();
  }

  static async getFiltersByFamilyId(familyId) {
    // Check if product family exists
    const family = await FamilyModel.findById(familyId);
    if (!family) {
      const err = new Error(`Product Family with ID ${familyId} not found.`);
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    const filters = await FilterModel.findFiltersByFamilyId(familyId);
    
    // Embed options for each filter
    for (const filter of filters) {
      filter.options = await FilterModel.findOptionsByFilterId(filter.id);
    }
    
    return filters;
  }

  static async getFilterById(id) {
    const filter = await FilterModel.findById(id);
    if (!filter) {
      const err = new Error(`Filter with ID ${id} not found.`);
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }
    return filter;
  }

  static async createFilter(filterData) {
    const { family_id, filter_name, filter_type = 'select', options } = filterData;

    const errors = {};
    if (!family_id) errors.family_id = 'Family ID is required.';
    if (!filter_name) errors.filter_name = 'Filter name is required.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    // Verify product family exists
    const family = await FamilyModel.findById(family_id);
    if (!family) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { family_id: `Product Family with ID ${family_id} does not exist.` };
      throw err;
    }

    // Verify filter name is unique within this product family
    const existingFilter = await FilterModel.findFilterByFamilyAndName(family_id, filter_name);
    if (existingFilter) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { filter_name: `Filter name '${filter_name}' already exists for this product family.` };
      throw err;
    }

    // Insert filter and optional options using a transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const filterId = await FilterModel.createFilter({ family_id, filter_name, filter_type }, connection);

      if (options && Array.isArray(options) && options.length > 0) {
        for (const optionValue of options) {
          if (optionValue) {
            await FilterModel.createOption({ filter_id: filterId, option_value: optionValue }, connection);
          }
        }
      }

      await connection.commit();
      
      const filter = await FilterModel.findById(filterId);
      filter.options = await FilterModel.findOptionsByFilterId(filterId);
      return filter;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async updateFilter(id, filterData) {
    const currentFilter = await this.getFilterById(id);
    const { family_id, filter_name, filter_type = 'select', options } = filterData;

    const errors = {};
    if (!family_id) errors.family_id = 'Family ID is required.';
    if (!filter_name) errors.filter_name = 'Filter name is required.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    // Verify family exists
    const family = await FamilyModel.findById(family_id);
    if (!family) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { family_id: `Product Family with ID ${family_id} does not exist.` };
      throw err;
    }

    // Verify uniqueness
    if (filter_name !== currentFilter.filter_name || family_id !== currentFilter.family_id) {
      const existingFilter = await FilterModel.findFilterByFamilyAndName(family_id, filter_name);
      if (existingFilter && existingFilter.id !== id) {
        const err = new Error('Validation failed');
        err.name = 'ValidationError';
        err.errors = { filter_name: `Filter name '${filter_name}' already exists in the selected product family.` };
        throw err;
      }
    }

    // Update filter and options with a transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await FilterModel.updateFilter(id, { family_id, filter_name, filter_type });

      // If options are provided, sync them
      if (options && Array.isArray(options)) {
        await FilterModel.deleteOptionsByFilterId(id, connection);
        for (const optionValue of options) {
          if (optionValue) {
            await FilterModel.createOption({ filter_id: id, option_value: optionValue }, connection);
          }
        }
      }

      await connection.commit();
      
      const filter = await FilterModel.findById(id);
      filter.options = await FilterModel.findOptionsByFilterId(id);
      return filter;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async deleteFilter(id) {
    await this.getFilterById(id);
    await FilterModel.deleteFilter(id);
    return true;
  }
}

module.exports = FilterService;
