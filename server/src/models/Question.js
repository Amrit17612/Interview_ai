const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    default: null,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'GENERAL'], 
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'], 
    required: true 
  },
  companies: [{ type: String }],
  domains: [{ type: String }],
  roles: [{ type: String }],
  expectedPoints: [{ type: String }],
  tags: [{ type: String }],
  followUps: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question' 
  }],
  status: { 
    type: String, 
    enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], 
    default: 'DRAFT' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true 
});

// Indexes
// 1. Text index for search
questionSchema.index({ text: 'text', tags: 'text' });
// 2. Compound index for default admin list sorting/filtering
questionSchema.index({ status: 1, updatedAt: -1 });
questionSchema.index({ type: 1, status: 1 });

/**
 * Cycle detection to prevent indirect circular follow-ups.
 * e.g., A -> B -> C -> A
 */
questionSchema.pre('save', async function(next) {
  if (!this.isModified('followUps')) {
    return next();
  }
  
  if (!this.followUps || this.followUps.length === 0) {
    return next();
  }

  // Direct self-reference check
  if (this.followUps.some(id => id.toString() === this._id.toString())) {
    return next(new Error('Question cannot be a follow-up to itself.'));
  }

  // Graph traversal to detect indirect cycles
  const currentId = this._id.toString();
  const visited = new Set();
  
  // DFS to check if currentId is reachable from any of the new followUps
  const checkCycle = async (questionIds) => {
    if (!questionIds || questionIds.length === 0) return false;
    
    for (const id of questionIds) {
      const idStr = id.toString();
      
      if (idStr === currentId) return true; // Cycle detected
      
      if (!visited.has(idStr)) {
        visited.add(idStr);
        // Find the child question to get its followUps
        const child = await mongoose.model('Question').findById(id).select('followUps').lean();
        if (child && child.followUps && child.followUps.length > 0) {
          const hasCycle = await checkCycle(child.followUps);
          if (hasCycle) return true;
        }
      }
    }
    return false;
  };

  try {
    const hasCycle = await checkCycle(this.followUps);
    if (hasCycle) {
      return next(new Error('Adding this follow-up would create a circular reference cycle.'));
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
