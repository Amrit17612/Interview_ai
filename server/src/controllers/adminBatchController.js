const Batch = require('../models/Batch');
const AccessToken = require('../models/AccessToken');
const InterviewTemplate = require('../models/InterviewTemplate');
const InterviewSession = require('../models/InterviewSession');
const SecurityAudit = require('../models/SecurityAudit');
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
    const { name, description, schedule } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Batch name is required' });
    }
    
    let validSchedule = undefined;
    if (schedule && schedule.enabled) {
      if (!schedule.loginStartAt || !schedule.loginEndAt) {
        return res.status(400).json({ success: false, message: 'loginStartAt and loginEndAt are required when schedule is enabled' });
      }
      if (new Date(schedule.loginEndAt) <= new Date(schedule.loginStartAt)) {
        return res.status(400).json({ success: false, message: 'loginEndAt must be after loginStartAt' });
      }
      if (schedule.testDurationMinutes !== undefined && schedule.testDurationMinutes <= 0) {
        return res.status(400).json({ success: false, message: 'testDurationMinutes must be a positive number' });
      }
      validSchedule = {
        enabled: true,
        loginStartAt: new Date(schedule.loginStartAt),
        loginEndAt: new Date(schedule.loginEndAt),
        testDurationMinutes: schedule.testDurationMinutes || null,
        forceStopAtEnd: !!schedule.forceStopAtEnd
      };
    } else if (schedule && schedule.enabled === false) {
      validSchedule = { enabled: false };
    }

    const batch = await Batch.create({ 
      name: name.trim(), 
      description: description ? description.trim() : '',
      ...(validSchedule && { schedule: validSchedule })
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
    const { name, description, schedule } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid batch ID' });
    }
    
    const updateData = {};
    if (name && name.trim() !== '') updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    
    if (schedule) {
      if (schedule.enabled) {
        if (!schedule.loginStartAt || !schedule.loginEndAt) {
          return res.status(400).json({ success: false, message: 'loginStartAt and loginEndAt are required when schedule is enabled' });
        }
        if (new Date(schedule.loginEndAt) <= new Date(schedule.loginStartAt)) {
          return res.status(400).json({ success: false, message: 'loginEndAt must be after loginStartAt' });
        }
        if (schedule.testDurationMinutes !== undefined && schedule.testDurationMinutes <= 0) {
          return res.status(400).json({ success: false, message: 'testDurationMinutes must be a positive number' });
        }
        updateData.schedule = {
          enabled: true,
          loginStartAt: new Date(schedule.loginStartAt),
          loginEndAt: new Date(schedule.loginEndAt),
          testDurationMinutes: schedule.testDurationMinutes || null,
          forceStopAtEnd: !!schedule.forceStopAtEnd
        };
      } else {
        updateData.schedule = { enabled: false };
      }
    }

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

const getBatchResults = async (req, res, next) => {
  try {
    const { id: batchId, templateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ success: false, message: 'Invalid batch ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const batch = await Batch.findById(batchId).lean();
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const template = await InterviewTemplate.findById(templateId).select('title').lean();
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Verify token relationship (ignores active status)
    const token = await AccessToken.findOne({ batchId, templateId }).lean();
    if (!token) {
      return res.status(404).json({ success: false, message: 'Template is not assigned to this batch' });
    }

    // Fetch all completed sessions
    const sessions = await InterviewSession.find({
      batchId,
      templateId,
      status: 'COMPLETED'
    })
    .populate('user', 'firstName lastName email')
    .lean();

    if (sessions.length === 0) {
      return res.json({ 
        success: true, 
        data: {
          batch: batch.name,
          template: template.title,
          totalStudents: 0,
          results: []
        }
      });
    }

    // Fetch security audits in bulk
    const sessionIds = sessions.map(s => s._id);
    const audits = await SecurityAudit.find({ session: { $in: sessionIds } }).lean();
    const auditMap = {};
    audits.forEach(a => {
      const count = (a.warningCount || 0) + (a.violationCount || 0);
      auditMap[a.session.toString()] = count;
    });

    // Group by user and find the best attempt per user
    const userBestAttempts = new Map();

    sessions.forEach(session => {
      // Ignore sessions without a score (e.g. still generating)
      if (session.overallScore == null) return;
      
      const userId = session.user ? session.user._id.toString() : `anon_${session._id.toString()}`;
      const currentViolations = auditMap[session._id.toString()] || 0;
      const currentScore = session.overallScore;
      const currentTime = new Date(session.updatedAt).getTime();

      const existing = userBestAttempts.get(userId);

      if (!existing) {
        userBestAttempts.set(userId, { ...session, violations: currentViolations });
      } else {
        const existingScore = existing.overallScore;
        const existingViolations = existing.violations;
        const existingTime = new Date(existing.updatedAt).getTime();

        let isBetter = false;

        // 1. Primary: Score DESC
        if (currentScore > existingScore) {
          isBetter = true;
        } 
        else if (currentScore === existingScore) {
          // 2. Secondary: Violations ASC
          if (currentViolations < existingViolations) {
            isBetter = true;
          } 
          else if (currentViolations === existingViolations) {
            // 3. Tertiary: Completion time ASC
            if (currentTime < existingTime) {
              isBetter = true;
            }
          }
        }

        if (isBetter) {
          userBestAttempts.set(userId, { ...session, violations: currentViolations });
        }
      }
    });

    // Convert map to array and sort using the exact same logic
    const bestSessions = Array.from(userBestAttempts.values());
    bestSessions.sort((a, b) => {
      // 1. Score DESC
      if (b.overallScore !== a.overallScore) {
        return b.overallScore - a.overallScore;
      }
      // 2. Violations ASC
      if (a.violations !== b.violations) {
        return a.violations - b.violations;
      }
      // 3. Time ASC
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return aTime - bTime;
    });

    // Build the results array and assign rank
    const results = bestSessions.map((s, index) => ({
      rank: index + 1,
      sessionId: s._id,
      userId: s.user ? s.user._id : null,
      studentName: s.user ? `${s.user.firstName} ${s.user.lastName}` : 'Unknown Student',
      email: s.user?.email || 'N/A',
      score: s.overallScore || 0,
      completedAt: s.updatedAt,
      securityViolations: s.violations
    }));

    res.json({
      success: true,
      data: {
        batch: batch.name,
        template: template.title,
        totalStudents: results.length,
        results
      }
    });

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
  updateAccessTokenStatus,
  getBatchResults
};
