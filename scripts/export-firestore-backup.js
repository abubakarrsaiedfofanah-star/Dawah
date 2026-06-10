const fs = require('node:fs');
const path = require('node:path');
const admin = require('firebase-admin');

const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'umma-university-da-awah-team';
const outDir = path.resolve(process.cwd(), 'backups');

if (!admin.apps.length) {
  admin.initializeApp({ projectId });
}

const db = admin.firestore();

const collections = [
  'admins',
  'appStores',
  'members',
  'payments',
  'donations',
  'receiptVerifications',
  'memberVerifications',
  'membershipCards',
  'welfareRequests',
  'eventRegistrations',
  'volunteerRegistrations',
  'auditLogs',
  'backupMetadata'
];

function serializeValue(value) {
  if (!value) return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeValue(item)]));
  }
  return value;
}

async function exportCollection(name) {
  const snapshot = await db.collection(name).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    path: doc.ref.path,
    data: serializeValue(doc.data())
  }));
}

async function exportAuthUsers() {
  const users = [];
  let pageToken;
  do {
    const result = await admin.auth().listUsers(1000, pageToken);
    users.push(...result.users.map(user => ({
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      customClaims: user.customClaims || {},
      creationTime: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime
    })));
    pageToken = result.pageToken;
  } while (pageToken);
  return users;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const exportedAt = new Date().toISOString();
  const data = {
    app: "UMMA University Da'awah Team",
    projectId,
    exportedAt,
    collections: {},
    authUsers: []
  };

  for (const collection of collections) {
    data.collections[collection] = await exportCollection(collection);
  }
  data.authUsers = await exportAuthUsers();

  const filename = `umma-dawaah-firestore-${exportedAt.replace(/[:.]/g, '-')}.backup.json`;
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Backup written: ${filePath}`);
  console.log(`Collections: ${collections.length}, Auth users: ${data.authUsers.length}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
