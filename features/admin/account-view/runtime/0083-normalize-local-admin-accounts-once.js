// Runtime slice from admin.js: normalizeLocalAdminAccountsOnce.
function normalizeLocalAdminAccountsOnce() {
    if (window.SupabaseBackend?.enabled) return;
    if (useStaticAdminApi && !localStorage.getItem(LOCAL_ADMIN_FULL_RESET_KEY)) {
        localStorage.removeItem(LOCAL_ADMIN_ACCOUNTS_KEY);
        localStorage.removeItem('adminActivityLogs');
        sessionStorage.removeItem('currentAdminUser');
        localStorage.setItem(LOCAL_ADMIN_FULL_RESET_KEY, '1');
        return;
    }
    if (!useStaticAdminApi || localStorage.getItem(LOCAL_ADMIN_CLEANUP_KEY)) return;
    const accounts = getLocalAdminAccounts();
    if (!accounts.length) {
        localStorage.setItem(LOCAL_ADMIN_CLEANUP_KEY, '1');
        return;
    }
    saveLocalAdminAccounts([accounts[0]]);
    sessionStorage.removeItem('currentAdminUser');
    localStorage.setItem(LOCAL_ADMIN_CLEANUP_KEY, '1');
}
