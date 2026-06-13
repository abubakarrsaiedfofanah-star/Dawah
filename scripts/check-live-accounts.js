const { admin, initializeAdminApp } = require('./Supabase-admin-app');

initializeAdminApp();

const db = admin.Supabase();

function valueFromStoreDoc(doc) {
  const data = doc.data() || {};
  if (Array.isArray(data.value)) return data.value;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function emailOf(item) {
  return String(item?.email || item?.adminEmail || item?.studentEmail || item?.officerEmail || '').trim();
}

function roleOf(item) {
  return String(item?.role || item?.position || item?.adminRole || '').trim().toLowerCase();
}

async function listAuthUsers() {
  const users = [];
  let pageToken;
  do {
    const page = await admin.auth().listUsers(1000, pageToken);
    users.push(...page.users.map(user => ({
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      disabled: user.disabled,
      customClaims: user.customClaims || {},
      created: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime
    })));
    pageToken = page.pageToken;
  } while (pageToken);
  return users;
}

async function listCollection(name) {
  const snap = await db.collection(name).get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function listAppStore(name) {
  const doc = await db.collection('appStores').doc(name).get();
  if (!doc.exists) return [];
  return valueFromStoreDoc(doc).map((item, index) => ({ id: item.id || `${name}-${index + 1}`, ...item }));
}

function printGroup(title, items, formatter) {
  console.log(`\n${title}: ${items.length}`);
  if (!items.length) return;
  items.slice(0, 30).forEach((item, index) => {
    console.log(`  ${index + 1}. ${formatter(item)}`);
  });
  if (items.length > 30) console.log(`  ...and ${items.length - 30} more`);
}

async function main() {
  const [authUsers, admins, members, allMembers, officerAccounts] = await Promise.all([
    listAuthUsers(),
    listCollection('admins'),
    listCollection('members'),
    listAppStore('allMembers'),
    listAppStore('officerAccounts')
  ]);

  const mergedMembers = [...members, ...allMembers];
  const seen = new Set();
  const uniqueMembers = mergedMembers.filter(member => {
    const key = member.uid || member.id || emailOf(member) || JSON.stringify(member);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const students = uniqueMembers.filter(member => {
    const role = roleOf(member);
    return !role || role === 'student' || role.includes('student');
  });
  const officers = [
    ...uniqueMembers.filter(member => {
      const role = roleOf(member);
      return role && role !== 'student' && !role.includes('student');
    }),
    ...officerAccounts
  ];

  console.log(`Project: ${process.env.Supabase_PROJECT_ID || 'umma-university-da-awah-team'}`);
  console.log(`Checked at: ${new Date().toISOString()}`);
  printGroup('Supabase Auth users', authUsers, user => `${user.email || '(no email)'} | uid=${user.uid} | disabled=${user.disabled}`);
  printGroup('Admin Supabase docs', admins, adminDoc => `${emailOf(adminDoc) || adminDoc.email || adminDoc.username || adminDoc.id} | main=${Boolean(adminDoc.isMainAdmin)}`);
  printGroup('Student/member records', students, member => `${member.fullName || member.name || '(no name)'} | ${emailOf(member) || '(no email)'} | id=${member.studentId || member.memberId || member.id || '(no id)'}`);
  printGroup('Officer records', officers, officer => `${officer.fullName || officer.name || officer.username || '(no name)'} | ${emailOf(officer) || '(no email)'} | role=${roleOf(officer) || '(no role)'}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
