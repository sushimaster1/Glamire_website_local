const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif|mp4|webm|ogg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
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

router.post('/', protect, sellerOnly, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image uploaded');
    }
    res.send(`/${req.file.path}`);
});

router.post('/multiple', protect, sellerOnly, upload.array('images', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No images uploaded');
    }
    const paths = req.files.map(file => `/${file.path}`);
    res.json(paths);
});

module.exports = router;
