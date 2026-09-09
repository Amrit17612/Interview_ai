const express = require('express');
const router = express.Router();
const { getWalletHistory, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/credits/history', protect, getWalletHistory);
router.put('/profile', protect, updateProfile);

module.exports = router;
