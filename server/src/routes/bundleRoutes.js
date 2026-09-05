const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const bundleController = require('../controllers/bundleController');

// Admin routes (for Admin Dashboard)
router.get('/admin/all', protect, requireAdmin, bundleController.getAllBundles);
router.post('/admin', protect, requireAdmin, bundleController.createBundle);
router.put('/admin/:id', protect, requireAdmin, bundleController.updateBundle);
router.put('/admin/:id/modules', protect, requireAdmin, bundleController.setBundleModules);

// Public routes (for Student Portal)
router.get('/', bundleController.getPublicBundles);
router.get('/:id', bundleController.getBundleById); // Used by both, with access logic inside

module.exports = router;
