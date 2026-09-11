require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const InterviewSession = require('./src/models/InterviewSession');
const achievementService = require('./src/services/achievementService');

const { enforceDestructiveTestSafety } = require('./src/utils/testGuard');

async function test() {
  const uri = process.env.MONGODB_URI || '';
  enforceDestructiveTestSafety(uri);
  await mongoose.connect(uri);
  console.log('Connected to DB');

  // Find a user
  let user = await User.findOne();
  if (!user) {
    user = await User.create({
      email: 'test_achievement@example.com',
      firstName: 'Test',
      lastName: 'User'
    });
  }

  // Clear existing achievements and sessions for a clean test
  await User.updateOne({ _id: user._id }, { $set: { unlockedAchievements: [] } });
  await InterviewSession.deleteMany({ user: user._id });

  console.log('Cleared user achievements and sessions');

  // Create a completed session 1
  const session1 = await InterviewSession.create({
    user: user._id,
    configuration: {
      type: 'BEHAVIORAL',
      domain: 'Software Engineering',
      difficulty: 'BEGINNER'
    },
    status: 'COMPLETED',
    overallScore: 65
  });

  // Evaluate
  console.log('Evaluating after session 1...');
  let res = await achievementService.evaluateAchievements(user._id);
  console.log('New Unlocks:', res.newUnlocks.map(u => u.achievementId));

  // Modify createdAt to yesterday
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  await InterviewSession.updateOne({ _id: session1._id }, { $set: { createdAt: yesterday } });

  // Create session 2 today (Score 85 - should trigger 80+ score and Rising Star since 85 >= 65 + 10 and 65 <= 80)
  const session2 = await InterviewSession.create({
    user: user._id,
    configuration: {
      type: 'BEHAVIORAL',
      domain: 'Software Engineering',
      difficulty: 'BEGINNER'
    },
    status: 'COMPLETED',
    overallScore: 85
  });

  // Evaluate
  console.log('Evaluating after session 2...');
  res = await achievementService.evaluateAchievements(user._id);
  console.log('New Unlocks:', res.newUnlocks.map(u => u.achievementId));
  console.log('Stats:', res.stats);

  const finalUser = await User.findById(user._id);
  console.log('Final Unlocked count:', finalUser.unlockedAchievements.length);

  await mongoose.disconnect();
}

test().catch(console.error);
