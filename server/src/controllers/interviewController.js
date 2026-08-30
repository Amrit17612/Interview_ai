const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const mongoose = require('mongoose');
const { getGenerateQuestionPrompt, getEvaluateAnswerPrompt, getFinalReportPrompt } = require('../utils/prompts');
const { generateText, validateQuestionResponse, validateEvaluationResponse, validateReportResponse } = require('../services/geminiService');
const { SKILL_DICTIONARY, extractSkills } = require('../utils/skillExtractor');

const MAX_QUESTIONS = 5; // Fixed bound as per instruction to define a minimal explicit configuration field.

/**
 * POST /api/interviews
 * Create a new authenticated interview session.
 */
const createInterviewSession = async (req, res) => {
  try {
    const { resumeId, atsJobId, configuration } = req.body;
    const userId = req.user._id;

    if (!configuration || !configuration.type || !configuration.domain || !configuration.difficulty) {
      return res.status(400).json({ success: false, message: 'Missing required configuration fields.' });
    }

    const validTypes = ['BEHAVIORAL', 'TECHNICAL', 'SYSTEM_DESIGN', 'GENERAL'];
    const validDiffs = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

    if (!validTypes.includes(configuration.type) || !validDiffs.includes(configuration.difficulty)) {
      return res.status(400).json({ success: false, message: 'Invalid configuration values' });
    }

    if (configuration.targetSkill) {
      if (!Object.keys(SKILL_DICTIONARY).includes(configuration.targetSkill)) {
        return res.status(400).json({ success: false, message: 'Invalid target skill' });
      }
    }

    // Validate optional resumeId belongs to user
    if (resumeId) {
      if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return res.status(400).json({ success: false, message: 'Invalid resumeId format' });
      }
      const resume = await Resume.findOne({ _id: resumeId, userId });
      if (!resume) {
        return res.status(404).json({ success: false, message: 'Resume not found or does not belong to user' });
      }
    }

    // Validate optional atsJobId belongs to user
    if (atsJobId) {
      if (!mongoose.Types.ObjectId.isValid(atsJobId)) {
        return res.status(400).json({ success: false, message: 'Invalid atsJobId format' });
      }
      const job = await JobDescription.findOne({ _id: atsJobId, userId });
      if (!job) {
        return res.status(404).json({ success: false, message: 'JobDescription not found or does not belong to user' });
      }
    }

    const { normalizeCompany, sanitizeRole } = require('../utils/companyDictionary');
    
    // Create session
    const session = await InterviewSession.create({
      user: userId,
      resumeId: resumeId || null,
      atsJobId: atsJobId || null,
      configuration: {
        ...configuration,
        company: configuration.company ? normalizeCompany(configuration.company) : null,
        role: configuration.role ? sanitizeRole(configuration.role) : null
      },
      status: 'IN_PROGRESS', // Initializing directly into in-progress since we validated config
      questions: []
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('[INTERVIEW CONTROLLER] Create Session Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create interview session.' });
  }
};

/**
 * GET /api/interviews
 * Return list of interviews for authenticated user.
 */
const getInterviewSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      type, 
      difficulty, 
      domain, 
      targetSkill, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = { user: userId };

    const validStatuses = ['CONFIGURING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'];
    if (status && validStatuses.includes(status)) {
      query.status = status;
    }

    const validTypes = ['BEHAVIORAL', 'TECHNICAL', 'SYSTEM_DESIGN', 'GENERAL'];
    if (type && validTypes.includes(type)) {
      query['configuration.type'] = type;
    }

    const validDiffs = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
    if (difficulty && validDiffs.includes(difficulty)) {
      query['configuration.difficulty'] = difficulty;
    }

    if (domain) query['configuration.domain'] = domain;
    if (targetSkill) query['configuration.targetSkill'] = targetSkill;

    if (search) {
      // Deterministic regex escaping
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { 'configuration.domain': { $regex: escapedSearch, $options: 'i' } },
        { 'configuration.targetSkill': { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const validSortFields = ['createdAt', 'updatedAt', 'overallScore'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortConfig = { [sortField]: sortDir };

    const [total, sessions] = await Promise.all([
      InterviewSession.countDocuments(query),
      InterviewSession.find(query)
        .select('-questions')
        .sort(sortConfig)
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        interviews: sessions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNextPage: skip + sessions.length < total,
          hasPreviousPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('[INTERVIEW CONTROLLER] Get Sessions Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch interview sessions.' });
  }
};

/**
 * GET /api/interviews/:id
 * Return a specific interview session for authenticated user.
 */
const getInterviewSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid session ID format' });
    }

    // IDOR protection: strictly scope by both _id and user
    const session = await InterviewSession.findOne({ _id: id, user: userId });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('[INTERVIEW CONTROLLER] Get Session Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch interview session.' });
  }
};

/**
 * POST /api/interviews/:id/question
 * Generate the next question for the session.
 */
const generateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid session ID format' });
    }

    const session = await InterviewSession.findOne({ _id: id, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, message: `Cannot generate question for session in status: ${session.status}` });
    }

    if (session.questions.length >= session.maxQuestions) {
      return res.status(400).json({ success: false, message: 'Maximum number of questions reached.' });
    }

    // Check if the last question is still pending
    if (session.questions.length > 0) {
      const lastQuestion = session.questions[session.questions.length - 1];
      if (lastQuestion.status === 'PENDING') {
        return res.status(400).json({ success: false, message: 'Cannot generate new question while the current one is pending an answer.' });
      }
    }

    // Template logic bypass
    if (session.isTemplateDriven && session.templateQuestions) {
      const nextIndex = session.questions.length;
      if (nextIndex < session.templateQuestions.length) {
        const nextQ = session.templateQuestions[nextIndex];
        const newQuestion = {
          index: nextIndex,
          text: nextQ.text,
          questionId: nextQ.questionId, // This might just be the string ID from the snapshot
          expectedPoints: nextQ.expectedPoints || [],
          status: 'PENDING'
        };
        session.questions.push(newQuestion);
        await session.save();
        return res.status(200).json({ success: true, data: newQuestion });
      }
    }

    // Deterministic Question Selection (AI Flow)
    const { getNextQuestion, getFollowUpQuestion } = require('../services/questionService');
    const { extractSkills } = require('../utils/skillExtractor');
    
    let selectedQuestion = null;
    
    // Check if we need a follow up based on the previous question
    if (session.questions.length > 0) {
      const lastQuestion = session.questions[session.questions.length - 1];
      if (lastQuestion.questionId) {
        // Deterministic follow-up without Gemini score (default to neutral branch)
        // A hardcoded 50 triggers the neutral branch deterministically in questionService
        selectedQuestion = getFollowUpQuestion(lastQuestion.questionId, 50);
      }
    }

    // If no follow up is needed or available, get the next primary deterministic question
    if (!selectedQuestion) {
      let resumeSkills = [];
      let atsSkills = [];

      const contextPromises = [];
      if (session.resumeId) {
        contextPromises.push(
          Resume.findOne({ _id: session.resumeId, userId })
            .then(resume => {
              if (resume && resume.parsingStatus === 'COMPLETED' && resume.parsedText) {
                resumeSkills = extractSkills(resume.parsedText);
              }
            })
            .catch(err => console.error('[INTERVIEW ENGINE] Failed to retrieve resume skills:', err))
        );
      }
      
      if (session.atsJobId) {
        contextPromises.push(
          JobDescription.findOne({ _id: session.atsJobId, userId })
            .then(job => {
              if (job && job.content) {
                const combinedText = `Title: ${job.title}\nCompany: ${job.company}\nContent: ${job.content}`;
                atsSkills = extractSkills(combinedText);
              }
            })
            .catch(err => console.error('[INTERVIEW ENGINE] Failed to retrieve ATS skills:', err))
        );
      }
      
      if (contextPromises.length > 0) {
        await Promise.all(contextPromises);
      }

      selectedQuestion = getNextQuestion(session, resumeSkills, atsSkills);
    }

    const newQuestion = {
      index: session.questions.length,
      text: selectedQuestion.text,
      questionId: selectedQuestion.id,
      status: 'PENDING'
    };

    session.questions.push(newQuestion);
    await session.save(); // Persist before returning

    res.status(200).json({
      success: true,
      data: session.questions[session.questions.length - 1]
    });
  } catch (error) {
    console.error('[INTERVIEW ENGINE] Generate Question Error:', error);
    const msg = error.message.includes('AI') ? error.message : 'Failed to generate question.';
    res.status(500).json({ success: false, message: msg });
  }
};

/**
 * POST /api/interviews/:id/answer
 * Submit an answer and evaluate it.
 */
const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const userId = req.user._id;

    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Answer is required and must be a valid string.' });
    }

    if (answer.length > 5000) {
      return res.status(400).json({ success: false, message: 'Answer exceeds maximum allowed length.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid session ID format' });
    }

    const session = await InterviewSession.findOne({ _id: id, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    if (session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, message: `Cannot submit answer for session in status: ${session.status}` });
    }

    if (session.questions.length === 0) {
      return res.status(400).json({ success: false, message: 'No questions generated yet.' });
    }

    const currentQuestion = session.questions[session.questions.length - 1];

    if (currentQuestion.status !== 'PENDING') {
      // Duplicate submission protection
      return res.status(409).json({ success: false, message: 'Question has already been answered and evaluated.' });
    }

    currentQuestion.userAnswer = answer.trim();
    currentQuestion.status = 'ANSWERED';

    await session.save();

    res.status(200).json({
      success: true,
      data: currentQuestion
    });
  } catch (error) {
    console.error('[INTERVIEW ENGINE] Submit Answer Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit answer.' });
  }
};

/**
 * POST /api/interviews/:id/complete
 * Complete the interview and generate final report.
 */
const completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid session ID format' });
    }

    const session = await InterviewSession.findOne({ _id: id, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    if (session.status === 'COMPLETED' && session.overallScore !== undefined && session.overallScore !== null) {
      return res.status(200).json({
        success: true,
        data: session
      });
    }

    if (session.status !== 'IN_PROGRESS' && session.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: `Cannot complete session in status: ${session.status}` });
    }

    if (session.questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot complete an empty interview session.' });
    }

    const hasPending = session.questions.some(q => q.status === 'PENDING');
    if (hasPending) {
      return res.status(400).json({ success: false, message: 'Cannot complete interview with pending unanswered questions.' });
    }

    // Persist completed status immediately to prevent data loss if Gemini fails
    if (session.status !== 'COMPLETED') {
      session.status = 'COMPLETED';
      await session.save();
    }

    // Context Binding for Phase 2
    let resumeContext = null;
    let atsContext = null;

    const contextPromises = [];
    if (session.resumeId) {
      contextPromises.push(
        Resume.findOne({ _id: session.resumeId, userId })
          .then(resume => {
            if (resume && resume.parsingStatus === 'COMPLETED' && resume.parsedText) {
              resumeContext = resume.parsedText.substring(0, 8000); // Bounded size
            }
          })
          .catch(err => console.error('[INTERVIEW ENGINE] Failed to retrieve resume context:', err))
      );
    }
    
    if (session.atsJobId) {
      contextPromises.push(
        JobDescription.findOne({ _id: session.atsJobId, userId })
          .then(job => {
            if (job && job.content) {
              atsContext = `Title: ${job.title}\nCompany: ${job.company}\nContent: ${job.content}`.substring(0, 8000);
            }
          })
          .catch(err => console.error('[INTERVIEW ENGINE] Failed to retrieve ATS context:', err))
      );
    }
    
    if (contextPromises.length > 0) {
      await Promise.all(contextPromises);
    }

    const prompt = getFinalReportPrompt({
      domain: session.configuration.domain,
      difficulty: session.configuration.difficulty,
      type: session.configuration.type,
      evaluations: session.questions.map(q => ({
        question: q.text,
        answer: q.userAnswer || '',
        score: 0, // Live evaluation removed; prompt must assess entirely from answer
        ...(q.expectedPoints && q.expectedPoints.length > 0 ? { expectedPoints: q.expectedPoints } : {})
      })),
      resumeContext,
      atsContext,
      company: session.configuration.company,
      role: session.configuration.role
    });

    const aiResText = await generateText(prompt, { responseMimeType: 'application/json' });
    const report = validateReportResponse(aiResText);

    session.overallScore = report.overall_score;
    session.feedbackSummary = report.summary;
    session.strengths = report.strengths || [];
    session.weaknesses = report.weaknesses || [];
    session.recommendations = report.recommendations || [];
    // We could map per-question evaluations here if the schema supports it.
    if (report.question_evaluations && report.question_evaluations.length === session.questions.length) {
      session.questions.forEach((q, idx) => {
        q.evaluation = {
          score: report.question_evaluations[idx].score,
          feedback: report.question_evaluations[idx].feedback
        };
        q.status = 'EVALUATED';
      });
    }

    await session.save();

    // Reward Logic (Max 5 times = 25 credits)
    // We only reward if this is not a retry (session wasn't already in rewardedInterviews)
    const user = await User.findById(userId);
    if (user && user.rewardedInterviews && user.rewardedInterviews.length < 5) {
      const alreadyRewarded = user.rewardedInterviews.some(rid => rid.equals(session._id));
      if (!alreadyRewarded) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId, 'rewardedInterviews.4': { $exists: false }, 'rewardedInterviews': { $ne: session._id } },
          { 
            $push: { rewardedInterviews: session._id },
            $inc: { credits: 5 }
          },
          { new: true }
        );

        if (updatedUser) {
          await CreditTransaction.create({
            user: userId,
            amount: 5,
            type: 'EARN_INTERVIEW',
            referenceId: session._id.toString(),
            balanceBefore: updatedUser.credits - 5,
            balanceAfter: updatedUser.credits
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('[INTERVIEW ENGINE] Complete Interview Error:', error);
    const msg = error.message.includes('AI') ? error.message : 'Failed to complete interview.';
    res.status(500).json({ success: false, message: msg, recoverable: true });
  }
};

/**
 * POST /api/interviews/:id/retry-report
 * Retry final report generation for a completed session.
 */
const retryReport = async (req, res) => {
  // Alias to completeInterview, which handles idempotency and AI calls natively.
  return completeInterview(req, res);
};

/**
 * GET /api/interviews/stats
 * Return analytics for the authenticated user.
 */
const getInterviewStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const hasScoreCond = {
      $and: [
        { $eq: ["$status", "COMPLETED"] },
        { $ne: ["$overallScore", null] },
        { $ne: [{ $type: "$overallScore" }, "missing"] }
      ]
    };

    // Pipeline 1: Summary Statistics
    const summaryPromise = InterviewSession.aggregate([
      { $match: { user: userId } },
      { $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          completedInterviews: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
          },
          inProgressInterviews: {
            $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] }
          },
          abandonedInterviews: {
            $sum: { $cond: [{ $eq: ["$status", "ABANDONED"] }, 1, 0] }
          },
          totalScore: {
            $sum: {
              $cond: [hasScoreCond, "$overallScore", 0]
            }
          },
          scoredInterviews: {
            $sum: {
              $cond: [hasScoreCond, 1, 0]
            }
          },
          highestScore: {
            $max: { $cond: [hasScoreCond, "$overallScore", null] }
          },
          lowestScore: {
            $min: { $cond: [hasScoreCond, "$overallScore", null] }
          }
      }}
    ]);

    // Pipeline 2: Domain Stats
    const domainPromise = InterviewSession.aggregate([
      { $match: { user: userId } },
      { $group: {
          _id: "$configuration.domain",
          interviewCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
          },
          totalScore: {
            $sum: {
              $cond: [hasScoreCond, "$overallScore", 0]
            }
          },
          scoredCount: {
            $sum: {
              $cond: [hasScoreCond, 1, 0]
            }
          }
      }},
      { $sort: { interviewCount: -1 } }
    ]);

    // Pipeline 3: Difficulty Stats
    const difficultyPromise = InterviewSession.aggregate([
      { $match: { user: userId } },
      { $group: {
          _id: "$configuration.difficulty",
          interviewCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
          },
          totalScore: {
            $sum: {
              $cond: [hasScoreCond, "$overallScore", 0]
            }
          },
          scoredCount: {
            $sum: {
              $cond: [hasScoreCond, 1, 0]
            }
          }
      }},
      { $sort: { interviewCount: -1 } }
    ]);

    // Pipeline 4: Type Stats
    const typePromise = InterviewSession.aggregate([
      { $match: { user: userId } },
      { $group: {
          _id: "$configuration.type",
          interviewCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
          },
          totalScore: {
            $sum: {
              $cond: [hasScoreCond, "$overallScore", 0]
            }
          },
          scoredCount: {
            $sum: {
              $cond: [hasScoreCond, 1, 0]
            }
          }
      }},
      { $sort: { interviewCount: -1 } }
    ]);

    // Pipeline 5: Strengths
    const strengthsPromise = InterviewSession.aggregate([
      { $match: { user: userId, status: 'COMPLETED' } },
      { $unwind: "$strengths" },
      { $project: { normalizedStrength: { $trim: { input: { $toLower: "$strengths" } } } } },
      { $group: { _id: "$normalizedStrength", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Pipeline 6: Weaknesses
    const weaknessesPromise = InterviewSession.aggregate([
      { $match: { user: userId, status: 'COMPLETED' } },
      { $unwind: "$weaknesses" },
      { $project: { normalizedWeakness: { $trim: { input: { $toLower: "$weaknesses" } } } } },
      { $group: { _id: "$normalizedWeakness", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Pipeline 7: Recent Performance (Trend and Improvement)
    const completedPromise = InterviewSession.find({
      user: userId,
      status: 'COMPLETED',
      overallScore: { $ne: null }
    })
    .sort({ createdAt: -1 })
    .select('_id createdAt configuration.domain configuration.difficulty configuration.type overallScore')
    .lean();

    // Execute concurrently
    const [
      summaryAgg,
      domainAgg,
      difficultyAgg,
      typeAgg,
      strengthsAgg,
      weaknessesAgg,
      completedInterviews
    ] = await Promise.all([
      summaryPromise,
      domainPromise,
      difficultyPromise,
      typePromise,
      strengthsPromise,
      weaknessesPromise,
      completedPromise
    ]);

    // Format Summary
    let summary = {
      totalInterviews: 0,
      completedInterviews: 0,
      inProgressInterviews: 0,
      abandonedInterviews: 0,
      averageScore: null,
      highestScore: null,
      lowestScore: null
    };

    if (summaryAgg.length > 0) {
      const s = summaryAgg[0];
      summary = {
        totalInterviews: s.totalInterviews,
        completedInterviews: s.completedInterviews,
        inProgressInterviews: s.inProgressInterviews,
        abandonedInterviews: s.abandonedInterviews,
        averageScore: s.scoredInterviews > 0 ? Math.round((s.totalScore / s.scoredInterviews) * 10) / 10 : null,
        highestScore: s.highestScore,
        lowestScore: s.lowestScore
      };
    }

    // Helpers to format groups
    const formatGroup = (arr) => arr.map(item => ({
      name: item._id || 'Unknown',
      interviewCount: item.interviewCount,
      completedCount: item.completedCount,
      averageScore: item.scoredCount > 0 ? Math.round((item.totalScore / item.scoredCount) * 10) / 10 : null
    }));

    const domainStats = formatGroup(domainAgg).map(d => ({ domain: d.name, ...d }));
    const difficultyStats = formatGroup(difficultyAgg).map(d => ({ difficulty: d.name, ...d }));
    const typeStats = formatGroup(typeAgg).map(d => ({ type: d.name, ...d }));

    const strengths = strengthsAgg.map(s => ({ skill: s._id, count: s.count }));
    const weaknesses = weaknessesAgg.map(w => {
      const extracted = extractSkills(w._id);
      const actionableSkillKey = extracted.length === 1 ? extracted[0] : null;
      const result = { skill: w._id, count: w.count };
      if (actionableSkillKey) {
        result.actionableSkillKey = actionableSkillKey;
      }
      return result;
    });

    // Format Recent Performance (last 10)
    const recentPerformance = completedInterviews.slice(0, 10).map(r => ({
      id: r._id,
      date: r.createdAt,
      domain: r.configuration.domain,
      difficulty: r.configuration.difficulty,
      type: r.configuration.type,
      overallScore: r.overallScore
    }));

    // Improvement Calculation
    let improvementData = {
      available: false,
      percentage: null,
      trend: 'FLAT', // UP, DOWN, FLAT
      message: 'Insufficient data for improvement calculation.'
    };

    if (completedInterviews.length >= 10) {
      // 10 or more: latest 5 vs previous 5
      const latest5 = completedInterviews.slice(0, 5);
      const previous5 = completedInterviews.slice(5, 10);
      
      const avgLatest = latest5.reduce((sum, i) => sum + i.overallScore, 0) / 5;
      const avgPrev = previous5.reduce((sum, i) => sum + i.overallScore, 0) / 5;
      
      if (avgPrev > 0) {
        const diff = avgLatest - avgPrev;
        const pct = (diff / avgPrev) * 100;
        improvementData.available = true;
        improvementData.percentage = Math.round(pct * 10) / 10;
        improvementData.trend = pct > 0 ? 'UP' : pct < 0 ? 'DOWN' : 'FLAT';
        improvementData.message = `Compared to your previous 5 interviews, your recent score is ${improvementData.trend === 'UP' ? 'up' : improvementData.trend === 'DOWN' ? 'down' : 'flat'} by ${Math.abs(improvementData.percentage)}%.`;
      }
    } else if (completedInterviews.length >= 2) {
      // Less than 10 but >= 2: split in half
      const mid = Math.floor(completedInterviews.length / 2);
      const latestHalf = completedInterviews.slice(0, mid);
      const previousHalf = completedInterviews.slice(mid, mid * 2);
      
      const avgLatest = latestHalf.reduce((sum, i) => sum + i.overallScore, 0) / latestHalf.length;
      const avgPrev = previousHalf.reduce((sum, i) => sum + i.overallScore, 0) / previousHalf.length;
      
      if (avgPrev > 0) {
        const diff = avgLatest - avgPrev;
        const pct = (diff / avgPrev) * 100;
        improvementData.available = true;
        improvementData.percentage = Math.round(pct * 10) / 10;
        improvementData.trend = pct > 0 ? 'UP' : pct < 0 ? 'DOWN' : 'FLAT';
        improvementData.message = `Compared to your earlier interviews, your recent score is ${improvementData.trend === 'UP' ? 'up' : improvementData.trend === 'DOWN' ? 'down' : 'flat'} by ${Math.abs(improvementData.percentage)}%.`;
      }
    }

    // Deterministic Recommendations
    const recommendations = [];

    // Rule 1: Improvement trend
    if (improvementData.available && improvementData.percentage !== null) {
      if (improvementData.percentage > 5) {
        recommendations.push("Your recent performance is improving! Keep up the great work.");
      } else if (improvementData.percentage < -10) {
        recommendations.push("Your recent performance has dipped. Consider reviewing your weak areas.");
      }
    }

    // Rule 2: Difficulty performance
    const advancedStats = difficultyStats.find(d => d.difficulty === 'ADVANCED');
    if (advancedStats && advancedStats.averageScore !== null && advancedStats.averageScore >= 80) {
      recommendations.push("You are excelling at Advanced topics. You seem well-prepared for senior-level questions.");
    }
    
    // Rule 3: Weak interview type
    if (typeStats.length > 0) {
      const scoredTypes = typeStats.filter(t => t.averageScore !== null);
      if (scoredTypes.length > 0) {
        const lowestType = scoredTypes.reduce((min, t) => t.averageScore < min.averageScore ? t : min, scoredTypes[0]);
        if (lowestType.averageScore < 60) {
          recommendations.push(`Your ${lowestType.type.toLowerCase().replace('_', ' ')} interviews are scoring lower (${lowestType.averageScore}). Practice this type more.`);
        }
      }
    }
    
    // Rule 4: Missing behavioral
    const hasBehavioral = typeStats.some(t => t.type === 'BEHAVIORAL' && t.completedCount > 0);
    if (!hasBehavioral && completedInterviews.length >= 3) {
      recommendations.push("You haven't practiced any Behavioral interviews. They are critical for passing team-fit rounds.");
    }
    
    // Rule 5: Highlight top weakness
    if (weaknesses.length > 0) {
      recommendations.push(`You frequently struggle with "${weaknesses[0].skill}". We recommend brushing up on this concept.`);
    }
    
    // Rule 6: Congratulate top strength
    if (strengths.length > 0) {
      recommendations.push(`Your strongest recurring skill is "${strengths[0].skill}". Leverage this in your actual interviews!`);
    }

    res.status(200).json({
      success: true,
      data: {
        summary,
        domainStats,
        difficultyStats,
        typeStats,
        skillAnalysis: {
          strengths,
          weaknesses
        },
        recentPerformance,
        improvementData,
        recommendations
      }
    });
  } catch (error) {
    console.error('[INTERVIEW CONTROLLER] Get Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve interview stats.' });
  }
};


/**
 * GET /api/interviews/compare
 * Compare two completed interview sessions
 */
const compareInterviews = async (req, res) => {
  try {
    const { first, second } = req.query;
    
    if (!first || !second || first === second) {
      return res.status(400).json({ success: false, message: 'Two distinct interview IDs are required for comparison.' });
    }

    if (!mongoose.Types.ObjectId.isValid(first) || !mongoose.Types.ObjectId.isValid(second)) {
      return res.status(400).json({ success: false, message: 'Invalid interview ID format.' });
    }

    const userId = req.user._id;
    const interviews = await InterviewSession.find({
      _id: { $in: [first, second] },
      user: userId,
      status: 'COMPLETED'
    }).lean();

    if (interviews.length !== 2) {
      return res.status(404).json({ success: false, message: 'One or both completed interviews not found or inaccessible.' });
    }

    const int1 = interviews.find(i => i._id.toString() === first);
    const int2 = interviews.find(i => i._id.toString() === second);

    if (!int1 || !int2) {
      return res.status(404).json({ success: false, message: 'Interviews could not be matched.' });
    }

    let scoreDifference = null;
    let percentageChange = null;
    let trend = 'INSUFFICIENT_COMPARABLE_DATA';

    if (int1.overallScore !== null && int2.overallScore !== null) {
      scoreDifference = int2.overallScore - int1.overallScore;
      if (int1.overallScore > 0) {
        percentageChange = (scoreDifference / int1.overallScore) * 100;
      } else {
        percentageChange = null;
      }
      
      if (scoreDifference > 0) trend = 'IMPROVED';
      else if (scoreDifference < 0) trend = 'DECLINED';
      else trend = 'STABLE';
    }

    const extractSafe = (arr) => arr.map(w => {
      const extracted = extractSkills(w);
      return extracted.length === 1 ? extracted[0] : w.toLowerCase().trim();
    });

    const s1 = extractSafe(int1.strengths || []);
    const s2 = extractSafe(int2.strengths || []);
    const w1 = extractSafe(int1.weaknesses || []);
    const w2 = extractSafe(int2.weaknesses || []);

    const sharedStrengths = s1.filter(s => s2.includes(s));
    const newStrengths = s2.filter(s => !s1.includes(s));

    const persistentWeaknesses = w1.filter(w => w2.includes(w));
    const resolvedWeaknesses = w1.filter(w => !w2.includes(w));
    const newWeaknesses = w2.filter(w => !w1.includes(w));

    res.status(200).json({
      success: true,
      data: {
        firstInterview: {
          _id: int1._id,
          createdAt: int1.createdAt,
          overallScore: int1.overallScore,
          configuration: int1.configuration
        },
        secondInterview: {
          _id: int2._id,
          createdAt: int2.createdAt,
          overallScore: int2.overallScore,
          configuration: int2.configuration
        },
        scoreAnalysis: {
          scoreDifference,
          percentageChange,
          trend
        },
        strengthComparison: {
          sharedStrengths,
          newStrengths
        },
        weaknessComparison: {
          persistentWeaknesses,
          resolvedWeaknesses,
          newWeaknesses
        }
      }
    });

  } catch (error) {
    console.error('[INTERVIEW CONTROLLER] Compare Error:', error);
    res.status(500).json({ success: false, message: 'Failed to compare interviews.' });
  }
};


/**
 * GET /api/interviews/roadmap
 * Generate a personalized improvement roadmap based on chronological history.
 */
const getInterviewRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const { extractSkills, SKILL_DICTIONARY } = require('../utils/skillExtractor');

    // Fetch all completed interviews sorted newest first
    const sessions = await InterviewSession.find({
      user: userId,
      status: 'COMPLETED'
    })
    .sort({ createdAt: -1 })
    .select('configuration strengths weaknesses overallScore createdAt')
    .lean();

    if (sessions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          overallStatus: 'INSUFFICIENT_DATA',
          prioritySkills: [],
          improvingSkills: [],
          categoryFocus: null,
          recommendedAction: {
            action: 'COMPLETE_MORE_INTERVIEWS',
            reason: 'You need to complete at least one interview to generate a roadmap.'
          },
          targetedPracticeImpact: []
        }
      });
    }

    // --- OVERALL STATUS ---
    let overallStatus = 'INSUFFICIENT_DATA';
    if (sessions.length >= 2) {
      const mid = Math.floor(sessions.length / 2);
      const latestHalf = sessions.slice(0, mid);
      const previousHalf = sessions.slice(mid, mid * 2);
      
      const avgLatest = latestHalf.reduce((sum, i) => sum + (i.overallScore || 0), 0) / latestHalf.length;
      const avgPrev = previousHalf.reduce((sum, i) => sum + (i.overallScore || 0), 0) / previousHalf.length;
      
      if (avgPrev > 0) {
        const pct = ((avgLatest - avgPrev) / avgPrev) * 100;
        overallStatus = pct > 5 ? 'IMPROVING' : pct < -5 ? 'DECLINING' : 'STABLE';
      } else {
        overallStatus = 'IMPROVING';
      }
    }

    // --- SKILL LIFECYCLE & PRIORITY SCORING ---
    const weaknessHistory = {};
    const strengthHistory = {};
    
    // Process oldest to newest
    const oldestToNewest = [...sessions].reverse();
    
    oldestToNewest.forEach((session, index) => {
      const isLatest = index === oldestToNewest.length - 1;
      const isRecent = index >= oldestToNewest.length - 2; // Latest or second latest

      const sessionWeaknesses = new Set();
      (session.weaknesses || []).forEach(w => {
        const extracted = extractSkills(w);
        extracted.forEach(skill => sessionWeaknesses.add(skill));
      });

      const sessionStrengths = new Set();
      (session.strengths || []).forEach(s => {
        const extracted = extractSkills(s);
        extracted.forEach(skill => sessionStrengths.add(skill));
      });

      sessionWeaknesses.forEach(skill => {
        if (!weaknessHistory[skill]) weaknessHistory[skill] = { occurrences: 0, latestOccurrence: -1, isActionable: false };
        weaknessHistory[skill].occurrences += 1;
        weaknessHistory[skill].latestOccurrence = index;
        
        // Find actionable key
        for (const [key, aliases] of Object.entries(SKILL_DICTIONARY)) {
          if (aliases.includes(skill)) weaknessHistory[skill].isActionable = key;
        }
      });

      sessionStrengths.forEach(skill => {
        if (!strengthHistory[skill]) strengthHistory[skill] = { occurrences: 0, latestOccurrence: -1, isActionable: false };
        strengthHistory[skill].occurrences += 1;
        strengthHistory[skill].latestOccurrence = index;
        
        for (const [key, aliases] of Object.entries(SKILL_DICTIONARY)) {
          if (aliases.includes(skill)) strengthHistory[skill].isActionable = key;
        }
      });
    });

    const prioritySkillsMap = [];
    const improvingSkills = [];

    const totalInterviews = oldestToNewest.length;

    Object.keys(weaknessHistory).forEach(skill => {
      const wh = weaknessHistory[skill];
      const isRecency = wh.latestOccurrence === totalInterviews - 1;
      const occurredOlder = wh.occurrences > 1 && wh.latestOccurrence === totalInterviews - 1;
      
      let trend = 'INSUFFICIENT_DATA';
      if (totalInterviews >= 2) {
        if (wh.occurrences === 1 && isRecency) {
          trend = 'NEW';
        } else if (occurredOlder) {
          trend = 'PERSISTENT';
        } else if (wh.latestOccurrence < totalInterviews - 1) {
          trend = 'RESOLVED';
        }
      }

      // Check if regressing (was a strength in older, now a weakness in latest)
      if (strengthHistory[skill] && strengthHistory[skill].latestOccurrence < wh.latestOccurrence && isRecency) {
        trend = 'REGRESSING';
      }

      if (trend !== 'RESOLVED' && isRecency) {
        const priorityScore = wh.occurrences 
          + (isRecency ? 2 : 0) 
          + (wh.isActionable ? 2 : 0) 
          + (trend === 'PERSISTENT' ? 3 : 0);

        let priorityLevel = 'LOW';
        if (priorityScore >= 6) priorityLevel = 'HIGH';
        else if (priorityScore >= 4) priorityLevel = 'MEDIUM';

        prioritySkillsMap.push({
          skill,
          actionableSkillKey: wh.isActionable || null,
          priority: priorityLevel,
          priorityScore,
          reason: trend === 'PERSISTENT' ? 'Recurring weakness across multiple interviews.' : 'Identified as a weakness in your recent interview.',
          occurrences: wh.occurrences,
          trend
        });
      }
    });

    Object.keys(strengthHistory).forEach(skill => {
      const sh = strengthHistory[skill];
      const wh = weaknessHistory[skill];
      const isRecentStrength = sh.latestOccurrence >= totalInterviews - 2;
      
      // If it was a weakness in older interviews but is a strength in recent interviews, and NOT a weakness in recent
      if (wh && wh.latestOccurrence < sh.latestOccurrence && isRecentStrength) {
        improvingSkills.push({
          skill,
          actionableSkillKey: sh.isActionable || null,
          priority: 'LOW',
          reason: 'Previously weak but now appearing as a strength.',
          occurrences: sh.occurrences,
          trend: 'RESOLVED'
        });
      }
    });

    prioritySkillsMap.sort((a, b) => b.priorityScore - a.priorityScore);
    const prioritySkills = prioritySkillsMap.map(s => {
      delete s.priorityScore;
      return s;
    });

    // --- CATEGORY FOCUS ---
    const typePerformance = {};
    let globalScoreSum = 0;
    let globalScoredCount = 0;

    sessions.forEach(s => {
      if (s.overallScore != null) {
        const type = s.configuration.type || 'GENERAL';
        if (!typePerformance[type]) typePerformance[type] = { sum: 0, count: 0 };
        typePerformance[type].sum += s.overallScore;
        typePerformance[type].count += 1;
        
        globalScoreSum += s.overallScore;
        globalScoredCount += 1;
      }
    });

    const globalAverage = globalScoredCount > 0 ? globalScoreSum / globalScoredCount : 0;
    let categoryFocus = null;
    let lowestTypeAvg = 100;
    let lowestType = null;

    Object.keys(typePerformance).forEach(type => {
      const tp = typePerformance[type];
      const avg = tp.sum / tp.count;
      if (avg < lowestTypeAvg) {
        lowestTypeAvg = avg;
        lowestType = type;
      }
    });

    if (lowestType && lowestTypeAvg < globalAverage - 10) {
      categoryFocus = {
        type: lowestType,
        reason: `Consistently performing ${Math.round(globalAverage - lowestTypeAvg)}% below your overall average.`,
        averageScore: Math.round(lowestTypeAvg)
      };
    } else if (lowestType && globalScoredCount > 2) {
      categoryFocus = {
        type: lowestType,
        reason: 'Lowest average performance category.',
        averageScore: Math.round(lowestTypeAvg)
      };
    }

    // --- TARGETED PRACTICE IMPACT ---
    const targetedPracticeImpact = [];
    const targetedSessions = oldestToNewest.filter(s => s.configuration.targetSkill);
    
    targetedSessions.forEach(ts => {
      const skill = ts.configuration.targetSkill.toLowerCase();
      // Find average of previous sessions where this skill was a weakness
      const tsIndex = oldestToNewest.findIndex(s => s._id.toString() === ts._id.toString());
      const previousSessions = oldestToNewest.slice(0, tsIndex);
      
      let prevSum = 0;
      let prevCount = 0;
      
      previousSessions.forEach(ps => {
        let hasWeakness = false;
        (ps.weaknesses || []).forEach(w => {
          const extracted = extractSkills(w);
          if (extracted.includes(skill)) hasWeakness = true;
        });
        
        if (hasWeakness && ps.overallScore != null) {
          prevSum += ps.overallScore;
          prevCount += 1;
        }
      });
      
      const previousAverage = prevCount > 0 ? Math.round(prevSum / prevCount) : null;
      
      if (ts.overallScore != null) {
        let msg = `Scored ${ts.overallScore}% in targeted practice.`;
        if (previousAverage != null) {
          if (ts.overallScore > previousAverage) msg = `Performance improved to ${ts.overallScore}% after targeted practice.`;
          else msg = `Performance was ${ts.overallScore}% during targeted practice.`;
        }
        
        // Ensure we only add the most recent impact for a skill
        const existingIndex = targetedPracticeImpact.findIndex(tpi => tpi.skill === skill);
        if (existingIndex >= 0) {
          targetedPracticeImpact[existingIndex] = {
            skill,
            previousAverage,
            targetedScore: ts.overallScore,
            message: msg
          };
        } else {
          targetedPracticeImpact.push({
            skill,
            previousAverage,
            targetedScore: ts.overallScore,
            message: msg
          });
        }
      }
    });

    // --- RECOMMENDED ACTION ---
    let recommendedAction = {
      action: 'CONTINUE_CURRENT_PROGRESS',
      reason: 'You are performing well. Keep practicing to maintain your skills.'
    };

    if (totalInterviews < 2) {
      recommendedAction = {
        action: 'COMPLETE_MORE_INTERVIEWS',
        reason: 'Complete more interviews to gather enough data for personalized recommendations.'
      };
    } else {
      const topPriority = prioritySkills.find(s => s.actionableSkillKey && (s.trend === 'PERSISTENT' || s.priority === 'HIGH'));
      
      if (topPriority) {
        recommendedAction = {
          action: 'TARGETED_PRACTICE',
          targetSkill: topPriority.actionableSkillKey,
          reason: 'Highest recurring actionable weakness. Targeted practice is recommended.'
        };
      } else if (categoryFocus && categoryFocus.averageScore < globalAverage - 15) {
        recommendedAction = {
          action: 'PRACTICE_INTERVIEW_TYPE',
          targetType: categoryFocus.type,
          reason: 'Significantly weak category performance detected.'
        };
      } else if (overallStatus === 'DECLINING') {
        recommendedAction = {
          action: 'PRACTICE_INTERVIEW_TYPE',
          reason: 'Overall performance is trending down. Review your weak areas.'
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        overallStatus,
        prioritySkills,
        improvingSkills,
        categoryFocus,
        recommendedAction,
        targetedPracticeImpact
      }
    });
  } catch (error) {
    console.error('[INTERVIEW CONTROLLER] Get Roadmap Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate interview roadmap.' });
  }
};
module.exports = {
  getInterviewRoadmap,
  createInterviewSession,
  getInterviewSessions,
  getInterviewSession,
  generateQuestion,
  submitAnswer,
  completeInterview,
  retryReport,
  getInterviewStats,
  compareInterviews,
};
