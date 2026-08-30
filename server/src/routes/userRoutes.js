const express = require('express');
const router = express.Router();
const { getWalletHistory } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/credits/history', protect, getWalletHistory);

module.exports = router;
