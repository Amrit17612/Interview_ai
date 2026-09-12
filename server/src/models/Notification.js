const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'BUG_SUBMITTED',
      'BUG_RESOLVED',
      'SUPPORT_SUBMITTED',
      'SUPPORT_REPLY',
      'SUPPORT_REOPENED',
      'ACHIEVEMENT_UNLOCKED',
      'INTERVIEW_COMPLETED',
      'REPORT_READY',
      'PAYMENT_SUCCESS',
      'SYSTEM_ALERT'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    enum: ['SUPPORT_TICKET', 'INTERVIEW', 'PAYMENT', 'ACHIEVEMENT', 'OTHER'],
    default: 'OTHER'
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId, // Generic reference
  },
  isRead: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
