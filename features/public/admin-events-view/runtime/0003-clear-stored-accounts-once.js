// Runtime slice from daawah.js: clearStoredAccountsOnce.
function clearStoredAccountsOnce() {
    if (localStorage.getItem('DawaahAccountClearVersion') === ACCOUNT_CLEAR_VERSION) return;
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
    localStorage.setItem('DawaahAccountClearVersion', ACCOUNT_CLEAR_VERSION);
}
