const { getNextQuestion, getFollowUpQuestion } = require('./src/services/questionService');

console.log('--- TEST: getNextQuestion ---');
const session = {
  configuration: { type: 'BEHAVIORAL', difficulty: 'BEGINNER' },
  questions: []
};

const q1 = getNextQuestion(session);
console.log('Q1:', q1);
session.questions.push({ questionId: q1.id });

console.log('\\n--- TEST: getFollowUpQuestion (needs_more_detail / neutral) ---');
const f1 = getFollowUpQuestion(q1.id, 50); // <70 usually maps to weak, but for gen-beh-1 there is no weak, there's only neutral. wait, gen-beh-1 followUp has neutral
console.log('FollowUp for weak/neutral:', f1);

console.log('\\n--- TEST: getNextQuestion (duplicate prevention) ---');
const q2 = getNextQuestion(session);
console.log('Q2 (Should be different from Q1 if multiple exist):', q2);

console.log('\\nAll basic questionService functions ran without crashing.');
