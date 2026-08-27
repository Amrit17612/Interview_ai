const { auditLibrary } = require('../src/utils/validateLibrary');
const { SKILL_DICTIONARY } = require('../src/utils/skillExtractor');
const questionLibrary = require('../src/data/questionLibrary.json');

const runAudit = () => {
  console.log("==================================================");
  console.log("QUESTION LIBRARY QUALITY REPORT");
  console.log("==================================================\n");

  const report = auditLibrary(questionLibrary);
  const { stats, errors, warnings, coverage } = report;

  console.log(`Primary questions: ${stats.primaryCount}`);
  console.log(`Follow-up questions: ${stats.followUpCount}`);
  console.log(`Total library objects: ${stats.total}\n`);

  console.log(`Duplicate IDs: ${stats.duplicateIds}`);
  console.log(`Duplicate primary text: ${stats.duplicatePrimaryTexts}`);
  console.log(`Duplicate follow-up text: ${stats.duplicateFollowUpTexts}`);
  console.log(`Broken references: ${stats.brokenReferences}`);
  console.log(`Circular references: ${stats.circularReferences}`);
  
  // Note: we might have invalid skills which generate errors. We didn't keep a strict counter in stats, but let's count them from errors if any.
  const invalidSkillsCount = errors.filter(e => e.includes('invalid skill')).length;
  console.log(`Invalid skills: ${invalidSkillsCount}`);

  const invalidDiffCount = errors.filter(e => e.includes('invalid \'difficulty\'')).length;
  console.log(`Invalid difficulty: ${invalidDiffCount}`);
  
  const invalidTypeCount = errors.filter(e => e.includes('invalid \'type\'')).length;
  console.log(`Invalid interview types: ${invalidTypeCount}`);
  
  console.log(`Template similarity warnings: ${stats.semanticWarnings}\n`);

  console.log("Skill coverage:");
  Object.keys(SKILL_DICTIONARY).forEach(skill => {
    const count = stats.skillDistribution[skill] || 0;
    console.log(`${skill}: ${count}`);
  });
  console.log("\nDifficulty:");
  ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].forEach(diff => {
    console.log(`${diff}: ${stats.difficultyDistribution[diff] || 0}`);
  });
  
  console.log("\nInterview Types:");
  ['TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'GENERAL'].forEach(type => {
    console.log(`${type}: ${stats.typeDistribution[type] || 0}`);
  });

  console.log("\n==================================================");
  console.log("COVERAGE MATRIX");
  console.log("==================================================\n");
  
  const skills = Object.keys(SKILL_DICTIONARY);
  const types = ['TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'GENERAL'];
  const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  // Define thresholds
  // We'll say >= 3 is PASS, 1-2 is LOW COVERAGE, 0 is MISSING.
  const getCoverageStatus = (count) => {
    if (count >= 3) return "PASS";
    if (count >= 1) return "LOW COVERAGE";
    return "MISSING";
  };

  skills.forEach(skill => {
    types.forEach(type => {
      difficulties.forEach(diff => {
        const key = `${skill}|${type}|${diff}`;
        const count = coverage[key] || 0;
        console.log(`${skill} + ${type} + ${diff}: ${getCoverageStatus(count)} (${count})`);
      });
    });
  });

  if (warnings.length > 0) {
    console.log("\n==================================================");
    console.log("WARNINGS");
    console.log("==================================================\n");
    warnings.forEach(w => console.log(`- ${w}`));
  }

  if (errors.length > 0) {
    console.log("\n==================================================");
    console.log("ERRORS (STRUCTURAL VALIDATION FAILED)");
    console.log("==================================================\n");
    errors.forEach(e => console.error(`- ${e}`));
    process.exit(1);
  }
};

runAudit();
