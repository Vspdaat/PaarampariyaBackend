// const Product = require('../models/productModel');
// const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
// const SearchFeatures = require('../utils/searchFeatures');
// const ErrorHandler = require('../utils/errorHandler');
// const cloudinary = require('cloudinary');

// // Get All Products
// exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {

//     const resultPerPage = 12;
//     const productsCount = await Product.countDocuments();
//     // console.log(req.query);

//     const searchFeature = new SearchFeatures(Product.find(), req.query)
//         .search()
//         .filter();

//     let products = await searchFeature.query;
//     let filteredProductsCount = products.length;

//     searchFeature.pagination(resultPerPage);

//     products = await searchFeature.query.clone();

//     res.status(200).json({
//         success: true,
//         products,
//         productsCount,
//         resultPerPage,
//         filteredProductsCount,
//     });
// });

// // Get All Products ---Product Sliders
// exports.getProducts = asyncErrorHandler(async (req, res, next) => {
//     const products = await Product.find();

//     res.status(200).json({
//         success: true,
//         products,
//     });
// });

// // Get Product Details
// exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {

//     const product = await Product.findById(req.params.id);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     res.status(200).json({
//         success: true,
//         product,
//     });
// });

// // Get All Products ---ADMIN
// exports.getAdminProducts = asyncErrorHandler(async (req, res, next) => {
//     const products = await Product.find();

//     res.status(200).json({
//         success: true,
//         products,
//     });
// });

// // Create Product ---ADMIN
// exports.createProduct = asyncErrorHandler(async (req, res, next) => {

//     let images = [];
//     if (typeof req.body.images === "string") {
//         images.push(req.body.images);
//     } else {
//         images = req.body.images;
//     }

//     const imagesLink = [];

//     for (let i = 0; i < images.length; i++) {
//         const result = await cloudinary.v2.uploader.upload(images[i], {
//             folder: "products",
//         });

//         imagesLink.push({
//             public_id: result.public_id,
//             url: result.secure_url,
//         });
//     }

//     const result = await cloudinary.v2.uploader.upload(req.body.logo, {
//         folder: "brands",
//     });
//     const brandLogo = {
//         public_id: result.public_id,
//         url: result.secure_url,
//     };

//     req.body.brand = {
//         name: req.body.brandname,
//         logo: brandLogo
//     }
//     req.body.images = imagesLink;
//     req.body.user = req.user.id;

//     let specs = [];
//     req.body.specifications.forEach((s) => {
//         specs.push(JSON.parse(s))
//     });
//     req.body.specifications = specs;

//     const product = await Product.create(req.body);

//     res.status(201).json({
//         success: true,
//         product
//     });
// });

// // Update Product ---ADMIN
// exports.updateProduct = asyncErrorHandler(async (req, res, next) => {

//     let product = await Product.findById(req.params.id);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     if (req.body.images !== undefined) {
//         let images = [];
//         if (typeof req.body.images === "string") {
//             images.push(req.body.images);
//         } else {
//             images = req.body.images;
//         }
//         for (let i = 0; i < product.images.length; i++) {
//             await cloudinary.v2.uploader.destroy(product.images[i].public_id);
//         }

//         const imagesLink = [];

//         for (let i = 0; i < images.length; i++) {
//             const result = await cloudinary.v2.uploader.upload(images[i], {
//                 folder: "products",
//             });

//             imagesLink.push({
//                 public_id: result.public_id,
//                 url: result.secure_url,
//             });
//         }
//         req.body.images = imagesLink;
//     }

//     if (req.body.logo.length > 0) {
//         await cloudinary.v2.uploader.destroy(product.brand.logo.public_id);
//         const result = await cloudinary.v2.uploader.upload(req.body.logo, {
//             folder: "brands",
//         });
//         const brandLogo = {
//             public_id: result.public_id,
//             url: result.secure_url,
//         };

//         req.body.brand = {
//             name: req.body.brandname,
//             logo: brandLogo
//         }
//     }

//     let specs = [];
//     req.body.specifications.forEach((s) => {
//         specs.push(JSON.parse(s))
//     });
//     req.body.specifications = specs;
//     req.body.user = req.user.id;

//     product = await Product.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//     });

//     res.status(201).json({
//         success: true,
//         product
//     });
// });

// // Delete Product ---ADMIN
// exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {

//     const product = await Product.findById(req.params.id);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     for (let i = 0; i < product.images.length; i++) {
//         await cloudinary.v2.uploader.destroy(product.images[i].public_id);
//     }

//     await product.remove();

//     res.status(201).json({
//         success: true
//     });
// });

// // Create OR Update Reviews
// exports.createProductReview = asyncErrorHandler(async (req, res, next) => {

//     const { rating, comment, productId } = req.body;

//     const review = {
//         user: req.user._id,
//         name: req.user.name,
//         rating: Number(rating),
//         comment,
//     }

//     const product = await Product.findById(productId);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     const isReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString());

//     if (isReviewed) {

//         product.reviews.forEach((rev) => { 
//             if (rev.user.toString() === req.user._id.toString())
//                 (rev.rating = rating, rev.comment = comment);
//         });
//     } else {
//         product.reviews.push(review);
//         product.numOfReviews = product.reviews.length;
//     }

//     let avg = 0;

//     product.reviews.forEach((rev) => {
//         avg += rev.rating;
//     });

//     product.ratings = avg / product.reviews.length;

//     await product.save({ validateBeforeSave: false });

//     res.status(200).json({
//         success: true
//     });
// });

// // Get All Reviews of Product
// exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {

//     const product = await Product.findById(req.query.id);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     res.status(200).json({
//         success: true,
//         reviews: product.reviews
//     });
// });

// // Delete Reveiws
// exports.deleteReview = asyncErrorHandler(async (req, res, next) => {

//     const product = await Product.findById(req.query.productId);

//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404));
//     }

//     const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());

//     let avg = 0;

//     reviews.forEach((rev) => {
//         avg += rev.rating;
//     });

//     let ratings = 0;

//     if (reviews.length === 0) {
//         ratings = 0;
//     } else {
//         ratings = avg / reviews.length;
//     }

//     const numOfReviews = reviews.length;

//     await Product.findByIdAndUpdate(req.query.productId, {
//         reviews,
//         ratings: Number(ratings),
//         numOfReviews,
//     }, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//     });

//     res.status(200).json({
//         success: true,
//     });
// });



const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require('cloudinary');
const { uploadImageToStorage } = require('../utils/uploadImageToStorage'); 
// Get All Products
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
    const resultPerPage = 12;
    const productsCount = await Product.countDocuments();

    const searchFeature = new SearchFeatures(Product.find(), req.query)
        .search()
        .filter();

    let products = await searchFeature.query;
    let filteredProductsCount = products.length;

    searchFeature.pagination(resultPerPage);
    products = await searchFeature.query.clone();

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

// Get All Products for Sliders
exports.getProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find();
    res.status(200).json({
        success: true,
        products,
    });
});

// Get Product Details
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }
    res.status(200).json({
        success: true,
        product,
    });
});

// Get All Products for Admin
exports.getAdminProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find();
    res.status(200).json({
        success: true,
        products,
    });
});

exports.createProduct = async (req, res, next) => {
    let images = [];
    let brandLogo = {};
    let highlights = [];
    let recipes = [];

    console.log("Request Body: ", req.body);

    // Handle base64 images in req.body.images
    if (req.body.images) {
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else if (Array.isArray(req.body.images)) {
            images = req.body.images;
        }
    }
    console.log("Images received: ", images);

    try {
        // Process and upload product images
        const imagesLink = await Promise.all(images.map(async (base64Image) => {
            if (base64Image && base64Image.startsWith("data:image")) {
                const base64Data = base64Image.split(',')[1];
                if (!base64Data) {
                    throw new Error('Image data is not in the correct format.');
                }

                const buffer = Buffer.from(base64Data, 'base64');
                const uploadResult = await uploadImageToStorage(buffer);
                return {
                    public_id: uploadResult.public_id,
                    url: uploadResult.url,
                };
            } else {
                throw new Error('Invalid Base64 image format.');
            }
        }));

        // Handle brand logo upload if provided
        if (req.body.logo) {
            const logoBase64Data = req.body.logo.split(',')[1];
            if (!logoBase64Data) {
                throw new Error('Logo data is not in the correct format.');
            }

            const logoBuffer = Buffer.from(logoBase64Data, 'base64');
            const logoResult = await uploadImageToStorage(logoBuffer);
            brandLogo = {
                public_id: logoResult.public_id,
                url: logoResult.url,
            };
        }

        // Parse specifications, highlights, and recipes
        req.body.specifications = req.body.specifications ? 
            (Array.isArray(req.body.specifications) ? req.body.specifications : JSON.parse(req.body.specifications)) : [];
        
        req.body.highlights = req.body.highlights ? 
            (Array.isArray(req.body.highlights) ? req.body.highlights : JSON.parse(req.body.highlights)) : [];
        
        req.body.recipes = req.body.recipes ? 
            (Array.isArray(req.body.recipes) ? req.body.recipes : JSON.parse(req.body.recipes)) : [];

        // Process highlights images
        if (req.body.highlights.length) {
            highlights = await Promise.all(req.body.highlights.map(async (highlight) => {
                if (highlight.image && highlight.image.startsWith("data:image")) {
                    const base64Data = highlight.image.split(',')[1];
                    if (!base64Data) {
                        throw new Error('Highlight image data is not in the correct format.');
                    }

                    const buffer = Buffer.from(base64Data, 'base64');
                    const uploadResult = await uploadImageToStorage(buffer);
                    return {
                        image: {
                            public_id: uploadResult.public_id,
                            url: uploadResult.url,
                        },
                        label: highlight.label,
                    };
                } else {
                    throw new Error('Invalid Base64 highlight image format.');
                }
            }));
        }

        // Process recipes images
        if (req.body.recipes.length) {
            recipes = await Promise.all(req.body.recipes.map(async (recipe) => {
                if (recipe.image && recipe.image.startsWith("data:image")) {
                    const base64Data = recipe.image.split(',')[1];
                    if (!base64Data) {
                        throw new Error('Recipe image data is not in the correct format.');
                    }

                    const buffer = Buffer.from(base64Data, 'base64');
                    const uploadResult = await uploadImageToStorage(buffer);
                    return {
                        image: {
                            public_id: uploadResult.public_id,
                            url: uploadResult.url,
                        },
                        description: recipe.description,
                    };
                } else {
                    throw new Error('Invalid Base64 recipe image format.');
                }
            }));
        }

        // Prepare the product data
        req.body.brand = {
            name: req.body.brandname,
            logo: brandLogo,
        };
        req.body.images = imagesLink;
        req.body.user = req.user.id;
        req.body.highlights = highlights; // Assign highlights with uploaded images
        req.body.recipes = recipes; // Assign recipes with uploaded images

        // Create the product
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product,
        });
    } catch (error) {
        console.error("Error creating product:", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    // Handle main product images
    if (req.body.images !== undefined) {
        let images = [];
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        // Delete old images from Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLink = [];
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });
            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.images = imagesLink;
    }

    // Handle brand logo update
    if (req.body.logo) {
        await cloudinary.v2.uploader.destroy(product.brand.logo.public_id);
        const result = await cloudinary.v2.uploader.upload(req.body.logo, {
            folder: "brands",
        });
        const brandLogo = {
            public_id: result.public_id,
            url: result.secure_url,
        };
        req.body.brand = {
            name: req.body.brandname,
            logo: brandLogo,
        };
    }

    // Handle highlights update
    if (req.body.highlights !== undefined) {
        const highlights = [];
        for (let i = 0; i < product.highlights.length; i++) {
            await cloudinary.v2.uploader.destroy(product.highlights[i].public_id);
        }

        for (let i = 0; i < req.body.highlights.length; i++) {
            const result = await cloudinary.v2.uploader.upload(req.body.highlights[i], {
                folder: "highlights",
            });
            highlights.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.highlights = highlights;
    }

    // Handle recipes update
    if (req.body.recipes !== undefined) {
        const recipes = [];
        for (let i = 0; i < product.recipes.length; i++) {
            await cloudinary.v2.uploader.destroy(product.recipes[i].public_id);
        }

        for (let i = 0; i < req.body.recipes.length; i++) {
            const result = await cloudinary.v2.uploader.upload(req.body.recipes[i], {
                folder: "recipes",
            });
            recipes.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.recipes = recipes;
    }

    // Handle specifications and available weights
    req.body.specifications = req.body.specifications ? 
        (Array.isArray(req.body.specifications) ? req.body.specifications : JSON.parse(req.body.specifications)) : [];
    
    req.body.availableWeights = req.body.availableWeights ? 
        (Array.isArray(req.body.availableWeights) ? req.body.availableWeights : JSON.parse(req.body.availableWeights)) : [];

    // Assign the user who updated the product
    req.body.user = req.user.id;

    // Update the product with new data
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(201).json({
        success: true,
        product,
    });
});



// Get Product Details with Recipes
exports.getProductDetailsWithRecipes = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }
    res.status(200).json({
        success: true,
        product,
        recipes: product.recipes || [], // Return an empty array if recipes is undefined
    });
});

// Delete Product ---ADMIN
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    // Delete images from Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.remove();

    res.status(200).json({
        success: true,
    });
});

// Create OR Update Reviews
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const isReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString());

    if (isReviewed) {
        product.reviews.forEach((rev) => { 
            if (rev.user.toString() === req.user._id.toString()) {
                (rev.rating = rating, rev.comment = comment);
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});

// Get All Reviews of Product
const mongoose = require('mongoose');

exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {
    const productId = req.params.id;

    // Check if the productId is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new ErrorHandler("Invalid Product ID", 400));
    }

    // Find product by ID
    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews || [], // Ensure reviews is defined
    });
});

// Delete Reviews
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const reviews = product.reviews ? 
        product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString()) : 
        [];

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = reviews.length > 0 ? avg / reviews.length : 0;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings: Number(ratings),
        numOfReviews: reviews.length,
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});
