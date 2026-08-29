const User = require('../models/User');
const Payment = require('../models/Payment');

/**
 * Get basic dashboard stats for the admin
 * @route GET /api/admin/dashboard
 * @access Private/Admin
 */
const getDashboardOverview = async (req, res, next) => {
  try {
    // For Phase 1, we just return basic counts safely
    const totalUsers = await User.countDocuments();
    const totalRevenueAggr = await Payment.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalRevenue = totalRevenueAggr.length > 0 ? totalRevenueAggr[0].total / 100 : 0; // Assuming amount is in paise/cents

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview
};
