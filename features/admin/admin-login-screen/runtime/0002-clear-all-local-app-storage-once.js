// Runtime slice from admin.js: clearAllLocalAppStorageOnce.
function clearAllLocalAppStorageOnce() {
    if (localStorage.getItem('DawaahFullLocalStorageResetVersion') === FULL_LOCAL_STORAGE_RESET_VERSION) return;
    [
        LOCAL_ADMIN_ACCOUNTS_KEY,
        LOCAL_ADMIN_CLEANUP_KEY,
        LOCAL_ADMIN_FULL_RESET_KEY,
        ADMIN_LOGIN_FAILURE_KEY,
        'currentAdmin',
        'adminUser',
        'DawaahAdminSession',
        'currentAdminUser'
    ].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    localStorage.setItem('DawaahFullLocalStorageResetVersion', FULL_LOCAL_STORAGE_RESET_VERSION);
}

clearAllLocalAppStorageOnce();
