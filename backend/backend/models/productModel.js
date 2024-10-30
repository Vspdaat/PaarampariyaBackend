const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter product description"]
    },

    superDescription: {
        type: String,
        required: [false, "Please enter product super description"]
    }, 

    availableWeights: [
        {
            weight: {
                type: String,
                required: true, // Ensure weight is required
            },
            price: {
                type: Number,
                required: true, // Ensure price is required
            },
        },
    ],
       
    highlights: [
        {
            image: {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            },
            label: {
                type: String,
                required: true,
            },
            highlightDesc: { // New field
                type: String,
                required: true, // You can change this to false if it's optional
            }
        },
    ],
    

   
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],

    category: {
        type: String,
        required: [true, "Please enter product category"]
    },

    sortNumber : {
        type: Number,
        required: false
    }, 
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        maxlength: [4, "Stock cannot exceed limit"],
        default: 1
    },
   
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    recipesTitle:
    {
       type :  String ,
       required :  true

    },
    recipes: [
        {
        
            image: {
                public_id: {
                    type: String,
                    required: true
                },
                url: {
                    type: String,
                    required: true
                }
            },
            description: {
                type: String,
                required: true
            }
        }
    ],
    weight: {
        type: String,
        required: false, // Optional field to store the selected weight
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);