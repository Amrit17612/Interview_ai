const express = require('express');
const router = express.Router();
const {
  syncEvents,
  getSessionAudit,
  getAdminSessionAudit,
  getAdminBatchAnalytics
} = require('../controllers/securityController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Candidate route
router.post('/events', protect, syncEvents);
router.get('/session/:sessionId', protect, getSessionAudit);

// Admin routes
router.get('/admin/session/:sessionId', protect, requireAdmin, getAdminSessionAudit);
router.get('/admin/batch/:batchId', protect, requireAdmin, getAdminBatchAnalytics);

module.exports = router;
