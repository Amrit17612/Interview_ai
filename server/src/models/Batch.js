const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  schedule: {
    enabled: { type: Boolean, default: false },
    loginStartAt: { type: Date, default: null },
    loginEndAt: { type: Date, default: null },
    testDurationMinutes: { type: Number, default: null },
    forceStopAtEnd: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
