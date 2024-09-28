const Category = require('../models/categoryModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const cloudinary = require('cloudinary');
const ErrorHandler = require('../utils/errorHandler');

// Create Category
exports.createCategory = asyncErrorHandler(async (req, res, next) => {
    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLink = [];

    try {
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "categories",
            });
            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return next(new ErrorHandler('Error uploading images to Cloudinary', 500));
    }

    const { title, subtitle, description } = req.body;
    if (!title || !subtitle || !description) {
        return next(new ErrorHandler('Please provide title, subtitle, and description', 400));
    }

    req.body.images = imagesLink;
    req.body.user = req.user.id; // Assuming the user creating the category is authenticated

    const category = await Category.create(req.body);
    res.status(201).json({
        success: true,
        category,
    });
});


// Update Category
exports.updateCategory = asyncErrorHandler(async (req, res, next) => {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
        return next(new ErrorHandler('Category not found', 404));
    }

    // Handle images
    let imagesLink = category.images;

    if (req.body.images) {
        // Delete previous images from Cloudinary if new ones are provided
        for (let i = 0; i < imagesLink.length; i++) {
            await cloudinary.v2.uploader.destroy(imagesLink[i].public_id);
        }

        imagesLink = [];
        const images = typeof req.body.images === "string" ? [req.body.images] : req.body.images;

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "categories",
            });

            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
    }

    // Update category fields
    category.title = req.body.title || category.title;
    category.subtitle = req.body.subtitle || category.subtitle;
    category.description = req.body.description || category.description; // Update description
    category.images = imagesLink.length > 0 ? imagesLink : category.images; // Only update images if new ones are provided

    await category.save();

    res.status(200).json({
        success: true,
        category,
    });
});

// Delete Category
exports.deleteCategory = asyncErrorHandler(async (req, res, next) => {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
        return next(new ErrorHandler('Category not found', 404));
    }

    // Delete images from Cloudinary
    for (let i = 0; i < category.images.length; i++) {
        await cloudinary.v2.uploader.destroy(category.images[i].public_id);
    }

    await category.remove();

    res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
    });
});

// Get Category
exports.getCategory = asyncErrorHandler(async (req, res, next) => {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
        return next(new ErrorHandler('Category not found', 404));
    }

    res.status(200).json({
        success: true,
        category,
    });
});

// Get All Categories
exports.getAllCategories = asyncErrorHandler(async (req, res, next) => {
    const categories = await Category.find();

    res.status(200).json({
        success: true,
        categories,
    });
});
 