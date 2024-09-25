const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');

// Create New Order
// exports.newOrder = asyncErrorHandler(async (req, res, next) => {

//     const {
//         shippingInfo,
//         orderItems,
//         paymentInfo,
//         totalPrice,
//     } = req.body;

//     const orderExist = await Order.findOne({ paymentInfo });

//     if (orderExist) {
//         return next(new ErrorHandler("Order Already Placed", 400));
//     }

//     const order = await Order.create({
//         shippingInfo,
//         orderItems,
//         paymentInfo,
//         totalPrice,
//         paidAt: Date.now(),
//         user: req.user._id,
//     });

//     await sendEmail({
//         email: req.user.email,
//         templateId: process.env.SENDGRID_ORDER_TEMPLATEID,
//         data: {
//             name: req.user.name,
//             shippingInfo,
//             orderItems,
//             totalPrice,
//             oid: order._id,
//         }
//     });

//     res.status(201).json({
//         success: true,
//         order,
//     });
// });


// exports.newOrder = asyncErrorHandler(async (req, res, next) => {
//     const {
//         shippingInfo,
//         orderItems,
//         paymentInfo,
//         totalPrice,
//     } = req.body;

//     const orderExist = await Order.findOne({ paymentInfo });

//     if (orderExist) {
//         return next(new ErrorHandler("Order Already Placed", 400));
//     }

//     const order = await Order.create({
//         shippingInfo,
//         orderItems,
//         paymentInfo,
//         totalPrice,
//         paidAt: Date.now(),
//         user: req.user._id,
//     });

//     // Prepare email content
//     const emailContent = `
//         <h1>Order Confirmation</h1>
//         <p>Hi ${req.user.name},</p>
//         <p>Your order has been placed successfully!</p>
//         <p><strong>Order ID:</strong> ${order._id}</p>
//         <p><strong>Shipping Information:</strong> ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pincode}</p>
//         <p><strong>Order Items:</strong> ${orderItems.map(item => `<p>${item.name} x ${item.quantity}</p>`).join('')}</p>
//         <p><strong>Total Price:</strong> ${totalPrice}</p>
//     `;

//     await sendEmail({
//         email: req.user.email,
//         subject: 'Order Confirmation',
//         message: emailContent,
//     });

//     res.status(201).json({
//         success: true,
//         order,
//     });
// });

exports.newOrder = asyncErrorHandler(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
    } = req.body;

    const orderExist = await Order.findOne({ paymentInfo });

    if (orderExist) {
        return next(new ErrorHandler("Order Already Placed", 400));
    }

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    console.log("Order created successfully")

    // Prepare email content
    const emailContent = `
        <h1>Order Confirmation</h1>
        <p>Hi ${req.user.name},</p>
        <p>Your order has been placed successfully!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Shipping Information:</strong></p>
        <ul>
            <li><strong>Address:</strong> ${shippingInfo.address}</li>
            <li><strong>City:</strong> ${shippingInfo.city}</li>
            <li><strong>State:</strong> ${shippingInfo.state}</li>
            <li><strong>Country:</strong> ${shippingInfo.country}</li>
            <li><strong>Pincode:</strong> ${shippingInfo.pincode}</li>
            <li><strong>Phone Number:</strong> ${shippingInfo.phoneNo}</li>
        </ul>
        <p><strong>Order Items:</strong></p>
        <ul>
            ${orderItems.map(item => `
                <li>
                    <img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;"/> 
                    <strong>${item.name}</strong> x ${item.quantity} - ₹${item.price}
                </li>
            `).join('')}
        </ul>
        <p><strong>Total Price:</strong> ₹${totalPrice}</p>
        <p><strong>Payment Info:</strong></p>
        <ul>
            <li><strong>Payment ID:</strong> ${paymentInfo.id}</li>
            <li><strong>Status:</strong> ${paymentInfo.status}</li>
        </ul>
        <p><strong>Order Status:</strong> ${order.orderStatus}</p>
        <p><strong>Order Created At:</strong> ${order.createdAt.toDateString()}</p>
    `;

    console.log('Sending email...');
    await sendEmail({
        email: req.user.email,
        subject: 'Order Confirmation',
        message: emailContent,
    });
    console.log('Email sent.');

    res.status(201).json({
        success: true,
        order,
    });
});


// Get Single Order Details
exports.getSingleOrderDetails = asyncErrorHandler(async (req, res, next) => {

    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});


// Get Logged In User Orders
exports.myOrders = asyncErrorHandler(async (req, res, next) => {

    const orders = await Order.find({ user: req.user._id });

    if (!orders) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    res.status(200).json({
        success: true,
        orders,
    });
});


// Get All Orders ---ADMIN
exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {

    const orders = await Order.find();

    if (!orders) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        orders,
        totalAmount,
    });
});

// Update Order Status ---ADMIN
exports.updateOrder = asyncErrorHandler(async (req, res, next) => {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Already Delivered", 400));
    }

    if (req.body.status === "Shipped") {
        order.shippedAt = Date.now();
        order.orderItems.forEach(async (i) => {
            await updateStock(i.product, i.quantity)
        });
    }

    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
}

// Delete Order ---ADMIN
exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    await order.remove();

    res.status(200).json({
        success: true,
    });
});