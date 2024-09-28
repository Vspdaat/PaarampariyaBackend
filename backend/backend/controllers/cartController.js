const Cart = require('../models/cartModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');

// Update Product Quantity in Cart
exports.updateCartQuantity = asyncErrorHandler(async (req, res, next) => {
    const { quantity } = req.body;
    const productId = req.params.productId;

    // Validate input data
    if (!productId || quantity < 0) {
        return next(new ErrorHandler('Product ID and a valid quantity are required', 400));
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return next(new ErrorHandler('Cart not found', 404));
    }

    const productIndex = cart.products.findIndex((p) => p.product.toString() === productId);

    if (productIndex === -1) {
        return next(new ErrorHandler('Product not found in the cart', 404));
    }

    // Update quantity
    if (quantity === 0) {
        // If quantity is set to zero, remove the product
        cart.products.splice(productIndex, 1);
    } else {
        // Otherwise, update the quantity
        cart.products[productIndex].quantity = quantity;
    }

    // Save the cart
    await cart.save();

    // Return success response
    res.status(200).json({
        success: true,
        cart,
    });
});

// Remove Product from Cart
exports.removeFromCart = asyncErrorHandler(async (req, res, next) => {
    const productId = req.params.productId;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return next(new ErrorHandler('Cart not found', 404));
    }

    const productIndex = cart.products.findIndex((p) => p.product.toString() === productId);

    if (productIndex === -1) {
        return next(new ErrorHandler('Product not found in the cart', 404));
    }

    // Remove the product
    cart.products.splice(productIndex, 1);

    // Save the cart
    await cart.save();

    // Return success response
    res.status(200).json({
        success: true,
        message: 'Product removed from cart',
        cart,
    });
});

// Fetch Cart Items
exports.getCartItems = asyncErrorHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');

    if (!cart) {
        return res.status(200).json({ success: true, cart: { products: [] } });
    }

    res.status(200).json({
        success: true,
        cart,
    });
});

// Add Product to Cart
exports.addToCart = asyncErrorHandler(async (req, res, next) => {
    const { productId, quantity } = req.body;

    // Validate input data
    if (!productId || !quantity || quantity <= 0) {
        return next(new ErrorHandler('Product ID and valid quantity are required', 400));
    }

    // Ensure that the user is authenticated
    if (!req.user) {
        return next(new ErrorHandler('Please login to add products to the cart', 401));
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        // If the cart doesn't exist, create a new one for the user
        cart = await Cart.create({
            user: req.user._id,
            products: [{ product: productId, quantity }],
        });
    } else {
        const productIndex = cart.products.findIndex((p) => p.product.toString() === productId);

        if (productIndex > -1) {
            // Product already exists in the cart, update the quantity
            cart.products[productIndex].quantity += quantity;
        } else {
            // Product doesn't exist in the cart, add a new entry
            cart.products.push({ product: productId, quantity });
        }
    }

    // Save the cart
    await cart.save();

    // Fetch the updated cart items
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate('products.product');

    // Return success response
    res.status(200).json({
        success: true,
        cart: updatedCart,
    });
});
