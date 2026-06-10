const auth = require('firebase-tools/lib/auth');
const apiv2 = require('firebase-tools/lib/apiv2');

const projectId = process.env.FIREBASE_PROJECT_ID || 'umma-university-da-awah-team';
const database = '(default)';

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

function objectOf(fields) {
  return Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, valueOf(value)]));
}

function docId(name) {
  return String(name || '').split('/').pop();
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
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    const json = await fetchJson(url.toString(), token);
    docs.push(...(json.documents || []).map(doc => ({ id: docId(doc.name), ...objectOf(doc.fields || {}) })));
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  return docs;
}

async function getDoc(path, token) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${database}/documents/${path}`;
  try {
    const json = await fetchJson(url, token);
    return { id: docId(json.name), ...objectOf(json.fields || {}) };
  } catch (error) {
    if (/not found/i.test(error.message)) return null;
    throw error;
  }
}

async function listAuthUsers(token) {
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:query`;
  try {
    const json = await fetchJson(url, token, {
      method: 'POST',
      body: JSON.stringify({ returnUserInfo: true, limit: 1000 })
    });
    return (json.userInfo || json.users || []).map(user => ({
      uid: user.localId || user.uid || '',
      email: user.email || '',
      displayName: user.displayName || '',
      disabled: Boolean(user.disabled)
    }));
  } catch (error) {
    return { error: error.message };
  }
}

function storeItems(doc) {
  if (!doc) return [];
  if (Array.isArray(doc.value)) return doc.value;
  if (Array.isArray(doc.items)) return doc.items;
  if (Array.isArray(doc.data)) return doc.data;
  return [];
}

function emailOf(item) {
  return String(item?.email || item?.adminEmail || item?.studentEmail || item?.officerEmail || '').trim();
}

function roleOf(item) {
  return String(item?.role || item?.position || item?.adminRole || '').trim().toLowerCase();
}

function uniq(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = item.uid || item.id || emailOf(item) || JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function printGroup(title, items, formatter) {
  console.log(`\n${title}: ${items.length}`);
  if (!items.length) return;
  items.slice(0, 30).forEach((item, index) => console.log(`  ${index + 1}. ${formatter(item)}`));
  if (items.length > 30) console.log(`  ...and ${items.length - 30} more`);
}

async function main() {
  const token = await getToken();
  const [authUsers, admins, members, allMembersDoc, officerAccountsDoc] = await Promise.all([
    listAuthUsers(token),
    listCollection('admins', token),
    listCollection('members', token),
    getDoc('appStores/allMembers', token),
    getDoc('appStores/officerAccounts', token)
  ]);

  const allMembers = storeItems(allMembersDoc);
  const officerAccounts = storeItems(officerAccountsDoc);
  const uniqueMembers = uniq([...members, ...allMembers]);
  const students = uniqueMembers.filter(member => {
    const role = roleOf(member);
    return !role || role === 'student' || role.includes('student');
  });
  const officers = uniq([
    ...uniqueMembers.filter(member => {
      const role = roleOf(member);
      return role && role !== 'student' && !role.includes('student');
    }),
    ...officerAccounts
  ]);

  console.log(`Project: ${projectId}`);
  console.log(`Checked at: ${new Date().toISOString()}`);

  if (Array.isArray(authUsers)) {
    printGroup('Firebase Auth users', authUsers, user => `${user.email || '(no email)'} | uid=${user.uid || '(no uid)'} | disabled=${user.disabled}`);
  } else {
    console.log(`\nFirebase Auth users: could not check (${authUsers.error})`);
  }

  printGroup('Admin Firestore docs', admins, adminDoc => `${emailOf(adminDoc) || adminDoc.email || adminDoc.username || adminDoc.id} | main=${Boolean(adminDoc.isMainAdmin)}`);
  printGroup('Student/member records', students, member => `${member.fullName || member.name || '(no name)'} | ${emailOf(member) || '(no email)'} | id=${member.studentId || member.memberId || member.id || '(no id)'}`);
  printGroup('Officer records', officers, officer => `${officer.fullName || officer.name || officer.username || '(no name)'} | ${emailOf(officer) || '(no email)'} | role=${roleOf(officer) || '(no role)'}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
