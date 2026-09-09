const express = require('express');
const router = express.Router();
const { getWalletHistory, updateProfile, getAchievements } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/credits/history', protect, getWalletHistory);
router.put('/profile', protect, updateProfile);
router.get('/achievements', protect, getAchievements);

module.exports = router;
