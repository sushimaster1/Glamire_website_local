const SiteSettings = require('../models/SiteSettings');

// @desc    Get Site Settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await SiteSettings.create({
                heroMediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
                heroMediaType: 'image'
            });
        }
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Site Settings
// @route   POST /api/settings
// @access  Private (Seller/Admin)
const updateSettings = async (req, res) => {
    try {
        const { heroMediaUrl, heroMediaType } = req.body;
        let settings = await SiteSettings.findOne();

        if (settings) {
            settings.heroMediaUrl = heroMediaUrl || settings.heroMediaUrl;
            settings.heroMediaType = heroMediaType || settings.heroMediaType;
            await settings.save();
        } else {
            settings = await SiteSettings.create({
                heroMediaUrl,
                heroMediaType
            });
        }

        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
