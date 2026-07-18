const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const multer = require('multer');

// Multer config for image upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET all categories with dishes
router.get('/', categoryController.getCategories);

// POST new category
router.post('/', categoryController.addCategory);

// DELETE category
router.delete('/:id', categoryController.deleteCategory);

// POST dish to category with image upload
router.post('/:categoryId/items', upload.single('image'), categoryController.addItem);

// DELETE dish
router.delete('/:categoryId/items/:itemId', categoryController.deleteItem);

module.exports = router;
