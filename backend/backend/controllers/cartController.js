// const Cart = require('../models/cartModel');
// const ErrorHandler = require('../utils/errorHandler');
// const asyncErrorHandler = require('../middlewares/asyncErrorHandler');

// // Update Product Quantity in Cart
// exports.updateCartQuantity = asyncErrorHandler(async (req, res, next) => {
//     const { quantity } = req.body;
//     const productId = req.params.productId;

//     // Validate input data
//     if (!productId || quantity < 0) {
//         return next(new ErrorHandler('Product ID and a valid quantity are required', 400));
//     }

//     const cart = await Cart.findOne({ user: req.user._id });

//     if (!cart) {
//         return next(new ErrorHandler('Cart not found', 404));
//     }

//     const productIndex = cart.products.findIndex((p) => p.product.toString() === productId);

//     if (productIndex === -1) {
//         return next(new ErrorHandler('Product not found in the cart', 404));
//     }

//     // Update quantity
//     if (quantity === 0) {
//         // If quantity is set to zero, remove the product
//         cart.products.splice(productIndex, 1);
//     } else {
//         // Otherwise, update the quantity
//         cart.products[productIndex].quantity = quantity;
//     }

//     // Save the cart
//     await cart.save();

//     // Return success response
//     res.status(200).json({
//         success: true,
//         cart,
//     });
// });

// // Remove Product from Cart
// exports.removeFromCart = asyncErrorHandler(async (req, res, next) => {
//     const productId = req.params.productId;

//     const cart = await Cart.findOne({ user: req.user._id });

//     if (!cart) {
//         return next(new ErrorHandler('Cart not found', 404));
//     }

//     const productIndex = cart.products.findIndex((p) => p.product.toString() === productId);

//     if (productIndex === -1) {
//         return next(new ErrorHandler('Product not found in the cart', 404));
//     }

//     // Remove the product
//     cart.products.splice(productIndex, 1);

//     // Save the cart
//     await cart.save();

//     // Return success response
//     res.status(200).json({
//         success: true,
//         message: 'Product removed from cart',
//         cart,
//     });
// });

// // Fetch Cart Items
// exports.getCartItems = asyncErrorHandler(async (req, res, next) => {
//     const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');

//     if (!cart) {
//         return res.status(200).json({ success: true, cart: { products: [] } });
//     }

//     res.status(200).json({
//         success: true,
//         cart,
//     });
// });

// // Add Product to Cart
// exports.addToCart = asyncErrorHandler(async (req, res, next) => {
//     const { productId, quantity } = req.body;

//     // Validate input data
//     if (!productId || !quantity || quantity <= 0) {
//         return next(new ErrorHandler('Product ID and valid quantity are required', 400));
//     }

//     // Ensure that the user is authenticated
//     if (!req.user) {
//         return next(new ErrorHandler('Please login to add products to the cart', 401));
//     }

//     let cart = await Cart.findOne({ user: req.user._id });

//     if (!cart) {
//         // If the cart doesn't exist, create a new one for the user
//         cart = await Cart.create({
//             user: req.user._id,
//             products: [{ product: productId, quantity }],
//         });
//     } else {
//         const productIndex = cart.products.findIndex((p) => p.product.toString() === productId);

//         if (productIndex > -1) {
//             // Product already exists in the cart, update the quantity
//             cart.products[productIndex].quantity += quantity;
//         } else {
//             // Product doesn't exist in the cart, add a new entry
//             cart.products.push({ product: productId, quantity });
//         }
//     }

//     // Save the cart
//     await cart.save();

//     // Fetch the updated cart items
//     const updatedCart = await Cart.findOne({ user: req.user._id }).populate('products.product');

//     // Return success response
//     res.status(200).json({
//         success: true,
//         cart: updatedCart,
//     });
// });



const Cart = require('../models/cartModel');
const ErrorHandler = require('../utils/errorHandler');


  exports.updateCartQuantity = async (req, res, next) => {
    try {
        const { cartItemId } = req.params; // This is the cart item ID
        const { quantity, price } = req.body; // Weight can be handled separately if needed

        // Ensure quantity is valid
        if (quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than zero' });
        }

        console.log(`Updating cart item with ID: ${cartItemId}, new quantity: ${quantity}`);

        // Find cart item by its ID in the products array and update the quantity and price
        const updatedCart = await Cart.findOneAndUpdate(
            { "products._id": cartItemId }, // Match the cart item ID
            {
                $set: { 
                    "products.$.quantity": quantity,
                    "products.$.price": price 
                }
            },
            { new: true } // Return the updated cart
        );

        if (!updatedCart) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Quantity updated successfully',
            cart: updatedCart // Send back the updated cart
        });
    } catch (error) {
        console.error('Error occurred while updating cart quantity:', error);
        return res.status(500).json({ message: 'An error occurred while updating the cart quantity' });
    }
};


// Remove Product from Cart
exports.removeFromCart = async (req, res, next) => {
    const cartItemId = req.params.cartItemId;  // Get the cartItemId from request params

    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return next(new ErrorHandler('Cart not found', 404));
        }

        // Find the index of the product with the matching cartItemId
        const productIndex = cart.products.findIndex((p) => p._id.toString() === cartItemId);

        if (productIndex === -1) {
            return next(new ErrorHandler('Product not found in the cart', 404));
        }

        // Remove the product from the cart's products array
        cart.products.splice(productIndex, 1);

        // Save the updated cart
        await cart.save();

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Product removed from cart',
            cart,
        });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        return next(new ErrorHandler('Failed to remove product from cart', 500));
    }
};

// Fetch Cart Items
exports.getCartItems = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');

        if (!cart) {
            return res.status(200).json({ success: true, cart: { products: [] } });
        }

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        return next(new ErrorHandler('Failed to fetch cart items', 500));
    }
};

exports.addToCart = async (req, res, next) => {
  const { productId, quantity, weight,price } = req.body;

  if (!productId || !quantity || !weight) {
    return next(new ErrorHandler('Product ID, valid quantity, and weight are required', 400));
}

// Optionally validate price, allowing it to be zero
if (price === undefined) {
    return next(new ErrorHandler('Price is required', 400));
}
  // Ensure that the user is authenticated
  if (!req.user) {
      return next(new ErrorHandler('Please login to add products to the cart', 401));
  }

  try {
      let cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
          // If the cart doesn't exist, create a new one for the user
          cart = await Cart.create({
              user: req.user._id,
              products: [{ product: productId, quantity, weight,price }],
          });
      } else {
          // Log the current products in the cart for debugging
          console.log('Current cart products:', cart.products);

          // Check if the product with the same weight exists in the cart
          // const productIndex = cart.products.findIndex(
          //     (p) => p.product.toString() === productId && p.weight === weight
          // );
          const productIndex = cart.products.findIndex(
            (p) => p.product.toString() === productId && p.weight === weight
        );
        
          console.log(`Searching for productId: ${productId} with weight: ${weight}`);
          console.log(`Found productIndex: ${productIndex}`);

          if (productIndex > -1) {
              // Product with the same weight already exists in the cart, update the quantity
              cart.products[productIndex].quantity += quantity;
          } else {
              // Product with the given weight doesn't exist, add a new entry
              cart.products.push({ product: productId, quantity, weight ,price});
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
  } catch (error) {
      console.error('Error adding product to cart:', error);
      return next(new ErrorHandler('Failed to add product to cart', 500));
  }
};

