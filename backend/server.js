const path = require('path');
const express = require('express');
const cloudinary = require('cloudinary');
const app = require('./backend/app');
const connectDatabase = require('./backend/config/database');
const PORT = process.env.PORT || 4000;


connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// deployment
app.get('/', (req, res) => {
        res.send('Server is Running! 🚀');
});




    app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});

