const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Note: images are stored in the DB as base64 data URLs in the `image` LONGTEXT column.
// Ensure is_veg column allows NULL if you want 'don't show' behaviour.

// GET all categories with dishes
exports.getCategories = (req, res) => {
  const sql = `
    SELECT c.category_id, c.category_name, 
           d.dish_id, d.dish_name, d.ingredients, d.price, d.image, d.is_veg, d.is_available
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

    const categories = [];
    const categoryMap = {};

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
        // is_veg might be 1,0 or NULL
        const isVeg = row.is_veg === null ? null : !!row.is_veg;
        const isAvailable = row.is_available === null ? true : !!row.is_available; // default true if null

        categoryMap[row.category_id].items.push({
          id: row.dish_id,
          name: row.dish_name,
          ingredients: row.ingredients,
          price: row.price,
          image: row.image || null,
          isVeg: isVeg,
          isAvailable: isAvailable
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

  db.query(sql, [name.trim()], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to add category'
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

// Helper to parse vegOption/is_available from request
function parseVegAndAvailability(req) {
  // vegOption: 'dont_show' | 'veg' | 'nonveg' (can come from form or JSON)
  const vegOption = req.body.vegOption ?? req.body.is_veg_option ?? null;
  let is_veg = null;
  if (vegOption === 'veg' || vegOption === '1' || vegOption === 'true') {
    is_veg = 1;
  } else if (vegOption === 'nonveg' || vegOption === '0' || vegOption === 'false') {
    is_veg = 0;
  } else {
    // 'dont_show' or undefined -> keep null
    is_veg = null;
  }

  // is_available: accept '1'/'0', boolean, or missing (default to 1)
  let is_available = 1;
  if (req.body.is_available !== undefined) {
    const val = req.body.is_available;
    if (val === '0' || val === 0 || val === 'false' || val === false) {
      is_available = 0;
    } else {
      is_available = 1;
    }
  }

  return { is_veg, is_available };
}

// ADD dish to category
// Accepts file uploads (req.file via multer) OR JSON with an `image` base64 data URL
exports.addItem = (req, res) => {
  const { categoryId } = req.params;
  const { name, ingredients, price } = req.body;

  console.log('Add item request:', { categoryId, name, ingredients, price, hasFile: !!req.file, hasImageBody: !!req.body.image });

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

  if (!price || Number(price) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid price is required'
    });
  }

  let imageData = null;

  // Image: multipart file has priority
  if (req.file) {
    try {
      const base64 = req.file.buffer.toString('base64');
      const mime = req.file.mimetype || 'image/png';
      imageData = `data:${mime};base64,${base64}`;
      console.log('Image converted to base64 from multipart upload');
    } catch (err) {
      console.error('Image conversion error (file):', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to process uploaded image'
      });
    }
  } else if (req.body.image) {
    try {
      if (typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
        imageData = req.body.image;
        console.log('Image received as base64 string in request body');
      } else {
        return res.status(400).json({
          success: false,
          message: 'Image must be a data URL (data:<mime>;base64,...)'
        });
      }
    } catch (err) {
      console.error('Image conversion error (body):', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to process image body'
      });
    }
  }

  const { is_veg, is_available } = parseVegAndAvailability(req);

  // Convert ingredients to string if it's an array
  const ingredientsStr = typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients);

  const sql = `
    INSERT INTO dishes (category_id, dish_name, ingredients, price, image, is_veg, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [categoryId, name.trim(), ingredientsStr, price, imageData, is_veg, is_available], (err, result) => {
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

// UPDATE existing dish
exports.updateItem = (req, res) => {
  const { categoryId, itemId } = req.params;
  const { name, ingredients, price } = req.body;

  console.log('Update item request:', { categoryId, itemId, name, ingredients, price, hasFile: !!req.file, hasImageBody: !!req.body.image });

  // Basic validation: at least one field must be provided to update
  if (!name && !ingredients && !price && !req.file && !req.body.image && req.body.vegOption === undefined && req.body.is_available === undefined) {
    return res.status(400).json({
      success: false,
      message: 'No update fields provided'
    });
  }

  // Build update parts and params dynamically
  const fields = [];
  const params = [];

  if (name !== undefined) {
    fields.push('dish_name = ?');
    params.push(name.trim());
  }

  if (ingredients !== undefined) {
    const ingredientsStr = typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients);
    fields.push('ingredients = ?');
    params.push(ingredientsStr);
  }

  if (price !== undefined) {
    fields.push('price = ?');
    params.push(price);
  }

  // Handle image update (if provided)
  if (req.file) {
    try {
      const base64 = req.file.buffer.toString('base64');
      const mime = req.file.mimetype || 'image/png';
      const imageData = `data:${mime};base64,${base64}`;
      fields.push('image = ?');
      params.push(imageData);
    } catch (err) {
      console.error('Image conversion error (update file):', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to process uploaded image'
      });
    }
  } else if (req.body.image) {
    if (typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
      fields.push('image = ?');
      params.push(req.body.image);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Image must be a data URL (data:<mime>;base64,...)'
      });
    }
  }

  // veg and availability
  const { is_veg, is_available } = parseVegAndAvailability(req);
  if (req.body.vegOption !== undefined) {
    fields.push('is_veg = ?');
    params.push(is_veg);
  }
  if (req.body.is_available !== undefined) {
    fields.push('is_available = ?');
    params.push(is_available);
  }

  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  const sql = `UPDATE dishes SET ${fields.join(', ')} WHERE dish_id = ? AND category_id = ?`;
  params.push(itemId, categoryId);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Database error (update):', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update dish'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
    }

    res.json({
      success: true,
      message: 'Dish updated successfully'
    });
  });
};

// DELETE dish
exports.deleteItem = (req, res) => {
  const { categoryId, itemId } = req.params;

  // No filesystem cleanup required — images stored in DB
  const selectSql = 'SELECT image FROM dishes WHERE dish_id = ? AND category_id = ?';

  db.query(selectSql, [itemId, categoryId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
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