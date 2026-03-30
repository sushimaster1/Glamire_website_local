const express = require('express');
const router = express.Router();
const { getProducts, getCategories, checkStock,    createProduct,
    updateProduct,
    deleteProduct,
    getCollectionMeta,
    toggleCollectionVisibility
} = require('../controllers/productController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.post('/check-stock', checkStock);
router.get('/categories/meta', protect, sellerOnly, getCollectionMeta);
router.put('/categories/:name/visibility', protect, sellerOnly, toggleCollectionVisibility);

// Seller only routes
router.post('/', protect, sellerOnly, createProduct);
router.put('/:id', protect, sellerOnly, updateProduct);
router.delete('/:id', protect, sellerOnly, deleteProduct);

module.exports = router;
