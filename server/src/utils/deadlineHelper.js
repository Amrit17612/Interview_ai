/**
 * Enforces the interview session deadline.
 * If expired, it finalizes the session and returns a 403 error.
 * @param {Object} session - The InterviewSession document
 * @param {Object} res - Express response object
 * @returns {Promise<boolean>} - True if expired and response handled, false otherwise.
 */
const enforceDeadline = async (session, res) => {
  if (!session || !session.expiresAt) return false;
  
  if (Date.now() > new Date(session.expiresAt).getTime()) {
    if (session.status !== 'COMPLETED') {
      session.status = 'COMPLETED';
      
      // Since this is invoked when they run out of time (or hit the batch hard limit)
      if (!session.completionReason || session.completionReason === 'SUBMITTED') {
        session.completionReason = 'TIME_EXPIRED';
      }
      
      await session.save();
      
      // Trigger background report generation safely
      if (session.reportStatus === 'PENDING') {
        const { triggerReportGeneration } = require('../controllers/interviewController');
        triggerReportGeneration(session, session.user);
      }
    }
    
    if (res && !res.headersSent) {
      res.status(403).json({ 
        success: false, 
        message: 'Interview session has expired.', 
        code: 'INTERVIEW_EXPIRED' 
      });
    }
    return true;
  }
  return false;
};

module.exports = { enforceDeadline };
