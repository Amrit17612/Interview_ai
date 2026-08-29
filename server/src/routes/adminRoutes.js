const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('../controllers/adminController');
const { getPaymentAnalytics, getPayments, getPaymentById } = require('../controllers/adminCommerceController');
const { getUsers, getUserById, grantBundle } = require('../controllers/adminUserController');
const { getQuestions, getQuestionById, createQuestion, updateQuestion, updateQuestionStatus, deleteQuestion } = require('../controllers/adminQuestionController');
const { getTemplates, getTemplateById, createTemplate, updateTemplate, updateTemplateStatus, deleteTemplate } = require('../controllers/adminInterviewTemplateController');
const { getAuditLogs } = require('../controllers/adminAuditController');
const { previewImport, confirmImport, exportQuestions } = require('../controllers/adminImportExportController');
const { bulkUpdateStatus, bulkAddTags } = require('../controllers/adminBulkController');
const multer = require('multer');

// Configure Multer for memory storage (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// All admin routes must go through protect AND requireAdmin
router.use(protect);
router.use(requireAdmin);

router.get('/dashboard', getDashboardOverview);

// Commerce Routes
router.get('/analytics/payments', getPaymentAnalytics);
router.get('/payments', getPayments);
router.get('/payments/:id', getPaymentById);

// User Management Routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users/:id/grant-bundle', grantBundle);

// Content Management / Question Library
router.get('/questions/export', exportQuestions);
router.post('/questions/import/preview', upload.single('file'), previewImport);
router.post('/questions/import/confirm', confirmImport);
router.post('/questions/bulk/status', bulkUpdateStatus);
router.post('/questions/bulk/tags', bulkAddTags);
router.get('/questions', getQuestions);
router.get('/questions/:id', getQuestionById);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.patch('/questions/:id/status', updateQuestionStatus);
router.delete('/questions/:id', deleteQuestion);

// Content Management / Interview Templates
router.get('/interview-templates', getTemplates);
router.get('/interview-templates/:id', getTemplateById);
router.post('/interview-templates', createTemplate);
router.put('/interview-templates/:id', updateTemplate);
router.patch('/interview-templates/:id/status', updateTemplateStatus);
router.delete('/interview-templates/:id', deleteTemplate);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
