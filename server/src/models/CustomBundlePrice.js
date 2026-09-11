const mongoose = require('mongoose');

const customBundlePriceSchema = new mongoose.Schema({
  bundleId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  // --- New Optional Metadata Fields ---
  type: {
    type: String,
    enum: ['COMPANY', 'DOMAIN', 'company', 'domain'],
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  originalPrice: {
    type: Number,
  },
  features: {
    type: [String],
    default: [],
  },
  iconType: {
    type: String,
  },
  visibility: {
    type: String,
    enum: ['PUBLIC', 'PRIVATE'],
    default: 'PUBLIC',
  },
  modules: {
    type: [mongoose.Schema.Types.Mixed], // array of objects/refs
    default: [],
  },
  logo: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('CustomBundlePrice', customBundlePriceSchema);
