const User = require('../models/User');

/**
 * Middleware to require specific roles.
 * Must be placed AFTER authMiddleware (protect) so req.user exists.
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'super_admin')
 */
const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('Not authorized, no user context');
      }

      // Fetch the latest user from DB to ensure role hasn't been revoked
      const user = await User.findById(req.user._id);
      
      if (!user) {
        res.status(401);
        throw new Error('User not found');
      }

      const userRole = user.role || 'user';

      if (!roles.includes(userRole)) {
        res.status(403);
        throw new Error('Forbidden: You do not have permission to perform this action');
      }

      // Attach the latest role to req.user just in case it was missing
      req.user.role = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Shorthand for requiring 'admin' role.
 */
const requireAdmin = requireRole('admin');

module.exports = {
  requireRole,
  requireAdmin
};
