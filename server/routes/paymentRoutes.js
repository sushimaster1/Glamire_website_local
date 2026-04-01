const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');

router.post('/create-order', (req, res) => {
    res.status(503).json({ success: false, message: "Online payment is temporarily disabled." });
});

router.post('/verify', (req, res) => {
    res.status(503).json({ success: false, message: "Online payment is temporarily disabled." });
});

module.exports = router;
