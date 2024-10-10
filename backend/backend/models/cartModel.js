

// const mongoose = require('mongoose');

// const cartSchema = new mongoose.Schema({  
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   products: [
//     {
//       product: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Product',
//         required: true,
//       },
//       quantity: {
//         type: Number,
//         required: true,
//       }
//     }
//   ]
// });

// module.exports = mongoose.model('Cart', cartSchema);



const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true, 
      },
      quantity: {
        type: Number,
        required: true,
      },
      weight: {
        type: String,
        required: true,
        default: 0, // Provide a default value for weight
      },
      price: {
        type: Number,
        required: true,
        default: 0, // Provide a default value for price
      },

    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);
