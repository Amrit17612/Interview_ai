const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// All admin routes must go through protect AND requireAdmin
router.use(protect);
router.use(requireAdmin);

router.get('/dashboard', getDashboardOverview);

module.exports = router;
