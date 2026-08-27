const mongoose = require('mongoose');
const InterviewSession = require('./src/models/InterviewSession');
const User = require('./src/models/User');
const { getInterviewSessions, compareInterviews } = require('./src/controllers/interviewController');

async function runQA() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/interviu-test-qa');
    console.log('Connected to QA DB');
    await InterviewSession.deleteMany({});
    await User.deleteMany({});

    // Create a mock user
    const user = await User.create({ firstName: 'QA', lastName: 'User', email: 'qa@test.com', passwordHash: 'hash123' });
    const userId = user._id;

    // Create another user for IDOR check
    const user2 = await User.create({ firstName: 'QA2', lastName: 'User2', email: 'qa2@test.com', passwordHash: 'hash123' });

    // Mock Req/Res
    const mockRes = () => {
      const res = {};
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (data) => { res.data = data; return res; };
      return res;
    };

    console.log('\n--- PART A: HISTORY PAGINATION & EMPTY STATE ---');
    let res = mockRes();
    await getInterviewSessions({ user: { _id: userId }, query: {} }, res);
    console.log('Empty History:', res.data.data.interviews.length === 0 ? 'PASS' : 'FAIL');
    
    // Seed 15 interviews
    const sessions = [];
    for(let i=0; i<15; i++) {
      sessions.push({
        user: userId,
        status: i % 3 === 0 ? 'COMPLETED' : (i % 2 === 0 ? 'IN_PROGRESS' : 'ABANDONED'),
        configuration: {
          type: i % 2 === 0 ? 'TECHNICAL' : 'BEHAVIORAL',
          domain: i % 2 === 0 ? 'Frontend' : 'Backend',
          difficulty: 'INTERMEDIATE',
          targetSkill: i === 0 ? 'React' : null
        },
        overallScore: i % 3 === 0 ? (i * 10) : undefined,
        createdAt: new Date(Date.now() - i * 100000)
      });
    }
    const inserted = await InterviewSession.insertMany(sessions);

    res = mockRes();
    await getInterviewSessions({ user: { _id: userId }, query: { page: 1, limit: 10 } }, res);
    console.log('Page 1 Count:', res.data.data.interviews.length === 10 ? 'PASS' : 'FAIL');
    console.log('Pagination Metadata:', res.data.data.pagination.total === 15 ? 'PASS' : 'FAIL');

    console.log('\n--- PART B: SEARCH QA ---');
    res = mockRes();
    await getInterviewSessions({ user: { _id: userId }, query: { search: 'React' } }, res);
    console.log('Search Target Skill:', res.data.data.interviews.length === 1 ? 'PASS' : 'FAIL');

    console.log('\n--- PART C: FILTER QA ---');
    res = mockRes();
    await getInterviewSessions({ user: { _id: userId }, query: { status: 'COMPLETED' } }, res);
    console.log('Filter Status (COMPLETED):', res.data.data.interviews.every(i => i.status === 'COMPLETED') ? 'PASS' : 'FAIL');

    console.log('\n--- PART M: IDOR/SECURITY QA ---');
    // Try to get another user's session in compare
    const otherUserSession = await InterviewSession.create({
      user: user2._id,
      status: 'COMPLETED',
      configuration: { type: 'TECHNICAL', domain: 'Test', difficulty: 'BEGINNER' },
      overallScore: 90
    });

    res = mockRes();
    await compareInterviews({ 
      user: { _id: userId }, 
      query: { first: inserted[0]._id.toString(), second: otherUserSession._id.toString() } 
    }, res);
    console.log('IDOR Comparison Check (404 expected):', res.statusCode === 404 ? 'PASS' : 'FAIL');

    console.log('\n--- PART H-K: COMPARISON QA ---');
    // Compare two completed from same user
    const completed = inserted.filter(i => i.status === 'COMPLETED');
    res = mockRes();
    await compareInterviews({
      user: { _id: userId },
      query: { first: completed[0]._id.toString(), second: completed[1]._id.toString() }
    }, res);
    console.log('Comparison Successful:', res.statusCode === 200 ? 'PASS' : 'FAIL');
    if (res.data && res.data.data) {
       console.log('Score Analysis exists:', !!res.data.data.scoreAnalysis ? 'PASS' : 'FAIL');
       console.log('Strength Comparison exists:', !!res.data.data.strengthComparison ? 'PASS' : 'FAIL');
       console.log('Weakness Comparison exists:', !!res.data.data.weaknessComparison ? 'PASS' : 'FAIL');
    }

    console.log('\n--- PART L: INVALID URL QA ---');
    res = mockRes();
    await compareInterviews({ user: { _id: userId }, query: { first: 'invalid-id', second: 'invalid-id' } }, res);
    console.log('Invalid IDs handle safely (400 expected):', res.statusCode === 400 ? 'PASS' : 'FAIL');

    await mongoose.disconnect();
    console.log('\nQA Complete');
  } catch (err) {
    console.error('QA Script Error:', err);
    process.exit(1);
  }
}

runQA();