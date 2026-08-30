const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // Positive for earn, Negative for spend
  type: { 
    type: String, 
    enum: ['EARN_SIGNUP', 'EARN_INTERVIEW', 'EARN_PURCHASE', 'SPEND_PURCHASE', 'ADMIN_ADJUSTMENT'],
    required: true
  },
  referenceId: { type: String }, // e.g., Payment ID or Interview ID
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

creditTransactionSchema.index({ user: 1, createdAt: -1 });
creditTransactionSchema.index({ referenceId: 1 });

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);
module.exports = CreditTransaction;
