// const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
// // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const paytm = require('paytmchecksum');
// const https = require('https');
// const Payment = require('../models/paymentModel');
// const ErrorHandler = require('../utils/errorHandler');
// const { v4: uuidv4 } = require('uuid');


// exports.processPayment = asyncErrorHandler(async (req, res, next) => {

//     const { amount, email, phoneNo } = req.body;

//     var params = {};

//     /* initialize an array */
//     params["MID"] = process.env.PAYTM_MID;
//     params["WEBSITE"] = process.env.PAYTM_WEBSITE;
//     params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
//     params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE;
//     params["ORDER_ID"] = "oid" + uuidv4();
//     params["CUST_ID"] = process.env.PAYTM_CUST_ID;
//     params["TXN_AMOUNT"] = JSON.stringify(amount);

//     params["CALLBACK_URL"] = `https://${req.get("host")}/api/v1/callback`;
//     params["EMAIL"] = email;
//     params["MOBILE_NO"] = phoneNo;

//     let paytmChecksum = paytm.generateSignature(params, process.env.PAYTM_MERCHANT_KEY);
//     paytmChecksum.then(function (checksum) {

//         let paytmParams = {
//             ...params,
//             "CHECKSUMHASH": checksum,
//         };

//         res.status(200).json({
//             paytmParams
//         });

//     }).catch(function (error) {
//         console.log(error);
//     });
// });

// // Paytm Callback
// exports.paytmResponse = (req, res, next) => {

//     // console.log(req.body);

//     let paytmChecksum = req.body.CHECKSUMHASH;
//     delete req.body.CHECKSUMHASH;

//     let isVerifySignature = paytm.verifySignature(req.body, process.env.PAYTM_MERCHANT_KEY, paytmChecksum);
//     if (isVerifySignature) {
//         // console.log("Checksum Matched");

//         var paytmParams = {};

//         paytmParams.body = {
//             "mid": req.body.MID,
//             "orderId": req.body.ORDERID,
//         };

//         paytm.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function (checksum) {

//             paytmParams.head = {
//                 "signature": checksum
//             };

//             /* prepare JSON string for request */
//             var post_data = JSON.stringify(paytmParams);

//             var options = {
//                 /* for Staging */
//                 hostname: 'securegw-stage.paytm.in',
//                 /* for Production */
//                 // hostname: 'securegw.paytm.in',
//                 port: 443,
//                 path: '/v3/order/status',
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Content-Length': post_data.length
//                 }
//             };

//             // Set up the request
//             var response = "";
//             var post_req = https.request(options, function (post_res) {
//                 post_res.on('data', function (chunk) {
//                     response += chunk;
//                 });

//                 post_res.on('end', function () {
//                     let { body } = JSON.parse(response);
//                     // let status = body.resultInfo.resultStatus;
//                     // res.json(body);
//                     addPayment(body);
//                     // res.redirect(`${req.protocol}://${req.get("host")}/order/${body.orderId}`)
//                     res.redirect(`https://${req.get("host")}/order/${body.orderId}`)
//                 });
//             });

//             // post the data
//             post_req.write(post_data);
//             post_req.end();
//         });

//     } else {
//         console.log("Checksum Mismatched");
//     }
// }

// const addPayment = async (data) => {
//     try {
//         await Payment.create(data);
//     } catch (error) {
//         console.log("Payment Failed!");
//     }
// }

// exports.getPaymentStatus = asyncErrorHandler(async (req, res, next) => {

//     const payment = await Payment.findOne({ orderId: req.params.id });

//     if (!payment) {
//         return next(new ErrorHandler("Payment Details Not Found", 404));
//     }

//     const txn = {
//         id: payment.txnId,
//         status: payment.resultInfo.resultStatus,
//     }

//     res.status(200).json({
//         success: true,
//         txn,
//     });
// });




// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const Payment = require('../models/paymentModel');
// const ErrorHandler = require('../utils/errorHandler');
// const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
// const Order = require('../models/orderModel'); // Import your Order model
// const sendEmail = require('../utils/sendEmail');
// const User = require('../models/userModel');

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// exports.processPayment = asyncErrorHandler(async (req, res, next) => {
//     const { amount } = req.body;

//     // Convert amount from INR to paise
//     const amountInPaise = amount * 100;

//     const options = {
//         amount: amountInPaise,
//         currency: "INR",
//         receipt: crypto.randomBytes(16).toString("hex"),
//     };

//     try {
//         const order = await razorpay.orders.create(options);
//         res.status(200).json({
//             success: true,
//             orderId: order.id,
//             amount: order.amount,
//         });
//     } catch (error) {
//         console.error("Error creating Razorpay order:", error); // Log error for debugging
//         next(new ErrorHandler(error.message, 500));
//     }
// });


// exports.razorpayResponse = asyncErrorHandler(async (req, res, next) => {
//     const { paymentId, orderId, signature, orderData } = req.body;
//     console.log(orderData);
//     // Generate the expected signature
//     const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//         .update(`${orderId}|${paymentId}`)
//         .digest('hex');

//     // Compare the generated signature with the one sent by Razorpay
//     if (generatedSignature === signature) {
//         try {
//             // Set the paidAt field to the current date and time
//             orderData.paymentInfo = {
//                 id: paymentId,
//                 status: "Succeeded"
//             };
//             orderData.paidAt = new Date(); // Set the paidAt field

//             // Create the Order
//             const order = await Order.create(orderData);

//             // Retrieve user information
//             const user = await User.findById(orderData.user).select('email name'); // Fetch only email and name
//             if (!user) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "User not found"
//                 });
//             }

//             // Save the Payment details
//             await Payment.create({
//                 orderId: orderId,
//                 txnId: paymentId,
//                 txnAmount: orderData.totalAmount.toString(), // Ensure it's in string format
//                 txnType: 'PAYMENT', // Default or extract from response if available
//                 gatewayName: 'Razorpay', // Default or based on the response
//                 paymentMode: 'ONLINE', // Default or extract from response
//                 refundAmt: '0', // Default or based on response
//                 txnDate: new Date().toISOString(), // Default or convert actual date if available
//                 resultInfo: {
//                     resultStatus: 'SUCCESS',
//                     resultCode: '200',
//                     resultMsg: 'Payment successful'
//                 }
//             });

//             // Prepare email content
//             const emailContent = `
//             <html>
//             <head>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         background-color: #f4f4f4;
//                         margin: 0;
//                         padding: 20px;
//                     }
//                     .container {
//                         background-color: #fff;
//                         border-radius: 8px;
//                         box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//                         margin: auto;
//                         max-width: 600px;
//                         padding: 20px;
//                     }
//                     h1 {
//                         color: #333;
//                         text-align: center;
//                     }
//                     p {
//                         color: #555;
//                         font-size: 16px;
//                         line-height: 1.5;
//                     }
//                     .order-details {
//                         background-color: #f9f9f9;
//                         border: 1px solid #ddd;
//                         border-radius: 4px;
//                         padding: 15px;
//                         margin: 20px 0;
//                     }
//                     .order-details p {
//                         margin: 5px 0;
//                     }
//                     .order-items {
//                         margin: 15px 0;
//                     }
//                     .order-items p {
//                         margin: 5px 0;
//                     }
//                     .total-price {
//                         font-weight: bold;
//                         font-size: 18px;
//                         color: #333;
//                         margin-top: 10px;
//                     }
//                     .footer {
//                         text-align: center;
//                         margin-top: 20px;
//                         font-size: 14px;
//                         color: #888;
//                     }
//                     .footer a {
//                         color: #007bff;
//                         text-decoration: none;
//                     }
//                     .footer a:hover {
//                         text-decoration: underline;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <h1>Order Confirmation</h1>
//                     <p>Hi ${user.name},</p>
//                     <p>Your order has been placed successfully!</p>
        
//                     <div class="order-details">
//                         <p><strong>Order ID:</strong> ${order._id}</p>
//                         <p><strong>Shipping Information:</strong></p>
//                         <p>${orderData.shippingInfo.address}, ${orderData.shippingInfo.city}, ${orderData.shippingInfo.state} - ${orderData.shippingInfo.pincode}</p>
//                     </div>
        
//                     <div class="order-items">
//                         <p><strong>Order Items:</strong></p>
//                         ${orderData.orderItems.map(item => `<p>${item.name} x ${item.quantity} - $${item.price.toFixed(2)}</p>`).join('')}
//                     </div>
        
//                    <p class="total-price"><strong>Total Price:</strong> ₹${orderData.totalAmount.toFixed(2)}</p>

        
//                     <div class="footer">
//                         <p>If you have any questions, please contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
//                         <p>Thank you for shopping with us!</p>
//                     </div>
//                 </div>
//             </body>
//             </html>
//         `;
        
//             // Send email
//             if (user.email) {
//                 await sendEmail({
//                     email: user.email,
//                     subject: 'Order Confirmation',
//                     message: emailContent,
//                 });
//             } else {
//                 console.error('No email address provided for order confirmation.');
//             }

//             res.status(200).json({
//                 success: true,
//                 message: "Payment Successful",
//                 orderId: order._id
//             });

//         } catch (error) {
//             console.error("Error saving payment:", error);
//             return res.redirect(`http://localhost:3000/orders/failed`);
//         }
//     } else {
//         return res.redirect(`http://localhost:3000/orders/failed`);
//     }
// });




// exports.getPaymentStatus = asyncErrorHandler(async (req, res, next) => {
//     const payment = await Payment.findOne({ orderId: req.params.id });

//     if (!payment) {
//         return next(new ErrorHandler("Payment Details Not Found", 404));
//     }

//     res.status(200).json({
//         success: true,
//         payment,
//     });
// });


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

// Handle Razorpay payment response
exports.razorpayResponse = asyncErrorHandler(async (req, res, next) => {
    const { paymentId, orderId, signature, orderData } = req.body;
    console.log(orderId);

    // Generate expected signature
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    // Validate signature
    if (generatedSignature === signature) {
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
                quantity: item.quantity
            }));

            // Add orderItems to orderData
            const orderDetails = {
                ...orderData,
                orderItems: orderItems, // Add the orderItems
            };

            // Save the Order in the database
            const order = await Order.create(orderDetails);

            // Retrieve user info for email
            const user = await User.findById(orderData.user).select('email name');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Save Payment details
            await Payment.create({
                orderId: orderId,
                txnId: paymentId,
                txnAmount: orderData.totalAmount.toString(), // Ensure it's in string format
                txnType: 'PAYMENT', // Default type
                gatewayName: 'Razorpay', // Default gateway
                paymentMode: 'ONLINE', // Default mode
                refundAmt: '0', // Default or update based on logic
                txnDate: new Date().toISOString(), // Save the current date
                resultInfo: {
                    resultStatus: 'SUCCESS',
                    resultCode: '200',
                    resultMsg: 'Payment successful'
                }
            });

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
                        <p>Hi ${user.name},</p>
                        <p>Your order has been placed successfully!</p>
                        <div class="order-details">
                            <p><strong>Order ID:</strong> ${order._id}</p>
                            <p><strong>Shipping Information:</strong></p>
                            <p>${orderData.shippingInfo.address}, ${orderData.shippingInfo.city}, ${orderData.shippingInfo.state} - ${orderData.shippingInfo.zip}</p>
                        </div>
                        <div class="order-items">
                            <p><strong>Order Items:</strong></p>
                            ${orderItems.map(item => `<p>Product: ${item.product}, Quantity: ${item.quantity}</p>`).join('')}
                        </div>
                        <p class="total-price"><strong>Total Price:</strong> ₹${orderData.totalAmount.toFixed(2)}</p>
                        <div class="footer">
                            <p>If you have any questions, please contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
                            <p>Thank you for shopping with us!</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Send email
            if (user.email) {
                await sendEmail({
                    email: user.email,
                    subject: 'Order Confirmation',
                    message: emailContent,
                });
            } else {
                console.error('No email address provided for order confirmation.');
            }

            res.status(200).json({
                success: true,
                message: "Payment Successful",
                orderId: order._id
            });

        } catch (error) {
            console.error("Error saving payment:", error);
            return res.redirect(`http://localhost:3000/orders/failed`);
        }
    } else {
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
