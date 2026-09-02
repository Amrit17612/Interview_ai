const SecurityAudit = require('../models/SecurityAudit');
const InterviewSession = require('../models/InterviewSession');
const User = require('../models/User');

const syncEvents = async (req, res) => {
  try {
    const { sessionId, events } = req.body;
    
    if (!sessionId || !events || !Array.isArray(events)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    // Verify session ownership and validity
    const session = await InterviewSession.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or not owned by user' });
    }

    // Create or find audit document
    let audit = await SecurityAudit.findOne({ session: sessionId, user: req.user._id });
    if (!audit) {
      // Find batch if exists (depends on how batches are linked. Assuming no explicit batch model link on session for now, or if so, we can populate it. The session has no explicit 'batch' field in the schema we saw, so we leave it null for now unless discovered later).
      // Let's check if the session schema actually has a batch field. It didn't in our view_file, so batch will be null unless passed or derived.
      audit = new SecurityAudit({
        user: req.user._id,
        session: sessionId,
        interview: session.templateId || null,
        batch: null // If batch logic exists later, it can be populated here
      });
    }

    let newViolations = 0;
    let newWarnings = 0;

    events.forEach(event => {
      // Calculate counters
      switch (event.type) {
        case 'TAB_SWITCH': audit.tabSwitchCount++; break;
        case 'FOCUS_LOST': audit.focusLossCount++; break;
        case 'COPY_ATTEMPT': audit.copyAttemptCount++; break;
        case 'CUT_ATTEMPT': audit.cutAttemptCount++; break;
        case 'PASTE_ATTEMPT': audit.pasteAttemptCount++; break;
        case 'RIGHT_CLICK': audit.rightClickCount++; break;
        case 'DRAG_DROP_ATTEMPT': audit.dragDropAttemptCount++; break;
        case 'NO_FACE': audit.noFaceCount++; break;
        case 'MULTIPLE_FACES': audit.multipleFaceCount++; break;
        case 'SCREEN_SHARE_STOPPED': audit.screenShareStoppedCount++; break;
        default: break; // FOCUS_REGAINED, COPY_SHORTCUT, etc. might not have dedicated counters but are in timeline
      }

      // Track warnings/violations based on severity
      if (['LOW', 'MEDIUM', 'HIGH'].includes(event.severity)) {
        newViolations++;
      }
      
      // Add event to timeline
      audit.events.push({
        type: event.type,
        severity: event.severity,
        timestamp: event.timestamp || new Date(),
        metadata: event.metadata || {}
      });
    });

    audit.violationCount += newViolations;
    // Arbitrary warning logic (e.g. 1 warning per 3 minor violations or 1 per major, frontend usually handles active warnings, backend just tracks)
    audit.warningCount += newViolations; // Simplified for V1

    await audit.save();

    res.status(200).json({ success: true, message: 'Events synced successfully' });
  } catch (error) {
    console.error('[SECURITY] Error syncing events:', error);
    res.status(500).json({ success: false, message: 'Server error during security sync' });
  }
};

const getSessionAudit = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const audit = await SecurityAudit.findOne({ session: sessionId, user: req.user._id });
    if (!audit) {
      return res.status(200).json({ success: true, data: null }); // Don't throw 404 for missing audit
    }
    res.status(200).json({ success: true, data: audit });
  } catch (error) {
    console.error('[SECURITY] Error fetching session audit:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAdminSessionAudit = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const audit = await SecurityAudit.findOne({ session: sessionId })
      .populate('user', 'name email')
      .populate('session', 'createdAt status');

    if (!audit) {
      return res.status(404).json({ success: false, message: 'Security audit not found for this session' });
    }

    res.status(200).json({ success: true, data: audit });
  } catch (error) {
    console.error('[SECURITY] Error fetching admin session audit:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAdminBatchAnalytics = async (req, res) => {
  try {
    const { batchId } = req.params;
    // Since batch relationships aren't clearly defined in the schema yet, this is a placeholder 
    // for actual batch aggregation if the batch field gets populated.
    const audits = await SecurityAudit.find({ batch: batchId })
      .populate('user', 'name email')
      .populate('session', 'createdAt status');

    let totalViolations = 0;
    let candidatesWithViolations = 0;
    
    audits.forEach(audit => {
      totalViolations += audit.violationCount;
      if (audit.violationCount > 0) candidatesWithViolations++;
    });

    res.status(200).json({ 
      success: true, 
      data: {
        totalCandidates: audits.length,
        candidatesWithViolations,
        totalViolations,
        audits
      } 
    });
  } catch (error) {
    console.error('[SECURITY] Error fetching admin batch analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  syncEvents,
  getSessionAudit,
  getAdminSessionAudit,
  getAdminBatchAnalytics
};
