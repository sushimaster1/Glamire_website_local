const Order = require('../models/Order');

// @desc    Get all orders for seller dashboard
// @route   GET /api/seller/orders
// @access  Private/Seller
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update order status
// @route   PUT /api/seller/orders/:id/status
// @access  Private/Seller
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get sales analytics
// @route   GET /api/seller/analytics
// @access  Private/Seller
const getAnalytics = async (req, res) => {
    try {
        const orders = await Order.find({});
        
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'Pending').length;

        // Group by product to find topsellers
        const salesByProduct = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (salesByProduct[item.title]) {
                    salesByProduct[item.title] += item.quantity;
                } else {
                    salesByProduct[item.title] = item.quantity;
                }
            });
        });

        res.json({
            totalRevenue,
            totalOrders,
            pendingOrders,
            salesByProduct
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.deleteOne();
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getOrders,
    updateOrderStatus,
    getAnalytics,
    deleteOrder
};
