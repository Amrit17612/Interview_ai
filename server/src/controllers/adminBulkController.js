const Question = require('../models/Question');
const AuditLog = require('../models/AuditLog');

/**
 * Bulk update question status
 * @route POST /api/admin/questions/bulk/status
 */
const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { questionIds, filters, status } = req.body;

    if (!['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let query = {};
    if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
      query._id = { $in: questionIds };
    } else if (filters) {
      if (filters.search) query.text = { $regex: filters.search, $options: 'i' };
      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      if (filters.difficulty) query.difficulty = filters.difficulty;
    } else {
      return res.status(400).json({ success: false, message: 'No questions or filters provided' });
    }

    const result = await Question.updateMany(
      query,
      { $set: { status, updatedBy: req.user._id } }
    );

    await AuditLog.create({
      admin: req.user._id,
      action: 'BULK_UPDATE_QUESTION_STATUS',
      entityType: 'Question',
      entityId: 'BULK',
      metadata: { count: result.modifiedCount, status, filters }
    });

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} questions to ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk add tags to questions
 * @route POST /api/admin/questions/bulk/tags
 */
const bulkAddTags = async (req, res, next) => {
  try {
    const { questionIds, tags } = req.body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No questions provided' });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ success: false, message: 'No tags provided' });
    }

    // Use $addToSet to avoid duplicate tags within the array
    const result = await Question.updateMany(
      { _id: { $in: questionIds } },
      { 
        $addToSet: { tags: { $each: tags } },
        $set: { updatedBy: req.user._id }
      }
    );

    await AuditLog.create({
      admin: req.user._id,
      action: 'BULK_ADD_TAGS',
      entityType: 'Question',
      entityId: 'BULK',
      metadata: { count: result.modifiedCount, tags }
    });

    res.json({
      success: true,
      message: `Successfully added tags to ${result.modifiedCount} questions.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bulkUpdateStatus,
  bulkAddTags
};
