const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Init Razorpay instance (using test keys from env, or basic fallback for testing)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallbackKey',
    key_secret: process.env.RAZORPAY_SECRET || 'rzp_test_fallbackSecret'
});

// @desc    Create a new Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (or Public depending on auth flow)
const createOrder = async (req, res) => {
    try {
        const { amount } = req.body; 

        if (!amount) {
             return res.status(400).json({ message: 'Amount is required' });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
            currency: 'INR',
            receipt: 'receipt_order_' + Date.now(),
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create Razorpay order', error: err.message });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET || 'rzp_test_fallbackSecret')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Save order in database
            const newOrder = new Order({
                ...orderData,
                paymentDetails: {
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    method: 'Razorpay'
                },
                status: 'Pending'
            });

            await newOrder.save();

            res.json({ success: true, message: 'Payment verified successfully', orderId: newOrder._id });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error during payment verification' });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
