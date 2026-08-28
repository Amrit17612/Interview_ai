require('../config/firebase'); // ensure initialization
const { getAuth } = require('firebase-admin/auth');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decodedToken = await getAuth().verifyIdToken(token);
      
      // Attempt to find by firebaseUid or email
      req.user = await User.findOne({
        $or: [
          { firebaseUid: decodedToken.uid },
          { email: decodedToken.email }
        ]
      }).select('-passwordHash');

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found in database'));
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      return next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }
};

const decodeFirebaseToken = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      req.decodedToken = await getAuth().verifyIdToken(token);
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      return next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }
};

module.exports = { protect, decodeFirebaseToken };
