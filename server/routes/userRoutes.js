const express = require('express');
const router = express.Router();
const { getUserProfile, toggleWishlist, updateCart } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.post('/wishlist', protect, toggleWishlist);
router.post('/cart', protect, updateCart);

module.exports = router;
