const auth = require('firebase-tools/lib/auth');
const apiv2 = require('firebase-tools/lib/apiv2');

const projectId = process.env.FIREBASE_PROJECT_ID || 'umma-university-da-awah-team';
const database = '(default)';
const execute = process.argv.includes('--execute');
const args = process.argv.slice(2).filter(arg => arg !== '--execute');

if (!args.length) {
  console.error('Usage: node scripts/delete-target-student-accounts-firebase-cli.js <email-or-student-id-or-uid> [...] [--execute]');
  process.exit(1);
}

function clean(value) {
  return String(value || '').trim().toLowerCase();
}

const targets = new Set(args.map(clean).filter(Boolean));

function valueOf(field) {
  if (!field || typeof field !== 'object') return field;
  if ('stringValue' in field) return field.stringValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return Number(field.doubleValue);
  if ('booleanValue' in field) return Boolean(field.booleanValue);
  if ('timestampValue' in field) return field.timestampValue;
  if ('nullValue' in field) return null;
  if ('arrayValue' in field) return (field.arrayValue.values || []).map(valueOf);
  if ('mapValue' in field) return objectOf(field.mapValue.fields || {});
  return undefined;
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  if (typeof value === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, firestoreValue(item)])) } };
  }
  return { stringValue: String(value) };
}

function firestoreFields(object) {
  return Object.fromEntries(Object.entries(object || {}).map(([key, value]) => [key, firestoreValue(value)]));
}

function objectOf(fields) {
  return Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, valueOf(value)]));
}

function docId(name) {
  return String(name || '').split('/').pop();
}

function identitiesOf(item = {}) {
  return [
    item.uid,
    item.localId,
    item.id,
    item.email,
    item.authEmail,
    item.studentEmail,
    item.username,
    item.studentId,
    item.student_id,
    item.memberId,
    item.fullName,
    item.name
  ].map(clean).filter(Boolean);
}

function isTarget(item) {
  return identitiesOf(item).some(id => targets.has(id));
}

function storeItems(doc) {
  if (!doc) return [];
  if (Array.isArray(doc.data.value)) return doc.data.value;
  if (Array.isArray(doc.data.items)) return doc.data.items;
  if (Array.isArray(doc.data.data)) return doc.data.data;
  return [];
}

function storeArrayKey(doc) {
  if (Array.isArray(doc.data.value)) return 'value';
  if (Array.isArray(doc.data.items)) return 'items';
  if (Array.isArray(doc.data.data)) return 'data';
  return 'items';
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

async function listCollection(collection, token) {
  const docs = [];
  let pageToken = '';
  do {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/${database}/documents/${collection}`);
    url.searchParams.set('pageSize', '1000');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const json = await fetchJson(url.toString(), token);
    docs.push(...(json.documents || []).map(doc => ({
      name: doc.name,
      id: docId(doc.name),
      data: objectOf(doc.fields || {})
    })));
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  return docs;
}

async function listAuthUsers(token) {
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:query`;
  const json = await fetchJson(url, token, {
    method: 'POST',
    body: JSON.stringify({ returnUserInfo: true, limit: 1000 })
  });
  return (json.userInfo || json.users || []).map(user => ({
    uid: user.localId || user.uid || '',
    email: user.email || '',
    displayName: user.displayName || ''
  }));
}

async function deleteAuthUser(uid, token) {
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:delete`;
  await fetchJson(url, token, {
    method: 'POST',
    body: JSON.stringify({ localId: uid })
  });
}

async function deleteDocument(name, token) {
  const response = await fetch(`https://firestore.googleapis.com/v1/${name}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` }
  });
  if (response.status === 404) return;
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text.slice(0, 180) || `Delete failed with ${response.status}`);
  }
}

async function patchDocument(name, data, token) {
  await fetchJson(`https://firestore.googleapis.com/v1/${name}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ fields: firestoreFields(data) })
  });
}

async function main() {
  const token = await getToken();
  const [authUsers, members, appStores] = await Promise.all([
    listAuthUsers(token),
    listCollection('members', token),
    listCollection('appStores', token)
  ]);

  const targetAuthUsers = authUsers.filter(isTarget);
  targetAuthUsers.forEach(user => {
    targets.add(clean(user.uid));
    targets.add(clean(user.email));
  });

  const targetMemberDocs = members.filter(doc => isTarget({ ...doc.data, id: doc.id }));
  targetMemberDocs.forEach(doc => identitiesOf({ ...doc.data, id: doc.id }).forEach(id => targets.add(id)));

  const appStoreUpdates = appStores
    .map(doc => {
      const items = storeItems(doc);
      if (!items.length) return null;
      const nextItems = items.filter(item => !isTarget(item));
      if (nextItems.length === items.length) return null;
      const key = storeArrayKey(doc);
      return {
        name: doc.name,
        id: doc.id,
        removed: items.length - nextItems.length,
        data: { ...doc.data, [key]: nextItems, updatedAt: new Date().toISOString() }
      };
    })
    .filter(Boolean);

  console.log(`Project: ${projectId}`);
  console.log(`Mode: ${execute ? 'EXECUTE' : 'DRY RUN'}`);
  console.log(`Targets: ${Array.from(targets).join(', ')}`);
  console.log(`Auth users matched: ${targetAuthUsers.length}`);
  targetAuthUsers.forEach((user, index) => console.log(`  ${index + 1}. ${user.email || '(no email)'} | uid=${user.uid}`));
  console.log(`Member docs matched: ${targetMemberDocs.length}`);
  targetMemberDocs.forEach((doc, index) => console.log(`  ${index + 1}. members/${doc.id}`));
  console.log(`App store rows matched: ${appStoreUpdates.reduce((sum, doc) => sum + doc.removed, 0)}`);
  appStoreUpdates.forEach((doc, index) => console.log(`  ${index + 1}. appStores/${doc.id}: remove ${doc.removed}`));

  if (!execute) {
    console.log('\nNo changes made. Rerun with --execute to delete these exact targets.');
    return;
  }

  for (const doc of targetMemberDocs) {
    await deleteDocument(doc.name, token);
    console.log(`Deleted members/${doc.id}`);
  }
  for (const doc of appStoreUpdates) {
    await patchDocument(doc.name, doc.data, token);
    console.log(`Updated appStores/${doc.id}; removed ${doc.removed} item(s)`);
  }
  for (const user of targetAuthUsers) {
    await deleteAuthUser(user.uid, token);
    console.log(`Deleted Auth user: ${user.email || user.uid}`);
  }
  console.log('Targeted cleanup complete.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
