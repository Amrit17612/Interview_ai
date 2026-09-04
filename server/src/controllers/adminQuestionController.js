const Question = require('../models/Question');
const AuditLog = require('../models/AuditLog');

/**
 * Get paginated questions
 * @route GET /api/admin/questions
 */
const getQuestions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.text = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    if (req.query.difficulty) query.difficulty = req.query.difficulty;

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .lean();

    res.json({
      success: true,
      data: questions,
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
 * Get question detail
 * @route GET /api/admin/questions/:id
 */
const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('followUps.weak', 'text type difficulty status')
      .populate('followUps.neutral', 'text type difficulty status')
      .populate('followUps.strong', 'text type difficulty status')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .lean();

    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new question
 * @route POST /api/admin/questions
 */
const createQuestion = async (req, res, next) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const question = await Question.create(questionData);

    await AuditLog.create({
      admin: req.user._id,
      action: 'CREATE_QUESTION',
      entityType: 'Question',
      entityId: question._id,
      metadata: { text: question.text.substring(0, 50) }
    });

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a question
 * @route PUT /api/admin/questions/:id
 */
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    // Update fields explicitly
    const updatableFields = ['text', 'description', 'type', 'category', 'difficulty', 'companies', 'domains', 'roles', 'skills', 'expectedPoints', 'tags', 'followUps'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    });
    question.updatedBy = req.user._id;

    // Save will trigger the cycle detection pre-hook
    await question.save();

    await AuditLog.create({
      admin: req.user._id,
      action: 'UPDATE_QUESTION',
      entityType: 'Question',
      entityId: question._id
    });

    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

/**
 * Update question status (e.g. DRAFT -> ACTIVE -> ARCHIVED)
 * @route PATCH /api/admin/questions/:id/status
 */
const updateQuestionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    await AuditLog.create({
      admin: req.user._id,
      action: status === 'ARCHIVED' ? 'ARCHIVE_QUESTION' : (status === 'ACTIVE' ? 'ACTIVATE_QUESTION' : 'UPDATE_QUESTION_STATUS'),
      entityType: 'Question',
      entityId: question._id,
      metadata: { status }
    });

    res.json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a question (Hard Delete, preferred fallback from Archive)
 * @route DELETE /api/admin/questions/:id
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const questionId = req.params.id;

    // 1. Check if referenced by other questions as a follow-up
    const referencingQuestions = await Question.countDocuments({ followUps: questionId });
    if (referencingQuestions > 0) {
      res.status(400);
      throw new Error(`Cannot delete: This question is used as a follow-up in ${referencingQuestions} other question(s). Please archive it instead.`);
    }

    // 2. Check if referenced by any InterviewTemplate
    const InterviewTemplate = require('../models/InterviewTemplate');
    const referencingTemplates = await InterviewTemplate.countDocuments({ questions: questionId });
    if (referencingTemplates > 0) {
      res.status(400);
      throw new Error(`Cannot delete: This question is used in ${referencingTemplates} interview template(s). Please archive it instead.`);
    }

    const question = await Question.findByIdAndDelete(questionId);
    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    // Cleanup: Just in case, ensure it's stripped from any followUps arrays globally.
    await Question.updateMany(
      { followUps: questionId },
      { $pull: { followUps: questionId } }
    );

    await AuditLog.create({
      admin: req.user._id,
      action: 'DELETE_QUESTION',
      entityType: 'Question',
      entityId: questionId,
      metadata: { text: question.text.substring(0, 50) }
    });

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  updateQuestionStatus,
  deleteQuestion
};
