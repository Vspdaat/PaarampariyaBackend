
const express = require('express');
const { addToCart, getCartItems, updateCartQuantity, removeFromCart } = require('../controllers/cartController');

const { isAuthenticatedUser } = require('../middlewares/auth'); // Ensure this middleware is set up

const router = express.Router();

// Route to get cart items
router.get('/cart', isAuthenticatedUser, (req, res, next) => {
    console.log("Cart route hit");
    next();
  }, getCartItems);

// Route to add to cart
router.post('/cart',  isAuthenticatedUser, addToCart);
// Route to update product quantity in cart
router.put('/cart/:productId',  isAuthenticatedUser,  updateCartQuantity);

// Route to remove product from cart
router.delete('/cart/:productId',  isAuthenticatedUser, removeFromCart);

module.exports = router;

