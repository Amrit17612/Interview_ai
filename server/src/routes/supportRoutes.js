const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { supportImageUpload } = require('../middleware/uploadMiddleware');
const { createTicket, getTickets, getTicketDetail, replyToTicket } = require('../controllers/supportController');

router.post('/', protect, supportImageUpload, createTicket);
router.get('/', protect, getTickets);
router.get('/:id', protect, getTicketDetail);
router.post('/:id/reply', protect, replyToTicket);

module.exports = router;
