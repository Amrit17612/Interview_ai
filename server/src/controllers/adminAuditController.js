const AuditLog = require('../models/AuditLog');

/**
 * Get paginated audit logs
 * @route GET /api/admin/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.action) {
      query.action = req.query.action;
    }
    if (req.query.entityType) {
      query.entityType = req.query.entityType;
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('admin', 'firstName lastName email')
      .lean();

    res.json({
      success: true,
      data: logs,
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

module.exports = {
  getAuditLogs
};
