const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getAdminFeedbackList,
  getAdminFeedbackDetail
} = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

// Candidate route
router.post('/', protect, submitFeedback);

// Admin routes
router.get('/admin', protect, admin, getAdminFeedbackList);
router.get('/admin/:id', protect, admin, getAdminFeedbackDetail);

module.exports = router;
