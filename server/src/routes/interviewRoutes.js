const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createInterviewSession,
  getInterviewSessions,
  getInterviewSession,
  generateQuestion,
  submitAnswer,
  completeInterview,
  retryReport,
  getInterviewStats,
  compareInterviews,
  getInterviewRoadmap
} = require('../controllers/interviewController');
const { geminiStrictLimiter } = require('../middleware/rateLimiter');

// All interview routes require authentication
router.use(protect);

router.route('/')
  .post(createInterviewSession)
  .get(getInterviewSessions);

router.route('/stats')
  .get(getInterviewStats);

router.route('/roadmap')
  .get(getInterviewRoadmap);

router.route('/compare')
  .get(compareInterviews);

router.route('/:id')
  .get(getInterviewSession);

router.route('/:id/question')
  .post(generateQuestion);

router.route('/:id/answer')
  .post(submitAnswer);

router.route('/:id/complete')
  .post(geminiStrictLimiter, completeInterview);

router.route('/:id/retry-report')
  .post(geminiStrictLimiter, retryReport);

module.exports = router;
