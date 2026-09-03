const Batch = require('../models/Batch');
const AccessToken = require('../models/AccessToken');
const InterviewTemplate = require('../models/InterviewTemplate');
const crypto = require('crypto');
const mongoose = require('mongoose');

const getBatches = async (req, res, next) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: batches });
  } catch (error) {
    next(error);
  }
};

const createBatch = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Batch name is required' });
    }
    const batch = await Batch.create({ 
      name: name.trim(), 
      description: description ? description.trim() : '' 
    });
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

const getBatchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid batch ID' });
    }
    const batch = await Batch.findById(id).lean();
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    
    // Fetch tokens for this batch, populating the template info
    const tokens = await AccessToken.find({ batchId: id })
      .populate('templateId', 'title difficulty status visibility category domain')
      .sort({ createdAt: -1 })
      .lean();
      
    res.json({ success: true, data: { ...batch, tokens } });
  } catch (error) {
    next(error);
  }
};

const updateBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid batch ID' });
    }
    
    const updateData = {};
    if (name && name.trim() !== '') updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    
    const batch = await Batch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    
    res.json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

const generateAccessToken = async (req, res, next) => {
  try {
    const { id: batchId } = req.params;
    const { templateId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(batchId) || !mongoose.Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({ success: false, message: 'Invalid batch or template ID' });
    }
    
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    
    const template = await InterviewTemplate.findById(templateId);
    if (!template) return res.status(404).json({ success: false, message: 'Interview template not found' });
    
    if (template.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Cannot assign an inactive template' });
    }
    
    // Check if an active token already exists for this batch+template
    const existingActive = await AccessToken.findOne({ batchId, templateId, isActive: true });
    if (existingActive) {
      return res.status(400).json({ success: false, message: 'An active access token already exists for this Batch and Interview combination' });
    }
    
    // Generate secure token
    let code;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char hex
      const exists = await AccessToken.findOne({ code });
      if (!exists) isUnique = true;
      attempts++;
    }
    
    if (!isUnique) {
      return res.status(500).json({ success: false, message: 'Failed to generate unique token' });
    }
    
    const token = await AccessToken.create({
      code,
      batchId,
      templateId
    });
    
    // Auto-set visibility to TOKEN_REQUIRED if not already
    if (template.visibility !== 'TOKEN_REQUIRED') {
      template.visibility = 'TOKEN_REQUIRED';
      await template.save();
    }
    
    // Return populated token for immediate UI update
    const populatedToken = await AccessToken.findById(token._id).populate('templateId', 'title difficulty status visibility category domain').lean();
    
    res.status(201).json({ success: true, data: populatedToken });
  } catch (error) {
    next(error);
  }
};

const updateAccessTokenStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid token ID' });
    }
    
    const token = await AccessToken.findByIdAndUpdate(id, { isActive: !!isActive }, { new: true }).lean();
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }
    
    res.json({ success: true, data: token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatches,
  createBatch,
  getBatchById,
  updateBatch,
  generateAccessToken,
  updateAccessTokenStatus
};
