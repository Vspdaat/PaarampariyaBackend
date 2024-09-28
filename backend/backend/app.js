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


// const express = require('express');
// const cors = require('cors'); // Import CORS
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const fileUpload = require('express-fileupload');
// const errorMiddleware = require('./middlewares/error');

// const app = express();

// // config
// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config({ path: 'backend/config/config.env' });
// }

// // Use CORS middleware
// const allowedOrigins = ['http://localhost:3000', 'https://paarampariya-1.web.app', 'https://paarampariyaadmin.web.app'];
  

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };

// app.options('*', cors(corsOptions)); // Handle preflight requests


// const app = express();

// Allow specific origin



// app.use(cors({
//   origin: 'https://paarampariyaadmin.web.app',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
  
// }));

// app.use(express.json());
// app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(fileUpload());

// const user = require('./routes/userRoute');
// const product = require('./routes/productRoute');
// const order = require('./routes/orderRoute');
// const payment = require('./routes/paymentRoute');
// // app.js or your main server file
// const cartRoutes = require('./routes/cartRoutes');
// app.options('/api/v1', cors());
// app.use('/api/v1', cartRoutes);

// app.use('/api/v1', user);
// app.use('/api/v1', product);

// app.use('/api/v1', order);
// app.use('/api/v1', payment);

// // error middleware
// app.use(errorMiddleware);

// module.exports = app;




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

const allowedOrigins = ['http://localhost:3000', 'https://paarampariya-1.web.app', 'https://paarampariya-backend.vercel.app'];

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


app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', order);
app.use('/api/v1', payment);
app.use('/api/v1', cartRoute);

// error middleware
app.use(errorMiddleware);

module.exports = app;





