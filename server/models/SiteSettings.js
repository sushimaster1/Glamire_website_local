const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    heroMediaUrl: { type: String, default: '' },
    heroMediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
