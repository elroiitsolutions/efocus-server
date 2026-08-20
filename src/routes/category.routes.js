const express = require('express');
const CategoryController = require('../controllers/category.controller');
const { validateId } = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/', CategoryController.getAllCategories);
router.get('/navigation', CategoryController.getNavigationTree);
router.get('/:id', validateId('id'), CategoryController.getCategoryById);
router.post('/', CategoryController.createCategory);
router.put('/:id', validateId('id'), CategoryController.updateCategory);
router.delete('/:id', validateId('id'), CategoryController.deleteCategory);

module.exports = router;
