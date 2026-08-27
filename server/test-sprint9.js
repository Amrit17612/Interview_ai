const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5001/api';
// We'll borrow the login logic from test-phase3.js if possible, or just generate a token if we can hit login
// Actually, let's use the DB to create a test user and a valid token.
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

// Load env
require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/interviu-ai');
};

const runTests = async () => {
  await connectDB();
  
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'amrit17612@gmail.com',
    password: 'Password123!'
  });
  
  const authCookie = loginRes.headers['set-cookie'][0].split(';')[0];
  
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      Cookie: authCookie
    }
  });

  console.log('--- TEST A: Question Generation Without Gemini ---');
  let startTime = Date.now();
  const createRes = await api.post('/interviews', {
    configuration: {
      type: 'BEHAVIORAL',
      domain: 'Software Engineering',
      difficulty: 'BEGINNER'
    }
  });
  const sessionId = createRes.data.data._id;
  
  const q1Res = await api.post(`/interviews/${sessionId}/question`);
  let duration = Date.now() - startTime;
  console.log(`Question 1 generated in ${duration}ms:`, q1Res.data.data.text);
  if (duration > 2000) {
    console.error('FAILED: Question generation took too long, might have used Gemini.');
  } else {
    console.log('PASSED: Fast deterministic generation.');
  }

  console.log('--- TEST B: Submit Answer (Uses Gemini) ---');
  startTime = Date.now();
  await api.post(`/interviews/${sessionId}/answer`, {
    answer: "I used official documentation and tutorials to quickly learn the framework over a weekend."
  });
  duration = Date.now() - startTime;
  console.log(`Answer evaluated in ${duration}ms (Expect slower for AI).`);

  console.log('--- TEST C: Follow-up Generation ---');
  const q2Res = await api.post(`/interviews/${sessionId}/question`);
  console.log('Question 2 generated:', q2Res.data.data.text);
  // It should be a follow-up or the next primary
  if (q2Res.data.data.questionId.includes('followup')) {
    console.log('PASSED: Follow-up question mapped correctly.');
  }

  console.log('--- TEST D: Exhausting Categories / Fallback ---');
  // Just generate questions until max
  await api.post(`/interviews/${sessionId}/answer`, { answer: "I talked to them respectfully." });
  const q3Res = await api.post(`/interviews/${sessionId}/question`);
  console.log('Question 3:', q3Res.data.data.text);
  await api.post(`/interviews/${sessionId}/answer`, { answer: "I talked to them respectfully." });
  
  const q4Res = await api.post(`/interviews/${sessionId}/question`);
  console.log('Question 4:', q4Res.data.data.text);
  await api.post(`/interviews/${sessionId}/answer`, { answer: "I talked to them respectfully." });

  const q5Res = await api.post(`/interviews/${sessionId}/question`);
  console.log('Question 5:', q5Res.data.data.text);

  console.log('--- TEST E: Duplicate Prevention ---');
  const texts = [q1Res.data.data.text, q2Res.data.data.text, q3Res.data.data.text, q4Res.data.data.text, q5Res.data.data.text];
  const uniqueTexts = new Set(texts);
  if (uniqueTexts.size === texts.length) {
    console.log('PASSED: No duplicates generated.');
  } else {
    console.error('FAILED: Duplicates detected!', texts);
  }

  console.log('--- TEST F: Final Report Completion ---');
  await api.post(`/interviews/${sessionId}/answer`, { answer: "I talked to them respectfully." });
  const compRes = await api.post(`/interviews/${sessionId}/complete`);
  console.log('Final Score:', compRes.data.data.overallScore);
  
  console.log('All tests finished.');
  process.exit(0);
};

runTests().catch(err => {
  console.error(err.response?.data || err.message);
  process.exit(1);
});
