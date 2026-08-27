const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user to request, excluding passwordHash
    req.user = await User.findById(decoded.userId).select('-passwordHash');
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized, user not found'));
    }
    next();
  } catch {
    res.status(401);
    return next(new Error('Not authorized, token failed'));
  }
};

module.exports = { protect };
