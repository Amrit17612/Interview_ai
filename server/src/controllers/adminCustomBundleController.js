const CustomBundlePrice = require('../models/CustomBundlePrice');

exports.syncCustomBundlePrice = async (req, res) => {
  try {
    const { 
      bundleId, price, active, 
      type, name, description, category, 
      originalPrice, features, iconType, visibility, modules, logo 
    } = req.body;

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

    // Collect metadata fields if provided
    const updateData = { price, active: isActive };
    if (type !== undefined) updateData.type = type;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
    if (features !== undefined) updateData.features = features;
    if (iconType !== undefined) updateData.iconType = iconType;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (modules !== undefined) updateData.modules = modules;
    if (logo !== undefined) updateData.logo = logo;

    // Upsert the custom bundle price + metadata
    await CustomBundlePrice.findOneAndUpdate(
      { bundleId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: 'Custom bundle price synchronized successfully' });
  } catch (error) {
    console.error('Error in syncCustomBundlePrice:', error);
    res.status(500).json({ success: false, message: 'Failed to synchronize custom bundle price', error: error.message });
  }
};
