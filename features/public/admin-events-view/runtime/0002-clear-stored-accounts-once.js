// Runtime slice from daawah.js: clearStoredAccountsOnce.
const FULL_LOCAL_STORAGE_RESET_VERSION = '20260707-full-local-reset-v2';

function clearAllLocalAppStorageOnce() {
    if (localStorage.getItem('DawaahFullLocalStorageResetVersion') === FULL_LOCAL_STORAGE_RESET_VERSION) return;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('DawaahFullLocalStorageResetVersion', FULL_LOCAL_STORAGE_RESET_VERSION);
}

clearAllLocalAppStorageOnce();

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
    ['dawahSupabaseAccessToken', 'dawahSupabaseEmail', 'dawahSupabaseUid', 'dawahSupabaseAccessToken', 'dawahSupabaseEmail', 'dawahSupabaseUid'].forEach(key => sessionStorage.removeItem(key));
    localStorage.setItem('DawaahAccountClearVersion', ACCOUNT_CLEAR_VERSION);
}
