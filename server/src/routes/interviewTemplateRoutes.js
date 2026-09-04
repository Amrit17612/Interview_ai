const express = require('express');
const router = express.Router();
const { getAvailableTemplates, startTemplate, validateToken, getExclusiveTemplates } = require('../controllers/interviewTemplateController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAvailableTemplates);
router.get('/exclusive', getExclusiveTemplates);
router.post('/validate-token', validateToken);
router.post('/:id/start', startTemplate);

module.exports = router;
