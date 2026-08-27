const library = require('./src/data/questionLibrary.json');
const { SKILL_DICTIONARY } = require('./src/utils/skillExtractor');
const mongoose = require('mongoose');

console.log('--- 1. QUESTION LIBRARY QUALITY AUDIT ---');
console.log(`Total questions: ${library.length}`);

let duplicateIds = 0;
let invalidDomains = 0;
let invalidTypes = 0;
let invalidDifficulties = 0;
let emptyTexts = 0;
let invalidSkills = 0;
let brokenFollowUps = 0;
let circularFollowUps = 0;
let semanticRepetition = 0; // Extremely naive check for identical questions

const ids = new Set();
const validSkillsList = new Set(Object.keys(SKILL_DICTIONARY));
const textSet = new Set();

library.forEach(q => {
  if (ids.has(q.id)) duplicateIds++;
  ids.add(q.id);

  if (q.domain !== 'Software Engineering') invalidDomains++;
  if (!['BEHAVIORAL', 'TECHNICAL', 'SYSTEM_DESIGN', 'GENERAL'].includes(q.type)) invalidTypes++;
  if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(q.difficulty)) invalidDifficulties++;
  if (!q.question || q.question.length < 10) emptyTexts++;

  if (textSet.has(q.question)) semanticRepetition++;
  textSet.add(q.question);

  if (q.skills) {
    q.skills.forEach(s => {
      if (!validSkillsList.has(s)) invalidSkills++;
    });
  }

  if (q.followUps) {
    const allRefs = [...(q.followUps.strong || []), ...(q.followUps.neutral || []), ...(q.followUps.weak || [])];
    allRefs.forEach(ref => {
      if (!library.find(l => l.id === ref)) brokenFollowUps++;
      if (ref === q.id) circularFollowUps++; // basic self reference check
    });
  }
});

console.log(`Duplicate IDs: ${duplicateIds}`);
console.log(`Invalid Domains: ${invalidDomains}`);
console.log(`Invalid Types: ${invalidTypes}`);
console.log(`Invalid Difficulties: ${invalidDifficulties}`);
console.log(`Empty/Short Texts: ${emptyTexts}`);
console.log(`Invalid Skills: ${invalidSkills}`);
console.log(`Broken FollowUps: ${brokenFollowUps}`);
console.log(`Circular FollowUps: ${circularFollowUps}`);
console.log(`Semantic Repetition (Exact Match): ${semanticRepetition}`);

console.log('\\n--- 2. QUESTION DISTRIBUTION AUDIT ---');
const typeCounts = { BEHAVIORAL: 0, TECHNICAL: 0, SYSTEM_DESIGN: 0, GENERAL: 0 };
const diffCounts = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 };
const skillCounts = {};

library.forEach(q => {
  // Only count primary questions for distribution
  if (q.category !== 'follow-up') {
    typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
    diffCounts[q.difficulty] = (diffCounts[q.difficulty] || 0) + 1;
    if (q.skills) {
      q.skills.forEach(s => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    }
  }
});

console.log('Primary Types:', typeCounts);
console.log('Primary Difficulties:', diffCounts);
console.log('Primary Skills:', skillCounts);

console.log('\\n--- 6. DATABASE AUDIT ---');
// Let's connect to mongoose and check indexes
const runDbAudit = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/interviu-ai');
    const User = require('./src/models/User');
    const Resume = require('./src/models/Resume');
    const JobDescription = require('./src/models/JobDescription');

    const resIndexes = await Resume.collection.indexes();
    const jobIndexes = await JobDescription.collection.indexes();

    let resUserIdCount = 0;
    resIndexes.forEach(idx => {
      if (idx.key.userId === 1 && Object.keys(idx.key).length === 1) {
        resUserIdCount++;
      }
    });

    let jobUserIdCount = 0;
    jobIndexes.forEach(idx => {
      if (idx.key.userId === 1 && Object.keys(idx.key).length === 1) {
        jobUserIdCount++;
      }
    });

    console.log(`Resume model userId standalone indexes: ${resUserIdCount}`);
    console.log(`JobDescription model userId standalone indexes: ${jobUserIdCount}`);
    
    // Check if we have fake data
    const fakeUsers = await User.countDocuments({ email: /example|fake|johndoe|test/i });
    console.log(`Fake users detected: ${fakeUsers}`);

    await mongoose.disconnect();
  } catch(e) {
    console.error('DB Audit failed:', e.message);
  }
};

runDbAudit();
