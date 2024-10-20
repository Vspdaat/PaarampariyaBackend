
const express = require('express');
const cors = require('cors'); // Import CORS
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middlewares/error');

const app = express();

// config
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: 'backend/config/config.env' });
}

const allowedOrigins = ['http://localhost:3000', 'https://paarampariya-1.web.app', 'https://paarampariyaadmin.web.app'];

const corsChecker = function (origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const corsOptions = {
  origin: corsChecker,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');
const cartRoute = require('./routes/cartRoute');
const categoryRoute = require('./routes/categoryRoute');
const feedbackRoute = require('./routes/feedbackRoute');
const bannerRoute = require('./routes/bannerRoute');


app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', order);
app.use('/api/v1', payment);
app.use('/api/v1', cartRoute);
app.use('/api/v1', categoryRoute);
app.use('/api/v1', feedbackRoute);
app.use('/api/v1', bannerRoute);

// error middleware
app.use(errorMiddleware);

module.exports = app;





