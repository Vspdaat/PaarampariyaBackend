const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('./asyncErrorHandler');

// exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {

//     const { token } = req.cookies;

//     if (!token) {
//         return next(new ErrorHandler("Please Login to Access", 401))
//     }

//     const decodedData = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decodedData.id);
//     next();
// });
exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return next(new ErrorHandler("Please Login to Access", 401));
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);

  next();
});


exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`, 403));
        }
        next();
    }
}
// // middlewares/auth.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');
// const ErrorHandler = require('../utils/errorHandler');
// const asyncErrorHandler = require('./asyncErrorHandler');

// // Check if the user is authenticated
// exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {
//   const { token } = req.cookies;  // Get the token from cookies

//   if (!token) {
//     return next(new ErrorHandler('Please Login to Access', 401)); // If no token, return error
//   }

//   // Verify the token and attach user data to req.user
//   const decodedData = jwt.verify(token, process.env.JWT_SECRET);
//   req.user = await User.findById(decodedData.id); // Fetch user details using decoded token

//   next(); // Allow request to proceed
// });
// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');
// const ErrorHandler = require('../utils/errorHandler');
// const asyncErrorHandler = require('./asyncErrorHandler');

// // Authentication middleware
// exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {
//   const { token } = req.cookies;

//   if (!token) {
//     return next(new ErrorHandler('Please Login to Access', 401));
//   }

//   const decodedData = jwt.verify(token, process.env.JWT_SECRET);
//   req.user = await User.findById(decodedData.id);
//   next();
// });

// // Authorization middleware
// exports.authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new ErrorHandler(`Role: ${req.user.role} is not allowed, 403`)
//       );
//     }
//     next();
//   };
// };