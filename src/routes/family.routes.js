const express = require('express');
const FamilyController = require('../controllers/family.controller');
const { validateId } = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/', FamilyController.getAllFamilies);
router.get('/:id', validateId('id'), FamilyController.getFamilyById);
router.post('/', FamilyController.createFamily);
router.put('/:id', validateId('id'), FamilyController.updateFamily);
router.delete('/:id', validateId('id'), FamilyController.deleteFamily);

module.exports = router;
