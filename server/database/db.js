// db.js (using firebase-admin)

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize the app with applicationDefault(), which automatically picks up
// the Cloud Run Service Account credentials.
try {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.GOOGLE_CLOUD_PROJECT, // Optional but good practice
  });
} catch (error) {
  // If the app is already initialized (e.g., in a testing environment)
  if (!/already exists/i.test(error.message)) {
    console.error('Firebase Admin Initialization Error:', error.message);
    // CRASHING HERE is good for debugging, but let's check permissions below
    throw error; 
  }
}

const db = getFirestore();
module.exports = db;