const db = require('../config/db');

// GET admin settings
exports.getSettings = (req, res) => {
  const { adminId } = req.params;

  const sql = 'SELECT id, username, full_name, restaurant_name, admin_name FROM admins WHERE id = ?';

  db.query(sql, [adminId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch settings'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
};

// UPDATE admin settings
exports.updateSettings = (req, res) => {
  const { adminId } = req.params;
  const { username, restaurant_name, admin_name, password } = req.body;

  // Validation
  if (!restaurant_name || !restaurant_name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Restaurant name is required'
    });
  }

  if (!admin_name || !admin_name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Admin name is required'
    });
  }

  if (!username || !username.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Username is required'
    });
  }

  // Build dynamic update query
  let sql = 'UPDATE admins SET username = ?, restaurant_name = ?, admin_name = ?';
  let params = [username.trim(), restaurant_name.trim(), admin_name.trim()];

  if (password && password.trim()) {
    sql += ', password = ?';
    params.push(password.trim());
  }

  sql += ' WHERE id = ?';
  params.push(adminId);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to update settings'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  });
};