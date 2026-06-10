const admin = require('firebase-admin');

function credentialFromEnv() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }
  return admin.credential.applicationDefault();
}

function initializeAdminApp() {
  if (admin.apps.length) return admin.app();
  return admin.initializeApp({
    credential: credentialFromEnv(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'umma-university-da-awah-team'
  });
}

module.exports = { admin, initializeAdminApp };
