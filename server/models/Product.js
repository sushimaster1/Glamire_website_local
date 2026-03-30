const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    color: String,
    size: String,
    imageUrl: String,
    hexCode: String,
    stockQuantity: { type: Number, default: 50 },
    additionalImages: [String]
});

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    categories: [String],
    variants: [variantSchema]
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text', categories: 'text' });

module.exports = mongoose.model('Product', productSchema);
