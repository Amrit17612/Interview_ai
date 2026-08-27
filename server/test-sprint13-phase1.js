const mongoose = require('mongoose');
const { completeInterview, retryReport, generateQuestion, submitAnswer } = require('./src/controllers/interviewController');
const InterviewSession = require('./src/models/InterviewSession');
const User = require('./src/models/User');
const geminiService = require('./src/services/geminiService');

let originalGenerateText;
let geminiCallCount = 0;
let forceGeminiFail = false;

// Mock Response
const mockReportResponse = {
  overall_score: 85,
  summary: "Great candidate with strong behavioral responses.",
  strengths: ["Communication", "Problem solving"],
  weaknesses: ["Technical depth in React context"],
  recommendations: ["Review React lifecycle hooks", "Practice system design"],
  question_evaluations: [
    { score: 90, feedback: "Good answer" },
    { score: 80, feedback: "Decent answer" }
  ]
};

async function runTests() {
  console.log('--- STARTING SPRINT 13 PHASE 1 TESTS ---\n');
  process.env.GEMINI_API_KEY = 'test_key';

  await mongoose.connect('mongodb://localhost:27017/interviu');

  const userA = await User.create({ firstName: 'User', lastName: 'A', email: 'usera13@test.com', passwordHash: 'hash' });
  const userB = await User.create({ firstName: 'User', lastName: 'B', email: 'userb13@test.com', passwordHash: 'hash' });

  originalGenerateText = geminiService.generateText;
  geminiService.generateText = async () => {
    geminiCallCount++;
    if (forceGeminiFail) {
      throw new Error('PROVIDER_ERROR: Simulated Gemini timeout or failure');
    }
    return mockReportResponse;
  };

  // Helper to create a request/response mock
  const mockReqRes = (userId, params = {}, body = {}) => {
    const req = { user: { _id: userId }, params, body };
    let resStatus = 200;
    let resJsonData = null;
    const res = {
      status: (s) => { resStatus = s; return res; },
      json: (d) => { resJsonData = d; return res; }
    };
    return { req, res, getStatus: () => resStatus, getJson: () => resJsonData };
  };

  try {
    // SETUP: Create a 5-question completed session without calling gemini yet
    const session = await InterviewSession.create({
      user: userA._id,
      configuration: { type: 'BEHAVIORAL', domain: 'Frontend', difficulty: 'BEGINNER' },
      status: 'IN_PROGRESS',
      questions: [
        { index: 0, text: 'Q1', userAnswer: 'A1', status: 'ANSWERED' },
        { index: 1, text: 'Q2', userAnswer: 'A2', status: 'ANSWERED' }
      ]
    });

    console.log('TEST 1: Complete a normal interview');
    let { req, res, getStatus, getJson } = mockReqRes(userA._id, { id: session._id });
    await completeInterview(req, res);
    
    let result = getJson();
    if (getStatus() === 200 && result.data.status === 'COMPLETED' && result.data.overallScore === 85 && result.data.strengths.length === 2 && result.data.recommendations.length === 2) {
      console.log('✓ TEST 1 PASSED: Report fields properly generated and returned.');
    } else {
      console.log('✗ TEST 1 FAILED');
      console.log(result);
    }

    console.log('\nTEST 2: Retrieve the same session again (Persistence)');
    const retrievedSession = await InterviewSession.findById(session._id);
    if (retrievedSession.strengths[0] === "Communication" && retrievedSession.recommendations.length === 2) {
      console.log('✓ TEST 2 PASSED: Report fields successfully persisted in MongoDB.');
    } else {
      console.log('✗ TEST 2 FAILED');
    }

    console.log('\nTEST 3: Simulate Gemini failure');
    const failSession = await InterviewSession.create({
      user: userA._id,
      configuration: { type: 'BEHAVIORAL', domain: 'Frontend', difficulty: 'BEGINNER' },
      status: 'IN_PROGRESS',
      questions: [ { index: 0, text: 'Q1', userAnswer: 'A1', status: 'ANSWERED' } ]
    });
    forceGeminiFail = true;
    let failMock = mockReqRes(userA._id, { id: failSession._id });
    await completeInterview(failMock.req, failMock.res);
    forceGeminiFail = false;

    if (failMock.getStatus() === 500) {
      const savedFailSession = await InterviewSession.findById(failSession._id);
      if (savedFailSession.status === 'COMPLETED' && savedFailSession.overallScore === null) {
        console.log('✓ TEST 3 PASSED: Gemini failure handled cleanly. Score remains null, status COMPLETED.');
      } else {
        console.log('✗ TEST 3 FAILED: Incorrect state saved.');
      }
    } else {
      console.log('✗ TEST 3 FAILED: Did not return 500.');
    }

    console.log('\nTEST 4: Retry report successfully');
    const startCount = geminiCallCount;
    let retryMock = mockReqRes(userA._id, { id: failSession._id });
    await retryReport(retryMock.req, retryMock.res);
    if (retryMock.getStatus() === 200 && retryMock.getJson().data.overallScore === 85 && geminiCallCount === startCount + 1) {
      console.log('✓ TEST 4 PASSED: Retry generated report successfully. Only 1 Gemini call made.');
    } else {
      console.log('✗ TEST 4 FAILED');
    }

    console.log('\nTEST 5: Retry an already valid report');
    const startCount2 = geminiCallCount;
    let retryValidMock = mockReqRes(userA._id, { id: session._id });
    await retryReport(retryValidMock.req, retryValidMock.res);
    if (retryValidMock.getStatus() === 200 && geminiCallCount === startCount2) {
      console.log('✓ TEST 5 PASSED: Valid report retried. ZERO Gemini calls made.');
    } else {
      console.log('✗ TEST 5 FAILED');
    }

    console.log('\nTEST 6: IDOR (User B attempts to complete User A session)');
    let idorMock = mockReqRes(userB._id, { id: session._id });
    await completeInterview(idorMock.req, idorMock.res);
    if (idorMock.getStatus() === 404) {
      console.log('✓ TEST 6 PASSED: IDOR prevented. Session not found.');
    } else {
      console.log('✗ TEST 6 FAILED');
    }

    console.log('\nTEST 7: Legacy session without new fields');
    // Mongoose handles this automatically, but let's just make sure
    // finding and returning it doesn't crash.
    const legacySession = await InterviewSession.collection.insertOne({
      user: userA._id,
      configuration: { type: 'BEHAVIORAL', domain: 'Frontend', difficulty: 'BEGINNER' },
      status: 'COMPLETED',
      overallScore: 90,
      feedbackSummary: "Good",
      questions: []
    });
    
    const retrievedLegacy = await InterviewSession.findById(legacySession.insertedId);
    if (retrievedLegacy.overallScore === 90 && Array.isArray(retrievedLegacy.strengths) && retrievedLegacy.strengths.length === 0) {
      console.log('✓ TEST 7 PASSED: Legacy session handled correctly with default arrays.');
    } else {
      console.log('✗ TEST 7 FAILED');
    }

  } finally {
    geminiService.generateText = originalGenerateText;
    await User.deleteMany({ email: { $in: ['usera13@test.com', 'userb13@test.com'] } });
    await InterviewSession.deleteMany({ user: { $in: [userA._id, userB._id] } });
    await mongoose.connection.close();
    console.log('\n--- TESTS COMPLETED ---');
  }
}

runTests();
