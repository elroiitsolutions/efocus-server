const FamilyModel = require('../models/family.model');
const SubcategoryModel = require('../models/subcategory.model');

class FamilyService {
  static async getAllFamilies() {
    return await FamilyModel.findAll();
  }

  static async getFamilyById(id) {
    const family = await FamilyModel.findById(id);
    if (!family) {
      const err = new Error(`Product Family with ID ${id} not found.`);
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }
    return family;
  }

  static async createFamily(familyData) {
    const errors = {};
    if (!familyData.subcategory_id) errors.subcategory_id = 'Subcategory ID is required.';
    if (!familyData.name) errors.name = 'Family name is required.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    // Verify subcategory exists
    const subcategory = await SubcategoryModel.findById(familyData.subcategory_id);
    if (!subcategory) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { subcategory_id: `Subcategory with ID ${familyData.subcategory_id} does not exist.` };
      throw err;
    }

    // Verify name is unique within this subcategory
    const existingFamily = await FamilyModel.findByNameAndSubcategory(familyData.name, familyData.subcategory_id);
    if (existingFamily) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { name: `Product family '${familyData.name}' already exists in this subcategory.` };
      throw err;
    }

    const familyId = await FamilyModel.create(familyData);
    return await FamilyModel.findById(familyId);
  }

  static async updateFamily(id, familyData) {
    const currentFamily = await this.getFamilyById(id);

    const errors = {};
    if (!familyData.subcategory_id) errors.subcategory_id = 'Subcategory ID is required.';
    if (!familyData.name) errors.name = 'Family name is required.';

    if (Object.keys(errors).length > 0) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = errors;
      throw err;
    }

    // Verify subcategory exists
    const subcategory = await SubcategoryModel.findById(familyData.subcategory_id);
    if (!subcategory) {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { subcategory_id: `Subcategory with ID ${familyData.subcategory_id} does not exist.` };
      throw err;
    }

    // Verify unique name in the subcategory
    if (familyData.name !== currentFamily.name || familyData.subcategory_id !== currentFamily.subcategory_id) {
      const existingFamily = await FamilyModel.findByNameAndSubcategory(familyData.name, familyData.subcategory_id);
      if (existingFamily && existingFamily.id !== id) {
        const err = new Error('Validation failed');
        err.name = 'ValidationError';
        err.errors = { name: `Product family '${familyData.name}' already exists in the selected subcategory.` };
        throw err;
      }
    }

    await FamilyModel.update(id, {
      subcategory_id: familyData.subcategory_id,
      name: familyData.name,
      description: familyData.description !== undefined ? familyData.description : currentFamily.description
    });

    return await FamilyModel.findById(id);
  }

  static async deleteFamily(id) {
    await this.getFamilyById(id);
    await FamilyModel.delete(id);
    return true;
  }
}

module.exports = FamilyService;
