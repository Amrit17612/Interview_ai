const PromoCode = require('../models/PromoCode');

exports.getPromos = async (req, res, next) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json({ success: true, promos });
  } catch (error) {
    next(error);
  }
};

exports.createPromo = async (req, res, next) => {
  try {
    const { code, discountValue, maxGlobalUsage, maxPerUserUsage, expiresAt } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code and discountValue are required' });
    }

    const existing = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Promo code already exists' });
    }

    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discountValue,
      maxGlobalUsage: maxGlobalUsage || null,
      maxPerUserUsage: maxPerUserUsage || null,
      expiresAt: expiresAt || null
    });

    res.status(201).json({ success: true, promo });
  } catch (error) {
    next(error);
  }
};

exports.updatePromoStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const promo = await PromoCode.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }

    res.json({ success: true, promo });
  } catch (error) {
    next(error);
  }
};
