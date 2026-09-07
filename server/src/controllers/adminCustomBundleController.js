const CustomBundlePrice = require('../models/CustomBundlePrice');

exports.syncCustomBundlePrice = async (req, res) => {
  try {
    const { bundleId, price, active } = req.body;

    if (!bundleId || typeof bundleId !== 'string' || !bundleId.startsWith('custom_')) {
      return res.status(400).json({ success: false, message: 'Valid custom bundleId is required' });
    }

    if (price === undefined || typeof price !== 'number' || price < 0 || !isFinite(price)) {
      return res.status(400).json({ success: false, message: 'Valid non-negative price is required' });
    }

    if (active !== undefined && typeof active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Active status must be a boolean' });
    }

    const isActive = active !== undefined ? active : true;

    // Upsert the custom bundle price
    await CustomBundlePrice.findOneAndUpdate(
      { bundleId },
      { $set: { price, active: isActive } },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: 'Custom bundle price synchronized successfully' });
  } catch (error) {
    console.error('Error in syncCustomBundlePrice:', error);
    res.status(500).json({ success: false, message: 'Failed to synchronize custom bundle price', error: error.message });
  }
};
