const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, verifyEmail, resendVerification, forgotPassword, resetPassword, completeOnboarding } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

// Verification and Reset routes
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Onboarding route
router.patch('/onboarding', protect, completeOnboarding);

module.exports = router;
