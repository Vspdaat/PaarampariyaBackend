
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');



exports.newOrder = asyncErrorHandler(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        totalAmount,
    } = req.body;

    const orderExist = await Order.findOne({ paymentInfo });

    if (orderExist) {
        return next(new ErrorHandler("Order Already Placed", 400));
    }

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        totalAmount ,
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
        <p><strong>Total Price:</strong> ₹${totalAmount}</p>
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


exports.getSingleOrderDetails = asyncErrorHandler(async (req, res, next) => {
    try {
        console.log('Order ID received in backend:', req.params.id);

        const order = await Order.findById(req.params.id).populate("user", "name email " );
console.log(order)
        if (!order) {
            return next(new ErrorHandler("Order Not Found", 404));
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Error fetching order details:", error);
        return next(new ErrorHandler("Internal Server Error", 500));  // Logs the actual error
    }
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
        totalAmount += order.totalAmount;
    });

    res.status(200).json({
        success: true,
        orders,
        totalAmount,
    });
});


exports.updateOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Order already delivered", 400));
    }

    if (req.body.status === "Shipped") {
        order.shippedAt = Date.now();
        // Loop through the products array instead of orderItems
        order.products.forEach(async (item) => {
            await updateStock(item.productId, item.quantity);
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
exports.placeOrder = async (req, res, next) => {
    const { products, billingDetails } = req.body;

    if (!products || products.length === 0) {
        return next(new ErrorHandler('No products in the order', 400));
    }

    try {
        const order = await Order.create({
            user: req.user._id,
            products,
            billingDetails,
            totalAmount: calculateTotalAmount(products), 
        });

        res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Error placing order:', error);
        return next(new ErrorHandler('Failed to place order', 500));
    }
};