const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const generateTokenAndSetCookie = require('../utils/generateToken');
const emailService = require('../services/emailService');

const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      onboardingCompleted: false,
      emailVerified: false
    });

    if (user) {
      // Generate secure verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
      
      // Expire in 24 hours
      user.emailVerificationTokenHash = verificationTokenHash;
      user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      // Attempt to send email
      let emailWarning = null;
      try {
        await emailService.sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        console.error('[AUTH] Email verification sending failed:', emailError.message);
        emailWarning = 'Account created successfully, but the verification email failed to send. You may need to request a new verification link later.';
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        warning: emailWarning,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          onboardingCompleted: user.onboardingCompleted,
          emailVerified: user.emailVerified
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      if (!user.emailVerified) {
        res.status(403);
        throw new Error('Please verify your email address before logging in');
      }

      generateTokenAndSetCookie(res, user._id);
      
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
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by the authMiddleware
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
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: new Date(0), // Expire the cookie immediately
      path: '/'
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body; // or req.query depending on route, assuming POST for state mutation
    if (!token) {
      res.status(400);
      throw new Error('Invalid verification request');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Please provide an email address');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Do not reveal whether account exists
      return res.json({
        success: true,
        message: 'If the account exists and is unverified, a new verification link has been sent.'
      });
    }

    if (user.emailVerified) {
      return res.json({
        success: true,
        message: 'If the account exists and is unverified, a new verification link has been sent.'
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    
    user.emailVerificationTokenHash = verificationTokenHash;
    user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await emailService.sendVerificationEmail(user.email, verificationToken);

    res.json({
      success: true,
      message: 'If the account exists and is unverified, a new verification link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Please provide an email address');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Do not reveal that the email does not exist
      return res.json({
        success: true,
        message: 'If the email is registered, a password reset link has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: 'If the email is registered, a password reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    
    // Invalidate reset token fields
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in.'
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
  logoutUser,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  completeOnboarding
};
