const questionLibrary = require('../data/questionLibrary.json');
const { validateLibrary } = require('../utils/validateLibrary');
const { COMPANY_DICTIONARY } = require('../utils/companyDictionary');
const { extractSkills } = require('../utils/skillExtractor');

// Validate library strictly on startup
validateLibrary();

/**
 * Question Selection Service
 * Responsible for deterministically selecting questions without requiring Gemini for every request.
 */

const getNextQuestion = (session, resumeSkills = [], atsSkills = []) => {
  const askedQuestionIds = session.questions.map(q => q.questionId).filter(id => id != null);
  
  // Filter questions by session configuration
  const validQuestions = questionLibrary.filter(q => {
    // Only return top level questions, not explicitly marked follow-ups
    if (q.category === 'follow-up') return false;

    return q.type === session.configuration.type && 
           q.difficulty === session.configuration.difficulty;
  });

  // If we can't find exact matches for type and difficulty, relax constraints.
  let pool = validQuestions.length > 0 ? validQuestions : questionLibrary.filter(q => q.category !== 'follow-up');
  
  // Remove already asked questions to prevent duplicates
  pool = pool.filter(q => !askedQuestionIds.includes(q.id));

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
    if (q.domain === session.configuration.domain) score += 1;

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
    id: selected.id,
    text: selected.question,
    needsAI: false
  };
};

/**
 * Gets a deterministic follow-up if applicable based on the evaluation.
 * For now, simple rule: if score < 70, use 'weak_answer' or 'needs_more_detail' follow-up.
 * If score >= 85, use 'strong_answer'. Otherwise 'neutral_answer'.
 */
const getFollowUpQuestion = (questionId, evaluationScore) => {
  const originalQuestion = questionLibrary.find(q => q.id === questionId);
  if (!originalQuestion || !originalQuestion.followUps) {
    return null;
  }

  let targetCondition = 'neutral_answer';
  if (evaluationScore < 70) targetCondition = 'weak_answer';
  else if (evaluationScore >= 85) targetCondition = 'strong_answer';

  let followUpId = null;

  if (targetCondition === 'weak_answer' && originalQuestion.followUps.weak && originalQuestion.followUps.weak.length > 0) {
    followUpId = originalQuestion.followUps.weak[0];
  } else if (targetCondition === 'strong_answer' && originalQuestion.followUps.strong && originalQuestion.followUps.strong.length > 0) {
    followUpId = originalQuestion.followUps.strong[0];
  } else if (targetCondition === 'neutral_answer' && originalQuestion.followUps.neutral && originalQuestion.followUps.neutral.length > 0) {
    followUpId = originalQuestion.followUps.neutral[0];
  }

  if (!followUpId) {
    // Fallback if specific condition isn't defined
    const allFollowUps = [
      ...(originalQuestion.followUps.weak || []),
      ...(originalQuestion.followUps.neutral || []),
      ...(originalQuestion.followUps.strong || [])
    ];
    if (allFollowUps.length > 0) {
      followUpId = allFollowUps[0];
    }
  }

  if (followUpId) {
    const followUpQuestion = questionLibrary.find(q => q.id === followUpId);
    if (followUpQuestion) {
      return {
        id: followUpQuestion.id,
        text: followUpQuestion.question,
        needsAI: false
      };
    }
  }

  return null;
};

module.exports = {
  getNextQuestion,
  getFollowUpQuestion
};
