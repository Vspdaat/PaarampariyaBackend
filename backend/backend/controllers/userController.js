

// const User = require('../models/userModel');
// const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
// const sendToken = require('../utils/sendToken');
// const ErrorHandler = require('../utils/errorHandler');
// const sendEmail = require('../utils/sendEmail');
// const crypto = require('crypto');

// // Register User
// exports.registerUser = asyncErrorHandler(async (req, res, next) => {
//     const { name, email, gender, password } = req.body;

//     const user = await User.create({
//         name, 
//         email,
//         gender,
//         password,
//     });

//     sendToken(user, 201, res);
// });

// // Login User
// exports.loginUser = asyncErrorHandler(async (req, res, next) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return next(new ErrorHandler("Please Enter Email And Password", 400));
//     }

//     const user = await User.findOne({ email }).select("+password");

//     if (!user) {
//         return next(new ErrorHandler("Invalid Email or Password", 401));
//     }

//     const isPasswordMatched = await user.comparePassword(password);

//     if (!isPasswordMatched) {
//         return next(new ErrorHandler("Invalid Email or Password", 401));
//     }

//     sendToken(user, 201, res);
// });

// // Logout User
// exports.logoutUser = asyncErrorHandler(async (req, res, next) => {
//     res.cookie("token", null, {
//         expires: new Date(Date.now()),
//         httpOnly: true,
//     });

//     res.status(200).json({
//         success: true,
//         message: "Logged Out",
//     });
// });

// // Get User Details
// exports.getUserDetails = asyncErrorHandler(async (req, res, next) => {
//     const user = await User.findById(req.user.id);

//     res.status(200).json({
//         success: true,
//         user,
//     });
// });

// // Forgot Password
// exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
//     const user = await User.findOne({ email: req.body.email });

//     if (!user) {
//         return next(new ErrorHandler("User Not Found", 404));
//     }

//     const resetToken = await user.getResetPasswordToken();
//     await user.save({ validateBeforeSave: false });

//     const resetPasswordUrl = `http://localhost:3000/password/reset/${resetToken}`;

//     // Prepare email content
//     const emailContent = `
//         <h1>Password Reset Request</h1>
//         <p>Hi ${user.name},</p>
//         <p>To reset your password, please click on the following link:</p>
//         <a href="${resetPasswordUrl}">Reset Password</a>
//         <p>If you did not request this, please ignore this email.</p>
//     `;

//     try {
//         await sendEmail({
//             email: user.email,
//             subject: 'Password Reset',
//             message: emailContent,
//         });

//         res.status(200).json({
//             success: true,
//             message: `Email sent to ${user.email} successfully`,
//         });
//     } catch (error) {
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;
//         await user.save({ validateBeforeSave: false });
//         return next(new ErrorHandler(error.message, 500));
//     }
// });

// // Reset Password
// exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
//     const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

//     const user = await User.findOne({ 
//         resetPasswordToken,
//         resetPasswordExpire: { $gt: Date.now() }
//     });

//     if (!user) {
//         return next(new ErrorHandler("Invalid reset password token", 404));
//     }

//     user.password = req.body.password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save();
//     sendToken(user, 200, res);
// });

// // Update Password
// exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
//     const user = await User.findById(req.user.id).select("+password");

//     const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

//     if (!isPasswordMatched) {
//         return next(new ErrorHandler("Old Password is Invalid", 400));
//     }

//     user.password = req.body.newPassword;
//     await user.save();
//     sendToken(user, 201, res);
// });

// // Update User Profile
// exports.updateProfile = asyncErrorHandler(async (req, res, next) => {
//     const newUserData = {
//         name: req.body.name,
//         email: req.body.email,
//     };

//     await User.findByIdAndUpdate(req.user.id, newUserData, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//     });

//     res.status(200).json({
//         success: true,
//     });
// });

// // ADMIN DASHBOARD

// // Get All Users --ADMIN
// exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
//     const users = await User.find();

//     res.status(200).json({
//         success: true,
//         users,
//     });
// });

// // Get Single User Details --ADMIN
// exports.getSingleUser = asyncErrorHandler(async (req, res, next) => {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//         return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
//     }

//     res.status(200).json({
//         success: true,
//         user,
//     });
// });

// // Update User Role --ADMIN
// exports.updateUserRole = asyncErrorHandler(async (req, res, next) => {
//     const newUserData = {
//         name: req.body.name,
//         email: req.body.email,
//         gender: req.body.gender,
//         role: req.body.role,
//     };

//     await User.findByIdAndUpdate(req.params.id, newUserData, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//     });

//     res.status(200).json({
//         success: true,
//     });
// });

// // Delete User --ADMIN
// exports.deleteUser = asyncErrorHandler(async (req, res, next) => {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//         return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
//     }

//     await user.remove();

//     res.status(200).json({
//         success: true,
//     });
// });


const User = require('../models/userModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Register User
exports.registerUser = asyncErrorHandler(async (req, res, next) => {
    const { name, email, gender, password } = req.body;

    const user = await User.create({
        name, 
        email,
        gender,
        password,
    });

    sendToken(user, 201, res);
});

// Login User
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email And Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    sendToken(user, 201, res);
});

// Logout User
exports.logoutUser = asyncErrorHandler(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

// Get User Details
exports.getUserDetails = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// Forgot Password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }

    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `http://localhost:3000/password/reset/${resetToken}`;

    // Prepare email content
    const emailContent = `
        <h1>Password Reset Request</h1>
        <p>Hi ${user.name},</p>
        <p>To reset your password, please click on the following link:</p>
        <a href="${resetPasswordUrl}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message: emailContent,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({ 
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler("Invalid reset password token", 404));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res);
});

// Update Password
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is Invalid", 400));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 201, res);
});

// Update User Profile
exports.updateProfile = asyncErrorHandler(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// ADMIN DASHBOARD

// Get All Users --ADMIN
// exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
//     const users = await User.find();

//     res.status(200).json({
//         success: true,
//         users,
//     });
// });
exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
    try {
        const users = await User.find();
        console.log('Fetched users:', users); // Log users to check what is being returned

        res.status(200).json({
            success: true,
            users: users || [], // Ensure users is an array, even if empty
        });
    } catch (error) {
        console.error('Error fetching users:', error); // Log the error for debugging
        return next(new ErrorHandler('Failed to fetch users', 500));
    }
});

// Get Single User Details --ADMIN
exports.getSingleUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// Update User Role --ADMIN
exports.updateUserRole = asyncErrorHandler(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Delete User --ADMIN
exports.deleteUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
    }

    await user.remove();

    res.status(200).json({
        success: true,
    });
});
