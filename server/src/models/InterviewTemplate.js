const mongoose = require('mongoose');

const interviewTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  category: { 
    type: String, 
    enum: ['TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'GENERAL'],
    required: true
  },
  domain: { type: String },
  difficulty: { 
    type: String, 
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
    required: true
  },
  visibility: { 
    type: String, 
    enum: ['PUBLIC', 'PRIVATE', 'BUNDLE_ONLY'], 
    default: 'PRIVATE' 
  },
  targetBundleId: { 
    type: String, 
    default: null 
  },
  questions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question' 
  }],
  estimatedDuration: { type: String },
  tags: [{ type: String }],
  status: { 
    type: String, 
    enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], 
    default: 'DRAFT' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
interviewTemplateSchema.index({ status: 1, visibility: 1 });
interviewTemplateSchema.index({ category: 1, domain: 1 });
interviewTemplateSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('InterviewTemplate', interviewTemplateSchema);
