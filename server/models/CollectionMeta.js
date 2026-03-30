const mongoose = require('mongoose');

const collectionMetaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    showInNavbar: {
        type: Boolean,
        default: true
    },
    showInCurated: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    }
});

module.exports = mongoose.model('CollectionMeta', collectionMetaSchema);
