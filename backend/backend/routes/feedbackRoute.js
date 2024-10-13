// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// POST feedback
router.post('/feedback', feedbackController.createFeedback);

// GET all feedback
router.get('/feedback', feedbackController.getAllFeedback);

// DELETE feedback by ID
router.delete('/feedback/:id', feedbackController.deleteFeedback);

module.exports = router;
