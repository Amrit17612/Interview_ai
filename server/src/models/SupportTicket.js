const mongoose = require('mongoose');

const SupportMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SupportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['BUG', 'SUPPORT'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  attachments: [{
    type: String // URLs or paths
  }],
  pageUrl: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  browserInfo: {
    type: String
  },
  messages: [SupportMessageSchema],
  adminNotes: {
    type: String
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

SupportTicketSchema.pre('validate', async function () {
  if (!this.ticketId) {
    const prefix = this.type === 'BUG' ? 'BUG' : 'SUP';
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    this.ticketId = `${prefix}-${randomSuffix}`;
  }
});

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
