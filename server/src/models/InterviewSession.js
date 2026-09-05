const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true
  },
  questionId: {
    type: String,
    default: null
  },
  text: {
    type: String,
    required: true
  },
  expectedPoints: {
    type: [String],
    default: []
  },
  userAnswer: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['PENDING', 'ANSWERED', 'EVALUATED'],
    default: 'PENDING'
  },
  evaluation: {
    score: { type: Number, default: null },
    feedback: { type: String, default: null }
  }
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewTemplate',
    default: null
  },
  atsJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    default: null
  },
  configuration: {
    type: {
      type: String,
      required: true,
      enum: ['BEHAVIORAL', 'TECHNICAL', 'SYSTEM_DESIGN', 'GENERAL']
    },
    domain: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
    },
    targetSkill: {
      type: String,
      default: null
    },
    company: {
      type: String,
      default: null,
      maxlength: 100
    },
    role: {
      type: String,
      default: null,
      maxlength: 150
    }
  },
  status: {
    type: String,
    enum: ['CONFIGURING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'],
    default: 'CONFIGURING'
  },
  isTemplateDriven: {
    type: Boolean,
    default: false
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewTemplate',
    default: null
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    default: null
  },
  maxQuestions: {
    type: Number,
    default: 5
  },
  templateQuestions: {
    type: [questionSchema],
    default: []
  },
  questions: {
    type: [questionSchema],
    default: []
  },
  reportStatus: {
    type: String,
    enum: ['PENDING', 'GENERATED', 'FAILED'],
    default: 'PENDING'
  },
  reportError: {
    type: String,
    default: null
  },
  overallScore: {
    type: Number,
    default: null
  },
  feedbackSummary: {
    type: String,
    default: null
  },
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  recommendations: {
    type: [String],
    default: []
  },
  expiresAt: {
    type: Date,
    default: null
  },
  completionReason: {
    type: String,
    enum: ['SUBMITTED', 'TIME_EXPIRED', 'FORCE_STOPPED'],
    default: 'SUBMITTED'
  }
}, { timestamps: true });

// Prevent IDOR: always query with { _id: sessionId, user: userId }
// Mongoose doesn't strictly enforce this at the schema level for reads, 
// so controllers MUST include the user ObjectId in queries.

interviewSessionSchema.index({ batchId: 1, templateId: 1, status: 1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
