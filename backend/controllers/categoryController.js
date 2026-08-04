const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// GET all categories with dishes
// GET all categories with dishes
exports.getCategories = (req, res) => {
  const sql = `
    SELECT c.category_id, c.category_name, 
           d.dish_id, d.dish_name, d.ingredients, d.price, d.image_url, d.is_veg, d.is_available
    FROM categories c
    LEFT JOIN dishes d ON c.category_id = d.category_id
    ORDER BY c.category_id, d.dish_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }

    // Transform flat results into nested structure
    const categories = [];
    const categoryMap = {};
    const BASE_URL = process.env.BASE_URL || null;   // ✅ Add base URL

    results.forEach(row => {
      if (!categoryMap[row.category_id]) {
        categoryMap[row.category_id] = {
          id: row.category_id,
          name: row.category_name,
          items: []
        };
        categories.push(categoryMap[row.category_id]);
      }

      if (row.dish_id) {
        // detect common image fields from different imports
        let imageUrl = row.image_url || row.image || row.imagePath || null;

        if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
          // prefer explicit BASE_URL env var; otherwise fallback to request host at runtime
          const hostBase = BASE_URL || (req && req.protocol && req.get ? `${req.protocol}://${req.get('host')}` : '');
          // ensure leading slash
          imageUrl = `${hostBase}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
        }

        categoryMap[row.category_id].items.push({
          id: row.dish_id,
          name: row.dish_name,
          ingredients: row.ingredients,
          price: row.price,
          image: imageUrl,
          isVeg: !!row.is_veg,
          isAvailable: !!row.is_available
        });
      }
    });

    res.json({
      success: true,
      data: categories
    });
  });
};

// ADD new category
exports.addCategory = (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required'
    });
  }

  const sql = 'INSERT INTO categories (category_name) VALUES (?)';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Database error in getCategories:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Category added successfully',
      categoryId: result.insertId
    });
  });
};

// DELETE category
exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM categories WHERE category_id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete category'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  });
};

// ADD dish to category
exports.addItem = (req, res) => {
  const { categoryId } = req.params;
  const { name, ingredients, price } = req.body;

  console.log('Add item request:', { categoryId, name, ingredients, price, file: req.file });

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Dish name is required'
    });
  }

  if (!ingredients) {
    return res.status(400).json({
      success: false,
      message: 'Ingredients are required'
    });
  }

  if (!price || price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid price is required'
    });
  }

  let imageUrl = null;

  // Handle image upload
  if (req.file) {
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(uploadsDir, fileName);

    try {
      // Save file to uploads folder
      fs.writeFileSync(filePath, req.file.buffer);
      imageUrl = `/uploads/${fileName}`;
      console.log('Image saved:', imageUrl);
    } catch (err) {
      console.error('File save error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to save image'
      });
    }
  }

  // Convert ingredients to string if it's an array
  const ingredientsStr = typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients);

  const sql = `
    INSERT INTO dishes (category_id, dish_name, ingredients, price, image_url, is_veg, is_available)
    VALUES (?, ?, ?, ?, ?, 0, 1)
  `;

  db.query(sql, [categoryId, name.trim(), ingredientsStr, price, imageUrl], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to add dish'
      });
    }

    res.json({
      success: true,
      message: 'Dish added successfully',
      dishId: result.insertId
    });
  });
};

// DELETE dish
exports.deleteItem = (req, res) => {
  const { categoryId, itemId } = req.params;

  // First get the image path to delete from filesystem
  const selectSql = 'SELECT image_url FROM dishes WHERE dish_id = ? AND category_id = ?';

  db.query(selectSql, [itemId, categoryId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
    }

    const imageUrl = results[0].image_url;

    // Delete image file if exists
    if (imageUrl) {
      const filePath = path.join(__dirname, '..', imageUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('Image deleted:', filePath);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    // Delete from database
    const deleteSql = 'DELETE FROM dishes WHERE dish_id = ? AND category_id = ?';

    db.query(deleteSql, [itemId, categoryId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete dish'
        });
      }

      res.json({
        success: true,
        message: 'Dish deleted successfully'
      });
    });
  });
};
