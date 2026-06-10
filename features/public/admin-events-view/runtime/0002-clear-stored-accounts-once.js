// Runtime slice from daawah.js: clearStoredAccountsOnce.
function clearStoredAccountsOnce() {
    if (localStorage.getItem('DawaahAccountClearVersion') === ACCOUNT_CLEAR_VERSION) return;
    const savedUser = getStoredCurrentUser();
    const savedRole = localStorage.getItem('currentRole');
    const shouldKeepServerSession = savedUser && (savedUser.csrf_token || savedUser.dbUserId || savedUser.dbStudentId);
    [
        'currentUser',
        'currentRole',
        'allMembers',
        'profileData',
        'registeredEvents',
        'welfareRequests',
        'donations',
        'payments',
        'leadershipRoles',
        'volunteerRecords'
    ].forEach(key => localStorage.removeItem(key));
    ['dawaahFirebaseIdToken', 'dawaahFirebaseEmail', 'dawaahFirebaseUid'].forEach(key => sessionStorage.removeItem(key));
    if (shouldKeepServerSession) {
        localStorage.setItem('currentUser', JSON.stringify(savedUser));
        if (savedRole || savedUser.role) localStorage.setItem('currentRole', savedRole || savedUser.role);
    }
    localStorage.setItem('DawaahAccountClearVersion', ACCOUNT_CLEAR_VERSION);
}
