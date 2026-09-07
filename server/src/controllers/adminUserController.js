const User = require('../models/User');
const Payment = require('../models/Payment');
const InterviewSession = require('../models/InterviewSession');
const AuditLog = require('../models/AuditLog');
const TRUSTED_CATALOG = require('../config/catalog');

/**
 * Get paginated user list
 * @route GET /api/admin/users
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;

    const query = {};
    
    if (req.query.email) {
      query.email = { $regex: req.query.email, $options: 'i' };
    }
    
    if (req.query.name) {
      query.$or = [
        { firstName: { $regex: req.query.name, $options: 'i' } },
        { lastName: { $regex: req.query.name, $options: 'i' } }
      ];
    }
    
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    if (req.query.hasPurchases === 'true') {
      query['purchasedBundles.0'] = { $exists: true };
    } else if (req.query.hasPurchases === 'false') {
      query['purchasedBundles'] = { $size: 0 };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash -firebaseUid -emailVerificationTokenHash -passwordResetTokenHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: users,
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
 * Get user detail
 * @route GET /api/admin/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash -firebaseUid -emailVerificationTokenHash -passwordResetTokenHash')
      .lean();

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Get total amount spent
    const totalSpentAggr = await Payment.aggregate([
      { $match: { user: user._id, status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSpent = totalSpentAggr.length ? totalSpentAggr[0].total / 100 : 0;
    
    // Get last purchase date
    const lastPurchase = await Payment.findOne({ user: user._id, status: 'SUCCESS' })
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();

    // Get purchase history (all transactions)
    const purchaseHistory = await Payment.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Get interview sessions
    const interviewSessions = await InterviewSession.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select('status createdAt configuration')
      .lean();

    res.json({
      success: true,
      data: {
        ...user,
        totalSpent,
        lastPurchaseDate: lastPurchase ? lastPurchase.createdAt : null,
        purchaseHistory: purchaseHistory.map(p => ({...p, amount: p.amount / 100})),
        interviewSessions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Grant a bundle manually
 * @route POST /api/admin/users/:id/grant-bundle
 */
const grantBundle = async (req, res, next) => {
  try {
    const { bundleId, reason } = req.body;
    const targetUserId = req.params.id;

    if (!bundleId) {
      res.status(400);
      throw new Error('Bundle ID is required');
    }

    if (!reason || reason.trim().length < 5 || reason.length > 500) {
      res.status(400);
      throw new Error('A valid reason (5-500 characters) is required for manual grants');
    }

    // Validate bundleId against catalog
    const bundleInfo = TRUSTED_CATALOG[bundleId];
    
    if (!bundleInfo) {
      res.status(400);
      throw new Error('Invalid bundle ID. Not found in trusted catalog.');
    }

    const bundleType = bundleInfo.bundleType;

    // Atomic update: only push if not already owned
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: targetUserId,
        "purchasedBundles.bundleId": { $ne: bundleId }
      },
      {
        $push: {
          purchasedBundles: {
            bundleId,
            bundleType,
            purchaseStatus: 'active',
            purchasedAt: new Date(),
            source: 'ADMIN_GRANT',
            grantReason: reason.trim()
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      // It either didn't find the user, or the user already has the bundle
      const userExists = await User.exists({ _id: targetUserId });
      if (!userExists) {
        res.status(404);
        throw new Error('User not found');
      } else {
        res.status(409);
        throw new Error('User already owns this bundle');
      }
    }

    // Create Audit Log
    await AuditLog.create({
      admin: req.user._id,
      action: 'MANUAL_GRANT',
      entityType: 'User',
      entityId: targetUserId,
      metadata: {
        bundleId,
        bundleType,
        reason: reason.trim()
      }
    });

    res.json({
      success: true,
      message: 'Bundle granted successfully',
      data: updatedUser.purchasedBundles
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  grantBundle
};
