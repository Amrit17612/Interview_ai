const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'TAB_SWITCH',
      'FOCUS_LOST',
      'FOCUS_REGAINED',
      'COPY_ATTEMPT',
      'CUT_ATTEMPT',
      'PASTE_ATTEMPT',
      'RIGHT_CLICK',
      'DRAG_DROP_ATTEMPT',
      'NO_FACE',
      'MULTIPLE_FACES',
      'SCREEN_SHARE_STOPPED'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'INFO']
  },
  timestamp: {
    type: Date,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const securityAuditSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true,
    unique: true // One audit per session
  },
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewTemplate', // Depending on how interviews are modeled
    default: null
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch', // If batches exist
    default: null
  },
  
  // Counters
  warningCount: { type: Number, default: 0 },
  violationCount: { type: Number, default: 0 },
  tabSwitchCount: { type: Number, default: 0 },
  focusLossCount: { type: Number, default: 0 },
  copyAttemptCount: { type: Number, default: 0 },
  cutAttemptCount: { type: Number, default: 0 },
  pasteAttemptCount: { type: Number, default: 0 },
  rightClickCount: { type: Number, default: 0 },
  dragDropAttemptCount: { type: Number, default: 0 },
  noFaceCount: { type: Number, default: 0 },
  multipleFaceCount: { type: Number, default: 0 },
  screenShareStoppedCount: { type: Number, default: 0 },
  
  events: [securityEventSchema]
}, { timestamps: true });

// Optional: Add index for batch filtering
securityAuditSchema.index({ batch: 1 });

module.exports = mongoose.model('SecurityAudit', securityAuditSchema);
