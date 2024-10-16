const mongoose = require('mongoose');

// Define the schema for images
const imageSchema = new mongoose.Schema({
    public_id: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    }
});

// Define the schema for the Banner model
const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: imageSchema, // Single image object
}, { timestamps: true }); // Automatically manages createdAt and updatedAt fields

// Create the Banner model
const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
