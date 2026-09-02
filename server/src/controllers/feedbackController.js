const Feedback = require('../models/Feedback');
const InterviewSession = require('../models/InterviewSession');

/**
 * @desc    Submit feedback for a completed interview
 * @route   POST /api/feedback
 * @access  Private
 */
const submitFeedback = async (req, res) => {
  try {
    const { sessionId, overallExperience, questionQuality, skillTesting, additionalSuggestions } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Interview session ID is required' });
    }

    // Ensure session exists and belongs to user
    const session = await InterviewSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (session.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted after completing the interview' });
    }

    // Validate ratings
    const ratings = [overallExperience, questionQuality, skillTesting];
    if (ratings.some(r => typeof r !== 'number' || r < 1 || r > 5 || !Number.isInteger(r))) {
      return res.status(400).json({ success: false, message: 'All ratings must be integers between 1 and 5' });
    }

    // Check for duplicate feedback
    const existingFeedback = await Feedback.findOne({ user: userId, session: sessionId });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: 'Feedback has already been submitted for this interview' });
    }

    const feedback = await Feedback.create({
      user: userId,
      session: sessionId,
      overallExperience,
      questionQuality,
      skillTesting,
      additionalSuggestions: additionalSuggestions ? additionalSuggestions.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('[FEEDBACK] Error submitting feedback:', error);
    
    // Handle Mongoose duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Feedback has already been submitted for this interview' });
    }

    res.status(500).json({ success: false, message: 'Unable to submit feedback right now. Please try again.' });
  }
};

/**
 * @desc    Get all feedback for admin
 * @route   GET /api/feedback/admin
 * @access  Private/Admin
 */
const getAdminFeedbackList = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await Feedback.countDocuments();
    
    const feedbackList = await Feedback.find()
      .populate('user', 'firstName lastName email')
      .populate('session', 'configuration status createdAt')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: feedbackList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[FEEDBACK] Admin list error:', error);
    res.status(500).json({ success: false, message: 'Server Error retrieving feedback list' });
  }
};

/**
 * @desc    Get single feedback for admin
 * @route   GET /api/feedback/admin/:id
 * @access  Private/Admin
 */
const getAdminFeedbackDetail = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('session', 'configuration status overallScore createdAt');

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('[FEEDBACK] Admin detail error:', error);
    res.status(500).json({ success: false, message: 'Server Error retrieving feedback detail' });
  }
};

module.exports = {
  submitFeedback,
  getAdminFeedbackList,
  getAdminFeedbackDetail
};
