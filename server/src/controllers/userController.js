const mongoose = require('mongoose');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const Payment = require('../models/Payment');
const TRUSTED_CATALOG = require('../config/catalog');

const getWalletHistory = async (req, res, next) => {
  try {
    const transactions = await CreditTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const paymentIds = transactions
      .filter(t => (t.type === 'EARN_PURCHASE' || t.type === 'SPEND_PURCHASE') && t.referenceId)
      .map(t => t.referenceId)
      .filter(id => mongoose.Types.ObjectId.isValid(id));

    let paymentMap = {};
    if (paymentIds.length > 0) {
      const payments = await Payment.find({ _id: { $in: paymentIds } }).lean();
      payments.forEach(p => {
        let bundleTitle = 'Unknown Bundle';
        const cat = TRUSTED_CATALOG[p.bundleId];
        if (cat) {
          bundleTitle = cat.title || cat.name;
        }
        paymentMap[p._id.toString()] = {
          bundleTitle: bundleTitle
        };
      });
    }

    const history = transactions.map(t => {
      let enriched = {
        _id: t._id,
        amount: t.amount,
        type: t.type,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        createdAt: t.createdAt,
      };

      if ((t.type === 'EARN_PURCHASE' || t.type === 'SPEND_PURCHASE') && t.referenceId && paymentMap[t.referenceId]) {
        enriched.relatedBundle = paymentMap[t.referenceId].bundleTitle;
      }

      return enriched;
    });

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    // Only allow updating specific fields
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash -emailVerificationTokenHash -passwordResetTokenHash');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

const getAchievements = async (req, res) => {
  try {
    const achievementService = require('../services/achievementService');
    const data = await achievementService.getAchievementsData(req.user._id);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get Achievements Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch achievements.' });
  }
};

module.exports = {
  getWalletHistory,
  updateProfile,
  getAchievements
};
