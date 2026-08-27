const mongoose = require('mongoose');
const { generateNextQuestion } = require('./src/services/questionService');
const InterviewSession = require('./src/models/InterviewSession');
const User = require('./src/models/User');
const geminiService = require('./src/services/geminiService');

// Mock Gemini Service to track calls
let geminiCallCount = 0;
const originalGenerateText = geminiService.generateText;

geminiService.generateText = async (prompt, options) => {
  geminiCallCount++;
  if (global.SIMULATE_GEMINI_FAILURE) {
    throw new Error('SIMULATED AI PROVIDER UNAVAILABLE OR TIMEOUT');
  }
  return {
    overall_score: 85,
    summary: "Strong candidate with good theoretical knowledge.",
    strengths: ["JavaScript fundamentals"],
    weaknesses: ["None"],
    recommendations: ["Keep it up"],
    question_evaluations: [
      { score: 80, feedback: "Good." },
      { score: 90, feedback: "Excellent." },
      { score: 85, feedback: "Solid." },
      { score: 85, feedback: "Solid." },
      { score: 85, feedback: "Solid." }
    ]
  };
};

// Directly require controllers to mock Express req/res
const {
  createInterviewSession,
  generateQuestion,
  submitAnswer,
  completeInterview,
  retryReport
} = require('./src/controllers/interviewController');

const mockReq = (body = {}, params = {}, user = {}) => ({
  body,
  params,
  user
});

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

async function runTest() {
  console.log('--- SPRINT 11 RUNTIME VERIFICATION ---');
  await mongoose.connect('mongodb://127.0.0.1:27017/interview_ai');
  console.log('Connected to DB');

  // Create test user
  let user = await User.findOne({ email: 'test11@example.com' });
  if (!user) {
    user = await User.create({
      email: 'test11@example.com',
      passwordHash: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
  }

  // --- TEST A & B & C & D ---
  console.log('\\n>>> TEST A: GEMINI COMPLETELY UNAVAILABLE');
  geminiCallCount = 0;
  global.SIMULATE_GEMINI_FAILURE = true;

  const reqCreate = mockReq({
    configuration: {
      type: 'TECHNICAL',
      domain: 'Full Stack',
      difficulty: 'INTERMEDIATE'
    }
  }, {}, { _id: user._id });
  const resCreate = mockRes();
  
  await createInterviewSession(reqCreate, resCreate);
  if (!resCreate.data.success) throw new Error('Create failed');
  const sessionId = resCreate.data.data._id.toString();
  console.log('Session Created:', sessionId);

  // Generate 5 questions and answer them
  for (let i = 1; i <= 5; i++) {
    const reqGen = mockReq({}, { id: sessionId }, { _id: user._id });
    const resGen = mockRes();
    await generateQuestion(reqGen, resGen);
    if (!resGen.data.success) throw new Error(`Generate Q${i} failed: ` + JSON.stringify(resGen.data));
    
    console.log(`Q${i} Generated:`, resGen.data.data.text);

    const reqSub = mockReq({ answer: `This is my robust answer to question ${i}` }, { id: sessionId }, { _id: user._id });
    const resSub = mockRes();
    await submitAnswer(reqSub, resSub);
    if (!resSub.data.success) throw new Error(`Submit A${i} failed: ` + JSON.stringify(resSub.data));
    
    console.log(`A${i} Submitted, Status:`, resSub.data.data.status);
  }

  console.log('Gemini calls during live interview loop:', geminiCallCount);
  if (geminiCallCount !== 0) throw new Error('GEMINI WAS CALLED DURING LIVE INTERVIEW!');

  console.log('\\n>>> TEST D: GEMINI FAILURE DURING FINAL REPORT');
  const reqComp = mockReq({}, { id: sessionId }, { _id: user._id });
  const resComp = mockRes();
  await completeInterview(reqComp, resComp);
  
  console.log('Complete Response:', resComp.data);
  if (resComp.data.success) throw new Error('Expected Gemini to fail!');
  
  const failedSession = await InterviewSession.findById(sessionId);
  console.log('Session Status after failure:', failedSession.status);
  if (failedSession.status !== 'COMPLETED') throw new Error('Session should be COMPLETED even if report fails');
  if (failedSession.overallScore !== undefined && failedSession.overallScore !== null) throw new Error('Fake score generated!');

  console.log('\\n>>> TEST E: REPORT RETRY');
  global.SIMULATE_GEMINI_FAILURE = false; // Restore Gemini
  geminiCallCount = 0; // Reset to count just the retry call
  
  // Real gemini call for the report
  const reqRetry = mockReq({}, { id: sessionId }, { _id: user._id });
  const resRetry = mockRes();
  await retryReport(reqRetry, resRetry);
  
  console.log('Retry Response Success:', resRetry.data.success);
  if (!resRetry.data.success) throw new Error('Retry failed: ' + JSON.stringify(resRetry.data));
  
  const completedSession = await InterviewSession.findById(sessionId);
  console.log('Final Score:', completedSession.overallScore);
  console.log('Total Gemini Calls:', geminiCallCount);
  if (geminiCallCount !== 1) throw new Error('Expected EXACTLY 1 Gemini call total.');

  console.log('\\n--- TESTS PASSED SUCCESSFULLY ---');
  await mongoose.connection.close();
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
