const express = require('express');
const FilterController = require('../controllers/filter.controller');
const { validateId } = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/', FilterController.getAllFilters);
router.get('/:familyId', validateId('familyId'), FilterController.getFiltersByFamilyId);
router.post('/', FilterController.createFilter);
router.put('/:id', validateId('id'), FilterController.updateFilter);
router.delete('/:id', validateId('id'), FilterController.deleteFilter);

module.exports = router;
