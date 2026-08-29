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
        emailVerified: user.emailVerified,
        credits: user.credits || 0,
        purchasedBundles: user.purchasedBundles || [],
        role: user.role || 'user',
        onboarding: user.onboarding
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    console.log('[LOGIN API] request URL:', req.originalUrl);
    console.log('[LOGIN API] request method:', req.method);
    console.log('[LOGIN API] x-app-build-id:', req.headers['x-app-build-id']);
    console.log('[LOGIN API] x-auth-flow-version:', req.headers['x-auth-flow-version']);
    console.log('[LOGIN API] origin:', req.headers['origin']);
    console.log('[LOGIN API] user-agent:', req.headers['user-agent']);
    console.log('[LOGIN API] body keys:', Object.keys(req.body || {}));
    console.log('[LOGIN API] firebaseToken present:', typeof req.body?.firebaseToken === 'string');

    const { firebaseToken, email, password } = req.body;

    if (!firebaseToken && (email || password)) {
      res.status(400);
      throw new Error('Legacy auth client detected. This frontend is running an outdated build.');
    }

    if (!firebaseToken) {
      res.status(401);
      throw new Error('Not authorized, missing Firebase token in request body');
    }

    const decodedToken = await getAuth().verifyIdToken(firebaseToken);
    const { email: decodedEmail, uid, email_verified } = decodedToken;
    const normalizedEmail = decodedEmail.toLowerCase().trim();
    
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
        emailVerified: user.emailVerified,
        credits: user.credits || 0,
        purchasedBundles: user.purchasedBundles || [],
        role: user.role || 'user',
        onboarding: user.onboarding
      }
    });
  } catch (error) {
    next(error);
  }
};

const googleAuthUser = async (req, res, next) => {
  try {
    console.log('[LOGIN API] request URL:', req.originalUrl);
    console.log('[LOGIN API] request method:', req.method);
    console.log('[LOGIN API] x-app-build-id:', req.headers['x-app-build-id']);
    console.log('[LOGIN API] x-auth-flow-version:', req.headers['x-auth-flow-version']);
    console.log('[LOGIN API] origin:', req.headers['origin']);
    console.log('[LOGIN API] user-agent:', req.headers['user-agent']);
    console.log('[LOGIN API] body keys:', Object.keys(req.body || {}));
    console.log('[LOGIN API] firebaseToken present:', typeof req.body?.firebaseToken === 'string');

    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      res.status(401);
      throw new Error('Not authorized, missing Firebase token in request body');
    }

    const decodedToken = await getAuth().verifyIdToken(firebaseToken);
    const { email, uid, email_verified, name } = decodedToken;
    const normalizedEmail = email.toLowerCase().trim();
    
    let isNewUser = false;
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email: normalizedEmail }] });

    if (!user) {
      isNewUser = true;
      const nameParts = name ? name.split(' ') : ['Google', 'User'];
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      user = await User.create({
        firstName,
        lastName,
        email: normalizedEmail,
        firebaseUid: uid,
        onboardingCompleted: false,
        emailVerified: email_verified || true
      });
    } else {
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
      }
      user.emailVerified = email_verified || user.emailVerified;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Google auth successful',
      isNewUser,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        emailVerified: user.emailVerified,
        credits: user.credits || 0,
        purchasedBundles: user.purchasedBundles || [],
        role: user.role || 'user',
        onboarding: user.onboarding
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
        emailVerified: req.user.emailVerified,
        credits: req.user.credits || 0,
        purchasedBundles: req.user.purchasedBundles || [],
        role: req.user.role || 'user',
        onboarding: req.user.onboarding
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

    const {
      currentRole,
      experienceLevel,
      interviewGoals,
      difficulty,
      primaryTechnology,
      targetCompanyType
    } = req.body;

    if (!currentRole || !experienceLevel || !interviewGoals || !interviewGoals.length || !difficulty || !primaryTechnology || !targetCompanyType) {
      res.status(400);
      throw new Error('Please provide all required onboarding fields');
    }

    user.onboardingCompleted = true;
    user.onboarding = {
      currentRole,
      experienceLevel,
      interviewGoals,
      difficulty,
      primaryTechnology,
      targetCompanyType,
      completedAt: new Date()
    };
    
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
        emailVerified: user.emailVerified,
        credits: user.credits || 0,
        purchasedBundles: user.purchasedBundles || [],
        role: user.role || 'user',
        onboarding: user.onboarding
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuthUser,
  getMe,
  logoutUser,
  completeOnboarding
};
