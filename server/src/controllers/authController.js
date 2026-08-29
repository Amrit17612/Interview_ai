require('../config/firebase'); // ensure initialization
const { getAuth } = require('firebase-admin/auth');
const User = require('../models/User');

const registerUser = async (req, res, next) => {
  try {
    console.log('[Register Debug] req.body keys:', Object.keys(req.body || {}));
    console.log('[Register Debug] firebaseToken present:', !!req.body?.firebaseToken);
    console.log('[Register Debug] content-type:', req.headers['content-type']);
    
    const { firstName, lastName, firebaseToken } = req.body;
    
    if (!firebaseToken) {
      res.status(401);
      throw new Error('Not authorized, missing Firebase token in request body');
    }

    const decodedToken = await getAuth().verifyIdToken(firebaseToken);
    const { email, uid, email_verified } = decodedToken;

    if (!firstName || !lastName || !email) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Idempotent upsert: if the user exists (e.g. from a retry), update it, otherwise create it.
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email: normalizedEmail }] });
    
    if (!user) {
      user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        firebaseUid: uid,
        onboardingCompleted: false,
        emailVerified: email_verified || false
      });
    } else {
      // Update firebaseUid if it was created via legacy auth
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
      }
      user.emailVerified = email_verified || user.emailVerified;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'User synced successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    console.log('[LOGIN API] headers content-type:', req.headers['content-type']);
    console.log('[LOGIN API] req.headers x-debug-request-id:', req.headers['x-debug-request-id']);
    console.log('[LOGIN API] body keys:', Object.keys(req.body || {}));
    console.log('[LOGIN API] firebaseToken present:', typeof req.body?.firebaseToken === 'string');

    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      res.status(401);
      throw new Error('Not authorized, missing Firebase token in request body');
    }

    const decodedToken = await getAuth().verifyIdToken(firebaseToken);
    const { email, uid, email_verified } = decodedToken;
    const normalizedEmail = email.toLowerCase().trim();
    
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email: normalizedEmail }] });

    if (!user) {
      res.status(401);
      throw new Error('User not found in database');
    }

    // Update firebaseUid if logging in for the first time via Firebase after legacy
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
    }
    // Update verification status from Firebase
    user.emailVerified = email_verified || user.emailVerified;
    await user.save();

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by the authMiddleware protect
    res.json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        onboardingCompleted: req.user.onboardingCompleted,
        emailVerified: req.user.emailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

const completeOnboarding = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.onboardingCompleted = true;
    await user.save();

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  completeOnboarding
};
