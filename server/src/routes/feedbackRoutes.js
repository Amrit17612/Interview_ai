const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getAdminFeedbackList,
  getAdminFeedbackDetail
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Candidate route
router.post('/', protect, submitFeedback);

// Admin routes
router.get('/admin', protect, requireAdmin, getAdminFeedbackList);
router.get('/admin/:id', protect, requireAdmin, getAdminFeedbackDetail);

module.exports = router;
