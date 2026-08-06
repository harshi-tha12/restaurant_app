const db = require('../config/db');

function sendServerError(res, message, err) {
  console.error(message, err && (err.sqlMessage || err.message || err));
  return res.status(500).json({ success: false, message });
}

exports.createOrder = (req, res) => {
  try {
    const { order_ref, table, items, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items required' });
    }

    const orderRef = order_ref || ('ORD-' + Date.now().toString().slice(-6));
    const tableNo = table || null;
    const orderTotal = (typeof total === 'number' && !isNaN(total)) ? total :
      items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    const insertOrderSql = 'INSERT INTO orders (order_ref, table_no, status, total) VALUES (?, ?, ?, ?)';
    console.log('Creating order:', { orderRef, tableNo, orderTotal, itemsCount: items.length });

    db.query(insertOrderSql, [orderRef, tableNo, 'new', orderTotal], (err, result) => {
      if (err) return sendServerError(res, 'Failed to insert order', err);

      const orderId = result.insertId;
      const itemsValues = items.map(it => [orderId, it.id || null, it.name || '', Number(it.price || 0), Number(it.quantity || 1)]);

      if (!itemsValues.length) {
        // shouldn't happen because we validated earlier, but guard anyway
        return res.json({ success: true, order: { id: orderId, order_ref: orderRef, table: tableNo, total: orderTotal, status: 'new', created_at: new Date() } });
      }

      const insertItemsSql = 'INSERT INTO order_items (order_id, dish_id, name, price, quantity) VALUES ?';
      db.query(insertItemsSql, [itemsValues], (err2) => {
        if (err2) return sendServerError(res, 'Failed to insert order items', err2);

        return res.json({
          success: true,
          order: {
            id: orderId,
            order_ref: orderRef,
            table: tableNo,
            total: orderTotal,
            status: 'new',
            created_at: new Date()
          }
        });
      });
    });
  } catch (ex) {
    return sendServerError(res, 'Unexpected server error creating order', ex);
  }
};

exports.getOrders = (req, res) => {
  try {
    const status = req.query.status;
    let sql = `
      SELECT o.id, o.order_ref, o.table_no, o.status, o.total, o.created_at,
             oi.id AS item_id, oi.dish_id, oi.name AS item_name, oi.price, oi.quantity
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    const params = [];
    if (status === 'new') {
      sql += ' WHERE o.status = ?';
      params.push('new');
    } else if (status === 'past') {
      sql += ' WHERE o.status IN (?, ?)';
      params.push('completed', 'cancelled');
    }
    sql += ' ORDER BY o.created_at DESC, o.id, oi.id';

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error('Error fetching orders:', err && (err.sqlMessage || err.message || err));
        return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
      }

      const ordersMap = {};
      results.forEach(row => {
        if (!ordersMap[row.id]) {
          ordersMap[row.id] = {
            id: row.id,
            order_ref: row.order_ref,
            table: row.table_no,
            status: row.status,
            total: row.total,
            created_at: row.created_at,
            items: []
          };
        }
        if (row.item_id) {
          ordersMap[row.id].items.push({
            id: row.item_id,
            dish_id: row.dish_id,
            name: row.item_name,
            price: row.price,
            quantity: row.quantity
          });
        }
      });

      const orders = Object.values(ordersMap);
      return res.json({ success: true, data: orders });
    });
  } catch (ex) {
    console.error('Unexpected server error fetching orders', ex && (ex.message || ex));
    return res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
};

exports.updateOrderStatus = (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status required' });
    }
    const sql = 'UPDATE orders SET status = ? WHERE id = ?';
    db.query(sql, [status, orderId], (err) => {
      if (err) {
        console.error('Error updating order status:', err && (err.sqlMessage || err.message || err));
        return res.status(500).json({ success: false, message: 'Failed to update status' });
      }
      return res.json({ success: true, message: 'Order status updated' });
    });
  } catch (ex) {
    console.error('Unexpected server error updating order status', ex && (ex.message || ex));
    return res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
};

// NEW: Get statistics (total orders, revenue, completed)
exports.getStatistics = (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) AS totalOrders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedOrders,
        SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) AS totalRevenue
      FROM orders
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching statistics:', err && (err.sqlMessage || err.message || err));
        return res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
      }

      const stats = results[0];
      return res.json({
        success: true,
        data: {
          totalOrders: stats.totalOrders || 0,
          completedOrders: stats.completedOrders || 0,
          totalRevenue: stats.totalRevenue || 0
        }
      });
    });
  } catch (ex) {
    console.error('Unexpected server error fetching statistics', ex && (ex.message || ex));
    return res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
};