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
  }
}, { timestamps: true });

module.exports = mongoose.model('CustomBundlePrice', customBundlePriceSchema);
