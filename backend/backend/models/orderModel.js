const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false,
    },
    guestUser:{
        type: String,
        required: false,
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
            },
            name: {
                type: String,
                required: true,
            },
            image: {
                type: String,
                required: false,
            },
            weight: {
                type: String,
                required: false,
            },

        }
    ],
    billingDetails: {
        firstname: String,
        email: String,
        phone: Number,
        address: String,
        city: String,
        zip: String,
    },
    shippingInfo: {
        address: String,
        city: String,
        state:String ,
        country: String,
        zip: Number,
        phoneNumber: Number
    },

    totalAmount: {
        type: Number,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    orderStatus: {
        type: String,
        required: false,
        default: "Processing",
    },
    deliveredAt: Date,
    shippedAt: Date
});

module.exports = mongoose.model('Order', orderSchema);
