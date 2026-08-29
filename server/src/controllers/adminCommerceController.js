const Payment = require('../models/Payment');

/**
 * Get payment analytics
 * @route GET /api/admin/analytics/payments
 */
const getPaymentAnalytics = async (req, res, next) => {
  try {
    const totalSuccessfulRevenue = await Payment.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenue = totalSuccessfulRevenue.length ? totalSuccessfulRevenue[0].total / 100 : 0;

    const totalSuccessfulPurchases = await Payment.countDocuments({ status: 'SUCCESS' });
    const uniquePurchasers = await Payment.distinct('user', { status: 'SUCCESS' });
    const totalPurchasedBundles = await Payment.countDocuments({ status: 'SUCCESS', bundleId: { $exists: true } });

    // Recent transactions
    const recentTransactions = await Payment.find({ status: 'SUCCESS' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName email')
      .lean();

    // Bundle wise breakdown
    const bundleAnalytics = await Payment.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: '$bundleId', count: { $sum: 1 }, revenue: { $sum: '$amount' }, type: { $first: '$bundleType' } } },
      { $sort: { count: -1 } }
    ]);

    // Format bundle analytics to frontend-friendly currency
    const formattedBundleAnalytics = bundleAnalytics.map(b => ({
      ...b,
      revenue: b.revenue / 100
    }));

    // Payment status distribution
    const statusDistribution = await Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      analytics: {
        totalRevenue: revenue,
        totalPurchases: totalSuccessfulPurchases,
        uniqueUsers: uniquePurchasers.length,
        totalBundles: totalPurchasedBundles,
        recentTransactions: recentTransactions.map(t => ({...t, amount: t.amount / 100})),
        bundleAnalytics: formattedBundleAnalytics,
        statusDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated transactions list
 * @route GET /api/admin/payments
 */
const getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.bundleType) query.bundleType = req.query.bundleType;
    if (req.query.bundleId) query.bundleId = req.query.bundleId;
    if (req.query.razorpayPaymentId) query.razorpayPaymentId = req.query.razorpayPaymentId;
    if (req.query.razorpayOrderId) query.razorpayOrderId = req.query.razorpayOrderId;
    // Add logic for email/name search if needed (would require joining User model or finding user IDs first)
    // To keep it simple, if email is provided, find User first
    if (req.query.email || req.query.name) {
      const User = require('../models/User');
      const userQuery = {};
      if (req.query.email) userQuery.email = { $regex: req.query.email, $options: 'i' };
      if (req.query.name) {
        userQuery.$or = [
          { firstName: { $regex: req.query.name, $options: 'i' } },
          { lastName: { $regex: req.query.name, $options: 'i' } }
        ];
      }
      const matchedUsers = await User.find(userQuery).select('_id').lean();
      query.user = { $in: matchedUsers.map(u => u._id) };
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email')
      .lean();

    res.json({
      success: true,
      data: payments.map(t => ({...t, amount: t.amount / 100})),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment detail
 * @route GET /api/admin/payments/:id
 */
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'firstName lastName email role createdAt purchasedBundles')
      .lean();

    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    res.json({
      success: true,
      data: {
        ...payment,
        amount: payment.amount / 100
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentAnalytics,
  getPayments,
  getPaymentById
};
