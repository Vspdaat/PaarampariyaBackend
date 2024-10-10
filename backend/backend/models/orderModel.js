// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//     shippingInfo: {
//         address: {
//             type: String,
//             required: true 
//         },
//         city: {
//             type: String,
//             required: true
//         },
//         state: {
//             type: String,
//             required: true
//         },
//         country: {
//             type: String,
//             required: true
//         },
//         pincode: {
//             type: Number,
//             required: true
//         },
//         phoneNo: {
//             type: Number,
//             required: true
//         },
//     },
//     orderItems: [
//         {
//             name: {
//                 type: String,
//                 required: true
//             },
//             price: {
//                 type: Number,
//                 required: true
//             },
//             quantity: {
//                 type: Number,
//                 required: true
//             },
//             image: {
//                 type: String,
//                 required: true
//             },
//             product: {
//                 type: mongoose.Schema.ObjectId,
//                 ref: "Product",
//                 required: true
//             },
//         },
//     ],
//     user: {
//         type: mongoose.Schema.ObjectId,
//         ref: "User",
//         required: true
//     },
//     paymentInfo: {
//         id: {
//             type: String,
//             required: true
//         },
//         status: {
//             type: String,
//             required: true
//         },
//     },
//     paidAt: {
//         type: Date,
//         required: true
//     },
//     totalPrice: {
//         type: Number,
//         required: true,
//         default: 0
//     },
//     orderStatus: {
//         type: String,
//         required: true,
//         default: "Processing",
//     },
//     deliveredAt: Date,
//     shippedAt: Date,
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
// });

// module.exports = mongoose.model("Order", orderSchema);
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            }
        }
    ],
    billingDetails: {
        name: String,
        email: String,
        phoneNumber: Number,
        address: String,
        city: String,
        zip: String,
    },
    shippingInfo: {
        address: String,
        city: String,
        state:String ,
        country: String,
        pincode: Number,
        phoneNumber: Number
    },

    totalAmount: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    orderStatus: {
        type: String,
        required: true,
        default: "Processing",
    },
    deliveredAt: Date,
    shippedAt: Date
});

module.exports = mongoose.model('Order', orderSchema);
