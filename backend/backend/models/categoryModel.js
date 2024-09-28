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

// Define the schema for the Cat model
const catSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: true,
    },
    images: [imageSchema] // Using the image schema as an array
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Create the Cat model
const Category = mongoose.model('Category', catSchema);

module.exports = Category;
