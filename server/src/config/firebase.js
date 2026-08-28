const admin = require('firebase-admin');

// Validate environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (projectId && clientEmail) {
  console.log(`[Firebase Admin] Initializing with project ID: ${projectId} and client email: ${clientEmail}`);
} else {
  console.warn('[Firebase Admin] Missing FIREBASE_PROJECT_ID or FIREBASE_CLIENT_EMAIL environment variables. Initialization may fail.');
}

if (!admin.getApps().length) {
  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.cert({
        projectId,
        clientEmail,
        // Handle escaped newlines in private keys safely
        privateKey: privateKey.replace(/\\n/g, '\n'),
      })
    });
  } else {
    console.warn('[Firebase Admin] Missing credentials, attempting default initialization');
    admin.initializeApp();
  }
}

module.exports = admin;
