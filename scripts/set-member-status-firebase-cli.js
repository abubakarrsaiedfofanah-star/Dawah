const auth = require('firebase-tools/lib/auth');
const apiv2 = require('firebase-tools/lib/apiv2');

const projectId = process.env.FIREBASE_PROJECT_ID || 'umma-university-da-awah-team';
const database = '(default)';

function encodeValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encodeValue(item)])) } };
  }
  return { stringValue: String(value) };
}

async function getToken() {
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Firebase CLI is not logged in. Run: firebase login');
  auth.setActiveAccount({}, account);
  return apiv2.getAccessToken();
}

async function patchMember(docId, status) {
  const token = await getToken();
  const fields = encodeValue({
    status,
    approvedBy: 'Firebase owner CLI',
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).mapValue.fields;
  const updateMask = Object.keys(fields).map(key => `updateMask.fieldPaths=${encodeURIComponent(key)}`).join('&');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${database}/documents/members/${encodeURIComponent(docId)}?${updateMask}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `Firestore request failed with ${response.status}`);
  console.log(`Updated members/${docId} to ${status}`);
}

const docId = process.argv[2];
const status = process.argv[3] || 'Active';
if (!docId) {
  console.error('Usage: node scripts/set-member-status-firebase-cli.js <memberDocId> [status]');
  process.exit(1);
}

patchMember(docId, status).catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
