const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { generateAIResponse } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// ============================================================================
// RATE LIMITING
// ============================================================================
// We apply a strict rate limit specifically for AI routes to prevent abuse.
// Limits are tied to the authenticated user ID rather than IP to prevent IP-spoofing bypasses.
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // Limit each user to 5 AI requests per windowMs
  keyGenerator: (req) => {
    // If user is authenticated, use their ID. Otherwise fallback to socket remote address.
    return req.user ? req.user._id.toString() : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown');
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'AI Rate Limit Error: Provider rate limit exceeded. Please try again later.'
    });
  }
});

// ============================================================================
// ROUTES
// ============================================================================

// All AI routes require authentication and are subject to AI-specific rate limiting
router.use(protect);
router.use(aiRateLimiter);

// @route   POST /api/ai/generate
// @desc    Generate AI response based on allowed prompt ID
// @access  Private
router.post('/generate', generateAIResponse);

module.exports = router;
