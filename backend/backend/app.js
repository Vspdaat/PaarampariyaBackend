// const express = require('express');
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const fileUpload = require('express-fileupload');
// const errorMiddleware = require('./middlewares/error');

// const app = express();

// // config
// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config({ path: 'backend/config/config.env' });
// } 

// app.use(express.json());
// app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(fileUpload());

// const user = require('./routes/userRoute');
// const product = require('./routes/productRoute');
// const order = require('./routes/orderRoute');
// const payment = require('./routes/paymentRoute');

// app.use('/api/v1', user);
// app.use('/api/v1', product);
// app.use('/api/v1', order);
// app.use('/api/v1', payment);

// // error middleware
// app.use(errorMiddleware);

// module.exports = app;
require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middlewares/error');


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));





// Use CORS middleware
const corsOptions = {
    origin: ['http://localhost:3000', 'https://paarampariya-1.web.app', 'https://paarampariyaadmin.web.app'], // Allowed domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS in allowed methods
    credentials: true, // Allow credentials
    allowedHeaders: ['Content-Type', 'Authorization'], // Add allowed headers if necessary
    preflightContinue: false, // Stop preflight after handling
    optionsSuccessStatus: 204, // Some browsers choke on 204 status for preflight
  };
  
  app.use(cors(corsOptions));
  
  // Handle preflight requests manually (optional, usually handled by cors middleware)
  app.options('*', cors(corsOptions)); // Pre-flight handling for all routes


app.use(fileUpload());

const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');
// app.js or your main server file
const cartRoutes = require('./routes/cartRoutes');

app.use('/api/v1', cartRoutes);

app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', order);
app.use('/api/v1', payment);

// error middleware
app.use(errorMiddleware);

module.exports = app;
