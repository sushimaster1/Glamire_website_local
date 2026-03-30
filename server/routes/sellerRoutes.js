const express = require('express');
const router = express.Router();
const { getOrders, updateOrderStatus, getAnalytics, deleteOrder } = require('../controllers/sellerController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

router.get('/orders', protect, sellerOnly, getOrders);
router.put('/orders/:id/status', protect, sellerOnly, updateOrderStatus);
router.delete('/orders/:id', protect, sellerOnly, deleteOrder);
router.get('/analytics', protect, sellerOnly, getAnalytics);

module.exports = router;
