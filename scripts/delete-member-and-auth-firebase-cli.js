const auth = require('firebase-tools/lib/auth');
const apiv2 = require('firebase-tools/lib/apiv2');

const projectId = process.env.FIREBASE_PROJECT_ID || 'umma-university-da-awah-team';
const database = '(default)';
const email = String(process.argv[2] || '').trim().toLowerCase();

if (!email) {
  console.error('Usage: node scripts/delete-member-and-auth-firebase-cli.js <email>');
  process.exit(1);
}

function valueOf(field) {
  if (!field || typeof field !== 'object') return field;
  if ('stringValue' in field) return field.stringValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return Number(field.doubleValue);
  if ('booleanValue' in field) return Boolean(field.booleanValue);
  if ('timestampValue' in field) return field.timestampValue;
  if ('nullValue' in field) return null;
  if ('arrayValue' in field) return (field.arrayValue.values || []).map(valueOf);
  if ('mapValue' in field) {
    return Object.fromEntries(Object.entries(field.mapValue.fields || {}).map(([key, value]) => [key, valueOf(value)]));
  }
  return undefined;
}

async function getToken() {
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Firebase CLI is not logged in. Run: firebase login');
  auth.setActiveAccount({}, account);
  return apiv2.getAccessToken();
}

async function fetchJson(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(json?.error?.message || text.slice(0, 180) || `Request failed with ${response.status}`);
  }
  return json;
}

async function listAuthUsers(token) {
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:query`;
  const result = await fetchJson(url, token, {
    method: 'POST',
    body: JSON.stringify({ returnUserInfo: true, limit: 1000 })
  });
  return result.userInfo || result.users || [];
}

async function deleteAuthUser(uid, token) {
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:delete`;
  await fetchJson(url, token, {
    method: 'POST',
    body: JSON.stringify({ localId: uid })
  });
}

async function listCollection(collection, token) {
  const docs = [];
  let pageToken = '';
  do {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/${database}/documents/${collection}`);
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const json = await fetchJson(url.toString(), token);
    docs.push(...(json.documents || []).map(doc => ({
      name: doc.name,
      id: String(doc.name || '').split('/').pop(),
      data: Object.fromEntries(Object.entries(doc.fields || {}).map(([key, value]) => [key, valueOf(value)]))
    })));
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  return docs;
}

async function deleteDocument(name, token) {
  const url = `https://firestore.googleapis.com/v1/${name}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` }
  });
  if (response.status === 404) return;
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text.slice(0, 180) || `Delete failed with ${response.status}`);
  }
}

async function main() {
  const token = await getToken();
  const authUsers = await listAuthUsers(token);
  const authUser = authUsers.find(user => String(user.email || '').trim().toLowerCase() === email);
  const uid = authUser?.localId || authUser?.uid || '';

  const members = await listCollection('members', token);
  const matchingMembers = members.filter(doc => {
    const data = doc.data || {};
    return String(data.email || data.authEmail || '').trim().toLowerCase() === email || (uid && (doc.id === uid || data.uid === uid));
  });

  for (const doc of matchingMembers) {
    await deleteDocument(doc.name, token);
    console.log(`Deleted Firestore member record: ${doc.id}`);
  }

  if (uid) {
    await deleteAuthUser(uid, token);
    console.log(`Deleted Firebase Auth user: ${email} | uid=${uid}`);
  } else {
    console.log(`No Firebase Auth user found for ${email}.`);
  }

  if (!matchingMembers.length) {
    console.log(`No Firestore member record found for ${email}.`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
