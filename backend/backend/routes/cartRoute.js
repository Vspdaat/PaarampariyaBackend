
const express = require('express');
const { addToCart, getCartItems, updateCartQuantity, removeFromCart } = require('../controllers/cartController');
const { isAuthenticatedUser } = require('../middlewares/auth'); // Ensure this middleware is set up

const router = express.Router();

// Route to get cart items
router.get('/cart', getCartItems);

// Route to add to cart
router.post('/cart', addToCart);
// Route to update product quantity in cart
router.put('/cart/:productId',  updateCartQuantity);

// Route to remove product from cart
router.delete('/cart/:productId', removeFromCart);

module.exports = router;

