const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

// POST route to create a new banner
router.post('/banner', bannerController.createBanner);

// GET route to fetch all banners
router.get('/banners', bannerController.getAllBanners);

// GET route to fetch a single banner by ID
router.get('/banner/:id', bannerController.getBannerById);

// PUT route to update a banner by ID
router.put('/banner/:id', bannerController.updateBanner);

// DELETE route to delete a banner by ID
router.delete('/banner/:id', bannerController.deleteBanner);

module.exports = router;
