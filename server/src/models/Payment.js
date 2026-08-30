const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bundleId: {
    type: String,
    required: true
  },
  bundleType: {
    type: String,
    enum: ['COMPANY', 'DOMAIN'],
    required: true
  },
  originalAmount: {
    type: Number,
    required: true
  },
  promoCodeApplied: {
    type: String,
    default: null
  },
  promoDiscountAmount: {
    type: Number,
    default: 0
  },
  creditsUsed: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'CREATED'
  },
  gateway: {
    type: String,
    default: 'RAZORPAY'
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true,
    unique: true
  },
  razorpaySignature: {
    type: String
  }
}, {
  timestamps: true
});

paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
