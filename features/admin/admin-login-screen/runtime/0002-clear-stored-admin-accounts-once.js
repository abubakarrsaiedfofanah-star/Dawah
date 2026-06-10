// Runtime slice from admin.js: clearStoredAdminAccountsOnce.
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
    ['currentAdminUser', 'dawaahFirebaseIdToken', 'dawaahFirebaseEmail', 'dawaahFirebaseUid'].forEach(key => sessionStorage.removeItem(key));
    localStorage.setItem(LOCAL_ADMIN_ACCOUNT_CLEAR_KEY, '1');
}

clearStoredAdminAccountsOnce();
