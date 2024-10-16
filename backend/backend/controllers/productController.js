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
    let highlights = [];
    let recipes = [];

    console.log("Request Body: ", req.body.product);

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

        // Log the images after upload
        console.log("Uploaded Images: ", imagesLink);

        // Parse availableWeights
        if (req.body.availableWeights) {
            console.log("Raw availableWeights: ", req.body.availableWeights); // Log the raw input

            try {
                // Parse availableWeights as an array
                req.body.availableWeights = Array.isArray(req.body.availableWeights)
                    ? req.body.availableWeights.map(weight => JSON.parse(weight)) // Parse each JSON string
                    : [JSON.parse(req.body.availableWeights)]; // In case it's a single entry

                // Log parsed availableWeights
                console.log("Parsed availableWeights: ", req.body.availableWeights);

                // Clean up availableWeights before processing
                req.body.availableWeights = req.body.availableWeights.filter(weight => weight.weight && weight.price);

                console.log("Processed availableWeights: ", req.body.availableWeights); // Log the processed availableWeights
            } catch (error) {
                console.error("Error parsing availableWeights: ", error.message); // Log error message
                req.body.availableWeights = []; // Reset to empty array on error
            }
        } else {
            console.log("No availableWeights provided.");
            req.body.availableWeights = [];
        }

        // Check if availableWeights has valid entries
        if (req.body.availableWeights.length === 0) {
            return res.status(400).json({ success: false, message: 'Available weights must be provided and cannot be empty.' });
        }



        // Transform availableWeights
        const availableWeightsArray = req.body.availableWeights.map(weight => {
            return { weight: weight.weight, price: weight.price }; // Keep weight object
        });

        req.body.availableWeights = availableWeightsArray; // Assign processed weights
        console.log("Processed availableWeights: ", req.body.availableWeights); // Log the processed availableWeights

        // Process highlights and recipes
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
        req.body.images = imagesLink;
        req.body.user = req.user.id;
        req.body.highlights = highlights; // Assign highlights with uploaded images
        req.body.recipes = recipes; // Assign recipes with uploaded images

        // Log final product data before creation
        console.log("Final product data: ", req.body);

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

const convertImageToBase64 = async (url) => {
    try {
        const response = await fetch(url);

        // Check if the fetch call was successful
        if (!response.ok) {
            throw new Error(`Failed to fetch image from URL: ${url}. Status: ${response.status}`);
        }

        const buffer = await response.buffer(); // Get image data as buffer
        const contentType = response.headers.get('content-type'); // Get MIME type from response

        return {
            base64: buffer.toString('base64'),
            mimeType: contentType,
        };
    } catch (error) {
        // Catch errors and provide more information about the failure
        console.error(`Error fetching image from URL: ${url}, error.message`);
        throw new Error(`Failed to fetch or process image from URL: ${url}. Error: ${error.message}`);
    }
};

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const processImages = async (items) => {
    if (!Array.isArray(items)) {
        console.log("Data received for image processing is not an array:", items);
        throw new Error("Provided data is not an array");
    }

    return await Promise.all(items.map(async (item) => {
        if (item.url && isValidUrl(item.url)) {  // Check if item has a valid url
            console.log("Processing image URL:", item.url); // Log image URL

            try {
                const { base64, mimeType } = await convertImageToBase64(item.url);

                return {
                    ...item,
                    base64: `data:${mimeType};base64,${base64}`, // Set base64 string directly
                };
            } catch (error) {
                console.error(`Failed to process image for item with url: ${item.url}`, error.message);
                throw new Error(`Failed to process image for item with url: ${item.url}. Error: ${error.message}`);
            }
        } else {
            console.error("No valid image URL or invalid image structure for item:", item);
            return item; // Return unmodified item if no valid image
        }
    }));
};

exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
    console.log("Received request to update product:", req.params.id);
    
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    // Log incoming request body for debugging
    console.log("Incoming request body:", req.body);

    // Process images if provided
 if (req.body.images) {
    try {
        // First, check if req.body.images is a string and parse it, otherwise leave it as is
        if (typeof req.body.images === 'string') {
            req.body.images = JSON.parse(req.body.images);
        }

        // Check if the parsed object contains an 'images' key and if it's an array
        if (req.body.images.images && Array.isArray(req.body.images.images)) {
            req.body.images = req.body.images.images.map(image => {
                return {
                    url: image.url || '',  // Ensure the url is set or default to an empty string
                    public_id: image.public_id || 'default_public_id', // Default to 'default_public_id' if not provided
                     // Optional: keep label if needed
                };
            });
        } else {
            console.error("Images data is not an array:", req.body.images);
            return next(new ErrorHandler("Images data is not an array", 400));
        }

    } catch (error) {
        console.error("Error parsing images:", error);
        return next(new ErrorHandler("Invalid images data", 400));
    }
}
    // Process highlights if provided
    if (req.body.highlights) {
        try {
            req.body.highlights = JSON.parse(req.body.highlights).highlights;
            if (!Array.isArray(req.body.highlights)) {
                console.error("Highlights data is not an array:", req.body.highlights);
                return next(new ErrorHandler("Highlights data is not an array", 400));
            }

            req.body.highlights = req.body.highlights.map(highlight => {
                return {
                    label: highlight.label || '', // Handle label
                    image: highlight.image || '', // Handle image
                };
            });
        } catch (error) {
            console.error("Error parsing highlights:", error);
            return next(new ErrorHandler("Invalid highlights data", 400));
        }
    }

    // Process specifications if provided
   
    if (req.body.recipes) {
        console.log("Received recipes:", req.body.recipes);
        try {
            req.body.recipes = JSON.parse(req.body.recipes).recipes;
            if (!Array.isArray(req.body.recipes)) {
                console.error("recipes is not an array:", req.body.recipes);
                return next(new ErrorHandler("recipes data is not an array", 400));
            }

            req.body.recipes = req.body.recipes.map(recipes => {
                return {
                    description: recipes.description || '', // Handle label
                    image: recipes.image || '', // Handle image
                };
            });
        } catch (error) {
            console.error("Error parsing highlights:", error);
            return next(new ErrorHandler("Invalid highlights data", 400));
        }

    }


    // Process available weights if provided
    if (req.body.availableWeights) {
        if (Array.isArray(req.body.availableWeights)) {
            req.body.availableWeights = req.body.availableWeights.map(weight => {
                return {
                    weight: weight.weight || 0,
                    unit: weight.unit || 'grams',
                };
            });
        } else {
            console.error("Available weights data is not an array:", req.body.availableWeights);
            return next(new ErrorHandler("Available weights data is not an array", 400));
        }
    }

    // Update the product with new data
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
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

exports.deleteReview = asyncErrorHandler(async (req, res, next) => {
    const { productId } = req.query; // Assuming productId is being sent as a query parameter
    const reviewId = req.params.id; // Assuming reviewId is sent as a path parameter

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    // Check if reviews are defined and filter out the review to be deleted
    if (!product.reviews || product.reviews.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No reviews to delete",
        });
    }

    // Filter out the review to be deleted
    const reviews = product.reviews.filter((rev) => rev._id && rev._id.toString() !== reviewId.toString());

    // Recalculate the average rating
    const avg = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    const ratings = reviews.length > 0 ? avg / reviews.length : 0;

    // Update product with the new reviews, ratings, and number of reviews
    await Product.findByIdAndUpdate(
        productId,
        {
            reviews,
            ratings: Number(ratings),
            numOfReviews: reviews.length,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
    });
});