const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/paymentModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel'); // Import your Order model
const sendEmail = require('../utils/sendEmail');
const User = require('../models/userModel');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Process Razorpay payment
exports.processPayment = asyncErrorHandler(async (req, res, next) => {
    const { amount } = req.body;
    const amountInPaise = amount * 100; // Convert to paise

    const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: crypto.randomBytes(16).toString("hex"),
    };

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error); // Log error for debugging
        next(new ErrorHandler(error.message, 500));
    }
});


exports.razorpayResponse = asyncErrorHandler(async (req, res, next) => {
    const { paymentId, orderId, signature, orderData, guestUser } = req.body;



    console.log("Received Razorpay response:", { paymentId, orderId, signature, guestUser });
    console.log("Order Data:", orderData);

    // Generate expected signature
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    console.log("Generated Signature:", generatedSignature);

    // Validate signature
    if (generatedSignature === signature) {
        console.log("Signature verification passed.");

        try {
            // Set payment info
            orderData.paymentInfo = {
                id: paymentId,
                status: "Succeeded",
            };
            orderData.paidAt = new Date();

            // Convert product list into orderItems for the database
            const orderItems = orderData.products.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                name: item.name,
                weight: item.weight,
            }));

            // Add orderItems to orderData
            const orderDetails = {
                ...orderData,
                guestUser: guestUser?.id,
                orderItems: orderItems,
            };

            console.log("Final Order Details for DB:", orderDetails);

            // Save the Order in the database
            const order = await Order.create(orderDetails);
            console.log("Order created successfully:", order);

            let user = null;
            if (!guestUser) {
                user = await User.findById(orderData.user).select('email name');
                if (!user) {
                    console.error("User not found for ID:", orderData.user);
                    return res.status(404).json({
                        success: false,
                        message: "User not found"
                    });
                }
                console.log("User found:", user);
            } else {
                user = guestUser;
                console.log("Processing for guest user:", guestUser);
            }

            // Save Payment details
            await Payment.create({
                orderId: orderId,
                txnId: paymentId,
                txnAmount: orderData.totalAmount.toString(),
                txnType: 'PAYMENT',
                gatewayName: 'Razorpay',
                paymentMode: 'ONLINE',
                refundAmt: '0',
                txnDate: new Date().toISOString(),
                resultInfo: {
                    resultStatus: 'SUCCESS',
                    resultCode: '200',
                    resultMsg: 'Payment successful'
                }
            });

            console.log("Payment details saved successfully.");

            // Prepare email content
            const emailContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                    .container { background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin: auto; max-width: 600px; padding: 20px; }
                    h1 { color: #333; text-align: center; }
                    p { color: #555; font-size: 16px; line-height: 1.5; }
                    .order-details { background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 20px 0; }
                    .order-items { margin: 15px 0; }
                    .total-price { font-weight: bold; font-size: 18px; color: #333; margin-top: 10px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #888; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Order Confirmation</h1>
                    <p>Hi ${user.name || user.given_name},</p>
                    <p>Your order has been placed successfully!</p>
                    <div class="order-details">
                        <p><strong>Order ID:</strong> ${order._id}</p>
                        <p><strong>Shipping Information:</strong></p>
                        <p>${orderData.shippingInfo.address}, ${orderData.shippingInfo.city}, ${orderData.shippingInfo.state} - ${orderData.shippingInfo.zip}</p>
                    </div>
                    <div class="order-items">
                        <p><strong>Order Items:</strong></p>
                        ${orderItems.map(item => ` <p><strong>Product:</strong> ${item.name}, <strong>Quantity:</strong> ${item.quantity}</p>`).join('')}
                    </div>
                    <p class="total-price"><strong>Total Price:</strong> ₹${orderData.totalAmount.toFixed(2)}</p>
                    <div class="footer">
                        <p>If you have any questions, please contact us at <a href="mailto:paarampariyaa@gmail.com">paarampariyaa@gmail.com</a>.</p>
                        <p>Thank you for shopping with us!</p>
                    </div>
                </div>
            </body>
            </html>
        `;

            if (user.email) {
                console.log("Sending email to:", user.email);
                await sendEmail({
                    email: user.email,
                    subject: 'Order Confirmation',
                    message: emailContent,
                });
                console.log("Email sent successfully.");
            } else {
                console.error("No email address provided for order confirmation.");
            }

            res.status(200).json({
                success: true,
                message: "Payment Successful",
                orderId: order._id
            });
            console.log("Response sent with success.");

        } catch (error) {
            console.error("Error occurred during payment processing:", error);
            return res.redirect(`http://localhost:3000/orders/failed`);
        }
    } else {
        console.error("Signature verification failed. Redirecting to failed page.");
        return res.redirect(`http://localhost:3000/orders/failed`);
    }
});
// Get payment status
exports.getPaymentStatus = asyncErrorHandler(async (req, res, next) => {
    const payment = await Payment.findOne({ orderId: req.params.id });

    if (!payment) {
        return next(new ErrorHandler("Payment Details Not Found", 404));
    }

    res.status(200).json({
        success: true,
        payment,
    });
});
