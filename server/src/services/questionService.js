const Question = require('../models/Question');
const { COMPANY_DICTIONARY } = require('../utils/companyDictionary');
const { extractSkills } = require('../utils/skillExtractor');

/**
 * Question Selection Service
 * Responsible for deterministically selecting questions without requiring Gemini for every request.
 */

const getNextQuestion = async (session, resumeSkills = [], atsSkills = []) => {
  const askedQuestionIds = session.questions.map(q => q.questionId).filter(id => id != null);
  
  // Filter questions by session configuration
  const validQuestions = await Question.find({
    status: 'ACTIVE',
    category: { $ne: 'follow-up' },
    type: session.configuration.type,
    difficulty: session.configuration.difficulty
  }).lean();

  // If we can't find exact matches for type and difficulty, relax constraints.
  let pool = validQuestions.length > 0 ? validQuestions : await Question.find({
    status: 'ACTIVE',
    category: { $ne: 'follow-up' }
  }).lean();
  
  // Remove already asked questions to prevent duplicates
  pool = pool.filter(q => {
    const isAsked = askedQuestionIds.includes(q.legacyId) || askedQuestionIds.includes(q._id.toString());
    return !isAsked;
  });

  if (pool.length === 0) {
    // If somehow all questions are exhausted, just return a generic fallback
    return {
      id: `fallback-${Date.now()}`,
      text: "Could you summarize your core professional strengths and how they align with this role?",
      needsAI: false
    };
  }

  // Phase 2 Deterministic Ranking
  const companyProfile = session.configuration.company ? COMPANY_DICTIONARY[session.configuration.company] : null;
  const companySkills = companyProfile ? companyProfile.emphasizedSkills || [] : [];
  const roleSkills = session.configuration.role ? extractSkills(session.configuration.role) : [];

  const scoredPool = pool.map(q => {
    let score = 0;
    
    // Baseline +1 if matches domain config exactly
    if (q.domains && q.domains.includes(session.configuration.domain)) score += 1;

    const qSkills = q.skills || [];
    
    qSkills.forEach(skill => {
      const inResume = resumeSkills.includes(skill);
      const inAts = atsSkills.includes(skill);
      const inCompany = companySkills.includes(skill);
      const inRole = roleSkills.includes(skill);

      if (inResume && inAts) {
        score += 5; // Matches both Contexts
      } else if (inAts) {
        score += 3; // Matches ATS primarily
      } else if (inResume) {
        score += 2; // Matches Resume primarily
      }
      
      if (inCompany) {
        score += 10; // Moderate boost for company context
      }
      
      if (inRole) {
        score += 5; // Small boost for role context
      }
    });

    const TARGET_SKILL_PRIORITY_BOOST = 50;
    if (session.configuration.targetSkill && qSkills.includes(session.configuration.targetSkill)) {
      score += TARGET_SKILL_PRIORITY_BOOST;
    }

    return { ...q, _matchScore: score };
  });

  // Sort by highest score first
  scoredPool.sort((a, b) => b._matchScore - a._matchScore);

  // Take the highest score
  const highestScore = scoredPool[0]._matchScore;
  
  // Filter to keep only the ones tied for the highest score
  const bestQuestions = scoredPool.filter(q => q._matchScore === highestScore);

  // Deterministically select among ties using modulo to ensure pseudo-random but deterministic based on length
  const nextIndex = session.questions.length % bestQuestions.length;
  const selected = bestQuestions[nextIndex];

  return {
    id: selected.legacyId || selected._id.toString(),
    text: selected.text,
    needsAI: false
  };
};

/**
 * Heuristic to evaluate answer quality based on expected points coverage.
 */
const evaluateAnswerQuality = (answer, expectedPoints) => {
  if (!answer || answer.trim().length < 20) {
    return 'weak';
  }

  if (!expectedPoints || expectedPoints.length === 0) {
    return 'neutral';
  }

  const normalizedAnswer = answer.toLowerCase();
  
  // Tokenize words, removing very short stop words
  const words = normalizedAnswer.split(/[^a-z0-9]+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'with', 'by']);
  const meaningfulWords = words.filter(w => w.length > 2 && !stopWords.has(w));
  
  if (meaningfulWords.length < 5) {
    return 'weak';
  }

  let matchCount = 0;
  
  expectedPoints.forEach(point => {
    const pWords = point.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !stopWords.has(w));
    // If the answer contains at least one meaningful keyword from the expected point
    const hasMatch = pWords.some(pw => meaningfulWords.includes(pw));
    if (hasMatch) {
      matchCount++;
    }
  });

  const matchRatio = matchCount / expectedPoints.length;

  if (matchRatio >= 0.6) return 'strong';
  if (matchRatio >= 0.3) return 'neutral';
  return 'weak';
};

/**
 * Gets a deterministic follow-up if applicable based on the local heuristic.
 */
const getFollowUpQuestion = async (questionId, userAnswer, askedQuestionIds = []) => {
  let originalQuestion = await Question.findOne({ legacyId: questionId })
    .populate('followUps.weak')
    .populate('followUps.neutral')
    .populate('followUps.strong')
    .lean();

  if (!originalQuestion) {
    originalQuestion = await Question.findById(questionId)
      .populate('followUps.weak')
      .populate('followUps.neutral')
      .populate('followUps.strong')
      .lean();
  }

  if (!originalQuestion || !originalQuestion.followUps) {
    return null;
  }

  const targetCondition = evaluateAnswerQuality(userAnswer, originalQuestion.expectedPoints);

  const filterUnasked = (branch) => {
    if (!branch) return [];
    return branch.filter(q => {
      const isAsked = askedQuestionIds.includes(q.legacyId) || askedQuestionIds.includes(q._id.toString());
      return !isAsked;
    });
  };

  const validWeak = filterUnasked(originalQuestion.followUps.weak);
  const validNeutral = filterUnasked(originalQuestion.followUps.neutral);
  const validStrong = filterUnasked(originalQuestion.followUps.strong);

  let followUpQuestion = null;

  if (targetCondition === 'weak' && validWeak.length > 0) {
    followUpQuestion = validWeak[0];
  } else if (targetCondition === 'strong' && validStrong.length > 0) {
    followUpQuestion = validStrong[0];
  } else if (targetCondition === 'neutral' && validNeutral.length > 0) {
    followUpQuestion = validNeutral[0];
  }

  if (!followUpQuestion) {
    // Fallback order: NEUTRAL -> WEAK -> STRONG
    if (validNeutral.length > 0) {
      followUpQuestion = validNeutral[0];
    } else if (validWeak.length > 0) {
      followUpQuestion = validWeak[0];
    } else if (validStrong.length > 0) {
      followUpQuestion = validStrong[0];
    }
  }

  if (followUpQuestion) {
    return {
      id: followUpQuestion.legacyId || followUpQuestion._id.toString(),
      text: followUpQuestion.text,
      needsAI: false
    };
  }

  return null;
};

module.exports = {
  getNextQuestion,
  getFollowUpQuestion,
  evaluateAnswerQuality
};
