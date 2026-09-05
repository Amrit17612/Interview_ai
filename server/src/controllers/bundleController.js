const Bundle = require('../models/Bundle');
const InterviewTemplate = require('../models/InterviewTemplate');

/**
 * Get all public/active bundles (Student UI)
 * @route GET /api/bundles
 */
const getPublicBundles = async (req, res, next) => {
  try {
    const bundles = await Bundle.find({ active: true, visibility: 'PUBLIC' })
      .populate('modules')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: bundles });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ALL bundles (Admin UI)
 * @route GET /api/admin/bundles
 */
const getAllBundles = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type) query.type = type;

    const bundles = await Bundle.find(query)
      .populate('modules')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: bundles });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single bundle by ID (bundleId or _id)
 * @route GET /api/bundles/:id
 */
const getBundleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === 'admin';

    // Allow lookup by Mongoose _id OR custom bundleId string
    const query = { $or: [{ bundleId: id }] };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or.push({ _id: id });
    }

    const bundle = await Bundle.findOne(query).populate('modules').lean();

    if (!bundle) {
      return res.status(404).json({ success: false, message: 'Bundle not found' });
    }

    if (!isAdmin && (!bundle.active || bundle.visibility === 'PRIVATE')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: bundle });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new bundle (Admin)
 * @route POST /api/admin/bundles
 */
const createBundle = async (req, res, next) => {
  try {
    const { type, name, description, category, price, originalPrice, iconType, features, visibility, active, bundleId } = req.body;

    if (!type || !name) {
      return res.status(400).json({ success: false, message: 'Type and name are required' });
    }

    const validCompanyCategories = ['FAANG', 'FAANG_PLUS', 'PRODUCT_BASED', 'SERVICE_BASED', 'FINTECH', 'BANKING', 'E_COMMERCE', 'IT_SERVICES', 'CONSULTING', 'STARTUP', 'SAAS', 'CLOUD_INFRASTRUCTURE', 'AI_ML_COMPANIES', 'DATA_ANALYTICS', 'CYBERSECURITY', 'OTHER'];
    const validDomainCategories = ['SOFTWARE_ENGINEERING', 'DSA', 'WEB_DEVELOPMENT', 'BACKEND_DEVELOPMENT', 'FRONTEND_DEVELOPMENT', 'FULL_STACK', 'MOBILE_DEVELOPMENT', 'AI_ML', 'DATA_SCIENCE', 'DATA_ANALYTICS', 'CLOUD_COMPUTING', 'DEVOPS', 'CYBERSECURITY', 'SYSTEM_DESIGN', 'DATABASE', 'PROGRAMMING_LANGUAGES', 'TESTING_QA', 'PRODUCT_MANAGEMENT', 'OTHER'];

    if (category) {
      if (type === 'COMPANY' && !validCompanyCategories.includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid company category' });
      }
      if (type === 'DOMAIN' && !validDomainCategories.includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid domain category' });
      }
    }

    
    // Auto-generate a bundleId if not provided (for backward compat with string IDs)
    const newBundleId = bundleId || `${type.toLowerCase().substring(0,3)}_${Date.now()}`;
    
    // Prevent duplicate bundleId
    const existing = await Bundle.findOne({ bundleId: newBundleId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A bundle with this ID already exists.' });
    }

    const bundle = await Bundle.create({
      bundleId: newBundleId,
      type,
      name,
      description,
      category,
      price: price || 0,
      originalPrice,
      iconType,
      features,
      visibility,
      active,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: bundle });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a bundle (Admin)
 * @route PUT /api/admin/bundles/:id
 */
const updateBundle = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Do NOT allow changing bundleId if it breaks purchases, so we omit it from updates
    const { name, description, category, price, originalPrice, iconType, features, visibility, active } = req.body;

    const existingBundle = await Bundle.findById(id);
    if (!existingBundle) {
      return res.status(404).json({ success: false, message: 'Bundle not found' });
    }

    const validCompanyCategories = ['FAANG', 'FAANG_PLUS', 'PRODUCT_BASED', 'SERVICE_BASED', 'FINTECH', 'BANKING', 'E_COMMERCE', 'IT_SERVICES', 'CONSULTING', 'STARTUP', 'SAAS', 'CLOUD_INFRASTRUCTURE', 'AI_ML_COMPANIES', 'DATA_ANALYTICS', 'CYBERSECURITY', 'OTHER'];
    const validDomainCategories = ['SOFTWARE_ENGINEERING', 'DSA', 'WEB_DEVELOPMENT', 'BACKEND_DEVELOPMENT', 'FRONTEND_DEVELOPMENT', 'FULL_STACK', 'MOBILE_DEVELOPMENT', 'AI_ML', 'DATA_SCIENCE', 'DATA_ANALYTICS', 'CLOUD_COMPUTING', 'DEVOPS', 'CYBERSECURITY', 'SYSTEM_DESIGN', 'DATABASE', 'PROGRAMMING_LANGUAGES', 'TESTING_QA', 'PRODUCT_MANAGEMENT', 'OTHER'];

    if (category) {
      if (existingBundle.type === 'COMPANY' && !validCompanyCategories.includes(category)) {
        // Allow legacy categories if they haven't changed, but block invalid new ones
        if (existingBundle.category !== category) {
          return res.status(400).json({ success: false, message: 'Invalid company category' });
        }
      }
      if (existingBundle.type === 'DOMAIN' && !validDomainCategories.includes(category)) {
        if (existingBundle.category !== category) {
          return res.status(400).json({ success: false, message: 'Invalid domain category' });
        }
      }
    }

    const bundle = await Bundle.findByIdAndUpdate(
      id,
      { 
        name, description, category, price, originalPrice, 
        iconType, features, visibility, active,
        updatedBy: req.user._id 
      },
      { new: true, runValidators: true }
    ).populate('modules');

    if (!bundle) {
      return res.status(404).json({ success: false, message: 'Bundle not found' });
    }

    res.json({ success: true, data: bundle });
  } catch (error) {
    next(error);
  }
};

/**
 * Set bundle modules directly (Admin)
 * @route PUT /api/admin/bundles/:id/modules
 */
const setBundleModules = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { moduleIds } = req.body; // Array of InterviewTemplate IDs

    if (!Array.isArray(moduleIds)) {
      return res.status(400).json({ success: false, message: 'moduleIds must be an array' });
    }

    // Verify all templates exist
    const templates = await InterviewTemplate.find({ _id: { $in: moduleIds } });
    if (templates.length !== moduleIds.length) {
      return res.status(400).json({ success: false, message: 'One or more modules do not exist.' });
    }

    const bundle = await Bundle.findByIdAndUpdate(
      id,
      { modules: moduleIds, updatedBy: req.user._id },
      { new: true }
    ).populate('modules');

    if (!bundle) {
      return res.status(404).json({ success: false, message: 'Bundle not found' });
    }

    res.json({ success: true, data: bundle });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicBundles,
  getAllBundles,
  getBundleById,
  createBundle,
  updateBundle,
  setBundleModules
};
