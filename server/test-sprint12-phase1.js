const mongoose = require('mongoose');
const InterviewSession = require('./src/models/InterviewSession');
const User = require('./src/models/User');

const { getInterviewStats } = require('./src/controllers/interviewController');

const mockReq = (user = {}) => ({ user });

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
  console.log('--- SPRINT 12 PHASE 1 RUNTIME VERIFICATION ---');
  await mongoose.connect('mongodb://127.0.0.1:27017/interview_ai');
  console.log('Connected to DB');

  // Create test users
  let userA = await User.findOne({ email: 'userA@example.com' });
  if (!userA) {
    userA = await User.create({ email: 'userA@example.com', passwordHash: 'pwd', firstName: 'User', lastName: 'A' });
  }

  let userB = await User.findOne({ email: 'userB@example.com' });
  if (!userB) {
    userB = await User.create({ email: 'userB@example.com', passwordHash: 'pwd', firstName: 'User', lastName: 'B' });
  }

  // Clear existing sessions for test users to ensure clean slate
  await InterviewSession.deleteMany({ user: { $in: [userA._id, userB._id] } });

  // TEST 1: User with no interviews
  console.log('\\n>>> TEST 1: NO INTERVIEWS');
  const req1 = mockReq({ _id: userA._id });
  const res1 = mockRes();
  await getInterviewStats(req1, res1);
  console.log(JSON.stringify(res1.data, null, 2));
  if (res1.data.data.summary.totalInterviews !== 0) throw new Error('Failed Test 1');

  // Populate data for User A
  await InterviewSession.insertMany([
    {
      user: userA._id,
      status: 'COMPLETED',
      configuration: { type: 'TECHNICAL', domain: 'Frontend', difficulty: 'BEGINNER' },
      overallScore: 80,
      createdAt: new Date('2026-08-01')
    },
    {
      user: userA._id,
      status: 'COMPLETED',
      configuration: { type: 'TECHNICAL', domain: 'Frontend', difficulty: 'INTERMEDIATE' },
      overallScore: 90,
      createdAt: new Date('2026-08-02')
    },
    {
      user: userA._id,
      status: 'COMPLETED',
      configuration: { type: 'BEHAVIORAL', domain: 'Leadership', difficulty: 'BEGINNER' },
      overallScore: 70,
      createdAt: new Date('2026-08-03')
    },
    {
      user: userA._id,
      status: 'IN_PROGRESS',
      configuration: { type: 'TECHNICAL', domain: 'Backend', difficulty: 'BEGINNER' },
      createdAt: new Date('2026-08-04')
    },
    {
      user: userA._id,
      status: 'ABANDONED',
      configuration: { type: 'TECHNICAL', domain: 'Backend', difficulty: 'BEGINNER' },
      createdAt: new Date('2026-08-05')
    },
    {
      user: userA._id,
      status: 'COMPLETED',
      configuration: { type: 'TECHNICAL', domain: 'Backend', difficulty: 'BEGINNER' },
      overallScore: null, // Scored failed / null
      createdAt: new Date('2026-08-06')
    }
  ]);

  // Populate data for User B to test IDOR
  await InterviewSession.create({
    user: userB._id,
    status: 'COMPLETED',
    configuration: { type: 'TECHNICAL', domain: 'Fullstack', difficulty: 'EXPERT' },
    overallScore: 100
  });

  // TEST 2: User A stats
  console.log('\\n>>> TEST 2: POPULATED STATS FOR USER A');
  const req2 = mockReq({ _id: userA._id });
  const res2 = mockRes();
  await getInterviewStats(req2, res2);
  const dataA = res2.data.data;
  console.log(JSON.stringify(res2.data, null, 2));
  
  if (dataA.summary.totalInterviews !== 6) throw new Error('Total incorrect');
  if (dataA.summary.completedInterviews !== 4) throw new Error('Completed incorrect'); // 3 scored + 1 null scored
  if (dataA.summary.inProgressInterviews !== 1) throw new Error('In Progress incorrect');
  if (dataA.summary.abandonedInterviews !== 1) throw new Error('Abandoned incorrect');
  if (dataA.summary.averageScore !== 80) throw new Error(`Avg score incorrect: ${dataA.summary.averageScore} != 80 (80+90+70 / 3)`);

  const feDomain = dataA.domainStats.find(d => d.domain === 'Frontend');
  if (feDomain.averageScore !== 85) throw new Error(`Frontend avg incorrect: ${feDomain.averageScore} != 85`);
  if (feDomain.completedCount !== 2) throw new Error('Frontend completed count incorrect');

  const beDomain = dataA.domainStats.find(d => d.domain === 'Backend');
  if (beDomain.averageScore !== null) throw new Error('Backend avg should be null');
  
  if (dataA.recentPerformance.length !== 4) throw new Error('Recent performance should have 4 completed');
  
  // TEST 3: User B IDOR Isolation
  console.log('\\n>>> TEST 3: USER B ISOLATION');
  const req3 = mockReq({ _id: userB._id });
  const res3 = mockRes();
  await getInterviewStats(req3, res3);
  const dataB = res3.data.data;
  if (dataB.summary.totalInterviews !== 1) throw new Error('User B seeing wrong data');
  if (dataB.summary.averageScore !== 100) throw new Error('User B score incorrect');

  console.log('\\n--- TESTS PASSED SUCCESSFULLY ---');
  await mongoose.connection.close();
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
