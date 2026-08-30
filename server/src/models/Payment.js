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
    enum: [
      'CREATED',
      'PENDING',
      'PROCESSING',
      'SUCCESS',
      'FAILED',
      'FAILED_PROMO_LIMIT_EXCEEDED',
      'FAILED_INSUFFICIENT_CREDITS',
      'REFUNDED'
    ],
    default: 'CREATED'
  },
  gateway: {
    type: String,
    default: 'RAZORPAY'
  },
  razorpayOrderId: {
    type: String,
    required: function() {
      return this.amount > 0;
    }
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

// Partial unique index for Razorpay Order ID
paymentSchema.index(
  { razorpayOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      razorpayOrderId: { $type: "string" }
    }
  }
);

// Atomic lock: Prevent a user from creating multiple concurrent active payments for the same bundle
paymentSchema.index(
  { user: 1, bundleId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { 
      status: { $in: ['CREATED', 'PROCESSING', 'SUCCESS'] } 
    } 
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
