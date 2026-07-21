const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// GET admin settings
router.get('/:adminId', settingsController.getSettings);

// UPDATE admin settings
router.put('/:adminId', settingsController.updateSettings);

module.exports = router;