const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
  },
  passwordHash: {
    type: String,
    required: false, // Optional now that Firebase handles passwords
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  onboarding: {
    currentRole: String,
    experienceLevel: String,
    interviewGoals: [String],
    difficulty: String,
    primaryTechnology: String,
    targetCompanyType: String,
    completedAt: Date
  },
  credits: {
    type: Number,
    default: 0
  },
  purchasedBundles: [{
    bundleType: String,
    bundleId: String,
    purchaseStatus: {
      type: String,
      enum: ['active', 'pending', 'expired'],
      default: 'active'
    },
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }],
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationTokenHash: String,
  emailVerificationExpiresAt: Date,
  passwordResetTokenHash: String,
  passwordResetExpiresAt: Date
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;
