const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  discountType: { type: String, enum: ['FIXED'], default: 'FIXED' },
  discountValue: { type: Number, required: true },
  maxGlobalUsage: { type: Number, default: null }, // Null means unlimited globally
  maxPerUserUsage: { type: Number, default: 1 }, // Null means unlimited per user
  currentUsageCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

promoCodeSchema.index({ code: 1 });

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
module.exports = PromoCode;
