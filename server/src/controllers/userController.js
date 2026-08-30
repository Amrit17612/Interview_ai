const mongoose = require('mongoose');
const CreditTransaction = require('../models/CreditTransaction');
const Payment = require('../models/Payment');
const TRUSTED_CATALOG = require('../config/catalog');

const getWalletHistory = async (req, res, next) => {
  try {
    const transactions = await CreditTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const paymentIds = transactions
      .filter(t => (t.type === 'EARN_PURCHASE' || t.type === 'SPEND_PURCHASE') && t.referenceId)
      .map(t => t.referenceId)
      .filter(id => mongoose.Types.ObjectId.isValid(id));

    let paymentMap = {};
    if (paymentIds.length > 0) {
      const payments = await Payment.find({ _id: { $in: paymentIds } }).lean();
      payments.forEach(p => {
        let bundleTitle = 'Unknown Bundle';
        const cat = TRUSTED_CATALOG[p.bundleId];
        if (cat) {
          bundleTitle = cat.title || cat.name;
        }
        paymentMap[p._id.toString()] = {
          bundleTitle: bundleTitle
        };
      });
    }

    const history = transactions.map(t => {
      let enriched = {
        _id: t._id,
        amount: t.amount,
        type: t.type,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        createdAt: t.createdAt,
      };

      if ((t.type === 'EARN_PURCHASE' || t.type === 'SPEND_PURCHASE') && t.referenceId && paymentMap[t.referenceId]) {
        enriched.relatedBundle = paymentMap[t.referenceId].bundleTitle;
      }

      return enriched;
    });

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWalletHistory
};
