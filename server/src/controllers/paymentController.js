const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const PromoCode = require('../models/PromoCode');
const PromoUsage = require('../models/PromoUsage');
const CreditTransaction = require('../models/CreditTransaction');
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
            purchasedAt: new Date(),
            source: 'PAYMENT'
          }
        }
      },
      { new: true }
    );
  }
  return user;
};

const finalizeSuccessfulPayment = async (paymentId, userId) => {
  // Idempotent atomic state transition - Lock the payment for processing
  const payment = await Payment.findOneAndUpdate(
    { _id: paymentId, status: 'CREATED' },
    { $set: { status: 'PROCESSING' } },
    { new: true }
  );

  if (!payment) return null; // Already processed or not CREATED

  const originalUser = await User.findById(userId);

  // Tracking variables for compensating rollback
  let promoClaimed = false;
  let promoUsageId = null;
  let globalPromoCountIncremented = false;
  let promoCodeId = null;

  let creditsDeducted = false;
  let deductedCreditsAmount = 0;
  let spendTransactionId = null;

  let bundleGranted = false;

  let rewardGranted = false;
  let rewardTransactionId = null;

  try {
    // 1. Record Promo Usage with atomic DB constraints FIRST
    if (payment.promoCodeApplied) {
      const promo = await PromoCode.findOne({ code: payment.promoCodeApplied });
      if (promo) {
        promoCodeId = promo._id;
        try {
          const usage = await PromoUsage.create({
            promoCode: promo._id,
            user: userId,
            payment: payment._id
          });
          promoClaimed = true;
          promoUsageId = usage._id;
        } catch (err) {
          if (err.code === 11000) {
            await Payment.findByIdAndUpdate(paymentId, { status: 'FAILED_PROMO_LIMIT_EXCEEDED' });
            throw new Error('Promo code has already been used by you.');
          }
          throw err;
        }

        // Check global limit atomically
        let promoUpdateQuery = { _id: promo._id };
        if (promo.maxGlobalUsage) {
           promoUpdateQuery.currentUsageCount = { $lt: promo.maxGlobalUsage };
        }

        const updatedPromo = await PromoCode.findOneAndUpdate(
          promoUpdateQuery,
          { $inc: { currentUsageCount: 1 } },
          { new: true }
        );

        if (!updatedPromo && promo.maxGlobalUsage) {
          await Payment.findByIdAndUpdate(paymentId, { status: 'FAILED_PROMO_LIMIT_EXCEEDED' });
          throw new Error('Promo code global usage limit reached');
        }
        globalPromoCountIncremented = true;
      }
    }

    // 2. Deduct Credits safely using atomic $gte check to prevent concurrent double-spend
    if (payment.creditsUsed > 0) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, credits: { $gte: payment.creditsUsed } },
        { $inc: { credits: -payment.creditsUsed } },
        { new: true }
      );

      if (!updatedUser) {
        await Payment.findByIdAndUpdate(paymentId, { status: 'FAILED_INSUFFICIENT_CREDITS' });
        throw new Error('Insufficient credits');
      }

      creditsDeducted = true;
      deductedCreditsAmount = payment.creditsUsed;

      const spendTx = await CreditTransaction.create({
        user: userId,
        amount: -payment.creditsUsed,
        type: 'SPEND_PURCHASE',
        referenceId: payment._id.toString(),
        balanceBefore: updatedUser.credits + payment.creditsUsed,
        balanceAfter: updatedUser.credits
      });
      spendTransactionId = spendTx._id;
    }

    // 3. Grant Bundle Access
    const preBundleUser = await User.findById(userId);
    const alreadyOwned = preBundleUser.purchasedBundles.some(
      b => b.bundleId === payment.bundleId && b.purchaseStatus === 'active'
    );
    if (!alreadyOwned) {
      await grantEntitlement(userId, payment.bundleId, payment.bundleType);
      bundleGranted = true;
    }

    // 4. Purchase Reward (+20 credits)
    const catalogItem = TRUSTED_CATALOG[payment.bundleId];
    if (catalogItem) {
      const postRewardUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { credits: 20 } },
        { new: true }
      );
      rewardGranted = true;

      const rewardTx = await CreditTransaction.create({
        user: userId,
        amount: 20,
        type: 'EARN_PURCHASE',
        referenceId: payment._id.toString(),
        balanceBefore: postRewardUser.credits - 20,
        balanceAfter: postRewardUser.credits
      });
      rewardTransactionId = rewardTx._id;
    }

    // 5. Mark as final SUCCESS
    await Payment.findByIdAndUpdate(paymentId, { status: 'SUCCESS' });

    return await User.findById(userId);

  } catch (error) {
    // COMPENSATING ROLLBACK IN REVERSE ORDER

    // A. Reverse reward transaction
    if (rewardTransactionId) {
      await CreditTransaction.findByIdAndDelete(rewardTransactionId).catch(console.error);
    }

    // Reverse reward credits
    if (rewardGranted) {
      await User.findByIdAndUpdate(userId, { $inc: { credits: -20 } }).catch(console.error);
    }

    // B. Reverse bundle access
    if (bundleGranted) {
      await User.findByIdAndUpdate(userId, {
        $pull: { purchasedBundles: { bundleId: payment.bundleId, source: 'PAYMENT' } }
      }).catch(console.error);
    }

    // C. Reverse spend transaction
    if (spendTransactionId) {
      await CreditTransaction.findByIdAndDelete(spendTransactionId).catch(console.error);
    }

    // Reverse spent credits
    if (creditsDeducted) {
      await User.findByIdAndUpdate(userId, { $inc: { credits: deductedCreditsAmount } }).catch(console.error);
    }

    // D. Reverse global promo usage
    if (globalPromoCountIncremented && promoCodeId) {
      await PromoCode.findByIdAndUpdate(promoCodeId, { $inc: { currentUsageCount: -1 } }).catch(console.error);
    }

    // E. Release promo usage claim
    if (promoClaimed && promoUsageId) {
      await PromoUsage.findByIdAndDelete(promoUsageId).catch(console.error);
    }

    // Update payment state to FAILED if it was left in PROCESSING
    const currentPayment = await Payment.findById(paymentId);
    if (currentPayment && currentPayment.status === 'PROCESSING') {
      await Payment.findByIdAndUpdate(paymentId, { status: 'FAILED' }).catch(console.error);
    }

    throw error;
  }
};

exports.validatePromo = async (req, res, next) => {
  try {
    const { code, bundleId } = req.query;
    const userId = req.user._id;

    if (!code || !bundleId) {
      return res.status(400).json({ success: false, message: 'Missing code or bundleId' });
    }

    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promo) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive promo code' });
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Promo code expired' });
    }

    if (promo.maxGlobalUsage && promo.currentUsageCount >= promo.maxGlobalUsage) {
      return res.status(400).json({ success: false, message: 'Promo code usage limit reached' });
    }

    const userUsage = await PromoUsage.countDocuments({ promoCode: promo._id, user: userId });
    if (userUsage > 0) {
      return res.status(400).json({ success: false, message: 'This promo code has already been used by you.' });
    }

    if (promo.maxPerUserUsage && userUsage >= promo.maxPerUserUsage) {
      return res.status(400).json({ success: false, message: 'You have reached the usage limit for this promo code' });
    }

    res.json({ success: true, discountAmount: promo.discountValue });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { bundleId, bundleType, promoCode, creditsToUse } = req.body;
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

    const user = await User.findById(userId);
    const alreadyOwned = user.purchasedBundles.some(
      b => b.bundleId === bundleId && b.purchaseStatus === 'active'
    );
    if (alreadyOwned) {
      res.status(400);
      throw new Error('You already own this bundle');
    }

    // Prevent concurrent duplicate checkouts
    const existingPayment = await Payment.findOne({
      user: userId,
      bundleId,
      status: { $in: ['CREATED', 'PROCESSING', 'SUCCESS'] }
    });
    if (existingPayment) {
      res.status(400);
      throw new Error('A payment for this bundle is already processing or successful');
    }

    let originalAmount = catalogItem.amount; // e.g. 4900 (paise)
    let promoDiscountAmount = 0;
    let appliedPromo = null;

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase(), isActive: true });
      if (promo && (!promo.expiresAt || promo.expiresAt >= new Date())) {
        let globalOk = !promo.maxGlobalUsage || promo.currentUsageCount < promo.maxGlobalUsage;
        let userUsage = await PromoUsage.countDocuments({ promoCode: promo._id, user: userId });
        let userOk = userUsage === 0;

        if (globalOk && userOk) {
          promoDiscountAmount = promo.discountValue; 
          appliedPromo = promo.code;
        }
      }
    }

    let discountedSubtotal = Math.max(0, originalAmount - promoDiscountAmount);
    
    let requestedCredits = creditsToUse ? parseInt(creditsToUse, 10) : 0;
    if (isNaN(requestedCredits) || requestedCredits < 0) requestedCredits = 0;

    // catalogItem.amount is in paise. 1 credit = 1 Rupee = 100 paise.
    let creditsValueInCatalogUnit = requestedCredits * 100;
    
    let actualCreditsValue = Math.min(creditsValueInCatalogUnit, discountedSubtotal);
    let actualCreditsUsed = Math.floor(actualCreditsValue / 100);
    
    if (actualCreditsUsed > user.credits) {
       actualCreditsUsed = user.credits;
       actualCreditsValue = actualCreditsUsed * 100;
    }

    let finalPayableAmount = Math.max(0, discountedSubtotal - actualCreditsValue);

    const paymentId = new mongoose.Types.ObjectId();
    let payment;

    if (finalPayableAmount > 0) {
      // PAID CHECKOUT FLOW
      const options = {
        amount: finalPayableAmount,
        currency: catalogItem.currency,
        receipt: `rcpt_${userId}_${paymentId}`
      };

      const razorpay = getRazorpay();
      const order = await razorpay.orders.create(options);

      try {
        payment = await Payment.create({
          _id: paymentId,
          user: userId,
          bundleId,
          bundleType,
          originalAmount,
          promoCodeApplied: appliedPromo,
          promoDiscountAmount,
          creditsUsed: actualCreditsUsed,
          amount: finalPayableAmount,
          currency: catalogItem.currency,
          status: 'CREATED',
          razorpayOrderId: order.id
        });
      } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.user && error.keyPattern.bundleId) {
          res.status(400);
          throw new Error('A payment for this bundle is already processing or successful');
        }
        throw error;
      }

      res.json({
        success: true,
        status: 'REQUIRES_PAYMENT',
        orderId: order.id,
        amount: finalPayableAmount,
        currency: catalogItem.currency
      });

    } else {
      // ZERO-COST CHECKOUT FLOW
      try {
        payment = await Payment.create({
          _id: paymentId,
          user: userId,
          bundleId,
          bundleType,
          originalAmount,
          promoCodeApplied: appliedPromo,
          promoDiscountAmount,
          creditsUsed: actualCreditsUsed,
          amount: 0,
          currency: catalogItem.currency,
          status: 'CREATED'
          // razorpayOrderId is intentionally omitted
        });
      } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.user && error.keyPattern.bundleId) {
          res.status(400);
          throw new Error('A payment for this bundle is already processing or successful');
        }
        throw error;
      }

      await finalizeSuccessfulPayment(paymentId, userId);

      return res.json({
        success: true,
        status: 'SUCCESS_ZERO_COST',
        message: 'Successfully claimed using promo/credits'
      });
    }

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
      const user = await User.findById(userId);
      return res.json({ success: true, message: 'Payment already verified', user });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'FAILED';
      await payment.save();
      res.status(400);
      throw new Error('Invalid payment signature');
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save(); 

    const updatedUser = await finalizeSuccessfulPayment(payment._id, userId);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      user: {
        id: updatedUser._id,
        credits: updatedUser.credits || 0,
        purchasedBundles: updatedUser.purchasedBundles || [],
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.webhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return res.status(500).send('Webhook secret not configured');

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) return res.status(400).send('Missing signature');

    const payload = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');

    if (expectedSignature !== signature) return res.status(400).send('Invalid signature');

    const event = req.body;
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      let razorpayOrderId = event.event === 'payment.captured' 
        ? event.payload.payment.entity.order_id 
        : event.payload.order.entity.id;

      if (razorpayOrderId) {
        const payment = await Payment.findOne({ razorpayOrderId });
        if (payment && payment.status === 'CREATED') {
          await finalizeSuccessfulPayment(payment._id, payment.user);
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
      .select('-razorpaySignature')
      .sort({ createdAt: -1 });

    const enrichedPayments = payments.map(p => {
      const pObj = p.toObject();
      const catalogItem = TRUSTED_CATALOG[p.bundleId];
      if (catalogItem) pObj.bundleTitle = catalogItem.title;
      return pObj;
    });

    res.json({ success: true, payments: enrichedPayments });
  } catch (error) {
    next(error);
  }
};
