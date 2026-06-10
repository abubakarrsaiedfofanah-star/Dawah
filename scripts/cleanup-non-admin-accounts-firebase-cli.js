const auth = require('firebase-tools/lib/auth');
const apiv2 = require('firebase-tools/lib/apiv2');

const projectId = process.env.FIREBASE_PROJECT_ID || 'umma-university-da-awah-team';
const database = '(default)';
const execute = process.argv.includes('--execute');

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
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
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

function clean(value) {
  return String(value || '').trim().toLowerCase();
}

function compact(items) {
  return Array.from(new Set(items.map(clean).filter(Boolean)));
}

function identitiesOf(item = {}) {
  return compact([
    item.uid,
    item.localId,
    item.id,
    item.email,
    item.authEmail,
    item.adminEmail,
    item.studentEmail,
    item.officerEmail,
    item.username,
    item.studentId,
    item.memberId,
    item.cardId,
    item.fullName
  ]);
}

function storeItems(doc) {
  if (!doc) return [];
  if (Array.isArray(doc.value)) return doc.value;
  if (Array.isArray(doc.items)) return doc.items;
  if (Array.isArray(doc.data)) return doc.data;
  return [];
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

async function deleteUrl(url, token) {
  const response = await fetch(url, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } });
  if (response.status === 404) return;
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text.slice(0, 180) || `Delete failed with ${response.status}`);
  }
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

async function patchDocument(name, data, token) {
  await fetchJson(`https://firestore.googleapis.com/v1/${name}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ fields: firestoreFields(data) })
  });
}

function matchesTarget(doc, targetIds) {
  const ids = identitiesOf(doc);
  return ids.some(id => targetIds.has(id));
}

async function main() {
  const token = await getToken();
  const [authUsers, adminDocs] = await Promise.all([
    listAuthUsers(token),
    listCollection('admins', token)
  ]);

  const adminEmails = new Set(adminDocs.map(doc => clean(doc.data.email || doc.data.username || doc.id)).filter(Boolean));
  const adminUids = new Set(adminDocs.map(doc => clean(doc.id || doc.data.uid)).filter(Boolean));
  const targetAuthUsers = authUsers.filter(user => !adminEmails.has(clean(user.email)) && !adminUids.has(clean(user.uid)));
  const targetIds = new Set(compact(targetAuthUsers.flatMap(user => [user.uid, user.email, user.displayName])));

  const collectionsToCheck = [
    'members',
    'memberVerifications',
    'membershipCards',
    'receiptVerifications',
    'payments',
    'donations',
    'welfareRequests',
    'eventRegistrations'
  ];
  const docsToDelete = [];
  for (const collection of collectionsToCheck) {
    const docs = await listCollection(collection, token).catch(() => []);
    docs.forEach(doc => {
      if (matchesTarget({ ...doc.data, id: doc.id }, targetIds)) docsToDelete.push({ collection, ...doc });
    });
  }

  const appStoreDocs = await listCollection('appStores', token).catch(() => []);
  const appStoreUpdates = [];
  for (const doc of appStoreDocs) {
    const items = storeItems(doc.data);
    if (!items.length) continue;
    const nextItems = items.filter(item => !matchesTarget(item, targetIds));
    if (nextItems.length !== items.length) {
      const key = Array.isArray(doc.data.value) ? 'value' : Array.isArray(doc.data.items) ? 'items' : 'data';
      appStoreUpdates.push({
        name: doc.name,
        id: doc.id,
        removed: items.length - nextItems.length,
        data: { ...doc.data, [key]: nextItems, updatedAt: new Date().toISOString() }
      });
    }
  }

  console.log(`Project: ${projectId}`);
  console.log(`Mode: ${execute ? 'EXECUTE' : 'DRY RUN'}`);
  console.log(`Admin Auth users kept: ${Array.from(adminEmails).join(', ') || '(none found)'}`);
  console.log(`Non-admin Auth users targeted: ${targetAuthUsers.length}`);
  targetAuthUsers.forEach((user, index) => console.log(`  ${index + 1}. ${user.email || '(no email)'} | uid=${user.uid}`));
  console.log(`Firestore documents targeted: ${docsToDelete.length}`);
  docsToDelete.forEach((doc, index) => console.log(`  ${index + 1}. ${doc.collection}/${doc.id}`));
  console.log(`App store array updates targeted: ${appStoreUpdates.length}`);
  appStoreUpdates.forEach((doc, index) => console.log(`  ${index + 1}. appStores/${doc.id}: remove ${doc.removed}`));

  if (!execute) {
    console.log('\nNo changes made. Rerun with --execute to delete these targets.');
    return;
  }

  for (const doc of docsToDelete) {
    await deleteUrl(`https://firestore.googleapis.com/v1/${doc.name}`, token);
    console.log(`Deleted Firestore doc: ${doc.collection}/${doc.id}`);
  }
  for (const doc of appStoreUpdates) {
    await patchDocument(doc.name, doc.data, token);
    console.log(`Updated appStores/${doc.id}; removed ${doc.removed} item(s)`);
  }
  for (const user of targetAuthUsers) {
    if (!user.uid) continue;
    await deleteAuthUser(user.uid, token);
    console.log(`Deleted Auth user: ${user.email || user.uid}`);
  }
  console.log('Cleanup complete.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
