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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(json?.error?.message || text || `Request failed with ${response.status}`);
  return json;
}

async function signUpOfficer(email, password, token) {
  return fetchJson(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
}

async function saveMember(uid, token, member) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${database}/documents/members?documentId=${encodeURIComponent(uid)}`;
  return fetchJson(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ fields: encodeValue(member).mapValue.fields })
  });
}

async function main() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 12);
  const email = `test.officer.${stamp}@example.com`;
  const password = `OfficerTest#${stamp}`;
  const token = await getToken();
  const authUser = await signUpOfficer(email, password, token);
  const uid = authUser.localId;
  const member = {
    uid,
    username: `OFFICER/TEST/${stamp}`,
    fullName: 'Test Officer Pending',
    studentId: `OFFICER/TEST/${stamp}`,
    email,
    authEmail: email,
    phone: '0700000000',
    role: 'treasurer',
    status: 'Pending',
    school: 'School of Business & Technology',
    course: 'Bachelor of Science in Computer Science',
    yearOfStudy: '2',
    semester: '4',
    gender: 'male',
    registrationSource: 'codex-live-test',
    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await saveMember(uid, token, member);
  console.log(`Created pending officer request: ${member.fullName}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${member.role}`);
  console.log(`Student ID: ${member.studentId}`);
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
