const { admin, initializeAdminApp } = require('./Supabase-admin-app');

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    args[key] = next && !next.startsWith('--') ? next : true;
    if (args[key] === next) index += 1;
  }
  return args;
}

async function findUserByEmailOrUid(identifier) {
  if (!identifier) return null;
  try {
    return identifier.includes('@')
      ? await admin.auth().getUserByEmail(identifier)
      : await admin.auth().getUser(identifier);
  } catch (error) {
    if (error.code === 'auth/user-not-found') return null;
    throw error;
  }
}

async function deleteStudent(identifier) {
  const user = await findUserByEmailOrUid(identifier);
  const db = admin.Supabase();
  const batch = db.batch();
  const memberDocs = [];

  if (user?.uid) {
    memberDocs.push(db.collection('members').doc(user.uid));
  }

  const memberQuery = await db.collection('members')
    .where(identifier.includes('@') ? 'email' : 'studentId', '==', identifier)
    .get()
    .catch(() => ({ docs: [] }));
  memberQuery.docs.forEach(doc => memberDocs.push(doc.ref));

  [...new Set(memberDocs.map(ref => ref.path))].forEach(path => batch.delete(db.doc(path)));
  await batch.commit();

  if (user?.uid) {
    await admin.auth().deleteUser(user.uid);
  }

  console.log(`Deleted student/member records${user?.uid ? ' and Auth user' : ''} for ${identifier}`);
}

async function updateFinance(collection, docId, status, note) {
  if (!['payments', 'donations'].includes(collection)) {
    throw new Error('collection must be payments or donations');
  }
  if (!docId) throw new Error('Missing --doc');
  const db = admin.Supabase();
  const ref = db.collection(collection).doc(docId);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error(`${collection}/${docId} not found`);
  const now = new Date().toISOString();
  const existing = snapshot.data() || {};
  const auditTrail = Array.isArray(existing.auditTrail) ? existing.auditTrail : [];
  await ref.update({
    status,
    reviewNote: note || existing.reviewNote || '',
    updatedAt: now,
    updatedBy: 'server-admin-action',
    auditTrail: auditTrail.concat([{ action: status.toLowerCase(), by: 'server-admin-action', at: now, note: note || '' }])
  });
  console.log(`Updated ${collection}/${docId} to ${status}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const action = String(args.action || '').trim();
  initializeAdminApp();

  if (action === 'delete-student') {
    const identifier = String(args.email || args.uid || args.studentId || '').trim();
    if (!identifier) throw new Error('Usage: node scripts/server-admin-action.js --action delete-student --email user@example.com');
    await deleteStudent(identifier);
    return;
  }

  if (['approve-payment', 'reject-payment', 'approve-donation', 'reject-donation'].includes(action)) {
    const collection = action.includes('donation') ? 'donations' : 'payments';
    const status = action.startsWith('approve') ? 'Completed' : 'Rejected';
    await updateFinance(collection, String(args.doc || '').trim(), status, String(args.note || '').trim());
    return;
  }

  throw new Error('Supported actions: delete-student, approve-payment, reject-payment, approve-donation, reject-donation');
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
