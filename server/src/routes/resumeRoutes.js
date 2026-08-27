const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { handleUpload } = require('../middleware/uploadMiddleware');
const {
  createResume,
  getResumes,
  getResumeById,
  deleteResume
} = require('../controllers/resumeController');

// All resume routes require authentication
router.use(protect);

router.route('/')
  .post(handleUpload, createResume)
  .get(getResumes);

router.route('/:id')
  .get(getResumeById)
  .delete(deleteResume);

module.exports = router;
