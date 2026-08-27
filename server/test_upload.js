const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');

const API_URL = 'http://localhost:5001/api';
const MONGODB_URI = 'mongodb://localhost:27017/interviu_ai';
const JWT_SECRET = 'your_jwt_secret_here';

const runTests = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Find any user or create one directly in DB
    let user = await db.collection('users').findOne({});
    if (!user) {
      const result = await db.collection('users').insertOne({
        firstName: 'Test',
        lastName: 'User',
        email: 'test_direct@example.com',
        passwordHash: 'dummy',
        isEmailVerified: true
      });
      user = { _id: result.insertedId };
    }
    
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
    const axiosConfig = {
      headers: { Cookie: `jwt=${token}` }
    };
    
    // Helper to create test files
    const createDummyPDF = (filename, content) => {
      return new Promise((resolve) => {
        const filepath = path.join(__dirname, filename);
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filepath));
        doc.text(content);
        doc.end();
        doc.on('end', () => resolve(filepath));
        setTimeout(() => resolve(filepath), 1000); // safety fallback
      });
    };

    const validPdfPath = await createDummyPDF('valid.pdf', 'This is a valid PDF with some resume text.');
    const emptyPdfPath = await createDummyPDF('empty.pdf', '   ');
    
    const corruptedPdfPath = path.join(__dirname, 'corrupt.pdf');
    fs.writeFileSync(corruptedPdfPath, 'This is a totally corrupt PDF file that cannot be parsed.');
    
    const unsupportedPath = path.join(__dirname, 'unsupported.txt');
    fs.writeFileSync(unsupportedPath, 'This is a text file.');

    const oversizedPath = path.join(__dirname, 'oversized.pdf');
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a'); // 6MB
    fs.writeFileSync(oversizedPath, largeBuffer);

    // Upload Helper
    const uploadFile = async (filepath, originalName, mimeType) => {
      const formData = new FormData();
      formData.append('resume', fs.createReadStream(filepath), {
        filename: originalName,
        contentType: mimeType
      });
      
      try {
        const response = await axios.post(`${API_URL}/resumes`, formData, {
          headers: { ...axiosConfig.headers, ...formData.getHeaders() }
        });
        return { success: true, status: response.status, data: response.data };
      } catch (error) {
        return { 
          success: false, 
          status: error.response?.status, 
          data: error.response?.data,
          message: error.message
        };
      }
    };

    console.log('--- TEST 1: Valid PDF Upload ---');
    const res1 = await uploadFile(validPdfPath, 'valid.pdf', 'application/pdf');
    console.log('Status:', res1.status, '| parsingStatus:', res1.data?.resume?.parsingStatus);
    
    console.log('--- TEST 2: Corrupted PDF Upload ---');
    const res2 = await uploadFile(corruptedPdfPath, 'corrupt.pdf', 'application/pdf');
    console.log('Status:', res2.status, '| parsingStatus:', res2.data?.resume?.parsingStatus);
    
    console.log('--- TEST 3: Empty Document Upload ---');
    const res3 = await uploadFile(emptyPdfPath, 'empty.pdf', 'application/pdf');
    console.log('Status:', res3.status, '| parsingStatus:', res3.data?.resume?.parsingStatus);

    console.log('--- TEST 4: Unsupported File Upload ---');
    const res4 = await uploadFile(unsupportedPath, 'unsupported.txt', 'text/plain');
    console.log('Status:', res4.status, '| success:', res4.data?.success, '| message:', res4.data?.message);

    console.log('--- TEST 5: Oversized File Upload ---');
    const res5 = await uploadFile(oversizedPath, 'oversized.pdf', 'application/pdf');
    console.log('Status:', res5.status, '| success:', res5.data?.success, '| message:', res5.data?.message);
    
    console.log('--- TEST 6: Unauthenticated Upload ---');
    const formData = new FormData();
    formData.append('resume', fs.createReadStream(validPdfPath), { filename: 'unauth.pdf', contentType: 'application/pdf' });
    try {
      await axios.post(`${API_URL}/resumes`, formData, { headers: formData.getHeaders() });
    } catch(error) {
      console.log('Status:', error.response?.status, '| message:', error.response?.data?.message);
    }
    
    // Verify MongoDB
    console.log('--- TEST 7: MongoDB Verification ---');
    const validResume = await db.collection('resumes').findOne({ _id: new mongoose.Types.ObjectId(res1.data.resume.id) });
    console.log('Valid PDF parsedText populated?', !!validResume.parsedText);
    console.log('Valid PDF text preview:', validResume.parsedText?.substring(0, 50));
    
    const corruptedResume = await db.collection('resumes').findOne({ _id: new mongoose.Types.ObjectId(res2.data.resume.id) });
    console.log('Corrupted PDF parsedText populated?', !!corruptedResume.parsedText);
    
    console.log('\nAll tests completed.');

  } catch (err) {
    console.error('Test Execution Failed:', err.response?.data || err.message);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
