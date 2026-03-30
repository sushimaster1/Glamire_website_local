const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/glamire_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const variantSchema = new mongoose.Schema({
    color: String,
    size: String,
    imageUrl: String,
    hexCode: String,
    stockQuantity: { type: Number, default: 50 }
});

const productSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    category: String,
    variants: [variantSchema]
});

const Product = mongoose.model('Product', productSchema);

const seedProducts = [
    {
        title: 'Silk Blend Cream Kurti',
        price: 69.99,
        description: 'Elegant silk blend kurti in cream color, perfect for festive occasions.',
        category: 'Kurtis',
        variants: [
            { color: 'Cream', size: 'S', imageUrl: 'images/hero-white-pants.jpg', hexCode: '#FFFDD0' },
            { color: 'Cream', size: 'M', imageUrl: 'images/hero-white-pants.jpg', hexCode: '#FFFDD0' },
            { color: 'Cream', size: 'L', imageUrl: 'images/hero-white-pants.jpg', hexCode: '#FFFDD0' },
            { color: 'Red', size: 'S', imageUrl: 'images/hero-white-pants.jpg', hexCode: '#FF0000' },
            { color: 'Red', size: 'M', imageUrl: 'images/hero-white-pants.jpg', hexCode: '#FF0000' }
        ]
    },
    {
        title: 'Casual White Tunic',
        price: 39.99,
        description: 'Lightweight and comfortable white tunic for daily wear.',
        category: 'Kurtis',
        variants: [
            { color: 'White', size: 'S', imageUrl: 'images/hero-black-pants.jpg', hexCode: '#FFFFFF' },
            { color: 'White', size: 'M', imageUrl: 'images/hero-black-pants.jpg', hexCode: '#FFFFFF' },
            { color: 'White', size: 'L', imageUrl: 'images/hero-black-pants.jpg', hexCode: '#FFFFFF' }
        ]
    },
    {
        title: 'Embroidered Festive Kurti',
        price: 89.99,
        description: 'Intricate embroidery work on a premium fabric base.',
        category: 'Kurtis',
        variants: [
            { color: 'Pink', size: 'S', imageUrl: 'images/hero-white-pants.jpg', hexCode: '#FFC0CB' },
            { color: 'Pink', size: 'M', imageUrl: 'images/hero-white-pants.jpg', hexCode: '#FFC0CB' },
            { color: 'Blue', size: 'M', imageUrl: 'images/hero-white-pants.jpg', hexCode: '#0000FF' }
        ]
    },
    {
        title: 'Modern Print Kurti',
        price: 49.99,
        description: 'Contemporary prints for the modern woman.',
        category: 'Kurtis',
        variants: [
            { color: 'Multi', size: 'S', imageUrl: 'images/hero-black-pants.jpg', hexCode: '#808080' },
            { color: 'Multi', size: 'M', imageUrl: 'images/hero-black-pants.jpg', hexCode: '#808080' },
            { color: 'Multi', size: 'L', imageUrl: 'images/hero-black-pants.jpg', hexCode: '#808080' }
        ]
    },
    {
        title: 'Classic Black Trousers',
        price: 49.99,
        description: 'Timeless black trousers that go with everything.',
        category: 'Pants',
        variants: [
            { color: 'Black', size: 'S', imageUrl: 'images/product-black-pants.png', hexCode: '#000000' },
            { color: 'Black', size: 'M', imageUrl: 'images/product-black-pants.png', hexCode: '#000000' },
            { color: 'Black', size: 'L', imageUrl: 'images/product-black-pants.png', hexCode: '#000000' },
            { color: 'Black', size: 'XL', imageUrl: 'images/product-black-pants.png', hexCode: '#000000' }
        ]
    },
    {
        title: 'Elegant White Pants',
        price: 54.99,
        description: 'Sophisticated white pants for a polished look.',
        category: 'Pants',
        variants: [
            { color: 'White', size: 'S', imageUrl: 'images/product-white-pants.png', hexCode: '#FFFFFF' },
            { color: 'White', size: 'M', imageUrl: 'images/product-white-pants.png', hexCode: '#FFFFFF' },
            { color: 'White', size: 'L', imageUrl: 'images/product-white-pants.png', hexCode: '#FFFFFF' }
        ]
    },
    {
        title: 'Maroon Comfort Pants',
        price: 45.99,
        description: 'Soft and stretchy fabric for maximum comfort.',
        category: 'Pants',
        variants: [
            { color: 'Maroon', size: 'S', imageUrl: 'images/product-maroon-pants.png', hexCode: '#800000' },
            { color: 'Maroon', size: 'M', imageUrl: 'images/product-maroon-pants.png', hexCode: '#800000' },
            { color: 'Maroon', size: 'L', imageUrl: 'images/product-maroon-pants.png', hexCode: '#800000' }
        ]
    },
    {
        title: 'Slim Fit Black Pants',
        price: 59.99,
        description: 'Tailored slim fit pants for a sharp silhouette.',
        category: 'Pants',
        variants: [
            { color: 'Black', size: '28', imageUrl: 'images/product-black-pants.png', hexCode: '#000000' },
            { color: 'Black', size: '30', imageUrl: 'images/product-black-pants.png', hexCode: '#000000' },
            { color: 'Black', size: '32', imageUrl: 'images/product-black-pants.png', hexCode: '#000000' }
        ]
    }
];

async function seedDB() {
    try {
        console.log('Connecting to database...');
        await Product.deleteMany({});
        console.log('Cleared existing products.');

        await Product.insertMany(seedProducts);
        console.log('Database seeded successfully!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        mongoose.connection.close();
    }
}

seedDB();
