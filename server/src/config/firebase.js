const admin = require('firebase-admin');

if (!admin.getApps().length) {
  // Use default application credentials if FIREBASE_CONFIG or GOOGLE_APPLICATION_CREDENTIALS is set
  // Alternatively, parse them from environment variables explicitly
  
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in private keys
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      })
    });
  } else {
    // Fallback for development if env variables are not fully set, will throw if missing
    admin.initializeApp();
  }
}

module.exports = admin;
