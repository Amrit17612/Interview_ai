const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.use(protect);

router.get('/', getMyNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
