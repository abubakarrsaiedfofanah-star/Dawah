// Runtime slice from admin.js: clearStoredAdminAccountsOnce.
const FULL_LOCAL_STORAGE_RESET_VERSION = '20260705-full-local-reset-v1';

function clearAllLocalAppStorageOnce() {
    if (localStorage.getItem('DawaahFullLocalStorageResetVersion') === FULL_LOCAL_STORAGE_RESET_VERSION) return;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('DawaahFullLocalStorageResetVersion', FULL_LOCAL_STORAGE_RESET_VERSION);
}

clearAllLocalAppStorageOnce();

function clearStoredAdminAccountsOnce() {
    if (localStorage.getItem(LOCAL_ADMIN_ACCOUNT_CLEAR_KEY) === '1') return;
    [
        LOCAL_ADMIN_ACCOUNTS_KEY,
        LOCAL_ADMIN_CLEANUP_KEY,
        LOCAL_ADMIN_FULL_RESET_KEY,
        ADMIN_LOGIN_FAILURE_KEY,
        'currentAdmin',
        'adminUser',
        'DawaahAdminSession'
    ].forEach(key => localStorage.removeItem(key));
    ['currentAdminUser', 'dawahSupabaseAccessToken', 'dawahSupabaseEmail', 'dawahSupabaseUid', 'dawahSupabaseAccessToken', 'dawahSupabaseEmail', 'dawahSupabaseUid'].forEach(key => sessionStorage.removeItem(key));
    localStorage.setItem(LOCAL_ADMIN_ACCOUNT_CLEAR_KEY, '1');
}

clearStoredAdminAccountsOnce();
