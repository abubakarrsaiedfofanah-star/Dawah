const fs = require('node:fs');
const path = require('node:path');
const { admin, initializeAdminApp } = require('./firebase-admin-app');

const defaultInput = path.join(process.cwd(), 'test-results', 'live-created-users.json');
const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultInput;

function readAuditUsers(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(data.users)) {
    throw new Error('Expected a JSON object with a users array.');
  }
  return data.users.filter(user => user && user.email);
}

async function listPilotUsersFromAuth() {
  const users = [];
  let pageToken;
  do {
    const page = await admin.auth().listUsers(1000, pageToken);
    for (const user of page.users) {
      const email = String(user.email || '');
      if (/^pilot\.(student|officer)\.\d+@example\.com$/i.test(email)) {
        users.push({
          role: email.startsWith('pilot.officer.') ? 'officer' : 'student',
          id: '',
          name: user.displayName || '',
          email
        });
      }
    }
    pageToken = page.pageToken;
  } while (pageToken);
  return users;
}

async function deleteAuthUserByEmail(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(user.uid);
    return { email, uid: user.uid, authDeleted: true };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return { email, uid: '', authDeleted: false, missing: true };
    }
    throw error;
  }
}

async function deleteMatchingFirestoreDocs(db, user, uid) {
  const batches = [];
  const memberIds = [uid, user.id, user.email].filter(Boolean);
  const collections = [
    ['members', memberIds],
    ['memberVerifications', [user.id, user.email].filter(Boolean)]
  ];

  for (const [collectionName, ids] of collections) {
    for (const id of ids) {
      batches.push(db.collection(collectionName).doc(String(id).replace(/\//g, '-')).delete());
    }
  }

  const roleRequests = await db.collection('members')
    .where('email', '==', user.email)
    .get()
    .catch(() => ({ docs: [] }));
  for (const doc of roleRequests.docs) {
    batches.push(doc.ref.delete());
  }

  await Promise.allSettled(batches);
}

async function main() {
  initializeAdminApp();
  const db = admin.firestore();
  let users = readAuditUsers(inputPath);
  if (!users.length) {
    users = await listPilotUsersFromAuth();
  }
  if (!users.length) {
    console.log('No live audit users found to clean up.');
    return;
  }

  const results = [];
  for (const user of users) {
    const authResult = await deleteAuthUserByEmail(user.email);
    await deleteMatchingFirestoreDocs(db, user, authResult.uid);
    results.push(authResult);
  }

  console.log(`Cleanup complete for ${results.length} live audit user(s).`);
  for (const result of results) {
    console.log(`- ${result.email}: ${result.authDeleted ? 'deleted' : 'not found'}`);
  }
}

main().catch(error => {
  if (/default credentials|valid Google OAuth2 access token|Could not load the default credentials/i.test(error.message || '')) {
    console.error('Cleanup needs Admin SDK credentials.');
    console.error('Set FIREBASE_SERVICE_ACCOUNT_JSON to a Firebase service account JSON value, or run with Google Application Default Credentials.');
    console.error(`Then rerun: npm.cmd run cleanup:live-audit -- ${inputPath}`);
    process.exitCode = 1;
    return;
  }
  console.error(error.message || error);
  process.exitCode = 1;
});
