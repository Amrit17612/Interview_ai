const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- SPRINT 6 PHASE 1 TESTS ---');
  
  // Login
  let res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'amrit17612@gmail.com', password: 'Password123!' })
  });
  const cookieHeader = res.headers.get('set-cookie');
  const activeCookie = cookieHeader ? cookieHeader.split(';')[0] : '';
  
  // 1. POST /api/interviews
  res = await fetch(`${BASE_URL}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': activeCookie },
    body: JSON.stringify({
      configuration: { type: 'BEHAVIORAL', domain: 'Frontend', difficulty: 'INTERMEDIATE' }
    })
  });
  const postResult = await res.json();
  console.log('POST Result:', postResult);
  const sessionId = postResult.data._id;

  // 2. GET /api/interviews
  res = await fetch(`${BASE_URL}/interviews`, {
    method: 'GET',
    headers: { 'Cookie': activeCookie }
  });
  const listResult = await res.json();
  console.log('GET List length:', listResult.data.length);

  // 3. GET /api/interviews/:id
  res = await fetch(`${BASE_URL}/interviews/${sessionId}`, {
    method: 'GET',
    headers: { 'Cookie': activeCookie }
  });
  const getResult = await res.json();
  console.log('GET Single status:', getResult.data.status);

  // 4. Invalid ObjectId
  res = await fetch(`${BASE_URL}/interviews/invalid123`, {
    method: 'GET',
    headers: { 'Cookie': activeCookie }
  });
  const invalidIdResult = await res.json();
  console.log('Invalid ID Result:', invalidIdResult);

  // 5. Unauthorized / IDOR
  res = await fetch(`${BASE_URL}/interviews/${sessionId}`, {
    method: 'GET', // No cookie
  });
  console.log('Unauthorized fetch status:', res.status);
}

runTests().catch(console.error);
