const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Place Order (without Razorpay for now, will enhance later)
// @route   POST /api/orders
// @access  Public
const placeOrder = async (req, res) => {
    const { customerName, customerEmail, items, totalAmount, shippingAddress } = req.body;

    if (!shippingAddress) {
         return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    try {
        // 1. Create Order
        const newOrder = new Order({ 
            userId: req.user._id,
            customerName, 
            customerEmail,
            items, 
            totalAmount,
            shippingAddress,
            status: 'Pending',
            paymentDetails: { method: 'COD' }
        });
        await newOrder.save();

        // 2. Update Inventory for each item
        for (let item of items) {
            const product = await Product.findOne({ title: item.title });
            if (!product) throw new Error(`Product not found: ${item.title}`);

            const variant = product.variants.find(v => v.color === item.color && v.size === item.size);
            if (!variant) throw new Error(`Variant not found for ${item.title}`);

            if (variant.stockQuantity < item.quantity) {
                throw new Error(`Insufficient stock for: ${item.title}`);
            }

            variant.stockQuantity -= item.quantity;
            await product.save();
        }

        res.json({ success: true, orderId: newOrder._id, message: 'Order placed successfully' });

    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get orders for the logged-in user
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a single order by ID (for order success page)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        // Only allow the owner to view their order
        if (order.userId && order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    placeOrder,
    getMyOrders,
    getOrderById,
};
