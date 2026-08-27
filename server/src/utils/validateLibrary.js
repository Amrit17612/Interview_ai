const questionLibrary = require('../data/questionLibrary.json');
const { SKILL_DICTIONARY } = require('./skillExtractor');

const getTokens = (text) => {
  if (!text) return new Set();
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  return new Set(normalized.split(/\s+/).filter(w => w.length > 0));
};

const getJaccardSimilarity = (setA, setB) => {
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

const auditLibrary = (library = questionLibrary) => {
  const ids = new Set();
  const primaryTexts = new Set();
  const followUpTexts = new Set();
  const allTexts = new Map(); // id -> { text, tokens, isFollowUp }
  const validSkills = new Set(Object.keys(SKILL_DICTIONARY));

  const report = {
    errors: [],
    warnings: [],
    stats: {
      total: library.length,
      primaryCount: 0,
      followUpCount: 0,
      duplicateIds: 0,
      duplicatePrimaryTexts: 0,
      duplicateFollowUpTexts: 0,
      brokenReferences: 0,
      circularReferences: 0,
      semanticWarnings: 0,
      domainDistribution: {},
      typeDistribution: {},
      difficultyDistribution: {},
      skillDistribution: {}
    },
    coverage: {}
  };

  const referencedFollowUps = new Set();

  library.forEach((q, index) => {
    if (!q.id) {
      report.errors.push(`Question at index ${index} is missing an 'id'.`);
      return;
    }

    if (ids.has(q.id)) {
      report.errors.push(`Duplicate question ID found: ${q.id}`);
      report.stats.duplicateIds++;
    }
    ids.add(q.id);
  });

  library.forEach((q, index) => {
    if (!q.id) return; // already reported

    const isFollowUp = q.category === 'follow-up';
    if (isFollowUp) {
      report.stats.followUpCount++;
    } else {
      report.stats.primaryCount++; 
    }

    // Record distributions
    if (q.domain) report.stats.domainDistribution[q.domain] = (report.stats.domainDistribution[q.domain] || 0) + 1;
    if (q.type) report.stats.typeDistribution[q.type] = (report.stats.typeDistribution[q.type] || 0) + 1;
    if (q.difficulty) report.stats.difficultyDistribution[q.difficulty] = (report.stats.difficultyDistribution[q.difficulty] || 0) + 1;

    // Validate schema
    if (!q.domain) report.errors.push(`Question ${q.id} is missing 'domain'.`);
    if (!['BEHAVIORAL', 'TECHNICAL', 'SYSTEM_DESIGN', 'GENERAL'].includes(q.type)) {
      report.errors.push(`Question ${q.id} has invalid 'type': ${q.type}`);
    }
    if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(q.difficulty)) {
      report.errors.push(`Question ${q.id} has invalid 'difficulty': ${q.difficulty}`);
    }
    if (!q.category) report.errors.push(`Question ${q.id} is missing 'category'.`);
    
    if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
      report.errors.push(`Question ${q.id} has invalid or empty 'question' text.`);
    } else {
      const normalizedText = q.question.trim().toLowerCase();
      if (isFollowUp) {
        if (followUpTexts.has(normalizedText) || primaryTexts.has(normalizedText)) {
          report.errors.push(`Duplicate follow-up text or collision found in ${q.id}`);
          report.stats.duplicateFollowUpTexts++;
        }
        followUpTexts.add(normalizedText);
      } else {
        if (primaryTexts.has(normalizedText) || followUpTexts.has(normalizedText)) {
          report.errors.push(`Duplicate primary text or collision found in ${q.id}`);
          report.stats.duplicatePrimaryTexts++;
        }
        primaryTexts.add(normalizedText);
      }
      
      allTexts.set(q.id, { text: q.question, tokens: getTokens(q.question), isFollowUp });
    }

    if (!Array.isArray(q.skills)) {
      report.errors.push(`Question ${q.id} has invalid 'skills'. Must be an array.`);
    } else {
      q.skills.forEach(skill => {
        if (!validSkills.has(skill)) {
          report.errors.push(`Question ${q.id} has invalid skill: ${skill}`);
        }
        report.stats.skillDistribution[skill] = (report.stats.skillDistribution[skill] || 0) + 1;
      });
      
      // Build coverage metrics for base questions
      if (!isFollowUp) {
        q.skills.forEach(skill => {
          const key = `${skill}|${q.type}|${q.difficulty}`;
          report.coverage[key] = (report.coverage[key] || 0) + 1;
        });
      }
    }

    if (!q.followUps || typeof q.followUps !== 'object') {
      report.errors.push(`Question ${q.id} is missing or has invalid 'followUps' object.`);
    } else {
      if (!isFollowUp) {
        const strong = q.followUps.strong || [];
        const neutral = q.followUps.neutral || [];
        const weak = q.followUps.weak || [];
        
        if (strong.length !== 1) report.errors.push(`Question ${q.id} must have exactly one strong follow-up.`);
        if (neutral.length !== 1) report.errors.push(`Question ${q.id} must have exactly one neutral follow-up.`);
        if (weak.length !== 1) report.errors.push(`Question ${q.id} must have exactly one weak follow-up.`);
        
        [...strong, ...neutral, ...weak].forEach(fid => {
          if (fid === q.id) {
            report.errors.push(`Question ${q.id} is self-referencing.`);
          }
          referencedFollowUps.add(fid);
        });
      }
    }
  });

  // Second pass: Validate references and circular logic
  library.forEach(q => {
    if (q.category === 'follow-up' && !referencedFollowUps.has(q.id)) {
      report.errors.push(`Orphan follow-up detected: ${q.id}`);
    }

    if (q.followUps) {
      const allFollowUps = [
        ...(q.followUps.strong || []),
        ...(q.followUps.neutral || []),
        ...(q.followUps.weak || [])
      ];
      allFollowUps.forEach(followUpId => {
        if (!ids.has(followUpId)) {
          report.errors.push(`Question ${q.id} references invalid follow-up ID: ${followUpId}`);
          report.stats.brokenReferences++;
        } else {
          const target = library.find(item => item.id === followUpId);
          if (target && target.followUps) {
            const targetFollowUps = [
              ...(target.followUps.strong || []),
              ...(target.followUps.neutral || []),
              ...(target.followUps.weak || [])
            ];
            if (targetFollowUps.includes(q.id)) {
              report.errors.push(`Circular reference detected between ${q.id} and ${followUpId}`);
              report.stats.circularReferences++;
            }
          }
        }
      });
    }
  });

  // Semantic similarity check
  const allIds = Array.from(allTexts.keys());
  for (let i = 0; i < allIds.length; i++) {
    for (let j = i + 1; j < allIds.length; j++) {
      const item1 = allTexts.get(allIds[i]);
      const item2 = allTexts.get(allIds[j]);
      
      const sim = getJaccardSimilarity(item1.tokens, item2.tokens);
      if (sim > 0.70) {
        report.warnings.push(`Semantic similarity warning (${(sim*100).toFixed(1)}%): [${allIds[i]}] <--> [${allIds[j]}]`);
        report.stats.semanticWarnings++;
      }
    }
  }

  return report;
};

const validateLibrary = (library = questionLibrary) => {
  const report = auditLibrary(library);
  if (report.errors.length > 0) {
    throw new Error(`Question Library Validation Failed:\n${report.errors.join('\n')}`);
  }
  return true;
};

module.exports = { validateLibrary, auditLibrary };
