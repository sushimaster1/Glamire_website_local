const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log config on startup to verify env vars are loaded
console.log('[Cloudinary] cloud_name:', process.env.CLOUDINARY_CLOUD_NAME || 'MISSING');
console.log('[Cloudinary] api_key:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING');

// Use memory storage — files never touch disk
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif|mp4|webm|ogg/;
    const extname = filetypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images or Videos only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Helper: upload a buffer to Cloudinary
function uploadToCloudinary(buffer, mimetype) {
    return new Promise((resolve, reject) => {
        const resourceType = mimetype.startsWith('video') ? 'video' : 'image';
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'glamire', resource_type: resourceType },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
}

// POST /api/upload — single file
router.post('/', protect, sellerOnly, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image uploaded');
    }
    try {
        const url = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        res.send(url);
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        res.status(500).json({ message: 'Upload failed', detail: err.message || String(err) });
    }
});

// POST /api/upload/multiple — multiple files
router.post('/multiple', protect, sellerOnly, upload.array('images', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No images uploaded');
    }
    try {
        const urls = await Promise.all(
            req.files.map(file => uploadToCloudinary(file.buffer, file.mimetype))
        );
        res.json(urls);
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        res.status(500).json({ message: 'Upload failed', detail: err.message || String(err) });
    }
});

module.exports = router;
