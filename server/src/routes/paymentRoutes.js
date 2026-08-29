const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createOrder,
  verifyPayment,
  webhook,
  getPaymentHistory
} = require('../controllers/paymentController');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.post('/webhook', webhook);

module.exports = router;
