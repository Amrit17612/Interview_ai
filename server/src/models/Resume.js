const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true
    },
    storedFileName: {
      type: String,
      required: true,
      trim: true
    },
    fileType: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    storagePath: {
      type: String,
      required: true,
      trim: true
    },
    parsingStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
    },
    parsedText: {
      type: String,
      default: null
    },
    // New AI Analysis Fields
    analysisStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
    },
    lastAnalyzedAt: {
      type: Date,
      default: null
    },
    analyzedJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
      default: null
    },
    structuredData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    atsScore: {
      type: Number,
      default: null
    },
    qualityScore: {
      type: Number,
      default: null
    },
    atsBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    contentAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    consistencyIssues: {
      type: Array,
      default: []
    },
    formattingIssues: {
      type: Array,
      default: []
    },
    jdAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
// Removed redundant resumeSchema.index({ userId: 1 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
