const { describe, it, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} = require('@firebase/rules-unit-testing');
const {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
} = require('firebase/firestore');

const projectId = 'dawaah-rules-test';
let testEnv;

describe('Firestore security rules', () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId,
      firestore: {
        rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8')
      }
    });
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('allows a student to create their own active member profile', async () => {
    const db = testEnv.authenticatedContext('student-1', {
      email: 'student@example.com'
    }).firestore();

    await assertSucceeds(setDoc(doc(db, 'members/student-1'), {
      uid: 'student-1',
      authEmail: 'student@example.com',
      email: 'student@example.com',
      studentId: 'STU001',
      role: 'student',
      status: 'Active'
    }));
  });

  it('allows an officer to create their own pending role request', async () => {
    const db = testEnv.authenticatedContext('officer-1', {
      email: 'officer@example.com'
    }).firestore();

    await assertSucceeds(setDoc(doc(db, 'members/officer-1'), {
      uid: 'officer-1',
      authEmail: 'officer@example.com',
      email: 'officer@example.com',
      studentId: 'OFF001',
      role: 'treasurer',
      status: 'Pending'
    }));
  });

  it('prevents a member from promoting themself after creation', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'members/student-2'), {
        uid: 'student-2',
        role: 'student',
        status: 'Active',
        email: 'student2@example.com'
      });
    });

    const db = testEnv.authenticatedContext('student-2', {
      email: 'student2@example.com'
    }).firestore();

    await assertFails(updateDoc(doc(db, 'members/student-2'), {
      role: 'treasurer',
      status: 'Active'
    }));
  });

  it('allows finance officers but not students to list payments', async () => {
    const treasurerDb = testEnv.authenticatedContext('treasurer-1', {
      email: 'treasurer@example.com',
      role: 'treasurer'
    }).firestore();
    const studentDb = testEnv.authenticatedContext('student-3', {
      email: 'student3@example.com'
    }).firestore();

    await assertSucceeds(getDocs(collection(treasurerDb, 'payments')));
    await assertFails(getDocs(collection(studentDb, 'payments')));
  });

  it('grants finance authority from an active approved member officer role', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'members/approved-treasurer'), {
        uid: 'approved-treasurer',
        role: 'treasurer',
        status: 'Active',
        email: 'approved-treasurer@example.com'
      });
    });

    const db = testEnv.authenticatedContext('approved-treasurer', {
      email: 'approved-treasurer@example.com'
    }).firestore();

    await assertSucceeds(getDocs(collection(db, 'payments')));
  });

  it('does not grant finance authority from a pending member officer role', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'members/pending-treasurer'), {
        uid: 'pending-treasurer',
        role: 'treasurer',
        status: 'Pending',
        email: 'pending-treasurer@example.com'
      });
    });

    const db = testEnv.authenticatedContext('pending-treasurer', {
      email: 'pending-treasurer@example.com'
    }).firestore();

    await assertFails(getDocs(collection(db, 'payments')));
  });

  it('allows member managers but not students to list member profiles', async () => {
    const secretaryDb = testEnv.authenticatedContext('secretary-1', {
      email: 'secretary@example.com',
      role: 'secretary'
    }).firestore();
    const studentDb = testEnv.authenticatedContext('student-4', {
      email: 'student4@example.com'
    }).firestore();

    await assertSucceeds(getDocs(collection(secretaryDb, 'members')));
    await assertFails(getDocs(collection(studentDb, 'members')));
  });

  it('allows public card verification but blocks unpaid card creation', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'membershipCards/UMMA-CARD-2026-VALID1'), {
        cardId: 'UMMA-CARD-2026-VALID1',
        ownerUid: 'student-card',
        fullName: 'Card Student',
        studentId: 'CARD001',
        paymentStatus: 'Paid',
        status: 'Active'
      });
    });

    const anonymousDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anonymousDb, 'membershipCards/UMMA-CARD-2026-VALID1')));
    await assertSucceeds(getDocs(collection(testEnv.authenticatedContext('secretary-card', {
      email: 'secretary-card@example.com',
      role: 'secretary'
    }).firestore(), 'membershipCards')));
    await assertSucceeds(getDocs(collection(testEnv.authenticatedContext('admin-card', {
      email: 'admin-card@example.com',
      role: 'admin'
    }).firestore(), 'membershipCards')));
    await assertSucceeds(setDoc(doc(testEnv.authenticatedContext('student-card', {
      email: 'card@example.com'
    }).firestore(), 'membershipCards/UMMA-CARD-2026-PAID1'), {
      cardId: 'UMMA-CARD-2026-PAID1',
      ownerUid: 'student-card',
      fullName: 'Card Student',
      studentId: 'CARD001',
      paymentStatus: 'Paid',
      status: 'Active'
    }));
    await assertFails(setDoc(doc(testEnv.authenticatedContext('student-card', {
      email: 'card@example.com'
    }).firestore(), 'membershipCards/UMMA-CARD-2026-UNPAID1'), {
      cardId: 'UMMA-CARD-2026-UNPAID1',
      ownerUid: 'student-card',
      fullName: 'Card Student',
      studentId: 'CARD001',
      paymentStatus: 'No payment',
      status: 'Active'
    }));
    await assertFails(getDocs(collection(anonymousDb, 'membershipCards')));
  });

  it('allows public verification lookup but blocks public collection listing', async () => {
    const secretaryDb = testEnv.authenticatedContext('secretary-public', {
      email: 'secretary-public@example.com',
      role: 'secretary'
    }).firestore();
    const treasurerDb = testEnv.authenticatedContext('treasurer-public', {
      email: 'treasurer-public@example.com',
      role: 'treasurer'
    }).firestore();

    await setDoc(doc(secretaryDb, 'memberVerifications/STU-PUBLIC'), {
      fullName: 'Public Student',
      studentId: 'STU-PUBLIC',
      role: 'student',
      status: 'Active',
      course: 'Computer Science'
    });
    await setDoc(doc(treasurerDb, 'receiptVerifications/RCPT-PUBLIC'), {
      receiptNumber: 'RCPT-PUBLIC',
      name: 'Public Student',
      amount: 10,
      status: 'Completed'
    });

    const anonymousDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anonymousDb, 'memberVerifications/STU-PUBLIC')));
    await assertSucceeds(getDoc(doc(anonymousDb, 'receiptVerifications/RCPT-PUBLIC')));
    await assertFails(getDocs(collection(anonymousDb, 'memberVerifications')));
    await assertFails(getDocs(collection(anonymousDb, 'receiptVerifications')));
  });

  it('rejects private fields in public verification records', async () => {
    const secretaryDb = testEnv.authenticatedContext('secretary-safe', {
      email: 'secretary-safe@example.com',
      role: 'secretary'
    }).firestore();
    const treasurerDb = testEnv.authenticatedContext('treasurer-safe', {
      email: 'treasurer-safe@example.com',
      role: 'treasurer'
    }).firestore();

    await assertSucceeds(setDoc(doc(secretaryDb, 'memberVerifications/STU-SAFE'), {
      fullName: 'Safe Student',
      studentId: 'STU-SAFE',
      role: 'student',
      status: 'Active',
      course: 'Computer Science'
    }));
    await assertFails(setDoc(doc(secretaryDb, 'memberVerifications/STU-LEAK'), {
      fullName: 'Leaky Student',
      studentId: 'STU-LEAK',
      role: 'student',
      status: 'Active',
      email: 'student@example.com',
      phone: '+254700000000',
      homeAddress: 'Private address'
    }));

    await assertSucceeds(setDoc(doc(treasurerDb, 'receiptVerifications/RCPT-SAFE'), {
      receiptNumber: 'RCPT-SAFE',
      name: 'Safe Student',
      amount: 10,
      method: 'Cash',
      transactionRef: 'TXN-SAFE',
      status: 'Completed'
    }));
    await assertFails(setDoc(doc(treasurerDb, 'receiptVerifications/RCPT-LEAK'), {
      receiptNumber: 'RCPT-LEAK',
      name: 'Leaky Student',
      amount: 10,
      status: 'Completed',
      email: 'student@example.com',
      phone: '+254700000000'
    }));

    const studentDb = testEnv.authenticatedContext('card-safe', {
      email: 'card-safe@example.com'
    }).firestore();
    await assertFails(setDoc(doc(studentDb, 'membershipCards/UMMA-CARD-2026-LEAK1'), {
      cardId: 'UMMA-CARD-2026-LEAK1',
      ownerUid: 'card-safe',
      ownerEmail: 'card-safe@example.com',
      fullName: 'Card Safe',
      studentId: 'CARD-SAFE',
      paymentStatus: 'Paid',
      status: 'Active'
    }));
  });

  it('allows immutable audit logs only for admins', async () => {
    const adminDb = testEnv.authenticatedContext('audit-admin', {
      email: 'audit-admin@example.com',
      admin: true
    }).firestore();
    const studentDb = testEnv.authenticatedContext('audit-student', {
      email: 'audit-student@example.com'
    }).firestore();

    const auditRef = doc(collection(adminDb, 'auditLogs'));
    await assertSucceeds(setDoc(auditRef, {
      action: 'approvePayment',
      actor: 'audit-admin@example.com',
      actorEmail: 'audit-admin@example.com',
      actorUid: 'audit-admin',
      details: { paymentId: 123 },
      source: 'rules-test',
      userAgent: 'rules-test',
      createdAt: new Date()
    }));
    await assertFails(updateDoc(auditRef, { action: 'changed' }));
    await assertFails(setDoc(doc(collection(studentDb, 'auditLogs')), {
      action: 'approvePayment',
      actor: 'audit-student@example.com',
      createdAt: new Date()
    }));
  });

  it('keeps backup metadata private to admins', async () => {
    const adminDb = testEnv.authenticatedContext('backup-admin', {
      email: 'backup-admin@example.com',
      admin: true
    }).firestore();
    const studentDb = testEnv.authenticatedContext('backup-student', {
      email: 'backup-student@example.com'
    }).firestore();

    await assertSucceeds(setDoc(doc(adminDb, 'backupMetadata/latest'), {
      filename: 'backup.json',
      downloadedAt: new Date().toISOString(),
      savedAt: new Date()
    }));
    await assertSucceeds(getDoc(doc(adminDb, 'backupMetadata/latest')));
    await assertFails(getDoc(doc(studentDb, 'backupMetadata/latest')));
  });

  it('loads the rules file from the project root', () => {
    assert.match(
      fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8'),
      /match \/members\/\{uid\}/
    );
  });
});
