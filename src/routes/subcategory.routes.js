const express = require('express');
const SubcategoryController = require('../controllers/subcategory.controller');
const { validateId } = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/', SubcategoryController.getAllSubcategories);
router.get('/:id', validateId('id'), SubcategoryController.getSubcategoryById);
router.post('/', SubcategoryController.createSubcategory);
router.put('/:id', validateId('id'), SubcategoryController.updateSubcategory);
router.delete('/:id', validateId('id'), SubcategoryController.deleteSubcategory);

module.exports = router;
