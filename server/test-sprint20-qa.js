const mongoose = require('mongoose');
const InterviewSession = require('./src/models/InterviewSession');
const User = require('./src/models/User');
const { getInterviewRoadmap } = require('./src/controllers/interviewController');

async function runQA() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/interviu-test-qa');
    console.log('Connected to QA DB');
    await InterviewSession.deleteMany({});
    await User.deleteMany({});

    const user = await User.create({ firstName: 'QA', lastName: 'User', email: 'qa@test.com', passwordHash: 'hash123' });
    const userId = user._id;
    const user2 = await User.create({ firstName: 'QA2', lastName: 'User2', email: 'qa2@test.com', passwordHash: 'hash123' });

    const mockRes = () => {
      const res = {};
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (data) => { res.data = data; return res; };
      return res;
    };

    console.log('\n--- PART 1: ZERO INTERVIEWS ---');
    let res = mockRes();
    await getInterviewRoadmap({ user: { _id: userId } }, res);
    console.log('Zero interviews overallStatus:', res.data.data.overallStatus === 'INSUFFICIENT_DATA' ? 'PASS' : 'FAIL');
    console.log('Zero interviews recommended action:', res.data.data.recommendedAction.action === 'COMPLETE_MORE_INTERVIEWS' ? 'PASS' : 'FAIL');

    console.log('\n--- PART 2: ONE INTERVIEW (NEW WEAKNESS) ---');
    await InterviewSession.create({
      user: userId,
      status: 'COMPLETED',
      configuration: { type: 'TECHNICAL', domain: 'Frontend', difficulty: 'INTERMEDIATE' },
      overallScore: 60,
      strengths: ['react'],
      weaknesses: ['performance'],
      createdAt: new Date(Date.now() - 100000)
    });
    res = mockRes();
    await getInterviewRoadmap({ user: { _id: userId } }, res);
    console.log('One interview status:', res.data.data.overallStatus === 'INSUFFICIENT_DATA' ? 'PASS' : 'FAIL');
    let prioritySkill = res.data.data.prioritySkills.find(s => s.skill === 'performance');
    console.log('New weakness detected:', prioritySkill && prioritySkill.trend === 'INSUFFICIENT_DATA' ? 'PASS' : 'FAIL');
    console.log('One interview action:', res.data.data.recommendedAction.action === 'COMPLETE_MORE_INTERVIEWS' ? 'PASS' : 'FAIL');

    console.log('\n--- PART 3: TWO INTERVIEWS (PERSISTENT WEAKNESS, IMPROVING SKILL) ---');
    await InterviewSession.create({
      user: userId,
      status: 'COMPLETED',
      configuration: { type: 'TECHNICAL', domain: 'Frontend', difficulty: 'INTERMEDIATE' },
      overallScore: 80,
      strengths: ['performance'], 
      weaknesses: ['javascript'], 
      createdAt: new Date(Date.now() - 50000)
    });

    res = mockRes();
    await getInterviewRoadmap({ user: { _id: userId } }, res);
    console.log('Two interviews improving status:', res.data.data.overallStatus === 'IMPROVING' ? 'PASS' : 'FAIL');
    
    let improving = res.data.data.improvingSkills.find(s => s.skill === 'performance');
    console.log('Improving skill detected:', improving ? 'PASS' : 'FAIL');

    let newWeakness = res.data.data.prioritySkills.find(s => s.skill === 'javascript');
    console.log('New weakness trend NEW:', newWeakness && newWeakness.trend === 'NEW' ? 'PASS' : 'FAIL');
    console.log('Actionable key detected:', newWeakness && newWeakness.actionableSkillKey === 'javascript' ? 'PASS' : 'FAIL');

    console.log('\n--- PART 4: THREE INTERVIEWS (PERSISTENT) ---');
    await InterviewSession.create({
      user: userId,
      status: 'COMPLETED',
      configuration: { type: 'TECHNICAL', domain: 'Frontend', difficulty: 'INTERMEDIATE' },
      overallScore: 70,
      strengths: ['react'],
      weaknesses: ['javascript'], 
      createdAt: new Date()
    });

    res = mockRes();
    await getInterviewRoadmap({ user: { _id: userId } }, res);
    let persistent = res.data.data.prioritySkills.find(s => s.skill === 'javascript');
    console.log('Persistent weakness detected:', persistent && persistent.trend === 'PERSISTENT' ? 'PASS' : 'FAIL');
    console.log('Recommended Action is TARGETED_PRACTICE:', res.data.data.recommendedAction.action === 'TARGETED_PRACTICE' ? 'PASS' : 'FAIL');
    console.log('Recommended Target Skill:', res.data.data.recommendedAction.targetSkill === 'javascript' ? 'PASS' : 'FAIL');

    console.log('\n--- PART 5: TARGETED PRACTICE IMPACT ---');
    await InterviewSession.create({
      user: userId,
      status: 'COMPLETED',
      configuration: { type: 'TECHNICAL', domain: 'Frontend', difficulty: 'INTERMEDIATE', targetSkill: 'javascript' },
      overallScore: 90, 
      strengths: ['javascript'], 
      weaknesses: ['css'],
      createdAt: new Date(Date.now() + 50000)
    });

    res = mockRes();
    await getInterviewRoadmap({ user: { _id: userId } }, res);
    
    let jsSkill = res.data.data.prioritySkills.find(s => s.skill === 'javascript');
    console.log('Javascript is no longer a priority weakness:', !jsSkill ? 'PASS' : 'FAIL');
    
    let jsImproving = res.data.data.improvingSkills.find(s => s.skill === 'javascript');
    console.log('Javascript is now an improving skill:', jsImproving ? 'PASS' : 'FAIL');

    let impact = res.data.data.targetedPracticeImpact.find(t => t.skill === 'javascript');
    console.log('Targeted practice impact recorded:', impact ? 'PASS' : 'FAIL');
    if (impact) {
      console.log('Targeted score vs previous:', impact.targetedScore === 90 && typeof impact.previousAverage === 'number' ? 'PASS' : 'FAIL');
    }

    console.log('\n--- PART 6: IDOR ISOLATION ---');
    await InterviewSession.create({
      user: user2._id,
      status: 'COMPLETED',
      configuration: { type: 'BEHAVIORAL', domain: 'General', difficulty: 'BEGINNER' },
      overallScore: 20,
      weaknesses: ['communication'],
      createdAt: new Date()
    });

    res = mockRes();
    await getInterviewRoadmap({ user: { _id: userId } }, res);
    let commWeakness = res.data.data.prioritySkills.find(s => s.skill === 'communication');
    console.log('IDOR Isolation (No leakage):', !commWeakness ? 'PASS' : 'FAIL');

    console.log('\nQA Complete');
    await mongoose.disconnect();
  } catch (err) {
    console.error('QA Error:', err);
    process.exit(1);
  }
}

runQA();
