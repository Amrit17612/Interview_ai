const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const TRUSTED_CATALOG = require('../config/catalog');

// Lazy load Razorpay instance to ensure env vars are populated
let razorpayInstance = null;
const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;
  
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_id || !key_secret) {
    throw new Error('Razorpay configuration missing from environment variables');
  }
  
  razorpayInstance = new Razorpay({ key_id, key_secret });
  return razorpayInstance;
};

/**
 * Grant entitlement to user safely
 */
const grantEntitlement = async (userId, bundleId, bundleType) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const alreadyOwned = user.purchasedBundles.some(
    b => b.bundleId === bundleId && b.purchaseStatus === 'active'
  );

  if (!alreadyOwned) {
    return await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          purchasedBundles: {
            bundleId,
            bundleType,
            purchaseStatus: 'active',
            purchasedAt: new Date()
          }
        }
      },
      { new: true }
    );
  }
  return user;
};

exports.createOrder = async (req, res, next) => {
  try {
    const { bundleId, bundleType } = req.body;
    const userId = req.user._id;

    if (!bundleId || !bundleType) {
      res.status(400);
      throw new Error('Bundle ID and Type are required');
    }

    const catalogItem = TRUSTED_CATALOG[bundleId];
    if (!catalogItem || catalogItem.bundleType !== bundleType || !catalogItem.active) {
      res.status(400);
      throw new Error('Invalid or inactive bundle requested');
    }

    // Check if user already owns it
    const user = await User.findById(userId);
    const alreadyOwned = user.purchasedBundles.some(
      b => b.bundleId === bundleId && b.purchaseStatus === 'active'
    );
    if (alreadyOwned) {
      res.status(400);
      throw new Error('You already own this bundle');
    }

    // Create Razorpay Order
    const options = {
      amount: catalogItem.amount,
      currency: catalogItem.currency,
      receipt: `rcpt_${userId}_${Date.now()}`
    };

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create(options);

    // Create Payment record
    const payment = await Payment.create({
      user: userId,
      bundleId,
      bundleType,
      amount: catalogItem.amount,
      currency: catalogItem.currency,
      status: 'CREATED',
      razorpayOrderId: order.id
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: catalogItem.amount,
      currency: catalogItem.currency
    });

  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      throw new Error('Missing payment verification parameters');
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      res.status(404);
      throw new Error('Payment order not found');
    }

    if (payment.user.toString() !== userId.toString()) {
      res.status(403);
      throw new Error('Unauthorized');
    }

    if (payment.status === 'SUCCESS') {
      // Idempotent success
      const user = await User.findById(userId);
      return res.json({ success: true, message: 'Payment already verified', user });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      res.status(500);
      throw new Error('Server configuration error: missing Razorpay secret');
    }
    
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'FAILED';
      await payment.save();
      res.status(400);
      throw new Error('Invalid payment signature');
    }

    // Mark as SUCCESS
    payment.status = 'SUCCESS';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    // Grant entitlement safely
    const updatedUser = await grantEntitlement(userId, payment.bundleId, payment.bundleType);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        onboardingCompleted: updatedUser.onboardingCompleted,
        emailVerified: updatedUser.emailVerified,
        credits: updatedUser.credits || 0,
        purchasedBundles: updatedUser.purchasedBundles || [],
        role: updatedUser.role || 'user',
        onboarding: updatedUser.onboarding
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.webhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).send('Webhook secret not configured');
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).send('Missing signature');
    }

    const payload = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      let razorpayOrderId;
      let razorpayPaymentId;

      if (event.event === 'payment.captured') {
        razorpayOrderId = event.payload.payment.entity.order_id;
        razorpayPaymentId = event.payload.payment.entity.id;
      } else {
        razorpayOrderId = event.payload.order.entity.id;
        // In order.paid, payment ID might be in an array or not strictly present the same way
      }

      if (razorpayOrderId) {
        const payment = await Payment.findOne({ razorpayOrderId });
        if (payment && payment.status !== 'SUCCESS') {
          payment.status = 'SUCCESS';
          if (razorpayPaymentId) payment.razorpayPaymentId = razorpayPaymentId;
          await payment.save();
          await grantEntitlement(payment.user, payment.bundleId, payment.bundleType);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook error');
  }
};

exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .select('-razorpaySignature') // exclude secrets
      .sort({ createdAt: -1 });

    // Map title from catalog for frontend convenience
    const enrichedPayments = payments.map(p => {
      const pObj = p.toObject();
      const catalogItem = TRUSTED_CATALOG[p.bundleId];
      if (catalogItem) {
        pObj.bundleTitle = catalogItem.title;
      }
      return pObj;
    });

    res.json({
      success: true,
      payments: enrichedPayments
    });
  } catch (error) {
    next(error);
  }
};
