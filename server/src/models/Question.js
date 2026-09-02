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
  legacyId: { 
    type: String, 
    sparse: true,
    unique: true,
    trim: true
  },
  category: { 
    type: String,
    enum: ['primary', 'follow-up'],
    default: 'primary'
  },
  skills: [{ type: String }],
  expectedPoints: [{ type: String }],
  tags: [{ type: String }],
  followUps: {
    weak: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    neutral: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    strong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
  },
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
questionSchema.pre('save', async function() {
  if (!this.isModified('followUps')) {
    return;
  }
  
  if (!this.followUps || 
      (this.followUps.weak.length === 0 && 
       this.followUps.neutral.length === 0 && 
       this.followUps.strong.length === 0)) {
    return;
  }

  // Combine all branches for cycle detection
  const allFollowUps = [
    ...(this.followUps.weak || []),
    ...(this.followUps.neutral || []),
    ...(this.followUps.strong || [])
  ];

  // Direct self-reference check
  if (allFollowUps.some(id => id && id.toString() === this._id.toString())) {
    throw new Error('Question cannot be a follow-up to itself.');
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
        const child = await mongoose.model('Question').findById(id).select('followUps').lean();
        if (child && child.followUps) {
          const childFollowUps = [
            ...(child.followUps.weak || []),
            ...(child.followUps.neutral || []),
            ...(child.followUps.strong || [])
          ];
          if (childFollowUps.length > 0) {
            const hasCycle = await checkCycle(childFollowUps);
            if (hasCycle) return true;
          }
        }
      }
    }
    return false;
  };

  try {
    const hasCycle = await checkCycle(allFollowUps);
    if (hasCycle) {
      throw new Error('Adding this follow-up would create a circular reference cycle.');
    }
  } catch (error) {
    throw error;
  }
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
