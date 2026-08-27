const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  createJobDescription,
  getJobDescriptions,
  getJobDescriptionById,
  deleteJobDescription,
  getJobReadiness
} = require('../controllers/atsController');

// All ATS routes require authentication
router.use(protect);

router.route('/jobs')
  .post(createJobDescription)
  .get(getJobDescriptions);

router.route('/jobs/:id')
  .get(getJobDescriptionById)
  .delete(deleteJobDescription);

router.route('/jobs/:id/readiness')
  .get(getJobReadiness);

module.exports = router;
