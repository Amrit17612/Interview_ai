const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  bundleId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // e.g., 'comp_google_01'
  type: { 
    type: String, 
    enum: ['COMPANY', 'DOMAIN'], 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  category: { 
    type: String 
  }, // e.g., 'FAANG', 'Engineering'
  price: { 
    type: Number, 
    required: true, 
    default: 0 
  }, 
  originalPrice: { 
    type: Number 
  },
  features: [{ 
    type: String 
  }],
  iconType: { 
    type: String 
  }, // e.g., 'google', 'amazon', 'frontend'
  isPopular: { 
    type: Boolean, 
    default: false 
  },
  
  // Array of predefined InterviewTemplates acting as the "Modules"
  modules: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'InterviewTemplate' 
  }],

  // Legacy interviewConfig to preserve UI compatibility for older hardcoded types
  // until fully migrated to dynamic modules.
  interviewConfig: {
    company: String,
    domain: String,
    role: String,
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
    },
    allowedTypes: [{
      type: String,
      enum: ['TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'GENERAL']
    }]
  },
  
  active: { 
    type: Boolean, 
    default: true 
  },
  visibility: { 
    type: String, 
    enum: ['PUBLIC', 'PRIVATE'], 
    default: 'PUBLIC' 
  },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

bundleSchema.index({ type: 1, active: 1 });
bundleSchema.index({ visibility: 1 });

module.exports = mongoose.model('Bundle', bundleSchema);
