const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const bundleController = require('../controllers/bundleController');

// Public routes (for Student Portal)
router.get('/', bundleController.getPublicBundles);
router.get('/:id', bundleController.getBundleById); // Used by both, with access logic inside

// Admin routes (for Admin Dashboard)
router.get('/admin/all', protect, admin, bundleController.getAllBundles);
router.post('/admin', protect, admin, bundleController.createBundle);
router.put('/admin/:id', protect, admin, bundleController.updateBundle);
router.put('/admin/:id/modules', protect, admin, bundleController.setBundleModules);

module.exports = router;
