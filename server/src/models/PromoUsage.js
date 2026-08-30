const mongoose = require('mongoose');

const promoUsageSchema = new mongoose.Schema({
  promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  usedAt: { type: Date, default: Date.now }
});

promoUsageSchema.index({ promoCode: 1, user: 1 }, { unique: true });

const PromoUsage = mongoose.model('PromoUsage', promoUsageSchema);
module.exports = PromoUsage;
