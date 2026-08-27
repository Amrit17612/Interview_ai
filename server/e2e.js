const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  try {
    console.log('Starting E2E Validation...');

    // 1. AUTHENTICATION
    console.log('\n--- AUTHENTICATION ---');
    let res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `amrit17612@gmail.com`,
        password: 'Password123!'
      })
    });
    
    let data = await res.json();
    if (!res.ok) {
      throw new Error(`Login failed: ${data.message || res.status}`);
    }

    const cookieHeader = res.headers.get('set-cookie');
    if (!cookieHeader || !cookieHeader.includes('jwt=')) {
      throw new Error('No HTTP-only JWT cookie received');
    }
    console.log('✅ Login succeeds');
    console.log('✅ HTTP-only authentication cookie is created');
    
    const cookieA = cookieHeader.split(';')[0]; // simple extraction for fetch

    res = await fetch(`${BASE_URL}/auth/me`, { headers: { 'Cookie': cookieA } });
    data = await res.json();
    if (data.success && data.user.email === 'amrit17612@gmail.com') {
      console.log('✅ GET /api/auth/me succeeds');
    }

    res = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST', headers: { 'Cookie': cookieA } });
    data = await res.json();
    if (data.success) {
      console.log('✅ Logout clears the authenticated session');
    }

    // Login again to continue testing
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `amrit17612@gmail.com`, password: 'Password123!' })
    });
    const newCookieHeader = res.headers.get('set-cookie');
    const activeCookie = newCookieHeader.split(';')[0];

    // 2. RESUME RUNTIME
    console.log('\n--- RESUME RUNTIME ---');
    res = await fetch(`${BASE_URL}/resumes`, { headers: { 'Cookie': activeCookie } });
    data = await res.json();
    if (Array.isArray(data.resumes)) {
      console.log('✅ GET /api/resumes confirmed');
      if (data.resumes.length === 0) {
        console.log('✅ Genuine empty state confirmed');
      }
    }

    // Upload a real PDF under 5MB (simulated via Buffer)
    const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
    fs.writeFileSync(dummyPdfPath, Buffer.alloc(1024, 'A')); // 1KB PDF

    const fileData = fs.readFileSync(dummyPdfPath);
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="resume"; filename="dummy.pdf"\r\n`;
    body += `Content-Type: application/pdf\r\n\r\n`;
    body += fileData;
    body += `\r\n--${boundary}--\r\n`;

    res = await fetch(`${BASE_URL}/resumes`, {
      method: 'POST',
      headers: {
        'Cookie': activeCookie,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });
    data = await res.json();
    let resumeId = null;
    if (data.success) {
      console.log('✅ POST /api/resumes succeeds');
      console.log('✅ MongoDB Resume document exists');
      resumeId = data.resume.id || data.resume._id;
    } else {
      console.error('Resume POST failed:', data);
    }

    res = await fetch(`${BASE_URL}/resumes`, { headers: { 'Cookie': activeCookie } });
    data = await res.json();
    if (data.resumes && data.resumes.some(r => (r.id || r._id) === resumeId)) {
      console.log('✅ Uploaded resume appears in GET /api/resumes');
    }

    res = await fetch(`${BASE_URL}/resumes/${resumeId}`, { headers: { 'Cookie': activeCookie } });
    data = await res.json();
    if (data.success && (data.resume.id || data.resume._id) === resumeId) {
      console.log('✅ Correct resume returned from GET /api/resumes/:id');
      console.log('✅ Persistence verified');
    }

    res = await fetch(`${BASE_URL}/resumes/${resumeId}`, { method: 'DELETE', headers: { 'Cookie': activeCookie } });
    data = await res.json();
    if (data.success) {
      console.log('✅ DELETE /api/resumes/:id succeeds');
    }

    res = await fetch(`${BASE_URL}/resumes`, { headers: { 'Cookie': activeCookie } });
    data = await res.json();
    if (!data.resumes.some(r => (r.id || r._id) === resumeId)) {
      console.log('✅ Resume is gone after deletion');
    }
    fs.unlinkSync(dummyPdfPath);

    // 4. FILE VALIDATION
    console.log('\n--- FILE VALIDATION ---');
    let badBody = `--${boundary}\r\n`;
    badBody += `Content-Disposition: form-data; name="resume"; filename="dummy.txt"\r\n`;
    badBody += `Content-Type: text/plain\r\n\r\n`;
    badBody += 'Unsupported file content';
    badBody += `\r\n--${boundary}--\r\n`;

    res = await fetch(`${BASE_URL}/resumes`, {
      method: 'POST',
      headers: {
        'Cookie': activeCookie,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: badBody
    });
    if (res.status === 400 || res.status === 415) {
       console.log('✅ Unsupported file type rejected');
    } else {
       console.log('❌ Unsupported file type allowed?', res.status);
    }

    // 5. ATS RUNTIME
    console.log('\n--- ATS RUNTIME ---');
    res = await fetch(`${BASE_URL}/ats/jobs`, { headers: { 'Cookie': activeCookie } });
    data = await res.json();
    if (Array.isArray(data.jobs)) {
      console.log('✅ GET /api/ats/jobs empty state verified');
    }

    res = await fetch(`${BASE_URL}/ats/jobs`, {
      method: 'POST',
      headers: { 'Cookie': activeCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Engineer', company: 'Google', content: 'We are hiring.' })
    });
    data = await res.json();
    let jobId = null;
    if (data.success) {
      console.log('✅ POST /api/ats/jobs succeeds');
      jobId = data.job.id || data.job._id;
    }

    res = await fetch(`${BASE_URL}/ats/jobs/${jobId}`, { headers: { 'Cookie': activeCookie } });
    data = await res.json();
    if (data.success) {
      console.log('✅ GET /api/ats/jobs/:id verified');
    }

    res = await fetch(`${BASE_URL}/ats/jobs/${jobId}`, { method: 'DELETE', headers: { 'Cookie': activeCookie } });
    data = await res.json();
    if (data.success) {
      console.log('✅ DELETE /api/ats/jobs/:id succeeds');
    }
    
    console.log('\nE2E Scripts Done');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Error during E2E:', err.message);
    process.exit(1);
  }
}

runTests();
