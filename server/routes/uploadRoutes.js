const express = require('express');
const multer = require('multer');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

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

// Upload directly to Cloudinary REST API (unsigned preset — no signature required)
async function uploadToCloudinary(buffer, mimetype) {
    const resourceType = mimetype.startsWith('video') ? 'video' : 'image';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dvginluil';

    // Build multipart form using Node.js built-in FormData (available in Node 18+)
    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimetype });
    formData.append('file', blob, 'upload');
    formData.append('upload_preset', 'glamire_preset');

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: 'POST', body: formData }
    );

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('[Cloudinary REST] Error:', errData);
        throw new Error(errData.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.secure_url;
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
        console.error('Upload error:', err.message);
        res.status(500).json({ message: 'Upload failed', detail: err.message });
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
        console.error('Upload error:', err.message);
        res.status(500).json({ message: 'Upload failed', detail: err.message });
    }
});

module.exports = router;
