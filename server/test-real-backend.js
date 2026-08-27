const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- PHASE 5 BACKEND API TESTING ---');
  
  // Login to get session
  console.log('Logging in...');
  let res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'amrit17612@gmail.com', password: 'Password123!' })
  });
  
  if (!res.ok) throw new Error('Login failed for test');
  const cookieHeader = res.headers.get('set-cookie');
  const activeCookie = cookieHeader ? cookieHeader.split(';')[0] : '';
  console.log('Session acquired.');

  // Real Authenticated Request
  console.log('\nSending REAL Gemini prompt...');
  res = await fetch(`${BASE_URL}/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': activeCookie },
    body: JSON.stringify({ promptId: 'TEST_CONNECTION', payload: { message: 'End-to-end backend validation' } })
  });
  
  const status = res.status;
  const json = await res.json();
  
  console.log('HTTP Status:', status);
  if (status === 200) {
    console.log('Success Payload:', JSON.stringify(json, null, 2));
    console.log('\nREAL GEMINI GENERATION VERIFIED');
  } else {
    console.error('Error Payload:', JSON.stringify(json, null, 2));
    console.error('\nREAL GEMINI GENERATION FAILED');
  }
}

runTests().catch(console.error);
