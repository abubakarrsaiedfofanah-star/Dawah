// Runtime slice from daawah.js: completeLocalRegistration.
async function completeLocalRegistration(newUser, options = {}) {
    const needsApproval = (newUser.role || 'student') !== 'student';
    const shouldStoreLocalPassword = Boolean(frontendOnly && !window.SupabaseBackend?.enabled && newUser.password);
    const { passportPhotoFile, password: localPassword, ...storableUserBase } = {
        ...newUser,
        status: newUser.status || (needsApproval ? 'Pending' : 'Active'),
        accountStatus: newUser.accountStatus || (needsApproval ? 'Pending Approval' : 'Active'),
        membershipStatus: newUser.membershipStatus || (needsApproval ? 'Pending Approval' : 'Membership Pending'),
        membershipStage: newUser.membershipStage || (needsApproval ? 'approval_pending' : 'registered_student'),
        membershipPaymentStatus: newUser.membershipPaymentStatus || 'No payment',
        registrationSource: newUser.registrationSource || 'public-web',
        registrationHost: location.host,
        registrationUserAgent: navigator.userAgent,
        registeredAt: newUser.registeredAt || new Date().toISOString()
    };
    const storableUser = shouldStoreLocalPassword
        ? { ...storableUserBase, password: localPassword }
        : storableUserBase;
    const existingIndex = allMembers.findIndex(member =>
        member.studentId === storableUser.studentId ||
        member.email === storableUser.email ||
        member.username === storableUser.username
    );

    if (existingIndex >= 0) {
        allMembers[existingIndex] = { ...allMembers[existingIndex], ...storableUser };
    } else {
        allMembers.push(storableUser);
    }

    localStorage.setItem('allMembers', JSON.stringify(allMembers));
    const cloudSyncRequired = Boolean(window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession?.());
    try {
        await saveSharedMemberStore(storableUser, { requireCloud: cloudSyncRequired });
    } catch (error) {
        alert(error.message || 'Account was created, but the backend member profile could not be saved. Please contact admin before registering again.');
        return;
    }

    if (options.databaseSynced === false) {
        showNotification(options.message, 'warning');
    }
    if (!needsApproval) {
        localStorage.setItem(`studentOnboarding:${storableUser.email || storableUser.studentId || storableUser.username}`, '1');
    }
    rememberPortalAudience('student');

    alert(needsApproval
        ? 'Registration submitted. Admin must approve this role before login.'
        : 'Student account created. You can login now. Membership becomes active after dues payment.');
    document.getElementById('registrationForm').reset();
    document.querySelector('[data-bs-target="#loginTab"]').click();
}
