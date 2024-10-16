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

// Define the schema for the Category model
const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: true,
    },
    images: [imageSchema],
    bsimages: [imageSchema],
    //set boolean property for isbestseller
    isbestseller: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }); // Automatically manages createdAt and updatedAt fields

// Create the Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
