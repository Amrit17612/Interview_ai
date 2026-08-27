const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- SPRINT 6 PHASE 3 TESTS (INTERVIEW ENGINE) ---');
  
  // Login
  let res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'amrit17612@gmail.com', password: 'Password123!' })
  });
  const cookieHeader = res.headers.get('set-cookie');
  const activeCookie = cookieHeader ? cookieHeader.split(';')[0] : '';
  
  // 1. Create Session
  res = await fetch(`${BASE_URL}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': activeCookie },
    body: JSON.stringify({
      configuration: { type: 'BEHAVIORAL', domain: 'Frontend', difficulty: 'INTERMEDIATE' }
    })
  });
  let postResult = await res.json();
  const sessionId = postResult.data._id;
  console.log('Session Created:', sessionId);

  // 2. Unauthenticated test on Question endpoint
  res = await fetch(`${BASE_URL}/interviews/${sessionId}/question`, {
    method: 'POST'
  });
  console.log('Unauthorized question status:', res.status);

  // 3. Generate Question
  console.log('Generating Question 1...');
  res = await fetch(`${BASE_URL}/interviews/${sessionId}/question`, {
    method: 'POST',
    headers: { 'Cookie': activeCookie }
  });
  const qResult = await res.json();
  console.log('Question 1 Generated:', qResult.data?.text);
  
  // 4. Duplicate Question Request (should fail since Q1 is PENDING)
  res = await fetch(`${BASE_URL}/interviews/${sessionId}/question`, {
    method: 'POST',
    headers: { 'Cookie': activeCookie }
  });
  const dupQResult = await res.json();
  console.log('Duplicate Question Request message:', dupQResult.message);

  // 5. Submit Answer
  console.log('Submitting Answer 1...');
  res = await fetch(`${BASE_URL}/interviews/${sessionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': activeCookie },
    body: JSON.stringify({ answer: 'React hooks allow state management in functional components.' })
  });
  const ansResult = await res.json();
  console.log('Answer Evaluated Score:', ansResult.data?.evaluation?.score);

  // 6. Duplicate Answer Submission
  res = await fetch(`${BASE_URL}/interviews/${sessionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': activeCookie },
    body: JSON.stringify({ answer: 'Duplicate attempt.' })
  });
  const dupAnsResult = await res.json();
  console.log('Duplicate Answer Submission message:', dupAnsResult.message);

  // 7. Generate Question 2
  console.log('Generating Question 2...');
  res = await fetch(`${BASE_URL}/interviews/${sessionId}/question`, {
    method: 'POST',
    headers: { 'Cookie': activeCookie }
  });
  const q2Result = await res.json();
  console.log('Question 2 Generated:', q2Result.data?.text);

  // 8. Submit Answer 2
  console.log('Submitting Answer 2...');
  res = await fetch(`${BASE_URL}/interviews/${sessionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': activeCookie },
    body: JSON.stringify({ answer: 'I use useMemo and React.memo to prevent unnecessary re-renders.' })
  });
  const ans2Result = await res.json();
  console.log('Answer 2 Evaluated Score:', ans2Result.data?.evaluation?.score);

  // 9. Complete Interview
  console.log('Completing Interview (Generating Final Report)...');
  res = await fetch(`${BASE_URL}/interviews/${sessionId}/complete`, {
    method: 'POST',
    headers: { 'Cookie': activeCookie }
  });
  const compResult = await res.json();
  if (!compResult.success) {
    console.log('Complete Interview Failed (Likely Timeout):', compResult.message);
  } else {
    console.log('Interview Completed. Overall Score:', compResult.data?.overallScore);
    console.log('Summary:', compResult.data?.feedbackSummary);
  }

  // 10. Check Idempotency / Duplicate Complete
  res = await fetch(`${BASE_URL}/interviews/${sessionId}/complete`, {
    method: 'POST',
    headers: { 'Cookie': activeCookie }
  });
  const dupCompResult = await res.json();
  console.log('Duplicate Completion Idempotency check:', dupCompResult.data?.status);
}

runTests().catch(console.error);
