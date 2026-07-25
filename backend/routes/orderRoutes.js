const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Public: create order
router.post('/', orderController.createOrder);

// Admin: list orders (query ?status=new or ?status=past)
router.get('/', orderController.getOrders);

// Admin: get statistics
router.get('/statistics', orderController.getStatistics);

// Admin: update status
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
