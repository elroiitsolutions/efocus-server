const express = require('express');
const ProductController = require('../controllers/product.controller');
const { validateId } = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/', ProductController.getProducts);
router.get('/brands', ProductController.getBrands);
router.get('/:id', validateId('id'), ProductController.getProductById);
router.post('/', ProductController.createProduct);
router.put('/:id', validateId('id'), ProductController.updateProduct);
router.delete('/:id', validateId('id'), ProductController.deleteProduct);

module.exports = router;
