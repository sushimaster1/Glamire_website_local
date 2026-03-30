const User = require('../models/User');

// @desc    Get User Profile (including cart and wishlist)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('wishlist')
            .populate('cart.productId');

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                wishlist: user.wishlist,
                cart: user.cart
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle Wishlist Item
// @route   POST /api/users/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            const alreadyInWishlist = user.wishlist.includes(productId);

            if (alreadyInWishlist) {
                user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
            } else {
                user.wishlist.push(productId);
            }

            await user.save();
            res.json(user.wishlist);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Cart
// @route   POST /api/users/cart
// @access  Private
const updateCart = async (req, res) => {
    try {
        const { cartItems } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            // override cart with new cart
            user.cart = cartItems;
            await user.save();
            res.json(user.cart);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUserProfile,
    toggleWishlist,
    updateCart
};
