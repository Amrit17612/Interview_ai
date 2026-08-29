const express = require('express');
const router = express.Router();
const { getAvailableTemplates, startTemplate } = require('../controllers/interviewTemplateController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAvailableTemplates);
router.post('/:id/start', startTemplate);

module.exports = router;
