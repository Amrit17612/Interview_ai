const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe, completeOnboarding } = require('../controllers/authController');
const { protect, decodeFirebaseToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// In the Firebase flow, '/register' acts as the Mongo DB sync endpoint
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

// Onboarding route
router.patch('/onboarding', protect, completeOnboarding);

module.exports = router;
