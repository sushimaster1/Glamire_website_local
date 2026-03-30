const Product = require('../models/Product');
const CollectionMeta = require('../models/CollectionMeta');

// @desc    Get All Products with Variants formatted
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        let sort = {};
        let projection = {};
        
        if (search) {
            query = {
                $or: [
                    { $text: { $search: search } },
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { categories: { $regex: search, $options: 'i' } }
                ]
            };
            // Define projection and sort for text score relevance
            projection = { score: { $meta: "textScore" } };
            sort = { score: { $meta: "textScore" } };
        }

        const products = await Product.find(query, projection).sort(sort);
        
        const productsData = {};
        for (let p of products) {
            const product = p.toObject();
            
            // Format for frontend
            product.colors = [];
            const colorMap = new Map();

            product.variants.forEach(v => {
                if (!colorMap.has(v.color)) {
                    colorMap.set(v.color, {
                        name: v.color,
                        hex: v.hexCode,
                        image: v.imageUrl,
                        additionalImages: v.additionalImages || [],
                        sizes: []
                    });
                    product.colors.push(colorMap.get(v.color));
                }
                colorMap.get(v.color).sizes.push(v.size);
            });

            product.sizes = [...new Set(product.variants.map(v => v.size))];
            productsData[product.title] = product;
        }

        res.json(productsData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// @desc    Get All Unique Categories (excluding hidden ones)
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('categories');
        const validCategories = categories.filter(c => c && c.trim() !== '');
        
        // If curatedOnly=true, return categories for Home Page Curated Selections
        if (req.query.curatedOnly === 'true') {
            const omittedMetas = await CollectionMeta.find({ showInCurated: false });
            const omittedNames = omittedMetas.map(m => m.name);
            const visibleMetas = await CollectionMeta.find({ name: { $nin: omittedNames } });
            
            // Map valid categories to their meta or default
            const curatedData = validCategories
                .filter(c => !omittedNames.includes(c))
                .map(cat => {
                    const meta = visibleMetas.find(m => m.name === cat);
                    return {
                        name: cat,
                        imageUrl: meta?.imageUrl || '',
                        mediaType: meta?.mediaType || 'image'
                    };
                });
            return res.json(curatedData);
        }

        // If includeHidden=true, return all categories without filtering
        if (req.query.includeHidden === 'true') {
            return res.json(validCategories);
        }

        // Default: Fetch hidden from Navbar collections
        const hiddenMetas = await CollectionMeta.find({ showInNavbar: false });
        const hiddenNames = hiddenMetas.map(m => m.name);
        
        // Filter out hidden categories
        const visibleCategories = validCategories.filter(c => !hiddenNames.includes(c));
        res.json(visibleCategories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// @desc    Get all Collection Metadata
// @route   GET /api/products/categories/meta
// @access  Private/Seller
const getCollectionMeta = async (req, res) => {
    try {
        const meta = await CollectionMeta.find({});
        res.json(meta);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// @desc    Toggle Collection Visibility
// @route   PUT /api/products/categories/:name/visibility
// @access  Private/Seller
const toggleCollectionVisibility = async (req, res) => {
    try {
        const { name } = req.params;
        const { showInNavbar, showInCurated, imageUrl, mediaType } = req.body;
        
        const update = {};
        if (showInNavbar !== undefined) update.showInNavbar = showInNavbar;
        if (showInCurated !== undefined) update.showInCurated = showInCurated;
        if (imageUrl !== undefined) update.imageUrl = imageUrl;
        if (mediaType !== undefined) update.mediaType = mediaType;

        const meta = await CollectionMeta.findOneAndUpdate(
            { name },
            update,
            { new: true, upsert: true }
        );
        res.json(meta);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// @desc    Check Stock for a specific variant
// @route   POST /api/products/check-stock
// @access  Public
const checkStock = async (req, res) => {
    const { title, color, size } = req.body;
    try {
        const product = await Product.findOne({
            title: title,
            'variants.color': color,
            'variants.size': size
        });

        if (product) {
            const variant = product.variants.find(v => v.color === color && v.size === size);
            if (variant) {
                return res.json({ available: variant.stockQuantity > 0, stock: variant.stockQuantity });
            }
        }
        res.json({ available: false, error: 'Variant not found' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller
const createProduct = async (req, res) => {
    try {
        const { title, price, description, categories, variants, category } = req.body;
        const product = new Product({
            title, price, description, categories: categories || (category ? [category] : []), variants
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = async (req, res) => {
    try {
        const { title, price, description, categories, variants, category } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.title = title || product.title;
            product.price = price || product.price;
            product.description = description || product.description;
            product.categories = categories || product.categories;
            if (!categories && category) product.categories = [category];
            product.variants = variants || product.variants;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getProducts,
    getCategories,
    checkStock,
    createProduct,
    updateProduct,
    deleteProduct,
    getCollectionMeta,
    toggleCollectionVisibility
};
