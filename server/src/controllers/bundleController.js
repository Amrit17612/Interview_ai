const CustomBundlePrice = require('../models/CustomBundlePrice');

exports.getCustomBundles = async (req, res) => {
  try {
    const customBundles = await CustomBundlePrice.find({
      active: true,
      visibility: 'PUBLIC'
    }).select('-createdAt -updatedAt -__v').lean();

    res.status(200).json({ success: true, count: customBundles.length, customBundles });
  } catch (error) {
    console.error('Error fetching custom bundles:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch custom bundles' });
  }
};
