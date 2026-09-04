const InterviewTemplate = require('../models/InterviewTemplate');
const InterviewSession = require('../models/InterviewSession');
const Question = require('../models/Question');
const mongoose = require('mongoose');

/**
 * Get templates available to the user
 * @route GET /api/interview-templates
 */
const getAvailableTemplates = async (req, res, next) => {
  try {
    const userPurchasedBundles = req.user.purchasedBundles || [];
    const purchasedBundleIds = userPurchasedBundles.map(b => b.bundleId);

    // Users can see PUBLIC templates, or BUNDLE_ONLY templates if they own the bundle
    const query = {
      status: 'ACTIVE',
      $or: [
        { visibility: 'PUBLIC' },
        { 
          visibility: 'BUNDLE_ONLY', 
          targetBundleId: { $in: purchasedBundleIds } 
        }
      ]
    };

    // If requested, we could also include BUNDLE_ONLY templates they DON'T own,
    // but flagged as "locked" so the UI can upsell them. Let's return them all,
    // and let the frontend check entitlement, but backend enforces it on start.
    // For now, let's just return PUBLIC and all BUNDLE_ONLY.
    const allQuery = {
      status: 'ACTIVE',
      visibility: { $in: ['PUBLIC', 'BUNDLE_ONLY', 'TOKEN_REQUIRED'] }
    };

    const templates = await InterviewTemplate.find(allQuery)
      .sort({ updatedAt: -1 })
      .select('-questions -createdBy -updatedBy') // hide exact question IDs from listing
      .lean();

    // Map entitlement status
    const data = templates.map(t => ({
      ...t,
      isLocked: t.visibility === 'BUNDLE_ONLY' && !purchasedBundleIds.includes(t.targetBundleId)
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * Start an interview template
 * @route POST /api/interview-templates/:id/start
 */
const startTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const template = await InterviewTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (template.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Template is not currently active' });
    }

    if (template.visibility === 'PRIVATE') {
      return res.status(403).json({ success: false, message: 'Template is private' });
    }

    if (template.visibility === 'BUNDLE_ONLY') {
      const userPurchasedBundles = req.user.purchasedBundles || [];
      const hasAccess = userPurchasedBundles.some(b => b.bundleId === template.targetBundleId);
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'You do not have access to this premium template' });
      }
    }

    let batchId = undefined;
    if (template.visibility === 'TOKEN_REQUIRED') {
      const { token } = req.body;
      if (!token || typeof token !== 'string') {
        return res.status(401).json({ success: false, message: 'Access token is required' });
      }
      
      const normalizedToken = token.trim().toUpperCase();
      const AccessToken = require('../models/AccessToken');
      const tokenDoc = await AccessToken.findOne({ code: normalizedToken });
      
      if (!tokenDoc) {
        return res.status(401).json({ success: false, message: 'Invalid access token' });
      }
      if (!tokenDoc.isActive) {
        return res.status(401).json({ success: false, message: 'Access token has been revoked' });
      }
      if (tokenDoc.expiresAt && new Date(tokenDoc.expiresAt) < new Date()) {
        return res.status(401).json({ success: false, message: 'Access token has expired' });
      }
      if (tokenDoc.templateId.toString() !== id) {
        return res.status(401).json({ success: false, message: 'Access token is not valid for this interview' });
      }
      
      batchId = tokenDoc.batchId;

      // Duplicate / Resume Protection
      const existingInProgress = await InterviewSession.findOne({
        user: userId,
        templateId: template._id,
        batchId: batchId,
        status: 'IN_PROGRESS'
      }).lean();

      if (existingInProgress) {
        return res.status(200).json({ success: true, data: { sessionId: existingInProgress._id, resumed: true } });
      }

      const existingCompleted = await InterviewSession.findOne({
        user: userId,
        templateId: template._id,
        batchId: batchId,
        status: 'COMPLETED'
      }).lean();

      if (existingCompleted) {
        return res.status(409).json({ success: false, message: 'You have already completed this interview for this batch.' });
      }
    }

    if (!template.questions || template.questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Template has no questions' });
    }

    // Resolve all question snapshots in exact order
    const questionSnapshots = [];
    for (let i = 0; i < template.questions.length; i++) {
      const qId = template.questions[i];
      const qDoc = await Question.findById(qId).lean();
      
      if (!qDoc) {
        return res.status(400).json({ 
          success: false, 
          message: `Template contains missing references and cannot be started. (Question missing at index ${i})` 
        });
      }

      // We allow DRAFT or ARCHIVED questions if they are in an active template
      questionSnapshots.push({
        index: i,
        questionId: qDoc._id.toString(),
        text: qDoc.text,
        expectedPoints: qDoc.expectedPoints || [],
        status: 'PENDING'
      });
    }

    const session = await InterviewSession.create({
      user: userId,
      configuration: {
        type: template.category || 'GENERAL',
        domain: template.domain || 'General',
        difficulty: template.difficulty || 'INTERMEDIATE',
      },
      status: 'IN_PROGRESS',
      isTemplateDriven: true,
      templateId: template._id,
      batchId: batchId,
      maxQuestions: template.questions.length,
      templateQuestions: questionSnapshots,
      questions: [] // Active questions start empty, frontend triggers first generation
    });

    res.status(201).json({ success: true, data: { sessionId: session._id } });
  } catch (error) {
    next(error);
  }
};


/**
 * Validate an access token
 * @route POST /api/interview-templates/validate-token
 */
const validateToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(401).json({ success: false, message: 'Access token is required' });
    }
    
    const normalizedToken = token.trim().toUpperCase();
    const AccessToken = require('../models/AccessToken');
    const tokenDoc = await AccessToken.findOne({ code: normalizedToken }).populate('templateId', 'title category type questions status difficulty visibility domain').populate('batchId', 'name').lean();
    
    if (!tokenDoc) {
      return res.status(401).json({ success: false, message: 'Invalid access token' });
    }
    if (!tokenDoc.isActive) {
      return res.status(401).json({ success: false, message: 'Access token has been revoked' });
    }
    if (tokenDoc.expiresAt && new Date(tokenDoc.expiresAt) < new Date()) {
      return res.status(401).json({ success: false, message: 'Access token has expired' });
    }
    
    // Attach question count
    if (tokenDoc.templateId) {
      tokenDoc.templateId.questionCount = tokenDoc.templateId.questions ? tokenDoc.templateId.questions.length : 0;
      delete tokenDoc.templateId.questions;
    }
    
    res.json({ success: true, data: { token: tokenDoc.code, template: tokenDoc.templateId, batch: tokenDoc.batchId } });
  } catch (error) {
    next(error);
  }
};

/**
 * Get exclusive templates (already started or completed via batch token)
 * @route GET /api/interview-templates/exclusive
 */
const getExclusiveTemplates = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Find all interview sessions for this user that belong to a batch
    const sessions = await InterviewSession.find({ user: userId, batchId: { $exists: true, $ne: null } })
      .populate('templateId', 'title category type difficulty visibility domain')
      .populate('batchId', 'name')
      .sort({ updatedAt: -1 })
      .lean();
      
    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateToken,
  getExclusiveTemplates,
  getAvailableTemplates,
  startTemplate
};
