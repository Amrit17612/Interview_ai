const InterviewTemplate = require('../models/InterviewTemplate');
const Question = require('../models/Question');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

/**
 * Get paginated templates
 * @route GET /api/admin/interview-templates
 */
const getTemplates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      // Basic search on title
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.status) query.status = req.query.status;
    if (req.query.visibility) query.visibility = req.query.visibility;
    if (req.query.category) query.category = req.query.category;

    const total = await InterviewTemplate.countDocuments(query);
    const templates = await InterviewTemplate.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .lean();

    // Attach question count
    templates.forEach(t => {
      t.questionCount = t.questions ? t.questions.length : 0;
    });

    res.json({
      success: true,
      data: templates,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get template detail
 * @route GET /api/admin/interview-templates/:id
 */
const getTemplateById = async (req, res, next) => {
  try {
    const template = await InterviewTemplate.findById(req.params.id)
      .populate('questions', 'text type difficulty status')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .lean();

    if (!template) {
      res.status(404);
      throw new Error('Interview template not found');
    }

    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new template
 * @route POST /api/admin/interview-templates
 */
const createTemplate = async (req, res, next) => {
  try {
    const { questions, visibility, targetBundleId } = req.body;

    if (visibility === 'BUNDLE_ONLY' && !targetBundleId) {
      res.status(400);
      throw new Error('targetBundleId is required when visibility is BUNDLE_ONLY');
    }

    // Check for duplicates in questions
    if (questions && Array.isArray(questions)) {
      const uniqueIds = new Set(questions);
      if (uniqueIds.size !== questions.length) {
        res.status(400);
        throw new Error('Duplicate questions are not allowed in a template');
      }
    }

    const templateData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const template = await InterviewTemplate.create(templateData);

    await AuditLog.create({
      admin: req.user._id,
      action: 'CREATE_TEMPLATE',
      entityType: 'InterviewTemplate',
      entityId: template._id,
      metadata: { title: template.title.substring(0, 50) }
    });

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a template
 * @route PUT /api/admin/interview-templates/:id
 */
const updateTemplate = async (req, res, next) => {
  try {
    const { questions, visibility, targetBundleId } = req.body;

    if (visibility === 'BUNDLE_ONLY' && !targetBundleId) {
      res.status(400);
      throw new Error('targetBundleId is required when visibility is BUNDLE_ONLY');
    }

    // Check for duplicates
    if (questions && Array.isArray(questions)) {
      const uniqueIds = new Set(questions);
      if (uniqueIds.size !== questions.length) {
        res.status(400);
        throw new Error('Duplicate questions are not allowed in a template');
      }
    }

    const template = await InterviewTemplate.findById(req.params.id);
    if (!template) {
      res.status(404);
      throw new Error('Interview template not found');
    }

    const updatableFields = [
      'title', 'description', 'thumbnail', 'category', 'domain',
      'difficulty', 'visibility', 'targetBundleId', 'questions',
      'estimatedDuration', 'tags', 'status'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        template[field] = req.body[field];
      }
    });
    
    template.updatedBy = req.user._id;

    await template.save();

    await AuditLog.create({
      admin: req.user._id,
      action: 'UPDATE_TEMPLATE',
      entityType: 'InterviewTemplate',
      entityId: template._id,
      metadata: { title: template.title.substring(0, 50) }
    });

    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

/**
 * Update template status (e.g. DRAFT -> ACTIVE -> ARCHIVED)
 * @route PATCH /api/admin/interview-templates/:id/status
 */
const updateTemplateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }

    const template = await InterviewTemplate.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!template) {
      res.status(404);
      throw new Error('Interview template not found');
    }

    await AuditLog.create({
      admin: req.user._id,
      action: status === 'ARCHIVED' ? 'ARCHIVE_TEMPLATE' : (status === 'ACTIVE' ? 'PUBLISH_TEMPLATE' : 'UPDATE_TEMPLATE_STATUS'),
      entityType: 'InterviewTemplate',
      entityId: template._id,
      metadata: { status }
    });

    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a template
 * @route DELETE /api/admin/interview-templates/:id
 */
const deleteTemplate = async (req, res, next) => {
  try {
    const template = await InterviewTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      res.status(404);
      throw new Error('Interview template not found');
    }

    await AuditLog.create({
      admin: req.user._id,
      action: 'DELETE_TEMPLATE',
      entityType: 'InterviewTemplate',
      entityId: template._id,
      metadata: { title: template.title.substring(0, 50) }
    });

    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  updateTemplateStatus,
  deleteTemplate
};
