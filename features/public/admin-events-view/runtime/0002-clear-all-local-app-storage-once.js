// Runtime slice from daawah.js: clearAllLocalAppStorageOnce.
function clearAllLocalAppStorageOnce() {
    if (localStorage.getItem('DawaahFullLocalStorageResetVersion') === FULL_LOCAL_STORAGE_RESET_VERSION) return;
    [
        'currentUser',
        'currentRole',
        'profileData',
        'registeredEvents',
        'DawaahLocalAccounts',
        'DawaahAccountClearVersion'
    ].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
    localStorage.setItem('DawaahFullLocalStorageResetVersion', FULL_LOCAL_STORAGE_RESET_VERSION);
}

clearAllLocalAppStorageOnce();
