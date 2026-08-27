require('dotenv').config();
const { 
  generateText, 
  validateQuestionResponse, 
  validateEvaluationResponse, 
  validateReportResponse 
} = require('./src/services/geminiService');
const { 
  getGenerateQuestionPrompt, 
  getEvaluateAnswerPrompt, 
  getFinalReportPrompt 
} = require('./src/utils/prompts');

async function runTests() {
  console.log('--- SPRINT 6 PHASE 2 TESTS (STRUCTURED AI) ---');
  const config = { responseMimeType: 'application/json' };

  try {
    console.log('1. Testing GENERATE_QUESTION...');
    const qPrompt = getGenerateQuestionPrompt({ domain: 'Frontend React', difficulty: 'INTERMEDIATE', type: 'TECHNICAL' });
    const qRes = await generateText(qPrompt, config);
    console.log('Raw Question:', qRes);
    const validQ = validateQuestionResponse(qRes);
    console.log('Question Validated Successfully:', validQ.question !== undefined);

    console.log('\n2. Testing EVALUATE_ANSWER...');
    const ePrompt = getEvaluateAnswerPrompt({ 
      question: validQ.question, 
      answer: 'I would use the useState hook to manage local state, and useEffect for side effects like API calls.', 
      domain: 'Frontend React', 
      difficulty: 'INTERMEDIATE' 
    });
    const eRes = await generateText(ePrompt, config);
    console.log('Raw Evaluation:', eRes);
    const validE = validateEvaluationResponse(eRes);
    console.log('Evaluation Validated Successfully:', validE.score !== undefined);

    console.log('\n3. Testing FINAL_REPORT...');
    const fPrompt = getFinalReportPrompt({ 
      domain: 'Frontend React', 
      difficulty: 'INTERMEDIATE', 
      type: 'TECHNICAL',
      evaluations: [validE]
    });
    const fRes = await generateText(fPrompt, config);
    console.log('Raw Report:', fRes);
    const validF = validateReportResponse(fRes);
    console.log('Report Validated Successfully:', validF.overall_score !== undefined);

    console.log('\n4. Testing Malformed JSON & Validation Failure (Mocking)...');
    try {
      validateQuestionResponse({ something_else: 'hello' });
      console.error('FAILED: Did not catch malformed question data');
    } catch (e) {
      console.log('Caught invalid question structure successfully:', e.message);
    }

    try {
      validateEvaluationResponse({ score: 105, feedback: 'too high', strengths: [], improvements: [] });
      console.error('FAILED: Did not catch invalid score');
    } catch (e) {
      console.log('Caught invalid score successfully:', e.message);
    }
  } catch (error) {
    console.error('TEST FAILED WITH ERROR:', error.message);
  }
}

runTests();
