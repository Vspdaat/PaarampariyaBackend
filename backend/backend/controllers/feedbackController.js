// controllers/feedbackController.js
const Feedback = require('../models/feedbackModel');

// Create feedback (POST)
exports.createFeedback = async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({ message: 'Feedback created successfully', feedback });
  } catch (err) {
    res.status(400).json({ message: 'Error creating feedback', error: err.message });
  }
};

// Get all feedback (GET)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving feedback', error: err.message });
  }
};

// Delete feedback by ID (DELETE)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting feedback', error: err.message });
  }
};
