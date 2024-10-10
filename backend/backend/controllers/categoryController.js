// const Category = require('../models/categoryModel');
// const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
// const cloudinary = require('cloudinary');
// const ErrorHandler = require('../utils/errorHandler');

// // Create Category
// exports.createCategory = asyncErrorHandler(async (req, res, next) => {
//     let images = [];
//     if (typeof req.body.images === "string") {
//         images.push(req.body.images);
//     } else {
//         images = req.body.images;
//     }

//     const imagesLink = [];

//     try {
//         for (let i = 0; i < images.length; i++) {
//             const result = await cloudinary.v2.uploader.upload(images[i], {
//                 folder: "categories",
//             });
//             imagesLink.push({
//                 public_id: result.public_id,
//                 url: result.secure_url,
//             });
//         }
//     } catch (error) {
//         console.error("Cloudinary upload error:", error);
//         return next(new ErrorHandler('Error uploading images to Cloudinary', 500));
//     }

//     const { title, subtitle, description } = req.body;
//     if (!title || !subtitle || !description) {
//         return next(new ErrorHandler('Please provide title, subtitle, and description', 400));
//     }

//     req.body.images = imagesLink;
//     req.body.user = req.user.id; // Assuming the user creating the category is authenticated

//     const category = await Category.create(req.body);
//     res.status(201).json({
//         success: true,
//         category,
//     });
// });


// // Update Category
// exports.updateCategory = asyncErrorHandler(async (req, res, next) => {
//     const categoryId = req.params.id;

//     const category = await Category.findById(categoryId);
//     if (!category) {
//         return next(new ErrorHandler('Category not found', 404));
//     }

//     // Handle images
//     let imagesLink = category.images;

//     if (req.body.images) {
//         // Delete previous images from Cloudinary if new ones are provided
//         for (let i = 0; i < imagesLink.length; i++) {
//             await cloudinary.v2.uploader.destroy(imagesLink[i].public_id);
//         }

//         imagesLink = [];
//         const images = typeof req.body.images === "string" ? [req.body.images] : req.body.images;

//         for (let i = 0; i < images.length; i++) {
//             const result = await cloudinary.v2.uploader.upload(images[i], {
//                 folder: "categories",
//             });

//             imagesLink.push({
//                 public_id: result.public_id,
//                 url: result.secure_url,
//             });
//         }
//     }

//     // Update category fields
//     category.title = req.body.title || category.title;
//     category.subtitle = req.body.subtitle || category.subtitle;
//     category.description = req.body.description || category.description; // Update description
//     category.images = imagesLink.length > 0 ? imagesLink : category.images; // Only update images if new ones are provided

//     await category.save();

//     res.status(200).json({
//         success: true,
//         category,
//     });
// });

// // Delete Category
// exports.deleteCategory = asyncErrorHandler(async (req, res, next) => {
//     const categoryId = req.params.id;

//     const category = await Category.findById(categoryId);
//     if (!category) {
//         return next(new ErrorHandler('Category not found', 404));
//     }

//     // Delete images from Cloudinary
//     for (let i = 0; i < category.images.length; i++) {
//         await cloudinary.v2.uploader.destroy(category.images[i].public_id);
//     }

//     await category.remove();

//     res.status(200).json({
//         success: true,
//         message: 'Category deleted successfully',
//     });
// });

// // Get Category
// exports.getCategory = asyncErrorHandler(async (req, res, next) => {
//     const categoryId = req.params.id;

//     const category = await Category.findById(categoryId);
//     if (!category) {
//         return next(new ErrorHandler('Category not found', 404));
//     }

//     res.status(200).json({
//         success: true,
//         category,
//     });
// });

// // Get All Categories
// exports.getAllCategories = asyncErrorHandler(async (req, res, next) => {
//     const categories = await Category.find();

//     res.status(200).json({
//         success: true,
//         categories,
//     });
// });

const Category = require('../models/categoryModel');
const cloudinary = require('cloudinary');
const { uploadImageToStorage } = require('../utils/uploadImageToStorage'); 

exports.createCategory = async (req, res, next) => {

    try {
        const { title, subtitle, images } = req.body;
        console.log(images);
        // Validate images
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No images uploaded or incorrect format.',
            });
        }

        // Process and upload images
        const imageDetails = await Promise.all(images.map(async (base64Image) => {
            const base64Data = base64Image.split(',')[1]; // Get the part after the comma
            const buffer = Buffer.from(base64Data, 'base64'); // Convert to buffer

            // Upload the buffer to Cloudinary
            const uploadResult = await uploadImageToStorage(buffer); // Ensure this returns the correct format
            return {
                public_id: uploadResult.public_id,
                url: uploadResult.url,
            };
        }));

        // Create the category with the uploaded images
        const category = await Category.create({
            title,
            subtitle,
            images: imageDetails,
        });

        res.status(201).json({
            success: true,
            category,
        });
    } catch (error) {
        console.error('Error creating category:', error); // Log the error for debugging
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// Get all categories
exports.getCategories = async (req, res, next) => {
    try {
        // Find all categories from the database
        const categories = await Category.find();

        // Format the data to return the required structure
        const formattedCategories = categories.map(category => ({
            _id: category._id,          // Category ID
            title: category.title,      // Category title
            subtitle: category.subtitle, // Category subtitle
            images: category.images.map(image => ({
                public_id: image.public_id,
                url: image.url,
                _id: image._id,
            })),  // Images array containing public_id, url, and image _id
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        }));

        res.status(200).json({
            success: true,
            categories: formattedCategories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get a single category    by ID
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        res.status(200).json({
            success: true,
            category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update a category
exports.updateCategory = async (req, res, next) => {
    try {
        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        const { title, subtitle, images } = req.body;
        category.title = title || category.title;
        category.subtitle = subtitle || category.subtitle;
        category.images = images || category.images;

        await category.save();
        res.status(200).json({
            success: true,
            category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete a category
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        await category.remove();
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



 