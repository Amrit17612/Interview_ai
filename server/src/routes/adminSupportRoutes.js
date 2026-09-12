const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { getAllTickets, getTicketDetail, updateTicketStatus, replyToTicket } = require('../controllers/adminSupportController');

router.use(protect, requireAdmin);

router.get('/', getAllTickets);
router.get('/:id', getTicketDetail);
router.put('/:id/status', updateTicketStatus);
router.post('/:id/reply', replyToTicket);

module.exports = router;
